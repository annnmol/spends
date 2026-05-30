import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { getBankSvg, getInitialAndColor } from "@mobile/lib/get-icon";

type Props = {
  bankName: string | null | undefined;
  slugs?: string[];
  size?: number;
  style?: object;
};

function BankIcon({ bankName, slugs, size = 40, style }: Props) {
  const radius = size / 2;
  const containerStyle = [
    styles.container,
    { width: size, height: size, borderRadius: radius },
    style,
  ];

  const SvgComp = getBankSvg(bankName, slugs);
  if (SvgComp) {
    return (
      <View style={containerStyle}>
        <SvgComp width={size * 0.72} height={size * 0.72} />
      </View>
    );
  }

  const displayName = bankName ?? slugs?.[0] ?? "?";
  const { letter, color } = getInitialAndColor(displayName);
  return (
    <View style={[containerStyle, { backgroundColor: color }]}>
      <Text style={[styles.initial, { fontSize: size * 0.38 }]}>{letter}</Text>
    </View>
  );
}

export default memo(BankIcon);

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  initial: {
    color: "#fff",
    fontWeight: "700",
    lineHeight: undefined,
  },
});
