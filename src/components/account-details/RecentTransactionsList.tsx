import { memo, useMemo } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "@mobile/lib/theme";
import AppText from "@mobile/components/ui/text";
import type { Transaction } from "@mobile/db/transcations";
import RecentTransactionItem from "./RecentTransactionItem";

type Props = {
  transactions: Transaction[];
  accountId: number;
};

function getMonthKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function getMonthLabel(key: string): string {
  const [year, month] = key.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleString("en-IN", { month: "long", year: "numeric" });
}

type GroupedItem =
  | { type: "header"; key: string; label: string }
  | { type: "txn"; txn: Transaction };

function RecentTransactionsList({ transactions, accountId }: Props) {
  const { theme } = useTheme();

  const grouped: GroupedItem[] = useMemo(() => {
    const filtered = transactions
      .filter(
        (t) =>
          t.accountId === accountId &&
          ["DEBIT", "CREDIT", "REFUND", "PAYMENT"].includes(t.transactionType),
      )
      .slice(0, 20);

    const byMonth: Record<string, Transaction[]> = {};
    for (const t of filtered) {
      const key = getMonthKey(t.timestamp);
      if (!byMonth[key]) byMonth[key] = [];
      byMonth[key].push(t);
    }

    const sortedKeys = Object.keys(byMonth).sort((a, b) => b.localeCompare(a));
    const items: GroupedItem[] = [];
    for (const key of sortedKeys) {
      items.push({ type: "header", key, label: getMonthLabel(key) });
      for (const txn of byMonth[key]) {
        items.push({ type: "txn", txn });
      }
    }
    return items;
  }, [transactions, accountId]);

  const txnCount = grouped.filter((i) => i.type === "txn").length;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionHeaderLeft}>
          <Ionicons name="list-outline" size={16} color={theme.textSecondary} />
          <AppText variant="captionSemiBold" themeKey="textSecondary" style={styles.sectionLabel}>
            Recent transactions
          </AppText>
        </View>
        <AppText variant="small" themeKey="textMuted">
          See all
        </AppText>
      </View>

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
        {txnCount === 0 ? (
          <AppText variant="caption" themeKey="textMuted" style={styles.empty}>
            No transactions
          </AppText>
        ) : (
          grouped.map((item, idx) => {
            if (item.type === "header") {
              return (
                <AppText
                  key={item.key}
                  variant="small"
                  themeKey="textMuted"
                  style={[styles.monthSeparator, idx > 0 && styles.monthSeparatorTop]}
                >
                  {item.label}
                </AppText>
              );
            }
            const isLast =
              idx === grouped.length - 1 ||
              (grouped[idx + 1] && grouped[idx + 1].type === "header");
            return (
              <View key={item.txn.id} style={isLast ? styles.lastRow : undefined}>
                <RecentTransactionItem txn={item.txn} />
              </View>
            );
          })
        )}
      </View>
    </View>
  );
}

export default memo(RecentTransactionsList);

const cardShadow = Platform.select({
  ios: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
  },
  android: {},
});

const styles = StyleSheet.create({
  section: {
    marginHorizontal: 16,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sectionHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sectionLabel: {
    letterSpacing: 0.2,
  },
  card: {
    borderRadius: 16,
    elevation: 2,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    ...cardShadow,
  },
  monthSeparator: {
    paddingTop: 4,
    paddingBottom: 2,
    letterSpacing: 0.2,
  },
  monthSeparatorTop: {
    marginTop: 8,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  empty: {
    textAlign: "center",
    paddingVertical: 24,
  },
});
