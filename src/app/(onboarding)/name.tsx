import { router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AppText from "@mobile/components/ui/text";
import AppInput from "@mobile/components/ui/app-input";
import StepHeader from "@mobile/components/onboarding/step-header";
import { showHaptics } from "@mobile/lib/haptics";
import { useTheme } from "@mobile/lib/theme";
import useAuthStore from "@mobile/store/slices/auth";
import useOnboardingStore from "@mobile/store/slices/onboarding";

export default function OnboardingNameScreen() {
  const { theme } = useTheme();
  const savedName = useOnboardingStore((s) => s.name);
  const setName = useOnboardingStore((s) => s.setName);
  const resetDraft = useOnboardingStore((s) => s.reset);
  const sessionName = useAuthStore((s) => s.authSession?.name ?? "");
  const signOut = useAuthStore((s) => s.signOut);

  // Seed from the in-memory draft first, then fall back to the OAuth profile name.
  const [value, setValue] = useState(() => savedName || sessionName);

  const trimmed = value.trim();
  const canContinue = trimmed.length > 0;

  const handleContinue = () => {
    if (!canContinue) return;
    showHaptics("impactAsync");
    setName(trimmed);
    router.push("/ready");
  };

  const handleBack = () => {
    resetDraft();
    signOut();
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={["top", "bottom"]}>
      <StepHeader step={1} total={2} onBack={handleBack} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.content}>
          <AppText variant="title" style={[styles.title, { color: theme.text }]}>
            What's your name?
          </AppText>
          <AppText variant="subtitle" themeKey="textSecondary" style={styles.subtitle}>
            We'll use this to personalize your experience.
          </AppText>

          <View style={styles.inputWrap}>
            <AppInput
              value={value}
              onChangeText={setValue}
              placeholder="Type your name"
              autoFocus
              autoCapitalize="words"
              returnKeyType="done"
              onSubmitEditing={handleContinue}
              maxLength={40}
            />
          </View>

          <View style={styles.flex} />

          <Pressable
            style={({ pressed }) => [
              styles.cta,
              { backgroundColor: canContinue ? theme.text : theme.border },
              pressed && canContinue && styles.ctaPressed,
            ]}
            onPress={handleContinue}
            disabled={!canContinue}
            accessibilityRole="button"
            accessibilityLabel="Continue"
          >
            <AppText
              variant="defaultSemiBold"
              style={{ color: canContinue ? theme.background : theme.textMuted, fontSize: 17 }}
            >
              Continue
            </AppText>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
  },
  title: {
    fontSize: 30,
    lineHeight: 38,
    fontWeight: "700",
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    fontSize: 16,
    lineHeight: 22,
    marginTop: 8,
  },
  inputWrap: {
    marginTop: 36,
  },
  cta: {
    borderRadius: 999,
    paddingVertical: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
});
