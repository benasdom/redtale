import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ChatMessage } from "@src/types";
import * as chatService from "@src/services/chatService";
import { generateId } from "@src/utils/id";

interface ChatState {
  messages: ChatMessage[];
  isAgentTyping: boolean;
  initialized: boolean;
}

const initialState: ChatState = {
  messages: [],
  isAgentTyping: false,
  initialized: false,
};

export const initializeChat = createAsyncThunk("chat/init", async (firstName: string) => {
  return chatService.buildWelcomeMessage(firstName);
});

export const sendUserMessage = createAsyncThunk(
  "chat/sendUserMessage",
  async (text: string, { getState }) => {
    const state = getState() as { chat: ChatState };
    const replies = await chatService.sendMessageToAgent(state.chat.messages, text);
    return replies;
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
      });
    },
    resetChat(state) {
      state.messages = [];
      state.initialized = false;
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
      .addCase(sendUserMessage.pending, (state) => {
        state.isAgentTyping = true;
      })
      .addCase(sendUserMessage.fulfilled, (state, action) => {
        state.isAgentTyping = false;
        state.messages.push(...action.payload);
      })
      .addCase(sendUserMessage.rejected, (state) => {
        state.isAgentTyping = false;
        state.messages.push({
          id: generateId("msg"),
          role: "agent",
          kind: "text",
          text: "Sorry, I lost connection for a second. Could you say that again?",
          createdAt: new Date().toISOString(),
        });
      });
  },
});

export const { pushUserMessage, resetChat } = chatSlice.actions;
export default chatSlice.reducer;
