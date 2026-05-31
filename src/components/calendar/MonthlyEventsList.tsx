import { memo, useMemo } from "react";
import { StyleSheet, View } from "react-native";

import AppText from "@mobile/components/ui/text";
import { useTheme } from "@mobile/lib/theme";
import type { Transaction } from "@mobile/db/transcations";
import CalendarEventCard from "./CalendarEventCard";
import type { AccountMap } from "./types";

const MONTH_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

type Props = {
  monthTxns: Transaction[];
  accountMap: AccountMap;
  selectedDate: Date | null;
};

function MonthlyEventsList({ monthTxns, accountMap, selectedDate }: Props) {
  const { theme } = useTheme();

  const displayed = useMemo<Transaction[]>(() => {
    if (selectedDate) {
      const d = selectedDate.getDate();
      return monthTxns.filter((t) => new Date(t.timestamp).getDate() === d);
    }
    return monthTxns;
  }, [monthTxns, selectedDate]);

  const sectionLabel = useMemo(() => {
    if (selectedDate) {
      return `${MONTH_SHORT[selectedDate.getMonth()]} ${selectedDate.getDate()}`;
    }
    return "This Month";
  }, [selectedDate]);

  const emptyLabel = selectedDate
    ? "No transactions on this day"
    : "No transactions this month";

  return (
    <View style={styles.container}>
      <AppText
        variant="captionSemiBold"
        style={[styles.sectionTitle, { color: theme.textSecondary }]}
      >
        {sectionLabel}
      </AppText>

      {displayed.length === 0 ? (
        <View style={[styles.empty, { borderColor: theme.border }]}>
          <AppText variant="caption" style={{ color: theme.textMuted }}>
            {emptyLabel}
          </AppText>
        </View>
      ) : (
        displayed.map((t) => (
          <CalendarEventCard
            key={t.id}
            transaction={t}
            account={t.accountId != null ? (accountMap.get(t.accountId) ?? null) : null}
          />
        ))
      )}
    </View>
  );
}

export default memo(MonthlyEventsList);

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    paddingBottom: 32,
  },
  sectionTitle: {
    marginHorizontal: 16,
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  empty: {
    marginHorizontal: 16,
    paddingVertical: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
});
