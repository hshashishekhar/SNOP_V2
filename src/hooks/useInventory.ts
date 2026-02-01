// Hook for Inventory management
import { useState, useEffect, useCallback } from 'react';
import { query, execute, generateId } from '@/db/database';
import type { Inventory } from '@/types';

export function useInventory(locationId?: string, stage?: string, status?: string) {
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInventory = useCallback(() => {
    try {
      let sql = `
        SELECT i.*, p.description as part_description, p.material_code,
               d.code as die_code, l.name as location_name
        FROM inventory i
        LEFT JOIN parts p ON i.part_id = p.id
        LEFT JOIN dies d ON i.die_id = d.id
        LEFT JOIN locations l ON i.location_id = l.id
        WHERE 1=1
      `;
      const params: any[] = [];
      
      if (locationId) {
        sql += ' AND i.location_id = ?';
        params.push(locationId);
      }
      if (stage) {
        sql += ' AND i.stage = ?';
        params.push(stage);
      }
      if (status) {
        sql += ' AND i.status = ?';
        params.push(status);
      }
      
      sql += ' ORDER BY i.updated_at DESC';
      
      const results = query(sql, params);
      setInventory(results.map(row => ({
        id: row.id,
        partId: row.part_id,
        dieId: row.die_id,
        rawMaterialCode: row.raw_material_code,
        stage: row.stage,
        status: row.status,
        quantity: row.quantity,
        locationId: row.location_id,
        divisionId: row.division_id,
        lineId: row.line_id,
        lotNumber: row.lot_number,
        batchNumber: row.batch_number,
        expiryDate: row.expiry_date,
        valuationRate: row.valuation_rate,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      })));
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setIsLoading(false);
    }
  }, [locationId, stage, status]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const createInventory = useCallback((data: Omit<Inventory, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = generateId();
    execute(
      `INSERT INTO inventory (id, part_id, die_id, raw_material_code, stage, status, quantity,
        location_id, division_id, line_id, lot_number, batch_number, expiry_date, valuation_rate, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [id, data.partId, data.dieId, data.rawMaterialCode, data.stage, data.status, data.quantity,
       data.locationId, data.divisionId, data.lineId, data.lotNumber, data.batchNumber,
       data.expiryDate, data.valuationRate]
    );
    fetchInventory();
    return id;
  }, [fetchInventory]);

  const updateInventory = useCallback((id: string, data: Partial<Inventory>) => {
    const fields: string[] = [];
    const values: any[] = [];
    
    if (data.partId !== undefined) { fields.push('part_id = ?'); values.push(data.partId); }
    if (data.dieId !== undefined) { fields.push('die_id = ?'); values.push(data.dieId); }
    if (data.rawMaterialCode !== undefined) { fields.push('raw_material_code = ?'); values.push(data.rawMaterialCode); }
    if (data.stage !== undefined) { fields.push('stage = ?'); values.push(data.stage); }
    if (data.status !== undefined) { fields.push('status = ?'); values.push(data.status); }
    if (data.quantity !== undefined) { fields.push('quantity = ?'); values.push(data.quantity); }
    if (data.locationId !== undefined) { fields.push('location_id = ?'); values.push(data.locationId); }
    if (data.divisionId !== undefined) { fields.push('division_id = ?'); values.push(data.divisionId); }
    if (data.lineId !== undefined) { fields.push('line_id = ?'); values.push(data.lineId); }
    if (data.lotNumber !== undefined) { fields.push('lot_number = ?'); values.push(data.lotNumber); }
    if (data.batchNumber !== undefined) { fields.push('batch_number = ?'); values.push(data.batchNumber); }
    if (data.expiryDate !== undefined) { fields.push('expiry_date = ?'); values.push(data.expiryDate); }
    if (data.valuationRate !== undefined) { fields.push('valuation_rate = ?'); values.push(data.valuationRate); }
    
    if (fields.length > 0) {
      execute(
        `UPDATE inventory SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [...values, id]
      );
      fetchInventory();
    }
  }, [fetchInventory]);

  const adjustStock = useCallback((id: string, quantity: number, reason: string, userId: string) => {
    const inv = query('SELECT * FROM inventory WHERE id = ?', [id])[0];
    if (!inv) return;
    
    const oldQuantity = inv.quantity;
    const newQuantity = oldQuantity + quantity;
    
    execute(
      'UPDATE inventory SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newQuantity, id]
    );
    
    // Create transaction record
    execute(
      `INSERT INTO inventory_transactions (id, inventory_id, transaction_type, quantity,
        from_status, to_status, reference_type, notes, created_by, created_at)
       VALUES (?, ?, 'adjustment', ?, ?, ?, 'manual', ?, ?, CURRENT_TIMESTAMP)`,
      [generateId(), id, quantity, inv.status, inv.status, reason, userId]
    );
    
    fetchInventory();
  }, [fetchInventory]);

  const getInventoryByPart = useCallback((partId: string) => {
    return query(
      `SELECT i.*, l.name as location_name 
       FROM inventory i 
       LEFT JOIN locations l ON i.location_id = l.id 
       WHERE i.part_id = ? ORDER BY i.stage`,
      [partId]
    );
  }, []);

  const getInventorySummary = useCallback(() => {
    return query(`
      SELECT 
        stage,
        status,
        COUNT(*) as item_count,
        SUM(quantity) as total_quantity,
        SUM(quantity * COALESCE(valuation_rate, 0)) as total_value
      FROM inventory
      GROUP BY stage, status
      ORDER BY stage, status
    `);
  }, []);

  return { 
    inventory, 
    isLoading, 
    createInventory, 
    updateInventory, 
    adjustStock,
    getInventoryByPart,
    getInventorySummary,
    refresh: fetchInventory 
  };
}

export function useInventoryTransactions(inventoryId?: string) {
  const getTransactions = useCallback(() => {
    try {
      let sql = `
        SELECT it.*, i.part_id, p.description as part_description
        FROM inventory_transactions it
        LEFT JOIN inventory i ON it.inventory_id = i.id
        LEFT JOIN parts p ON i.part_id = p.id
        WHERE 1=1
      `;
      const params: any[] = [];
      
      if (inventoryId) {
        sql += ' AND it.inventory_id = ?';
        params.push(inventoryId);
      }
      
      sql += ' ORDER BY it.created_at DESC LIMIT 100';
      
      return query(sql, params);
    } catch (error) {
      console.error('Error fetching inventory transactions:', error);
      return [];
    }
  }, [inventoryId]);

  return { getTransactions };
}
