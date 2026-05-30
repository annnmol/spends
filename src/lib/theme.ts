import { useMemo } from "react";
import { Appearance, useColorScheme } from "react-native";

// custom imports
import useSystemStore from "@root/src/store/slices/system";
import colorTokens from "@root/src/tokens/colors.json";

type ThemeMode = "light" | "dark";

const lightTheme = colorTokens.light;
const darkTheme = colorTokens.dark;

// Raw palettes — exported for `useThemeColor` and any code that needs
// to read a fixed-mode color regardless of the active scheme.
export const colors = colorTokens;

export type ThemeTypeMap = typeof lightTheme;
export type ThemeKeys = keyof ThemeTypeMap;

// Resolved once at module load. Theme change requires app restart —
// prompt the user to reopen the app when they toggle the scheme.
const userPreference = useSystemStore.getState().colorScheme ?? "system";
const systemPreference = (Appearance.getColorScheme() ?? "light") as ThemeMode;

export const colorScheme: ThemeMode =
  userPreference === "system" ? systemPreference : userPreference;

export const theme: ThemeTypeMap =
  colorScheme === "dark" ? darkTheme : lightTheme;

export const isDarkTheme: boolean = colorScheme === "dark" ? true : false;

// Reactive hook — for the rare case a screen must respond without restart.
export const useTheme = () => {
  const userPref = useSystemStore((s) => s.colorScheme);
  const sysPref = (useColorScheme() ?? "light") as ThemeMode;
  const mode: ThemeMode = userPref === "system" ? sysPref : userPref;
  return useMemo(
    () => ({
      theme: mode === "dark" ? darkTheme : lightTheme,
      mode,
      isDark: mode === "dark",
    }),
    [mode],
  );
};
