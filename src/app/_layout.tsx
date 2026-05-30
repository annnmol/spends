import { Stack } from "expo-router";

// Pre-warm bank icon registry at app startup so lazy tab navigations are instant.
import "@mobile/lib/bank-icon-registry";
// import "@mobile/lib/merchant-icon-registry"; // v2: merchants disabled

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
