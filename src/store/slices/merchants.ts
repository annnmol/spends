import { create } from "zustand";

import {
  clearAllMerchants,
  createMerchant as dbCreate,
  deleteMerchant as dbDelete,
  updateMerchant as dbUpdate,
  linkAllUnlinkedMerchants,
  loadMerchants,
  unlinkTransactionsForMerchant,
  type CreateMerchantInput,
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
