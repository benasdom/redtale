import React, { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet, Pressable, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@src/components/ThemedText";
import { Card } from "@src/components/Card";
import { StatusBadge } from "@src/components/StatusBadge";
import { OrderTimeline } from "@src/components/OrderTimeline";
import { PrimaryButton } from "@src/components/PrimaryButton";
import { colors } from "@src/theme/colors";
import { radius, space } from "@src/theme/typography";
import { useAppSelector } from "@src/store/hooks";
import { formatCurrency, daysRemaining, formatDateTime } from "@src/utils/format";
import * as orderService from "@src/services/orderService";
import { Order } from "@src/types";

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const cached = useAppSelector((s) => s.orders.items.find((o) => o.id === id));
  const [order, setOrder] = useState<Order | undefined>(cached);

  useEffect(() => {
    if (!cached && id) {
      orderService.fetchOrderById(id).then(setOrder);
    } else {
      setOrder(cached);
    }
  }, [id, cached]);

  if (!order) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScreenHeader title="Order" onBack={() => router.back()} />
        <View style={styles.center}>
          <ThemedText color={colors.textSecondary}>Loading order…</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  const remaining = daysRemaining(order.windowClosesAt);
  const trackingActive = remaining > 0;

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title={order.id} onBack={() => router.back()} />
      <ScrollView contentContainerStyle={{ padding: space.md, paddingBottom: space.xxl }}>
        <View style={styles.statusHeaderRow}>
          <StatusBadge status={order.status} />
          <ThemedText variant="caption" color={colors.textFaint}>
            {trackingActive ? `Tracking active · ${remaining}d left` : "Tracking window closed"}
          </ThemedText>
        </View>

        {order.estimatedDelivery && order.status !== "delivered" && (
          <ThemedText variant="displayMd" style={{ marginTop: space.sm }}>
            Arriving {formatDateTime(order.estimatedDelivery)}
          </ThemedText>
        )}

        {order.trackingNumber && (
          <Card style={{ marginTop: space.md }}>
            <View style={styles.trackRow}>
              <View>
                <ThemedText variant="caption" color={colors.textFaint}>
                  {order.carrier} tracking number
                </ThemedText>
                <ThemedText variant="bodyMedium" style={{ marginTop: 2 }}>
                  {order.trackingNumber}
                </ThemedText>
              </View>
              <Pressable
                onPress={() =>
                  Linking.openURL(`https://www.google.com/search?q=${order.carrier}+tracking+${order.trackingNumber}`)
                }
                style={styles.trackBtn}
              >
                <ThemedText variant="caption" color={colors.accentDeep}>
                  Track on carrier site
                </ThemedText>
                <Ionicons name="open-outline" size={13} color={colors.accentDeep} style={{ marginLeft: 4 }} />
              </Pressable>
            </View>
          </Card>
        )}

        <Card style={{ marginTop: space.md }}>
          <ThemedText variant="title" style={{ marginBottom: space.sm }}>
            Delivery progress
          </ThemedText>
          <OrderTimeline events={order.timeline} />
        </Card>

        <Card style={{ marginTop: space.md }}>
          <ThemedText variant="title" style={{ marginBottom: space.sm }}>
            Items
          </ThemedText>
          {order.items.map((it, idx) => (
            <View key={idx} style={styles.itemRow}>
              <View style={styles.itemThumb}>
                <Ionicons name="cube-outline" size={18} color={colors.textFaint} />
              </View>
              <View style={{ flex: 1, marginLeft: space.sm }}>
                <ThemedText variant="body" numberOfLines={2}>
                  {it.offer.title}
                </ThemedText>
                <ThemedText variant="caption" color={colors.textFaint}>
                  Qty {it.quantity} · {it.offer.retailer}
                </ThemedText>
              </View>
              <ThemedText variant="bodyMedium">{formatCurrency(it.offer.price * it.quantity)}</ThemedText>
            </View>
          ))}

          <View style={styles.divider} />
          <SummaryLine label="Subtotal" value={formatCurrency(order.subtotal)} />
          <SummaryLine label="Shipping" value={order.shippingFee === 0 ? "Free" : formatCurrency(order.shippingFee)} />
          <SummaryLine label="Service fee" value={formatCurrency(order.serviceFee)} />
          <SummaryLine label="Total" value={formatCurrency(order.total)} emphasized />
        </Card>

        <Card style={{ marginTop: space.md }}>
          <ThemedText variant="title" style={{ marginBottom: space.xs }}>
            Shipping to
          </ThemedText>
          <ThemedText variant="body">{order.shippingAddress.fullName}</ThemedText>
          <ThemedText variant="caption" color={colors.textSecondary}>
            {order.shippingAddress.line1}
            {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""}
            {"\n"}
            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
          </ThemedText>
        </Card>

        <Card style={{ marginTop: space.md }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="person-circle-outline" size={22} color={colors.textSecondary} />
            <ThemedText variant="bodyMedium" style={{ marginLeft: space.xs }}>
              Placed by agent {order.agentName}
            </ThemedText>
          </View>
          {order.agentNote && (
            <ThemedText variant="caption" color={colors.textSecondary} style={{ marginTop: space.xs }}>
              "{order.agentNote}"
            </ThemedText>
          )}
        </Card>

        {order.status !== "delivered" && order.status !== "cancelled" && (
          <PrimaryButton
            label="Message agent about this order"
            variant="secondary"
            onPress={() => router.push("/(tabs)")}
            style={{ marginTop: space.lg }}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function ScreenHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable onPress={onBack} hitSlop={12} style={styles.backBtn}>
        <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
      </Pressable>
      <ThemedText variant="title" numberOfLines={1} style={{ flex: 1, marginLeft: space.xs }}>
        {title}
      </ThemedText>
    </View>
  );
}

function SummaryLine({ label, value, emphasized }: { label: string; value: string; emphasized?: boolean }) {
  return (
    <View style={styles.summaryLine}>
      <ThemedText variant={emphasized ? "bodyMedium" : "caption"} color={emphasized ? colors.textPrimary : colors.textSecondary}>
        {label}
      </ThemedText>
      <ThemedText variant={emphasized ? "bodyMedium" : "caption"} color={emphasized ? colors.accentDeep : colors.textSecondary}>
        {value}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
  statusHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  trackRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  trackBtn: { flexDirection: "row", alignItems: "center" },
  itemRow: { flexDirection: "row", alignItems: "center", marginBottom: space.sm },
  itemThumb: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: space.sm },
  summaryLine: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
});
