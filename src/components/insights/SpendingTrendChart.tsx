import { memo, useMemo } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";

import { useTheme } from "@mobile/lib/theme";
import { Fonts } from "@mobile/lib/fonts";
import AppText from "@mobile/components/ui/text";
import type { Transaction } from "@mobile/db/transcations";
import { getRangeBounds, TIME_RANGES, type TimeRange } from "./types";

type Props = {
  transactions: Transaction[];
  range: TimeRange;
};

const SCREEN_WIDTH = Dimensions.get("window").width;
const CHART_WIDTH = SCREEN_WIDTH - 64;

function getMonthKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function getMonthLabel(key: string): string {
  const [year, month] = key.split("-");
  const d = new Date(Number(year), Number(month) - 1, 1);
  return d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
}

function enumerateMonths(start: number, end: number): string[] {
  const months: string[] = [];
  const s = new Date(start);
  s.setDate(1);
  s.setHours(0, 0, 0, 0);
  const e = new Date(end);
  while (s <= e) {
    months.push(`${s.getFullYear()}-${String(s.getMonth() + 1).padStart(2, "0")}`);
    s.setMonth(s.getMonth() + 1);
  }
  return months;
}

function formatYAxis(value: number): string {
  if (value >= 1_00_000) return `${(value / 1_00_000).toFixed(0)}L`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return String(value);
}

function getRangeLabel(range: TimeRange): string {
  return TIME_RANGES.find((r) => r.key === range)?.label ?? "Trend";
}

function SpendingTrendChart({ transactions, range }: Props) {
  const { theme } = useTheme();

  const { chartData, maxValue } = useMemo(() => {
    const { start, end } = getRangeBounds(range);
    const months = enumerateMonths(start, end);

    const totals: Record<string, number> = {};
    for (const m of months) totals[m] = 0;

    for (const t of transactions) {
      if (
        t.transactionType !== "DEBIT" ||
        t.amount === null ||
        t.timestamp < start ||
        t.timestamp > end
      ) {
        continue;
      }
      const key = getMonthKey(t.timestamp);
      if (key in totals) {
        totals[key] += t.amount;
      }
    }

    const totalMonths = months.length;
    const data = months.map((m, i) => {
      const showLabel =
        totalMonths <= 3 ||
        i === 0 ||
        i === totalMonths - 1 ||
        (totalMonths > 6 && i === Math.floor(totalMonths / 2));
      return {
        value: Math.round(totals[m]),
        label: showLabel ? getMonthLabel(m) : "",
        labelTextStyle: {
          color: theme.textMuted,
          fontSize: 10,
          fontFamily: Fonts.regular,
          width: 44,
          textAlign: "center" as const,
        },
      };
    });

    const mv = Math.max(...data.map((d) => d.value), 1000);
    const roundTo = mv >= 1_00_000 ? 50_000 : mv >= 10_000 ? 10_000 : 5_000;
    const rounded = Math.ceil(mv / roundTo) * roundTo;

    return { chartData: data, maxValue: rounded };
  }, [transactions, range, theme.textMuted]);

  const yStepValue = maxValue / 3;

  return (
    <View style={[styles.card, { backgroundColor: theme.surface, shadowColor: theme.black }]}>
      <AppText variant="captionSemiBold" themeKey="textSecondary" style={styles.sectionLabel}>
        {getRangeLabel(range)}
      </AppText>

      <View style={styles.chartWrapper}>
        <LineChart
          data={chartData}
          areaChart
          curved
          width={CHART_WIDTH - 48}
          height={160}
          color="#0F172A"
          thickness={2}
          startFillColor="#94A3B8"
          endFillColor="transparent"
          startOpacity={0.3}
          endOpacity={0}
          dataPointsColor="#0F172A"
          dataPointsRadius={4}
          hideDataPoints={false}
          noOfSections={3}
          maxValue={maxValue}
          stepValue={yStepValue}
          yAxisThickness={0}
          xAxisThickness={1}
          xAxisColor={theme.border}
          yAxisTextStyle={{
            color: theme.textMuted,
            fontSize: 10,
            fontFamily: Fonts.regular,
          }}
          formatYLabel={(v) => formatYAxis(Number(v))}
          spacing={Math.max(20, (CHART_WIDTH - 48) / Math.max(chartData.length - 1, 1))}
          initialSpacing={0}
          endSpacing={0}
          rulesType="dashed"
          rulesColor={theme.border}
          xAxisLabelTextStyle={{
            color: theme.textMuted,
            fontSize: 10,
            fontFamily: Fonts.regular,
          }}
        />
      </View>
    </View>
  );
}

export default memo(SpendingTrendChart);

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  sectionLabel: {
    marginBottom: 16,
    letterSpacing: 0.2,
  },
  chartWrapper: {
    marginLeft: -4,
  },
});
