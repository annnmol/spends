import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";

import {
  clearAllTransactions,
  loadTransactions,
  saveTransaction,
  saveTransactions,
} from "@mobile/lib/saveTransaction";
import SmsModule, {
  addSmsReceivedListener,
  type SmsMessage,
} from "../../../modules/sms-module";

// Dec 1 2025 00:00:00 IST
const SINCE_TIMESTAMP = 1764527400000;

function toPermissionState(status: string): "granted" | "denied" | "unknown" {
  if (status === "granted") return "granted";
  if (status === "denied") return "denied";
  return "unknown";
}

type SmsContextValue = {
  permission: "granted" | "denied" | "unknown";
  loading: boolean;
  listening: boolean;
  error: string | null;
  messages: SmsMessage[];
  pendingCount: number | null;
  onGrant: () => Promise<void>;
  onRead: () => Promise<void>;
  onReadAll: () => Promise<void>;
  onReadSince: () => Promise<void>;
  onToggleListen: () => Promise<void>;
  onFakeFinancial: () => Promise<void>;
  onFakeOtp: () => Promise<void>;
  onFakePromo: () => Promise<void>;
  onFakeDelayed: () => Promise<void>;
  onCheckQueue: () => Promise<void>;
  onClearQueue: () => Promise<void>;
  onClearDb: () => Promise<void>;
};

const SmsContext = createContext<SmsContextValue | null>(null);

export function useSms(): SmsContextValue {
  const ctx = useContext(SmsContext);
  if (!ctx) throw new Error("useSms must be used inside SmsProvider");
  return ctx;
}

export function SmsProvider({ children }: PropsWithChildren) {
  const [permission, setPermission] = useState<"granted" | "denied" | "unknown">("unknown");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<SmsMessage[]>([]);
  const [pendingCount, setPendingCount] = useState<number | null>(null);

  useEffect(() => {
    SmsModule.getSmsPermissionStatus()
      .then((res) => {
        const state = toPermissionState(res.status);
        setPermission(state);
        if (state === "granted") {
          SmsModule.startListening()
            .then(() => setListening(true))
            .catch(() => {});
        }
      })
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : String(e)),
      );
    loadTransactions()
      .then((saved) => {
        if (saved.length > 0) setMessages(saved);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!listening) return;
    const sub = addSmsReceivedListener((msg) => {
      setMessages((prev) => [msg, ...prev]);
      saveTransaction(msg, null).catch(() => {});
    });
    return () => sub.remove();
  }, [listening]);

  const onGrant = useCallback(async () => {
    setError(null);
    try {
      const res = await SmsModule.requestSmsPermission();
      const state = toPermissionState(res.status);
      setPermission(state);
      if (!res.granted) {
        setError("SMS permission required");
      } else {
        await SmsModule.startListening();
        setListening(true);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  const onRead = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const list = await SmsModule.getRecentSms(50);
      setMessages(list);
      saveTransactions(list, true).catch(() => {});
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  const onReadAll = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const list = await SmsModule.getAllSms();
      setMessages(list);
      saveTransactions(list, true).catch(() => {});
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  const onReadSince = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const list = await SmsModule.getSmsAfterDate(SINCE_TIMESTAMP);
      setMessages(list);
      saveTransactions(list, true).catch(() => {});
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  const onToggleListen = useCallback(async () => {
    setError(null);
    try {
      if (listening) {
        await SmsModule.stopListening();
        setListening(false);
      } else {
        await SmsModule.startListening();
        setListening(true);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, [listening]);

  const onFakeFinancial = useCallback(async () => {
    setError(null);
    try {
      await SmsModule.simulateIncomingSms(
        "VM-HDFCBK",
        "Rs.1,299.00 debited from card xx5678 at Swiggy on 30-05-2026. Avl bal: Rs.24,500.00. UPI Ref: 734829104856",
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  const onFakeOtp = useCallback(async () => {
    setError(null);
    try {
      await SmsModule.simulateIncomingSms(
        "AD-PAYTM",
        "Your OTP for Paytm login is 482910. Valid for 10 minutes. Do not share with anyone.",
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  const onFakePromo = useCallback(async () => {
    setError(null);
    try {
      await SmsModule.simulateIncomingSms(
        "AD-AMAZON",
        "Hurry! Flat 40% off on electronics. Limited time offer. Click here to shop now and save big!",
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  const onFakeDelayed = useCallback(async () => {
    setError(null);
    try {
      await SmsModule.scheduleSimulatedSms(
        "VM-ICICIB",
        "Rs.699.00 debited from card xx1234 at Zomato on 30-05-2026. Avl bal: Rs.12,800.00",
        20,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  const onCheckQueue = useCallback(async () => {
    setError(null);
    try {
      const pending = await SmsModule.getPendingBackgroundSms();
      setPendingCount(pending.length);
      if (pending.length > 0) setMessages(pending);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  const onClearQueue = useCallback(async () => {
    setError(null);
    try {
      await SmsModule.clearPendingBackgroundSms();
      setPendingCount(0);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  const onClearDb = useCallback(async () => {
    setError(null);
    try {
      await clearAllTransactions();
      setMessages([]);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  return (
    <SmsContext.Provider
      value={{
        permission,
        loading,
        listening,
        error,
        messages,
        pendingCount,
        onGrant,
        onRead,
        onReadAll,
        onReadSince,
        onToggleListen,
        onFakeFinancial,
        onFakeOtp,
        onFakePromo,
        onFakeDelayed,
        onCheckQueue,
        onClearQueue,
        onClearDb,
      }}
    >
      {children}
    </SmsContext.Provider>
  );
}
