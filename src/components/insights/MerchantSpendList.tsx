import { memo, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "@mobile/lib/theme";
import { Fonts } from "@mobile/lib/fonts";
import AppText from "@mobile/components/ui/text";
import { getInitialAndColor } from "@mobile/lib/get-icon";
import type { Transaction } from "@mobile/lib/transactions";
import { getRangeBounds, type TimeRange } from "./types";

type Props = {
  transactions: Transaction[];
  range: TimeRange;
};

type MerchantRow = {
  merchant: string;
  amount: number;
  txnCount: number;
  percentage: number;
  letter: string;
  color: string;
};

function formatINR(value: number): string {
  return "₹" + value.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

function MerchantSpendList({ transactions, range }: Props) {
  const { theme } = useTheme();

  const rows: MerchantRow[] = useMemo(() => {
    const { start, end } = getRangeBounds(range);

    const totals: Record<string, { amount: number; txnCount: number }> = {};

    for (const t of transactions) {
      if (
        t.category !== "financial" ||
        t.transactionType !== "debit" ||
        t.merchant === null ||
        t.amount === null ||
        t.timestamp < start ||
        t.timestamp > end
      ) {
        continue;
      }
      const key = t.merchant.trim();
      if (!totals[key]) {
        totals[key] = { amount: 0, txnCount: 0 };
      }
      totals[key].amount += t.amount;
      totals[key].txnCount += 1;
    }

    const totalSpend = Object.values(totals).reduce((s, v) => s + v.amount, 0);

    return Object.entries(totals)
      .sort(([, a], [, b]) => b.amount - a.amount)
      .slice(0, 10)
      .map(([merchant, data]) => {
        const { letter, color } = getInitialAndColor(merchant);
        return {
          merchant,
          amount: data.amount,
          txnCount: data.txnCount,
          percentage: totalSpend > 0 ? (data.amount / totalSpend) * 100 : 0,
          letter,
          color,
        };
      });
  }, [transactions, range]);

  return (
    <View style={[styles.card, { backgroundColor: theme.surface, shadowColor: theme.black }]}>
      <AppText variant="captionSemiBold" themeKey="textSecondary" style={styles.sectionLabel}>
        Spend by merchant
      </AppText>

      {rows.length === 0 ? (
        <View style={styles.empty}>
          <AppText variant="caption" themeKey="textMuted" style={styles.emptyText}>
            No merchant data available
          </AppText>
        </View>
      ) : (
        rows.map((row, idx) => (
          <View
            key={row.merchant}
            style={[
              styles.row,
              { borderBottomColor: theme.border },
              idx === rows.length - 1 && styles.rowLast,
            ]}
          >
            <View style={[styles.avatar, { backgroundColor: row.color }]}>
              <Text style={styles.avatarLetter}>{row.letter}</Text>
            </View>

            <View style={styles.info}>
              <View style={styles.topLine}>
                <AppText
                  variant="captionSemiBold"
                  themeKey="text"
                  style={styles.name}
                  numberOfLines={1}
                >
                  {row.merchant}
                </AppText>
                <AppText themeKey="text" style={[styles.amount, { color: theme.text }]}>
                  {formatINR(row.amount)}
                </AppText>
              </View>

              <View style={styles.subLine}>
                <AppText variant="small" themeKey="textMuted">
                  {row.txnCount} transaction{row.txnCount !== 1 ? "s" : ""}
                </AppText>
                <AppText variant="small" themeKey="textMuted">
                  {row.percentage.toFixed(0)}%
                </AppText>
              </View>

              <View style={[styles.progressTrack, { backgroundColor: theme.border }]}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(row.percentage, 100)}%`,
                      backgroundColor: row.color,
                    },
                  ]}
                />
              </View>
            </View>
          </View>
        ))
      )}
    </View>
  );
}

export default memo(MerchantSpendList);

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  sectionLabel: {
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  empty: {
    paddingVertical: 24,
    alignItems: "center",
  },
  emptyText: {
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLetter: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: Fonts.semibold,
    lineHeight: undefined,
  },
  info: {
    flex: 1,
  },
  topLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  name: {
    flex: 1,
    marginRight: 8,
  },
  amount: {
    fontSize: 15,
    fontFamily: Fonts.semibold,
    lineHeight: 20,
  },
  subLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  progressTrack: {
    height: 3,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: 3,
    borderRadius: 2,
  },
});
