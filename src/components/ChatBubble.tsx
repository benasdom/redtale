import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
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
}

export function ChatBubble({ message, onSelectOffer }: Props) {
  const isUser = message.role === "user";

  if (message.kind === "typing") {
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
              <ProductOfferCard
                key={offer.id}
                offer={offer}
                compact
                onSelect={(o) => onSelectOffer?.(o)}
              />
            ))}
          </ScrollView>
        )}

        <ThemedText
          variant="micro"
          color={colors.textFaint}
          style={{ marginTop: 4, alignSelf: isUser ? "flex-end" : "flex-start" }}
        >
          {formatRelativeTime(message.createdAt)}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: space.sm,
    paddingHorizontal: space.md,
  },
  bubble: {
    paddingHorizontal: space.sm,
    paddingVertical: 10,
    borderRadius: radius.lg,
  },
  agentBubble: {
    backgroundColor: colors.bubbleAgent,
    borderBottomLeftRadius: 6,
  },
  userBubble: {
    backgroundColor: colors.bubbleUser,
    borderBottomRightRadius: 6,
  },
});
