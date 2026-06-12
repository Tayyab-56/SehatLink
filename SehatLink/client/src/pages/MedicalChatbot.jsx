import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import {
  Send,
  Bot,
  User,
  Loader,
  BrainCircuit,
  ArrowLeft,
  Sparkles,
  Heart,
  Activity,
  Shield,
  Clock,
  MessageCircle,
  Menu,
  X,
  Trash2,
  Plus,
  History,
} from "lucide-react";
import toast from "react-hot-toast";

const MedicalChatbot = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversations = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = userData?.id;

      const response = await axios.get(
        "http://localhost:5000/api/chatbot/conversations",
        {
          params: { userId: userId }, // Send userId as query param
          headers: { "x-user-id": userId },
        },
      );
      if (response.data.success) {
        setConversations(response.data.conversations);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  };

  const loadConversation = async (convId) => {
    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = userData?.id;

      const response = await axios.get(
        `http://localhost:5000/api/chatbot/conversation/${convId}`,
        {
          params: { userId: userId },
          headers: { "x-user-id": userId },
        },
      );
      if (response.data.success) {
        setMessages(response.data.conversation.messages);
        setConversationId(convId);
        setSidebarOpen(false);
      }
    } catch (error) {
      toast.error("Failed to load conversation");
    }
  };

  const deleteConversation = async (convId) => {
    if (window.confirm("Delete this conversation?")) {
      try {
        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        const userId = userData?.id;

        await axios.delete(
          `http://localhost:5000/api/chatbot/conversation/${convId}`,
          {
            data: { userId: userId },
            headers: { "x-user-id": userId },
          },
        );
        if (conversationId === convId) {
          setMessages([]);
          setConversationId(null);
        }
        fetchConversations();
        toast.success("Conversation deleted");
      } catch (error) {
        toast.error("Failed to delete");
      }
    }
  };

  const newConversation = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = userData?.id;

      const response = await axios.post(
        "http://localhost:5000/api/chatbot/new-conversation",
        {
          userId: userId,
        },
        {
          headers: { "x-user-id": userId },
        },
      );
      if (response.data.success) {
        setMessages([]);
        setConversationId(response.data.conversationId);
        fetchConversations();
        setSidebarOpen(false);
      }
    } catch (error) {
      setMessages([]);
      setConversationId(null);
      setSidebarOpen(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input;
    setInput("");
    setMessages((prev) => [
      ...prev,
      { role: "user", content: userMessage, timestamp: new Date() },
    ]);
    setLoading(true);
    setIsTyping(true);

    try {
      // Get user from localStorage
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = userData?.id;

      console.log("Sending message with userId:", userId);

      const response = await axios.post(
        "http://localhost:5000/api/chatbot/message",
        {
          message: userMessage,
          conversationId: conversationId,
          userId: userId, // ← This is key - send userId in body
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-user-id": userId, // ← Also send as header
          },
        },
      );

      if (response.data.success) {
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: response.data.response,
            matchingDiseases: response.data.matchingDiseases,
            timestamp: new Date(),
          },
        ]);
        if (!conversationId && response.data.conversationId) {
          setConversationId(response.data.conversationId);
          fetchConversations();
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Failed to get response");
      setIsTyping(false);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const suggestedSymptoms = [
    "Fever and cough",
    "Severe headache",
    "Chest pain",
    "Fatigue and weakness",
    "Shortness of breath",
    "Nausea and vomiting",
  ];

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg flex-shrink-0">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition"
            >
              <Menu size={20} />
            </button>

            <button
              onClick={() => navigate("/dashboard")}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition"
            >
              <ArrowLeft size={20} />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <BrainCircuit size={18} className="text-white" />
              </div>
              <div>
                <h1 className="text-white font-semibold text-sm flex items-center gap-1">
                  AI Medical Assistant
                  <Sparkles size={12} className="text-yellow-300" />
                </h1>
                <p className="text-blue-100 text-xs">
                  Powered by Medical Knowledge Graph
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={newConversation}
            className="text-white hover:bg-white/20 rounded-lg p-2 transition"
            title="New Conversation"
          >
            <Plus size={20} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar */}
        <div
          className={`absolute md:relative z-30 w-80 bg-white shadow-xl h-full transition-transform duration-300 flex flex-col ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
        >
          <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50 flex-shrink-0">
            <div className="flex items-center gap-2">
              <History size={18} className="text-blue-600" />
              <h2 className="font-semibold text-gray-800">Conversations</h2>
            </div>
            <p className="text-xs text-gray-500 mt-1">Your chat history</p>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {conversations.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <MessageCircle size={40} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No conversations yet</p>
                <p className="text-xs mt-1">Start a new chat</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.conversationId}
                  className={`relative p-3 rounded-xl cursor-pointer transition-all ${
                    conversationId === conv.conversationId
                      ? "bg-blue-50 border-l-4 border-blue-600"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => loadConversation(conv.conversationId)}
                >
                  <div className="pr-8">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {conv.title || "New Conversation"}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock size={10} className="text-gray-400" />
                      <p className="text-xs text-gray-400">
                        {new Date(conv.lastUpdated).toLocaleDateString()}
                      </p>
                      <span className="text-xs text-gray-300">•</span>
                      <p className="text-xs text-gray-400">
                        {conv.messageCount} messages
                      </p>
                    </div>
                    {conv.summary?.symptoms?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {conv.summary.symptoms.slice(0, 2).map((s, i) => (
                          <span
                            key={i}
                            className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Delete Button - Always visible */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(conv.conversationId);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                    title="Delete conversation"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg mb-4">
                  <BrainCircuit size={40} className="text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  Welcome, {user?.name}! 👋
                </h2>
                <p className="text-gray-500 mb-6 max-w-md text-sm">
                  Describe your symptoms and I'll help identify possible
                  conditions.
                </p>
                <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                  {suggestedSymptoms.map((symptom, index) => (
                    <button
                      key={index}
                      onClick={() => setInput(symptom)}
                      className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:bg-gray-50 hover:border-blue-300 transition"
                    >
                      {symptom}
                    </button>
                  ))}
                </div>
                <div className="mt-8 flex items-center gap-2 text-xs text-gray-400">
                  <Shield size={12} />
                  <span>AI assistant for informational purposes only</span>
                </div>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex gap-2 max-w-[75%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        msg.role === "user" ? "bg-blue-600" : "bg-gray-300"
                      }`}
                    >
                      {msg.role === "user" ? (
                        <User size={14} className="text-white" />
                      ) : (
                        <Bot size={14} className="text-gray-600" />
                      )}
                    </div>
                    <div>
                      <div
                        className={`rounded-2xl px-4 py-2 ${
                          msg.role === "user"
                            ? "bg-blue-600 text-white"
                            : "bg-white border border-gray-200 text-gray-800"
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatTime(msg.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}

            {isTyping && (
              <div className="flex justify-start">
                <div className="flex gap-2">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <Bot size={14} className="text-gray-600" />
                  </div>
                  <div className="bg-white rounded-2xl px-4 py-2 shadow-sm">
                    <div className="flex gap-1">
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t bg-white p-4 flex-shrink-0">
            <div className="flex gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Describe your symptoms..."
                className="flex-1 resize-none border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                rows="1"
                style={{ minHeight: "42px", maxHeight: "100px" }}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="bg-blue-600 text-white px-5 py-2 rounded-xl hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <Loader size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </div>
            <div className="flex items-center justify-center gap-2 mt-2 text-xs text-gray-400">
              <Shield size={10} />
              <span>
                AI assistant - Not a doctor. Consult a professional for medical
                advice.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile overlay when sidebar is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default MedicalChatbot;
