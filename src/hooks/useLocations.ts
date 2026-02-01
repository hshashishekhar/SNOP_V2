// Hook for Location CRUD operations
import { useState, useEffect, useCallback } from 'react';
import { query, execute, generateId } from '@/db/database';
import type { Location } from '@/types';

export function useLocations() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLocations = useCallback(() => {
    try {
      const results = query('SELECT * FROM locations WHERE is_active = 1 ORDER BY name');
      setLocations(results.map(row => ({
        id: row.id,
        code: row.code,
        name: row.name,
        address: row.address,
        isActive: Boolean(row.is_active),
        createdAt: row.created_at,
        updatedAt: row.updated_at
      })));
    } catch (error) {
      console.error('Error fetching locations:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  const createLocation = useCallback((data: Omit<Location, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = generateId();
    execute(
      `INSERT INTO locations (id, code, name, address, is_active, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [id, data.code, data.name, data.address, data.isActive ? 1 : 0]
    );
    fetchLocations();
    return id;
  }, [fetchLocations]);

  const updateLocation = useCallback((id: string, data: Partial<Location>) => {
    const fields: string[] = [];
    const values: any[] = [];
    
    if (data.code !== undefined) { fields.push('code = ?'); values.push(data.code); }
    if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
    if (data.address !== undefined) { fields.push('address = ?'); values.push(data.address); }
    if (data.isActive !== undefined) { fields.push('is_active = ?'); values.push(data.isActive ? 1 : 0); }
    
    if (fields.length > 0) {
      execute(
        `UPDATE locations SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [...values, id]
      );
      fetchLocations();
    }
  }, [fetchLocations]);

  const deleteLocation = useCallback((id: string) => {
    execute('UPDATE locations SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);
    fetchLocations();
  }, [fetchLocations]);

  return { locations, isLoading, createLocation, updateLocation, deleteLocation, refresh: fetchLocations };
}
