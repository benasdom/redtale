import React from "react";
import { View, StyleSheet } from "react-native";
import { ThemedText } from "./ThemedText";
import { statusTone, toneColors } from "@src/theme/colors";
import { radius, space } from "@src/theme/typography";
import { OrderStatusKey } from "@src/types";

const LABELS: Record<OrderStatusKey, string> = {
  agent_reviewing: "Agent reviewing",
  placed: "Placed",
  confirmed: "Confirmed",
  preparing: "Preparing",
  shipped: "Shipped",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  issue: "Needs attention",
};

export function StatusBadge({ status }: { status: OrderStatusKey }) {
  const tone = statusTone[status] ?? "info";
  const { fg, bg } = toneColors[tone];
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <View style={[styles.dot, { backgroundColor: fg }]} />
      <ThemedText variant="micro" color={fg} style={{ textTransform: "uppercase" }}>
        {LABELS[status]}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: space.sm,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
});
