import type { SmsMessage } from "@root/modules/sms-module";

// ─── TRAI Types ───────────────────────────────────────────────────────────────
// Under TRAI regulations every official Indian SMS sender ID ends with a suffix:
//   -T  Transactional  (OTPs, debit/credit alerts, transaction codes)
//   -S  Service        (account updates, statements, KYC, welcome messages)
//   -P  Promotional    (offers, loans, credit card ads)
//   -G  Government     (Aadhaar, income tax, official notices)
//
// -T and -S both carry financial transactions — cannot rely on suffix alone.
// -P and -G never carry actionable transactions — hard reject.

type TraiType = "T" | "S" | "P" | "G";

type ParsedSender = {
  id: string;           // core ID e.g. "HDFCBK"
  traiType: TraiType | null;
};

// Parse sender string ONCE — extracts both core ID and TRAI suffix.
// "VK-HDFCBK-T" → { id: "HDFCBK", traiType: "T" }
// "AD-PAYTM"    → { id: "PAYTM",  traiType: null }
// "+919876..."  → { id: "",        traiType: null }
//
// NOTE: parseTransactionSms.ts uses /^[A-Z]{2}-([A-Z0-9]+)$/ which silently
// returns "" for any TRAI-suffixed sender like "VK-HDFCBK-T" — bank not
// recognized. This regex handles both formats.
function parseSender(sender: string): ParsedSender {
  const m = sender.match(/^[A-Z]{2}-([A-Z0-9]+?)(?:-([TSPG]))?$/i);
  if (!m) return { id: "", traiType: null };
  return {
    id: m[1].toUpperCase(),
    traiType: m[2] ? (m[2].toUpperCase() as TraiType) : null,
  };
}

// ─── Known financial sender IDs ───────────────────────────────────────────────
const FINANCIAL_SENDER_IDS = new Set([
  // Private banks
  "HDFCBK", "HDFCBN", "HDFCBANKCC",
  "ICICIB", "ICICIT", "ICICIC",
  "AXISBK", "AXISBN", "AXISCC",
  "KOTAKB", "KOTAK",
  "YESBK", "YESBNK",
  "INDUSB", "INDBNK",
  "IDFCFB", "IDFCBN",
  "RBLBNK", "RBLBKR",
  "FEDBK", "FDRLBN",
  "AUBANK", "AUBKCC",
  // PSU banks
  "SBIINB", "SBIPSG", "SBICRD", "SBIUPI",
  "PNBSMS", "PNBUPI",
  "BOISBY", "BOIUPI",
  "CNRBNK", "CANABN",
  "UNIONB", "UBIONB",
  "CENTBK", "SYNBNK", "IOBANK", "IDBI",
  // UPI / payment platforms
  "PHONEPE", "PPESMS", "PHPEBN",
  "PAYTM", "PYTMBN", "PYTMSM",
  "GPAY", "GOOGPY",
  "AMZNPY", "AMZPAY",
  "BHIM", "BHIMUPI",
  "FREECH", "FREECHARGE",
  "MOBIKWIK", "AIRPAY",
  // Credit cards / NBFC
  "AMEXIN", "AMEXCC",
  "CITIBN", "CITICC",
  "HSBCIN",
  "BAJAFIN", "BAJAJ",
  "LENDNGK", "NIRAFC",
]);

// Loose keyword fallback for senders not in the exact set above.
const FINANCIAL_SENDER_KW_RE =
  /HDFC|ICICI|AXIS|KOTAK|SBI|PNB|BOI|CANARA|UNION|INDUS|IDFC|RBL|YES|FEDERAL|PAYTM|PHONEPE|GPAY|BHIM|AMEX|CITI|HSBC|BAJAJ/i;

function isFinancialSenderId(id: string): boolean {
  if (!id) return false;
  if (FINANCIAL_SENDER_IDS.has(id)) return true;
  return FINANCIAL_SENDER_KW_RE.test(id);
}

// ─── Body pattern checks ──────────────────────────────────────────────────────

// Reject pure OTP SMS — targets the dispensing patterns only, NOT references.
//
// REJECTS:  "Your OTP is 482910"  |  "OTP for txn is 445566"  |  "OTP: 123456"
//           "One time password"   |  "Verification code"
// PASSES:   "Rs.5,000 debited. OTP 123456 was used to authorize."   ← completed txn
//           "Rs.500 paid. Authorized via OTP."                       ← completed txn
//
// Why no outer trailing \b: the otp\s*[:\-]\s*\d alternative ends on a digit —
// a digit followed by more digits has no word boundary, so trailing \b would
// silently break that alternative.
const OTP_BODY_RE =
  /\b(?:your\s+otp\b|otp\s+(?:is|for)\b|otp\s*[:\-]\s*\d|one[\s-]?time[\s-]?(?:password|passcode)\b|verification[\s-]?code\b)/i;

// Require: a money amount in Rupees.
const AMOUNT_RE = /(?:rs\.?|inr|₹)\s*[0-9,]+(?:\.[0-9]{1,2})?/i;

// Require: at least one financial action word.
const FINANCIAL_KW_RE =
  /\b(?:debited|credited|debit|credit|spent|payment|paid|transfer(?:red)?|transaction|txn|withdrawn|deposit(?:ed)?|mandate|emi|autopay|cashback|refund(?:ed)?|statement|minimum\s+due|total\s+due|outstanding)\b/i;

// ─── Public API ───────────────────────────────────────────────────────────────

export type FilterResult =
  | { pass: true }
  | { pass: false; reason: "promotional" | "government" | "unknown_sender" | "otp" | "no_amount" | "no_financial_keyword" };

/**
 * Multi-stage check: is this SMS a genuine financial transaction from a bank?
 *
 * Stage 1 — TRAI hard reject:   -P (promotional) and -G (government) are never
 *            financial transactions. Reject immediately without touching body.
 * Stage 2 — Sender check:       Must be a known bank/UPI sender OR have -T/-S
 *            suffix. Checked before body regexes — the majority of inbox SMS
 *            (non-bank) are rejected here cheaply.
 * Stage 3 — OTP reject:         Targets pure OTP-dispensing patterns. Completed
 *            transactions that reference a used OTP are not rejected.
 * Stage 4 — Amount required:    No Rs/INR/₹ amount → not a transaction alert.
 * Stage 5 — Keyword required:   No debit/credit/payment/etc keyword → not financial.
 */
export function checkFinancialSms(sender: string, body: string): FilterResult {
  const { id, traiType } = parseSender(sender);

  // Stage 1 — TRAI hard reject (cheap — no body access)
  if (traiType === "P") return { pass: false, reason: "promotional" };
  if (traiType === "G") return { pass: false, reason: "government" };

  // Stage 2 — Sender check (cheap — no body access)
  // Unknown sender with no -T/-S trust signal → reject before running body regexes.
  if (!isFinancialSenderId(id) && traiType !== "T" && traiType !== "S") {
    return { pass: false, reason: "unknown_sender" };
  }

  // Stage 3-5 — Body checks (expensive — only reached by plausible bank senders)
  if (OTP_BODY_RE.test(body))       return { pass: false, reason: "otp" };
  if (!AMOUNT_RE.test(body))        return { pass: false, reason: "no_amount" };
  if (!FINANCIAL_KW_RE.test(body))  return { pass: false, reason: "no_financial_keyword" };

  return { pass: true };
}

/**
 * Filters an SMS list to only genuine financial bank/UPI transaction messages.
 * Non-passing messages are silently dropped — use checkFinancialSms() directly
 * if you need the rejection reason.
 */
export function filterFinancialSms(msgs: SmsMessage[]): SmsMessage[] {
  return msgs.filter((msg) => checkFinancialSms(msg.sender, msg.body).pass);
}
