import { useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "@mobile/lib/theme";
import { useAccountsStore } from "@mobile/store/slices/accounts";
import { useSmsStore } from "@mobile/store/slices/sms";
import HomeHeader from "@mobile/components/home/HomeHeader";
import MonthlySummaryCard from "@mobile/components/home/MonthlySummaryCard";
import AccountStats from "@mobile/components/home/AccountStats";
import MonthlyOverview from "@mobile/components/home/MonthlyOverview";
import AccountList from "@mobile/components/home/AccountList";
import AppText from "@mobile/components/ui/text";

function getMonthBounds(): { start: number; end: number } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).getTime();
  return { start, end };
}

export default function HomeScreen() {
  const { theme } = useTheme();
  const accounts = useAccountsStore((s) => s.accounts);
  const transactions = useSmsStore((s) => s.messages);

  const { currentMonthTxns, totalSpend, totalCredit, due, overdue } = useMemo(() => {
    const { start, end } = getMonthBounds();
    const now = Date.now();

    const currentMonthTxns = transactions.filter(
      (t) => t.category === "financial" && t.timestamp >= start && t.timestamp <= end,
    );

    const totalSpend = currentMonthTxns
      .filter((t) => t.transactionType === "debit")
      .reduce((sum, t) => sum + (t.amount ?? 0), 0);

    const totalCredit = currentMonthTxns
      .filter(
        (t) =>
          t.transactionType === "credit" ||
          t.transactionType === "refund" ||
          t.transactionType === "payment",
      )
      .reduce((sum, t) => sum + (t.amount ?? 0), 0);

    const due = accounts.filter(
      (a) => a.dueDate !== null && a.dueDate > now,
    ).length;

    const overdue = accounts.filter(
      (a) => a.dueDate !== null && a.dueDate < now,
    ).length;

    return { currentMonthTxns, totalSpend, totalCredit, due, overdue };
  }, [transactions, accounts]);

  const hasNoData = accounts.length === 0 && transactions.length === 0;

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.background }]}
      edges={["top", "left", "right"]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <HomeHeader />

        <MonthlySummaryCard
          totalSpend={totalSpend}
          accountCount={accounts.length}
        />

        <AccountStats
          total={accounts.length}
          due={due}
          overdue={overdue}
          paid={0}
        />

        <MonthlyOverview debit={totalSpend} credit={totalCredit} />

        <AccountList accounts={accounts} transactions={transactions} />

        {hasNoData && (
          <View style={styles.emptyState}>
            <AppText variant="caption" themeKey="textMuted" style={styles.emptyText}>
              Import SMS from the List tab to see your accounts and transactions.
            </AppText>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scroll: {
    paddingBottom: 40,
  },
  emptyState: {
    paddingHorizontal: 32,
    paddingTop: 8,
    alignItems: "center",
  },
  emptyText: {
    textAlign: "center",
    lineHeight: 20,
  },
});
