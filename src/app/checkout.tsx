import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, ScrollView, StyleSheet, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Paystack, paystackProps } from "react-native-paystack-webview";
import { ThemedText } from "@src/components/ThemedText";
import { Card } from "@src/components/Card";
import { PrimaryButton } from "@src/components/PrimaryButton";
import { colors } from "@src/theme/colors";
import { space } from "@src/theme/typography";
import { useAppDispatch, useAppSelector } from "@src/store/hooks";
import { loadAddresses } from "@src/store/slices/addressSlice";
import { placeNewOrder } from "@src/store/slices/ordersSlice";
import { clearCart, setBuyNowOffer } from "@src/store/slices/cartSlice";
import { formatCurrency } from "@src/utils/format";
import * as paymentService from "@src/services/paymentService";

export default function CheckoutScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const user = useAppSelector((s) => s.auth.user);
  const cart = useAppSelector((s) => s.cart);
  const addresses = useAppSelector((s) => s.address.items);
  const paystackRef = useRef<paystackProps.PayStackRef>(null);

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);
  const [reference, setReference] = useState<string | null>(null);

  const checkoutItems = useMemo(() => {
    if (cart.checkoutOfferId) {
      return cart.items.filter((i) => i.offer.id === cart.checkoutOfferId);
    }
    return cart.items;
  }, [cart]);

  const subtotal = checkoutItems.reduce((sum, i) => sum + i.offer.price * i.quantity, 0);
  const serviceFee = Math.max(2.99, subtotal * 0.02);
  const total = subtotal + serviceFee;

  useEffect(() => {
    dispatch(loadAddresses());
  }, [dispatch]);

  useEffect(() => {
    if (!selectedAddressId && addresses.length) {
      const def = addresses.find((a) => a.isDefault) ?? addresses[0];
      setSelectedAddressId(def.id);
    }
  }, [addresses, selectedAddressId]);

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

  async function beginPayment() {
    if (!selectedAddress) {
      Alert.alert("Add a shipping address", "You'll need a shipping address before checking out.");
      return;
    }
    const init = await paymentService.initializeTransaction(user?.email ?? "guest@redtail.app", total);
    setReference(init.reference);
    // Slight delay to ensure state is set before the webview reads it.
    requestAnimationFrame(() => paystackRef.current?.startTransaction());
  }

  async function handlePaymentSuccess() {
    if (!selectedAddress || !reference) return;
    setPlacing(true);
    try {
      // TODO(backend): server should call verifyTransaction(reference) and
      // only fulfil the order once Paystack itself confirms success.
      await paymentService.verifyTransaction(reference);
      for (const item of checkoutItems) {
        await dispatch(
          placeNewOrder({
            offer: item.offer,
            quantity: item.quantity,
            address: selectedAddress,
            paymentReference: reference,
          })
        );
      }
      dispatch(clearCart());
      dispatch(setBuyNowOffer(null));
      Alert.alert("Order placed", "Your Redtail agent is now reviewing and will place your order shortly.", [
        { text: "View orders", onPress: () => router.replace("/(tabs)/orders") },
      ]);
    } finally {
      setPlacing(false);
    }
  }

  if (checkoutItems.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <Header onClose={() => router.back()} />
        <View style={styles.center}>
          <ThemedText color={colors.textSecondary}>Nothing to check out.</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Header onClose={() => router.back()} />
      <ScrollView contentContainerStyle={{ padding: space.md, paddingBottom: space.xxl }}>
        <SectionLabel label="Items" />
        <Card>
          {checkoutItems.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <ThemedText variant="body" style={{ flex: 1 }} numberOfLines={2}>
                {item.offer.title} × {item.quantity}
              </ThemedText>
              <ThemedText variant="bodyMedium">{formatCurrency(item.offer.price * item.quantity)}</ThemedText>
            </View>
          ))}
        </Card>

        <SectionLabel label="Shipping address" />
        {addresses.length === 0 ? (
          <PrimaryButton
            label="Add a shipping address"
            variant="secondary"
            onPress={() => router.push("/address/new")}
          />
        ) : (
          <>
            {addresses.map((addr) => (
              <Pressable key={addr.id} onPress={() => setSelectedAddressId(addr.id)} style={{ marginBottom: space.xs }}>
                <Card
                  style={
                    selectedAddressId === addr.id
                      ? { borderColor: colors.accent, borderWidth: 1.5 }
                      : undefined
                  }
                >
                  <View style={styles.addrRow}>
                    <View style={{ flex: 1 }}>
                      <ThemedText variant="bodyMedium">
                        {addr.label} · {addr.fullName}
                      </ThemedText>
                      <ThemedText variant="caption" color={colors.textSecondary}>
                        {addr.line1}, {addr.city}, {addr.state} {addr.zip}
                      </ThemedText>
                    </View>
                    {selectedAddressId === addr.id && (
                      <Ionicons name="checkmark-circle" size={20} color={colors.accent} />
                    )}
                  </View>
                </Card>
              </Pressable>
            ))}
            <Pressable onPress={() => router.push("/address/new")}>
              <ThemedText variant="caption" color={colors.accentDeep} style={{ marginTop: space.xs }}>
                + Add another address
              </ThemedText>
            </Pressable>
          </>
        )}

        <SectionLabel label="Order summary" />
        <Card>
          <SummaryLine label="Subtotal" value={formatCurrency(subtotal)} />
          <SummaryLine label="Shipping" value="Free" />
          <SummaryLine label="Service fee" value={formatCurrency(serviceFee)} />
          <View style={styles.divider} />
          <SummaryLine label="Total" value={formatCurrency(total)} emphasized />
        </Card>

        <ThemedText variant="caption" color={colors.textFaint} style={{ marginTop: space.md }}>
          A human Redtail agent places this order for you once payment is confirmed - the AI never
          submits payment or checkout on your behalf.
        </ThemedText>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton label={`Pay ${formatCurrency(total)}`} onPress={beginPayment} loading={placing} />
      </View>

      {/* Paystack webview: mounted invisibly until startTransaction() opens it */}
      {reference && user && (
        <Paystack
          paystackKey={paymentService.PAYSTACK_PUBLIC_KEY}
          amount={total}
          billingEmail={user.email}
          billingName={user.fullName}
          currency="USD"
          refNumber={reference}
          activityIndicatorColor={colors.accent}
          ref={paystackRef}
          onCancel={() => setReference(null)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </SafeAreaView>
  );
}

function Header({ onClose }: { onClose: () => void }) {
  return (
    <View style={styles.header}>
      <ThemedText variant="title">Checkout</ThemedText>
      <Pressable onPress={onClose} hitSlop={12} style={styles.closeBtn}>
        <Ionicons name="close" size={20} color={colors.textPrimary} />
      </Pressable>
    </View>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <ThemedText variant="micro" color={colors.textFaint} style={{ marginTop: space.md, marginBottom: space.xs }}>
      {label.toUpperCase()}
    </ThemedText>
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
    justifyContent: "space-between",
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  itemRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: space.xs },
  addrRow: { flexDirection: "row", alignItems: "center" },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: space.sm },
  summaryLine: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
  footer: {
    padding: space.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
});
