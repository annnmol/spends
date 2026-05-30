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
    CREATE TABLE IF NOT EXISTS accounts (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      name         TEXT NOT NULL,
      type         TEXT NOT NULL DEFAULT 'other',
      bank_name    TEXT,
      last4        TEXT,
      slugs        TEXT NOT NULL DEFAULT '[]',
      billing_date INTEGER,
      due_date     INTEGER,
      icon         TEXT,
      color        TEXT,
      notes        TEXT,
      created_at   INTEGER NOT NULL,
      updated_at   INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS merchants (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      name         TEXT NOT NULL,
      category     TEXT NOT NULL DEFAULT 'other',
      slugs        TEXT NOT NULL DEFAULT '[]',
      notes        TEXT,
      created_at   INTEGER NOT NULL,
      updated_at   INTEGER NOT NULL
    );
  `);
  await _runMigrations(_db);
  return _db;
}

async function _runMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ user_version: number }>("PRAGMA user_version");
  const version = row?.user_version ?? 0;

  if (version < 1) {
    await db.execAsync("ALTER TABLE transactions ADD COLUMN transaction_type TEXT;");
    await db.execAsync("PRAGMA user_version = 1;");
  }

  if (version < 2) {
    await db.execAsync("ALTER TABLE transactions ADD COLUMN account_id INTEGER REFERENCES accounts(id);");
    await db.execAsync("PRAGMA user_version = 2;");
  }

  if (version < 3) {
    await db.execAsync("ALTER TABLE transactions ADD COLUMN source_type TEXT;");
    await db.execAsync("ALTER TABLE transactions ADD COLUMN confidence TEXT;");
    await db.execAsync("ALTER TABLE transactions ADD COLUMN status TEXT DEFAULT 'active';");
    await db.execAsync("PRAGMA user_version = 3;");
  }

  if (version < 4) {
    await db.execAsync("ALTER TABLE transactions ADD COLUMN merchant_id INTEGER REFERENCES merchants(id);");
    await db.execAsync("PRAGMA user_version = 4;");
  }
}
