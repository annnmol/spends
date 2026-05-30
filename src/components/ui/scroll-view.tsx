import { forwardRef } from "react";
import { ScrollView, ScrollViewProps } from "react-native";

//custom imports
import { useThemeColor } from "@mobile/components/hooks/useThemeColor";
import { ThemeKeys } from "@mobile/lib/theme";

type AppScrollViewProps = ScrollViewProps & {
  lightColor?: string;
  darkColor?: string;
  themeKey?: ThemeKeys;
};

const AppScrollView = forwardRef<ScrollView, AppScrollViewProps>(
  (
    {
      contentContainerStyle,
      lightColor,
      darkColor,
      themeKey = "background",
      ...otherProps
    },
    ref
  ) => {
    const backgroundColor = useThemeColor(
      { light: lightColor, dark: darkColor },
      themeKey
    );

    return (
      <ScrollView
        ref={ref}
        contentContainerStyle={[{ backgroundColor }, contentContainerStyle]}
        {...otherProps}
      />
    );
  }
);

AppScrollView.displayName = "AppScrollView";

export default AppScrollView;
