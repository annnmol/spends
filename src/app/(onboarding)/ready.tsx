import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AppText from "@mobile/components/ui/text";
import StepHeader from "@mobile/components/onboarding/step-header";
import { showHaptics } from "@mobile/lib/haptics";
import { useTheme } from "@mobile/lib/theme";
import useAuthStore from "@mobile/store/slices/auth";
import useOnboardingStore from "@mobile/store/slices/onboarding";

export default function OnboardingReadyScreen() {
  const { theme } = useTheme();
  const name = useOnboardingStore((s) => s.name);
  const resetDraft = useOnboardingStore((s) => s.reset);
  const finishOnboarding = useAuthStore((s) => s.finishOnboarding);

  const firstName = name.split(" ")[0] || name;

  const handleStart = () => {
    showHaptics("notificationAsync");
    // Persist the outcome onto the logged-in user, then drop the in-memory
    // draft. Flipping `onboarded` releases the guard and the root navigator
    // redirects into the (tabs) app automatically.
    finishOnboarding(name);
    resetDraft();
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={["top", "bottom"]}>
      <StepHeader step={2} total={2} onBack={() => router.back()} />

      <View style={styles.content}>
        <View style={[styles.badge, { backgroundColor: theme.accent + "1A" }]}>
          <Ionicons name="checkmark-circle" size={64} color={theme.accent} />
        </View>

        <AppText variant="title" style={[styles.title, { color: theme.text }]}>
          You're all set{firstName ? `, ${firstName}` : ""}!
        </AppText>
        <AppText variant="subtitle" themeKey="textSecondary" style={styles.subtitle}>
          Your dashboard is ready. Let's bring all your card dues together.
        </AppText>

        <View style={styles.flex} />

        <Pressable
          style={({ pressed }) => [
            styles.cta,
            { backgroundColor: theme.text },
            pressed && styles.ctaPressed,
          ]}
          onPress={handleStart}
          accessibilityRole="button"
          accessibilityLabel="Get started"
        >
          <AppText variant="defaultSemiBold" style={{ color: theme.background, fontSize: 17 }}>
            Get Started
          </AppText>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 16,
    alignItems: "center",
  },
  badge: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
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
    marginTop: 10,
    paddingHorizontal: 8,
  },
  cta: {
    width: "100%",
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
