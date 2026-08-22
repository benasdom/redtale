import React, { useEffect, useRef } from "react";
import { View, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ThemedText } from "@src/components/ThemedText";
import { ChatBubble } from "@src/components/ChatBubble";
import { ChatComposer } from "@src/components/ChatComposer";
import { RedtaleAvatar } from "@src/components/RedtaleMark";
import { colors } from "@src/theme/colors";
import { space } from "@src/theme/typography";
import { useAppDispatch, useAppSelector } from "@src/store/hooks";
import { initializeChat, pushUserMessage, sendUserMessage, removeMessage } from "@src/store/slices/chatSlice";
import { setBuyNowOffer } from "@src/store/slices/cartSlice";
import { ChatMessage, ProductOffer } from "@src/types";

export default function AgentChatScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { messages, isAgentTyping, initialized } = useAppSelector((s) => s.chat);
  const user = useAppSelector((s) => s.auth.user);
  const listRef = useRef<FlatList>(null);
  const activeRequestRef = useRef<{ abort: (reason?: string) => void } | null>(null);

  useEffect(() => {
    if (!initialized && user) {
      dispatch(initializeChat(user.fullName.split(" ")[0]));
    }
  }, [initialized, user, dispatch]);

  useEffect(() => {
    if (messages.length) {
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    }
  }, [messages.length, isAgentTyping]);

  function dispatchSend(text: string) {
    const promise = dispatch(sendUserMessage(text));
    activeRequestRef.current = promise;
    promise.finally(() => {
      if (activeRequestRef.current === promise) activeRequestRef.current = null;
    });
  }

  function handleSend(text: string) {
    dispatch(pushUserMessage(text));
    dispatchSend(text);
  }

  function handleCancel() {
    activeRequestRef.current?.abort();
  }

  function handleRetry(message: ChatMessage) {
    if (!message.retryText) return;
    dispatch(removeMessage(message.id));
    dispatchSend(message.retryText);
  }

  function handleSelectOffer(offer: ProductOffer) {
    dispatch(setBuyNowOffer(offer));
    router.push("/checkout");
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <RedtaleAvatar size={34} />
        <View style={{ marginLeft: space.sm }}>
          <ThemedText variant="title">Your Redtale agent</ThemedText>
          <View style={styles.liveRow}>
            <View style={styles.liveDot} />
            <ThemedText variant="caption" color={colors.textSecondary}>
              Online · sources real US retailers
            </ThemedText>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ChatBubble message={item} onSelectOffer={handleSelectOffer} onRetry={handleRetry} />
          )}
          contentContainerStyle={{ paddingVertical: space.md }}
          showsVerticalScrollIndicator={false}
        />
        <ChatComposer onSend={handleSend} onCancel={handleCancel} disabled={isAgentTyping} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  liveRow: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.success, marginRight: 5 },
});