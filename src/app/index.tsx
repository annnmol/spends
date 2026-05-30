import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import PermissionStatus, {
  type PermissionState,
} from "@mobile/components/sms/PermissionStatus";
import SmsCard from "@mobile/components/sms/SmsCard";
import AppButton from "@mobile/components/ui/button";
import AppText from "@mobile/components/ui/text";
import SmsModule, { type SmsMessage } from "../../modules/sms-module";

function toState(status: string): PermissionState {
  if (status === "granted") return "granted";
  if (status === "denied") return "denied";
  return "unknown";
}

export default function HomeScreen() {
  const [permission, setPermission] = useState<PermissionState>("unknown");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<SmsMessage[]>([]);

  useEffect(() => {
    SmsModule.getSmsPermissionStatus()
      .then((res) => setPermission(toState(res.status)))
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : String(e)),
      );
  }, []);

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

      console.log(`🚀 ~ HomeScreen ~ list:`, { list });

      setMessages(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  const canRead = permission === "granted";

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <AppText variant="title">SMS Reader Native Demo</AppText>
        <PermissionStatus state={permission} />
      </View>

      <View style={styles.actions}>
        <AppButton onPress={onGrant} variant="outline">
          Grant SMS Permission
        </AppButton>
        <AppButton onPress={onRead} disabled={!canRead || loading}>
          {loading ? "Reading…" : "Read Last 20 SMS"}
        </AppButton>
      </View>

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
  actions: { paddingHorizontal: 16, gap: 8 },
  errorBox: {
    margin: 16,
    padding: 12,
    backgroundColor: "#fee2e2",
    borderRadius: 8,
  },
  errorText: { color: "#991b1b" },
  list: { padding: 16, paddingTop: 12, flexGrow: 1 },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },
  emptyText: { color: "#6b7280" },
});
