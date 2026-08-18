import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "./ThemedText";
import { colors } from "@src/theme/colors";
import { radius, space } from "@src/theme/typography";
import { ProductOffer } from "@src/types";
import { formatCurrency } from "@src/utils/format";

interface Props {
  offer: ProductOffer;
  onSelect: (offer: ProductOffer) => void;
  compact?: boolean;
}

export function ProductOfferCard({ offer, onSelect, compact }: Props) {
  return (
    <Pressable
      onPress={() => offer.inStock && onSelect(offer)}
      disabled={!offer.inStock}
      style={({ pressed }) => [
        styles.card,
        compact ? { width: 236 } : null,
        offer.isBestValue ? styles.bestValue : null,
        { opacity: offer.inStock ? (pressed ? 0.9 : 1) : 0.5 },
      ]}
    >
      {offer.isBestValue && (
        <View style={styles.bestValueChip}>
          <ThemedText variant="micro" color={colors.textOnAccent}>
            BEST VALUE
          </ThemedText>
        </View>
      )}

      <View style={styles.retailerRow}>
        <View style={styles.retailerBadge}>
          <ThemedText variant="micro" color={colors.textSecondary}>
            {offer.retailerLogoInitial.toUpperCase()}
          </ThemedText>
        </View>
        <ThemedText variant="caption" color={colors.textSecondary}>
          {offer.retailer}
        </ThemedText>
      </View>

      <ThemedText variant="bodyMedium" style={{ marginTop: space.xs }} numberOfLines={2}>
        {offer.title}
      </ThemedText>

      <View style={styles.priceRow}>
        <ThemedText variant="title" color={colors.accentDeep}>
          {formatCurrency(offer.price)}
        </ThemedText>
        {offer.originalPrice && (
          <ThemedText
            variant="caption"
            color={colors.textFaint}
            style={{ marginLeft: space.xs, textDecorationLine: "line-through" }}
          >
            {formatCurrency(offer.originalPrice)}
          </ThemedText>
        )}
      </View>

      {offer.rating && (
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={13} color={colors.gold} />
          <ThemedText variant="caption" color={colors.textSecondary} style={{ marginLeft: 4 }}>
            {offer.rating.toFixed(1)} ({offer.reviewCount?.toLocaleString()})
          </ThemedText>
        </View>
      )}

      <View style={styles.shippingRow}>
        <Ionicons name="cube-outline" size={13} color={colors.textFaint} />
        <ThemedText variant="caption" color={colors.textFaint} style={{ marginLeft: 4, flex: 1 }} numberOfLines={1}>
          {offer.inStock ? offer.shippingEstimate : "Out of stock"}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space.sm,
    marginRight: space.sm,
  },
  bestValue: {
    borderColor: colors.accent,
    borderWidth: 1.5,
  },
  bestValueChip: {
    position: "absolute",
    top: -1,
    right: -1,
    backgroundColor: colors.accent,
    paddingHorizontal: space.xs,
    paddingVertical: 3,
    borderTopRightRadius: radius.md,
    borderBottomLeftRadius: radius.sm,
  },
  retailerRow: { flexDirection: "row", alignItems: "center" },
  retailerBadge: {
    width: 20,
    height: 20,
    borderRadius: 6,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },
  priceRow: { flexDirection: "row", alignItems: "baseline", marginTop: 6 },
  ratingRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  shippingRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
});
