import { memo } from "react";
import { StyleSheet, View } from "react-native";

import AppText from "@mobile/components/ui/text";
import { useTheme } from "@mobile/lib/theme";
import { Fonts } from "@mobile/lib/fonts";

type Props = {
  debit: number;
  credit: number;
};

function formatInr(value: number): string {
  return "₹" + value.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

function MonthlyOverview({ debit, credit }: Props) {
  const { theme } = useTheme();
  const net = credit - debit;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.surfaceSecondary, borderColor: theme.border },
      ]}
    >
      <View style={styles.headerRow}>
        <AppText variant="captionSemiBold" themeKey="text">
          Monthly Overview
        </AppText>
        <View style={[styles.badge, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <AppText variant="small" themeKey="textMuted" style={styles.badgeText}>
            Current Month
          </AppText>
        </View>
      </View>
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <AppText style={[styles.statValue, { color: theme.danger }]}>
            {formatInr(debit)}
          </AppText>
          <AppText variant="small" themeKey="textMuted">
            Debit
          </AppText>
        </View>
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <View style={styles.stat}>
          <AppText style={[styles.statValue, { color: theme.success }]}>
            {formatInr(credit)}
          </AppText>
          <AppText variant="small" themeKey="textMuted">
            Credit
          </AppText>
        </View>
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <View style={styles.stat}>
          <AppText
            style={[
              styles.statValue,
              { color: net >= 0 ? theme.accent : theme.danger },
            ]}
          >
            {net >= 0 ? "+" : ""}
            {formatInr(net)}
          </AppText>
          <AppText variant="small" themeKey="textMuted">
            Net
          </AppText>
        </View>
      </View>
    </View>
  );
}

export default memo(MonthlyOverview);

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  badge: {
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 11,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  stat: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  statValue: {
    fontSize: 15,
    fontFamily: Fonts.semibold,
    lineHeight: 20,
  },
  divider: {
    width: 1,
    height: 32,
  },
});
