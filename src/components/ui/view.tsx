import { forwardRef, memo, useMemo } from "react";
import { View, type ViewProps } from "react-native";

//custom imports
import { ThemeKeys } from "@mobile/lib/theme";
import { useThemeColor } from "@root/src/components/hooks/useThemeColor";

export type AppViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  themeKey?: ThemeKeys;
};

const AppView = memo(
  forwardRef<View, AppViewProps>(
    (
      { style, lightColor, darkColor, themeKey = "background", ...otherProps },
      ref,
    ) => {
      const backgroundColor = useThemeColor(
        { light: lightColor, dark: darkColor },
        themeKey,
      );

      // Memoize the combined styles to avoid unnecessary recalculations
      const combinedStyles = useMemo(
        () => [{ backgroundColor }, style],
        [backgroundColor, style],
      );

      return <View ref={ref} style={combinedStyles} {...otherProps} />;
    },
  ),
);

export default AppView;
