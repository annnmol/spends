import { useMemo, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "@mobile/lib/theme";
import { useAccountsStore } from "@mobile/store/slices/accounts";
import { useSmsStore } from "@mobile/store/slices/sms";
import InsightsHeader from "@mobile/components/insights/InsightsHeader";
import SummaryCard from "@mobile/components/insights/SummaryCard";
import TimeRangeSelector from "@mobile/components/insights/TimeRangeSelector";
import SpendingTrendChart from "@mobile/components/insights/SpendingTrendChart";
import AccountSpendList from "@mobile/components/insights/AccountSpendList";
import MerchantSpendList from "@mobile/components/insights/MerchantSpendList";
import NetFlowCard from "@mobile/components/insights/NetFlowCard";
import { getRangeBounds, type TimeRange } from "@mobile/components/insights/types";

export default function InsightsScreen() {
  const { theme } = useTheme();
  const accounts = useAccountsStore((s) => s.accounts);
  const transactions = useSmsStore((s) => s.messages);

  const [range, setRange] = useState<TimeRange>("last_12");

  const { totalSpend, totalCredit, txnCount, filteredTxns } = useMemo(() => {
    const { start, end } = getRangeBounds(range);

    const filteredTxns = transactions.filter(
      (t) =>
        ["DEBIT", "CREDIT", "REFUND", "PAYMENT"].includes(t.transactionType) &&
        t.timestamp >= start &&
        t.timestamp <= end,
    );

    const totalSpend = filteredTxns
      .filter((t) => t.transactionType === "DEBIT" && t.amount !== null)
      .reduce((sum, t) => sum + (t.amount ?? 0), 0);

    const totalCredit = filteredTxns
      .filter(
        (t) =>
          (t.transactionType === "CREDIT" ||
            t.transactionType === "REFUND" ||
            t.transactionType === "PAYMENT") &&
          t.amount !== null,
      )
      .reduce((sum, t) => sum + (t.amount ?? 0), 0);

    const txnCount = filteredTxns.filter(
      (t) => t.transactionType === "DEBIT",
    ).length;

    return { totalSpend, totalCredit, txnCount, filteredTxns };
  }, [transactions, range]);

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.background }]}
      edges={["top", "left", "right"]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <InsightsHeader />

        <SummaryCard
          totalSpend={totalSpend}
          accountCount={accounts.length}
          txnCount={txnCount}
        />

        <TimeRangeSelector selected={range} onSelect={setRange} />

        <SpendingTrendChart transactions={filteredTxns} range={range} />

        <NetFlowCard debit={totalSpend} credit={totalCredit} />

        <AccountSpendList
          accounts={accounts}
          transactions={filteredTxns}
          range={range}
        />

        <MerchantSpendList transactions={filteredTxns} range={range} />
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
});
