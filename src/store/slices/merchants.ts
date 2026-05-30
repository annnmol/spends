import { create } from "zustand";

import {
  clearAllMerchants,
  createMerchant as dbCreate,
  deleteMerchant as dbDelete,
  updateMerchant as dbUpdate,
  detectMerchantsFromTransactions,
  linkAllUnlinkedMerchants,
  loadMerchants,
  unlinkTransactionsForMerchant,
  type CreateMerchantInput,
  type DetectedMerchant,
  type Merchant,
} from "@mobile/lib/merchants";

export type MerchantsState = {
  merchants: Merchant[];
  loading: boolean;
  error: string | null;

  init: () => Promise<void>;
  createMerchant: (data: CreateMerchantInput) => Promise<void>;
  updateMerchant: (id: number, data: Partial<CreateMerchantInput>) => Promise<void>;
  deleteMerchant: (id: number) => Promise<void>;
  scanFromTransactions: () => Promise<DetectedMerchant[]>;
  importMerchants: (detected: DetectedMerchant[]) => Promise<void>;
  clearMerchants: () => Promise<void>;
};

async function refreshAndLink(): Promise<Merchant[]> {
  const merchants = await loadMerchants();
  useMerchantsStore.setState({ merchants });
  await linkAllUnlinkedMerchants(merchants).catch(() => {});
  return merchants;
}

export const useMerchantsStore = create<MerchantsState>()((set) => ({
  merchants: [],
  loading: false,
  error: null,

  init: async () => {
    try {
      const merchants = await loadMerchants();
      set({ merchants });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  createMerchant: async (data) => {
    set({ error: null });
    try {
      await dbCreate(data);
      await refreshAndLink();
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  updateMerchant: async (id, data) => {
    set({ error: null });
    try {
      await dbUpdate(id, data);
      await unlinkTransactionsForMerchant(id);
      await refreshAndLink();
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  deleteMerchant: async (id) => {
    set({ error: null });
    try {
      await dbDelete(id);
      const merchants = await loadMerchants();
      set({ merchants });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  scanFromTransactions: async () => {
    set({ loading: true, error: null });
    try {
      return await detectMerchantsFromTransactions();
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
      return [];
    } finally {
      set({ loading: false });
    }
  },

  importMerchants: async (detected) => {
    set({ error: null });
    try {
      await Promise.all(detected.map((d) => dbCreate(d)));
      await refreshAndLink();
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  clearMerchants: async () => {
    set({ error: null });
    try {
      await clearAllMerchants();
      set({ merchants: [] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },
}));
