import type { SmsMessage } from "../../modules/sms-module";
import type { Account } from "./accounts";
import { getDb } from "./db";
import { matchAccount } from "./matchAccount";
// import { matchMerchant, type Merchant } from "./merchants"; // v2: merchants disabled
import { parseTransactionSms } from "./parseTransactionSms";

export type Transaction = {
  id: string;
  sender: string;
  body: string;
  timestamp: number;
  accountId: number | null;
  merchantId: number | null;
  transactionType: string;
  category: string;
  amount: number | null;
  merchant: string | null;
  sourceType: string;
  confidence: string;
  status: string;
};

function djb2(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(h, 33) ^ s.charCodeAt(i)) >>> 0;
  }
  return h.toString(16);
}

function messageHash(sender: string, body: string): string {
  return djb2(sender + "|" + body);
}

export async function saveTransaction(
  msg: SmsMessage,
  smsId: string | null,
  accounts: Account[] = [],
  // merchants: Merchant[] = [], // v2: merchants disabled
): Promise<void> {
  const parsed = parseTransactionSms(msg.body, msg.sender);
  if (parsed.sourceType === "OTP" || parsed.sourceType === "SYSTEM") return;
  const db = await getDb();
  const hash = messageHash(msg.sender, msg.body);
  const result = await db.runAsync(
    `INSERT OR IGNORE INTO transactions
       (sms_id, message_hash, amount, merchant, card_last4, upi_ref,
        category, transaction_type, timestamp, sender, raw_sms,
        source_type, confidence, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    smsId,
    hash,
    parsed.amount ?? null,
    parsed.merchant ?? null,
    parsed.cardLast4 ?? null,
    parsed.upiRef ?? null,
    parsed.category,
    parsed.transactionType,
    msg.timestamp,
    msg.sender,
    msg.body,
    parsed.sourceType,
    parsed.confidence,
    "active",
  );
  if (result.changes > 0) {
    let linkedAccountId: number | null = null;
    if (accounts.length > 0) {
      linkedAccountId = matchAccount(accounts, parsed.cardLast4, parsed.upiRef, msg.body);
      if (linkedAccountId !== null) {
        await db.runAsync("UPDATE transactions SET account_id = ? WHERE id = ?", linkedAccountId, result.lastInsertRowId);
      }
    }
    // v2: merchant matching disabled
    // if (merchants.length > 0 && linkedAccountId !== null) {
    //   const merchantId = matchMerchant(merchants, msg.body);
    //   if (merchantId !== null) {
    //     await db.runAsync("UPDATE transactions SET merchant_id = ? WHERE id = ?", merchantId, result.lastInsertRowId);
    //   }
    // }
  }
}

export async function linkAllUnlinkedTransactions(accounts: Account[]): Promise<void> {
  if (accounts.length === 0) return;
  const db = await getDb();
  const rows = await db.getAllAsync<{
    id: number;
    card_last4: string | null;
    upi_ref: string | null;
    raw_sms: string;
  }>(
    "SELECT id, card_last4, upi_ref, raw_sms FROM transactions WHERE account_id IS NULL AND category = 'financial'",
  );
  for (const row of rows) {
    const accountId = matchAccount(accounts, row.card_last4, row.upi_ref, row.raw_sms);
    if (accountId !== null) {
      await db.runAsync(
        "UPDATE transactions SET account_id = ? WHERE id = ?",
        accountId,
        row.id,
      );
    }
  }
}

export async function saveTransactions(
  msgs: SmsMessage[],
  useInboxId: boolean,
  accounts: Account[] = [],
  // merchants: Merchant[] = [], // v2: merchants disabled
): Promise<void> {
  await Promise.all(
    msgs.map((msg) => saveTransaction(msg, useInboxId ? msg.id : null, accounts)),
  );
}

type TransactionRow = {
  sms_id: string | null;
  message_hash: string;
  sender: string;
  raw_sms: string;
  timestamp: number;
  transaction_type: string | null;
  category: string | null;
  amount: number | null;
  merchant: string | null;
  account_id: number | null;
  merchant_id: number | null;
  source_type: string | null;
  confidence: string | null;
  status: string | null;
};

export async function unlinkTransactionsForAccount(accountId: number): Promise<void> {
  const db = await getDb();
  await db.runAsync("UPDATE transactions SET account_id = NULL WHERE account_id = ?", accountId);
}

export async function clearAllTransactions(): Promise<void> {
  const db = await getDb();
  await db.runAsync("DELETE FROM transactions");
}

export async function loadTransactions(): Promise<Transaction[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<TransactionRow>(
    "SELECT sms_id, message_hash, sender, raw_sms, timestamp, transaction_type, category, amount, merchant, account_id, merchant_id, source_type, confidence, status FROM transactions ORDER BY timestamp DESC",
  );
  return rows.map((row) => ({
    id: row.sms_id ?? row.message_hash,
    sender: row.sender,
    body: row.raw_sms,
    timestamp: row.timestamp,
    accountId: row.account_id ?? null,
    merchantId: row.merchant_id ?? null,
    transactionType: row.transaction_type ?? "unknown",
    category: row.category ?? "unknown",
    amount: row.amount ?? null,
    merchant: row.merchant ?? null,
    sourceType: row.source_type ?? "BANK",
    confidence: row.confidence ?? "HIGH",
    status: row.status ?? "active",
  }));
}
