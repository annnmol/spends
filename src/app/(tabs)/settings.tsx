import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AppButton from "@mobile/components/ui/button";
import AppText from "@mobile/components/ui/text";
import { useSms } from "@mobile/store/context/sms-context";

export default function SettingsScreen() {
  const { listening, onToggleListen, onClearDb, permission } = useSms();

  const canRead = permission === "granted";

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
          onPress={onToggleListen}
          disabled={!canRead}
          variant={listening ? "outline" : undefined}
        >
          {listening ? "Stop Live Listener" : "Start Live Listener"}
        </AppButton>

        <AppText variant="caption" style={styles.section}>
          Database
        </AppText>
        <AppButton onPress={onClearDb} variant="outline">
          Clear All Transactions (DB)
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
