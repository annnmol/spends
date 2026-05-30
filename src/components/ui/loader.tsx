import React, { ComponentType, memo, useState } from "react";
import { ActivityIndicator, Modal, StyleSheet, View } from "react-native";

// Custom imports
import { constants } from "@mobile/lib/helpers";
import { theme } from "@mobile/lib/theme";

// TODO: when @tanstack/react-query is installed, wire these up so the HOC
// also reacts to any in-flight query/mutation, not just local loading state.
// import { useIsFetching, useIsMutating } from "@tanstack/react-query";

// The AppActivityIndicator component
export const AppActivityIndicator = memo(() => (
  <Modal visible transparent animationType="fade">
    <View style={styles.loaderContainer}>
      <ActivityIndicator size="large" color={theme.textMuted} />
    </View>
  </Modal>
));

export const AppInlineActivityIndicator = memo(() => (
  <View style={styles.inlineContainer}>
    <ActivityIndicator size="large" color={theme.textMuted} />
  </View>
));

export interface WithActivityIndicatorProps {
  setLoading: (loading: boolean) => void;
}

// Higher-Order Component (HOC) to add loading functionality
function withActivityIndicator<P extends WithActivityIndicatorProps>(
  WrappedComponent: ComponentType<P>
) {
  const WithLoadingComponent = (props: Omit<P, "setLoading">) => {
    const [loading, setLoading] = useState<boolean>(false);
    // const isFetching = useIsFetching();
    // const isMutating = useIsMutating();

    return (
      <>
        {loading ? <AppActivityIndicator /> : null}
        <WrappedComponent {...(props as P)} setLoading={setLoading} />
      </>
    );
  };

  return memo(WithLoadingComponent);
}

AppActivityIndicator.displayName = "AppActivityIndicator";
AppInlineActivityIndicator.displayName = "AppInlineActivityIndicator";

export default withActivityIndicator;

// Styles
const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.1)",
    position: "absolute",
    zIndex: 99,
    width: constants.deviceWidth,
    height: constants.deviceHeight + 30,
  },
  inlineContainer: {
    flex: 1,
    marginTop: 60,
    alignItems: "center",
  },
});
