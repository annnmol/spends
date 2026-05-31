import { memo } from "react";
import { Platform, StyleSheet, View } from "react-native";

import { useTheme } from "@mobile/lib/theme";
import { Fonts } from "@mobile/lib/fonts";
import AppText from "@mobile/components/ui/text";

type Props = {
  currentSpend: number;
  currentPeriodLabel: string;
  avgMonthly: number;
  peakAmount: number;
  peakLabel: string;
};

function formatINR(value: number): string {
  return "₹" + value.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

type StatCardProps = {
  label: string;
  amount: number;
  subtitle: string;
};

function StatCard({ label, amount, subtitle }: StatCardProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.surface,
          shadowColor: theme.black,
          borderColor: theme.border,
        },
      ]}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.dot, { backgroundColor: "#2563EB" }]} />
        <AppText variant="small" themeKey="textMuted" style={styles.label}>
          {label}
        </AppText>
      </View>
      <AppText style={[styles.amount, { color: theme.text }]}>{formatINR(amount)}</AppText>
      <AppText variant="small" themeKey="textMuted" style={styles.subtitle} numberOfLines={1}>
        {subtitle}
      </AppText>
    </View>
  );
}

function AccountStatsCards({
  currentSpend,
  currentPeriodLabel,
  avgMonthly,
  peakAmount,
  peakLabel,
}: Props) {
  return (
    <View style={styles.row}>
      <StatCard label="CURRENT" amount={currentSpend} subtitle={currentPeriodLabel} />
      <StatCard label="AVG" amount={avgMonthly} subtitle="per month" />
      <StatCard label="PEAK" amount={peakAmount} subtitle={peakLabel} />
    </View>
  );
}

export default memo(AccountStatsCards);

const cardShadow = Platform.select({
  ios: {
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  android: {},
});

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 16,
    gap: 8,
  },
  card: {
    flex: 1,
    borderRadius: 12,
    elevation: 1,
    padding: 12,
    borderWidth: StyleSheet.hairlineWidth,
    ...cardShadow,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  amount: {
    fontSize: 20,
    fontFamily: Fonts.semibold,
    lineHeight: 26,
    marginBottom: 2,
  },
  subtitle: {
    lineHeight: 14,
  },
});
