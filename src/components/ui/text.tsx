import { forwardRef, memo, useMemo } from "react";
import { StyleSheet, Text, type TextProps } from "react-native";

//custom imports
import { theme, ThemeKeys } from "@mobile/lib/theme";
import { TextVariant } from "@mobile/types/native";
import { useThemeColor } from "@mobile/components/hooks/useThemeColor";
import { Fonts } from "@mobile/lib/fonts";

export type AppTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  themeKey?: ThemeKeys;
  variant?: TextVariant;
};

const AppText = memo(
  forwardRef<Text, AppTextProps>(
    (
      {
        style,
        lightColor,
        darkColor,
        themeKey = "text",
        variant = "default",
        ...rest
      },
      ref
    ) => {
      const color = useThemeColor(
        { light: lightColor, dark: darkColor },
        themeKey
      );

      // Memoize the combined styles to avoid unnecessary recalculations
      const combinedStyles = useMemo(
        () => [{ color }, textStyles[variant], style],
        [color, variant, style]
      );

      return <Text style={combinedStyles} ref={ref} {...rest} />;
    }
  )
);

export default AppText;

export const textStyles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: Fonts.regular,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: Fonts.medium,
  },
  title: {
    fontSize: 28,
    lineHeight: 40,
    fontFamily: Fonts.medium,
    letterSpacing: 0.25,
  },
  heading: {
    fontSize: 24,
    lineHeight: 24,
    fontFamily: Fonts.medium,
    letterSpacing: 0.25,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: Fonts.medium,
    letterSpacing: 0.25,
  },
  link: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: Fonts.medium,
    color: "royalblue",
  },
  caption: {
    fontSize: 14,
    lineHeight: 18,
    fontFamily: Fonts.regular,
  },

  captionSemiBold: {
    fontSize: 14,
    lineHeight: 18,
    fontFamily: Fonts.medium,
  },
  small: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: Fonts.light,
  },

  bold: {
    fontFamily: Fonts.medium,
  },
  mainbold: {
    fontFamily: Fonts.semibold,
  },
  light: {
    fontFamily: Fonts.light,
  },
  regular: {
    fontFamily: Fonts.regular,
  },

  url: {
    color: theme.accent,
    textDecorationLine: "underline",
  },
  italic: { fontFamily: Fonts.italic },
  underline: { textDecorationLine: "underline" },
  strikethrough: { textDecorationLine: "line-through" },
  code: { fontFamily: "monospace" },
});
