import { create } from "zustand";

import {
  clearAllTransactions,
  deleteTransaction as dbDelete,
  getAllTransactions,
  getTransactionsByAccountId,
  getTransactionsByMerchantId,
  getTransactionsByStatus,
  initTransactionsTable,
  updateTransaction as dbUpdate,
  type CreateTransactionInput,
  type Transaction,
  type TransactionStatus,
} from "@mobile/db/transcations";

export type TransactionsState = {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;

  init: () => Promise<void>;
  reload: () => Promise<void>;
  updateTransaction: (id: number, data: Partial<CreateTransactionInput>) => Promise<void>;
  deleteTransaction: (id: number) => Promise<void>;
  loadByAccount: (accountId: number) => Promise<void>;
  loadByMerchant: (merchantId: number) => Promise<void>;
  loadByStatus: (status: TransactionStatus) => Promise<void>;
  clearTransactions: () => Promise<void>;
};

export const useTransactionsStore = create<TransactionsState>()((set) => ({
  transactions: [],
  loading: false,
  error: null,

  init: async () => {
    set({ loading: true, error: null });
    try {
      await initTransactionsTable();
      const transactions = await getAllTransactions();
      set({ transactions, loading: false });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e), loading: false });
    }
  },

  reload: async () => {
    set({ loading: true, error: null });
    try {
      const transactions = await getAllTransactions();
      set({ transactions, loading: false });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e), loading: false });
    }
  },

  updateTransaction: async (id, data) => {
    set({ error: null });
    try {
      await dbUpdate(id, data);
      const transactions = await getAllTransactions();
      set({ transactions });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  deleteTransaction: async (id) => {
    set({ error: null });
    try {
      await dbDelete(id);
      const transactions = await getAllTransactions();
      set({ transactions });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  loadByAccount: async (accountId) => {
    set({ loading: true, error: null });
    try {
      const transactions = await getTransactionsByAccountId(accountId);
      set({ transactions, loading: false });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e), loading: false });
    }
  },

  loadByMerchant: async (merchantId) => {
    set({ loading: true, error: null });
    try {
      const transactions = await getTransactionsByMerchantId(merchantId);
      set({ transactions, loading: false });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e), loading: false });
    }
  },

  loadByStatus: async (status) => {
    set({ loading: true, error: null });
    try {
      const transactions = await getTransactionsByStatus(status);
      set({ transactions, loading: false });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e), loading: false });
    }
  },

  clearTransactions: async () => {
    set({ error: null });
    try {
      await clearAllTransactions();
      set({ transactions: [] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },
}));
