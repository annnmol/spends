import { create } from "zustand";

import {
  clearAllTransactions,
  getAllTransactions,
  saveTransaction,
  saveTransactions,
  type Transaction,
} from "@mobile/db/transcations";
import type { SmsMessage } from "@root/modules/sms-module";
import SmsModule from "@root/modules/sms-module";
import { useAccountsStore } from "./accounts";
import { useMerchantsStore } from "./merchants";

// Dec 1 2025 00:00:00 IST
const SINCE_TIMESTAMP = 1764527400000;

function toPermissionState(s: string): "granted" | "denied" | "unknown" {
  if (s === "granted") return "granted";
  if (s === "denied") return "denied";
  return "unknown";
}

export type SmsState = {
  permission: "granted" | "denied" | "unknown";
  loading: boolean;
  listening: boolean;
  error: string | null;
  messages: Transaction[];
  pendingCount: number | null;

  init: () => Promise<void>;
  grantPermission: () => Promise<void>;
  readRecent: () => Promise<void>;
  readAll: () => Promise<void>;
  readSince: () => Promise<void>;
  toggleListening: () => Promise<void>;
  addMessage: (msg: SmsMessage) => Promise<void>;
  fakeFinancial: () => Promise<void>;
  fakeOtp: () => Promise<void>;
  fakePromo: () => Promise<void>;
  fakeDelayed: () => Promise<void>;
  checkQueue: () => Promise<void>;
  clearQueue: () => Promise<void>;
  clearTransactions: () => Promise<void>;
};

export const useSmsStore = create<SmsState>()((set, get) => ({
  permission: "unknown",
  loading: false,
  listening: false,
  error: null,
  messages: [],
  pendingCount: null,

  init: async () => {
    try {
      const res = await SmsModule.getSmsPermissionStatus();
      const permission = toPermissionState(res.status);
      set({ permission });
      if (permission === "granted") {
        await SmsModule.startListening();
        set({ listening: true });
      }
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
    try {
      const saved = await getAllTransactions();
      set({ messages: saved });
    } catch {
      // non-fatal
    }
  },

  grantPermission: async () => {
    set({ error: null });
    try {
      const res = await SmsModule.requestSmsPermission();
      const permission = toPermissionState(res.status);
      set({ permission });
      if (!res.granted) {
        set({ error: "SMS permission required" });
      } else {
        await SmsModule.startListening();
        set({ listening: true });
      }
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  readRecent: async () => {
    set({ error: null, loading: true });
    try {
      const accounts = useAccountsStore.getState().accounts;
      const merchants = useMerchantsStore.getState().merchants;
      const list = await SmsModule.getRecentSms(50);
      await saveTransactions(list, accounts, merchants);
      set({ messages: await getAllTransactions() });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    } finally {
      set({ loading: false });
    }
  },

  readAll: async () => {
    set({ error: null, loading: true });
    try {
      const accounts = useAccountsStore.getState().accounts;
      const list = await SmsModule.getAllSms();
      await saveTransactions(list, accounts);
      set({ messages: await getAllTransactions() });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    } finally {
      set({ loading: false });
    }
  },

  readSince: async () => {
    set({ error: null, loading: true });
    try {
      const accounts = useAccountsStore.getState().accounts;
      const list = await SmsModule.getSmsAfterDate(SINCE_TIMESTAMP);
      await saveTransactions(list, accounts);
      set({ messages: await getAllTransactions() });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    } finally {
      set({ loading: false });
    }
  },

  toggleListening: async () => {
    const { listening } = get();
    set({ error: null });
    try {
      if (listening) {
        await SmsModule.stopListening();
        set({ listening: false });
      } else {
        await SmsModule.startListening();
        set({ listening: true });
      }
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  addMessage: async (msg: SmsMessage) => {
    try {
      const accounts = useAccountsStore.getState().accounts;
      const merchants = useMerchantsStore.getState().merchants;
      await saveTransaction(msg, accounts, merchants);
      set({ messages: await getAllTransactions() });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  fakeFinancial: async () => {
    set({ error: null });
    try {
      await SmsModule.simulateIncomingSms(
        "VM-HDFCBK",
        "Rs.1,299.00 debited from card xx5678 at Swiggy on 30-05-2026. Avl bal: Rs.24,500.00. UPI Ref: 734829104856",
      );
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  fakeOtp: async () => {
    set({ error: null });
    try {
      await SmsModule.simulateIncomingSms(
        "AD-PAYTM",
        "Your OTP for Paytm login is 482910. Valid for 10 minutes. Do not share with anyone.",
      );
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  fakePromo: async () => {
    set({ error: null });
    try {
      await SmsModule.simulateIncomingSms(
        "AD-AMAZON",
        "Hurry! Flat 40% off on electronics. Limited time offer. Click here to shop now and save big!",
      );
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  fakeDelayed: async () => {
    set({ error: null });
    try {
      await SmsModule.scheduleSimulatedSms(
        "VM-ICICIB",
        "Rs.699.00 debited from card xx1234 at Zomato on 30-05-2026. Avl bal: Rs.12,800.00",
        20,
      );
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  checkQueue: async () => {
    set({ error: null });
    try {
      const pending = await SmsModule.getPendingBackgroundSms();
      set({ pendingCount: pending.length });
      if (pending.length > 0) {
        const accounts = useAccountsStore.getState().accounts;
        const merchants = useMerchantsStore.getState().merchants;
        await saveTransactions(pending, accounts, merchants);
        set({ messages: await getAllTransactions() });
      }
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  clearQueue: async () => {
    set({ error: null });
    try {
      await SmsModule.clearPendingBackgroundSms();
      set({ pendingCount: 0 });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  clearTransactions: async () => {
    set({ error: null });
    try {
      await clearAllTransactions();
      set({ messages: [] });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },
}));
