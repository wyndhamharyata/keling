import { type SQLiteDatabase, type SQLiteBindParams } from 'expo-sqlite';

function parseJsonFields<T extends Record<string, unknown>>(row: T, jsonFields: (keyof T)[]): T {
  const parsed = { ...row };
  for (const field of jsonFields) {
    if (typeof parsed[field] === 'string') {
      parsed[field] = JSON.parse(parsed[field] as string);
    }
  }
  return parsed;
}

export function getFirstSync<T extends Record<string, unknown>>(
  db: SQLiteDatabase,
  sql: string,
  params?: SQLiteBindParams,
  jsonFields?: (keyof T)[],
): T | null {
  const row = params ? db.getFirstSync<T>(sql, params) : db.getFirstSync<T>(sql);
  return row && jsonFields ? parseJsonFields(row, jsonFields) : row;
}

export function getAllSync<T extends Record<string, unknown>>(
  db: SQLiteDatabase,
  sql: string,
  params?: SQLiteBindParams,
  jsonFields?: (keyof T)[],
): T[] {
  const rows = params ? db.getAllSync<T>(sql, params) : db.getAllSync<T>(sql);
  return jsonFields ? rows.map((r) => parseJsonFields(r, jsonFields)) : rows;
}
