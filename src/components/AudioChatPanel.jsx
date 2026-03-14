import React, { useEffect, useRef, useState } from "react";
import { AUDIO_CHAT } from "../data/appData";
import { useWebRTC } from "../hooks/useWebRTC";

const AudioChatPanel = ({ socket, roomId, isInitiator, localStream, stranger, distance }) => {
  const [isMuted, setIsMuted] = useState(false);
  const remoteAudioRef = useRef(null);

  const { remoteStream, connectionState } = useWebRTC({
    socket, roomId, isInitiator, mode: "audio", localStream,
  });

  // Play remote audio
  useEffect(() => {
    if (remoteAudioRef.current && remoteStream) {
      remoteAudioRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const toggleMute = () => {
    if (!localStream) return;
    const newMuted = !isMuted;
    localStream.getAudioTracks().forEach((t) => (t.enabled = !newMuted));
    setIsMuted(newMuted);
  };

  const avatarLabel = stranger.split(" ")[1] || "?";
  const isConnected = connectionState === "connected";

  return (
    <div className="text-center py-8 bg-white dark:bg-gray-800/40 rounded-3xl shadow-inner">
      {/* Hidden audio element for remote stream */}
      <audio ref={remoteAudioRef} autoPlay playsInline />

      {/* Connection status */}
      <div className={`inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full mb-4 ${
        isConnected
          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
          : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
      }`}>
        <span className={`w-2 h-2 rounded-full inline-block ${isConnected ? "bg-green-500" : "bg-yellow-400 animate-pulse"}`}></span>
        {isConnected ? "Audio connected" : connectionState === "new" ? "Connecting audio…" : connectionState}
      </div>

      {/* Avatar */}
      <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold mb-4 shadow-xl select-none">
        {avatarLabel}
      </div>

      <div className="text-2xl font-medium">{stranger}</div>
      <div className="text-sm text-gray-400 mb-6">
        <i className="fa-regular fa-location-dot mr-1"></i>{distance}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mt-4">
        <button
          onClick={toggleMute}
          className={`p-4 rounded-full text-xl shadow-md hover:scale-105 transition active:scale-95 ${
            isMuted
              ? "bg-red-500 text-white"
              : "bg-indigo-100 dark:bg-gray-700 text-indigo-700 dark:text-indigo-300"
          }`}
        >
          <i className={isMuted ? AUDIO_CHAT.micSlashIcon : AUDIO_CHAT.micIcon}></i>
        </button>
        <span className="text-sm text-gray-500">{isMuted ? "microphone • muted" : AUDIO_CHAT.micActiveLabel}</span>
      </div>

      <div className="mt-8 text-xs text-gray-400 flex justify-center gap-6">
        <span><i className={`${AUDIO_CHAT.micReadyIcon} text-green-500 mr-1`}></i>{AUDIO_CHAT.micReadyLabel}</span>
        <span><i className={`${AUDIO_CHAT.echoIcon} mr-1`}></i>{AUDIO_CHAT.echoLabel}</span>
      </div>
    </div>
  );
};

export default AudioChatPanel;
