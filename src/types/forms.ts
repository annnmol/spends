import { ReactNode } from "react";
import { ColorValue, StyleProp, TextInputProps, ViewStyle } from "react-native";

export interface AppTextInputProps extends TextInputProps {
  name?: string;
  label?: string;
  error?: string;
  hint?: string;
  left?: ReactNode;
  right?: ReactNode;
  inputBoxStyle?: StyleProp<ViewStyle>;
}

// ─── AppInput (Material 3 on Android, RN fallback elsewhere) ──────────────────

export type AppInputVariant = "outlined" | "filled";

export type AppInputKeyboardType =
  | "default"
  | "email"
  | "number"
  | "phone"
  | "decimal"
  | "url"
  | "password";

export type AppInputReturnKey =
  | "default"
  | "done"
  | "go"
  | "next"
  | "search"
  | "send";

export type AppInputCapitalization =
  | "none"
  | "characters"
  | "words"
  | "sentences";

/** Imperative handle, mirrors the RN TextInput surface we actually use. */
export type AppInputRef = {
  focus: () => void;
  blur: () => void;
  clear: () => void;
  setText: (text: string) => void;
};

/**
 * Single, expandable input API used across the app. Add new props here so the
 * component surface stays consistent everywhere it's used.
 */
export interface AppInputProps {
  /** Seed value. The native field owns its buffer; pass to control/reset it. */
  value?: string;
  defaultValue?: string;
  onChangeText?: (text: string) => void;

  // Content
  label?: string;
  placeholder?: string;
  hint?: string;
  /** When set, the field switches to its error state and shows this message. */
  error?: string;

  /** Leading / trailing adornments (any RN node, e.g. an icon or button). */
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;

  // Behavior
  variant?: AppInputVariant;
  secureTextEntry?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
  autoFocus?: boolean;
  autoCapitalize?: AppInputCapitalization;
  autoCorrect?: boolean;
  keyboardType?: AppInputKeyboardType;
  returnKeyType?: AppInputReturnKey;
  onSubmitEditing?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;

  // Appearance
  /** Focus indicator + glow tint. Defaults to the theme accent. */
  accentColor?: ColorValue;
  /** Soft outer glow on focus (nothing on blur). @default true */
  glow?: boolean;
  glowColor?: ColorValue;
  borderRadius?: number;
  containerStyle?: StyleProp<ViewStyle>;

  testID?: string;
}
