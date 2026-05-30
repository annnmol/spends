import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CalendarGrid from "@mobile/components/calendar/CalendarGrid";
import CalendarHeader from "@mobile/components/calendar/CalendarHeader";
import MonthNavigator from "@mobile/components/calendar/MonthNavigator";
import MonthlyEventsList from "@mobile/components/calendar/MonthlyEventsList";
import { useCalendarData } from "@mobile/components/calendar/useCalendarEvents";
import { useTheme } from "@mobile/lib/theme";
import { useAccountsStore } from "@mobile/store/slices/accounts";
import { useSmsStore } from "@mobile/store/slices/sms";

const GRID_H_PAD = 32; // 16px left + 16px right
const CELL_GAP = 4;    // gap between 7 cells (6 gaps total)

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

  // Defer heavy grid render until navigation animation completes.
  // This is what eliminates the perceived 3-5s lag — the tab opens instantly
  // showing the header + navigator, then the grid appears after the animation.
  const [gridReady, setGridReady] = useState(false);
  useEffect(() => {
    const id = requestIdleCallback(() => setGridReady(true));
    return () => cancelIdleCallback(id);
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const { monthTxns, byDay, accountMap } = useCalendarData(
    transactions,
    accounts,
    year,
    month,
  );

  // Descending order for the list — useMemo avoids the .reverse() mutation bug
  // (Array.reverse() is in-place; calling it directly on a memo value corrupts
  // the cached reference used by CalendarGrid's byDay map).
  const monthTxnsDesc = useMemo(
    () => [...monthTxns].reverse(),
    [monthTxns],
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

        {gridReady ? (
          <>
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
              monthTxns={monthTxnsDesc}
              accountMap={accountMap}
              selectedDate={selectedDate}
            />
          </>
        ) : (
          // Skeleton placeholder — same height as the grid so the layout
          // doesn't jump when the content loads
          <View
            style={[
              styles.skeleton,
              { backgroundColor: theme.surfaceSecondary },
            ]}
          />
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
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  skeleton: {
    marginHorizontal: 16,
    borderRadius: 12,
    height: 320,
    marginTop: 8,
  },
});
