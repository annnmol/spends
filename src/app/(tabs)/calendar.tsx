import { useMemo, useState } from "react";
import {
  Alert,
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Calendar, type ICalendarEventBase } from "react-native-big-calendar";

import AppText from "@mobile/components/ui/text";
import type { Transaction } from "@mobile/lib/transactions";
import { useSmsStore } from "@mobile/store/slices/sms";

type Mode = "month" | "week" | "day";
type Filter = "all" | "debit" | "credit";

type CalEvent = ICalendarEventBase & {
  txn: Transaction;
  eventColor: string;
};

function txnColor(type: string): string {
  switch (type) {
    case "debit":     return "#dc2626";
    case "credit":    return "#16a34a";
    case "refund":    return "#2563eb";
    case "payment":   return "#7c3aed";
    case "statement": return "#6b7280";
    default:          return "#9ca3af";
  }
}

function fmt(v: number): string {
  return "₹" + v.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

const MODES: { key: Mode; label: string }[] = [
  { key: "month", label: "Month" },
  { key: "week", label: "Week" },
  { key: "day", label: "Day" },
];

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "debit", label: "Debit" },
  { key: "credit", label: "Credit" },
];

export default function CalendarScreen() {
  const messages = useSmsStore((s) => s.messages);
  const { height } = useWindowDimensions();

  const [mode, setMode] = useState<Mode>("week");
  const [filter, setFilter] = useState<Filter>("all");

  const events = useMemo<CalEvent[]>(() => {
    return messages
      .filter((t) => {
        if (t.category !== "financial") return false;
        if (filter === "debit") return t.transactionType === "debit";
        if (filter === "credit")
          return ["credit", "refund", "payment"].includes(t.transactionType);
        return true;
      })
      .map((t) => {
        const start = new Date(t.timestamp);
        const end = new Date(t.timestamp + 30 * 60 * 1000);
        const label = t.merchant ?? t.sender;
        const amountStr = t.amount ? ` ${fmt(t.amount)}` : "";
        return {
          title: label + amountStr,
          start,
          end,
          txn: t,
          eventColor: txnColor(t.transactionType),
        };
      });
  }, [messages, filter]);

  function handlePressEvent(event: CalEvent) {
    const t = event.txn;
    const lines = [
      t.amount ? `Amount: ${fmt(t.amount)}` : null,
      `Type: ${t.transactionType.toUpperCase()}`,
      `Source: ${t.sourceType}`,
      t.body.length > 120 ? t.body.slice(0, 120) + "…" : t.body,
    ].filter(Boolean) as string[];
    Alert.alert(t.merchant ?? t.sender, lines.join("\n\n"));
  }

  // subtract safe area top (~44), mode chips row (~50), tab bar (~60), buffer
  const calHeight = height - 154;

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.toolbar}>
        <View style={styles.chipGroup}>
          {MODES.map((m) => (
            <TouchableOpacity
              key={m.key}
              style={[styles.chip, mode === m.key && styles.chipOn]}
              onPress={() => setMode(m.key)}
            >
              <AppText
                variant="small"
                style={mode === m.key ? styles.chipTextOn : styles.chipText}
              >
                {m.label}
              </AppText>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.chipGroup}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[styles.chip, filter === f.key && styles.chipOn]}
              onPress={() => setFilter(f.key)}
            >
              <AppText
                variant="small"
                style={filter === f.key ? styles.chipTextOn : styles.chipText}
              >
                {f.label}
              </AppText>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {events.length === 0 ? (
        <View style={styles.empty}>
          <AppText variant="caption" style={styles.dim}>
            No transactions to display. Import SMS from the List tab.
          </AppText>
        </View>
      ) : (
        <Calendar<CalEvent>
          events={events}
          height={calHeight}
          mode={mode}
          swipeEnabled
          onPressEvent={handlePressEvent}
          eventCellStyle={(event) => {
            const color = (event as CalEvent).eventColor;
            return {
              backgroundColor: color + "25",
              borderLeftColor: color,
              borderLeftWidth: 3,
              borderRadius: 4,
            };
          }}
          eventCellTextColor="#111827"
          theme={{
            palette: {
              primary: { main: "#111827", contrastText: "#fff" },
              nowIndicator: "#2563eb",
              gray: {
                "100": "#f3f4f6",
                "200": "#e5e7eb",
                "300": "#d1d5db",
                "500": "#6b7280",
                "800": "#1f2937",
              },
            },
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f9fafb" },
  toolbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  chipGroup: { flexDirection: "row", gap: 5 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#fff",
  },
  chipOn: { borderColor: "#111827", backgroundColor: "#111827" },
  chipText: { color: "#374151" },
  chipTextOn: { color: "#fff" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center" },
  dim: { color: "#6b7280" },
});
