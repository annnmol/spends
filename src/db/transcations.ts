import { dbDelete, dbDeleteAll, dbGetAll, dbGetById, dbGetByColumn, dbInsert, dbUpdate, getDb } from "@mobile/db/db";
import type { Account } from "@mobile/db/accounts";
import type { Merchant } from "@mobile/db/merchants";
import { checkFinancialSms } from "@mobile/lib/smsFilter";
import { matchSmsToAccount } from "@mobile/lib/smsAccountMatcher";
import { matchSmsToMerchant } from "@mobile/lib/smsMerchantMatcher";
import { parseTransactionSms } from "@mobile/lib/parseTransactionSms";
import type { SmsMessage } from "@root/modules/sms-module";

export type TransactionType =
  | "DEBIT"
  | "CREDIT"
  | "REFUND"
  | "PAYMENT"
  | "STATEMENT"
  | "UNKNOWN";

export type SourceType = "BANK" | "CARD" | "UPI";

export type Confidence = "HIGH" | "MEDIUM" | "LOW";

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

function smsHash(sender: string, body: string): string {
  let h = 5381;
  const s = sender + "|" + body;
  for (let i = 0; i < s.length; i++) h = (Math.imul(h, 33) ^ s.charCodeAt(i)) >>> 0;
  return h.toString(16);
}

export async function saveTransaction(
  msg: SmsMessage,
  accounts: Account[] = [],
  merchants: Merchant[] = [],
): Promise<void> {
  if (!checkFinancialSms(msg.sender, msg.body).pass) return;

  const { accountId } = matchSmsToAccount(msg.body, msg.sender, accounts);
  const { merchantId, categoryId, merchantName } = matchSmsToMerchant(msg.body, merchants);
  const parsed = parseTransactionSms(msg.body, msg.sender);
  const smsId = msg.id?.trim() || smsHash(msg.sender, msg.body);

  const db = await getDb();
  const now = Date.now();
  await db.runAsync(
    `INSERT OR IGNORE INTO transactions
     (smsId, sender, body, timestamp, transactionType, sourceType, confidence, status,
      amount, accountId, merchantId, merchantName, categoryId, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    smsId, msg.sender, msg.body, msg.timestamp,
    parsed.transactionType.toUpperCase(), parsed.sourceType, parsed.confidence,
    "ACTIVE", parsed.amount ?? null,
    accountId ?? null, merchantId ?? null, merchantName ?? null, categoryId ?? null,
    now, now,
  );
}

export async function saveTransactions(
  msgs: SmsMessage[],
  accounts: Account[] = [],
  merchants: Merchant[] = [],
): Promise<void> {
  await Promise.all(msgs.map((msg) => saveTransaction(msg, accounts, merchants)));
}

export async function clearAllTransactions(): Promise<void> {
  return dbDeleteAll("transactions");
}
