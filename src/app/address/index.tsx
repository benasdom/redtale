import React, { useEffect } from "react";
import { View, FlatList, StyleSheet, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@src/components/ThemedText";
import { Card } from "@src/components/Card";
import { PrimaryButton } from "@src/components/PrimaryButton";
import { colors } from "@src/theme/colors";
import { space } from "@src/theme/typography";
import { useAppDispatch, useAppSelector } from "@src/store/hooks";
import { loadAddresses, makeDefaultAddress, removeAddress } from "@src/store/slices/addressSlice";
import { Address } from "@src/types";

export default function AddressListScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { items } = useAppSelector((s) => s.address);

  useEffect(() => {
    dispatch(loadAddresses());
  }, [dispatch]);

  function confirmDelete(addr: Address) {
    Alert.alert("Remove address", `Remove "${addr.label}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => dispatch(removeAddress(addr.id)) },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <ThemedText variant="title" style={{ marginLeft: space.xs }}>
          Shipping addresses
        </ThemedText>
      </View>

      <FlatList
        data={items}
        keyExtractor={(a) => a.id}
        contentContainerStyle={{ padding: space.md, gap: space.sm }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <ThemedText color={colors.textSecondary} center>
              No saved addresses yet.
            </ThemedText>
          </View>
        }
        renderItem={({ item }) => (
          <Card>
            <View style={styles.rowTop}>
              <ThemedText variant="bodyMedium">{item.label}</ThemedText>
              {item.isDefault && (
                <View style={styles.defaultChip}>
                  <ThemedText variant="micro" color={colors.accentDeep}>
                    DEFAULT
                  </ThemedText>
                </View>
              )}
            </View>
            <ThemedText variant="body" style={{ marginTop: 4 }}>
              {item.fullName}
            </ThemedText>
            <ThemedText variant="caption" color={colors.textSecondary}>
              {item.line1}
              {item.line2 ? `, ${item.line2}` : ""}
              {"\n"}
              {item.city}, {item.state} {item.zip}
              {"\n"}
              {item.phone}
            </ThemedText>
            <View style={styles.actionsRow}>
              {!item.isDefault && (
                <Pressable onPress={() => dispatch(makeDefaultAddress(item.id))}>
                  <ThemedText variant="caption" color={colors.accentDeep}>
                    Make default
                  </ThemedText>
                </Pressable>
              )}
              <Pressable onPress={() => confirmDelete(item)}>
                <ThemedText variant="caption" color={colors.danger}>
                  Remove
                </ThemedText>
              </Pressable>
            </View>
          </Card>
        )}
      />

      <View style={styles.footer}>
        <PrimaryButton label="Add new address" onPress={() => router.push("/address/new")} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
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
  empty: { paddingTop: space.xxl, alignItems: "center" },
  rowTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  defaultChip: {
    backgroundColor: colors.accentSoft,
    paddingHorizontal: space.xs,
    paddingVertical: 3,
    borderRadius: 999,
  },
  actionsRow: { flexDirection: "row", gap: space.md, marginTop: space.sm },
  footer: {
    padding: space.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
});
