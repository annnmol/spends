import { getDb } from "./db";

export type AccountType =
  | "credit_card"
  | "debit_card"
  | "bank_account"
  | "upi"
  | "wallet"
  | "other";

export type Account = {
  id: number;
  name: string;
  type: AccountType;
  bankName: string | null;
  last4: string | null;
  slugs: string[];
  billingDate: number | null;
  dueDate: number | null;
  icon: string | null;
  color: string | null;
  notes: string | null;
  createdAt: number;
  updatedAt: number;
};

export type CreateAccountInput = {
  name: string;
  type: AccountType;
  bankName?: string | null;
  last4?: string | null;
  slugs?: string[];
  billingDate?: number | null;
  dueDate?: number | null;
  icon?: string | null;
  color?: string | null;
  notes?: string | null;
};

type AccountRow = {
  id: number;
  name: string;
  type: string;
  bank_name: string | null;
  last4: string | null;
  slugs: string;
  billing_date: number | null;
  due_date: number | null;
  icon: string | null;
  color: string | null;
  notes: string | null;
  created_at: number;
  updated_at: number;
};

function rowToAccount(row: AccountRow): Account {
  return {
    id: row.id,
    name: row.name,
    type: row.type as AccountType,
    bankName: row.bank_name,
    last4: row.last4,
    slugs: (() => {
      try {
        return JSON.parse(row.slugs || "[]") as string[];
      } catch {
        return [];
      }
    })(),
    billingDate: row.billing_date,
    dueDate: row.due_date,
    icon: row.icon,
    color: row.color,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createAccount(data: CreateAccountInput): Promise<number> {
  const db = await getDb();
  const now = Date.now();
  const result = await db.runAsync(
    `INSERT INTO accounts
       (name, type, bank_name, last4, slugs, billing_date, due_date, icon, color, notes, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    data.name,
    data.type,
    data.bankName ?? null,
    data.last4 ?? null,
    JSON.stringify(data.slugs ?? []),
    data.billingDate ?? null,
    data.dueDate ?? null,
    data.icon ?? null,
    data.color ?? null,
    data.notes ?? null,
    now,
    now,
  );
  return result.lastInsertRowId;
}

export async function updateAccount(
  id: number,
  data: Partial<CreateAccountInput>,
): Promise<void> {
  const db = await getDb();
  const now = Date.now();
  const fields: string[] = [];
  const values: unknown[] = [];

  if (data.name !== undefined) { fields.push("name = ?"); values.push(data.name); }
  if (data.type !== undefined) { fields.push("type = ?"); values.push(data.type); }
  if ("bankName" in data) { fields.push("bank_name = ?"); values.push(data.bankName ?? null); }
  if ("last4" in data) { fields.push("last4 = ?"); values.push(data.last4 ?? null); }
  if (data.slugs !== undefined) { fields.push("slugs = ?"); values.push(JSON.stringify(data.slugs)); }
  if ("billingDate" in data) { fields.push("billing_date = ?"); values.push(data.billingDate ?? null); }
  if ("dueDate" in data) { fields.push("due_date = ?"); values.push(data.dueDate ?? null); }
  if ("icon" in data) { fields.push("icon = ?"); values.push(data.icon ?? null); }
  if ("color" in data) { fields.push("color = ?"); values.push(data.color ?? null); }
  if ("notes" in data) { fields.push("notes = ?"); values.push(data.notes ?? null); }

  if (fields.length === 0) return;
  fields.push("updated_at = ?");
  values.push(now, id);

  await db.runAsync(
    `UPDATE accounts SET ${fields.join(", ")} WHERE id = ?`,
    ...values,
  );
}

export async function deleteAccount(id: number): Promise<void> {
  const db = await getDb();
  // Unlink transactions before deleting
  await db.runAsync("UPDATE transactions SET account_id = NULL WHERE account_id = ?", id);
  await db.runAsync("DELETE FROM accounts WHERE id = ?", id);
}

export async function loadAccounts(): Promise<Account[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<AccountRow>(
    "SELECT * FROM accounts ORDER BY created_at DESC",
  );
  return rows.map(rowToAccount);
}

export async function getAccountById(id: number): Promise<Account | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<AccountRow>(
    "SELECT * FROM accounts WHERE id = ?",
    id,
  );
  return row ? rowToAccount(row) : null;
}

export async function clearAllAccounts(): Promise<void> {
  const db = await getDb();
  await db.runAsync("DELETE FROM accounts");
}
