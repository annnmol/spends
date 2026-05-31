export type TransactionType =
  | "DEBIT"
  | "CREDIT"
  | "REFUND"
  | "PAYMENT"
  | "STATEMENT"
  | "OTP"
  | "UNKNOWN";

export type SourceType =
  | "BANK"
  | "CARD"
  | "UPI"
  | "MERCHANT"
  | "OTP"
  | "OTHER";

export type Confidence = "HIGH" | "MEDIUM" | "LOW" | "NONE";

export type TransactionStatus = "ACTIVE" | "ARCHIVED" | "DUPLICATE" | "IGNORED";

export type Transaction = {
  smsId: string;
  sender: string;
  body: string;
  timestamp: number;

  id: number;
  accountId: number | null;
  merchantId: number | null;
  merchantName: string | null;
  categoryId: number | null;

  transactionType: TransactionType;
  sourceType: SourceType;
  confidence: Confidence;
  status: TransactionStatus;

  amount: number | null;
  isRecurring: boolean | null;
  createdAt: number;
  updatedAt: number;
};
