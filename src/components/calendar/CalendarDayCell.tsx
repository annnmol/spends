import { memo } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import BankIcon from "@mobile/components/ui/bank-icon";
// import MerchantIcon from "@mobile/components/ui/merchant-icon"; // v2: merchants disabled
import AppText from "@mobile/components/ui/text";
import { useTheme } from "@mobile/lib/theme";
import type { Transaction } from "@mobile/lib/transactions";
import type { AccountMap } from "./types";

const TODAY_BORDER_COLOR = "#10B981";
const TODAY_BG_COLOR = "#F0FDF4";
const MAX_VISIBLE = 2;

type Props = {
  day: number | null;
  isToday: boolean;
  isSelected: boolean;
  isOtherMonth: boolean;
  transactions: Transaction[];
  accountMap: AccountMap;
  onPress: () => void;
  cellSize: number;
};

function CalendarDayCell({
  day,
  isToday,
  isSelected,
  isOtherMonth,
  transactions,
  accountMap,
  onPress,
  cellSize,
}: Props) {
  const { theme } = useTheme();

  if (day === null) {
    return <View style={{ width: cellSize, height: cellSize }} />;
  }

  const hasTxns = transactions.length > 0;
  const visibleTxns = transactions.slice(0, MAX_VISIBLE);
  const overflowCount = Math.max(0, transactions.length - MAX_VISIBLE);

  // icon sized so 2 fit side-by-side with a 3px gap and 4px side padding
  // const iconSize = Math.floor((cellSize - 8 - 3) / 2);
  const iconSize = 13;

  const borderColor = isToday
    ? TODAY_BORDER_COLOR
    : isSelected
      ? theme.accent
      : theme.border;
  const borderWidth = isToday || isSelected ? 2 : 1;
  const bgColor = isToday
    ? TODAY_BG_COLOR
    : isSelected
      ? theme.accent + "14"
      : theme.surface;

  const dayColor = isOtherMonth
    ? theme.textMuted
    : isToday
      ? TODAY_BORDER_COLOR
      : theme.text;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={`${day}${isToday ? ", today" : ""}${hasTxns ? `, ${transactions.length} transaction${transactions.length > 1 ? "s" : ""}` : ""}`}
      style={[
        styles.cell,
        hasTxns ? styles.cellWithTxns : styles.cellEmpty,
        {
          width: cellSize,
          height: cellSize,
          borderColor: isOtherMonth ? "transparent" : borderColor,
          borderWidth: isOtherMonth ? 0 : borderWidth,
          backgroundColor: isOtherMonth ? "transparent" : bgColor,
        },
      ]}
    >
      {/* Day number — top for txn cells, centered for empty */}
      <AppText
        style={[
          hasTxns ? styles.dayTop : styles.dayCenter,
          { color: dayColor, fontWeight: isToday ? "700" : "400" },
        ]}
      >
        {day}
      </AppText>

      {/* Icons pinned to bottom — only rendered when there are transactions */}
      {hasTxns && (
        <View style={styles.iconsBottom}>
          {visibleTxns.map((txn) => {
            const account =
              txn.accountId != null ? accountMap.get(txn.accountId) : null;
            return account ? (
              <BankIcon
                key={txn.id}
                bankName={account.bankName}
                slugs={account.slugs}
                size={iconSize}
              />
            ) : null; // v2: MerchantIcon disabled
          })}
          {/* {overflowCount > 0 && (
            <View style={[styles.badge, { backgroundColor: theme.accent }]}>
              <AppText style={styles.badgeText}>+{overflowCount}</AppText>
            </View>
          )} */}
          {/* {overflowCount > 0 && (
            <View
              style={[
                {
                  width: 3,
                  height: 3,
                  borderRadius: 2,
                  backgroundColor: theme.accent,
                  position: "absolute",
                  right: -6,
                  bottom: 6,
                },
              ]}
            />
          )} */}
        </View>
      )}
    </TouchableOpacity>
  );
}

export default memo(CalendarDayCell);

const styles = StyleSheet.create({
  cell: {
    borderRadius: 10,
    overflow: "hidden",
  },
  cellEmpty: {
    alignItems: "center",
    justifyContent: "center",
  },
  cellWithTxns: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 3,
    paddingTop: 6,
    paddingBottom: 4,
  },
  dayCenter: {
    fontSize: 14,
    lineHeight: 13,
    textAlign: "center",
  },
  dayTop: {
    fontSize: 13,
    lineHeight: 13,
    textAlign: "center",
  },
  iconsBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  badge: {
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 8,
    lineHeight: 10,
  },
});
