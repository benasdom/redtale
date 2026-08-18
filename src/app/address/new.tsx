import React, { useState } from "react";
import { View, ScrollView, StyleSheet, TextInput, Pressable, Switch, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@src/components/ThemedText";
import { PrimaryButton } from "@src/components/PrimaryButton";
import { colors } from "@src/theme/colors";
import { radius, space, type } from "@src/theme/typography";
import { useAppDispatch } from "@src/store/hooks";
import { addAddress } from "@src/store/slices/addressSlice";

export default function NewAddressScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [label, setLabel] = useState("Home");
  const [fullName, setFullName] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [phone, setPhone] = useState("");
  const [isDefault, setIsDefault] = useState(true);
  const [saving, setSaving] = useState(false);

  const canSave = fullName && line1 && city && state && zip && phone;

  async function handleSave() {
    if (!canSave) {
      Alert.alert("Missing details", "Please fill in all required fields before saving.");
      return;
    }
    setSaving(true);
    try {
      await dispatch(
        addAddress({
          label: label || "Address",
          fullName,
          line1,
          line2: line2 || undefined,
          city,
          state: state.toUpperCase(),
          zip,
          country: "United States",
          phone,
          isDefault,
        })
      );
      router.back();
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <ThemedText variant="title">Add address</ThemedText>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.closeBtn}>
          <Ionicons name="close" size={20} color={colors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: space.md, paddingBottom: space.xxl }}>
        <Field label="Label" value={label} onChangeText={setLabel} placeholder="Home, Office…" />
        <Field label="Full name" value={fullName} onChangeText={setFullName} placeholder="Recipient's full name" />
        <Field label="Address line 1" value={line1} onChangeText={setLine1} placeholder="Street address" />
        <Field label="Address line 2 (optional)" value={line2} onChangeText={setLine2} placeholder="Apt, suite, unit" />
        <View style={styles.rowFields}>
          <Field label="City" value={city} onChangeText={setCity} style={{ flex: 2, marginRight: space.xs }} />
          <Field label="State" value={state} onChangeText={setState} placeholder="TX" style={{ flex: 1 }} maxLength={2} autoCapitalize="characters" />
        </View>
        <View style={styles.rowFields}>
          <Field label="ZIP code" value={zip} onChangeText={setZip} keyboardType="number-pad" style={{ flex: 1, marginRight: space.xs }} />
          <Field label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="+1 (___) ___-____" style={{ flex: 2 }} />
        </View>

        <View style={styles.defaultRow}>
          <ThemedText variant="body">Set as default address</ThemedText>
          <Switch
            value={isDefault}
            onValueChange={setIsDefault}
            trackColor={{ true: colors.accent, false: colors.borderStrong }}
            thumbColor="#FFFFFF"
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton label="Save address" onPress={handleSave} loading={saving} disabled={!canSave} />
      </View>
    </SafeAreaView>
  );
}

function Field({
  label,
  style,
  ...rest
}: React.ComponentProps<typeof TextInput> & { label: string; style?: any }) {
  return (
    <View style={[{ marginBottom: space.sm }, style]}>
      <ThemedText variant="caption" color={colors.textSecondary} style={{ marginBottom: 6 }}>
        {label}
      </ThemedText>
      <TextInput
        {...rest}
        placeholderTextColor={colors.textFaint}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
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
  input: {
    ...type.body,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: space.sm,
    paddingVertical: 12,
  },
  rowFields: { flexDirection: "row" },
  defaultRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: space.sm,
    paddingVertical: space.sm,
  },
  footer: {
    padding: space.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
});
