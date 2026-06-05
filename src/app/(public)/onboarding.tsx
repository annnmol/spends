import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppText from "@mobile/components/ui/text";
import BeforeAfterSlider from "@mobile/components/ui/before-after-slider";
import { showHaptics } from "@mobile/lib/haptics";

const BEFORE = require("@root/assets/onboarding/before.png");
const AFTER = require("@root/assets/onboarding/after.png");

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();

  const handleContinue = () => {
    showHaptics("impactAsync");
    router.push("/sign-in");
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <BeforeAfterSlider
        before={BEFORE}
        after={AFTER}
        beforeLabel="Scattered"
        afterLabel="In CardCue"
      />

      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.55)", "rgba(0,0,0,0.95)"]}
        locations={[0, 0.45, 1]}
        style={styles.gradient}
        pointerEvents="none"
      />

      {/* Sits beside the gradient (not inside it) so the slider keeps every
          touch except the buttons themselves. */}
      <View
        style={[styles.content, { paddingBottom: insets.bottom + 20 }]}
        pointerEvents="box-none"
      >
        <AppText variant="title" style={styles.title}>
          CardCue
        </AppText>
        <AppText variant="subtitle" style={styles.subtitle}>
          Drag to see every card due come together in one clean view.
        </AppText>

        <Pressable
          style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
          onPress={handleContinue}
          accessibilityRole="button"
          accessibilityLabel="Continue"
        >
          <AppText variant="defaultSemiBold" style={styles.ctaText}>
            Continue
          </AppText>
        </Pressable>

        <Pressable
          onPress={handleContinue}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Sign in"
        >
          <AppText variant="caption" style={styles.signIn}>
            Already have an account?{" "}
            <AppText variant="captionSemiBold" style={styles.signInLink}>
              Sign In
            </AppText>
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000",
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "52%",
  },
  content: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 24,
    gap: 14,
  },
  title: {
    color: "#fff",
    fontSize: 34,
    lineHeight: 40,
    textAlign: "center",
    fontWeight: "700",
  },
  subtitle: {
    color: "rgba(255,255,255,0.78)",
    textAlign: "center",
    fontSize: 16,
    lineHeight: 22,
  },
  cta: {
    backgroundColor: "#fff",
    borderRadius: 999,
    paddingVertical: 17,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  ctaPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  ctaText: {
    color: "#0F172A",
    fontSize: 17,
  },
  signIn: {
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
  },
  signInLink: {
    color: "#fff",
  },
});
