import { memo, useMemo } from "react";
import { StyleSheet, View } from "react-native";

import AppText from "@mobile/components/ui/text";
import { useTheme } from "@mobile/lib/theme";
import type { Transaction } from "@mobile/db/transcations";
import CalendarDayCell from "./CalendarDayCell";
import type { AccountMap } from "./types";

const DAY_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const CELL_GAP = 4;

type GridCell = {
  day: number;
  isCurrentMonth: boolean;
};

function buildGridCells(year: number, month: number): GridCell[] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells: GridCell[] = [];

  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: daysInPrevMonth - i, isCurrentMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, isCurrentMonth: true });
  }
  const remainder = cells.length % 7;
  if (remainder !== 0) {
    for (let d = 1; d <= 7 - remainder; d++) {
      cells.push({ day: d, isCurrentMonth: false });
    }
  }

  return cells;
}

type Props = {
  year: number;
  month: number;
  byDay: Map<number, Transaction[]>;
  accountMap: AccountMap;
  selectedDate: Date | null;
  today: Date;
  onSelectDay: (date: Date) => void;
  cellSize: number;
};

function CalendarGrid({
  year,
  month,
  byDay,
  accountMap,
  selectedDate,
  today,
  onSelectDay,
  cellSize,
}: Props) {
  const { theme } = useTheme();

  const cells = useMemo(() => buildGridCells(year, month), [year, month]);

  const todayDay = today.getDate();
  const todayMonth = today.getMonth();
  const todayYear = today.getFullYear();

  const selectedDay =
    selectedDate &&
    selectedDate.getFullYear() === year &&
    selectedDate.getMonth() === month
      ? selectedDate.getDate()
      : null;

  const rows: GridCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7));
  }

  return (
    <View style={[styles.container, { paddingHorizontal: 16 }]}>
      {/* Day-of-week header */}
      <View style={[styles.row, { gap: CELL_GAP, marginBottom: CELL_GAP }]}>
        {DAY_LABELS.map((label) => (
          <View key={label} style={{ width: cellSize, alignItems: "center" }}>
            <AppText
              variant="small"
              style={[
                styles.dayLabel,
                { color: theme.textMuted, fontSize: 11 },
              ]}
            >
              {label}
            </AppText>
          </View>
        ))}
      </View>

      {rows.map((row, rowIdx) => (
        <View
          key={rowIdx}
          style={[styles.row, { gap: CELL_GAP, marginTop: CELL_GAP }]}
        >
          {row.map((cell, colIdx) => {
            const isCurrent = cell.isCurrentMonth;
            const txns = isCurrent ? (byDay.get(cell.day) ?? []) : [];

            const isToday =
              isCurrent &&
              cell.day === todayDay &&
              month === todayMonth &&
              year === todayYear;

            const isSelected = isCurrent && cell.day === selectedDay;

            return (
              <CalendarDayCell
                key={`${rowIdx}-${colIdx}`}
                day={cell.day}
                isToday={isToday}
                isSelected={isSelected}
                isOtherMonth={!isCurrent}
                transactions={txns}
                accountMap={accountMap}
                onPress={() => {
                  if (isCurrent) {
                    const tapped = new Date(year, month, cell.day);
                    onSelectDay(tapped);
                  }
                }}
                cellSize={cellSize}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}

export default memo(CalendarGrid);

const styles = StyleSheet.create({
  container: {
    paddingBottom: 8,
    gap: 2,
  },
  row: {
    flexDirection: "row",
  },
  dayLabel: {
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});
