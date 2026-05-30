import { memo } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import AppText from "@mobile/components/ui/text";
import { useTheme } from "@mobile/lib/theme";
import { Fonts } from "@mobile/lib/fonts";

type Props = {
  totalSpend: number;
  accountCount: number;
};

function formatInr(value: number): string {
  return "₹" + value.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

function MonthlySummaryCard({ totalSpend, accountCount }: Props) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
        },
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.labelRow}>
          <View style={[styles.iconWrap, { backgroundColor: "#FEF3C7" }]}>
            <Ionicons name="wallet-outline" size={16} color="#F59E0B" />
          </View>
          <AppText variant="small" themeKey="textSecondary" style={styles.label}>
            Total outstanding
          </AppText>
        </View>
        <AppText variant="small" themeKey="textMuted" style={styles.accountCount}>
          {accountCount} {accountCount === 1 ? "account" : "accounts"}
        </AppText>
      </View>
      <AppText style={[styles.amount, { color: theme.text }]}>
        {formatInr(totalSpend)}
      </AppText>
    </View>
  );
}

export default memo(MonthlySummaryCard);

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    gap: 10,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 13,
  },
  accountCount: {
    fontSize: 12,
  },
  amount: {
    fontSize: 32,
    fontFamily: Fonts.semibold,
    letterSpacing: -1,
    lineHeight: 38,
  },
});
