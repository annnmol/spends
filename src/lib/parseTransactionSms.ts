export type SmsCategory = "financial" | "otp" | "promotional" | "unknown";

export type TransactionType =
  | "debit"
  | "credit"
  | "refund"
  | "statement"
  | "payment"
  | "otp"
  | "unknown";

export type ParsedTransactionSms = {
  category: SmsCategory;
  transactionType: TransactionType;
  amount?: number;
  merchant?: string;
  cardLast4?: string;
  upiRef?: string;
};

// ─── Sender classification ────────────────────────────────────────────────────

// Indian bank / fintech 6-char alphanumeric sender IDs (case-insensitive).
// Format arriving in ADDRESS field: "VM-HDFCBK", "AD-ICICIB", "JD-PAYTM", etc.
const BANK_SENDER_IDS = new Set([
  // Major private banks
  "HDFCBK",
  "HDFCBN",
  "HDFCBANKCC",
  "ICICIB",
  "ICICIT",
  "ICICIC",
  "AXISBK",
  "AXISBN",
  "AXISCC",
  "KOTAKB",
  "KOTAK",
  "YESBK",
  "YESBNK",
  "INDUSB",
  "INDBNK",
  "IDFCFB",
  "IDFCBN",
  "RBLBNK",
  "RBLBKR",
  "FEDBK",
  "FDRLBN",
  "AUBANK",
  "AUBKCC",
  // PSU banks
  "SBIINB",
  "SBIPSG",
  "SBICRD",
  "SBIUPI",
  "PNBSMS",
  "PNBUPI",
  "BOISBY",
  "BOIUPI",
  "CNRBNK",
  "CANABN",
  "UNIONB",
  "UBIONB",
  "CENTBK",
  "SYNBNK",
  "IOBANK",
  "IDBI",
  // Payment platforms / wallets
  "PHONEPE",
  "PPESMS",
  "PHPEBN",
  "PAYTM",
  "PYTMBN",
  "PYTMSM",
  "GPAY",
  "GOOGPY",
  "AMZNPY",
  "AMZPAY",
  "BHIM",
  "BHIMUPI",
  "FREECHARGE",
  "FREECH",
  "MOBIKWIK",
  "AIRPAY",
  // Credit cards / NBFC / fintech
  "AMEXIN",
  "AMEXCC",
  "CITIBN",
  "CITICC",
  "HSBCIN",
  "BAJAFIN",
  "BAJAJ",
  "LENDNGK",
  "NIRAFC",
]);

function extractSenderId(address: string): string {
  // "VM-HDFCBK" → "HDFCBK"  |  "AD-PAYTM" → "PAYTM"  |  "+919876543210" → ""
  const match = address.match(/^[A-Z]{2}-([A-Z0-9]+)$/i);
  return match ? match[1].toUpperCase() : "";
}

function isBankSender(address: string): boolean {
  const id = extractSenderId(address);
  if (!id) return false;
  if (BANK_SENDER_IDS.has(id)) return true;
  // Loose match: any sender ID containing a known bank keyword
  return /HDFC|ICICI|AXIS|KOTAK|SBI|PNB|BOI|CANARA|UNION|INDUS|IDFC|RBL|PAYTM|PHONEPE|GPAY/i.test(
    id,
  );
}

// ─── Body patterns ────────────────────────────────────────────────────────────

const OTP_RE =
  /\b(?:otp|one[\s-]?time[\s-]?(?:password|passcode)|verification[\s-]?code|is your[\s-]?(?:otp|code|password))\b/i;
const OTP_CODE_RE = /\b(?:otp|code|password)\s*(?:is|:)?\s*([0-9]{4,8})\b/i;

const FINANCIAL_KEYWORDS_RE =
  /\b(?:debited|credited|debit|credit|spent|payment|paid|transfer(?:red)?|transaction|txn|withdrawn|deposit(?:ed)?|mandate|emi|autopay|cashback|refund(?:ed)?)\b/i;
const AMOUNT_RE = /(?:rs\.?|inr|₹)\s*([0-9,]+(?:\.[0-9]{1,2})?)/i;
const CARD_RE =
  /\b(?:card|a\/c|acct|account)[^\d]*(?:[x*]{2,})?[\s-]*(\d{4})\b/i;
const MERCHANT_RE =
  /\s(?:at|to|on)\s+([A-Z0-9][A-Za-z0-9&'.\- ]{1,40}?)(?:\s+(?:on|via|using|ref|txn|upi|dated|info|bal|avl)\b|[.,;]|$)/i;
const UPI_REF_RE =
  /\b(?:upi\s*ref\.?\s*(?:no\.?)?|ref\.?\s*no\.?|txn\s*id)\s*[:\-]?\s*([0-9]{6,20})\b/i;

const PROMOTIONAL_KEYWORDS_RE =
  /\b(?:offer|discount|sale|cashback|win|won|congratulations|congrats|voucher|coupon|promo|deal|off on|flat\s+\d+%|click here|subscribe|unsubscribe|opt[\s-]?out|download now|install now|limited time|hurry|expires)\b/i;

// ─── Transaction type patterns (checked in priority order) ───────────────────
// REFUND before CREDIT — "refund credited" must be REFUND not CREDIT
const REFUND_TYPE_RE =
  /\b(?:refund(?:ed)?|reversal|reversed|returned\s+to\s+(?:your|the)\s+(?:account|card|wallet))\b/i;
const STATEMENT_TYPE_RE =
  /\b(?:statement\s+(?:for|generated|is\s+ready)|minimum\s+(?:amount\s+)?due|total\s+(?:amount\s+)?due|outstanding\s+(?:amount|balance)|bill\s+(?:generated|for\s+the\s+month))\b/i;
const PAYMENT_TYPE_RE =
  /\b(?:payment\s+(?:received|credited|successful|accepted)|emi\s+(?:received|paid\s+successfully))\b/i;
const DEBIT_TYPE_RE =
  /\b(?:debited|spent|withdrawn|deducted|charged|mandate\s+(?:executed|deducted|registered)|auto[\s-]?debit|emi\s+of\b)\b/i;
const CREDIT_TYPE_RE =
  /\b(?:credited|salary|deposit(?:ed)?|cash\s+(?:back|deposit)|added\s+to\s+(?:your|the)\s+(?:account|wallet)|received)\b/i;

function classifyTransactionType(
  body: string,
  category: SmsCategory,
): TransactionType {
  if (category === "otp") return "otp";
  if (category !== "financial") return "unknown";
  if (REFUND_TYPE_RE.test(body)) return "refund";
  if (STATEMENT_TYPE_RE.test(body)) return "statement";
  if (PAYMENT_TYPE_RE.test(body)) return "payment";
  if (DEBIT_TYPE_RE.test(body)) return "debit";
  if (CREDIT_TYPE_RE.test(body)) return "credit";
  return "unknown";
}

// ─── Classifier ───────────────────────────────────────────────────────────────

function classifyCategory(sender: string, body: string): SmsCategory {
  if (OTP_RE.test(body)) return "otp";

  const fromBank = isBankSender(sender);

  if (fromBank && FINANCIAL_KEYWORDS_RE.test(body)) return "financial";
  if (fromBank && AMOUNT_RE.test(body)) return "financial";

  if (FINANCIAL_KEYWORDS_RE.test(body) && AMOUNT_RE.test(body))
    return "financial";

  if (PROMOTIONAL_KEYWORDS_RE.test(body)) return "promotional";

  // Numeric-only senders (e.g. "+919876543210") sending OTP-like 4-8 digit codes
  if (/^\+?[0-9]{10,13}$/.test(sender) && OTP_CODE_RE.test(body)) return "otp";

  return "unknown";
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function parseTransactionSms(
  message: string,
  sender = "",
): ParsedTransactionSms {
  const category = classifyCategory(sender, message);
  const transactionType = classifyTransactionType(message, category);
  const result: ParsedTransactionSms = { category, transactionType };

  if (!message) return result;

  const amountMatch = message.match(AMOUNT_RE);
  if (amountMatch) {
    const n = Number(amountMatch[1].replace(/,/g, ""));
    if (!Number.isNaN(n)) result.amount = n;
  }

  const cardMatch = message.match(CARD_RE);
  if (cardMatch) result.cardLast4 = cardMatch[1];

  const merchantMatch = message.match(MERCHANT_RE);
  if (merchantMatch) result.merchant = merchantMatch[1].trim();

  const upiMatch = message.match(UPI_REF_RE);
  if (upiMatch) result.upiRef = upiMatch[1];

  return result;
}
