import { forwardRef, memo } from "react";
import { View, type ViewProps } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

//custom imports
import { useThemeColor } from "@mobile/components/hooks/useThemeColor";
import { ThemeKeys } from "@mobile/lib/theme";

type AppSafeAreaViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  themeKey?: ThemeKeys;
};

const AppSafeAreaView = memo(
  forwardRef<View, AppSafeAreaViewProps>(
    (
      { style, lightColor, darkColor, themeKey = "background", ...otherProps },
      ref,
    ) => {
      const backgroundColor = useThemeColor(
        { light: lightColor, dark: darkColor },
        themeKey,
      );

      return (
        <SafeAreaView
          ref={ref}
          style={[{ backgroundColor, flex: 1 }, style]}
          {...otherProps}
        />
      );
    },
  ),
);

export default AppSafeAreaView;
