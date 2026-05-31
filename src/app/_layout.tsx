import { Stack } from "expo-router";

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
