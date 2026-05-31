import type { AccountType, CreateAccountInput } from "@mobile/db/accounts";
import { getDb } from "@mobile/db/db";

type TxRow = {
  sender: string;
  body: string;
};

export type DetectedAccount = CreateAccountInput & { txnCount: number };

function extractLast4(body: string): string | null {
  // Matches patterns like XX1234, XXXX1234, **1234 — avoids false positives with amounts
  const match = body.match(/(?:X{2,}|\*{2,})(\d{4})\b/i);
  return match?.[1] ?? null;
}

function guessBankName(sender: string): string | null {
  const id = sender.replace(/^[A-Z]{2}-/i, "").toUpperCase();
  const BANKS: [string[], string][] = [
    [["HDFCBK", "HDFCB", "HDFC"], "HDFC Bank"],
    [["ICICIB", "ICICI"], "ICICI Bank"],
    [["UTIBK", "AXISBK", "AXIS"], "Axis Bank"],
    [["KOTAKB", "KOTAK"], "Kotak Bank"],
    [["SBIINB", "SBIPSG", "SBISMS", "SBICRM", "SBINFO", "SBII", "SBIP", "SBIC", "SBIU", "SBMSBI"], "State Bank of India"],
    [["PNBSMS", "PNB"], "Punjab National Bank"],
    [["BOISMS", "BOISBI", "BOIS", "BOI"], "Bank of India"],
    [["CANBK", "CANARA", "CNR"], "Canara Bank"],
    [["UBIINB", "UBISMS", "UNION"], "Union Bank"],
    [["INDBNK", "INDUSB", "INDUS"], "IndusInd Bank"],
    [["IDFCFB", "IDFCB", "IDFC"], "IDFC First Bank"],
    [["IDBIBK", "IDBIB", "IDBI"], "IDBI Bank"],
    [["RBLBNK", "RBLBK", "RBL"], "RBL Bank"],
    [["YESBNK", "YESBK", "YESB"], "Yes Bank"],
    [["FEDBNK", "FEDBK", "FEDERAL"], "Federal Bank"],
    [["SIBSMS", "SIBBNK", "SIB"], "South Indian Bank"],
    [["KVBSMS", "KVBNK", "KVB"], "Karur Vysya Bank"],
    [["BNDHNB", "BANDHAN"], "Bandhan Bank"],
    [["PSBSMS", "PSBBNK"], "Punjab & Sind Bank"],
    [["UCOBK", "UCOB"], "UCO Bank"],
    [["AMEX"], "American Express"],
    [["CITI"], "Citibank"],
    [["HSBC"], "HSBC"],
    [["PAYTM", "PYTM"], "Paytm"],
    [["PHONEPE", "PHPE"], "PhonePe"],
    [["GPAY", "GOOGPY"], "Google Pay"],
    [["BHIM"], "BHIM UPI"],
  ];
  for (const [patterns, name] of BANKS) {
    if (patterns.some((p) => id.includes(p))) return name;
  }
  return null;
}

function guessType(sender: string, last4digits: string | null): AccountType {
  const id = sender.replace(/^[A-Z]{2}-/i, "").toUpperCase();
  if (
    id.includes("PAYTM") || id.includes("PHONEPE") ||
    id.includes("GPAY") || id.includes("BHIM")
  ) return "upi";
  if (last4digits) return "credit_card";
  return "bank_account";
}

function normalizeSenderId(sender: string): string {
  return sender.replace(/^[A-Z]{2}-/i, "").toUpperCase();
}

export async function detectAccountsFromSms(): Promise<DetectedAccount[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<TxRow>(
    "SELECT sender, body FROM transactions WHERE transactionType IN ('DEBIT', 'CREDIT', 'PAYMENT', 'REFUND')",
  );

  type Group = {
    senders: Set<string>;
    last4digits: string | null;
    count: number;
  };
  const groups = new Map<string, Group>();

  for (const row of rows) {
    const last4digits = extractLast4(row.body);
    const key = last4digits
      ? `last4:${last4digits}`
      : `sender:${normalizeSenderId(row.sender)}`;

    if (!groups.has(key)) {
      groups.set(key, { senders: new Set(), last4digits, count: 0 });
    }
    const g = groups.get(key)!;
    g.senders.add(row.sender);
    g.count++;
  }

  const results: DetectedAccount[] = [];

  for (const g of groups.values()) {
    let bankName: string | null = null;
    for (const s of g.senders) {
      const guess = guessBankName(s);
      if (guess) { bankName = guess; break; }
    }
    const representativeSender = [...g.senders][0];
    const type = guessType(representativeSender, g.last4digits);

    const slugs: string[] = [];
    if (g.last4digits) slugs.push(g.last4digits);
    if (bankName) {
      const shortName = bankName.split(" ")[0].toUpperCase();
      if (!slugs.includes(shortName)) slugs.push(shortName);
    }

    const nameParts: string[] = [];
    if (bankName) nameParts.push(bankName);
    else nameParts.push(normalizeSenderId(representativeSender));
    if (g.last4digits) nameParts.push(`xxxx${g.last4digits}`);

    results.push({
      name: nameParts.join(" "),
      type,
      bankName: bankName ?? null,
      last4digits: g.last4digits ?? null,
      slugs,
      txnCount: g.count,
    });
  }

  return results.sort((a, b) => b.txnCount - a.txnCount);
}
