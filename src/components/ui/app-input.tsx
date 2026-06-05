import {
  forwardRef,
  memo,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  type KeyboardTypeOptions,
  type ReturnKeyTypeOptions,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import AppText, { textStyles } from "@mobile/components/ui/text";
import { withAlpha } from "@mobile/lib/color";
import { useTheme } from "@mobile/lib/theme";
import type {
  AppInputKeyboardType,
  AppInputProps,
  AppInputRef,
  AppInputReturnKey,
} from "@mobile/types/forms";

const KEYBOARD_MAP: Record<AppInputKeyboardType, KeyboardTypeOptions> = {
  default: "default",
  email: "email-address",
  number: "number-pad",
  phone: "phone-pad",
  decimal: "decimal-pad",
  url: "url",
  password: "default",
};

const RETURN_KEY_MAP: Record<AppInputReturnKey, ReturnKeyTypeOptions> = {
  default: "default",
  done: "done",
  go: "go",
  next: "next",
  search: "search",
  send: "send",
};

const DEFAULT_RADIUS = 14;

/**
 * AppInput — the app-wide text field. Pure React Native (no native modules),
 * with a soft accent glow on focus and nothing on blur. Supports controlled
 * (`value`) and uncontrolled (`defaultValue`) usage.
 */
function AppInput(
  {
    value,
    defaultValue,
    onChangeText,
    label,
    placeholder,
    hint,
    error,
    leadingIcon,
    trailingIcon,
    secureTextEntry = false,
    disabled = false,
    readOnly = false,
    multiline = false,
    numberOfLines,
    maxLength,
    autoFocus = false,
    autoCapitalize,
    autoCorrect = true,
    keyboardType = "default",
    returnKeyType = "default",
    onSubmitEditing,
    onFocus,
    onBlur,
    accentColor,
    glow = true,
    glowColor,
    borderRadius = DEFAULT_RADIUS,
    containerStyle,
    testID,
  }: AppInputProps,
  ref: React.Ref<AppInputRef>,
) {
  const { theme } = useTheme();
  const inputRef = useRef<TextInput>(null);
  const lastValue = useRef(value ?? defaultValue ?? "");
  const [focused, setFocused] = useState(false);

  useImperativeHandle(
    ref,
    () => ({
      focus: () => inputRef.current?.focus(),
      blur: () => inputRef.current?.blur(),
      clear: () => inputRef.current?.clear(),
      setText: (text: string) => inputRef.current?.setNativeProps({ text }),
    }),
    [],
  );

  const handleChange = useCallback(
    (text: string) => {
      lastValue.current = text;
      onChangeText?.(text);
    },
    [onChangeText],
  );

  const handleFocus = useCallback(() => {
    setFocused(true);
    onFocus?.();
  }, [onFocus]);

  const handleBlur = useCallback(() => {
    setFocused(false);
    onBlur?.();
  }, [onBlur]);

  const accent = (accentColor as string) ?? theme.accent;
  const resolvedGlow = (glowColor as string) ?? withAlpha(accent, 0.55);
  const showGlow = glow && focused && !disabled;
  const isError = !!error;

  const borderColor = isError ? theme.danger : focused ? accent : theme.border;

  return (
    <View style={[styles.container, containerStyle]} testID={testID}>
      {label ? (
        <AppText
          variant="captionSemiBold"
          style={[styles.label, { color: focused ? accent : theme.textSecondary }]}
          numberOfLines={1}
        >
          {label}
        </AppText>
      ) : null}

      <View
        style={[
          styles.box,
          {
            borderRadius,
            borderColor,
            borderWidth: focused ? 2 : 1,
            backgroundColor: theme.surface,
            opacity: disabled ? 0.6 : 1,
            minHeight: multiline ? 96 : 56,
            alignItems: multiline ? "flex-start" : "center",
          },
          showGlow ? { boxShadow: `0px 0px 16px 0px ${resolvedGlow}` } : null,
        ]}
      >
        {leadingIcon ? <View style={styles.adornment}>{leadingIcon}</View> : null}
        <TextInput
          ref={inputRef}
          value={value}
          defaultValue={value === undefined ? defaultValue : undefined}
          onChangeText={handleChange}
          placeholder={placeholder}
          placeholderTextColor={theme.textMuted}
          editable={!disabled && !readOnly}
          secureTextEntry={secureTextEntry}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : undefined}
          maxLength={maxLength}
          autoFocus={autoFocus}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          keyboardType={KEYBOARD_MAP[keyboardType]}
          returnKeyType={RETURN_KEY_MAP[returnKeyType]}
          onSubmitEditing={() => onSubmitEditing?.(lastValue.current)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={[
            styles.input,
            { color: theme.text },
            multiline ? styles.inputMultiline : null,
          ]}
        />
        {trailingIcon ? <View style={styles.adornment}>{trailingIcon}</View> : null}
      </View>

      {error || hint ? (
        <AppText
          variant="small"
          style={[styles.support, { color: isError ? theme.danger : theme.textMuted }]}
          numberOfLines={2}
        >
          {error ?? hint}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: 6,
  },
  label: {
    marginLeft: 4,
  },
  box: {
    flexDirection: "row",
    width: "100%",
    paddingHorizontal: 14,
    gap: 10,
  },
  input: {
    ...textStyles.default,
    flex: 1,
    height: "100%",
    paddingVertical: 14,
  },
  inputMultiline: {
    height: undefined,
    textAlignVertical: "top",
  },
  adornment: {
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
  },
  support: {
    marginLeft: 4,
  },
});

export default memo(forwardRef<AppInputRef, AppInputProps>(AppInput));
