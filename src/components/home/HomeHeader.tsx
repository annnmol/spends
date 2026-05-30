import { Ionicons } from "@expo/vector-icons";
import { memo } from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";

import AppText from "@mobile/components/ui/text";
import { Fonts } from "@mobile/lib/fonts";
import { useTheme } from "@mobile/lib/theme";
import { useSmsStore } from "@mobile/store/slices/sms";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good night";
}

function HomeHeader() {
  const { theme } = useTheme();
  const loading = useSmsStore((s) => s.loading);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.left}>
        <AppText variant="small" themeKey="textMuted" style={styles.greeting}>
          {getGreeting()}
        </AppText>
        <AppText style={[styles.title, { color: theme.text }]}>Anmol</AppText>
      </View>
      <TouchableOpacity
        onPress={() => useSmsStore.getState().readRecent()}
        style={[
          styles.syncButton,
          {
            borderColor: theme.border,
            backgroundColor: theme.surface,
          },
        ]}
        activeOpacity={0.7}
        accessibilityLabel="Sync transactions"
        accessibilityRole="button"
        disabled={loading}
      >
        <Ionicons
          name="sync-outline"
          size={18}
          color={loading ? theme.textMuted : theme.text}
        />
      </TouchableOpacity>
    </View>
  );
}

export default memo(HomeHeader);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  left: {
    gap: 2,
  },
  greeting: {
    fontSize: 13,
    lineHeight: 16,
  },
  title: {
    fontSize: 26,
    fontFamily: Fonts.semibold,
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  syncButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
});
