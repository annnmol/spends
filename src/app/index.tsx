import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import PermissionStatus, {
  type PermissionState,
} from "@mobile/components/sms/PermissionStatus";
import SmsCard from "@mobile/components/sms/SmsCard";
import AppButton from "@mobile/components/ui/button";
import AppText from "@mobile/components/ui/text";
import SmsModule, {
  addSmsReceivedListener,
  type SmsMessage,
} from "../../modules/sms-module";

// Dec 1 2025 00:00:00 IST
const SINCE_TIMESTAMP = 1764527400000;

function toState(status: string): PermissionState {
  if (status === "granted") return "granted";
  if (status === "denied") return "denied";
  return "unknown";
}

export default function HomeScreen() {
  const [permission, setPermission] = useState<PermissionState>("unknown");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<SmsMessage[]>([]);
  const [pendingCount, setPendingCount] = useState<number | null>(null);

  useEffect(() => {
    SmsModule.getSmsPermissionStatus()
      .then((res) => setPermission(toState(res.status)))
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : String(e)),
      );
  }, []);

  // Subscribe to live SMS events while listening is active
  useEffect(() => {
    if (!listening) return;
    const sub = addSmsReceivedListener((msg) => {
      setMessages((prev) => [msg, ...prev]);
    });
    return () => sub.remove();
  }, [listening]);

  const onGrant = useCallback(async () => {
    setError(null);
    try {
      const res = await SmsModule.requestSmsPermission();
      setPermission(toState(res.status));
      if (!res.granted) setError("SMS permission required");
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

  const canRead = permission === "granted";

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <AppText variant="title">SMS Reader Native Demo</AppText>
        <PermissionStatus state={permission} />
        {messages.length > 0 && (
          <AppText variant="caption" style={styles.countText}>
            {messages.length} messages loaded
            {listening ? "  •  live" : ""}
          </AppText>
        )}
      </View>

      <ScrollView
        style={styles.actions}
        contentContainerStyle={styles.actionsInner}
      >
        <AppButton onPress={onGrant} variant="outline">
          Grant SMS Permission
        </AppButton>
        <AppButton onPress={onRead} disabled={!canRead || loading}>
          {loading ? "Reading…" : "Read Last 50 SMS"}
        </AppButton>
        <AppButton onPress={onReadAll} disabled={!canRead || loading}>
          {loading ? "Reading…" : "Fetch All SMS"}
        </AppButton>
        <AppButton onPress={onReadSince} disabled={!canRead || loading}>
          {loading ? "Reading…" : "SMS since 01-12-2025"}
        </AppButton>
        <AppButton
          onPress={onToggleListen}
          disabled={!canRead}
          variant={listening ? "outline" : undefined}
        >
          {listening ? "Stop Listening" : "Start Live Listener"}
        </AppButton>

        <AppText variant="caption" style={styles.sectionLabel}>
          Simulate SMS
        </AppText>
        <AppButton onPress={onFakeFinancial} variant="outline">
          Fake Financial SMS
        </AppButton>
        <AppButton onPress={onFakeOtp} variant="outline">
          Fake OTP SMS
        </AppButton>
        <AppButton onPress={onFakePromo} variant="outline">
          Fake Promo SMS
        </AppButton>
        <AppButton onPress={onFakeDelayed} variant="outline">
          Fake SMS in 60s (background test)
        </AppButton>

        <AppText variant="caption" style={styles.sectionLabel}>
          Background Queue{pendingCount !== null ? `  •  ${pendingCount} pending` : ""}
        </AppText>
        <AppButton onPress={onCheckQueue} variant="outline">
          Check Queue
        </AppButton>
        <AppButton onPress={onClearQueue} variant="outline">
          Clear Queue
        </AppButton>
      </ScrollView>

      {error ? (
        <View style={styles.errorBox}>
          <AppText variant="caption" style={styles.errorText}>
            {error}
          </AppText>
        </View>
      ) : null}

      {loading ? (
        <View style={styles.empty}>
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <SmsCard item={item} />}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <AppText variant="caption" style={styles.emptyText}>
                {permission !== "granted"
                  ? "SMS permission required"
                  : "No messages found"}
              </AppText>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f9fafb" },
  header: { padding: 16, gap: 8 },
  actions: { maxHeight: 260, paddingHorizontal: 16 },
  actionsInner: { gap: 8 },
  errorBox: {
    margin: 16,
    padding: 12,
    backgroundColor: "#fee2e2",
    borderRadius: 8,
  },
  errorText: { color: "#991b1b" },
  countText: { color: "#6b7280" },
  sectionLabel: { color: "#9ca3af", marginTop: 4 },
  list: { padding: 16, paddingTop: 12, flexGrow: 1 },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },
  emptyText: { color: "#6b7280" },
});
