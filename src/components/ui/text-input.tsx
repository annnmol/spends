import { forwardRef, memo, useId } from "react";

import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";

//custom imports
import { AppTextInputProps } from "@mobile/types/forms";
import { theme } from "@mobile/lib/theme";
import AppText, { textStyles } from "./text";

const AppTextInput = memo(
  forwardRef<TextInput, AppTextInputProps>(
    (
      { name, label, error, hint, left, right, inputBoxStyle, ...otherProps },
      ref
    ) => {
      const id = useId();
      return (
        <KeyboardAvoidingView
          style={{ width: "100%" }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 100}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
              {label && (
                <AppText
                  variant="defaultSemiBold"
                  style={styles.labelText}
                  numberOfLines={1}
                >
                  {label}
                </AppText>
              )}
              <View style={[styles.inputBox, inputBoxStyle]}>
                {left && left}
                <TextInput
                  ref={ref}
                  placeholderTextColor={theme.textMuted}
                  style={styles.input}
                  accessibilityLabel={`${label || "input"}_${id}`}
                  testID={`${label || "input"}_${id}`}
                  {...otherProps}
                />
                {right && right}
              </View>
              {hint && (
                <AppText
                  variant="caption"
                  numberOfLines={1}
                  style={[styles.hintText]}
                >
                  {hint}
                </AppText>
              )}
              {error && (
                <AppText
                  variant="default"
                  numberOfLines={1}
                  style={[styles.errorText]}
                >
                  {error}
                </AppText>
              )}
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      );
    }
  )
);

export default AppTextInput;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: 4,
    paddingTop: 6,
    paddingBottom: 4,
  },
  inputBox: {
    borderRadius: 8,
    position: "relative",
    height: 44,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.border,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
    width: "100%",
    backgroundColor: theme.surface,
  },
  input: {
    ...textStyles.default,
    color: theme.text,
    flex: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    height: "100%",
  },

  errorText: { color: theme.danger, fontSize: 15, marginLeft: 4 },
  labelText: { marginLeft: 4 },
  hintText: { marginLeft: 4 },

  leftContainer: {
    backgroundColor: theme.surface,
    padding: 4,
    height: "100%",
    width: 48,
    alignItems: "center",
    justifyContent: "center",
  },

  rightContainer: {
    backgroundColor: theme.surface,
    padding: 4,
    height: "100%",
    width: 40,
    alignItems: "center",
    justifyContent: "center",
  },
});

export const defaultInputStyles = styles;
