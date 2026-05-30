import type { AccountType, CreateAccountInput } from "./accounts";
import { getDb } from "./db";

type TxRow = {
  sender: string;
  card_last4: string | null;
  upi_ref: string | null;
};

export type DetectedAccount = CreateAccountInput & { txnCount: number };

function guessBankName(sender: string): string | null {
  const id = sender.replace(/^[A-Z]{2}-/i, "").toUpperCase();
  if (id.includes("HDFC")) return "HDFC Bank";
  if (id.includes("ICICI")) return "ICICI Bank";
  if (id.includes("AXIS")) return "Axis Bank";
  if (id.includes("KOTAK")) return "Kotak Bank";
  if (id.includes("SBII") || id.includes("SBIP") || id.includes("SBIC") || id.includes("SBIU")) return "State Bank of India";
  if (id.includes("PNB")) return "Punjab National Bank";
  if (id.includes("BOI") || id.includes("BOIS")) return "Bank of India";
  if (id.includes("CANARA") || id.includes("CNR")) return "Canara Bank";
  if (id.includes("UNION")) return "Union Bank";
  if (id.includes("INDUS")) return "IndusInd Bank";
  if (id.includes("IDFC")) return "IDFC First Bank";
  if (id.includes("RBL")) return "RBL Bank";
  if (id.includes("YES") && id.includes("BK")) return "Yes Bank";
  if (id.includes("PAYTM") || id.includes("PYTM")) return "Paytm";
  if (id.includes("PHONEPE") || id.includes("PPE")) return "PhonePe";
  if (id.includes("GPAY") || id.includes("GOOGPY")) return "Google Pay";
  if (id.includes("AMEX")) return "American Express";
  if (id.includes("CITI")) return "Citibank";
  if (id.includes("HSBC")) return "HSBC";
  return null;
}

function guessType(sender: string, last4: string | null): AccountType {
  const id = sender.replace(/^[A-Z]{2}-/i, "").toUpperCase();
  if (
    id.includes("PAYTM") || id.includes("PHONEPE") ||
    id.includes("GPAY") || id.includes("BHIM")
  ) return "upi";
  if (last4) return "credit_card";
  return "bank_account";
}

function normalizeSenderId(sender: string): string {
  return sender.replace(/^[A-Z]{2}-/i, "").toUpperCase();
}

export async function detectAccountsFromSms(): Promise<DetectedAccount[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<TxRow>(
    "SELECT sender, card_last4, upi_ref FROM transactions WHERE category = 'financial'",
  );

  // Key: if has last4 → "last4:XXXX" (all senders for same card merge into one)
  //      if no last4  → "sender:NORMALIZED_ID" (group by bank, not by prefix variant)
  type Group = {
    senders: Set<string>;
    last4: string | null;
    count: number;
  };
  const groups = new Map<string, Group>();

  for (const row of rows) {
    const key = row.card_last4
      ? `last4:${row.card_last4}`
      : `sender:${normalizeSenderId(row.sender)}`;

    if (!groups.has(key)) {
      groups.set(key, { senders: new Set(), last4: row.card_last4, count: 0 });
    }
    const g = groups.get(key)!;
    g.senders.add(row.sender);
    g.count++;
  }

  const results: DetectedAccount[] = [];

  for (const g of groups.values()) {
    // Pick the sender that gives us the best bank name guess
    let bankName: string | null = null;
    for (const s of g.senders) {
      const guess = guessBankName(s);
      if (guess) { bankName = guess; break; }
    }
    const representativeSender = [...g.senders][0];
    const type = guessType(representativeSender, g.last4);

    const slugs: string[] = [];
    if (g.last4) slugs.push(g.last4);
    if (bankName) {
      const shortName = bankName.split(" ")[0].toUpperCase();
      if (!slugs.includes(shortName)) slugs.push(shortName);
    }

    const nameParts: string[] = [];
    if (bankName) nameParts.push(bankName);
    else nameParts.push(normalizeSenderId(representativeSender));
    if (g.last4) nameParts.push(`xxxx${g.last4}`);

    results.push({
      name: nameParts.join(" "),
      type,
      bankName: bankName ?? null,
      last4: g.last4 ?? null,
      slugs,
      txnCount: g.count,
    });
  }

  return results.sort((a, b) => b.txnCount - a.txnCount);
}
