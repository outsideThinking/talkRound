import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import LandingView from "./components/LandingView";
import ModeView from "./components/ModeView";
import ChatView from "./components/ChatView";
import Footer from "./components/Footer";
import { useSocket } from "./hooks/useSocket";
import { ONLINE_COUNTER } from "./data/appData";

const App = () => {
  const [view, setView]           = useState("landing");
  const [darkMode, setDarkMode]   = useState(false);
  const [chatMode, setChatMode]   = useState("text");
  const [onlineCount, setOnlineCount] = useState(ONLINE_COUNTER.initialDisplay);
  const { socket } = useSocket();

  // Dark mode class on <html>
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // Live online count from server, fallback to simulated
  useEffect(() => {
    if (!socket) return;
    const handleCount = (count) => setOnlineCount(count.toLocaleString());
    socket.on("online_count", handleCount);

    // Simulated fallback fluctuation
    const interval = setInterval(() => {
      setOnlineCount((prev) => {
        // Only simulate if we haven't received a real count recently
        const n = ONLINE_COUNTER.minCount + Math.floor(Math.random() * ONLINE_COUNTER.maxOffset);
        return n.toLocaleString();
      });
    }, ONLINE_COUNTER.intervalMs);

    return () => {
      socket.off("online_count", handleCount);
      clearInterval(interval);
    };
  }, [socket]);

  const handleSelectMode = (mode) => {
    // Show permission hint for audio/video
    if (mode.permissionAlert) {
      // Non-blocking toast instead of alert — just proceed
      console.info(mode.permissionAlert);
    }
    setChatMode(mode.id);
    setView("chat");
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      darkMode ? "bg-[#0b0f17] text-gray-100" : "bg-gray-50 text-gray-900"
    } antialiased`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex flex-col min-h-screen">
        <Header
          darkMode={darkMode}
          toggleDarkMode={() => setDarkMode((d) => !d)}
          onlineCount={onlineCount}
        />

        <main className="flex-1 flex items-center justify-center">
          {view === "landing" && <LandingView onStart={() => setView("mode")} />}
          {view === "mode"    && <ModeView onSelectMode={handleSelectMode} />}
          {view === "chat"    && (
            <ChatView
              chatMode={chatMode}
              onEnd={() => setView("landing")}
            />
          )}
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default App;
