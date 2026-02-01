// Hook for Line Downtime management
import { useState, useEffect, useCallback } from 'react';
import { query, execute, generateId } from '@/db/database';
import type { LineDowntime } from '@/types';

export function useLineDowntime(lineId?: string, startDate?: string, endDate?: string) {
  const [downtimeRecords, setDowntimeRecords] = useState<LineDowntime[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDowntime = useCallback(() => {
    try {
      let sql = `
        SELECT ld.*, l.name as line_name, l.code as line_code,
               div.name as division_name, loc.name as location_name
        FROM line_downtime ld
        LEFT JOIN lines l ON ld.line_id = l.id
        LEFT JOIN divisions div ON l.division_id = div.id
        LEFT JOIN locations loc ON div.location_id = loc.id
        WHERE ld.status != 'cancelled'
      `;
      const params: any[] = [];
      
      if (lineId) {
        sql += ' AND ld.line_id = ?';
        params.push(lineId);
      }
      if (startDate) {
        sql += ' AND ld.start_date_time >= ?';
        params.push(startDate);
      }
      if (endDate) {
        sql += ' AND ld.end_date_time <= ?';
        params.push(endDate);
      }
      
      sql += ' ORDER BY ld.start_date_time DESC';
      
      const results = query(sql, params);
      setDowntimeRecords(results.map(row => ({
        id: row.id,
        lineId: row.line_id,
        reason: row.reason,
        category: row.category,
        startDateTime: row.start_date_time,
        endDateTime: row.end_date_time,
        duration: row.duration,
        durationUnit: row.duration_unit,
        recurrence: row.recurrence,
        recurrenceEndDate: row.recurrence_end_date,
        impactType: row.impact_type,
        capacityReductionPercent: row.capacity_reduction_percent,
        notes: row.notes,
        createdBy: row.created_by,
        approvedBy: row.approved_by,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      })));
    } catch (error) {
      console.error('Error fetching downtime:', error);
    } finally {
      setIsLoading(false);
    }
  }, [lineId, startDate, endDate]);

  useEffect(() => {
    fetchDowntime();
  }, [fetchDowntime]);

  const createDowntime = useCallback((data: Omit<LineDowntime, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = generateId();
    execute(
      `INSERT INTO line_downtime (id, line_id, reason, category, start_date_time, end_date_time,
        duration, duration_unit, recurrence, recurrence_end_date, impact_type, capacity_reduction_percent,
        notes, created_by, approved_by, status, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [id, data.lineId, data.reason, data.category, data.startDateTime, data.endDateTime,
       data.duration, data.durationUnit, data.recurrence, data.recurrenceEndDate,
       data.impactType, data.capacityReductionPercent, data.notes, data.createdBy,
       data.approvedBy, data.status]
    );
    fetchDowntime();
    return id;
  }, [fetchDowntime]);

  const updateDowntime = useCallback((id: string, data: Partial<LineDowntime>) => {
    const fields: string[] = [];
    const values: any[] = [];
    
    if (data.lineId !== undefined) { fields.push('line_id = ?'); values.push(data.lineId); }
    if (data.reason !== undefined) { fields.push('reason = ?'); values.push(data.reason); }
    if (data.category !== undefined) { fields.push('category = ?'); values.push(data.category); }
    if (data.startDateTime !== undefined) { fields.push('start_date_time = ?'); values.push(data.startDateTime); }
    if (data.endDateTime !== undefined) { fields.push('end_date_time = ?'); values.push(data.endDateTime); }
    if (data.duration !== undefined) { fields.push('duration = ?'); values.push(data.duration); }
    if (data.durationUnit !== undefined) { fields.push('duration_unit = ?'); values.push(data.durationUnit); }
    if (data.recurrence !== undefined) { fields.push('recurrence = ?'); values.push(data.recurrence); }
    if (data.recurrenceEndDate !== undefined) { fields.push('recurrence_end_date = ?'); values.push(data.recurrenceEndDate); }
    if (data.impactType !== undefined) { fields.push('impact_type = ?'); values.push(data.impactType); }
    if (data.capacityReductionPercent !== undefined) { fields.push('capacity_reduction_percent = ?'); values.push(data.capacityReductionPercent); }
    if (data.notes !== undefined) { fields.push('notes = ?'); values.push(data.notes); }
    if (data.approvedBy !== undefined) { fields.push('approved_by = ?'); values.push(data.approvedBy); }
    if (data.status !== undefined) { fields.push('status = ?'); values.push(data.status); }
    
    if (fields.length > 0) {
      execute(
        `UPDATE line_downtime SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [...values, id]
      );
      fetchDowntime();
    }
  }, [fetchDowntime]);

  const approveDowntime = useCallback((id: string, approvedBy: string) => {
    execute(
      `UPDATE line_downtime SET status = 'approved', approved_by = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [approvedBy, id]
    );
    fetchDowntime();
  }, [fetchDowntime]);

  const cancelDowntime = useCallback((id: string) => {
    execute(
      `UPDATE line_downtime SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [id]
    );
    fetchDowntime();
  }, [fetchDowntime]);

  const getDowntimeImpact = useCallback((lineId: string, startDate: string, endDate: string) => {
    const result = query(`
      SELECT 
        SUM(CASE 
          WHEN impact_type = 'full' THEN duration 
          WHEN impact_type = 'partial' THEN duration * (capacity_reduction_percent / 100)
          ELSE 0 
        END) as total_impact_hours
      FROM line_downtime
      WHERE line_id = ? 
        AND status = 'approved'
        AND start_date_time >= ? 
        AND end_date_time <= ?
    `, [lineId, startDate, endDate]);
    
    return result[0]?.total_impact_hours || 0;
  }, []);

  return { 
    downtimeRecords, 
    isLoading, 
    createDowntime, 
    updateDowntime, 
    approveDowntime,
    cancelDowntime,
    getDowntimeImpact,
    refresh: fetchDowntime 
  };
}
