import React from "react";
import { Text, TextProps, TextStyle } from "react-native";
import { colors } from "@src/theme/colors";
import { type } from "@src/theme/typography";

type Variant = keyof typeof type;

interface Props extends TextProps {
  variant?: Variant;
  color?: string;
  center?: boolean;
  style?: TextStyle | TextStyle[];
}

export function ThemedText({ variant = "body", color, center, style, ...rest }: Props) {
  return (
    <Text
      {...rest}
      style={[
        type[variant] as TextStyle,
        { color: color ?? colors.textPrimary },
        center ? { textAlign: "center" } : null,
        style,
      ]}
    />
  );
}
