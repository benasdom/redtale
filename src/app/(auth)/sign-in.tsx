import React from "react";
import { View, StyleSheet, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@src/components/ThemedText";
import { PrimaryButton } from "@src/components/PrimaryButton";
import { RedtailMark } from "@src/components/RedtailMark";
import { colors } from "@src/theme/colors";
import { space } from "@src/theme/typography";
import { useAppDispatch, useAppSelector } from "@src/store/hooks";
import { googleSignIn } from "@src/store/slices/authSlice";

export default function SignIn() {
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector((s) => s.auth);
  const loading = status === "loading";

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <View style={styles.brandBlock}>
          <View style={styles.markCircle}>
            <RedtailMark size={40} />
          </View>
          <ThemedText variant="displayLg" style={{ marginTop: space.md }}>
            Redtail
          </ThemedText>
          <ThemedText variant="body" color={colors.textSecondary} center style={{ marginTop: space.xs, maxWidth: 280 }}>
            Tell your agent what you want. It finds it, prices it, and gets it to your door.
          </ThemedText>
        </View>

        <View style={styles.featureList}>
          <Feature icon="chatbubbles-outline" text="Ask for anything in plain English" />
          <Feature icon="pricetags-outline" text="Real price comparisons across US retailers" />
          <Feature icon="navigate-outline" text="Live delivery tracking, 7 days after every order" />
        </View>

        <View style={{ width: "100%" }}>
          {error && (
            <ThemedText variant="caption" color={colors.danger} center style={{ marginBottom: space.sm }}>
              {error}
            </ThemedText>
          )}
          <PrimaryButton
            label={loading ? "Signing in…" : "Continue with Google"}
            onPress={() => dispatch(googleSignIn())}
            loading={loading}
            icon={<Ionicons name="logo-google" size={18} color={colors.textOnAccent} />}
          />
          <ThemedText variant="caption" color={colors.textFaint} center style={{ marginTop: space.md }}>
            By continuing you agree to Redtail's Terms of Service and Privacy Policy.
          </ThemedText>
        </View>
      </View>
    </SafeAreaView>
  );
}

function Feature({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.featureRow}>
      <View style={styles.featureIcon}>
        <Ionicons name={icon} size={16} color={colors.accent} />
      </View>
      <ThemedText variant="body" color={colors.textSecondary} style={{ flex: 1 }}>
        {text}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: {
    flex: 1,
    paddingHorizontal: space.lg,
    justifyContent: "space-between",
    paddingVertical: space.xl,
  },
  brandBlock: { alignItems: "center", marginTop: space.xl },
  markCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  featureList: { gap: space.md },
  featureRow: { flexDirection: "row", alignItems: "center", gap: space.sm },
  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
});
