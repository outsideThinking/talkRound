import React, { useEffect, useRef, useState } from "react";
import { TEXT_CHAT } from "../data/appData";

const TextChatPanel = ({ socket, roomId }) => {
  const [messages, setMessages] = useState([
    { from: "system", text: "Connected! Say hello 👋", time: now() },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping]     = useState(false);
  const containerRef  = useRef(null);
  const typingTimeout = useRef(null);

  function now() {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (!socket) return;
    const handleMessage = ({ text, time }) => {
      setMessages((prev) => [...prev, { from: "stranger", text, time }]);
    };
    const handleTypingStart = () => setIsTyping(true);
    const handleTypingStop  = () => setIsTyping(false);
    socket.on("chat_message", handleMessage);
    socket.on("typing_start",  handleTypingStart);
    socket.on("typing_stop",   handleTypingStop);
    return () => {
      socket.off("chat_message", handleMessage);
      socket.off("typing_start",  handleTypingStart);
      socket.off("typing_stop",   handleTypingStop);
    };
  }, [socket]);

  const sendMessage = () => {
    const text = inputValue.trim();
    if (!text || !socket || !roomId) return;
    const time = now();
    setMessages((prev) => [...prev, { from: "me", text, time }]);
    socket.emit("chat_message", { roomId, text, time });
    socket.emit("typing_stop", { roomId });
    setInputValue("");
    clearTimeout(typingTimeout.current);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") { sendMessage(); return; }
    if (socket && roomId) {
      socket.emit("typing_start", { roomId });
      clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => {
        socket.emit("typing_stop", { roomId });
      }, 1500);
    }
  };

  const handleEmoji = () => setInputValue((v) => v + " 😊 ");

  const handleImageShare = () => {
    const time = now();
    const text = "📸 Image shared (demo)";
    setMessages((prev) => [...prev, { from: "me", text, time }]);
    if (socket && roomId) socket.emit("chat_message", { roomId, text, time });
  };

  return (
    <div className="space-y-4">
      <div ref={containerRef} className="bg-white dark:bg-gray-800/70 rounded-2xl p-4 shadow-inner h-72 sm:h-80 overflow-y-auto flex flex-col gap-3">
        {messages.map((msg, idx) => {
          if (msg.from === "system") return (
            <div key={idx} className="text-center text-xs text-gray-400 italic py-1">{msg.text}</div>
          );
          return msg.from === "me" ? (
            <div key={idx} className="flex justify-end">
              <div className="bg-indigo-600 text-white p-3 rounded-2xl rounded-br-none max-w-[80%] break-words shadow-sm">
                {msg.text}
                <div className="text-right text-indigo-200 mt-1" style={{ fontSize: "10px" }}>{msg.time}</div>
              </div>
            </div>
          ) : (
            <div key={idx} className="flex justify-start">
              <div className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 p-3 rounded-2xl rounded-bl-none max-w-[80%] break-words shadow-sm">
                {msg.text}
                <div className="text-right text-gray-500 dark:text-gray-400 mt-1" style={{ fontSize: "10px" }}>{msg.time}</div>
              </div>
            </div>
          );
        })}
      </div>

      {isTyping && (
        <div className="text-sm text-gray-500 italic">
          <i className={`${TEXT_CHAT.typingIcon} mr-1`}></i>
          {TEXT_CHAT.typingText}
          <span className="typing-dot">.</span><span className="typing-dot">.</span><span className="typing-dot">.</span>
        </div>
      )}

      <div className="flex items-center gap-2 bg-white dark:bg-gray-800/90 p-2 rounded-2xl shadow-sm">
        <button onClick={handleEmoji} className="p-3 text-xl hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"><i className={TEXT_CHAT.emojiIcon}></i></button>
        <button onClick={handleImageShare} className="p-3 text-xl hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"><i className={TEXT_CHAT.imageIcon}></i></button>
        <input
          type="text" value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={TEXT_CHAT.inputPlaceholder}
          className="flex-1 bg-transparent border-0 focus:ring-0 outline-none p-3 text-base"
        />
        <button onClick={sendMessage} className="bg-indigo-600 text-white p-3 rounded-xl px-5 hover:bg-indigo-700 transition active:scale-95"><i className={TEXT_CHAT.sendIcon}></i></button>
      </div>
    </div>
  );
};

export default TextChatPanel;
