import { getDb } from "./db";

export type MerchantCategory =
  | "food"
  | "transport"
  | "entertainment"
  | "subscription"
  | "utilities"
  | "shopping"
  | "other";

export type Merchant = {
  id: number;
  name: string;
  category: MerchantCategory;
  slugs: string[];
  notes: string | null;
  createdAt: number;
  updatedAt: number;
};

export type CreateMerchantInput = {
  name: string;
  category: MerchantCategory;
  slugs?: string[];
  notes?: string | null;
};

export type DetectedMerchant = CreateMerchantInput & {
  txnCount: number;
  totalSpend: number;
};

type MerchantRow = {
  id: number;
  name: string;
  category: string;
  slugs: string;
  notes: string | null;
  created_at: number;
  updated_at: number;
};

function rowToMerchant(row: MerchantRow): Merchant {
  return {
    id: row.id,
    name: row.name,
    category: row.category as MerchantCategory,
    slugs: (() => {
      try { return JSON.parse(row.slugs || "[]") as string[]; }
      catch { return []; }
    })(),
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function guessMerchantCategory(name: string): MerchantCategory {
  const n = name.toUpperCase();
  if (/SWIGGY|ZOMATO|DOMINOS|PIZZA|MCDONALDS|KFC|STARBUCKS|BURGER|FOOD|EATERY/.test(n)) return "food";
  if (/UBER|OLA|RAPIDO|METRO|RAILWAY|IRCTC|MAKEMYTRIP|GOIBIBO|REDBUS|IXIGO/.test(n)) return "transport";
  if (/NETFLIX|HOTSTAR|PRIMEVIDEO|SPOTIFY|YOUTUBE|BOOKMYSHOW|ZEE5|SONYLIV|HUNGAMA/.test(n)) return "entertainment";
  if (/AMAZON PRIME|ICLOUD|GOOGLE ONE|MICROSOFT|ADOBE|DROPBOX/.test(n)) return "subscription";
  if (/ELECTRICITY|GAS|WATER|BROADBAND|AIRTEL|JIO|BSNL|TATA SKY|DISH TV|RECHARGE/.test(n)) return "utilities";
  if (/AMAZON|FLIPKART|MYNTRA|MEESHO|NYKAA|AJIO/.test(n)) return "shopping";
  return "other";
}

export function matchMerchant(merchants: Merchant[], body: string): number | null {
  if (merchants.length === 0) return null;
  const bodyUpper = body.toUpperCase();
  const match = merchants.find((m) =>
    m.slugs.some((s) => s.length >= 3 && bodyUpper.includes(s.toUpperCase())),
  );
  return match ? match.id : null;
}

export async function createMerchant(data: CreateMerchantInput): Promise<number> {
  const db = await getDb();
  const now = Date.now();
  const result = await db.runAsync(
    `INSERT INTO merchants (name, category, slugs, notes, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    data.name,
    data.category,
    JSON.stringify(data.slugs?.length ? data.slugs : [data.name.toUpperCase()]),
    data.notes ?? null,
    now,
    now,
  );
  return result.lastInsertRowId;
}

export async function updateMerchant(
  id: number,
  data: Partial<CreateMerchantInput>,
): Promise<void> {
  const db = await getDb();
  const now = Date.now();
  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  if (data.name !== undefined) { fields.push("name = ?"); values.push(data.name); }
  if (data.category !== undefined) { fields.push("category = ?"); values.push(data.category); }
  if (data.slugs !== undefined) { fields.push("slugs = ?"); values.push(JSON.stringify(data.slugs)); }
  if ("notes" in data) { fields.push("notes = ?"); values.push(data.notes ?? null); }

  if (fields.length === 0) return;
  fields.push("updated_at = ?");
  values.push(now, id);

  await db.runAsync(`UPDATE merchants SET ${fields.join(", ")} WHERE id = ?`, ...values);
}

export async function deleteMerchant(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync("UPDATE transactions SET merchant_id = NULL WHERE merchant_id = ?", id);
  await db.runAsync("DELETE FROM merchants WHERE id = ?", id);
}

export async function loadMerchants(): Promise<Merchant[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<MerchantRow>(
    "SELECT id, name, category, slugs, notes, created_at, updated_at FROM merchants ORDER BY created_at DESC",
  );
  return rows.map(rowToMerchant);
}

export async function unlinkTransactionsForMerchant(merchantId: number): Promise<void> {
  const db = await getDb();
  await db.runAsync("UPDATE transactions SET merchant_id = NULL WHERE merchant_id = ?", merchantId);
}

export async function linkAllUnlinkedMerchants(merchants: Merchant[]): Promise<void> {
  if (merchants.length === 0) return;
  const db = await getDb();
  const rows = await db.getAllAsync<{ id: number; raw_sms: string }>(
    "SELECT id, raw_sms FROM transactions WHERE merchant_id IS NULL AND category = 'financial' AND account_id IS NOT NULL",
  );
  for (const row of rows) {
    const merchantId = matchMerchant(merchants, row.raw_sms);
    if (merchantId !== null) {
      await db.runAsync("UPDATE transactions SET merchant_id = ? WHERE id = ?", merchantId, row.id);
    }
  }
}

export async function detectMerchantsFromTransactions(): Promise<DetectedMerchant[]> {
  const db = await getDb();

  const existing = await db.getAllAsync<{ name: string }>("SELECT name FROM merchants");
  const existingNames = new Set(existing.map((r) => r.name.toUpperCase()));

  const rows = await db.getAllAsync<{ merchant: string; amount: number | null }>(
    "SELECT merchant, amount FROM transactions WHERE category = 'financial' AND merchant IS NOT NULL AND account_id IS NOT NULL",
  );

  type Group = { count: number; totalSpend: number };
  const groups = new Map<string, Group>();

  for (const row of rows) {
    const key = row.merchant.toUpperCase();
    if (!groups.has(key)) groups.set(key, { count: 0, totalSpend: 0 });
    const g = groups.get(key)!;
    g.count++;
    if (row.amount) g.totalSpend += row.amount;
  }

  const results: DetectedMerchant[] = [];

  for (const [key, g] of groups.entries()) {
    if (existingNames.has(key)) continue;
    const displayName = key.charAt(0) + key.slice(1).toLowerCase();
    results.push({
      name: displayName,
      category: guessMerchantCategory(key),
      slugs: [key],
      txnCount: g.count,
      totalSpend: g.totalSpend,
    });
  }

  return results.sort((a, b) => b.txnCount - a.txnCount);
}

export async function clearAllMerchants(): Promise<void> {
  const db = await getDb();
  await db.runAsync("UPDATE transactions SET merchant_id = NULL");
  await db.runAsync("DELETE FROM merchants");
}
