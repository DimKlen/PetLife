import * as SQLite from "expo-sqlite";

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;

  db = await SQLite.openDatabaseAsync("pet-health.db");

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS pets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      race TEXT,
      age INTEGER,
      photo TEXT,
      hunger INTEGER DEFAULT 100,
      thirst INTEGER DEFAULT 100,
      mood INTEGER DEFAULT 100,
      last_update INTEGER,
      created_at INTEGER
    );
  `);

  return db;
}
