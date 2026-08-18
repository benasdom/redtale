import React from "react";
import { View, FlatList, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@src/components/ThemedText";
import { Card } from "@src/components/Card";
import { PrimaryButton } from "@src/components/PrimaryButton";
import { colors } from "@src/theme/colors";
import { radius, space } from "@src/theme/typography";
import { useAppDispatch, useAppSelector } from "@src/store/hooks";
import { removeFromCart, updateQuantity, setBuyNowOffer } from "@src/store/slices/cartSlice";
import { CartItem } from "@src/types";
import { formatCurrency } from "@src/utils/format";

export default function CartScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const items = useAppSelector((s) => s.cart.items);
  const subtotal = items.reduce((sum, i) => sum + i.offer.price * i.quantity, 0);

  function checkoutAll() {
    dispatch(setBuyNowOffer(null));
    router.push("/checkout");
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <ThemedText variant="displayMd">Cart</ThemedText>
      </View>

      {items.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="bag-handle-outline" size={40} color={colors.textFaint} />
          <ThemedText variant="title" style={{ marginTop: space.md }} center>
            Your cart is empty
          </ThemedText>
          <ThemedText variant="body" color={colors.textSecondary} center style={{ marginTop: space.xs }}>
            When your agent finds something you like, add it here before checking out.
          </ThemedText>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(i) => i.id}
            contentContainerStyle={{ padding: space.md, gap: space.sm }}
            renderItem={({ item }) => (
              <CartRow
                item={item}
                onIncrement={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))}
                onDecrement={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }))}
                onRemove={() => dispatch(removeFromCart(item.id))}
              />
            )}
          />
          <View style={styles.footer}>
            <View style={styles.subtotalRow}>
              <ThemedText variant="body" color={colors.textSecondary}>
                Subtotal
              </ThemedText>
              <ThemedText variant="title">{formatCurrency(subtotal)}</ThemedText>
            </View>
            <PrimaryButton label="Checkout" onPress={checkoutAll} />
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

function CartRow({
  item,
  onIncrement,
  onDecrement,
  onRemove,
}: {
  item: CartItem;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
}) {
  return (
    <Card>
      <View style={styles.row}>
        <View style={styles.thumb}>
          <Ionicons name="cube-outline" size={20} color={colors.textFaint} />
        </View>
        <View style={{ flex: 1, marginLeft: space.sm }}>
          <ThemedText variant="bodyMedium" numberOfLines={2}>
            {item.offer.title}
          </ThemedText>
          <ThemedText variant="caption" color={colors.textFaint}>
            {item.offer.retailer}
          </ThemedText>
          <ThemedText variant="bodyMedium" color={colors.accentDeep} style={{ marginTop: 4 }}>
            {formatCurrency(item.offer.price)}
          </ThemedText>
        </View>
        <Pressable onPress={onRemove} hitSlop={10}>
          <Ionicons name="trash-outline" size={18} color={colors.textFaint} />
        </Pressable>
      </View>
      <View style={styles.qtyRow}>
        <Pressable onPress={onDecrement} style={styles.qtyBtn}>
          <Ionicons name="remove" size={16} color={colors.textPrimary} />
        </Pressable>
        <ThemedText variant="bodyMedium" style={{ marginHorizontal: space.md }}>
          {item.quantity}
        </ThemedText>
        <Pressable onPress={onIncrement} style={styles.qtyBtn}>
          <Ionicons name="add" size={16} color={colors.textPrimary} />
        </Pressable>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: space.md, paddingTop: space.sm, paddingBottom: space.xs },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: space.xl },
  row: { flexDirection: "row", alignItems: "flex-start" },
  thumb: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyRow: { flexDirection: "row", alignItems: "center", marginTop: space.sm, alignSelf: "flex-start" },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    padding: space.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  subtotalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: space.sm },
});
