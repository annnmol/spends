import type { Account } from "./accounts";

export function matchAccount(
  accounts: Account[],
  cardLast4: string | null | undefined,
  upiRef: string | null | undefined,
  body: string,
): number | null {
  if (accounts.length === 0) return null;

  // Priority 1: last4 digits exact match
  if (cardLast4) {
    const match = accounts.find((a) => a.last4 === cardLast4);
    if (match) return match.id;
  }

  // Priority 2: upiRef matches a slug exactly
  if (upiRef) {
    const upper = upiRef.toUpperCase();
    const match = accounts.find((a) =>
      a.slugs.some((s) => s.toUpperCase() === upper),
    );
    if (match) return match.id;
  }

  // Priority 3: body contains a slug (min length 4 to avoid false positives)
  const bodyUpper = body.toUpperCase();
  const match = accounts.find((a) =>
    a.slugs.some((s) => s.length >= 4 && bodyUpper.includes(s.toUpperCase())),
  );
  return match ? match.id : null;
}
