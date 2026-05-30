import { memo } from "react";
import { StyleSheet, View } from "react-native";

import { useTheme } from "@mobile/lib/theme";
import AppText from "@mobile/components/ui/text";

function InsightsHeader() {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <AppText variant="small" themeKey="textMuted" style={styles.label}>
        Your money
      </AppText>
      <AppText variant="title" themeKey="text" style={[styles.title, { color: theme.text }]}>
        Insights
      </AppText>
    </View>
  );
}

export default memo(InsightsHeader);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  label: {
    marginBottom: 2,
  },
  title: {
    fontSize: 32,
    lineHeight: 40,
  },
});
