import { useEffect } from 'react';
import { addDatabaseChangeListener, useSQLiteContext } from 'expo-sqlite';

export function useDbListener(tableName: string, onChange: () => void) {
  const db = useSQLiteContext();

  useEffect(() => {
    onChange();

    const subscription = addDatabaseChangeListener(({ tableName: changed }) => {
      if (changed === tableName) {
        onChange();
      }
    });
    return () => subscription.remove();
  }, [db, tableName]);
}
