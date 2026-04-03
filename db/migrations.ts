import { type SQLiteDatabase } from 'expo-sqlite';

type Migration = (db: SQLiteDatabase) => Promise<void>;

const migrations: Migration[] = [
  // Migration 0 → 1
  async (db) => {
    await db.execAsync(`
      CREATE TABLE events (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        priority TEXT NOT NULL DEFAULT 'medium',
        labels TEXT NOT NULL DEFAULT ''
          CHECK(
            labels = '' OR
            (labels NOT GLOB '*,,*'
             AND labels NOT GLOB ',*'
             AND labels NOT GLOB '*,'
             AND labels NOT GLOB '* *')
          ),
        schedule TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL DEFAULT 'todo'
      );
    `);
  },
  // To add a new migration: append a function here.
  // It will automatically run on next app launch for users on older versions.
];

export async function migrateDatabase(db: SQLiteDatabase): Promise<void> {
  await db.execAsync('PRAGMA journal_mode = WAL');

  const result = await db.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version'
  );
  let currentVersion = result!.user_version;

  for (let i = currentVersion; i < migrations.length; i++) {
    await db.withExclusiveTransactionAsync(async (txn) => {
      await migrations[i](txn);
    });
    await db.execAsync(`PRAGMA user_version = ${i + 1}`);
  }
}
