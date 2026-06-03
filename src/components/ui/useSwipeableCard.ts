import { useCallback, useMemo } from "react";
import {
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Gesture } from "react-native-gesture-handler";

import { showHaptics } from "@mobile/lib/haptics";

// ─── Layout constants ─────────────────────────────────────────────────────────

export const SWIPE_LEFT_WIDTH = 210;   // 3 actions × 70px — revealed on left swipe
export const SWIPE_RIGHT_WIDTH = 140;  // 2 actions × 70px — revealed on right swipe
export const ACTION_BUTTON_WIDTH = 70;

const OPEN_THRESHOLD = 0.5;
const SPRING_CONFIG = { damping: 18, stiffness: 150, mass: 1 } as const;

// ─── Module-level: one open card at a time ────────────────────────────────────
// Storing the close function of the currently open card. When a new card opens,
// it closes the previous one before registering itself.

let _activeClose: (() => void) | null = null;

function _registerCard(close: () => void): void {
  if (_activeClose && _activeClose !== close) {
    _activeClose();
  }
  _activeClose = close;
}

function _clearCard(): void {
  _activeClose = null;
}

function _haptic(): void {
  showHaptics("impactAsync");
}

// ─── Rubber-band: resistance beyond panel limits (worklet) ────────────────────

function applyRubberBand(raw: number, limit: number): number {
  "worklet";
  const abs = Math.abs(raw);
  if (abs <= limit) return raw;
  return (raw < 0 ? -1 : 1) * (limit + (abs - limit) * 0.3);
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useSwipeableCard() {
  const translateX = useSharedValue(0);
  const startX = useSharedValue(0);
  const crossedThreshold = useSharedValue(false);

  // Stable across renders — translateX is a stable Reanimated ref
  const closeCard = useCallback(() => {
    translateX.value = withSpring(0, SPRING_CONFIG);
  }, [translateX]);

  // Derived progress values consumed by SwipeActions for fade + scale animations
  const swipeLeftProgress = useDerivedValue(() =>
    Math.min(1, Math.max(0, -translateX.value / SWIPE_LEFT_WIDTH)),
  );
  const swipeRightProgress = useDerivedValue(() =>
    Math.min(1, Math.max(0, translateX.value / SWIPE_RIGHT_WIDTH)),
  );

  const gesture = useMemo(
    () =>
      Gesture.Pan()
        // Activate on horizontal intent; yield to vertical list scrolling
        .activeOffsetX([-5, 5])
        .failOffsetY([-10, 10])
        .onStart(() => {
          startX.value = translateX.value;
          crossedThreshold.value = false;
          // Close previously open card before this one opens
          runOnJS(_registerCard)(closeCard);
        })
        .onUpdate((e) => {
          const raw = startX.value + e.translationX;
          // Card follows finger exactly within panel bounds; rubber-band beyond
          translateX.value = applyRubberBand(
            raw,
            raw < 0 ? SWIPE_LEFT_WIDTH : SWIPE_RIGHT_WIDTH,
          );

          // Single haptic pulse when crossing snap threshold in either direction
          const pastLeft = translateX.value <= -SWIPE_LEFT_WIDTH * OPEN_THRESHOLD;
          const pastRight = translateX.value >= SWIPE_RIGHT_WIDTH * OPEN_THRESHOLD;
          if ((pastLeft || pastRight) && !crossedThreshold.value) {
            crossedThreshold.value = true;
            runOnJS(_haptic)();
          } else if (!pastLeft && !pastRight && crossedThreshold.value) {
            crossedThreshold.value = false;
          }
        })
        .onEnd((e) => {
          const pos = translateX.value;
          const vel = e.velocityX;

          // Velocity toward center overrides position — flick to close
          const flickClose =
            (vel > 400 && pos < 0) || (vel < -400 && pos > 0);
          // Velocity away from center — flick to open
          const flickOpenLeft = vel < -600 && pos < 0;
          const flickOpenRight = vel > 600 && pos > 0;

          if (flickClose) {
            translateX.value = withSpring(0, SPRING_CONFIG);
            runOnJS(_clearCard)();
          } else if (flickOpenLeft || pos < -SWIPE_LEFT_WIDTH * OPEN_THRESHOLD) {
            translateX.value = withSpring(-SWIPE_LEFT_WIDTH, SPRING_CONFIG);
          } else if (flickOpenRight || pos > SWIPE_RIGHT_WIDTH * OPEN_THRESHOLD) {
            translateX.value = withSpring(SWIPE_RIGHT_WIDTH, SPRING_CONFIG);
          } else {
            translateX.value = withSpring(0, SPRING_CONFIG);
            runOnJS(_clearCard)();
          }
        }),
    // All deps are stable Reanimated refs or useCallback-stable functions
    [closeCard, crossedThreshold, startX, translateX],
  );

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return {
    gesture,
    animatedCardStyle,
    swipeLeftProgress,
    swipeRightProgress,
    closeCard,
  };
}
