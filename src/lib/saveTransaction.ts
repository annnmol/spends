import type { SmsMessage } from "../../modules/sms-module";
import { getDb } from "./db";
import { parseTransactionSms } from "./parseTransactionSms";

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
): Promise<void> {
  const parsed = parseTransactionSms(msg.body, msg.sender);
  if (parsed.category === "otp") return; // OTP messages never create transactions
  const db = await getDb();
  const hash = messageHash(msg.sender, msg.body);
  await db.runAsync(
    `INSERT OR IGNORE INTO transactions
       (sms_id, message_hash, amount, merchant, card_last4, upi_ref,
        category, transaction_type, timestamp, sender, raw_sms)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
  );
}

export async function saveTransactions(
  msgs: SmsMessage[],
  useInboxId: boolean,
): Promise<void> {
  await Promise.all(
    msgs.map((msg) => saveTransaction(msg, useInboxId ? msg.id : null)),
  );
}

type TransactionRow = {
  sms_id: string | null;
  message_hash: string;
  sender: string;
  raw_sms: string;
  timestamp: number;
  transaction_type: string | null;
};

export async function clearAllTransactions(): Promise<void> {
  const db = await getDb();
  await db.runAsync("DELETE FROM transactions");
}

export async function loadTransactions(): Promise<SmsMessage[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<TransactionRow>(
    "SELECT * FROM transactions ORDER BY timestamp DESC",
    // "SELECT sms_id, message_hash, sender, raw_sms, timestamp FROM transactions ORDER BY timestamp DESC"
  );

  return rows.map((row) => ({
    id: row.sms_id ?? row.message_hash,
    sender: row.sender,
    body: row.raw_sms,
    timestamp: row.timestamp,
  }));
}
