import { memo } from "react";
import { StyleSheet, View } from "react-native";
import AppText from "@mobile/components/ui/text";

export type PermissionState = "unknown" | "granted" | "denied";

type Props = { state: PermissionState };

const LABEL: Record<PermissionState, string> = {
  unknown: "Unknown",
  granted: "Granted",
  denied: "Denied",
};

const COLOR: Record<PermissionState, string> = {
  unknown: "#9ca3af",
  granted: "#16a34a",
  denied: "#dc2626",
};

function PermissionStatusBase({ state }: Props) {
  return (
    <View style={styles.row}>
      <AppText variant="caption">SMS permission: </AppText>
      <View style={[styles.dot, { backgroundColor: COLOR[state] }]} />
      <AppText variant="captionSemiBold" style={{ color: COLOR[state] }}>
        {LABEL[state]}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
});

export default memo(PermissionStatusBase);
