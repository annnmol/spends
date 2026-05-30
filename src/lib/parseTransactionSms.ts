export type ParsedTransactionSms = {
  amount?: number;
  merchant?: string;
  cardLast4?: string;
};

const AMOUNT_RE = /(?:rs\.?|inr|₹)\s*([0-9,]+(?:\.[0-9]{1,2})?)/i;
const CARD_RE = /\b(?:card|a\/c|acct|account)[^\d]*([x\*]{2,}|ending)?[\s\-]*(\d{4})\b/i;
const MERCHANT_RE = /\s(?:at|to|on)\s+([A-Z0-9][A-Za-z0-9&'.\- ]{1,40}?)(?:\s+(?:on|via|using|ref|txn|upi|dated|info|bal|avl)\b|[.,;]|$)/i;

export function parseTransactionSms(message: string): ParsedTransactionSms {
  const result: ParsedTransactionSms = {};
  if (!message) return result;

  const amountMatch = message.match(AMOUNT_RE);
  if (amountMatch) {
    const n = Number(amountMatch[1].replace(/,/g, ""));
    if (!Number.isNaN(n)) result.amount = n;
  }

  const cardMatch = message.match(CARD_RE);
  if (cardMatch) result.cardLast4 = cardMatch[2];

  const merchantMatch = message.match(MERCHANT_RE);
  if (merchantMatch) result.merchant = merchantMatch[1].trim();

  return result;
}
