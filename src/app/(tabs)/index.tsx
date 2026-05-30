import { useMemo, useState } from "react";
import { Dimensions, ScrollView, StyleSheet, View } from "react-native";
import { Calendar } from "react-native-calendars";
import { SafeAreaView } from "react-native-safe-area-context";
// import { BarChart } from "react-native-gifted-charts";

import AppText from "@mobile/components/ui/text";
import type { Transaction } from "@mobile/lib/transactions";
import { useSmsStore } from "@mobile/store/slices/sms";

const { width: SCREEN_W } = Dimensions.get("window");
const CHART_H_PAD = 32;

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function toDateStr(ts: number): string {
  const d = new Date(ts);
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}

function isDebit(t: Transaction): boolean {
  return t.transactionType === "debit";
}

function isInflow(t: Transaction): boolean {
  return (
    t.transactionType === "credit" ||
    t.transactionType === "refund" ||
    t.transactionType === "payment"
  );
}

function fmt(v: number): string {
  return "₹" + v.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

export default function HomeScreen() {
  const messages = useSmsStore((s) => s.messages);

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0-indexed
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const calendarKey = `${year}-${String(month + 1).padStart(2, "0")}`;
  const currentStr = `${year}-${String(month + 1).padStart(2, "0")}-01`;

  const { byDate, markedDates, barData, totalDebit, totalCredit, daysInMonth } =
    useMemo(() => {
      const byDate = new Map<string, Transaction[]>();
      let totalDebit = 0;
      let totalCredit = 0;
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      for (const t of messages) {
        if (t.category !== "financial") continue;
        const d = new Date(t.timestamp);
        if (d.getFullYear() !== year || d.getMonth() !== month) continue;
        const key = toDateStr(t.timestamp);
        if (!byDate.has(key)) byDate.set(key, []);
        byDate.get(key)!.push(t);
        if (t.amount) {
          if (isDebit(t)) totalDebit += t.amount;
          else if (isInflow(t)) totalCredit += t.amount;
        }
      }

      const markedDates: Record<string, object> = {};
      for (const [date, txns] of byDate.entries()) {
        const dots: { key: string; color: string }[] = [];
        if (txns.some(isDebit)) dots.push({ key: "d", color: "#dc2626" });
        if (txns.some(isInflow)) dots.push({ key: "c", color: "#16a34a" });
        markedDates[date] = {
          dots,
          ...(date === selectedDate && {
            selected: true,
            selectedColor: "#111827",
          }),
        };
      }
      if (selectedDate && !markedDates[selectedDate]) {
        markedDates[selectedDate] = {
          selected: true,
          selectedColor: "#111827",
        };
      }

      const mm = String(month + 1).padStart(2, "0");
      const barData = Array.from({ length: daysInMonth }, (_, i) => {
        const dd = String(i + 1).padStart(2, "0");
        const dateKey = `${year}-${mm}-${dd}`;
        const value = (byDate.get(dateKey) ?? [])
          .filter(isDebit)
          .reduce((s, t) => s + (t.amount ?? 0), 0);
        return {
          value,
          label: (i + 1) % 7 === 1 ? String(i + 1) : "",
          frontColor: dateKey === selectedDate ? "#2563eb" : "#111827",
        };
      });

      return {
        byDate,
        markedDates,
        barData,
        totalDebit,
        totalCredit,
        daysInMonth,
      };
    }, [messages, year, month, selectedDate]);

  const selectedTxns = selectedDate ? (byDate.get(selectedDate) ?? []) : [];
  const maxBar = Math.max(...barData.map((b) => b.value), 1);
  const barW = Math.max(
    4,
    Math.floor((SCREEN_W - CHART_H_PAD * 2) / daysInMonth) - 2,
  );
  const hasAny = messages.some((t) => t.category === "financial");

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Summary */}
        <View style={styles.summaryRow}>
          <View style={[styles.card, styles.debitCard]}>
            <AppText variant="small" style={styles.cardLabel}>
              Spent this month
            </AppText>
            <AppText variant="defaultSemiBold" style={styles.debitVal}>
              {fmt(totalDebit)}
            </AppText>
          </View>
          <View style={[styles.card, styles.creditCard]}>
            <AppText variant="small" style={styles.cardLabel}>
              Received
            </AppText>
            <AppText variant="defaultSemiBold" style={styles.creditVal}>
              {fmt(totalCredit)}
            </AppText>
          </View>
        </View>

        {/* Daily spend bar chart */}
        {hasAny && (
          <View style={styles.chartBox}>
            <AppText variant="small" style={styles.sectionLabel}>
              Daily Spend — {MONTH_NAMES[month]} {year}
            </AppText>
            {/* <BarChart
              data={barData}
              barWidth={barW}
              spacing={2}
              barBorderRadius={2}
              noOfSections={3}
              maxValue={maxBar}
              width={SCREEN_W - CHART_H_PAD * 2}
              hideYAxisText
              yAxisThickness={0}
              xAxisThickness={1}
              xAxisColor="#e5e7eb"
              rulesColor="#f3f4f6"
              initialSpacing={barW / 2}
              endSpacing={barW / 2}
            /> */}
          </View>
        )}

        {/* Monthly calendar */}
        <Calendar
          key={calendarKey}
          current={currentStr}
          markedDates={markedDates}
          markingType="multi-dot"
          onDayPress={(day) =>
            setSelectedDate((prev) =>
              prev === day.dateString ? null : day.dateString,
            )
          }
          onMonthChange={(m) => {
            setYear(m.year);
            setMonth(m.month - 1);
            setSelectedDate(null);
          }}
          hideExtraDays
          theme={{
            backgroundColor: "#f9fafb",
            calendarBackground: "#f9fafb",
            selectedDayBackgroundColor: "#111827",
            selectedDayTextColor: "#ffffff",
            todayTextColor: "#2563eb",
            todayBackgroundColor: "#eff6ff",
            dayTextColor: "#111827",
            textDisabledColor: "#d1d5db",
            arrowColor: "#111827",
            monthTextColor: "#111827",
            textMonthFontSize: 16,
            textDayFontSize: 14,
            textDayHeaderFontSize: 12,
          }}
        />

        {/* Selected day transactions */}
        {selectedDate && (
          <View style={styles.daySection}>
            <AppText variant="captionSemiBold" style={styles.dayHeader}>
              {Number(selectedDate.split("-")[2])}{" "}
              {MONTH_NAMES[Number(selectedDate.split("-")[1]) - 1]}
            </AppText>
            {selectedTxns.length === 0 ? (
              <AppText variant="small" style={styles.dim}>
                No transactions
              </AppText>
            ) : (
              selectedTxns.map((t) => (
                <View key={t.id} style={styles.txnRow}>
                  <View style={styles.txnInfo}>
                    <AppText variant="caption" numberOfLines={1}>
                      {t.merchant ?? t.sender}
                    </AppText>
                    <AppText variant="small" style={styles.dim}>
                      {t.transactionType.toUpperCase()}
                    </AppText>
                  </View>
                  {t.amount ? (
                    <AppText
                      variant="captionSemiBold"
                      style={isDebit(t) ? styles.debitVal : styles.creditVal}
                    >
                      {isInflow(t) ? "+" : "−"}
                      {fmt(t.amount)}
                    </AppText>
                  ) : null}
                </View>
              ))
            )}
          </View>
        )}

        {!hasAny && (
          <View style={styles.empty}>
            <AppText variant="caption" style={styles.dim}>
              No transactions yet. Import SMS from the List tab.
            </AppText>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f9fafb" },
  scroll: { paddingBottom: 32 },
  summaryRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    gap: 4,
    borderLeftWidth: 3,
  },
  debitCard: { borderLeftColor: "#dc2626" },
  creditCard: { borderLeftColor: "#16a34a" },
  cardLabel: { color: "#6b7280" },
  debitVal: { color: "#dc2626" },
  creditVal: { color: "#16a34a" },
  chartBox: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 10,
    padding: 16,
    paddingBottom: 8,
    gap: 8,
    overflow: "hidden",
  },
  sectionLabel: { color: "#6b7280" },
  daySection: {
    margin: 16,
    marginTop: 4,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    gap: 2,
  },
  dayHeader: { color: "#111827", marginBottom: 6 },
  txnRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  txnInfo: { flex: 1, gap: 1 },
  dim: { color: "#6b7280" },
  empty: { padding: 32, alignItems: "center" },
});
