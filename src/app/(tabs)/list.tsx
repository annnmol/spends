import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import SmsCard from "@mobile/components/sms/SmsCard";
import AppText from "@mobile/components/ui/text";
import { useSms } from "@mobile/store/context/sms-context";

export default function ListScreen() {
  const { messages, loading, permission } = useSms();

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <AppText variant="title">Transactions</AppText>
        {messages.length > 0 && (
          <AppText variant="caption" style={styles.dim}>
            {messages.length} messages
          </AppText>
        )}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <SmsCard item={item} />}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.center}>
              <AppText variant="caption" style={styles.dim}>
                {permission !== "granted"
                  ? "Grant SMS permission on the Home tab"
                  : "No messages — use Home tab to read SMS"}
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
  header: { padding: 16, gap: 4 },
  list: { padding: 16, paddingTop: 4, flexGrow: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 48 },
  dim: { color: "#6b7280" },
});
