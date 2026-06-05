import type { ColorValue } from "react-native";

/**
 * Returns `color` with the given alpha (0–1) when it is a 6-digit hex string,
 * otherwise returns it untouched. Used for soft glows/tints without pulling in
 * a color library.
 */
export function withAlpha(color: ColorValue, alpha: number): ColorValue {
  if (typeof color !== "string") return color;
  const hex = color.trim();
  if (/^#([0-9a-fA-F]{6})$/.test(hex)) {
    const a = Math.round(Math.max(0, Math.min(1, alpha)) * 255)
      .toString(16)
      .padStart(2, "0");
    return `${hex}${a}`;
  }
  return color;
}
