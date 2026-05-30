import { memo } from "react";
import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "@mobile/lib/theme";
import { Fonts } from "@mobile/lib/fonts";
import AppText from "@mobile/components/ui/text";

type Props = {
  totalSpend: number;
  accountCount: number;
  txnCount: number;
};

function formatINR(value: number): string {
  return "₹" + value.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

function SummaryCard({ totalSpend, accountCount, txnCount }: Props) {
  const { theme } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.surface, shadowColor: theme.black }]}>
      <View style={styles.topRow}>
        <View style={styles.topLeft}>
          <View style={[styles.iconWrapper, { backgroundColor: theme.success + "1A" }]}>
            <Ionicons name="wallet-outline" size={18} color={theme.success} />
          </View>
          <AppText variant="captionSemiBold" themeKey="textSecondary" style={styles.totalLabel}>
            Total spend
          </AppText>
        </View>
        <AppText variant="small" themeKey="textMuted">
          {accountCount} account{accountCount !== 1 ? "s" : ""}
        </AppText>
      </View>

      <AppText
        themeKey="text"
        style={[styles.amount, { color: theme.text }]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {formatINR(totalSpend)}
      </AppText>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: theme.surfaceSecondary, shadowColor: theme.black }]}>
          <View style={styles.statHeader}>
            <Ionicons name="receipt-outline" size={14} color={theme.textMuted} />
            <AppText variant="small" themeKey="textMuted" style={styles.statLabel}>
              Transactions
            </AppText>
          </View>
          <AppText themeKey="text" style={[styles.statValue, { color: theme.text }]}>
            {txnCount}
          </AppText>
        </View>

        <View style={[styles.statCard, { backgroundColor: theme.surfaceSecondary, shadowColor: theme.black }]}>
          <View style={styles.statHeader}>
            <Ionicons name="card-outline" size={14} color={theme.textMuted} />
            <AppText variant="small" themeKey="textMuted" style={styles.statLabel}>
              Accounts
            </AppText>
          </View>
          <AppText themeKey="text" style={[styles.statValue, { color: theme.text }]}>
            {accountCount}
          </AppText>
        </View>
      </View>
    </View>
  );
}

export default memo(SummaryCard);

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  topLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  totalLabel: {
    letterSpacing: 0.1,
  },
  amount: {
    fontSize: 32,
    fontFamily: Fonts.semibold,
    lineHeight: 40,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    elevation: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  statHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 6,
  },
  statLabel: {
    letterSpacing: 0.1,
  },
  statValue: {
    fontSize: 22,
    fontFamily: Fonts.semibold,
    lineHeight: 28,
  },
});
