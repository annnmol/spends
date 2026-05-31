import { memo } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { useTheme } from "@mobile/lib/theme";
import { Fonts } from "@mobile/lib/fonts";
import AppText from "@mobile/components/ui/text";
import BankIcon from "@mobile/components/ui/bank-icon";
import type { Account } from "@mobile/lib/accounts";

type Props = {
  account: Account;
  amount: number;
  percentage: number;
  txnCount: number;
  color: string;
  onPress: () => void;
};

function formatINR(value: number): string {
  return "₹" + value.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

function AccountSpendRow({ account, amount, percentage, txnCount, color, onPress }: Props) {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[styles.row, { borderBottomColor: theme.border }]}
    >
      <BankIcon bankName={account.bankName} slugs={account.slugs} size={36} />

      <View style={styles.info}>
        <View style={styles.topLine}>
          <AppText variant="captionSemiBold" themeKey="text" style={styles.name} numberOfLines={1}>
            {account.name}
          </AppText>
          <AppText themeKey="text" style={[styles.amount, { color: theme.text }]}>
            {formatINR(amount)}
          </AppText>
        </View>

        <View style={styles.subLine}>
          <AppText variant="small" themeKey="textMuted">
            {txnCount} transaction{txnCount !== 1 ? "s" : ""}
          </AppText>
          <AppText variant="small" themeKey="textMuted" style={styles.pctText}>
            {percentage.toFixed(0)}%
          </AppText>
        </View>

        <View style={[styles.progressTrack, { backgroundColor: theme.border }]}>
          <View
            style={[
              styles.progressFill,
              { width: `${Math.min(percentage, 100)}%`, backgroundColor: color },
            ]}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default memo(AccountSpendRow);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
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
  pctText: {
    letterSpacing: 0.1,
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
