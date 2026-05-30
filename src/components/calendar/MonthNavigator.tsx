import { memo } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import AppText from "@mobile/components/ui/text";
import { useTheme } from "@mobile/lib/theme";

const ARROW_HIT_SLOP = { top: 8, bottom: 8, left: 8, right: 8 } as const;

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

type Props = {
  date: Date;
  onPrev: () => void;
  onNext: () => void;
};

function MonthNavigator({ date, onPrev, onNext }: Props) {
  const { theme } = useTheme();
  const label = `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={onPrev}
        hitSlop={ARROW_HIT_SLOP}
        accessibilityLabel="Previous month"
        accessibilityRole="button"
        style={styles.arrowButton}
      >
        <AppText variant="defaultSemiBold" style={{ color: theme.textMuted }}>
          {"‹"}
        </AppText>
      </TouchableOpacity>

      <AppText variant="defaultSemiBold" style={{ color: theme.text }}>
        {label}
      </AppText>

      <TouchableOpacity
        onPress={onNext}
        hitSlop={ARROW_HIT_SLOP}
        accessibilityLabel="Next month"
        accessibilityRole="button"
        style={styles.arrowButton}
      >
        <AppText variant="defaultSemiBold" style={{ color: theme.textMuted }}>
          {"›"}
        </AppText>
      </TouchableOpacity>
    </View>
  );
}

export default memo(MonthNavigator);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 20,
  },
  arrowButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
});
