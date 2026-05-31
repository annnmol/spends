import { memo, useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";

import { useTheme } from "@mobile/lib/theme";
import AppText from "@mobile/components/ui/text";
import { useAccountsStore } from "@mobile/store/slices/accounts";
import { useSmsStore } from "@mobile/store/slices/sms";
import { getRangeBounds, type TimeRange } from "@mobile/components/insights/types";
import AccountDetailHeader from "@mobile/components/account-details/AccountDetailHeader";
import AccountStatsCards from "@mobile/components/account-details/AccountStatsCards";
import AccountTrendChart from "@mobile/components/account-details/AccountTrendChart";
import MonthlyHistoryList from "@mobile/components/account-details/MonthlyHistoryList";
import RecentTransactionsList from "@mobile/components/account-details/RecentTransactionsList";

function getMonthKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonthShort(key: string): string {
  const [year, month] = key.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  const mon = date.toLocaleString("en-IN", { month: "short" });
  const yr = String(date.getFullYear()).slice(2);
  return `${mon} ${yr}`;
}

function AccountDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { theme } = useTheme();

  const accounts = useAccountsStore((s) => s.accounts);
  const messages = useSmsStore((s) => s.messages);

  const [range] = useState<TimeRange>("last_12");

  const accountId = Number(id);
  const account = useMemo(
    () => accounts.find((a) => a.id === accountId) ?? null,
    [accounts, accountId],
  );

  const accountTransactions = useMemo(
    () => messages.filter((t) => t.accountId === accountId),
    [messages, accountId],
  );

  const stats = useMemo(() => {
    const { start, end } = getRangeBounds(range);

    const filtered = accountTransactions.filter(
      (t) =>
        t.category === "financial" &&
        t.transactionType === "debit" &&
        t.amount !== null &&
        t.timestamp >= start &&
        t.timestamp <= end,
    );

    const currentSpend = filtered.reduce((s, t) => s + (t.amount ?? 0), 0);

    const byMonth: Record<string, number> = {};
    for (const t of filtered) {
      const key = getMonthKey(t.timestamp);
      byMonth[key] = (byMonth[key] ?? 0) + (t.amount ?? 0);
    }

    const monthlyValues = Object.values(byMonth);
    const avgMonthly =
      monthlyValues.length > 0
        ? Math.round(monthlyValues.reduce((s, v) => s + v, 0) / monthlyValues.length)
        : 0;

    let peakKey = "";
    let peakAmount = 0;
    for (const [key, val] of Object.entries(byMonth)) {
      if (val > peakAmount) {
        peakAmount = val;
        peakKey = key;
      }
    }

    const peakLabel = peakKey !== "" ? formatMonthShort(peakKey) : "—";

    const currentMonthKey = getMonthKey(Date.now());
    const currentPeriodLabel = formatMonthShort(currentMonthKey);

    return { currentSpend, avgMonthly, peakAmount, peakLabel, currentPeriodLabel };
  }, [accountTransactions, range]);

  if (account === null) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: theme.background }]}>
        <View style={styles.notFound}>
          <AppText variant="caption" themeKey="textMuted">
            Account not found
          </AppText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <AccountDetailHeader account={account} onBack={() => router.back()} />
        <AccountStatsCards
          currentSpend={stats.currentSpend}
          currentPeriodLabel={stats.currentPeriodLabel}
          avgMonthly={stats.avgMonthly}
          peakAmount={stats.peakAmount}
          peakLabel={stats.peakLabel}
        />
        <AccountTrendChart
          transactions={accountTransactions}
          accountId={accountId}
          range={range}
        />
        <MonthlyHistoryList
          transactions={accountTransactions}
          accountId={accountId}
          account={account}
          range={range}
        />
        <RecentTransactionsList
          transactions={accountTransactions}
          accountId={accountId}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

export default memo(AccountDetailScreen);

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
