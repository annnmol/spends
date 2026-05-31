import { create } from "zustand";

import {
  addMerchant,
  clearAllMerchants,
  deleteMerchant as dbDelete,
  getAllMerchants,
  initMerchantsTable,
  linkAllUnlinkedMerchants,
  unlinkTransactionsForMerchant,
  updateMerchant as dbUpdate,
  type CreateMerchantInput,
  type Merchant,
} from "@mobile/db/merchants";

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

async function refreshAndLink(): Promise<void> {
  const merchants = await getAllMerchants();
  useMerchantsStore.setState({ merchants });
  await linkAllUnlinkedMerchants(merchants).catch(() => {});
}

export const useMerchantsStore = create<MerchantsState>()((set) => ({
  merchants: [],
  loading: false,
  error: null,

  init: async () => {
    set({ loading: true, error: null });
    try {
      await initMerchantsTable();
      const merchants = await getAllMerchants();
      set({ merchants, loading: false });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e), loading: false });
    }
  },

  createMerchant: async (data) => {
    set({ error: null });
    try {
      await addMerchant(data);
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
      await unlinkTransactionsForMerchant(id);
      await dbDelete(id);
      const merchants = await getAllMerchants();
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
