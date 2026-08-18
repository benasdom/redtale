import React, { useEffect, useCallback, useState } from "react";
import { View, FlatList, StyleSheet, Pressable, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@src/components/ThemedText";
import { Card } from "@src/components/Card";
import { StatusBadge } from "@src/components/StatusBadge";
import { colors } from "@src/theme/colors";
import { space } from "@src/theme/typography";
import { useAppDispatch, useAppSelector } from "@src/store/hooks";
import { loadOrders } from "@src/store/slices/ordersSlice";
import { Order } from "@src/types";
import { formatCurrency, daysRemaining } from "@src/utils/format";

export default function OrdersScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { items, status } = useAppSelector((s) => s.orders);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(loadOrders());
  }, [dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await dispatch(loadOrders());
    setRefreshing(false);
  }, [dispatch]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <ThemedText variant="displayMd">Orders</ThemedText>
      </View>

      {status === "loaded" && items.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="cube-outline" size={40} color={colors.textFaint} />
          <ThemedText variant="title" style={{ marginTop: space.md }} center>
            No orders yet
          </ThemedText>
          <ThemedText variant="body" color={colors.textSecondary} center style={{ marginTop: space.xs }}>
            Ask your agent for anything you want to buy - it'll show up here once it's placed.
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(o) => o.id}
          contentContainerStyle={{ padding: space.md, gap: space.sm }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
          renderItem={({ item }) => <OrderRow order={item} onPress={() => router.push(`/order/${item.id}`)} />}
        />
      )}
    </SafeAreaView>
  );
}

function OrderRow({ order, onPress }: { order: Order; onPress: () => void }) {
  const primaryItem = order.items[0];
  const remaining = daysRemaining(order.windowClosesAt);
  const trackingClosed = order.status !== "delivered" && remaining === 0 && order.status !== "cancelled";

  return (
    <Pressable onPress={onPress}>
      <Card>
        <View style={styles.rowTop}>
          <ThemedText variant="caption" color={colors.textFaint}>
            {order.id}
          </ThemedText>
          <StatusBadge status={order.status} />
        </View>
        <ThemedText variant="bodyMedium" style={{ marginTop: 6 }} numberOfLines={1}>
          {primaryItem.offer.title}
          {order.items.length > 1 ? ` +${order.items.length - 1} more` : ""}
        </ThemedText>
        <View style={styles.rowBottom}>
          <ThemedText variant="caption" color={colors.textSecondary}>
            {formatCurrency(order.total)}
          </ThemedText>
          {order.status === "delivered" ? (
            <ThemedText variant="caption" color={colors.textFaint}>
              {remaining > 0 ? `Tracking available ${remaining}d more` : "Tracking window closed"}
            </ThemedText>
          ) : (
            <ThemedText variant="caption" color={colors.textFaint}>
              {order.trackingNumber ? `Tracking: ${order.trackingNumber}` : "Preparing to ship"}
            </ThemedText>
          )}
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: space.md, paddingTop: space.sm, paddingBottom: space.xs },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: space.xl },
  rowTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  rowBottom: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: space.sm },
});
