import { memo } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { useTheme } from "@mobile/lib/theme";
import { Fonts } from "@mobile/lib/fonts";
import AppText from "@mobile/components/ui/text";
import { TIME_RANGES, type TimeRange } from "./types";

type Props = {
  selected: TimeRange;
  onSelect: (r: TimeRange) => void;
};

function TimeRangeSelector({ selected, onSelect }: Props) {
  const { theme } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
      style={styles.scroll}
    >
      {TIME_RANGES.map((range) => {
        const isActive = range.key === selected;
        return (
          <Pressable
            key={range.key}
            onPress={() => onSelect(range.key)}
            style={[
              styles.pill,
              isActive
                ? [styles.pillActive, { backgroundColor: theme.primary }]
                : [styles.pillInactive, { borderColor: theme.border }],
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={range.label}
          >
            <AppText
              style={[
                styles.pillText,
                isActive
                  ? { color: theme.onPrimary, fontFamily: Fonts.medium }
                  : { color: theme.textSecondary, fontFamily: Fonts.regular },
              ]}
            >
              {range.label}
            </AppText>
          </Pressable>
        );
      })}
      <View style={styles.trailingSpace} />
    </ScrollView>
  );
}

export default memo(TimeRangeSelector);

const styles = StyleSheet.create({
  scroll: {
    marginTop: 16,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  pillActive: {
    borderWidth: 0,
  },
  pillInactive: {
    borderWidth: 1,
    backgroundColor: "transparent",
  },
  pillText: {
    fontSize: 13,
    lineHeight: 18,
  },
  trailingSpace: {
    width: 4,
  },
});
