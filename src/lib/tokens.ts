import colorTokens from "@root/src/tokens/colors.json";

// Raw color palettes — use this when you need a fixed-mode color
// (e.g. always-dark logo background). For the active theme, prefer `useTheme()`.
export const palettes = colorTokens;

export type ColorKeys = keyof typeof colorTokens.light;
