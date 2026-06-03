import { Ionicons } from "@expo/vector-icons";
import { memo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";
import type { SharedValue } from "react-native-reanimated";

import AppText from "@mobile/components/ui/text";
import { Fonts } from "@mobile/lib/fonts";
import { useTheme } from "@mobile/lib/theme";
import {
  ACTION_BUTTON_WIDTH,
  SWIPE_LEFT_WIDTH,
  SWIPE_RIGHT_WIDTH,
} from "./useSwipeableCard";

// ─── Types ────────────────────────────────────────────────────────────────────

type ActionItem = {
  key: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  bg: string;
  fg: string;
  onPress: () => void;
};

// ─── Single action button ─────────────────────────────────────────────────────

type ActionButtonProps = {
  item: ActionItem;
  progress: SharedValue<number>;
};

const ActionButton = memo(function ActionButton({
  item,
  progress,
}: ActionButtonProps) {
  const animStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      {
        scale: interpolate(
          progress.value,
          [0, 1],
          [0.8, 1.0],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  return (
    <Pressable
      onPress={item.onPress}
      style={[styles.button, { width: ACTION_BUTTON_WIDTH, backgroundColor: item.bg }]}
      android_ripple={{ color: item.fg + "44", borderless: false }}
    >
      <Animated.View style={[styles.buttonContent, animStyle]}>
        <Ionicons name={item.icon} size={20} color={item.fg} />
        <AppText style={[styles.label, { color: item.fg }]} numberOfLines={1}>
          {item.label}
        </AppText>
      </Animated.View>
    </Pressable>
  );
});

// ─── Left-swipe actions: Delete · Category · More ─────────────────────────────
// Positioned at right: 0 inside the container. Revealed when card slides left.

export type SwipeLeftActionsProps = {
  progress: SharedValue<number>;
  onDelete: () => void;
  onCategory: () => void;
  onMore: () => void;
};

export const SwipeLeftActions = memo(function SwipeLeftActions({
  progress,
  onDelete,
  onCategory,
  onMore,
}: SwipeLeftActionsProps) {
  const { theme } = useTheme();

  const actions: ActionItem[] = [
    {
      key: "delete",
      icon: "trash-outline",
      label: "Delete",
      bg: theme.danger + "22",
      fg: theme.danger,
      onPress: onDelete,
    },
    {
      key: "category",
      icon: "pricetag-outline",
      label: "Category",
      bg: theme.accent + "22",
      fg: theme.accent,
      onPress: onCategory,
    },
    {
      key: "more",
      icon: "ellipsis-horizontal",
      label: "More",
      bg: theme.surfaceSecondary,
      fg: theme.textSecondary,
      onPress: onMore,
    },
  ];

  return (
    <View style={[styles.panel, styles.panelRight, { width: SWIPE_LEFT_WIDTH }]}>
      {actions.map((item) => (
        <ActionButton key={item.key} item={item} progress={progress} />
      ))}
    </View>
  );
});

// ─── Right-swipe actions: Edit · Duplicate ────────────────────────────────────
// Positioned at left: 0 inside the container. Revealed when card slides right.

export type SwipeRightActionsProps = {
  progress: SharedValue<number>;
  onEdit: () => void;
  onDuplicate: () => void;
};

export const SwipeRightActions = memo(function SwipeRightActions({
  progress,
  onEdit,
  onDuplicate,
}: SwipeRightActionsProps) {
  const { theme } = useTheme();

  const actions: ActionItem[] = [
    {
      key: "edit",
      icon: "pencil-outline",
      label: "Edit",
      bg: theme.success + "22",
      fg: theme.success,
      onPress: onEdit,
    },
    {
      key: "duplicate",
      icon: "copy-outline",
      label: "Duplicate",
      bg: theme.accentSecondary + "22",
      fg: theme.accentSecondary,
      onPress: onDuplicate,
    },
  ];

  return (
    <View style={[styles.panel, styles.panelLeft, { width: SWIPE_RIGHT_WIDTH }]}>
      {actions.map((item) => (
        <ActionButton key={item.key} item={item} progress={progress} />
      ))}
    </View>
  );
});

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  panel: {
    position: "absolute",
    top: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "stretch",
  },
  panelLeft: {
    left: 0,
  },
  panelRight: {
    right: 0,
  },
  button: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonContent: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  label: {
    fontSize: 10,
    fontFamily: Fonts.medium,
    lineHeight: 13,
  },
});
