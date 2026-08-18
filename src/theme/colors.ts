/**
 * Redtail palette.
 * A red-tailed hawk hunts by patience and precision, then closes fast and
 * exact. That's the brand idea: a calm, warm surface (cream paper, soft
 * light) with one decisive accent - the hawk's rust-red tail - reserved for
 * moments of action and status. Everything else stays quiet so the accent
 * keeps its meaning.
 */

export const palette = {
  // Cream surfaces - gentle, low-glare, warm rather than sterile white.
  paper: "#FBF7EF", // app background
  cardPaper: "#F4EEE1", // raised surfaces, bubbles, cards
  cardPaperAlt: "#EFE7D6", // secondary raised surface / pressed state

  // Ink - warm near-black, never pure #000 (softer on the eyes)
  ink: "#2A241C",
  inkMuted: "#6B6153",
  inkFaint: "#9C927F",

  hairline: "#E4DAC5",
  hairlineStrong: "#D8CBAE",

  // Redtail accent - a true brick/rust red, distinct from generic
  // AI-orange. Used sparingly: primary actions, the agent's mark, alerts.
  tail: "#A93A2B",
  tailDeep: "#8A2E22",
  tailSoft: "#F0DBD2", // tail tint for chips / highlighted rows

  // Sage - secondary accent for confirmations, delivered states, success.
  sage: "#6E7F52",
  sageSoft: "#E3E8D6",

  // Gold - reserved for savings / price-match / highlight moments.
  gold: "#B98A32",
  goldSoft: "#F3E7CE",

  // Status
  danger: "#B23B2E",
  dangerSoft: "#F5DCD6",
  warning: "#B98A32",
  warningSoft: "#F3E7CE",
  success: "#5C7A45",
  successSoft: "#E3E8D6",
  info: "#5C7488",
  infoSoft: "#E1E7EA",

  white: "#FFFFFF",
} as const;

export const colors = {
  background: palette.paper,
  surface: palette.cardPaper,
  surfaceAlt: palette.cardPaperAlt,
  border: palette.hairline,
  borderStrong: palette.hairlineStrong,

  textPrimary: palette.ink,
  textSecondary: palette.inkMuted,
  textFaint: palette.inkFaint,
  textOnAccent: palette.white,

  accent: palette.tail,
  accentDeep: palette.tailDeep,
  accentSoft: palette.tailSoft,

  secondary: palette.sage,
  secondarySoft: palette.sageSoft,

  gold: palette.gold,
  goldSoft: palette.goldSoft,

  danger: palette.danger,
  dangerSoft: palette.dangerSoft,
  warning: palette.warning,
  warningSoft: palette.warningSoft,
  success: palette.success,
  successSoft: palette.successSoft,
  info: palette.info,
  infoSoft: palette.infoSoft,

  // Chat bubbles
  bubbleAgent: palette.cardPaper,
  bubbleUser: palette.tail,
  bubbleUserText: palette.white,
};

export type OrderStatusTone = "info" | "warning" | "success" | "danger";

export const statusTone: Record<string, OrderStatusTone> = {
  agent_reviewing: "info",
  placed: "info",
  confirmed: "info",
  preparing: "warning",
  shipped: "warning",
  out_for_delivery: "warning",
  delivered: "success",
  cancelled: "danger",
  issue: "danger",
};

export const toneColors: Record<OrderStatusTone, { fg: string; bg: string }> = {
  info: { fg: colors.info, bg: colors.infoSoft },
  warning: { fg: colors.warning, bg: colors.warningSoft },
  success: { fg: colors.success, bg: colors.successSoft },
  danger: { fg: colors.danger, bg: colors.dangerSoft },
};
