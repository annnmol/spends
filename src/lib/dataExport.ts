import * as DocumentPicker from "expo-document-picker";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";

import { getDb } from "@mobile/db/db";

const EXPORT_VERSION = 1;

type RawRow = Record<string, string | number | null>;

type ExportPayload = {
  version: number;
  exportedAt: number;
  transactions: RawRow[];
  accounts: RawRow[];
  merchants: RawRow[];
};

export type ImportCounts = {
  transactions: number;
  accounts: number;
  merchants: number;
};

export async function exportData(): Promise<void> {
  const db = await getDb();
  const [transactions, accounts, merchants] = await Promise.all([
    db.getAllAsync<RawRow>("SELECT * FROM transactions ORDER BY timestamp DESC"),
    db.getAllAsync<RawRow>("SELECT * FROM accounts ORDER BY createdAt ASC"),
    db.getAllAsync<RawRow>("SELECT * FROM merchants ORDER BY createdAt ASC"),
  ]);

  const payload: ExportPayload = {
    version: EXPORT_VERSION,
    exportedAt: Date.now(),
    transactions,
    accounts,
    merchants,
  };

  const date = new Date().toISOString().slice(0, 10);
  const filename = `spends-backup-${date}.json`;
  const file = new File(Paths.cache, filename);
  if (!file.exists) file.create();
  file.write(JSON.stringify(payload));

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, {
      mimeType: "application/json",
      dialogTitle: "Export Spends Backup",
    });
  }
}

// Returns null if the user cancelled the picker, counts on success, throws on bad file.
export async function importData(): Promise<ImportCounts | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ["application/json", "text/plain", "*/*"],
    copyToCacheDirectory: true,
  });

  if (result.canceled || !result.assets?.[0]) return null;

  const pickedFile = new File(result.assets[0].uri);
  const content = pickedFile.textSync();
  const payload: ExportPayload = JSON.parse(content);

  if (
    typeof payload.version !== "number" ||
    !Array.isArray(payload.transactions) ||
    !Array.isArray(payload.accounts) ||
    !Array.isArray(payload.merchants)
  ) {
    throw new Error("Invalid backup file.");
  }

  const db = await getDb();

  await db.withTransactionAsync(async () => {
    await db.runAsync("DELETE FROM transactions");
    await db.runAsync("DELETE FROM accounts");
    await db.runAsync("DELETE FROM merchants");

    for (const a of payload.accounts) {
      await db.runAsync(
        `INSERT OR REPLACE INTO accounts
         (id, name, type, bankName, last4digits, slugs, billingDate, dueDate, iconKey, color, notes, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [a.id, a.name, a.type, a.bankName ?? null, a.last4digits ?? null, a.slugs ?? "[]",
         a.billingDate ?? null, a.dueDate ?? null, a.iconKey ?? null, a.color ?? null, a.notes ?? null,
         a.createdAt, a.updatedAt],
      );
    }

    for (const m of payload.merchants) {
      await db.runAsync(
        `INSERT OR REPLACE INTO merchants
         (id, name, categoryId, iconKey, slugs, notes, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [m.id, m.name, m.categoryId ?? null, m.iconKey ?? null, m.slugs ?? "[]",
         m.notes ?? null, m.createdAt, m.updatedAt],
      );
    }

    for (const t of payload.transactions) {
      await db.runAsync(
        `INSERT OR REPLACE INTO transactions
         (id, smsId, sender, body, timestamp, accountId, merchantId, merchantName, categoryId,
          transactionType, sourceType, confidence, status, amount, isRecurring, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [t.id, t.smsId, t.sender, t.body, t.timestamp,
         t.accountId ?? null, t.merchantId ?? null, t.merchantName ?? null, t.categoryId ?? null,
         t.transactionType, t.sourceType, t.confidence, t.status,
         t.amount ?? null, t.isRecurring ?? null,
         t.createdAt, t.updatedAt],
      );
    }
  });

  return {
    transactions: payload.transactions.length,
    accounts: payload.accounts.length,
    merchants: payload.merchants.length,
  };
}
