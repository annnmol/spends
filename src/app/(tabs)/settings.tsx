import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AppButton from "@mobile/components/ui/button";
import AppText from "@mobile/components/ui/text";
import { useAccountsStore } from "@mobile/store/slices/accounts";
import { useSmsStore } from "@mobile/store/slices/sms";

export default function SettingsScreen() {
  const listening = useSmsStore((s) => s.listening);
  const permission = useSmsStore((s) => s.permission);

  const canRead = permission === "granted";

  async function handleClearAll() {
    await useSmsStore.getState().clearTransactions();
    await useAccountsStore.getState().clearAccounts();
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <AppText variant="title">Settings</AppText>
      </View>

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f9fafb" },
  header: { padding: 16 },
  inner: { padding: 16, gap: 8 },
  section: { color: "#9ca3af", marginTop: 8 },
});
