// Hook for Demand management
import { useState, useEffect, useCallback } from 'react';
import { query, execute, generateId, transaction } from '@/db/database';
import type { Demand } from '@/types';

export function useDemand(divisionId?: string, status?: string) {
  const [demands, setDemands] = useState<Demand[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDemands = useCallback(() => {
    try {
      let sql = `
        SELECT d.*, p.description as part_description, p.p_code, p.pieces_per_shot,
               div.name as division_name, l.name as line_name, die.code as die_code
        FROM demand d
        LEFT JOIN parts p ON d.part_id = p.id
        LEFT JOIN divisions div ON d.division_id = div.id
        LEFT JOIN lines l ON d.assigned_line_id = l.id
        LEFT JOIN dies die ON d.assigned_die_id = die.id
        WHERE 1=1
      `;
      const params: any[] = [];
      
      if (divisionId) {
        sql += ' AND d.division_id = ?';
        params.push(divisionId);
      }
      if (status) {
        sql += ' AND d.status = ?';
        params.push(status);
      }
      
      sql += ' ORDER BY d.requested_delivery_date ASC, d.priority ASC';
      
      const results = query(sql, params);
      setDemands(results.map(row => ({
        id: row.id,
        sapOrderNumber: row.sap_order_number,
        scheduleLineNumber: row.schedule_line_number,
        materialCode: row.material_code,
        partId: row.part_id,
        customer: row.customer,
        divisionId: row.division_id,
        quantity: row.quantity,
        requestedDeliveryDate: row.requested_delivery_date,
        demandType: row.demand_type,
        priority: row.priority,
        indentType: row.indent_type,
        isSafetyStock: Boolean(row.is_safety_stock),
        isNPD: Boolean(row.is_npd),
        netQuantity: row.net_quantity,
        availableInventory: row.available_inventory,
        wipQuantity: row.wip_quantity,
        inTransitQuantity: row.in_transit_quantity,
        status: row.status,
        feasibilityStatus: row.feasibility_status,
        feasibilityReason: row.feasibility_reason,
        assignedLineId: row.assigned_line_id,
        assignedDieId: row.assigned_die_id,
        plannedStartDate: row.planned_start_date,
        plannedEndDate: row.planned_end_date,
        uploadedBy: row.uploaded_by,
        uploadedAt: row.uploaded_at,
        approvedBy: row.approved_by,
        approvedAt: row.approved_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      })));
    } catch (error) {
      console.error('Error fetching demands:', error);
    } finally {
      setIsLoading(false);
    }
  }, [divisionId, status]);

  useEffect(() => {
    fetchDemands();
  }, [fetchDemands]);

  const createDemand = useCallback((data: Omit<Demand, 'id' | 'createdAt' | 'updatedAt' | 'uploadedAt'>) => {
    const id = generateId();
    execute(
      `INSERT INTO demand (id, sap_order_number, schedule_line_number, material_code, part_id, customer,
        division_id, quantity, requested_delivery_date, demand_type, priority, indent_type,
        is_safety_stock, is_npd, net_quantity, available_inventory, wip_quantity, in_transit_quantity,
        status, feasibility_status, feasibility_reason, assigned_line_id, assigned_die_id,
        planned_start_date, planned_end_date, uploaded_by, uploaded_at, approved_by, approved_at,
        created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [id, data.sapOrderNumber, data.scheduleLineNumber, data.materialCode, data.partId, data.customer,
       data.divisionId, data.quantity, data.requestedDeliveryDate, data.demandType, data.priority,
       data.indentType, data.isSafetyStock ? 1 : 0, data.isNPD ? 1 : 0, data.netQuantity,
       data.availableInventory, data.wipQuantity, data.inTransitQuantity, data.status,
       data.feasibilityStatus, data.feasibilityReason, data.assignedLineId, data.assignedDieId,
       data.plannedStartDate, data.plannedEndDate, data.uploadedBy, data.approvedBy, data.approvedAt]
    );
    fetchDemands();
    return id;
  }, [fetchDemands]);

  const updateDemand = useCallback((id: string, data: Partial<Demand>) => {
    const fields: string[] = [];
    const values: any[] = [];
    
    if (data.sapOrderNumber !== undefined) { fields.push('sap_order_number = ?'); values.push(data.sapOrderNumber); }
    if (data.quantity !== undefined) { fields.push('quantity = ?'); values.push(data.quantity); }
    if (data.requestedDeliveryDate !== undefined) { fields.push('requested_delivery_date = ?'); values.push(data.requestedDeliveryDate); }
    if (data.priority !== undefined) { fields.push('priority = ?'); values.push(data.priority); }
    if (data.status !== undefined) { fields.push('status = ?'); values.push(data.status); }
    if (data.feasibilityStatus !== undefined) { fields.push('feasibility_status = ?'); values.push(data.feasibilityStatus); }
    if (data.feasibilityReason !== undefined) { fields.push('feasibility_reason = ?'); values.push(data.feasibilityReason); }
    if (data.assignedLineId !== undefined) { fields.push('assigned_line_id = ?'); values.push(data.assignedLineId); }
    if (data.assignedDieId !== undefined) { fields.push('assigned_die_id = ?'); values.push(data.assignedDieId); }
    if (data.plannedStartDate !== undefined) { fields.push('planned_start_date = ?'); values.push(data.plannedStartDate); }
    if (data.plannedEndDate !== undefined) { fields.push('planned_end_date = ?'); values.push(data.plannedEndDate); }
    if (data.approvedBy !== undefined) { fields.push('approved_by = ?'); values.push(data.approvedBy); }
    if (data.approvedAt !== undefined) { fields.push('approved_at = ?'); values.push(data.approvedAt); }
    
    if (fields.length > 0) {
      execute(
        `UPDATE demand SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [...values, id]
      );
      fetchDemands();
    }
  }, [fetchDemands]);

  const approveDemand = useCallback((id: string, approvedBy: string) => {
    execute(
      `UPDATE demand SET status = 'approved', approved_by = ?, approved_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [approvedBy, id]
    );
    fetchDemands();
  }, [fetchDemands]);

  const cancelDemand = useCallback((id: string) => {
    execute(
      `UPDATE demand SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [id]
    );
    fetchDemands();
  }, [fetchDemands]);

  const bulkUploadDemands = useCallback((demands: Omit<Demand, 'id' | 'createdAt' | 'updatedAt' | 'uploadedAt'>[], uploadedBy: string) => {
    const uploadId = generateId();
    
    const statements = demands.map(d => ({
      sql: `INSERT INTO demand (id, sap_order_number, schedule_line_number, material_code, part_id, customer,
        division_id, quantity, requested_delivery_date, demand_type, priority, indent_type,
        is_safety_stock, is_npd, net_quantity, available_inventory, wip_quantity, in_transit_quantity,
        status, feasibility_status, uploaded_by, uploaded_at, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      params: [generateId(), d.sapOrderNumber, d.scheduleLineNumber, d.materialCode, d.partId, d.customer,
        d.divisionId, d.quantity, d.requestedDeliveryDate, d.demandType, d.priority,
        d.indentType, d.isSafetyStock ? 1 : 0, d.isNPD ? 1 : 0, d.netQuantity,
        d.availableInventory, d.wipQuantity, d.inTransitQuantity, 'draft', 'executable', uploadedBy]
    }));
    
    transaction(statements);
    fetchDemands();
    return uploadId;
  }, [fetchDemands]);

  return { 
    demands, 
    isLoading, 
    createDemand, 
    updateDemand, 
    approveDemand, 
    cancelDemand,
    bulkUploadDemands,
    refresh: fetchDemands 
  };
}

export function useDemandStats() {
  const getStats = useCallback(() => {
    try {
      const totalDemand = query('SELECT COUNT(*) as count FROM demand')[0]?.count || 0;
      const pendingApproval = query("SELECT COUNT(*) as count FROM demand WHERE status = 'draft'")[0]?.count || 0;
      const approved = query("SELECT COUNT(*) as count FROM demand WHERE status = 'approved'")[0]?.count || 0;
      const inProduction = query("SELECT COUNT(*) as count FROM demand WHERE status = 'in_production'")[0]?.count || 0;
      const completed = query("SELECT COUNT(*) as count FROM demand WHERE status = 'completed'")[0]?.count || 0;
      const cancelled = query("SELECT COUNT(*) as count FROM demand WHERE status = 'cancelled'")[0]?.count || 0;
      
      const totalQuantity = query('SELECT SUM(quantity) as total FROM demand')[0]?.total || 0;
      
      return {
        totalDemand,
        pendingApproval,
        approved,
        inProduction,
        completed,
        cancelled,
        totalQuantity
      };
    } catch (error) {
      console.error('Error fetching demand stats:', error);
      return {
        totalDemand: 0,
        pendingApproval: 0,
        approved: 0,
        inProduction: 0,
        completed: 0,
        cancelled: 0,
        totalQuantity: 0
      };
    }
  }, []);

  return { getStats };
}
