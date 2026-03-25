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

    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      date TEXT NOT NULL,
      time TEXT,
      petId INTEGER REFERENCES pets(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      reminder INTEGER DEFAULT 0,
      reminderTime INTEGER,
      completed INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
    CREATE INDEX IF NOT EXISTS idx_events_petId ON events(petId);
  `);

  // Migrations colonnes pets
  try { await db.execAsync("ALTER TABLE pets ADD COLUMN color TEXT"); } catch {}
  try { await db.execAsync("ALTER TABLE pets ADD COLUMN sexe TEXT"); } catch {}
  try { await db.execAsync("ALTER TABLE pets ADD COLUMN date_naissance TEXT"); } catch {}
  try { await db.execAsync("ALTER TABLE pets ADD COLUMN couleur_pelage TEXT"); } catch {}
  try { await db.execAsync("ALTER TABLE pets ADD COLUMN apparence TEXT"); } catch {}
  try { await db.execAsync("ALTER TABLE pets ADD COLUMN poids REAL"); } catch {}
  try { await db.execAsync("ALTER TABLE pets ADD COLUMN sterilise INTEGER DEFAULT 0"); } catch {}
  try { await db.execAsync("ALTER TABLE pets ADD COLUMN vaccins TEXT DEFAULT '[]'"); } catch {}
  try { await db.execAsync("ALTER TABLE pets ADD COLUMN allergies TEXT DEFAULT '[]'"); } catch {}
  try { await db.execAsync("ALTER TABLE pets ADD COLUMN maladies TEXT DEFAULT '[]'"); } catch {}
  try { await db.execAsync("ALTER TABLE pets ADD COLUMN traitements TEXT"); } catch {}
  try { await db.execAsync("ALTER TABLE pets ADD COLUMN proprio_nom TEXT"); } catch {}
  try { await db.execAsync("ALTER TABLE pets ADD COLUMN proprio_tel TEXT"); } catch {}
  try { await db.execAsync("ALTER TABLE pets ADD COLUMN proprio_email TEXT"); } catch {}
  try { await db.execAsync("ALTER TABLE pets ADD COLUMN proprio_adresse TEXT"); } catch {}
  try { await db.execAsync("ALTER TABLE pets ADD COLUMN vet_nom TEXT"); } catch {}
  try { await db.execAsync("ALTER TABLE pets ADD COLUMN vet_adresse TEXT"); } catch {}
  try { await db.execAsync("ALTER TABLE pets ADD COLUMN vet_tel TEXT"); } catch {}

  // Migrations colonnes events (v2 : nouveaux champs)
  try { await db.execAsync("ALTER TABLE events ADD COLUMN allDay INTEGER DEFAULT 0"); } catch {}
  try { await db.execAsync("ALTER TABLE events ADD COLUMN startTime TEXT"); } catch {}
  try { await db.execAsync("ALTER TABLE events ADD COLUMN endTime TEXT"); } catch {}
  try { await db.execAsync("ALTER TABLE events ADD COLUMN petIds TEXT DEFAULT '[]'"); } catch {}
  try { await db.execAsync("ALTER TABLE events ADD COLUMN repeat TEXT DEFAULT 'never'"); } catch {}
  try { await db.execAsync("ALTER TABLE events ADD COLUMN location TEXT"); } catch {}
  try { await db.execAsync("ALTER TABLE events ADD COLUMN reminders TEXT DEFAULT '[30]'"); } catch {}

  return db;
}
