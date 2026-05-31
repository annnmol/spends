export type AccountType =
  | "credit_card"
  | "debit_card"
  | "bank_account"
  | "upi"
  | "wallet"
  | "other";

export type Account = {
  id: number;
  name: string;
  bankName: string | null;
  last4digits: string | null;
  type: AccountType;
  slugs: string[];
  billingDate: number | null;
  dueDate: number | null;
  iconKey: string | null;
  color: string | null;
  notes: string | null;
  createdAt: number;
  updatedAt: number;
};