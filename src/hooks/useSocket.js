// ── useSocket.js ──────────────────────────────────────────────
// Singleton socket.io connection shared across the app

import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3001";

let globalSocket = null;

export function useSocket() {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!globalSocket) {
      globalSocket = io(SERVER_URL, {
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
      });
    }

    socketRef.current = globalSocket;

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    globalSocket.on("connect", onConnect);
    globalSocket.on("disconnect", onDisconnect);

    if (globalSocket.connected) setConnected(true);

    return () => {
      globalSocket.off("connect", onConnect);
      globalSocket.off("disconnect", onDisconnect);
    };
  }, []);

  return { socket: socketRef.current || globalSocket, connected };
}
