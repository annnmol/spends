import { getIcon, getInitialAndColor } from "@root/src/lib/icon-registry";
import { Image } from "expo-image";
import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  iconKey?: string | null;
  size?: number;
  style?: object;
};

function BrandIcon({ iconKey, size = 40, style }: Props) {
  const radius = size / 4;
  const containerStyle = [
    styles.container,
    { width: size, height: size, borderRadius: radius },
    style,
  ];

  const source = getIcon(iconKey);

  if (source != null) {
    return (
      <Image
        source={source}
        style={containerStyle}
        contentFit="cover"
        cachePolicy="disk"
        recyclingKey={iconKey ?? "brand"}
        transition={{ duration: 120, effect: "cross-dissolve" }}
      />
    );
  }

  const displayName = iconKey ?? "brandIcon";
  const { letter, color } = getInitialAndColor(displayName);
  return (
    <View style={[containerStyle, { backgroundColor: color }]}>
      <Text style={[styles.initial, { fontSize: size * 0.38 }]}>{letter}</Text>
    </View>
  );
}

export default memo(BrandIcon);

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
