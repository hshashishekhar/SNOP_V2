// Custom hook for database operations
import { useState, useEffect, useCallback } from 'react';
import { initDatabase, query, execute, transaction } from '@/db/database';

export function useDatabase() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        await initDatabase();
        setIsReady(true);
      } catch (err) {
        setError(err as Error);
      }
    };
    init();
  }, []);

  const runQuery = useCallback((sql: string, params?: any[]) => {
    if (!isReady) throw new Error('Database not ready');
    return query(sql, params);
  }, [isReady]);

  const runExecute = useCallback((sql: string, params?: any[]) => {
    if (!isReady) throw new Error('Database not ready');
    return execute(sql, params);
  }, [isReady]);

  const runTransaction = useCallback((statements: { sql: string; params?: any[] }[]) => {
    if (!isReady) throw new Error('Database not ready');
    return transaction(statements);
  }, [isReady]);

  return { isReady, error, query: runQuery, execute: runExecute, transaction: runTransaction };
}
