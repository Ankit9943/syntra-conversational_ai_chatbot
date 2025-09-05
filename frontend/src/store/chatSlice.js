import { createSlice, nanoid } from "@reduxjs/toolkit";

// Structure:
// chats: [{ id, title, createdAt }]
// messagesByChatId: { [chatId]: [{ id, chatId, sender, text, createdAt }] }
// currentChatId: string|null

const initialState = {
  chats: [],
  currentChatId: null,
  messagesByChatId: {},
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    createChat: {
      reducer(state, action) {
        const { id, title, createdAt } = action.payload;
        state.chats.unshift({ id, title, createdAt });
        // initialize messages bucket
        if (!state.messagesByChatId[id]) state.messagesByChatId[id] = [];
        state.currentChatId = id;
      },
      prepare(title = "New Chat") {
        return { payload: { id: nanoid(), title, createdAt: Date.now() } };
      },
    },
    addChatFromServer(state, action) {
      const { id, title, createdAt } = action.payload;
      if (!state.chats.find((c) => c.id === id)) {
        state.chats.unshift({ id, title, createdAt });
      }
      if (!state.messagesByChatId[id]) state.messagesByChatId[id] = [];
      state.currentChatId = id;
    },
    renameChat(state, action) {
      const { id, title } = action.payload;
      const chat = state.chats.find((c) => c.id === id);
      if (chat) chat.title = title;
    },
    deleteChat(state, action) {
      const id = action.payload;
      state.chats = state.chats.filter((c) => c.id !== id);
      delete state.messagesByChatId[id];
      if (state.currentChatId === id) {
        state.currentChatId = state.chats.length ? state.chats[0].id : null;
      }
    },
    setCurrentChat(state, action) {
      state.currentChatId = action.payload;
    },
    addMessage: {
      reducer(state, action) {
        const { id, chatId, sender, text, createdAt } = action.payload;
        if (!state.messagesByChatId[chatId])
          state.messagesByChatId[chatId] = [];
        state.messagesByChatId[chatId].push({
          id,
          chatId,
          sender,
          text,
          createdAt,
        });
      },
      prepare({ chatId, sender, text }) {
        return {
          payload: {
            id: nanoid(),
            chatId,
            sender,
            text,
            createdAt: Date.now(),
          },
        };
      },
    },
    clearMessages(state, action) {
      const chatId = action.payload;
      if (state.messagesByChatId[chatId]) state.messagesByChatId[chatId] = [];
    },
    setChats(state, action) {
      const chats = action.payload || [];
      state.chats = [];
      chats.forEach((c) => {
        const { id, title, createdAt } = c;
        state.chats.push({ id, title, createdAt });
        if (!state.messagesByChatId[id]) state.messagesByChatId[id] = [];
      });
      if (!state.currentChatId && state.chats.length) {
        state.currentChatId = state.chats[0].id;
      }
    },
    setMessages(state, action) {
      const { chatId, messages } = action.payload;
      if (!chatId) return;
      if (!Array.isArray(messages)) return;
      state.messagesByChatId[chatId] = messages.map((m) => ({
        id: m.id || m._id || m.id || nanoid(),
        chatId,
        sender:
          m.sender || m.role === "model"
            ? "bot"
            : m.role === "user"
            ? "user"
            : m.role || m.sender || "user",
        text: m.text || m.content || "",
        createdAt: m.createdAt ? new Date(m.createdAt).getTime() : Date.now(),
      }));
    },
  },
});

export const {
  createChat,
  addChatFromServer,
  renameChat,
  deleteChat,
  setCurrentChat,
  addMessage,
  clearMessages,
  setChats,
  setMessages,
} = chatSlice.actions;
export default chatSlice.reducer;
