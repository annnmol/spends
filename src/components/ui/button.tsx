import { forwardRef, memo, ReactNode, useMemo } from "react";
import {
  StyleSheet,
  Text,
  TextProps,
  TouchableOpacity,
  TouchableOpacityProps,
} from "react-native";

//custom types
import { theme, ThemeKeys } from "@mobile/lib/theme";
import { ButtonVariant, TextVariant } from "@mobile/types/native";
import { textStyles } from "./text";

export interface AppButtonProps extends TouchableOpacityProps {
  variant?: ButtonVariant;
  textVariant?: TextVariant;
  children: React.ReactNode;
  textProps?: TextProps;
  textThemeKey?: ThemeKeys;
  rounded?: boolean;
  left?: ReactNode;
  right?: ReactNode;
}

// Define the Button component with forwardRef
const AppButton = memo(
  forwardRef<typeof TouchableOpacity, AppButtonProps>(
    (
      {
        variant = "primary",
        textVariant = "defaultSemiBold",
        textThemeKey,
        children,
        style,
        textProps,
        rounded = true,
        left,
        right,
        ...props
      },
      ref,
    ) => {
      const dynamicTextStyle = useMemo(() => {
        switch (variant) {
          case "primary":
            return { color: theme.onPrimary };
          case "outline":
          case "text":
            return { color: theme.primary };
          case "grey":
            return { color: theme.text };
          case "danger":
            return { color: theme.danger };
          case "dangerOutline":
            return { color: theme.danger };
          default:
            return {};
        }
      }, [variant]);

      const dynamicButtonStyle = useMemo(() => {
        return rounded ? buttonStyles.rounded : {};
      }, [rounded]);

      const buttonStyle = useMemo(
        () => [
          buttonStyles.container,
          buttonStyles[variant],
          dynamicButtonStyle,
          style,
        ],
        [variant, dynamicButtonStyle, style],
      );

      const themedTextColor = useMemo(
        () => (textThemeKey ? { color: theme[textThemeKey] } : {}),
        [textThemeKey],
      );

      const textStyle = useMemo(
        () => [
          buttonStyles.buttonText,
          textStyles[textVariant],
          dynamicTextStyle,
          themedTextColor,
        ],
        [textVariant, dynamicTextStyle],
      );
      return (
        <TouchableOpacity ref={ref as any} style={buttonStyle} {...props}>
          {left}
          <Text style={textStyle} numberOfLines={1} {...textProps}>
            {children}
          </Text>
          {right}
        </TouchableOpacity>
      );
    },
  ),
);

export default AppButton;

export const buttonStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 0,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  primary: {
    backgroundColor: theme.primary,
  },
  outline: {
    borderWidth: 1,
    borderColor: theme.primary,
  },
  text: {
    backgroundColor: "transparent",
  },
  grey: {
    backgroundColor: theme.border,
  },
  danger: {
    backgroundColor: theme.danger,
  },
  dangerOutline: {
    backgroundColor: theme.danger,
    borderWidth: 1,
    borderColor: theme.danger,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  rounded: {
    borderRadius: 30,
  },
});
