import React from "react";
import { View, ScrollView, StyleSheet, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@src/components/ThemedText";
import { Card } from "@src/components/Card";
import { RedtaleAvatar } from "@src/components/RedtaleMark";
import { colors } from "@src/theme/colors";
import { space } from "@src/theme/typography";
import { useAppDispatch, useAppSelector } from "@src/store/hooks";
import { signOutUser } from "@src/store/slices/authSlice";
import { resetChat } from "@src/store/slices/chatSlice";

export default function ProfileScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const user = useAppSelector((s) => s.auth.user);

  function handleSignOut() {
    Alert.alert("Sign out", "Are you sure you want to sign out of Redtail?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: () => {
          dispatch(resetChat());
          dispatch(signOutUser());
        },
      },
    ]);
  }

  const kycLabel =
    user?.kycStatus === "verified"
      ? "Verified"
      : user?.kycStatus === "pending"
        ? "Pending review"
        : "Not verified";

  const kycColor =
    user?.kycStatus === "verified" ? colors.success : user?.kycStatus === "pending" ? colors.warning : colors.textFaint;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: space.md, paddingBottom: space.xxl }}>
        <ThemedText variant="displayMd" style={{ marginBottom: space.md }}>
          Profile
        </ThemedText>

        <Card style={styles.profileCard}>
          <RedtaleAvatar size={56} />
          <View style={{ marginLeft: space.sm, flex: 1 }}>
            <ThemedText variant="title">{user?.fullName ?? "Guest"}</ThemedText>
            <ThemedText variant="caption" color={colors.textSecondary}>
              {user?.email}
            </ThemedText>
          </View>
        </Card>

        <SectionLabel label="Account" />
        <Card padded={false}>
          <MenuRow
            icon="shield-checkmark-outline"
            label="Identity verification"
            trailingLabel={kycLabel}
            trailingColor={kycColor}
            onPress={() =>
              Alert.alert(
                "Identity verification",
                "Verifying your identity helps us ship higher-value orders faster and protects your account. This will connect to KYC verification once the backend is live."
              )
            }
          />
          <Divider />
          <MenuRow
            icon="location-outline"
            label="Shipping addresses"
            onPress={() => router.push("/address")}
          />
          <Divider />
          <MenuRow
            icon="card-outline"
            label="Payment methods"
            onPress={() =>
              Alert.alert("Payment methods", "Manage saved cards here once Paystack tokenization is connected.")
            }
          />
        </Card>

        <SectionLabel label="Preferences" />
        <Card padded={false}>
          <MenuRow icon="notifications-outline" label="Notifications" onPress={() => {}} />
          <Divider />
          <MenuRow icon="lock-closed-outline" label="Privacy & data" onPress={() => {}} />
          <Divider />
          <MenuRow icon="help-circle-outline" label="Help & support" onPress={() => {}} />
        </Card>

        <Pressable onPress={handleSignOut} style={styles.signOutRow}>
          <Ionicons name="log-out-outline" size={18} color={colors.danger} />
          <ThemedText variant="bodyMedium" color={colors.danger} style={{ marginLeft: space.xs }}>
            Sign out
          </ThemedText>
        </Pressable>

        <ThemedText variant="micro" color={colors.textFaint} center style={{ marginTop: space.lg }}>
          REDTAIL · VERSION 1.0.0
        </ThemedText>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <ThemedText variant="micro" color={colors.textFaint} style={{ marginTop: space.lg, marginBottom: space.xs }}>
      {label.toUpperCase()}
    </ThemedText>
  );
}

function MenuRow({
  icon,
  label,
  trailingLabel,
  trailingColor,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  trailingLabel?: string;
  trailingColor?: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.menuRow}>
      <Ionicons name={icon} size={19} color={colors.textSecondary} />
      <ThemedText variant="body" style={{ flex: 1, marginLeft: space.sm }}>
        {label}
      </ThemedText>
      {trailingLabel && (
        <ThemedText variant="caption" color={trailingColor ?? colors.textFaint} style={{ marginRight: 6 }}>
          {trailingLabel}
        </ThemedText>
      )}
      <Ionicons name="chevron-forward" size={16} color={colors.textFaint} />
    </Pressable>
  );
}

function Divider() {
  return <View style={{ height: 1, backgroundColor: colors.border, marginLeft: space.md + 19 + space.sm }} />;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  profileCard: { flexDirection: "row", alignItems: "center" },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: space.md,
    paddingVertical: space.sm + 2,
  },
  signOutRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: space.lg,
    paddingVertical: space.sm,
  },
});
