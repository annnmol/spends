import { memo, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "@mobile/lib/theme";
import AppText from "@mobile/components/ui/text";
import type { Transaction } from "@mobile/lib/transactions";
import type { Account } from "@mobile/lib/accounts";
import { getRangeBounds, type TimeRange } from "@mobile/components/insights/types";
import MonthlyHistoryCard from "./MonthlyHistoryCard";

type Props = {
  transactions: Transaction[];
  accountId: number;
  account: Account;
  range: TimeRange;
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

function buildDueDateForMonth(baseDay: number, monthKey: string): number {
  const [year, month] = monthKey.split("-").map(Number);
  const date = new Date(year, month - 1, baseDay);
  if (date.getDate() !== baseDay) {
    date.setDate(0);
  }
  return date.getTime();
}

type MonthEntry = {
  key: string;
  label: string;
  amount: number;
  txnCount: number;
  changePercent: number | null;
  dueDate: number | null;
  minDue: number | null;
};

function MonthlyHistoryList({ transactions, accountId, account, range }: Props) {
  const { theme } = useTheme();

  const entries: MonthEntry[] = useMemo(() => {
    const { start, end } = getRangeBounds(range);
    const totals: Record<string, { amount: number; txnCount: number }> = {};

    for (const t of transactions) {
      if (
        t.accountId !== accountId ||
        t.category !== "financial" ||
        t.transactionType !== "debit" ||
        t.amount === null ||
        t.timestamp < start ||
        t.timestamp > end
      ) {
        continue;
      }
      const key = getMonthKey(t.timestamp);
      if (!totals[key]) totals[key] = { amount: 0, txnCount: 0 };
      totals[key].amount += t.amount;
      totals[key].txnCount += 1;
    }

    const sorted = Object.keys(totals).sort((a, b) => b.localeCompare(a));

    return sorted.map((key, idx) => {
      const current = totals[key].amount;
      const prevKey = sorted[idx + 1];
      let changePercent: number | null = null;
      if (prevKey !== undefined && totals[prevKey].amount > 0) {
        changePercent = ((current - totals[prevKey].amount) / totals[prevKey].amount) * 100;
      }

      const dueDate =
        account.type === "credit_card" && account.dueDate !== null
          ? buildDueDateForMonth(account.dueDate, key)
          : null;

      const minDue =
        account.type === "credit_card" ? Math.ceil(totals[key].amount * 0.05) : null;

      return {
        key,
        label: getMonthLabel(key),
        amount: totals[key].amount,
        txnCount: totals[key].txnCount,
        changePercent,
        dueDate,
        minDue,
      };
    });
  }, [transactions, accountId, account, range]);

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionHeaderLeft}>
          <Ionicons name="time-outline" size={16} color={theme.textSecondary} />
          <AppText variant="captionSemiBold" themeKey="textSecondary" style={styles.sectionLabel}>
            Monthly statements
          </AppText>
        </View>
        <AppText variant="small" themeKey="textMuted">
          {entries.length} bill{entries.length !== 1 ? "s" : ""}
        </AppText>
      </View>

      {entries.length === 0 ? (
        <AppText variant="caption" themeKey="textMuted" style={styles.empty}>
          No history available
        </AppText>
      ) : (
        entries.map((entry) => (
          <MonthlyHistoryCard
            key={entry.key}
            monthLabel={entry.label}
            amount={entry.amount}
            changePercent={entry.changePercent}
            dueDate={entry.dueDate}
            minDue={entry.minDue}
            txnCount={entry.txnCount}
            accountType={account.type}
          />
        ))
      )}
    </View>
  );
}

export default memo(MonthlyHistoryList);

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
  empty: {
    textAlign: "center",
    paddingVertical: 24,
  },
});
