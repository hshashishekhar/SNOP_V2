// Hook for Die management
import { useState, useEffect, useCallback } from 'react';
import { query, execute, generateId } from '@/db/database';
import type { Die, DieUnavailability } from '@/types';

export function useDies(lineId?: string, category?: string) {
  const [dies, setDies] = useState<Die[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDies = useCallback(() => {
    try {
      let sql = `
        SELECT d.*, l.name as line_name, l.code as line_code,
               div.name as division_name, loc.name as location_name
        FROM dies d
        LEFT JOIN lines l ON d.line_id = l.id
        LEFT JOIN divisions div ON l.division_id = div.id
        LEFT JOIN locations loc ON div.location_id = loc.id
        WHERE d.is_active = 1
      `;
      const params: any[] = [];
      
      if (lineId) {
        sql += ' AND d.line_id = ?';
        params.push(lineId);
      }
      if (category) {
        sql += ' AND d.category = ?';
        params.push(category);
      }
      
      sql += ' ORDER BY d.code';
      
      const results = query(sql, params);
      setDies(results.map(row => ({
        id: row.id,
        code: row.code,
        name: row.name,
        lineId: row.line_id,
        category: row.category,
        totalLife: row.total_life,
        remainingLife: row.remaining_life,
        shotsPerHour: row.shots_per_hour,
        status: row.status,
        geometricCompatibility: row.geometric_compatibility,
        rawMaterialCode: row.raw_material_code,
        rawMaterialQtyPerShot: row.raw_material_qty_per_shot,
        rawMaterialLeadTime: row.raw_material_lead_time,
        rawMaterialMOQ: row.raw_material_moq,
        alternateRawMaterialCodes: row.alternate_raw_material_codes,
        lastRefurbishmentDate: row.last_refurbishment_date,
        nextRefurbishmentDue: row.next_refurbishment_due,
        isActive: Boolean(row.is_active),
        createdAt: row.created_at,
        updatedAt: row.updated_at
      })));
    } catch (error) {
      console.error('Error fetching dies:', error);
    } finally {
      setIsLoading(false);
    }
  }, [lineId, category]);

  useEffect(() => {
    fetchDies();
  }, [fetchDies]);

  const createDie = useCallback((data: Omit<Die, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = generateId();
    execute(
      `INSERT INTO dies (id, code, name, line_id, category, total_life, remaining_life, shots_per_hour,
        status, geometric_compatibility, raw_material_code, raw_material_qty_per_shot,
        raw_material_lead_time, raw_material_moq, alternate_raw_material_codes,
        last_refurbishment_date, next_refurbishment_due, is_active, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [id, data.code, data.name, data.lineId, data.category, data.totalLife, data.remainingLife,
       data.shotsPerHour, data.status, data.geometricCompatibility, data.rawMaterialCode,
       data.rawMaterialQtyPerShot, data.rawMaterialLeadTime, data.rawMaterialMOQ,
       data.alternateRawMaterialCodes, data.lastRefurbishmentDate, data.nextRefurbishmentDue,
       data.isActive ? 1 : 0]
    );
    fetchDies();
    return id;
  }, [fetchDies]);

  const updateDie = useCallback((id: string, data: Partial<Die>) => {
    const fields: string[] = [];
    const values: any[] = [];
    
    if (data.code !== undefined) { fields.push('code = ?'); values.push(data.code); }
    if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
    if (data.lineId !== undefined) { fields.push('line_id = ?'); values.push(data.lineId); }
    if (data.category !== undefined) { fields.push('category = ?'); values.push(data.category); }
    if (data.totalLife !== undefined) { fields.push('total_life = ?'); values.push(data.totalLife); }
    if (data.remainingLife !== undefined) { fields.push('remaining_life = ?'); values.push(data.remainingLife); }
    if (data.shotsPerHour !== undefined) { fields.push('shots_per_hour = ?'); values.push(data.shotsPerHour); }
    if (data.status !== undefined) { fields.push('status = ?'); values.push(data.status); }
    if (data.geometricCompatibility !== undefined) { fields.push('geometric_compatibility = ?'); values.push(data.geometricCompatibility); }
    if (data.rawMaterialCode !== undefined) { fields.push('raw_material_code = ?'); values.push(data.rawMaterialCode); }
    if (data.rawMaterialQtyPerShot !== undefined) { fields.push('raw_material_qty_per_shot = ?'); values.push(data.rawMaterialQtyPerShot); }
    if (data.rawMaterialLeadTime !== undefined) { fields.push('raw_material_lead_time = ?'); values.push(data.rawMaterialLeadTime); }
    if (data.rawMaterialMOQ !== undefined) { fields.push('raw_material_moq = ?'); values.push(data.rawMaterialMOQ); }
    if (data.alternateRawMaterialCodes !== undefined) { fields.push('alternate_raw_material_codes = ?'); values.push(data.alternateRawMaterialCodes); }
    if (data.lastRefurbishmentDate !== undefined) { fields.push('last_refurbishment_date = ?'); values.push(data.lastRefurbishmentDate); }
    if (data.nextRefurbishmentDue !== undefined) { fields.push('next_refurbishment_due = ?'); values.push(data.nextRefurbishmentDue); }
    if (data.isActive !== undefined) { fields.push('is_active = ?'); values.push(data.isActive ? 1 : 0); }
    
    if (fields.length > 0) {
      execute(
        `UPDATE dies SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [...values, id]
      );
      fetchDies();
    }
  }, [fetchDies]);

  const deleteDie = useCallback((id: string) => {
    execute('UPDATE dies SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);
    fetchDies();
  }, [fetchDies]);

  return { dies, isLoading, createDie, updateDie, deleteDie, refresh: fetchDies };
}

export function useDieUnavailability(dieId?: string) {
  const [unavailability, setUnavailability] = useState<DieUnavailability[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUnavailability = useCallback(() => {
    try {
      let sql = `
        SELECT du.*, d.code as die_code, d.name as die_name
        FROM die_unavailability du
        LEFT JOIN dies d ON du.die_id = d.id
        WHERE 1=1
      `;
      const params: any[] = [];
      
      if (dieId) {
        sql += ' AND du.die_id = ?';
        params.push(dieId);
      }
      
      sql += ' ORDER BY du.start_date_time DESC';
      
      const results = query(sql, params);
      setUnavailability(results.map(row => ({
        id: row.id,
        dieId: row.die_id,
        reason: row.reason,
        category: row.category,
        startDateTime: row.start_date_time,
        endDateTime: row.end_date_time,
        duration: row.duration,
        durationUnit: row.duration_unit,
        recurrence: row.recurrence,
        recurrenceEndDate: row.recurrence_end_date,
        impactType: row.impact_type,
        efficiencyLossPercent: row.efficiency_loss_percent,
        notes: row.notes,
        createdBy: row.created_by,
        approvedBy: row.approved_by,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      })));
    } catch (error) {
      console.error('Error fetching die unavailability:', error);
    } finally {
      setIsLoading(false);
    }
  }, [dieId]);

  useEffect(() => {
    fetchUnavailability();
  }, [fetchUnavailability]);

  const createUnavailability = useCallback((data: Omit<DieUnavailability, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = generateId();
    execute(
      `INSERT INTO die_unavailability (id, die_id, reason, category, start_date_time, end_date_time,
        duration, duration_unit, recurrence, recurrence_end_date, impact_type, efficiency_loss_percent,
        notes, created_by, approved_by, status, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [id, data.dieId, data.reason, data.category, data.startDateTime, data.endDateTime,
       data.duration, data.durationUnit, data.recurrence, data.recurrenceEndDate,
       data.impactType, data.efficiencyLossPercent, data.notes, data.createdBy,
       data.approvedBy, data.status]
    );
    fetchUnavailability();
    return id;
  }, [fetchUnavailability]);

  const updateUnavailability = useCallback((id: string, data: Partial<DieUnavailability>) => {
    const fields: string[] = [];
    const values: any[] = [];
    
    if (data.dieId !== undefined) { fields.push('die_id = ?'); values.push(data.dieId); }
    if (data.reason !== undefined) { fields.push('reason = ?'); values.push(data.reason); }
    if (data.category !== undefined) { fields.push('category = ?'); values.push(data.category); }
    if (data.startDateTime !== undefined) { fields.push('start_date_time = ?'); values.push(data.startDateTime); }
    if (data.endDateTime !== undefined) { fields.push('end_date_time = ?'); values.push(data.endDateTime); }
    if (data.duration !== undefined) { fields.push('duration = ?'); values.push(data.duration); }
    if (data.durationUnit !== undefined) { fields.push('duration_unit = ?'); values.push(data.durationUnit); }
    if (data.recurrence !== undefined) { fields.push('recurrence = ?'); values.push(data.recurrence); }
    if (data.recurrenceEndDate !== undefined) { fields.push('recurrence_end_date = ?'); values.push(data.recurrenceEndDate); }
    if (data.impactType !== undefined) { fields.push('impact_type = ?'); values.push(data.impactType); }
    if (data.efficiencyLossPercent !== undefined) { fields.push('efficiency_loss_percent = ?'); values.push(data.efficiencyLossPercent); }
    if (data.notes !== undefined) { fields.push('notes = ?'); values.push(data.notes); }
    if (data.approvedBy !== undefined) { fields.push('approved_by = ?'); values.push(data.approvedBy); }
    if (data.status !== undefined) { fields.push('status = ?'); values.push(data.status); }
    
    if (fields.length > 0) {
      execute(
        `UPDATE die_unavailability SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [...values, id]
      );
      fetchUnavailability();
    }
  }, [fetchUnavailability]);

  const deleteUnavailability = useCallback((id: string) => {
    execute('DELETE FROM die_unavailability WHERE id = ?', [id]);
    fetchUnavailability();
  }, [fetchUnavailability]);

  return { 
    unavailability, 
    isLoading, 
    createUnavailability, 
    updateUnavailability, 
    deleteUnavailability, 
    refresh: fetchUnavailability 
  };
}
