import { ReactNode } from "react";
import { StyleProp, TextInputProps, ViewStyle } from "react-native";

export interface AppTextInputProps extends TextInputProps {
  name?: string;
  label?: string;
  error?: string;
  hint?: string;
  left?: ReactNode;
  right?: ReactNode;
  inputBoxStyle?: StyleProp<ViewStyle>;
}
