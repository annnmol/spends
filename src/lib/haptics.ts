import * as Haptics from "expo-haptics";

export const showHaptics = (
  type: "notificationAsync" | "impactAsync" = "impactAsync"
) => {
  switch (type) {
    case "notificationAsync":
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      break;
    case "impactAsync":
    default:
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
};
