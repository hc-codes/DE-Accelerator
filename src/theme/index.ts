import { focusLight } from "./focus-light";
import { focusDark } from "./focus-dark";
import { deepReading } from "./deep-reading";

export const themes = {
  "focus-light": focusLight,
  "focus-dark": focusDark,
  "deep-reading": deepReading,
} as const;

export type ThemeType = keyof typeof themes;
