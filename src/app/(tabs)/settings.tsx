import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import PermissionStatus from "@mobile/components/sms/PermissionStatus";
import AppButton from "@mobile/components/ui/button";
import AppText from "@mobile/components/ui/text";
import { useSmsStore } from "@mobile/store/slices/sms";

import { useAccountsStore } from "@mobile/store/slices/accounts";
// import { useMerchantsStore } from "@mobile/store/slices/merchants"; // v2: merchants disabled

export default function SettingsScreen() {
  const permission = useSmsStore((s) => s.permission);
  const loading = useSmsStore((s) => s.loading);
  const listening = useSmsStore((s) => s.listening);
  const error = useSmsStore((s) => s.error);
  const messageCount = useSmsStore((s) => s.messages.length);
  const pendingCount = useSmsStore((s) => s.pendingCount);

  const canRead = permission === "granted";
  const store = useSmsStore.getState;
  async function handleClearAll() {
    await useSmsStore.getState().clearTransactions();
    await useAccountsStore.getState().clearAccounts();
    // await useMerchantsStore.getState().clearMerchants(); // v2: merchants disabled
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <AppText variant="title">SMS Finance Tracker</AppText>
        <PermissionStatus state={permission} />
        {messageCount > 0 && (
          <AppText variant="caption" style={styles.dim}>
            {messageCount} messages loaded{listening ? "  •  live" : ""}
          </AppText>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.inner}>
        <AppButton onPress={() => store().grantPermission()} variant="outline">
          Grant SMS Permission
        </AppButton>
        <AppButton
          onPress={() => store().readRecent()}
          disabled={!canRead || loading}
        >
          {loading ? "Reading…" : "Read Last 50 SMS"}
        </AppButton>
        <AppButton
          onPress={() => store().readAll()}
          disabled={!canRead || loading}
        >
          {loading ? "Reading…" : "Fetch All SMS"}
        </AppButton>
        <AppButton
          onPress={() => store().readSince()}
          disabled={!canRead || loading}
        >
          {loading ? "Reading…" : "SMS since 01-12-2025"}
        </AppButton>
        <AppButton
          onPress={() => store().toggleListening()}
          disabled={!canRead}
          variant={listening ? "outline" : undefined}
        >
          {listening ? "Stop Listening" : "Start Live Listener"}
        </AppButton>

        <View style={styles.inner}>
          <AppText variant="caption" style={styles.section}>
            Listener
          </AppText>
          <AppButton
            onPress={() => useSmsStore.getState().toggleListening()}
            disabled={!canRead}
            variant={listening ? "outline" : undefined}
          >
            {listening ? "Stop Live Listener" : "Start Live Listener"}
          </AppButton>

          <AppText variant="caption" style={styles.section}>
            Database
          </AppText>
          <AppButton onPress={handleClearAll} variant="outline">
            Clear All Data (Transactions + Accounts)
          </AppButton>
        </View>
        <AppText variant="caption" style={styles.section}>
          Simulate SMS
        </AppText>
        <AppButton onPress={() => store().fakeFinancial()} variant="outline">
          Fake Financial SMS
        </AppButton>
        <AppButton onPress={() => store().fakeOtp()} variant="outline">
          Fake OTP SMS
        </AppButton>
        <AppButton onPress={() => store().fakePromo()} variant="outline">
          Fake Promo SMS
        </AppButton>
        <AppButton onPress={() => store().fakeDelayed()} variant="outline">
          Fake SMS in 20s (background test)
        </AppButton>

        <AppText variant="caption" style={styles.section}>
          Background Queue
          {pendingCount !== null ? `  •  ${pendingCount} pending` : ""}
        </AppText>
        <AppButton onPress={() => store().checkQueue()} variant="outline">
          Check Queue
        </AppButton>
        <AppButton onPress={() => store().clearQueue()} variant="outline">
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f9fafb" },
  header: { padding: 16, gap: 8 },
  inner: { padding: 16, gap: 8 },
  dim: { color: "#6b7280" },
  section: { color: "#9ca3af", marginTop: 4 },
  errorBox: {
    margin: 16,
    padding: 12,
    backgroundColor: "#fee2e2",
    borderRadius: 8,
  },
  errorText: { color: "#991b1b" },
});
