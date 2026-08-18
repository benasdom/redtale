import React from "react";
import { View, ViewStyle } from "react-native";
import { colors } from "@src/theme/colors";
import { radius, shadow, space } from "@src/theme/typography";

interface Props {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  padded?: boolean;
  elevated?: boolean;
}

export function Card({ children, style, padded = true, elevated = false }: Props) {
  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: radius.md,
          borderWidth: 1,
          borderColor: colors.border,
        },
        padded ? { padding: space.md } : null,
        elevated ? shadow.card : null,
        style,
      ]}
    >
      {children}
    </View>
  );
}
