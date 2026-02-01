// Hook for Line CRUD operations
import { useState, useEffect, useCallback } from 'react';
import { query, execute, generateId } from '@/db/database';
import type { Line } from '@/types';

export function useLines(divisionId?: string) {
  const [lines, setLines] = useState<Line[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLines = useCallback(() => {
    try {
      let sql = `
        SELECT l.*, d.name as division_name, d.code as division_code,
               loc.name as location_name, loc.code as location_code
        FROM lines l
        LEFT JOIN divisions d ON l.division_id = d.id
        LEFT JOIN locations loc ON d.location_id = loc.id
        WHERE l.is_active = 1
      `;
      const params: any[] = [];
      
      if (divisionId) {
        sql += ' AND l.division_id = ?';
        params.push(divisionId);
      }
      
      sql += ' ORDER BY l.name';
      
      const results = query(sql, params);
      setLines(results.map(row => ({
        id: row.id,
        divisionId: row.division_id,
        code: row.code,
        name: row.name,
        pressTonnage: row.press_tonnage,
        shutHeightMin: row.shut_height_min,
        shutHeightMax: row.shut_height_max,
        isContinuous: Boolean(row.is_continuous),
        grossHoursPerWeek: row.gross_hours_per_week,
        absenteeismFactor: row.absenteeism_factor,
        unplannedDowntimeBuffer: row.unplanned_downtime_buffer,
        isActive: Boolean(row.is_active),
        createdAt: row.created_at,
        updatedAt: row.updated_at
      })));
    } catch (error: any) {
      console.error('Error fetching lines:', error);
      // If database not initialized, don't set loading to false yet
      if (error.message?.includes('not initialized')) {
        return;
      }
    } finally {
      setIsLoading(false);
    }
  }, [divisionId]);

  useEffect(() => {
    fetchLines();
  }, [fetchLines]);

  const createLine = useCallback((data: Omit<Line, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = generateId();
    execute(
      `INSERT INTO lines (id, division_id, code, name, press_tonnage, shut_height_min, shut_height_max,
        is_continuous, gross_hours_per_week, absenteeism_factor, unplanned_downtime_buffer, is_active, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [id, data.divisionId, data.code, data.name, data.pressTonnage, data.shutHeightMin, 
       data.shutHeightMax, data.isContinuous ? 1 : 0, data.grossHoursPerWeek, 
       data.absenteeismFactor, data.unplannedDowntimeBuffer, data.isActive ? 1 : 0]
    );
    fetchLines();
    return id;
  }, [fetchLines]);

  const updateLine = useCallback((id: string, data: Partial<Line>) => {
    const fields: string[] = [];
    const values: any[] = [];
    
    if (data.divisionId !== undefined) { fields.push('division_id = ?'); values.push(data.divisionId); }
    if (data.code !== undefined) { fields.push('code = ?'); values.push(data.code); }
    if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
    if (data.pressTonnage !== undefined) { fields.push('press_tonnage = ?'); values.push(data.pressTonnage); }
    if (data.shutHeightMin !== undefined) { fields.push('shut_height_min = ?'); values.push(data.shutHeightMin); }
    if (data.shutHeightMax !== undefined) { fields.push('shut_height_max = ?'); values.push(data.shutHeightMax); }
    if (data.isContinuous !== undefined) { fields.push('is_continuous = ?'); values.push(data.isContinuous ? 1 : 0); }
    if (data.grossHoursPerWeek !== undefined) { fields.push('gross_hours_per_week = ?'); values.push(data.grossHoursPerWeek); }
    if (data.absenteeismFactor !== undefined) { fields.push('absenteeism_factor = ?'); values.push(data.absenteeismFactor); }
    if (data.unplannedDowntimeBuffer !== undefined) { fields.push('unplanned_downtime_buffer = ?'); values.push(data.unplannedDowntimeBuffer); }
    if (data.isActive !== undefined) { fields.push('is_active = ?'); values.push(data.isActive ? 1 : 0); }
    
    if (fields.length > 0) {
      execute(
        `UPDATE lines SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [...values, id]
      );
      fetchLines();
    }
  }, [fetchLines]);

  const deleteLine = useCallback((id: string) => {
    execute('UPDATE lines SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);
    fetchLines();
  }, [fetchLines]);

  return { lines, isLoading, createLine, updateLine, deleteLine, refresh: fetchLines };
}
