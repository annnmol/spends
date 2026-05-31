import { memo, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";

import { useTheme } from "@mobile/lib/theme";
import AppText from "@mobile/components/ui/text";
import type { Account } from "@mobile/db/accounts";
import type { Transaction } from "@mobile/db/transcations";
import AccountSpendRow from "./AccountSpendRow";
import { getRangeBounds, type TimeRange } from "./types";

type Props = {
  accounts: Account[];
  transactions: Transaction[];
  range: TimeRange;
};

const ACCOUNT_COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#EF4444",
  "#06B6D4",
  "#EC4899",
  "#14B8A6",
];

type AccountRow = {
  account: Account;
  amount: number;
  txnCount: number;
  percentage: number;
  color: string;
};

function AccountSpendList({ accounts, transactions, range }: Props) {
  const { theme } = useTheme();
  const router = useRouter();

  const rows: AccountRow[] = useMemo(() => {
    const { start, end } = getRangeBounds(range);

    const totals: Record<number, { amount: number; txnCount: number }> = {};

    for (const t of transactions) {
      if (
        t.transactionType !== "DEBIT" ||
        t.amount === null ||
        t.accountId === null ||
        t.timestamp < start ||
        t.timestamp > end
      ) {
        continue;
      }
      if (!totals[t.accountId]) {
        totals[t.accountId] = { amount: 0, txnCount: 0 };
      }
      totals[t.accountId].amount += t.amount;
      totals[t.accountId].txnCount += 1;
    }

    const totalSpend = Object.values(totals).reduce((s, v) => s + v.amount, 0);

    return accounts
      .filter((a) => totals[a.id] !== undefined && totals[a.id].amount > 0)
      .sort((a, b) => totals[b.id].amount - totals[a.id].amount)
      .map((account, idx) => ({
        account,
        amount: totals[account.id].amount,
        txnCount: totals[account.id].txnCount,
        percentage: totalSpend > 0 ? (totals[account.id].amount / totalSpend) * 100 : 0,
        color: ACCOUNT_COLORS[idx % ACCOUNT_COLORS.length],
      }));
  }, [accounts, transactions, range]);

  return (
    <View style={[styles.card, { backgroundColor: theme.surface, shadowColor: theme.black }]}>
      <AppText variant="captionSemiBold" themeKey="textSecondary" style={styles.sectionLabel}>
        Spend by account
      </AppText>

      {rows.length === 0 ? (
        <View style={styles.empty}>
          <AppText variant="caption" themeKey="textMuted" style={styles.emptyText}>
            No account spend data for this period
          </AppText>
        </View>
      ) : (
        rows.map((row) => (
          <AccountSpendRow
            key={row.account.id}
            account={row.account}
            amount={row.amount}
            percentage={row.percentage}
            txnCount={row.txnCount}
            color={row.color}
            onPress={() => router.push(`/account/${row.account.id}`)}
          />
        ))
      )}
    </View>
  );
}

export default memo(AccountSpendList);

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
});
