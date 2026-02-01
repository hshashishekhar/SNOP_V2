// Bharat Forge SNOP System - SQLite Database Manager
import initSqlJs from 'sql.js';
import { CREATE_TABLES_SQL, SEED_DATA_SQL } from './schema';

let db: any = null;
let SQL: any = null;

// Initialize the database
export async function initDatabase(): Promise<void> {
  if (db) return;
  
  try {
    SQL = await initSqlJs({
      locateFile: (file: string) => `https://sql.js.org/dist/${file}`
    });
    
    // Create new database
    db = new SQL.Database();
    
    // Create tables
    db.run(CREATE_TABLES_SQL);
    
    // Seed data
    db.run(SEED_DATA_SQL);
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

// Get database instance
export function getDatabase(): any {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

// Execute a query and return results
export function query(sql: string, _params: any[] = []): any[] {
  if (!db) {
    throw new Error('Database not initialized');
  }
  
  try {
    const stmt = db.prepare(sql);
    const results: any[] = [];
    
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    
    stmt.free();
    return results;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
}

// Execute a single statement (INSERT, UPDATE, DELETE)
export function execute(sql: string, params: any[] = []): { lastInsertRowid: number; changes: number } {
  if (!db) {
    throw new Error('Database not initialized');
  }
  
  try {
    db.run(sql, params);
    return {
      lastInsertRowid: db.lastInsertRowId,
      changes: db.getRowsModified()
    };
  } catch (error) {
    console.error('Execute error:', error);
    throw error;
  }
}

// Execute multiple statements in a transaction
export function transaction(statements: { sql: string; params?: any[] }[]): boolean {
  if (!db) {
    throw new Error('Database not initialized');
  }
  
  try {
    db.run('BEGIN TRANSACTION');
    
    for (const stmt of statements) {
      db.run(stmt.sql, stmt.params || []);
    }
    
    db.run('COMMIT');
    return true;
  } catch (error) {
    db.run('ROLLBACK');
    console.error('Transaction error:', error);
    throw error;
  }
}

// Export database to binary format
export function exportDatabase(): Uint8Array {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db.export();
}

// Import database from binary format
export function importDatabase(data: Uint8Array): void {
  if (SQL) {
    db = new SQL.Database(data);
  }
}

// Generate UUID
export function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Helper function to format date for SQLite
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function formatDateTime(date: Date): string {
  return date.toISOString().replace('T', ' ').split('.')[0];
}

// Generic CRUD operations
export function createRecord(table: string, data: Record<string, any>): string {
  const id = generateId();
  const fields = Object.keys(data);
  const placeholders = fields.map(() => '?').join(', ');
  const values = Object.values(data);
  
  const sql = `INSERT INTO ${table} (id, ${fields.join(', ')}, created_at, updated_at) VALUES (?, ${placeholders}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`;
  
  execute(sql, [id, ...values]);
  return id;
}

export function updateRecord(table: string, id: string, data: Record<string, any>): void {
  const fields = Object.keys(data);
  const setClause = fields.map(f => `${f} = ?`).join(', ');
  const values = Object.values(data);
  
  const sql = `UPDATE ${table} SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
  
  execute(sql, [...values, id]);
}

export function deleteRecord(table: string, id: string): void {
  const sql = `DELETE FROM ${table} WHERE id = ?`;
  execute(sql, [id]);
}

export function getRecordById(table: string, id: string): any {
  const sql = `SELECT * FROM ${table} WHERE id = ?`;
  const results = query(sql, [id]);
  return results.length > 0 ? results[0] : null;
}

export function getAllRecords(table: string, orderBy: string = 'created_at DESC'): any[] {
  const sql = `SELECT * FROM ${table} ORDER BY ${orderBy}`;
  return query(sql);
}

// Search records with filters
export function searchRecords(
  table: string,
  filters: Record<string, any>,
  orderBy: string = 'created_at DESC'
): any[] {
  const conditions: string[] = [];
  const values: any[] = [];
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      conditions.push(`${key} = ?`);
      values.push(value);
    }
  });
  
  let sql = `SELECT * FROM ${table}`;
  if (conditions.length > 0) {
    sql += ` WHERE ${conditions.join(' AND ')}`;
  }
  sql += ` ORDER BY ${orderBy}`;
  
  return query(sql, values);
}

// Get count of records
export function getCount(table: string, filters?: Record<string, any>): number {
  let sql = `SELECT COUNT(*) as count FROM ${table}`;
  const values: any[] = [];
  
  if (filters && Object.keys(filters).length > 0) {
    const conditions: string[] = [];
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        conditions.push(`${key} = ?`);
        values.push(value);
      }
    });
    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }
  }
  
  const results = query(sql, values);
  return results[0]?.count || 0;
}

// Complex query builder for reports
export function buildReportQuery(
  selectFields: string[],
  fromTable: string,
  joins: { table: string; on: string; type?: string }[] = [],
  whereConditions: string[] = [],
  whereValues: any[] = [],
  groupBy: string[] = [],
  orderBy: string[] = []
): any[] {
  let sql = `SELECT ${selectFields.join(', ')} FROM ${fromTable}`;
  
  joins.forEach(join => {
    const joinType = join.type || 'LEFT';
    sql += ` ${joinType} JOIN ${join.table} ON ${join.on}`;
  });
  
  if (whereConditions.length > 0) {
    sql += ` WHERE ${whereConditions.join(' AND ')}`;
  }
  
  if (groupBy.length > 0) {
    sql += ` GROUP BY ${groupBy.join(', ')}`;
  }
  
  if (orderBy.length > 0) {
    sql += ` ORDER BY ${orderBy.join(', ')}`;
  }
  
  return query(sql, whereValues);
}
