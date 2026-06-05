import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppText from "@mobile/components/ui/text";
import { showHaptics } from "@mobile/lib/haptics";
import useAuthStore, { type AuthProvider } from "@mobile/store/slices/auth";

const HERO = require("@root/assets/onboarding/after.png");

export default function SignInScreen() {
  const insets = useSafeAreaInsets();
  const signIn = useAuthStore((s) => s.signIn);
  const [pending, setPending] = useState<AuthProvider | null>(null);

  const handleSignIn = async (provider: AuthProvider) => {
    if (pending) return;
    showHaptics("impactAsync");
    setPending(provider);
    try {
      // On success the root route guard flips and redirects into the
      // onboarding / app group automatically — no manual navigation needed.
      await signIn(provider);
    } catch {
      setPending(null);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <Image source={HERO} style={styles.hero} contentFit="cover" />
      <LinearGradient
        colors={["rgba(0,0,0,0.25)", "rgba(0,0,0,0.6)", "#000"]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      <Pressable
        style={[styles.back, { top: insets.top + 8 }]}
        onPress={() => router.back()}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Ionicons name="chevron-back" size={22} color="#fff" />
      </Pressable>

      <View style={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
        <AppText variant="title" style={styles.title}>
          Welcome back!
        </AppText>
        <AppText variant="subtitle" style={styles.subtitle}>
          Please sign in to continue your journey.
        </AppText>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.googleButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => handleSignIn("google")}
          disabled={!!pending}
          accessibilityRole="button"
          accessibilityLabel="Continue with Google"
        >
          {pending === "google" ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="logo-google" size={20} color="#fff" />
              <AppText variant="defaultSemiBold" style={styles.googleText}>
                Continue with Google
              </AppText>
            </>
          )}
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.appleButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => handleSignIn("apple")}
          disabled={!!pending}
          accessibilityRole="button"
          accessibilityLabel="Sign in with Apple"
        >
          {pending === "apple" ? (
            <ActivityIndicator color="#000" />
          ) : (
            <>
              <Ionicons name="logo-apple" size={20} color="#000" />
              <AppText variant="defaultSemiBold" style={styles.appleText}>
                Sign in with Apple
              </AppText>
            </>
          )}
        </Pressable>

        <AppText variant="small" style={styles.terms}>
          By continuing you agree to our{" "}
          <AppText variant="small" style={styles.termsLink}>
            Terms of Service
          </AppText>
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000",
  },
  hero: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "60%",
  },
  back: {
    position: "absolute",
    left: 16,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  content: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 24,
    gap: 14,
  },
  title: {
    color: "#fff",
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "700",
  },
  subtitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 6,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: 56,
    borderRadius: 999,
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  googleButton: {
    backgroundColor: "#1C1C1E",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  googleText: {
    color: "#fff",
    fontSize: 16,
  },
  appleButton: {
    backgroundColor: "#fff",
  },
  appleText: {
    color: "#000",
    fontSize: 16,
  },
  terms: {
    color: "rgba(255,255,255,0.5)",
    textAlign: "center",
    marginTop: 8,
  },
  termsLink: {
    color: "rgba(255,255,255,0.8)",
    textDecorationLine: "underline",
  },
});
