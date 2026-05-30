import { memo } from "react";
import { StyleSheet, View } from "react-native";

import AppText from "@mobile/components/ui/text";

function CalendarHeader() {
  return (
    <View style={styles.container}>
      <AppText variant="title" style={styles.title}>
        Calendar
      </AppText>
    </View>
  );
}

export default memo(CalendarHeader);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  title: {
    fontSize: 32,
    lineHeight: 40,
  },
});
