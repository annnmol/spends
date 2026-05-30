import { create } from "zustand";

import {
  clearAllTransactions,
  loadTransactions,
  saveTransaction,
  saveTransactions,
} from "@mobile/lib/saveTransaction";
import SmsModule from "../../../modules/sms-module";
import type { SmsMessage } from "../../../modules/sms-module";
import { useAccountsStore } from "./accounts";

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
  messages: SmsMessage[];
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
    // Permission + auto-start listener
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
    // Load persisted transactions from SQLite
    try {
      const saved = await loadTransactions();
      if (saved.length > 0) set({ messages: saved });
    } catch {
      // non-fatal — app still works without cached messages
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
      const list = await SmsModule.getRecentSms(50);
      set({ messages: list });
      saveTransactions(list, true, useAccountsStore.getState().accounts).catch(() => {});
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    } finally {
      set({ loading: false });
    }
  },

  readAll: async () => {
    set({ error: null, loading: true });
    try {
      const list = await SmsModule.getAllSms();
      set({ messages: list });
      saveTransactions(list, true, useAccountsStore.getState().accounts).catch(() => {});
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    } finally {
      set({ loading: false });
    }
  },

  readSince: async () => {
    set({ error: null, loading: true });
    try {
      const list = await SmsModule.getSmsAfterDate(SINCE_TIMESTAMP);
      set({ messages: list });
      saveTransactions(list, true, useAccountsStore.getState().accounts).catch(() => {});
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

  // Called from SmsListenerBridge — always gets latest accounts via getState(), no stale closure
  addMessage: async (msg: SmsMessage) => {
    set((state) => ({ messages: [msg, ...state.messages] }));
    saveTransaction(msg, null, useAccountsStore.getState().accounts).catch(() => {});
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
      if (pending.length > 0) set({ messages: pending });
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
