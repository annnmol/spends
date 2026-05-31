import { memo } from "react";
import { StyleSheet, View } from "react-native";

import { useTheme } from "@mobile/lib/theme";
import { Fonts } from "@mobile/lib/fonts";
import AppText from "@mobile/components/ui/text";
import type { Transaction } from "@mobile/lib/transactions";

type Props = {
  txn: Transaction;
};

function formatINR(value: number): string {
  return "₹" + value.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  const day = String(d.getDate()).padStart(2, "0");
  const month = d.toLocaleString("en-IN", { month: "short" });
  const hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const period = hours >= 12 ? "PM" : "AM";
  const h = hours % 12 || 12;
  return `${day} ${month}, ${h}:${minutes} ${period}`;
}

function isCredit(type: string): boolean {
  return type === "credit" || type === "refund" || type === "payment";
}

function RecentTransactionItem({ txn }: Props) {
  const { theme } = useTheme();

  const credit = isCredit(txn.transactionType);
  const amountColor = credit ? theme.success : theme.danger;
  const dotColor = credit ? theme.success : theme.danger;
  const sign = credit ? "+" : "−";
  const displayName = txn.merchant ?? txn.sender;

  return (
    <View style={[styles.row, { borderBottomColor: theme.border }]}>
      <View style={[styles.dot, { backgroundColor: dotColor }]} />

      <View style={styles.info}>
        <AppText
          variant="captionSemiBold"
          themeKey="text"
          numberOfLines={1}
          style={styles.merchant}
        >
          {displayName}
        </AppText>
        <AppText variant="small" themeKey="textMuted">
          {formatDate(txn.timestamp)}
        </AppText>
      </View>

      <View style={styles.amountCol}>
        <AppText style={[styles.amount, { color: amountColor }]}>
          {txn.amount !== null ? `${sign}${formatINR(txn.amount)}` : "—"}
        </AppText>
      </View>
    </View>
  );
}

export default memo(RecentTransactionItem);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  merchant: {
    lineHeight: 18,
  },
  amountCol: {
    alignItems: "flex-end",
  },
  amount: {
    fontSize: 14,
    fontFamily: Fonts.semibold,
    lineHeight: 18,
  },
});
