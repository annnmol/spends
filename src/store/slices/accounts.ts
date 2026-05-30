import { create } from "zustand";

import {
  clearAllAccounts,
  createAccount as dbCreate,
  deleteAccount as dbDelete,
  loadAccounts,
  updateAccount as dbUpdate,
  type Account,
  type CreateAccountInput,
} from "@mobile/lib/accounts";
import {
  detectAccountsFromSms,
  type DetectedAccount,
} from "@mobile/lib/detectAccountsFromSms";
import { linkAllUnlinkedTransactions } from "@mobile/lib/saveTransaction";

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

async function refreshAndLink(): Promise<Account[]> {
  const accounts = await loadAccounts();
  useAccountsStore.setState({ accounts });
  await linkAllUnlinkedTransactions(accounts).catch(() => {});
  return accounts;
}

export const useAccountsStore = create<AccountsState>()((set) => ({
  accounts: [],
  loading: false,
  error: null,

  init: async () => {
    try {
      const accounts = await loadAccounts();
      set({ accounts });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  createAccount: async (data) => {
    set({ error: null });
    try {
      await dbCreate(data);
      await refreshAndLink();
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  updateAccount: async (id, data) => {
    set({ error: null });
    try {
      await dbUpdate(id, data);
      await refreshAndLink();
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  deleteAccount: async (id) => {
    set({ error: null });
    try {
      await dbDelete(id);
      const accounts = await loadAccounts();
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
      await Promise.all(detected.map((d) => dbCreate(d)));
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
