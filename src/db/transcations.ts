import { dbDelete, dbGetAll, dbGetById, dbGetByColumn, dbInsert, dbUpdate, getDb } from "@mobile/db/db";

export type TransactionType =
  | "DEBIT"
  | "CREDIT"
  | "REFUND"
  | "PAYMENT"
  | "STATEMENT"
  | "OTP"
  | "UNKNOWN";

export type SourceType =
  | "BANK"
  | "CARD"
  | "UPI"
  | "MERCHANT"
  | "OTP"
  | "OTHER";

export type Confidence = "HIGH" | "MEDIUM" | "LOW" | "NONE";

export type TransactionStatus = "ACTIVE" | "ARCHIVED" | "DUPLICATE" | "IGNORED";

export interface Transaction {
  id: number;
  smsId: string;
  sender: string;
  body: string;
  timestamp: number;
  accountId: number | null;
  merchantId: number | null;
  merchantName: string | null;
  categoryId: number | null;
  transactionType: TransactionType;
  sourceType: SourceType;
  confidence: Confidence;
  status: TransactionStatus;
  amount: number | null;
  isRecurring: number | null;
  createdAt: number;
  updatedAt: number;
}

export type CreateTransactionInput =
  Pick<Transaction, "smsId" | "sender" | "body" | "timestamp" | "transactionType" | "sourceType" | "confidence"> &
  Partial<Omit<Transaction, "id" | "smsId" | "sender" | "body" | "timestamp" | "transactionType" | "sourceType" | "confidence" | "createdAt" | "updatedAt">>;

function serialize(data: Partial<CreateTransactionInput>): Record<string, string | number | null> {
  const row: Record<string, string | number | null> = {};
  for (const [k, v] of Object.entries(data)) row[k] = (v as string | number | null) ?? null;
  return row;
}

export async function initTransactionsTable(): Promise<void> {
  const db = await getDb();
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS transactions (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      smsId           TEXT NOT NULL UNIQUE,
      sender          TEXT NOT NULL,
      body            TEXT NOT NULL,
      timestamp       INTEGER NOT NULL,
      accountId       INTEGER,
      merchantId      INTEGER,
      merchantName    TEXT,
      categoryId      INTEGER,
      transactionType TEXT NOT NULL DEFAULT 'UNKNOWN',
      sourceType      TEXT NOT NULL DEFAULT 'OTHER',
      confidence      TEXT NOT NULL DEFAULT 'NONE',
      status          TEXT NOT NULL DEFAULT 'ACTIVE',
      amount          REAL,
      isRecurring     INTEGER,
      createdAt       INTEGER NOT NULL,
      updatedAt       INTEGER NOT NULL
    );
  `);
}

export async function addTransaction(data: CreateTransactionInput): Promise<number> {
  return dbInsert("transactions", serialize({
    smsId: data.smsId,
    sender: data.sender,
    body: data.body,
    timestamp: data.timestamp,
    transactionType: data.transactionType,
    sourceType: data.sourceType,
    confidence: data.confidence,
    status: data.status ?? "ACTIVE",
    accountId: data.accountId ?? null,
    merchantId: data.merchantId ?? null,
    merchantName: data.merchantName ?? null,
    categoryId: data.categoryId ?? null,
    amount: data.amount ?? null,
    isRecurring: data.isRecurring ?? null,
  }));
}

export async function updateTransaction(
  id: number,
  data: Partial<CreateTransactionInput>,
): Promise<void> {
  return dbUpdate("transactions", id, serialize(data));
}

export async function deleteTransaction(id: number): Promise<void> {
  return dbDelete("transactions", id);
}

export async function getTransactionById(id: number): Promise<Transaction | null> {
  return dbGetById<Transaction>("transactions", id);
}

export async function getAllTransactions(): Promise<Transaction[]> {
  return dbGetAll<Transaction>("transactions", "timestamp DESC");
}

export async function getTransactionsByAccountId(accountId: number): Promise<Transaction[]> {
  return dbGetByColumn<Transaction>("transactions", "accountId", accountId);
}

export async function getTransactionsByMerchantId(merchantId: number): Promise<Transaction[]> {
  return dbGetByColumn<Transaction>("transactions", "merchantId", merchantId);
}

export async function getTransactionsByStatus(status: TransactionStatus): Promise<Transaction[]> {
  return dbGetByColumn<Transaction>("transactions", "status", status);
}
