import { memo } from "react";
import { StyleSheet, View } from "react-native";

import { useTheme } from "@mobile/lib/theme";
import { Fonts } from "@mobile/lib/fonts";
import AppText from "@mobile/components/ui/text";

type Props = {
  debit: number;
  credit: number;
};

function formatINR(value: number): string {
  return "₹" + Math.abs(value).toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

function NetFlowCard({ debit, credit }: Props) {
  const { theme } = useTheme();
  const net = credit - debit;
  const isPositive = net >= 0;

  return (
    <View style={[styles.card, { backgroundColor: theme.surface, shadowColor: theme.black }]}>
      <AppText variant="captionSemiBold" themeKey="textSecondary" style={styles.sectionLabel}>
        Net Flow
      </AppText>

      <View style={styles.columns}>
        <View style={styles.column}>
          <View style={[styles.dot, { backgroundColor: theme.success + "22" }]}>
            <View style={[styles.dotInner, { backgroundColor: theme.success }]} />
          </View>
          <AppText variant="small" themeKey="textMuted" style={styles.colLabel}>
            Income
          </AppText>
          <AppText style={[styles.colValue, { color: theme.success }]}>
            {formatINR(credit)}
          </AppText>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <View style={styles.column}>
          <View style={[styles.dot, { backgroundColor: theme.danger + "22" }]}>
            <View style={[styles.dotInner, { backgroundColor: theme.danger }]} />
          </View>
          <AppText variant="small" themeKey="textMuted" style={styles.colLabel}>
            Expenses
          </AppText>
          <AppText style={[styles.colValue, { color: theme.danger }]}>
            {formatINR(debit)}
          </AppText>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <View style={styles.column}>
          <View
            style={[
              styles.dot,
              { backgroundColor: (isPositive ? theme.accent : theme.danger) + "22" },
            ]}
          >
            <View
              style={[
                styles.dotInner,
                { backgroundColor: isPositive ? theme.accent : theme.danger },
              ]}
            />
          </View>
          <AppText variant="small" themeKey="textMuted" style={styles.colLabel}>
            Net
          </AppText>
          <AppText
            style={[
              styles.colValue,
              { color: isPositive ? theme.accent : theme.danger },
            ]}
          >
            {isPositive ? "+" : "-"}
            {formatINR(net)}
          </AppText>
        </View>
      </View>
    </View>
  );
}

export default memo(NetFlowCard);

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
  columns: {
    flexDirection: "row",
    alignItems: "center",
  },
  column: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  dotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  colLabel: {
    letterSpacing: 0.2,
  },
  colValue: {
    fontSize: 15,
    fontFamily: Fonts.semibold,
    lineHeight: 20,
    textAlign: "center",
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    height: 56,
    marginHorizontal: 4,
  },
});
