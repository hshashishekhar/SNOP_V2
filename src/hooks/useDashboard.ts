// Hook for Dashboard KPIs and analytics
import { useState, useEffect, useCallback } from 'react';
import { query } from '@/db/database';
import type { DashboardKPI, BottleneckAlert } from '@/types';

export function useDashboard() {
  const [kpis, setKpis] = useState<DashboardKPI[]>([]);
  const [alerts, setAlerts] = useState<BottleneckAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = useCallback(() => {
    try {
      // Calculate various KPIs
      const today = new Date().toISOString().split('T')[0];
      const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Total demand
      const demandStats = query(`
        SELECT 
          COUNT(*) as total_count,
          SUM(quantity) as total_quantity,
          SUM(CASE WHEN status = 'approved' THEN quantity ELSE 0 END) as approved_quantity,
          SUM(CASE WHEN status = 'in_production' THEN quantity ELSE 0 END) as in_prod_quantity
        FROM demand
        WHERE requested_delivery_date BETWEEN ? AND ?
      `, [today, thirtyDaysFromNow])[0];

      // Inventory value
      const inventoryValue = query(`
        SELECT SUM(quantity * COALESCE(valuation_rate, 0)) as total_value
        FROM inventory
      `)[0]?.total_value || 0;

      // Die utilization
      const dieStats = query(`
        SELECT 
          COUNT(*) as total_dies,
          SUM(CASE WHEN remaining_life < total_life * 0.1 THEN 1 ELSE 0 END) as critical_dies,
          AVG(CAST(remaining_life AS FLOAT) / CAST(total_life AS FLOAT) * 100) as avg_life_percent
        FROM dies
        WHERE is_active = 1
      `)[0];

      // Line utilization (based on scheduled hours)
      const lineStats = query(`
        SELECT 
          l.id,
          l.name,
          l.gross_hours_per_week,
          COUNT(ps.id) as schedule_count,
          SUM(
            (julianday(ps.planned_end_date_time) - julianday(ps.planned_start_date_time)) * 24
          ) as scheduled_hours
        FROM lines l
        LEFT JOIN production_schedule ps ON l.id = ps.line_id 
          AND ps.planned_start_date_time >= date('now')
          AND ps.planned_start_date_time < date('now', '+7 days')
        WHERE l.is_active = 1
        GROUP BY l.id
      `);

      const totalScheduledHours = lineStats.reduce((sum: number, line: any) => sum + (line.scheduled_hours || 0), 0);
      const totalAvailableHours = lineStats.reduce((sum: number, line: any) => sum + (line.gross_hours_per_week || 0), 0);
      const avgUtilization = totalAvailableHours > 0 ? (totalScheduledHours / totalAvailableHours) * 100 : 0;

      // OTIF calculation (On Time In Full)
      const otifStats = query(`
        SELECT 
          COUNT(*) as total_deliveries,
          SUM(CASE WHEN status = 'completed' AND planned_end_date <= requested_delivery_date THEN 1 ELSE 0 END) as on_time_deliveries
        FROM demand
        WHERE status IN ('completed', 'in_production')
      `)[0];

      const otifPercent = otifStats?.total_deliveries > 0 
        ? (otifStats.on_time_deliveries / otifStats.total_deliveries) * 100 
        : 0;

      const dashboardKPIs: DashboardKPI[] = [
        {
          metric: 'Total Demand (30 days)',
          value: demandStats?.total_quantity || 0,
          unit: 'pcs',
          trend: 'up',
          changePercent: 12.5,
          period: '30d'
        },
        {
          metric: 'Inventory Value',
          value: inventoryValue,
          target: 50000000,
          unit: 'INR',
          trend: 'down',
          changePercent: -3.2,
          period: 'current'
        },
        {
          metric: 'Die Utilization',
          value: avgUtilization,
          target: 85,
          unit: '%',
          trend: avgUtilization > 85 ? 'up' : 'flat',
          changePercent: 2.1,
          period: 'current'
        },
        {
          metric: 'OTIF Performance',
          value: otifPercent,
          target: 95,
          unit: '%',
          trend: otifPercent > 90 ? 'up' : 'down',
          changePercent: 1.5,
          period: '30d'
        },
        {
          metric: 'Critical Dies',
          value: dieStats?.critical_dies || 0,
          target: 0,
          unit: 'dies',
          trend: (dieStats?.critical_dies || 0) > 5 ? 'up' : 'down',
          period: 'current'
        },
        {
          metric: 'Pending Approvals',
          value: query("SELECT COUNT(*) as count FROM demand WHERE status = 'draft'")[0]?.count || 0,
          unit: 'orders',
          trend: 'flat',
          period: 'current'
        }
      ];

      setKpis(dashboardKPIs);

      // Generate bottleneck alerts
      const alertsList: BottleneckAlert[] = [];

      // Check for dies with low remaining life
      const criticalDies = query(`
        SELECT d.*, l.name as line_name
        FROM dies d
        LEFT JOIN lines l ON d.line_id = l.id
        WHERE d.remaining_life < d.total_life * 0.1
        AND d.is_active = 1
        LIMIT 5
      `);

      criticalDies.forEach((die: any, index: number) => {
        alertsList.push({
          id: `alert_die_${index}`,
          type: 'die',
          entityId: die.id,
          entityName: `${die.code} - ${die.name}`,
          severity: 'critical',
          description: `Die has only ${die.remaining_life} shots remaining (${Math.round((die.remaining_life / die.total_life) * 100)}% life)`,
          impact: 'Production risk if die fails during scheduled run',
          suggestedAction: 'Schedule refurbishment or arrange backup die',
          detectedAt: new Date().toISOString(),
          isResolved: false
        });
      });

      // Check for lines with high downtime
      const linesWithDowntime = query(`
        SELECT 
          l.id,
          l.name,
          SUM(ld.duration) as total_downtime
        FROM lines l
        LEFT JOIN line_downtime ld ON l.id = ld.line_id
          AND ld.start_date_time >= date('now')
          AND ld.start_date_time < date('now', '+7 days')
          AND ld.status = 'approved'
        WHERE l.is_active = 1
        GROUP BY l.id
        HAVING total_downtime > 24
      `);

      linesWithDowntime.forEach((line: any, index: number) => {
        alertsList.push({
          id: `alert_line_${index}`,
          type: 'line',
          entityId: line.id,
          entityName: line.name,
          severity: 'high',
          description: `Line has ${line.total_downtime} hours of planned downtime this week`,
          impact: 'Reduced capacity may affect schedule adherence',
          suggestedAction: 'Review downtime schedule and adjust load balancing',
          detectedAt: new Date().toISOString(),
          isResolved: false
        });
      });

      // Check for material shortages
      const materialShortages = query(`
        SELECT 
          d.raw_material_code,
          SUM(d.raw_material_moq) as required_qty,
          COALESCE(SUM(i.quantity), 0) as available_qty
        FROM dies d
        LEFT JOIN inventory i ON d.raw_material_code = i.raw_material_code
          AND i.stage = 'raw_material'
          AND i.status = 'available'
        WHERE d.is_active = 1
        GROUP BY d.raw_material_code
        HAVING available_qty < required_qty * 0.5
        LIMIT 5
      `);

      materialShortages.forEach((mat: any, index: number) => {
        alertsList.push({
          id: `alert_mat_${index}`,
          type: 'material',
          entityId: mat.raw_material_code,
          entityName: mat.raw_material_code,
          severity: 'medium',
          description: `Raw material stock below 50% of MOQ requirement`,
          impact: 'May delay production if not replenished',
          suggestedAction: 'Initiate procurement for raw material',
          detectedAt: new Date().toISOString(),
          isResolved: false
        });
      });

      setAlerts(alertsList);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return { kpis, alerts, isLoading, refresh: fetchDashboardData };
}

export function useCapacityReport(_lineId?: string, _startDate?: string, _endDate?: string) {
  const getCapacityReport = useCallback((lineId?: string, startDate?: string, endDate?: string) => {
    try {
      const start = startDate || new Date().toISOString().split('T')[0];
      const end = endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      let sql = `
        SELECT 
          l.id as line_id,
          l.name as line_name,
          l.code as line_code,
          l.gross_hours_per_week,
          l.absenteeism_factor,
          l.unplanned_downtime_buffer,
          div.name as division_name,
          loc.name as location_name,
          COALESCE(SUM(
            CASE 
              WHEN ld.impact_type = 'full' THEN ld.duration
              WHEN ld.impact_type = 'partial' THEN ld.duration * (ld.capacity_reduction_percent / 100)
              ELSE 0
            END
          ), 0) as planned_downtime_hours,
          COALESCE(SUM(
            (julianday(ps.planned_end_date_time) - julianday(ps.planned_start_date_time)) * 24
          ), 0) as scheduled_hours
        FROM lines l
        LEFT JOIN divisions div ON l.division_id = div.id
        LEFT JOIN locations loc ON div.location_id = loc.id
        LEFT JOIN line_downtime ld ON l.id = ld.line_id
          AND ld.start_date_time >= ?
          AND ld.end_date_time <= ?
          AND ld.status = 'approved'
        LEFT JOIN production_schedule ps ON l.id = ps.line_id
          AND ps.planned_start_date_time >= ?
          AND ps.planned_end_date_time <= ?
          AND ps.status != 'cancelled'
        WHERE l.is_active = 1
      `;
      const params: any[] = [start, end, start, end];

      if (lineId) {
        sql += ' AND l.id = ?';
        params.push(lineId);
      }

      sql += ' GROUP BY l.id ORDER BY loc.name, div.name, l.name';

      const results = query(sql, params);

      return results.map((row: any) => {
        const grossHours = row.gross_hours_per_week * 4; // Approximate for the period
        const absenteeismHours = grossHours * row.absenteeism_factor;
        const unplannedBufferHours = grossHours * row.unplanned_downtime_buffer;
        const effectiveHours = grossHours - row.planned_downtime_hours - absenteeismHours - unplannedBufferHours;
        const utilizationPercent = effectiveHours > 0 ? (row.scheduled_hours / effectiveHours) * 100 : 0;

        return {
          lineId: row.line_id,
          lineName: row.line_name,
          lineCode: row.line_code,
          divisionName: row.division_name,
          locationName: row.location_name,
          grossHours,
          plannedDowntimeHours: row.planned_downtime_hours,
          absenteeismHours,
          unplannedBufferHours,
          effectiveHours,
          scheduledHours: row.scheduled_hours,
          utilizationPercent: Math.round(utilizationPercent * 100) / 100,
          remainingHours: effectiveHours - row.scheduled_hours
        };
      });
    } catch (error) {
      console.error('Error generating capacity report:', error);
      return [];
    }
  }, [_lineId, _startDate, _endDate]);

  return { getCapacityReport };
}
