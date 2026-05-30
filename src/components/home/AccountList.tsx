import { memo, useMemo } from "react";
import { StyleSheet, View } from "react-native";

import AppText from "@mobile/components/ui/text";
import { useTheme } from "@mobile/lib/theme";
import { Fonts } from "@mobile/lib/fonts";
import type { Account } from "@mobile/lib/accounts";
import type { Transaction } from "@mobile/lib/transactions";
import AccountCard from "./AccountCard";

type Props = {
  accounts: Account[];
  transactions: Transaction[];
};

function AccountList({ accounts, transactions }: Props) {
  const { theme } = useTheme();

  const sorted = useMemo(
    () =>
      [...accounts].sort((a, b) => {
        if (a.dueDate === null && b.dueDate === null) return 0;
        if (a.dueDate === null) return 1;
        if (b.dueDate === null) return -1;
        return a.dueDate - b.dueDate;
      }),
    [accounts],
  );

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <AppText style={[styles.sectionTitle, { color: theme.text }]}>
          All statements
        </AppText>
        <View style={[styles.countBadge, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}>
          <AppText style={[styles.countText, { color: theme.textSecondary }]}>
            {accounts.length}
          </AppText>
        </View>
      </View>

      {sorted.length === 0 ? (
        <View style={styles.empty}>
          <AppText variant="caption" themeKey="textMuted" style={styles.emptyText}>
            No accounts added yet
          </AppText>
        </View>
      ) : (
        sorted.map((account) => (
          <AccountCard
            key={account.id}
            account={account}
            transactions={transactions}
          />
        ))
      )}
    </View>
  );
}

export default memo(AccountList);

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: Fonts.semibold,
    lineHeight: 20,
  },
  countBadge: {
    borderRadius: 10,
    borderWidth: 1,
    minWidth: 24,
    height: 24,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  countText: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    lineHeight: 16,
  },
  empty: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 32,
  },
  emptyText: {
    textAlign: "center",
  },
});
