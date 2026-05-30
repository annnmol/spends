import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


export default function HomeScreen() {
  return (
    <SafeAreaView
      style={styles.safe}
      edges={["top", "left", "right"]}
    ></SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f9fafb" },
  header: { padding: 16 },
  inner: { padding: 16, gap: 8 },
  section: { color: "#9ca3af", marginTop: 8 },
});
