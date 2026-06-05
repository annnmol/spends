import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";

import { SmsListenerBridge } from "../store/bridge/SmsListenerBridge";
import GlobalProviders from "../store/context/providers";
import useAuthStore from "../store/slices/auth";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  return (
    <GlobalProviders>
      <SmsListenerBridge />
      <RootNavigator />
    </GlobalProviders>
  );
}

function RootNavigator() {
  const hydrated = useAuthStore((s) => s.hasHydrated);
  const session = useAuthStore((s) => s.authSession);
  const token = useAuthStore((s) => s.authToken);
  const onboarded = useAuthStore((s) => s.onboarded);

  const isAuthenticated = !!session && !!token;
  const needsOnboarding = isAuthenticated && !onboarded;

  useEffect(() => {
    // Keep the native splash up until secure storage has rehydrated, so any
    // initial guard redirect happens invisibly and we never flash the wrong
    // route group on cold start.
    if (hydrated) SplashScreen.hideAsync().catch(() => {});
  }, [hydrated]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Public — onboarding intro + sign in */}
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="(public)" />
      </Stack.Protected>

      {/* Authenticated but profile setup not finished */}
      <Stack.Protected guard={needsOnboarding}>
        <Stack.Screen name="(onboarding)" />
      </Stack.Protected>

      {/* Fully authenticated app */}
      <Stack.Protected guard={isAuthenticated && onboarded}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="account/[id]" />
      </Stack.Protected>
    </Stack>
  );
}
