import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ChatMessage } from "@src/types";
import * as chatService from "@src/services/chatService";
import { generateId } from "@src/utils/id";

interface ChatState {
  messages: ChatMessage[];
  isAgentTyping: boolean;
  initialized: boolean;
  pendingMessageId: string | null;
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
  pendingMessageId: null,
};

export const initializeChat = createAsyncThunk("chat/init", async (firstName: string) => {
  return chatService.buildWelcomeMessage(firstName);
});

// Single request/response cycle: shows a "Typing…" placeholder immediately,
// awaits the agent's full reply, then swaps the placeholder for the real
// message(s) in one go. (Not streamed — the backend returns one complete
// JSON object per turn, not incremental chunks.)
export const sendUserMessage = createAsyncThunk<void, string, { rejectValue: SendUserMessageRejectValue }>(
  "chat/sendUserMessage",
  async (text, thunkAPI) => {
    const { getState, dispatch, signal, requestId, rejectWithValue } = thunkAPI;
    const state = getState() as { chat: ChatState; auth: { user: { id: string } | null; token?: string | null } };
    const threadId = state.auth.user?.id ?? "default";
    const pendingMessageId = `agent_${requestId}`;

    dispatch(chatRequestStarted({ pendingMessageId }));

    try {
      const agentMessages = await chatService.sendMessageToAgent(
        threadId,
        state.chat.messages,
        text,
        state.auth.token,
        signal
      );
      dispatch(chatResponseReceived({ pendingMessageId, agentMessages }));
    } catch (err: any) {
      if (err?.name === "AbortError") {
        dispatch(chatRequestCancelled({ pendingMessageId }));
        return; // cancellation is a normal outcome, not a failure
      }
      return rejectWithValue({
        messageId: pendingMessageId,
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
      state.pendingMessageId = null;
    },
    removeMessage(state, action: PayloadAction<string>) {
      state.messages = state.messages.filter((m) => m.id !== action.payload);
    },
    chatRequestStarted(state, action: PayloadAction<{ pendingMessageId: string }>) {
      state.isAgentTyping = true;
      state.pendingMessageId = action.payload.pendingMessageId;
      state.messages.push({
        id: action.payload.pendingMessageId,
        role: "agent",
        kind: "text",
        text: "",
        createdAt: new Date().toISOString(),
        status: "pending",
      });
    },
    chatResponseReceived(state, action: PayloadAction<{ pendingMessageId: string; agentMessages: ChatMessage[] }>) {
      state.messages = state.messages.filter((m) => m.id !== action.payload.pendingMessageId);
      state.messages.push(...action.payload.agentMessages.map((m) => ({ ...m, status: "done" as const })));
      state.isAgentTyping = false;
      state.pendingMessageId = null;
    },
    chatRequestCancelled(state, action: PayloadAction<{ pendingMessageId: string }>) {
      state.messages = state.messages.filter((m) => m.id !== action.payload.pendingMessageId);
      state.isAgentTyping = false;
      state.pendingMessageId = null;
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
        state.pendingMessageId = null;
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
  chatRequestStarted,
  chatResponseReceived,
  chatRequestCancelled,
} = chatSlice.actions;
export default chatSlice.reducer;