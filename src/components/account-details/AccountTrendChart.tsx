import { memo, useMemo } from "react";
import { Dimensions, Platform, StyleSheet, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "@mobile/lib/theme";
import AppText from "@mobile/components/ui/text";
import type { Transaction } from "@mobile/lib/transactions";
import { getRangeBounds, type TimeRange } from "@mobile/components/insights/types";

type Props = {
  transactions: Transaction[];
  accountId: number;
  range: TimeRange;
};

function formatYLabel(val: string): string {
  const n = Number(val);
  if (n >= 1000) return `${Math.round(n / 1000)}K`;
  return String(Math.round(n));
}

function getMonthKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function getShortMonthLabel(key: string): string {
  const [year, month] = key.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  const mon = date.toLocaleString("en-IN", { month: "short" });
  const yr = String(date.getFullYear()).slice(2);
  return `${mon} ${yr}`;
}

function buildMonthRange(range: TimeRange): string[] {
  const { start, end } = getRangeBounds(range);
  const keys: string[] = [];
  const cursor = new Date(start);
  cursor.setDate(1);
  cursor.setHours(0, 0, 0, 0);
  const endKey = getMonthKey(end);
  while (true) {
    const key = getMonthKey(cursor.getTime());
    keys.push(key);
    if (key === endKey) break;
    cursor.setMonth(cursor.getMonth() + 1);
    if (keys.length > 24) break;
  }
  return keys;
}

function AccountTrendChart({ transactions, accountId, range }: Props) {
  const { theme } = useTheme();
  const chartWidth = Dimensions.get("window").width - 64;

  const chartData = useMemo(() => {
    const months = buildMonthRange(range);
    const totals: Record<string, number> = {};

    for (const t of transactions) {
      if (
        t.accountId !== accountId ||
        t.category !== "financial" ||
        t.transactionType !== "debit" ||
        t.amount === null
      ) {
        continue;
      }
      const key = getMonthKey(t.timestamp);
      totals[key] = (totals[key] ?? 0) + t.amount;
    }

    return months.map((key, idx) => {
      const showLabel = idx === 0 || idx === months.length - 1 || idx === Math.floor(months.length / 2);
      return {
        value: Math.round(totals[key] ?? 0),
        label: showLabel ? getShortMonthLabel(key) : "",
        labelTextStyle: { color: theme.textMuted, fontSize: 10 },
      };
    });
  }, [transactions, accountId, range, theme.textMuted]);

  const maxVal = useMemo(
    () => Math.max(...chartData.map((d) => d.value), 1000),
    [chartData],
  );

  const yAxisMax = Math.ceil(maxVal / 10000) * 10000 || 10000;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name="trending-up-outline" size={16} color={theme.textSecondary} />
        <AppText variant="captionSemiBold" themeKey="textSecondary" style={styles.sectionLabel}>
          Monthly graph
        </AppText>
      </View>

      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.surface,
            shadowColor: theme.black,
            borderColor: theme.border,
          },
        ]}
      >
        <LineChart
          areaChart
          curved
          data={chartData}
          color="#2563EB"
          thickness={2}
          startFillColor="#BFDBFE"
          endFillColor="transparent"
          startOpacity={0.5}
          endOpacity={0}
          noOfSections={4}
          maxValue={yAxisMax}
          yAxisThickness={0}
          xAxisThickness={1}
          xAxisColor={theme.border}
          yAxisTextStyle={{ color: theme.textMuted, fontSize: 10 }}
          formatYLabel={formatYLabel}
          dataPointsColor="#2563EB"
          dataPointsRadius={4}
          width={chartWidth}
          height={160}
          initialSpacing={8}
          spacing={Math.max(24, (chartWidth - 40) / Math.max(chartData.length - 1, 1))}
          rulesColor={theme.border}
          rulesType="solid"
          hideRules={false}
          backgroundColor={theme.surface}
        />
      </View>
    </View>
  );
}

export default memo(AccountTrendChart);

const cardShadow = Platform.select({
  ios: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
  },
  android: {},
});

const styles = StyleSheet.create({
  section: {
    marginHorizontal: 16,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  sectionLabel: {
    letterSpacing: 0.2,
  },
  card: {
    borderRadius: 16,
    elevation: 2,
    padding: 16,
    paddingRight: 8,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
    ...cardShadow,
  },
});
