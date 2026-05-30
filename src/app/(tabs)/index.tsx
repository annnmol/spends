import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import PermissionStatus from "@mobile/components/sms/PermissionStatus";
import AppButton from "@mobile/components/ui/button";
import AppText from "@mobile/components/ui/text";
import { useSms } from "@mobile/store/context/sms-context";

export default function HomeScreen() {
  const {
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
  } = useSms();

  const canRead = permission === "granted";

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <AppText variant="title">SMS Finance Tracker</AppText>
        <PermissionStatus state={permission} />
        {messages.length > 0 && (
          <AppText variant="caption" style={styles.dim}>
            {messages.length} messages loaded{listening ? "  •  live" : ""}
          </AppText>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.inner}>
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

        <AppText variant="caption" style={styles.section}>
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
          Fake SMS in 20s (background test)
        </AppButton>

        <AppText variant="caption" style={styles.section}>
          Background Queue
          {pendingCount !== null ? `  •  ${pendingCount} pending` : ""}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f9fafb" },
  header: { padding: 16, gap: 8 },
  inner: { padding: 16, gap: 8 },
  dim: { color: "#6b7280" },
  section: { color: "#9ca3af", marginTop: 4 },
  errorBox: { margin: 16, padding: 12, backgroundColor: "#fee2e2", borderRadius: 8 },
  errorText: { color: "#991b1b" },
});
