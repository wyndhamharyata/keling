import { useEffect, useRef } from 'react';
import { addDatabaseChangeListener, useSQLiteContext } from 'expo-sqlite';

export function useDbListener(tableNames: string | string[], onChange: () => void) {
  const db = useSQLiteContext();
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const namesKey = Array.isArray(tableNames) ? tableNames.join(',') : tableNames;

  useEffect(() => {
    onChangeRef.current();

    const names = namesKey.split(',');
    const subscription = addDatabaseChangeListener(({ tableName: changed }) => {
      if (names.includes(changed)) {
        onChangeRef.current();
      }
    });
    return () => subscription.remove();
  }, [db, namesKey]);
}
