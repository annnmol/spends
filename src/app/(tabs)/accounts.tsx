import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AppText from "@mobile/components/ui/text";

export default function AccountsScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <AppText variant="title">Accounts</AppText>
      </View>
      <View style={styles.center}>
        <AppText variant="caption" style={styles.dim}>
          Coming soon — Step 8: Card Management
        </AppText>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f9fafb" },
  header: { padding: 16 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  dim: { color: "#6b7280" },
});
