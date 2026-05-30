import { PropsWithChildren } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { SmsProvider } from "./sms-context";

const GlobalProviders = ({ children }: PropsWithChildren) => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SmsProvider>{children}</SmsProvider>
    </GestureHandlerRootView>
  );
};

export default GlobalProviders;
