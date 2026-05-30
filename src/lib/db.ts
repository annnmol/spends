import * as SQLite from "expo-sqlite";

let _db: SQLite.SQLiteDatabase | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (_db) return _db;
  _db = await SQLite.openDatabaseAsync("spends.db");
  await _db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS transactions (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      sms_id          TEXT UNIQUE,
      message_hash    TEXT UNIQUE,
      amount          REAL,
      merchant        TEXT,
      card_last4      TEXT,
      upi_ref         TEXT,
      category        TEXT NOT NULL,
      timestamp       INTEGER NOT NULL,
      sender          TEXT NOT NULL,
      raw_sms         TEXT NOT NULL
    );
  `);
  await _runMigrations(_db);
  return _db;
}

async function _runMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ user_version: number }>("PRAGMA user_version");
  const version = row?.user_version ?? 0;

  if (version < 1) {
    // v1: add transaction_type column
    await db.execAsync("ALTER TABLE transactions ADD COLUMN transaction_type TEXT;");
    await db.execAsync("PRAGMA user_version = 1;");
  }
}
