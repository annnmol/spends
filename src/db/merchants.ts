import {
  dbDelete,
  dbGetAll,
  dbGetById,
  dbInsert,
  dbUpdate,
  getDb,
  parseSlugs,
  serializeSlugs,
} from "@mobile/db/db";
import { resolveIconKeyFromSlugs } from "@mobile/lib/icon-registry";

export interface Merchant {
  id: number;
  name: string;
  categoryId: number | null;
  iconKey: string | null;
  slugs: string[];
  notes: string | null;
  createdAt: number;
  updatedAt: number;
}

export type CreateMerchantInput = Pick<Merchant, "name"> &
  Partial<Omit<Merchant, "id" | "name" | "createdAt" | "updatedAt">>;

type MerchantRow = Omit<Merchant, "slugs"> & { slugs: string };

function rowToMerchant(row: MerchantRow): Merchant {
  return { ...row, slugs: parseSlugs(row.slugs) };
}

function serialize(
  data: Partial<CreateMerchantInput>,
): Record<string, string | number | null> {
  const { slugs, ...rest } = data;
  const row: Record<string, string | number | null> = {};
  for (const [k, v] of Object.entries(rest))
    row[k] = (v as string | number | null) ?? null;
  if (slugs !== undefined) row.slugs = serializeSlugs(slugs);
  return row;
}

const DEFAULT_MERCHANTS: CreateMerchantInput[] = [
  { name: "Swiggy",  categoryId: 1, slugs: ["swiggy", "instamart", "swiggy instamart", "bundl technologies", "toing"] },
  { name: "Zomato",  categoryId: 1, slugs: ["zomato", "district"] },
  { name: "Blinkit", categoryId: 6, slugs: ["blinkit", "grofers"] },
  { name: "Uber",    categoryId: 2, slugs: ["uber", "uber india", "uber bv"] },
  { name: "Ola",     categoryId: 2, slugs: ["ola", "ola cabs", "ani technologies"] },
  { name: "Amazon",  categoryId: 6, slugs: ["amazon", "amzn", "amazon india", "amazon pay", "amazonpay", "apay balance"] },
];

export async function initMerchantsTable(): Promise<void> {
  const db = await getDb();
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS merchants (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT NOT NULL,
      categoryId INTEGER,
      iconKey    TEXT,
      slugs      TEXT NOT NULL DEFAULT '[]',
      notes      TEXT,
      createdAt  INTEGER NOT NULL,
      updatedAt  INTEGER NOT NULL
    );
  `);
  const row = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM merchants",
  );
  if ((row?.count ?? 0) === 0) {
    await Promise.all(DEFAULT_MERCHANTS.map((m) => addMerchant(m)));
  }
}

export async function addMerchant(data: CreateMerchantInput): Promise<number> {
  const slugs = data.slugs ?? [];
  return dbInsert("merchants", serialize({
    name: data.name,
    categoryId: data.categoryId ?? null,
    iconKey: data.iconKey ?? resolveIconKeyFromSlugs(slugs),
    slugs,
    notes: data.notes ?? null,
  }));
}

export async function updateMerchant(
  id: number,
  data: Partial<CreateMerchantInput>,
): Promise<void> {
  const payload = { ...data };
  if (data.slugs !== undefined && !("iconKey" in data)) {
    payload.iconKey = resolveIconKeyFromSlugs(data.slugs);
  }
  return dbUpdate("merchants", id, serialize(payload));
}

export async function deleteMerchant(id: number): Promise<void> {
  return dbDelete("merchants", id);
}

export async function getMerchantById(id: number): Promise<Merchant | null> {
  const row = await dbGetById<MerchantRow>("merchants", id);
  return row ? rowToMerchant(row) : null;
}

export async function getAllMerchants(): Promise<Merchant[]> {
  const rows = await dbGetAll<MerchantRow>("merchants","updatedAt DESC");
  return rows.map(rowToMerchant);
}
