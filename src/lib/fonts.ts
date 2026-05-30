import { Platform } from "react-native";

type FontVariant = "regular" | "medium" | "semibold" | "light" | "italic";

// TODO: load custom font files via expo-font and replace these with the
// loaded family names. Until then we fall back to platform system fonts so
// the app still renders with weight differentiation on Android.
const iosFonts: Record<FontVariant, string> = {
  regular: "System",
  medium: "System",
  semibold: "System",
  light: "System",
  italic: "System",
};

const androidFonts: Record<FontVariant, string> = {
  regular: "sans-serif",
  medium: "sans-serif-medium",
  semibold: "sans-serif-medium",
  light: "sans-serif-light",
  italic: "sans-serif",
};

export const Fonts = Platform.OS === "android" ? androidFonts : iosFonts;
