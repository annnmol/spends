import { useCallback, useMemo, useState } from "react";
import { ScrollView, StyleSheet, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CalendarGrid from "@mobile/components/calendar/CalendarGrid";
import CalendarHeader from "@mobile/components/calendar/CalendarHeader";
import MonthNavigator from "@mobile/components/calendar/MonthNavigator";
import MonthlyEventsList from "@mobile/components/calendar/MonthlyEventsList";
import { useCalendarData } from "@mobile/components/calendar/useCalendarEvents";
import { useTheme } from "@mobile/lib/theme";
import { useAccountsStore } from "@mobile/store/slices/accounts";
import { useSmsStore } from "@mobile/store/slices/sms";

// 16px padding each side + 6 gaps of 4pt between 7 cells
const GRID_H_PAD = 32;
const CELL_GAP = 4;

export default function CalendarScreen() {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();

  const transactions = useSmsStore((s) => s.messages);
  const { accounts } = useAccountsStore();

  const today = useMemo(() => new Date(), []);

  const [currentDate, setCurrentDate] = useState<Date>(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const { monthTxns, byDay, accountMap } = useCalendarData(
    transactions,
    accounts,
    year,
    month,
  );

  const cellSize = Math.floor((width - GRID_H_PAD - CELL_GAP * 6) / 7);

  const handlePrev = useCallback(() => {
    setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
    setSelectedDate(null);
  }, []);

  const handleNext = useCallback(() => {
    setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
    setSelectedDate(null);
  }, []);

  // Tap same date again → deselect (show full month)
  const handleSelectDay = useCallback((date: Date) => {
    setSelectedDate((prev) =>
      prev?.getTime() === date.getTime() ? null : date,
    );
  }, []);

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.background }]}
      edges={["top", "left", "right"]}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <CalendarHeader />

        <MonthNavigator
          date={currentDate}
          onPrev={handlePrev}
          onNext={handleNext}
        />

        <CalendarGrid
          year={year}
          month={month}
          byDay={byDay}
          accountMap={accountMap}
          selectedDate={selectedDate}
          today={today}
          onSelectDay={handleSelectDay}
          cellSize={cellSize}
        />

        <MonthlyEventsList
          monthTxns={monthTxns.reverse()}
          accountMap={accountMap}
          selectedDate={selectedDate}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
});
