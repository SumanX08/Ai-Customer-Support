import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Send, History, LogOut, Loader2 } from "lucide-react";
import axios from "axios";

const ChatPage = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const API = import.meta.env.VITE_API_URL;

 

  console.log(user.id);
  

  const [messages, setMessages] = useState([
    {
      id: "1",
      text: "Hi! I'm your AI support assistant. How can I help you today?",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [chatId, setChatId] = useState(null); // to keep same chat on backend

  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const text = inputValue.trim();

    const userMessage = {
      id: Date.now().toString(),
      text,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      const res = await axios.post(
        `${API}/api/chat`,
        {
          message: text,
          userId:user.id,
          chatId // backend can choose to use or ignore this
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // if backend returns chatId, store it
      if (res.data.chatId && !chatId) {
        setChatId(res.data.chatId);
      }

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        text: res.data.answer || "Sorry, I couldn't generate a response.",
        sender: "ai",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error("Chat API error:", err);
      if(err.status===429){
        setMessages((prev) => [
          ...prev,
          { id: (Date.now() + 2).toString(),
        text: "Too many requests please try again later.",
        sender: "ai",
        timestamp: new Date()}
      ])
      
        
      } 

      const errorMessage = {
        id: (Date.now() + 2).toString(),
        text: "Sorry, something went wrong while contacting the AI.",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const onLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full bg-white rounded-2xl p-8 flex flex-col h-[80vh] max-w-4xl">
        {/* Header */}
        <header className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-blue-500 mb-1">
              AI Support
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {user?.role === "admin" && (
              <button>
                <a
                  href="/dashboard"
                  className="p-2 rounded-lg transition-colors text-sm font-medium text-white bg-green-500"
                >
                  Dashboard
                </a>
              </button>
            )}

            <button
              onClick={() => setShowHistory(!showHistory)}
              className="p-2 rounded-lg transition-colors"
              title="Conversation History"
            >
              <History className="w-5 h-5 text-gray-700" />
            </button>

            <button
              onClick={onLogout}
              className="p-2 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 rounded-xl p-4 mb-4 overflow-y-auto bg-gray-50">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              } mb-3`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                  message.sender === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-900 border border-gray-200"
                }`}
              >
                <p className="whitespace-pre-wrap">{message.text}</p>
                <span
                  className={`block mt-1 text-[11px] ${
                    message.sender === "user"
                      ? "text-blue-100"
                      : "text-gray-500"
                  }`}
                >
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))}

          {/* AI Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start mb-3">
              <div className="bg-white border border-gray-200 rounded-2xl px-4 py-2 flex items-center gap-2 text-sm">
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                <span className="text-gray-600">AI is typing...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your message..."
                rows={1}
                className="w-full rounded-lg bg-white border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isTyping}
              className="p-2.5 rounded-lg bg-blue-500 transition text-sm font-medium text-white disabled:opacity-60"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* History Panel */}
        {showHistory && (
          <div className="fixed right-0 top-0 h-full w-80 bg-white border-l border-gray-200 shadow-2xl z-50 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-black">Chat History</h2>
              <button
                onClick={() => setShowHistory(false)}
                className="text-black text-3xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-3">
              {[
                "Today - Support Question",
                "Yesterday - Account Issue",
                "Nov 24 - Billing Query",
              ].map((item, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg border border-gray-200 cursor-pointer transition"
                >
                  <p className="text-gray-900">{item}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
