import React, { useState, useRef, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { FaPaperPlane, FaMicrophone } from "react-icons/fa";
import { LuCopy } from "react-icons/lu";
import { motion, AnimatePresence } from "motion/react";
import { useDispatch, useSelector } from "react-redux";
import {
  addMessage,
  addChatFromServer,
  setChats,
  setMessages,
} from "../store/chatSlice";
import axios from "axios";
import { io } from "socket.io-client";

const Home = ({ theme, setTheme }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const dispatch = useDispatch();
  const { currentChatId, messagesByChatId, chats } = useSelector(
    (state) => state.chat
  );
  const messages = currentChatId ? messagesByChatId[currentChatId] || [] : [];
  const [input, setInput] = useState("");
  const [showWelcome, setShowWelcome] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newChatName, setNewChatName] = useState("");
  const chatEndRef = useRef(null);
  const [isListening, setIsListening] = useState(false);

  // socket io
  const [socket, setSocket] = useState(null);
  const loadedChatsRef = useRef(new Set());

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  const openCreateChatModal = () => setIsCreateModalOpen(true);
  const closeCreateChatModal = () => {
    setIsCreateModalOpen(false);
    setNewChatName("");
  };
  const handleCreateChat = async () => {
    const title = newChatName.trim();
    if (!title) return;
    try {
      const { data } = await axios.post(
        `https://syntra-conversational-ai-chatbot.onrender.com/api/chat`,
        { title },
        { withCredentials: true }
      );

      if (data?.chat?.id) {
        dispatch(
          addChatFromServer({
            id: data.chat.id,
            title: data.chat.title,
            createdAt: data.chat.lastActivity || Date.now(),
          })
        );
        toast.success("Chat created successfully!");
        closeCreateChatModal();
        if (showWelcome) setShowWelcome(false);
      }
    } catch (e) {
      if (e.response) {
        toast.error(
          "Failed to create chat: " +
            (e.response.data?.message || "Server error")
        );
        console.error("Create chat failed", e.response.status, e.response.data);
      } else {
        toast.error("Error creating chat: " + e.message);
        console.error("Error creating chat", e.message);
      }
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    if (messages.length === 0) {
      setShowWelcome(true);
    } else {
      setShowWelcome(false);
    }
  }, [messages]);

  // Fetch messages for a chat
  useEffect(() => {
    if (!currentChatId) return;

    const alreadyLoaded =
      loadedChatsRef.current.has(currentChatId) ||
      (messagesByChatId[currentChatId]?.length ?? 0) > 0;

    if (alreadyLoaded) return;

    axios
      .get(
        `https://syntra-conversational-ai-chatbot.onrender.com/api/message/${currentChatId}`,
        {
          withCredentials: true,
        }
      )
      .then(({ data }) => {
        if (Array.isArray(data?.messages)) {
          dispatch(
            setMessages({ chatId: currentChatId, messages: data.messages })
          );
          loadedChatsRef.current.add(currentChatId);
        }
      })
      .catch((e) => {
        toast.error("Failed fetching messages");
        console.error(
          "❌ Failed fetching messages:",
          currentChatId,
          e.response?.status,
          e.response?.data || e.message
        );
      });
  }, [currentChatId, dispatch, messagesByChatId]);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const { data } = await axios.get(
          "https://syntra-conversational-ai-chatbot.onrender.com/api/chat",
          {
            withCredentials: true,
          }
        );
        const serverChats = Array.isArray(data?.chats) ? data.chats : [];
        if (serverChats.length) {
          dispatch(
            setChats(
              serverChats.map((c) => ({
                id: c.id,
                title: c.title,
                createdAt: c.lastActivity || c.createdAt || Date.now(),
              }))
            )
          );
          if (showWelcome) setShowWelcome(false);
        } else {
          toast.info("No chats found. Create a new chat to start messaging.");
        }
      } catch (e) {
        if (e.response) {
          toast.error(
            "Failed to fetch chats: " +
              (e.response.data?.message || "Server error")
          );
          console.error(
            "Fetch chats failed",
            e.response.status,
            e.response.data
          );
        } else {
          toast.error("Error fetching chats: " + e.message);
          console.error("Error fetching chats", e.message);
        }
      }
    };
    fetchChats();

    const tempSocket = io(
      "https://syntra-conversational-ai-chatbot.onrender.com",
      { withCredentials: true }
    );

    tempSocket.on("ai-response", (messagePayload) => {
      if (messagePayload?.chat && messagePayload?.content) {
        dispatch(
          addMessage({
            chatId: messagePayload.chat,
            sender: "bot",
            text: messagePayload.content,
          })
        );
      }
    });

    setSocket(tempSocket);
    return () => {
      tempSocket.off("ai-response");
      tempSocket.disconnect();
    };
  }, [dispatch]);

  const handleVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Your browser does not support speech recognition.");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.start();
    setIsListening(true);

    if (isListening) {
      recognition.stop();
      setIsListening(false);
      return;
    }

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => (prev ? prev + " " + transcript : transcript));
      recognition.stop();
      setIsListening(false);
    };
  };

  const handleSend = () => {
    if (!input.trim()) {
      toast.info("Please enter a message before sending.");
      return;
    }
    if (!currentChatId) {
      toast.info("Create a new chat to start messaging.");
      openCreateChatModal();
      return;
    }

    if (showWelcome) setShowWelcome(false);

    dispatch(
      addMessage({
        chatId: currentChatId,
        sender: "user",
        text: input.trim(),
      })
    );
    setInput("");

    // socket emit
    if (socket) {
      socket.emit("ai-message", {
        chat: currentChatId,
        content: input.trim(),
      });
    }
    toast.success("Message sent!");
  };

  return (
    <div className="relative flex flex-col h-screen bg-white dark:bg-[#303030] transition-colors duration-500">
      {/* Navbar */}
      <Navbar toggleSidebar={toggleSidebar} theme={theme} setTheme={setTheme} />

      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={toggleSidebar}
              className="fixed inset-0 bg-black z-30"
            />
            {/* Sidebar Panel */}
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ duration: 0.3 }}
              className="fixed top-0 left-0 z-40"
            >
              <Sidebar
                toggleSidebar={toggleSidebar}
                openCreateChatModal={openCreateChatModal}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Chat Area */}
      <div className="message-section flex-1 relative overflow-y-auto p-6 space-y-4  ">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`flex ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div className="flex flex-col items-start space-y-1">
                <div
                  className={`px-4 py-2 rounded-2xl max-w-xs shadow-sm ${
                    msg.sender === "user"
                      ? "bg-[#004F99] dark:bg-indigo-500 text-white"
                      : "bg-[#9B9B9B] dark:bg-[#003F7A] text-gray-900 dark:text-white"
                  }`}
                >
                  {msg.text}
                </div>

                {/* Copy icon only for bot */}
                {msg.sender === "bot" && (
                  <button
                    onClick={() => navigator.clipboard.writeText(msg.text)}
                    className="p-1 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                    title="Copy"
                  >
                    <LuCopy className="text-gray-500 dark:text-gray-300" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={chatEndRef} />

        {/* Welcome overlay */}
        <AnimatePresence>
          {showWelcome && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="absolute inset-0 flex items-center justify-center bg-transparent"
            >
              <div className="text-center px-6">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                  className="text-6xl font-extrabold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent mb-6"
                >
                  Welcome
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="text-lg text-gray-600 dark:text-gray-400"
                >
                  Ask me anything, I’m here to help.
                </motion.p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Box */}
      <div className="sticky bottom-0 w-full p-4 backdrop-blur-md  border-gray-200 dark:border-[#424242] bg-transparent">
        <div className="relative max-w-3xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Send a message..."
            className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-300 dark:border-gray-600 
                       bg-gray-100 dark:bg-[#424242] text-gray-800 dark:text-white 
                       focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            disabled={!currentChatId}
          />
          <button
            onClick={handleVoiceInput}
            className={`absolute inset-y-0 right-10 flex items-center px-4 text-indigo-600 dark:text-indigo-400 
             ${isListening ? "text-red-600 dark:text-red-400" : ""}`}
          >
            <FaMicrophone size={20} />
          </button>
          <button
            onClick={handleSend}
            className="absolute inset-y-0 right-0 flex items-center px-4 text-indigo-600 dark:text-indigo-400 
                       hover:opacity-80 transition"
            disabled={!currentChatId}
          >
            <FaPaperPlane />
          </button>
        </div>
        {!currentChatId && (
          <p className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
            Create a new chat to start messaging.
          </p>
        )}
      </div>

      {/* Create Chat Modal  */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          {/* Light backdrop without making full screen black */}
          <div
            className="absolute inset-0 backdrop-blur-sm"
            onClick={closeCreateChatModal}
          />
          <div className="relative pointer-events-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-2xl rounded-xl w-full max-w-sm mx-4 p-6 animate-[fadeIn_.25s_ease]">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Create New Chat
            </h2>
            <input
              type="text"
              autoFocus
              value={newChatName}
              onChange={(e) => setNewChatName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateChat()}
              placeholder="Chat title..."
              className="w-full mb-5 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={closeCreateChatModal}
                className="px-4 py-2 text-sm rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                disabled={!newChatName.trim()}
                onClick={handleCreateChat}
                className="px-4 py-2 text-sm rounded-md bg-indigo-600 disabled:bg-indigo-400 dark:disabled:bg-indigo-800 text-white hover:bg-indigo-500 transition"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
