import { PropsWithChildren } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const GlobalProviders = ({ children }: PropsWithChildren) => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {children}
    </GestureHandlerRootView>
  );
};

export default GlobalProviders;
