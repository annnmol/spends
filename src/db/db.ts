import * as SQLite from "expo-sqlite";

let _db: SQLite.SQLiteDatabase | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (_db) return _db;
  _db = await SQLite.openDatabaseAsync("spends.db");
  await _db.execAsync("PRAGMA journal_mode = WAL;");
  return _db;
}

type Row = Record<string, SQLite.SQLiteBindValue>;

export function parseSlugs(raw: string): string[] {
  try { return JSON.parse(raw || "[]") as string[]; } catch { return []; }
}

export function serializeSlugs(slugs: string[]): string {
  return JSON.stringify(slugs);
}

export async function dbInsert(table: string, data: Row): Promise<number> {
  const db = await getDb();
  const now = Date.now();
  const payload = { ...data, createdAt: now, updatedAt: now };
  const keys = Object.keys(payload);
  const result = await db.runAsync(
    `INSERT INTO ${table} (${keys.join(", ")}) VALUES (${keys.map(() => "?").join(", ")})`,
    Object.values(payload),
  );
  return result.lastInsertRowId;
}

export async function dbBulkInsert(table: string, rows: Row[]): Promise<void> {
  if (rows.length === 0) return;
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    const now = Date.now();
    for (const data of rows) {
      const payload = { ...data, createdAt: now, updatedAt: now };
      const keys = Object.keys(payload);
      await db.runAsync(
        `INSERT INTO ${table} (${keys.join(", ")}) VALUES (${keys.map(() => "?").join(", ")})`,
        Object.values(payload),
      );
    }
  });
}

export async function dbUpdate(table: string, id: number, data: Row): Promise<void> {
  if (Object.keys(data).length === 0) return;
  const db = await getDb();
  const payload = { ...data, updatedAt: Date.now() };
  const entries = Object.entries(payload);
  await db.runAsync(
    `UPDATE ${table} SET ${entries.map(([k]) => `${k} = ?`).join(", ")} WHERE id = ?`,
    [...entries.map(([, v]) => v), id],
  );
}

export async function dbDelete(table: string, id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync(`DELETE FROM ${table} WHERE id = ?`, [id]);
}

export async function dbDeleteAll(table: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(`DELETE FROM ${table}`);
}

export async function dbGetById<T>(table: string, id: number): Promise<T | null> {
  const db = await getDb();
  return (await db.getFirstAsync<T>(`SELECT * FROM ${table} WHERE id = ?`, [id])) ?? null;
}

export async function dbGetAll<T>(table: string, orderBy = "createdAt ASC"): Promise<T[]> {
  const db = await getDb();
  return db.getAllAsync<T>(`SELECT * FROM ${table} ORDER BY ${orderBy}`);
}

export async function dbGetByColumn<T>(table: string, column: string, value: SQLite.SQLiteBindValue): Promise<T[]> {
  const db = await getDb();
  return db.getAllAsync<T>(`SELECT * FROM ${table} WHERE ${column} = ?`, [value]);
}

export async function dbExists(table: string, id: number): Promise<boolean> {
  const db = await getDb();
  const row = await db.getFirstAsync(`SELECT 1 FROM ${table} WHERE id = ? LIMIT 1`, [id]);
  return !!row;
}

export async function dbCount(table: string): Promise<number> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ count: number }>(`SELECT COUNT(*) as count FROM ${table}`);
  return row?.count ?? 0;
}

export async function dbPaginate<T>(table: string, limit: number, offset: number): Promise<T[]> {
  const db = await getDb();
  return db.getAllAsync<T>(`SELECT * FROM ${table} LIMIT ? OFFSET ?`, [limit, offset]);
}

export async function dbSearch<T>(table: string, column: string, query: string): Promise<T[]> {
  const db = await getDb();
  return db.getAllAsync<T>(`SELECT * FROM ${table} WHERE ${column} LIKE ?`, [`%${query}%`]);
}

export async function dbRawQuery<T>(query: string, params: SQLite.SQLiteBindValue[] = []): Promise<T[]> {
  const db = await getDb();
  return db.getAllAsync<T>(query, params);
}

export async function dbRawExecute(query: string, params: SQLite.SQLiteBindValue[] = []): Promise<void> {
  const db = await getDb();
  await db.runAsync(query, params);
}
