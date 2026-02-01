// Hook for Division CRUD operations
import { useState, useEffect, useCallback } from 'react';
import { query, execute, generateId } from '@/db/database';
import type { Division } from '@/types';

export function useDivisions(locationId?: string) {
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDivisions = useCallback(() => {
    try {
      let sql = `
        SELECT d.*, l.name as location_name, l.code as location_code 
        FROM divisions d 
        LEFT JOIN locations l ON d.location_id = l.id 
        WHERE d.is_active = 1
      `;
      const params: any[] = [];
      
      if (locationId) {
        sql += ' AND d.location_id = ?';
        params.push(locationId);
      }
      
      sql += ' ORDER BY d.name';
      
      const results = query(sql, params);
      setDivisions(results.map(row => ({
        id: row.id,
        locationId: row.location_id,
        code: row.code,
        name: row.name,
        isActive: Boolean(row.is_active),
        createdAt: row.created_at,
        updatedAt: row.updated_at
      })));
    } catch (error) {
      console.error('Error fetching divisions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [locationId]);

  useEffect(() => {
    fetchDivisions();
  }, [fetchDivisions]);

  const createDivision = useCallback((data: Omit<Division, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = generateId();
    execute(
      `INSERT INTO divisions (id, location_id, code, name, is_active, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [id, data.locationId, data.code, data.name, data.isActive ? 1 : 0]
    );
    fetchDivisions();
    return id;
  }, [fetchDivisions]);

  const updateDivision = useCallback((id: string, data: Partial<Division>) => {
    const fields: string[] = [];
    const values: any[] = [];
    
    if (data.locationId !== undefined) { fields.push('location_id = ?'); values.push(data.locationId); }
    if (data.code !== undefined) { fields.push('code = ?'); values.push(data.code); }
    if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
    if (data.isActive !== undefined) { fields.push('is_active = ?'); values.push(data.isActive ? 1 : 0); }
    
    if (fields.length > 0) {
      execute(
        `UPDATE divisions SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [...values, id]
      );
      fetchDivisions();
    }
  }, [fetchDivisions]);

  const deleteDivision = useCallback((id: string) => {
    execute('UPDATE divisions SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);
    fetchDivisions();
  }, [fetchDivisions]);

  return { divisions, isLoading, createDivision, updateDivision, deleteDivision, refresh: fetchDivisions };
}
