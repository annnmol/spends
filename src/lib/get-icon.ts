import { BANK_MAP, type BankSvgComponent } from "./bank-icon-registry";
export { getMerchantAsset } from "./merchant-icon-registry";
export type { BankSvgComponent };

// ─── Bank lookup ────────────────────────────────────────────────────────────

function normalizeBank(s: string): string {
  return s
    .toLowerCase()
    .replace(/\bbank\b/g, "")
    .replace(/\blimited\b|\bltd\.?\b/g, "")
    .replace(/\bpayments\b/g, "")
    .replace(/\bsmall finance\b/g, "")
    .replace(/\bcommercial\b/g, "")
    .replace(/[^a-z0-9 &]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function getBankSvg(
  bankName: string | null | undefined,
  slugs?: string[],
): BankSvgComponent | null {
  const candidates = [bankName, ...(slugs ?? [])].filter(
    (v): v is string => typeof v === "string" && v.length > 0,
  );

  for (const raw of candidates) {
    const norm = raw.toLowerCase().trim();
    const stripped = normalizeBank(raw);

    if (BANK_MAP[norm]) return BANK_MAP[norm];
    if (BANK_MAP[stripped]) return BANK_MAP[stripped];

    for (const [key, comp] of Object.entries(BANK_MAP)) {
      if (norm.includes(key) || key.includes(norm)) return comp;
      if (
        stripped.length >= 3 &&
        (stripped.includes(key) || key.includes(stripped))
      ) {
        return comp;
      }
    }
  }

  return null;
}

// ─── Shared initials helper ──────────────────────────────────────────────────

const AVATAR_COLORS = [
  "#2563eb", "#16a34a", "#dc2626", "#7c3aed",
  "#ea580c", "#0891b2", "#be185d", "#4f7942",
];

export function getInitialAndColor(name: string): { letter: string; color: string } {
  const letter = name.trim().charAt(0).toUpperCase() || "?";
  const index = letter.charCodeAt(0) % AVATAR_COLORS.length;
  return { letter, color: AVATAR_COLORS[index] };
}
