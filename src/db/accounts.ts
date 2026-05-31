import { dbDelete, dbDeleteAll, dbGetAll, dbGetById, dbInsert, dbRawExecute, dbRawQuery, dbUpdate, getDb, parseSlugs, serializeSlugs } from "@mobile/db/db";
import { resolveIconKeyFromSlugs } from "@mobile/lib/icon-registry";

export type AccountType =
  | "credit_card"
  | "debit_card"
  | "bank_account"
  | "upi"
  | "wallet"
  | "other";

export interface Account {
  id: number;
  name: string;
  type: AccountType;
  bankName: string | null;
  last4digits: string | null;
  slugs: string[];
  billingDate: number | null;
  dueDate: number | null;
  iconKey: string | null;
  color: string | null;
  notes: string | null;
  createdAt: number;
  updatedAt: number;
}

export type CreateAccountInput =
  Pick<Account, "name" | "type"> &
  Partial<Omit<Account, "id" | "name" | "type" | "createdAt" | "updatedAt">>;

type AccountRow = Omit<Account, "slugs"> & { slugs: string };

function rowToAccount(row: AccountRow): Account {
  return { ...row, slugs: parseSlugs(row.slugs) };
}

function serialize(data: Partial<CreateAccountInput>): Record<string, string | number | null> {
  const { slugs, ...rest } = data;
  const row: Record<string, string | number | null> = {};
  for (const [k, v] of Object.entries(rest)) row[k] = (v as string | number | null) ?? null;
  if (slugs !== undefined) row.slugs = serializeSlugs(slugs);
  return row;
}

const DEFAULT_ACCOUNTS: CreateAccountInput[] = [
  { name: "HDFC Credit Card",    type: "credit_card",  bankName: "HDFC Bank",          slugs: ["hdfc", "credit", "hdfcbank"],           color: "#003DA5" },
  { name: "SBI Savings Account", type: "bank_account", bankName: "State Bank of India", slugs: ["sbi", "savings", "statebank"],           color: "#22409A" },
  { name: "Google Pay",          type: "upi",                                            slugs: ["gpay", "googlepay", "upi", "googlepay"], color: "#4285F4" },
];

export async function initAccountsTable(): Promise<void> {
  const db = await getDb();
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS accounts (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT NOT NULL,
      type        TEXT NOT NULL DEFAULT 'other',
      bankName    TEXT,
      last4digits TEXT,
      slugs       TEXT NOT NULL DEFAULT '[]',
      billingDate INTEGER,
      dueDate     INTEGER,
      iconKey     TEXT,
      color       TEXT,
      notes       TEXT,
      createdAt   INTEGER NOT NULL,
      updatedAt   INTEGER NOT NULL
    );
  `);
  const row = await db.getFirstAsync<{ count: number }>("SELECT COUNT(*) as count FROM accounts");
  if ((row?.count ?? 0) === 0) {
    await Promise.all(DEFAULT_ACCOUNTS.map((a) => addAccount(a)));
  }
}

export async function addAccount(data: CreateAccountInput): Promise<number> {
  const slugs = data.slugs ?? [];
  return dbInsert("accounts", serialize({
    name: data.name, type: data.type,
    bankName: data.bankName ?? null, last4digits: data.last4digits ?? null,
    slugs, billingDate: data.billingDate ?? null,
    dueDate: data.dueDate ?? null,
    iconKey: data.iconKey ?? resolveIconKeyFromSlugs(slugs),
    color: data.color ?? null, notes: data.notes ?? null,
  }));
}

export async function updateAccount(id: number, data: Partial<CreateAccountInput>): Promise<void> {
  const payload = { ...data };
  if (data.slugs !== undefined && !("iconKey" in data)) {
    payload.iconKey = resolveIconKeyFromSlugs(data.slugs);
  }
  return dbUpdate("accounts", id, serialize(payload));
}

export async function deleteAccount(id: number): Promise<void> {
  return dbDelete("accounts", id);
}

export async function getAccountById(id: number): Promise<Account | null> {
  const row = await dbGetById<AccountRow>("accounts", id);
  return row ? rowToAccount(row) : null;
}

export async function getAllAccounts(): Promise<Account[]> {
  const rows = await dbGetAll<AccountRow>("accounts", "updatedAt DESC");
  return rows.map(rowToAccount);
}

export function matchAccount(accounts: Account[], body: string): number | null {
  if (!accounts.length) return null;
  const upper = body.toUpperCase();
  const last4Match = accounts.find((a) => a.last4digits && upper.includes(a.last4digits));
  if (last4Match) return last4Match.id;
  const slugMatch = accounts.find((a) =>
    a.slugs.some((s) => s.length >= 4 && upper.includes(s.toUpperCase())),
  );
  return slugMatch?.id ?? null;
}

export async function unlinkTransactionsForAccount(accountId: number): Promise<void> {
  await dbRawExecute("UPDATE transactions SET accountId = NULL WHERE accountId = ?", [accountId]);
}

export async function linkAllUnlinkedTransactions(accounts: Account[]): Promise<void> {
  if (!accounts.length) return;
  const rows = await dbRawQuery<{ id: number; body: string }>(
    "SELECT id, body FROM transactions WHERE accountId IS NULL",
  );
  for (const row of rows) {
    const accountId = matchAccount(accounts, row.body);
    if (accountId !== null) {
      await dbRawExecute("UPDATE transactions SET accountId = ? WHERE id = ?", [accountId, row.id]);
    }
  }
}

export async function clearAllAccounts(): Promise<void> {
  await dbRawExecute("UPDATE transactions SET accountId = NULL");
  await dbDeleteAll("accounts");
}
