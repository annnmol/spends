import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";

// import { getMerchantAsset, getInitialAndColor } from "@mobile/lib/get-icon"; // v2: merchants disabled
import { getInitialAndColor } from "@mobile/lib/get-icon";
const getMerchantAsset = (_name?: string | null, _slugs?: string[]) => null;

type Props = {
  name: string | null | undefined;
  slugs?: string[];
  size?: number;
  style?: object;
};

function MerchantIcon({ name, slugs, size = 40, style }: Props) {
  const radius = size / 4;
  const containerStyle = [
    styles.container,
    { width: size, height: size, borderRadius: radius },
    style,
  ];

  const source = getMerchantAsset(name, slugs);

  if (source != null) {
    return (
      <Image
        source={source}
        style={containerStyle}
        contentFit="contain"
        // memory-disk: decoded frame stays in memory for instant re-renders;
        // survives app backgrounding via disk cache
        cachePolicy="memory-disk"
        // unique key per merchant prevents flicker in recycled FlatList cells
        recyclingKey={name ?? slugs?.[0] ?? "merchant"}
        transition={{ duration: 120, effect: "cross-dissolve" }}
      />
    );
  }

  const displayName = name ?? slugs?.[0] ?? "?";
  const { letter, color } = getInitialAndColor(displayName);
  return (
    <View style={[containerStyle, { backgroundColor: color }]}>
      <Text style={[styles.initial, { fontSize: size * 0.38 }]}>{letter}</Text>
    </View>
  );
}

export default memo(MerchantIcon);

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
