import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, ViewStyle } from "react-native";
import { ThemedText } from "./ThemedText";
import { colors } from "@src/theme/colors";
import { radius, space } from "@src/theme/typography";

interface Props {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export function PrimaryButton({
  label,
  onPress,
  variant = "primary",
  loading,
  disabled,
  fullWidth = true,
  icon,
  style,
}: Props) {
  const isDisabled = disabled || loading;

  const bg =
    variant === "primary"
      ? colors.accent
      : variant === "danger"
        ? colors.danger
        : variant === "secondary"
          ? colors.surface
          : "transparent";

  const textColor =
    variant === "primary" || variant === "danger" ? colors.textOnAccent : colors.textPrimary;

  const borderStyle =
    variant === "secondary"
      ? { borderWidth: 1, borderColor: colors.borderStrong }
      : variant === "ghost"
        ? { borderWidth: 0 }
        : {};

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      style={({ pressed }) => [
        styles.base,
        borderStyle,
        { backgroundColor: bg, opacity: isDisabled ? 0.55 : pressed ? 0.85 : 1 },
        fullWidth ? { alignSelf: "stretch" } : { alignSelf: "flex-start" },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <>
          {icon}
          <ThemedText variant="button" color={textColor} style={icon ? { marginLeft: space.xs } : undefined}>
            {label}
          </ThemedText>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: radius.pill,
    paddingHorizontal: space.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});
