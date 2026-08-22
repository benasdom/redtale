import React from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import * as Clipboard from "expo-clipboard";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "./ThemedText";
import { RedtaleAvatar } from "./RedtaleMark";
import { ProductOfferCard } from "./ProductOfferCard";
import { colors } from "@src/theme/colors";
import { radius, space } from "@src/theme/typography";
import { ChatMessage, ProductOffer } from "@src/types";
import { formatRelativeTime } from "@src/utils/format";

interface Props {
  message: ChatMessage;
  onSelectOffer?: (offer: ProductOffer) => void;
  onRetry?: (message: ChatMessage) => void;
}

export function ChatBubble({ message, onSelectOffer, onRetry }: Props) {
  const isUser = message.role === "user";
  const isPendingEmpty = message.status === "pending" && !message.text;

  async function handleCopy() {
    if (!message.text) return;
    await Clipboard.setStringAsync(message.text);
  }

  if (isPendingEmpty) {
    return (
      <View style={[styles.row, { justifyContent: "flex-start" }]}>
        <RedtaleAvatar size={30} />
        <View style={[styles.bubble, styles.agentBubble, { marginLeft: space.xs }]}>
          <ThemedText color={colors.textFaint}>Typing…</ThemedText>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.row, { justifyContent: isUser ? "flex-end" : "flex-start" }]}>
      {!isUser && <RedtaleAvatar size={30} />}
      <View style={{ maxWidth: "82%", marginLeft: isUser ? 0 : space.xs, marginRight: isUser ? 0 : 0 }}>
        {message.text && (
          <View style={[styles.bubble, isUser ? styles.userBubble : styles.agentBubble]}>
            <ThemedText color={isUser ? colors.bubbleUserText : colors.textPrimary}>
              {message.text}
            </ThemedText>
          </View>
        )}

        {message.kind === "offer_carousel" && message.offers && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginTop: space.xs }}
            contentContainerStyle={{ paddingRight: space.md }}
          >
            {message.offers.map((offer) => (
              <ProductOfferCard key={offer.id} offer={offer} compact onSelect={(o) => onSelectOffer?.(o)} />
            ))}
          </ScrollView>
        )}

        <View style={[styles.metaRow, { alignSelf: isUser ? "flex-end" : "flex-start" }]}>
          <ThemedText variant="micro" color={colors.textFaint}>
            {formatRelativeTime(message.createdAt)}
          </ThemedText>

          {!!message.text && message.status !== "pending" && (
            <Pressable
              onPress={handleCopy}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Copy message"
              style={styles.metaBtn}
            >
              <Ionicons name="copy-outline" size={13} color={colors.textFaint} />
            </Pressable>
          )}

          {message.status === "error" && onRetry && (
            <Pressable
              onPress={() => onRetry(message)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Retry"
              style={styles.metaBtn}
            >
              <Ionicons name="refresh" size={13} color={colors.textFaint} />
              <ThemedText variant="micro" color={colors.textFaint} style={{ marginLeft: 3 }}>
                Retry
              </ThemedText>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-end", marginBottom: space.sm, paddingHorizontal: space.md },
  bubble: { paddingHorizontal: space.sm, paddingVertical: 10, borderRadius: radius.lg },
  agentBubble: { backgroundColor: colors.bubbleAgent, borderBottomLeftRadius: 6 },
  userBubble: { backgroundColor: colors.bubbleUser, borderBottomRightRadius: 6 },
  metaRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  metaBtn: { flexDirection: "row", alignItems: "center", marginLeft: 8 },
});