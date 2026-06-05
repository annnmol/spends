import { Ionicons } from "@expo/vector-icons";
import { Image, type ImageSource } from "expo-image";
import { useCallback } from "react";
import { type LayoutChangeEvent, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

import { showHaptics } from "@mobile/lib/haptics";

type Props = {
  before: ImageSource | number;
  after: ImageSource | number;
  beforeLabel?: string;
  afterLabel?: string;
  /** Starting divider position, 0 (fully "after") to 1 (fully "before"). */
  initial?: number;
};

const HANDLE_SIZE = 48;
const LINE_WIDTH = 3;

function tap() {
  showHaptics("impactAsync");
}

export default function BeforeAfterSlider({
  before,
  after,
  beforeLabel = "Before",
  afterLabel = "After",
  initial = 0.55,
}: Props) {
  const containerWidth = useSharedValue(0);
  const dividerX = useSharedValue(0);
  const startX = useSharedValue(0);
  const ready = useSharedValue(false);

  const onLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const w = e.nativeEvent.layout.width;
      containerWidth.value = w;
      if (!ready.value) {
        dividerX.value = w * initial;
        ready.value = true;
      }
    },
    [containerWidth, dividerX, initial, ready],
  );

  const pan = Gesture.Pan()
    .minDistance(0)
    .onStart(() => {
      startX.value = dividerX.value;
      runOnJS(tap)();
    })
    .onUpdate((e) => {
      const next = startX.value + e.translationX;
      dividerX.value = Math.max(0, Math.min(next, containerWidth.value));
    });

  // The clipping wrapper width animates; the inner image keeps the full
  // container width so the "before" image is revealed, never squished.
  const clipStyle = useAnimatedStyle(() => ({ width: dividerX.value }));
  const innerImageStyle = useAnimatedStyle(() => ({ width: containerWidth.value }));
  const lineStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: dividerX.value - LINE_WIDTH / 2 }],
  }));
  const handleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: dividerX.value - HANDLE_SIZE / 2 }],
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={styles.container} onLayout={onLayout}>
        <Image source={after} style={StyleSheet.absoluteFill} contentFit="cover" />

        <Animated.View style={[styles.clip, clipStyle]}>
          <Animated.View style={[styles.innerImageWrap, innerImageStyle]}>
            <Image source={before} style={StyleSheet.absoluteFill} contentFit="cover" />
          </Animated.View>
        </Animated.View>

        <View style={styles.labelRow} pointerEvents="none">
          <View style={styles.badge}>
            <Animated.Text style={styles.badgeText}>{beforeLabel}</Animated.Text>
          </View>
          <View style={styles.badge}>
            <Animated.Text style={styles.badgeText}>{afterLabel}</Animated.Text>
          </View>
        </View>

        <Animated.View style={[styles.line, lineStyle]} pointerEvents="none" />

        <Animated.View style={[styles.handle, handleStyle]} pointerEvents="none">
          <View style={styles.handleInner}>
            <Ionicons name="chevron-back" size={14} color="#fff" />
            <Ionicons name="chevron-forward" size={14} color="#fff" />
          </View>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
    backgroundColor: "#000",
  },
  clip: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    overflow: "hidden",
  },
  innerImageWrap: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
  },
  labelRow: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  badge: {
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  line: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: LINE_WIDTH,
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  handle: {
    position: "absolute",
    top: "50%",
    left: 0,
    width: HANDLE_SIZE,
    height: HANDLE_SIZE,
    marginTop: -HANDLE_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  handleInner: {
    width: HANDLE_SIZE,
    height: HANDLE_SIZE,
    borderRadius: HANDLE_SIZE / 2,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.9)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});
