import type { Account } from "@mobile/db/accounts";

// Step 2 — Account Matcher (src/lib/smsAccountMatcher.ts)
//
// matchSmsToAccount(body, sender, accounts) — given one filtered financial SMS
// and the user's added accounts, returns the matching account ID or null.
//
// Principles:
//   - No guesswork. Only matches against accounts the user has explicitly added.
//   - If no account matches → return null. Never infer or create anything.
//   - Three signals checked in priority order (most specific → least specific).
//
// Mini-steps:
//
//   Step 2a — last4digits match
//     Context-aware card digit extraction from body.
//     Patterns: "XX5678", "**1234", "card ending 5678", "card xx1234", "a/c 5678".
//     Bare digits inside amounts (Rs.15,678) or long account numbers are ignored.
//     If extracted last4 matches any account's last4digits → that account wins.
//
//   Step 2b — slugs match  ← USER-INTENTIONAL, ranked above bankName
//     Slugs are short keywords the user explicitly sets on an account
//     (e.g. "hdfc", "gpay", "googlepay", "sbi", "icicib").
//     Because the user typed them knowing they control SMS matching, they are
//     trusted more than the auto-detected bankName.
//     Generic words that appear everywhere in SMS text are filtered out
//     (bank, card, upi, account, savings, credit, debit…) so they never cause
//     false matches.
//     Slugs sorted longest-first — "hdfcbank" wins over "hdfc" when both match,
//     reducing ambiguity between two accounts at the same bank.
//     Three match strategies per slug:
//       1. Word boundary  — "SBI" matches " SBI " but not "SBIINB"
//       2. Substring      — "HDFC" matches "HDFCBK" (sender IDs embedded in body)
//       3. Space-stripped — "GOOGLEPAY" matches "Google Pay" (multi-word brands)
//
//   Step 2c — bankName match  ← FALLBACK, auto-detected
//     Splits the account's bankName into words, skips generic noise words
//     (Bank, India, Ltd, The, Of…) that appear in every SMS.
//     Tries word-boundary match first, then substring (catches "HDFCBK" → "HDFC").
//     Checks both body text AND the sender ID — sender is telecom-verified.
//
// ─── UI HINT (for Add Account screen) ────────────────────────────────────────
// When a user adds or edits an account, show this guidance near the Slugs field:
//
//   "Slugs are keywords used to automatically match incoming SMS transactions
//    to this account. Add short, unique identifiers like your bank abbreviation
//    or card nickname (e.g. 'hdfc', 'icicib', 'gpay', 'axis5678').
//    Avoid generic words like 'bank', 'card', 'upi' — they match everything."
//
// Good slug examples to suggest in the UI per account type:
//   credit_card  → "<bankname>", "<bankname>cc", last4 e.g. "hdfc", "hdfccc", "5678"
//   debit_card   → "<bankname>", "<bankname>db", last4
//   bank_account → "<bankname>", "<bankname>inb", e.g. "sbi", "sbiinb"
//   upi          → platform name, e.g. "gpay", "googlepay", "phonepe", "paytm"
//   wallet       → platform name, e.g. "paytm", "mobikwik"
// ─────────────────────────────────────────────────────────────────────────────

// ─── Generic word filters ─────────────────────────────────────────────────────

// Slug values that appear naturally in SMS text and have no matching power.
const GENERIC_SLUGS = new Set([
  "upi", "bank", "card", "debit", "credit", "account",
  "savings", "current", "wallet", "neft", "imps", "rtgs",
  "money", "cash", "pay", "fund", "loan",
]);

// Words in bank names that add no identity — skipped during bankName matching.
const GENERIC_BANK_WORDS = new Set([
  "BANK", "INDIA", "INDIAN", "LIMITED", "LTD", "FINANCIAL",
  "SERVICES", "PAYMENTS", "THE", "OF", "AND", "CO", "COOPERATIVE",
  "NATIONAL", "STATE", "CENTRAL", "UNITED", "PEOPLES",
]);

// ─── Step 2a: last4digits ─────────────────────────────────────────────────────

// Extracts all card last-4 digit sequences from the body that appear in a
// context that confirms they are card numbers, not amounts or account numbers.
function extractLast4FromBody(body: string): Set<string> {
  const found = new Set<string>();
  // "XX5678", "xx1234", "**1234" — masked card number patterns
  const masked = /(?:[xX]{2,}|\*{2,})(\d{4})\b/g;
  // "card xx5678", "card ending 5678", "card 1234", "a/c xx1234"
  const cardWord = /\b(?:card|a\/c|acct)(?:\s+(?:no\.?|ending|number))?\s*(?:[xX*]{2,}\s*)?(\d{4})\b/gi;
  let m: RegExpExecArray | null;
  while ((m = masked.exec(body)) !== null) found.add(m[1]);
  while ((m = cardWord.exec(body)) !== null) found.add(m[1]);
  return found;
}

function matchByLast4(accounts: Account[], body: string): Account | undefined {
  const last4sInBody = extractLast4FromBody(body);
  if (last4sInBody.size === 0) return undefined;
  return accounts.find((a) => a.last4digits !== null && last4sInBody.has(a.last4digits));
}

// ─── Step 2b: bankName ────────────────────────────────────────────────────────

// Returns the meaningful (non-generic) words from a bank name.
function bankNameWords(bankName: string): string[] {
  return bankName
    .toUpperCase()
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !GENERIC_BANK_WORDS.has(w));
}

// Checks one meaningful bank word against a text string.
// Tries word boundary first (clean match), then substring (handles sender IDs
// like "HDFCBK" which contain the bank abbreviation without a boundary).
function bankWordMatches(word: string, text: string): boolean {
  if (new RegExp(`\\b${word}\\b`).test(text)) return true;
  if (word.length >= 4 && text.includes(word)) return true;
  return false;
}

function matchByBankName(accounts: Account[], body: string, sender: string): Account | undefined {
  const upperBody = body.toUpperCase();
  const upperSender = sender.toUpperCase();
  return accounts.find((a) => {
    if (!a.bankName) return false;
    const words = bankNameWords(a.bankName);
    // Check body AND sender — sender is telecom-verified, strongest signal.
    return words.some(
      (w) => bankWordMatches(w, upperBody) || bankWordMatches(w, upperSender),
    );
  });
}

// ─── Step 2c: slugs ───────────────────────────────────────────────────────────

// Checks one slug against the body using three strategies.
function slugMatches(slug: string, upperBody: string, bodyNoSpaces: string): boolean {
  const su = slug.toUpperCase();
  if (new RegExp(`\\b${su}\\b`).test(upperBody)) return true;      // word boundary
  if (su.length >= 4 && upperBody.includes(su)) return true;       // substring (HDFCBK)
  if (su.length >= 5 && bodyNoSpaces.includes(su)) return true;    // space-stripped (GooglePay)
  return false;
}

function matchBySlugs(accounts: Account[], body: string, sender: string): Account | undefined {
  const upperBody = body.toUpperCase();
  const upperSender = sender.toUpperCase();
  const bodyNoSpaces = upperBody.replace(/\s+/g, "");
  const senderNoSpaces = upperSender.replace(/\s+/g, "");

  return accounts.find((a) => {
    const candidates = a.slugs
      .filter((s) => !GENERIC_SLUGS.has(s.toLowerCase()))
      .sort((a, b) => b.length - a.length); // longest slug first
    return candidates.some(
      (s) =>
        slugMatches(s, upperBody, bodyNoSpaces) ||
        slugMatches(s, upperSender, senderNoSpaces),
    );
  });
}

// ─── Public API ───────────────────────────────────────────────────────────────

export type AccountMatchResult =
  | { accountId: number; by: "last4" | "bankName" | "slug" }
  | { accountId: null; by: null };

/**
 * Matches one financial SMS to a user-added account.
 * No accounts added → always returns null (nothing to match against).
 * No match found → returns null (never guesses or creates).
 */
export function matchSmsToAccount(
  body: string,
  sender: string,
  accounts: Account[],
): AccountMatchResult {
  if (!accounts.length) return { accountId: null, by: null };

  const byLast4 = matchByLast4(accounts, body);
  if (byLast4) return { accountId: byLast4.id, by: "last4" };

  const bySlug = matchBySlugs(accounts, body, sender);
  if (bySlug) return { accountId: bySlug.id, by: "slug" };

  const byBank = matchByBankName(accounts, body, sender);
  if (byBank) return { accountId: byBank.id, by: "bankName" };

  return { accountId: null, by: null };
}
