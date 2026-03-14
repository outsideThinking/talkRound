import React, { useState, useEffect, useCallback } from "react";
import StrangerBar from "./StrangerBar";
import SafetyRow from "./SafetyRow";
import TextChatPanel from "./TextChatPanel";
import AudioChatPanel from "./AudioChatPanel";
import VideoChatPanel from "./VideoChatPanel";
import { useSocket } from "../hooks/useSocket";
import { useMediaStream } from "../hooks/useMediaStream";
import {
  SAFETY,
  randomDistance,
  LOCATION_PROMPT,
  STRANGER_LIST,
} from "../data/appData";

function randomStranger() {
  return STRANGER_LIST[Math.floor(Math.random() * STRANGER_LIST.length)];
}

const ChatView = ({ chatMode, onEnd }) => {
  const { socket, connected } = useSocket();
  const { localStream, mediaError } = useMediaStream(chatMode);

  const [status, setStatus]           = useState("waiting"); // waiting | matched | disconnected
  const [waitingMsg, setWaitingMsg]   = useState("Finding someone nearby...");
  const [roomId, setRoomId]           = useState(null);
  const [isInitiator, setIsInitiator] = useState(false);

  // UI display state (for StrangerBar)
  const [stranger, setStranger]               = useState(randomStranger());
  const [distance, setDistance]               = useState(randomDistance());
  const [locationSource, setLocationSource]   = useState(LOCATION_PROMPT.nearbySource);

  // ── Find match on mount ─────────────────────────────────────
  useEffect(() => {
    if (!socket || !connected) return;
    socket.emit("find_match", { mode: chatMode });

    const handleWaiting = ({ message }) => {
      setStatus("waiting");
      setWaitingMsg(message);
    };

    const handleMatched = ({ roomId: rid, initiator }) => {
      setRoomId(rid);
      setIsInitiator(initiator);
      setStatus("matched");
      setStranger(randomStranger());
      setDistance(randomDistance());
      setLocationSource(Math.random() > 0.3 ? LOCATION_PROMPT.nearbySource : LOCATION_PROMPT.globalSource);
    };

    const handlePartnerDisconnected = () => {
      setStatus("waiting");
      setWaitingMsg("Partner left. Finding someone new...");
      setRoomId(null);
    };

    socket.on("waiting",              handleWaiting);
    socket.on("matched",              handleMatched);
    socket.on("partner_disconnected", handlePartnerDisconnected);

    return () => {
      socket.off("waiting",              handleWaiting);
      socket.off("matched",              handleMatched);
      socket.off("partner_disconnected", handlePartnerDisconnected);
    };
  }, [socket, connected, chatMode]);

  const handleNext = useCallback(() => {
    if (!socket) return;
    setStatus("waiting");
    setWaitingMsg("Finding someone new...");
    setRoomId(null);
    socket.emit("next");
  }, [socket]);

  const handleEnd = useCallback(() => {
    if (socket) socket.emit("end_chat");
    // Stop media
    if (localStream) localStream.getTracks().forEach((t) => t.stop());
    onEnd();
  }, [socket, localStream, onEnd]);

  const handleReport = () => alert(SAFETY.reportConfirmMsg);

  const handleBlock = () => {
    alert(`${stranger} blocked for this session.`);
    handleNext();
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Stranger bar */}
      <StrangerBar
        stranger={stranger}
        distance={distance}
        locationSource={locationSource}
        onNext={handleNext}
        onEnd={handleEnd}
      />

      {/* Safety row */}
      <SafetyRow
        isConnected={status === "matched"}
        onReport={handleReport}
        onBlock={handleBlock}
      />

      {/* Waiting overlay */}
      {status === "waiting" && (
        <div className="bg-white dark:bg-gray-800/60 rounded-2xl p-12 text-center shadow-inner space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
            <i className="fa-solid fa-spinner fa-spin text-2xl text-indigo-500"></i>
          </div>
          <p className="text-gray-600 dark:text-gray-300 font-medium">{waitingMsg}</p>
          <p className="text-xs text-gray-400">
            {connected ? "🟢 Server connected" : "🔴 Connecting to server..."}
          </p>
          {!connected && (
            <p className="text-xs text-red-400">
              Make sure the signaling server is running:<br />
              <code className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-xs">cd server && npm install && npm run dev</code>
            </p>
          )}
        </div>
      )}

      {/* Chat panels — shown when matched */}
      {status === "matched" && (
        <>
          {chatMode === "text" && (
            <TextChatPanel socket={socket} roomId={roomId} />
          )}
          {chatMode === "audio" && (
            <AudioChatPanel
              socket={socket}
              roomId={roomId}
              isInitiator={isInitiator}
              localStream={localStream}
              stranger={stranger}
              distance={distance}
            />
          )}
          {chatMode === "video" && (
            <VideoChatPanel
              socket={socket}
              roomId={roomId}
              isInitiator={isInitiator}
              localStream={localStream}
              mediaError={mediaError}
              stranger={stranger}
            />
          )}
        </>
      )}
    </div>
  );
};

export default ChatView;
