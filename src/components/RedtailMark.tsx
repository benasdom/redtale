import React from "react";
import { View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "@src/theme/colors";

/**
 * The Redtail signature mark. We lean on @expo/vector-icons (already a
 * dependency) rather than pulling in react-native-svg, which isn't part of
 * the approved package set. A hawk glyph inside a soft tail-red tint reads
 * clearly at avatar size and doubles as the wordmark accent + agent avatar.
 */
export function RedtailMark({ size = 22, color = colors.accent }: { size?: number; color?: string }) {
  return <MaterialCommunityIcons name="bird" size={size} color={color} />;
}

export function RedtailAvatar({ size = 36 }: { size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: colors.accentSoft,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <RedtailMark size={size * 0.55} color={colors.accent} />
    </View>
  );
}
