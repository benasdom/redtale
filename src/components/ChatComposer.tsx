import React, { useState } from "react";
import { View, TextInput, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@src/theme/colors";
import { radius, space, type } from "@src/theme/typography";

interface Props {
  onSend: (text: string) => void;
  onCancel?: () => void;
  disabled?: boolean; // true while a request is in flight
  placeholder?: string;
}

export function ChatComposer({ onSend, onCancel, disabled, placeholder }: Props) {
  const [text, setText] = useState("");

  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
  }

  return (
    <View style={styles.wrap}>
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder={placeholder ?? "Tell your agent what to buy…"}
        placeholderTextColor={colors.textFaint}
        style={styles.input}
        multiline
        editable={!disabled}
        onSubmitEditing={handleSend}
        accessibilityLabel="Message your Redtale agent"
      />

      {disabled && onCancel ? (
        <Pressable
          onPress={onCancel}
          accessibilityRole="button"
          accessibilityLabel="Stop generating"
          style={({ pressed }) => [styles.sendBtn, styles.stopBtn, { opacity: pressed ? 0.8 : 1 }]}
        >
          <Ionicons name="stop" size={16} color={colors.textOnAccent} />
        </Pressable>
      ) : (
        <Pressable
          onPress={handleSend}
          disabled={!text.trim() || disabled}
          accessibilityRole="button"
          accessibilityLabel="Send message"
          style={({ pressed }) => [
            styles.sendBtn,
            { opacity: !text.trim() || disabled ? 0.4 : pressed ? 0.8 : 1 },
          ]}
        >
          <Ionicons name="arrow-up" size={19} color={colors.textOnAccent} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    ...type.body,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: space.sm,
    paddingVertical: 10,
    maxHeight: 120,
    marginRight: space.xs,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  stopBtn: {
    backgroundColor: colors.textPrimary,
  },
});