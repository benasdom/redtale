import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ChatMessage, ProductOffer } from "@src/types";
import * as chatService from "@src/services/chatService";
import { generateId } from "@src/utils/id";

interface ChatState {
  messages: ChatMessage[];
  isAgentTyping: boolean;
  initialized: boolean;
  streamingMessageId: string | null;
}

interface SendUserMessageRejectValue {
  messageId: string;
  message: string;
  retryText: string;
}

const initialState: ChatState = {
  messages: [],
  isAgentTyping: false,
  initialized: false,
  streamingMessageId: null,
};

export const initializeChat = createAsyncThunk("chat/init", async (firstName: string) => {
  return chatService.buildWelcomeMessage(firstName);
});

export const sendUserMessage = createAsyncThunk<void, string, { rejectValue: SendUserMessageRejectValue }>(
  "chat/sendUserMessage",
  async (text, thunkAPI) => {
    const { getState, dispatch, signal, requestId, rejectWithValue } = thunkAPI;
    const state = getState() as { chat: ChatState; auth: { user: { id: string } | null; token?: string | null } };
    const threadId = state.auth.user?.id ?? "default";
    const agentMessageId = `agent_${requestId}`;

    dispatch(chatStreamStarted({ agentMessageId }));

    try {
      await chatService.sendMessageToAgentStream(threadId, state.chat.messages, text, state.auth.token, {
        signal,
        onEvent: (evt) => {
          if (evt.type === "offers" && evt.offers) {
            dispatch(chatOffersReceived({ messageId: agentMessageId, offers: evt.offers }));
          } else if (evt.type === "chunk" && evt.textDelta) {
            dispatch(chatChunkReceived({ messageId: agentMessageId, textDelta: evt.textDelta }));
          } else if (evt.type === "done") {
            dispatch(
              chatStreamDone({
                messageId: agentMessageId,
                finalId: evt.message?.id,
                createdAt: evt.message?.createdAt,
              })
            );
          }
          // "error" events surface via the thrown/rejected promise below, not here.
        },
      });
    } catch (err: any) {
      if (err?.name === "AbortError") {
        dispatch(chatStreamCancelled({ messageId: agentMessageId }));
        return; // cancellation is a normal outcome, not a failure
      }
      return rejectWithValue({
        messageId: agentMessageId,
        message: err?.message ?? "Something went wrong",
        retryText: text,
      });
    }
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    pushUserMessage(state, action: PayloadAction<string>) {
      state.messages.push({
        id: generateId("msg"),
        role: "user",
        kind: "text",
        text: action.payload,
        createdAt: new Date().toISOString(),
        status: "done",
      });
    },
    resetChat(state) {
      state.messages = [];
      state.initialized = false;
      state.isAgentTyping = false;
      state.streamingMessageId = null;
    },
    removeMessage(state, action: PayloadAction<string>) {
      state.messages = state.messages.filter((m) => m.id !== action.payload);
    },
    chatStreamStarted(state, action: PayloadAction<{ agentMessageId: string }>) {
      state.isAgentTyping = true;
      state.streamingMessageId = action.payload.agentMessageId;
      state.messages.push({
        id: action.payload.agentMessageId,
        role: "agent",
        kind: "text",
        text: "",
        createdAt: new Date().toISOString(),
        status: "pending",
      });
    },
    chatChunkReceived(state, action: PayloadAction<{ messageId: string; textDelta: string }>) {
      const msg = state.messages.find((m) => m.id === action.payload.messageId);
      if (!msg) return;
      msg.text = (msg.text ?? "") + action.payload.textDelta;
      msg.status = "streaming";
    },
    chatOffersReceived(state, action: PayloadAction<{ messageId: string; offers: ProductOffer[] }>) {
      const msg = state.messages.find((m) => m.id === action.payload.messageId);
      if (!msg) return;
      msg.offers = action.payload.offers;
      msg.kind = "offer_carousel";
    },
    chatStreamDone(state, action: PayloadAction<{ messageId: string; finalId?: string; createdAt?: string }>) {
      const msg = state.messages.find((m) => m.id === action.payload.messageId);
      if (msg) {
        msg.status = "done";
        if (action.payload.createdAt) msg.createdAt = action.payload.createdAt;
        if (action.payload.finalId) msg.id = action.payload.finalId;
      }
      state.isAgentTyping = false;
      state.streamingMessageId = null;
    },
    chatStreamCancelled(state, action: PayloadAction<{ messageId: string }>) {
      state.messages = state.messages.filter((m) => m.id !== action.payload.messageId);
      state.isAgentTyping = false;
      state.streamingMessageId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeChat.fulfilled, (state, action) => {
        if (!state.initialized) {
          state.messages.push(action.payload);
          state.initialized = true;
        }
      })
      .addCase(sendUserMessage.rejected, (state, action) => {
        state.isAgentTyping = false;
        state.streamingMessageId = null;
        const payload = action.payload;
        if (!payload) return;
        const msg = state.messages.find((m) => m.id === payload.messageId);
        if (msg) {
          msg.status = "error";
          msg.text = "Something went wrong. Tap retry to try again.";
          msg.retryText = payload.retryText;
        }
      });
  },
});

export const {
  pushUserMessage,
  resetChat,
  removeMessage,
  chatStreamStarted,
  chatChunkReceived,
  chatOffersReceived,
  chatStreamDone,
  chatStreamCancelled,
} = chatSlice.actions;
export default chatSlice.reducer;