import type { Merchant } from "@mobile/db/merchants";

// Step 3 — Merchant Matcher (src/lib/smsMerchantMatcher.ts)
//
// matchSmsToMerchant(body, merchants) — given one filtered financial SMS and
// the user's added merchants, returns the matched merchant + its category or null.
//
// Principles:
//   - No guesswork. Only matches against merchants the user has explicitly added.
//   - If no merchant matches → return null. Never infer or create anything.
//   - Category is derived from the matched merchant's categoryId — no SMS parsing
//     needed for category. One step gives both merchantId and categoryId.
//
// Mini-steps:
//
//   Step 3a — Normalize
//     Lowercase + collapse whitespace on body once before any matching.
//     All slug comparisons happen on normalized text — case and extra spaces
//     never affect results.
//
//   Step 3b — Slug match  ← primary signal
//     Each merchant has a slugs array. Each slug item can be a single word
//     or a multi-word phrase (words separated by spaces).
//     Match rule:
//       - Single-word slug  → that word must appear in the body (word boundary).
//       - Multi-word slug   → every word in the slug must appear somewhere in
//                             the body (word boundary, in any order, any distance).
//                             "swiggy instamart" matches a body that contains
//                             both "swiggy" and "instamart" anywhere.
//     Slugs sorted by specificity before trying: most words first, then longest
//     first — so "bundl technologies" (2 words) beats "bundl" (1 word), and
//     a more specific match wins over a generic one.
//
//   Step 3c — Name match  ← fallback
//     If no slug matched, try the merchant's own name as a phrase.
//     Same rule: every word in the name must appear in the body.
//     Useful when a user added a merchant but didn't set any slugs.
//
// ─── UI HINT (for Add Merchant screen) ───────────────────────────────────────
// When a user adds or edits a merchant, show near the Slugs field:
//
//   "Slugs are keywords used to automatically match this merchant in SMS
//    transactions. Each slug can be one or more words — all words in a slug
//    must appear in the SMS for it to match.
//    Examples: 'swiggy', 'swiggy instamart', 'bundl technologies', 'uber india'."
//
// Use src/lib/brandMappings.ts to pre-populate slug suggestions:
//   When the user types a merchant name, look up BRAND_MAPPINGS[normalized_name]
//   and offer those as suggested slugs. e.g. typing "Swiggy" suggests:
//   ["swiggy", "instamart", "swiggy instamart", "bundl technologies", "toing"]
// ─────────────────────────────────────────────────────────────────────────────

// ─── Step 3a: Normalize ───────────────────────────────────────────────────────

function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

// ─── Step 3b: Slug match ──────────────────────────────────────────────────────

// Checks whether every word in a (possibly multi-word) slug appears in the
// normalized body — each word checked with a word boundary so "ola" never
// matches "cola" or "solar".
function slugMatchesBody(slug: string, normalizedBody: string): boolean {
  const words = normalize(slug).split(" ").filter(Boolean);
  return words.every((w) => new RegExp(`\\b${w}\\b`).test(normalizedBody));
}

// Sorts slugs so the most specific (most words, then longest) is tried first.
// "bundl technologies" (2 words, 18 chars) beats "bundl" (1 word, 5 chars).
function sortBySpecificity(slugs: string[]): string[] {
  return [...slugs].sort((a, b) => {
    const wa = a.split(" ").length;
    const wb = b.split(" ").length;
    if (wb !== wa) return wb - wa;         // more words first
    return b.length - a.length;            // longer first if same word count
  });
}

function matchBySlugs(merchants: Merchant[], normalizedBody: string): Merchant | undefined {
  for (const merchant of merchants) {
    const sorted = sortBySpecificity(merchant.slugs);
    if (sorted.some((s) => slugMatchesBody(s, normalizedBody))) return merchant;
  }
  return undefined;
}

// ─── Step 3c: Name match ──────────────────────────────────────────────────────

// Treats the merchant name itself as a slug — all words must appear in body.
function matchByName(merchants: Merchant[], normalizedBody: string): Merchant | undefined {
  return merchants.find((m) => slugMatchesBody(m.name, normalizedBody));
}

// ─── Public API ───────────────────────────────────────────────────────────────

export type MerchantMatchResult =
  | { merchantId: number; categoryId: number | null; merchantName: string }
  | { merchantId: null; categoryId: null; merchantName: null };

/**
 * Matches one financial SMS to a user-added merchant.
 * Returns merchantId + categoryId (from merchant.categoryId) + merchantName.
 * No merchants added → null. No match → null. Never guesses or creates.
 */
export function matchSmsToMerchant(
  body: string,
  merchants: Merchant[],
): MerchantMatchResult {
  if (!merchants.length) return { merchantId: null, categoryId: null, merchantName: null };

  const normalizedBody = normalize(body);

  const bySlug = matchBySlugs(merchants, normalizedBody);
  if (bySlug) return { merchantId: bySlug.id, categoryId: bySlug.categoryId, merchantName: bySlug.name };

  const byName = matchByName(merchants, normalizedBody);
  if (byName) return { merchantId: byName.id, categoryId: byName.categoryId, merchantName: byName.name };

  return { merchantId: null, categoryId: null, merchantName: null };
}
