import { Platform } from "react-native";

/**
 * Type system. We lean on the platform serif for display moments (a
 * warm, editorial feel appropriate to a "vendor you trust") and the
 * platform system sans for everything functional, so the app stays
 * fast and font-license-free while still feeling considered.
 */
export const fontFamily = {
  display: Platform.select({ ios: "Georgia", android: "serif", default: "Georgia, serif" }),
  body: Platform.select({
    ios: "System",
    android: "sans-serif",
    default:
      "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
  }),
  mono: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }),
};

export const type = {
  displayLg: { fontFamily: fontFamily.display, fontSize: 32, lineHeight: 38, letterSpacing: 0.2 },
  displayMd: { fontFamily: fontFamily.display, fontSize: 24, lineHeight: 30, letterSpacing: 0.1 },
  title: { fontFamily: fontFamily.body, fontSize: 18, lineHeight: 24, fontWeight: "600" as const },
  body: { fontFamily: fontFamily.body, fontSize: 15, lineHeight: 22, fontWeight: "400" as const },
  bodyMedium: { fontFamily: fontFamily.body, fontSize: 15, lineHeight: 22, fontWeight: "600" as const },
  caption: { fontFamily: fontFamily.body, fontSize: 12.5, lineHeight: 17, fontWeight: "500" as const },
  micro: { fontFamily: fontFamily.body, fontSize: 11, lineHeight: 14, fontWeight: "600" as const, letterSpacing: 0.4 },
  button: { fontFamily: fontFamily.body, fontSize: 15.5, lineHeight: 20, fontWeight: "700" as const },
  mono: { fontFamily: fontFamily.mono, fontSize: 13, lineHeight: 18 },
};

export const space = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 10,
  md: 16,
  lg: 22,
  pill: 999,
};

export const shadow = {
  card: {
    shadowColor: "#2A241C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  raised: {
    shadowColor: "#2A241C",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
  },
};
