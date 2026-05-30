import { Stack } from "expo-router";

// Pre-warm icon registries at app startup so lazy tab navigations are instant.
// Both Accounts and Calendar use these — loading here amortizes the cost over
// the app launch rather than blocking the first tab tap.
import "@mobile/lib/bank-icon-registry";
import "@mobile/lib/merchant-icon-registry";

import { SmsListenerBridge } from "../store/bridge/SmsListenerBridge";
import GlobalProviders from "../store/context/providers";

export default function RootLayout() {
  return (
    <GlobalProviders>
      <SmsListenerBridge />
      <Stack screenOptions={{ headerShown: false }} />
    </GlobalProviders>
  );
}
