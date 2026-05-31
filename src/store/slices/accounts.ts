import { create } from "zustand";

import {
  addAccount,
  clearAllAccounts,
  deleteAccount as dbDelete,
  getAllAccounts,
  initAccountsTable,
  linkAllUnlinkedTransactions,
  unlinkTransactionsForAccount,
  updateAccount as dbUpdate,
  type Account,
  type CreateAccountInput,
} from "@mobile/db/accounts";
import {
  detectAccountsFromSms,
  type DetectedAccount,
} from "@mobile/lib/detectAccountsFromSms";

export type AccountsState = {
  accounts: Account[];
  loading: boolean;
  error: string | null;

  init: () => Promise<void>;
  createAccount: (data: CreateAccountInput) => Promise<void>;
  updateAccount: (id: number, data: Partial<CreateAccountInput>) => Promise<void>;
  deleteAccount: (id: number) => Promise<void>;
  scanFromSms: () => Promise<DetectedAccount[]>;
  importAccounts: (detected: DetectedAccount[]) => Promise<void>;
  clearAccounts: () => Promise<void>;
};

async function refreshAndLink(): Promise<void> {
  const accounts = await getAllAccounts();
  useAccountsStore.setState({ accounts });
  await linkAllUnlinkedTransactions(accounts).catch(() => {});
}

export const useAccountsStore = create<AccountsState>()((set) => ({
  accounts: [],
  loading: false,
  error: null,

  init: async () => {
    set({ loading: true, error: null });
    try {
      await initAccountsTable();
      const accounts = await getAllAccounts();
      set({ accounts, loading: false });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e), loading: false });
    }
  },

  createAccount: async (data) => {
    set({ error: null });
    try {
      await addAccount(data);
      await refreshAndLink();
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  updateAccount: async (id, data) => {
    set({ error: null });
    try {
      await dbUpdate(id, data);
      await unlinkTransactionsForAccount(id);
      await refreshAndLink();
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  deleteAccount: async (id) => {
    set({ error: null });
    try {
      await unlinkTransactionsForAccount(id);
      await dbDelete(id);
      const accounts = await getAllAccounts();
      set({ accounts });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  scanFromSms: async () => {
    set({ loading: true, error: null });
    try {
      return await detectAccountsFromSms();
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
      return [];
    } finally {
      set({ loading: false });
    }
  },

  importAccounts: async (detected) => {
    set({ error: null });
    try {
      await Promise.all(detected.map((d) => addAccount(d)));
      await refreshAndLink();
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  clearAccounts: async () => {
    set({ error: null });
    try {
      await clearAllAccounts();
      set({ accounts: [] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },
}));
