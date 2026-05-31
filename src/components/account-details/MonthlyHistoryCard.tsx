import { memo } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "@mobile/lib/theme";
import { Fonts } from "@mobile/lib/fonts";
import AppText from "@mobile/components/ui/text";

type Props = {
  monthLabel: string;
  amount: number;
  changePercent: number | null;
  dueDate: number | null;
  minDue: number | null;
  txnCount: number;
  accountType: string;
};

function formatINR(value: number): string {
  return "₹" + value.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

function formatDueDate(ts: number): string {
  const d = new Date(ts);
  const day = String(d.getDate()).padStart(2, "0");
  const month = d.toLocaleString("en-IN", { month: "short" });
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

function MonthlyHistoryCard({
  monthLabel,
  amount,
  changePercent,
  dueDate,
  minDue,
  txnCount,
  accountType,
}: Props) {
  const { theme } = useTheme();

  const hasChange = changePercent !== null;
  const isDecrease = hasChange && changePercent < 0;
  const badgeColor = isDecrease ? theme.success : theme.danger;
  const badgeArrow = isDecrease ? "↓" : "↑";
  const badgeValue = hasChange ? `${badgeArrow} ${Math.abs(Math.round(changePercent))}%` : null;

  return (
    <View style={styles.outerRow}>
      <View style={[styles.leftBar, { backgroundColor: "#2563EB" }]} />

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
        <AppText variant="captionSemiBold" themeKey="textSecondary" style={styles.monthName}>
          {monthLabel}
        </AppText>

        <View style={styles.amountRow}>
          <AppText style={[styles.amount, { color: theme.text }]}>
            {formatINR(amount)}
          </AppText>
          {badgeValue !== null && (
            <View style={[styles.badge, { backgroundColor: isDecrease ? "#D1FAE5" : "#FEE2E2" }]}>
              <AppText style={[styles.badgeText, { color: badgeColor }]}>
                {badgeValue}
              </AppText>
            </View>
          )}
        </View>

        {accountType === "credit_card" ? (
          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={12} color={theme.textMuted} />
            <AppText variant="small" themeKey="textMuted" style={styles.metaText}>
              {dueDate !== null
                ? `Due ${formatDueDate(dueDate)} · Min ${minDue !== null ? formatINR(minDue) : "—"}`
                : "No due date"}
            </AppText>
          </View>
        ) : (
          <AppText variant="small" themeKey="textMuted">
            {txnCount} transaction{txnCount !== 1 ? "s" : ""}
          </AppText>
        )}
      </View>
    </View>
  );
}

export default memo(MonthlyHistoryCard);

const cardShadow = Platform.select({
  ios: {
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  android: {},
});

const styles = StyleSheet.create({
  outerRow: {
    flexDirection: "row",
    gap: 0,
    marginBottom: 8,
  },
  leftBar: {
    width: 3,
    borderRadius: 2,
    alignSelf: "stretch",
  },
  card: {
    flex: 1,
    borderRadius: 12,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    elevation: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    gap: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderLeftWidth: 0,
    ...cardShadow,
  },
  monthName: {
    letterSpacing: 0.1,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  amount: {
    fontSize: 20,
    fontFamily: Fonts.semibold,
    lineHeight: 26,
  },
  badge: {
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: Fonts.medium,
    lineHeight: 16,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    flex: 1,
  },
});
