import React, { useEffect, useRef, useState } from "react";
import { VIDEO_CHAT } from "../data/appData";
import { useWebRTC } from "../hooks/useWebRTC";

const VideoChatPanel = ({ socket, roomId, isInitiator, localStream, mediaError, stranger }) => {
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMuted, setIsMuted]       = useState(false);

  const localVideoRef  = useRef(null);
  const remoteVideoRef = useRef(null);

  const { remoteStream, connectionState } = useWebRTC({
    socket, roomId, isInitiator, mode: "video", localStream,
  });

  // Attach local stream
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Attach remote stream
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const toggleCamera = () => {
    if (!localStream) return;
    const newState = !isCameraOn;
    localStream.getVideoTracks().forEach((t) => (t.enabled = newState));
    setIsCameraOn(newState);
  };

  const toggleMic = () => {
    if (!localStream) return;
    const newMuted = !isMuted;
    localStream.getAudioTracks().forEach((t) => (t.enabled = !newMuted));
    setIsMuted(newMuted);
  };

  const isConnected = connectionState === "connected";

  return (
    <div className="space-y-4">
      {/* Error banner */}
      {mediaError && (
        <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm px-4 py-3 rounded-xl flex items-start gap-2">
          <i className="fa-solid fa-circle-exclamation mt-0.5"></i>
          <span>{mediaError}</span>
        </div>
      )}

      {/* Connection banner */}
      {!mediaError && (
        <div className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-xl w-fit ${
          isConnected
            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
            : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
        }`}>
          <span className={`w-2 h-2 rounded-full inline-block ${isConnected ? "bg-green-500" : "bg-yellow-400 animate-pulse"}`}></span>
          {isConnected ? "Video connected" : "Connecting…"}
        </div>
      )}

      {/* Video grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Local (you) */}
        <div className="relative rounded-2xl overflow-hidden bg-gray-900 flex items-center justify-center" style={{ aspectRatio: "16/9" }}>
          <video
            ref={localVideoRef}
            autoPlay playsInline muted
            className={`w-full h-full object-cover transition-opacity duration-300 ${isCameraOn && !mediaError ? "opacity-100" : "opacity-0"}`}
          />
          {(!isCameraOn || mediaError) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 gap-2">
              <i className="fa-solid fa-video-slash text-4xl opacity-40"></i>
              <span className="text-xs text-gray-400">{mediaError ? "No camera" : "Camera off"}</span>
            </div>
          )}
          <span className="absolute bottom-2 left-2 text-xs bg-black/50 px-2 py-1 rounded-full text-white z-10">{VIDEO_CHAT.yourLabel}</span>
          <button className="absolute top-2 right-2 bg-black/50 p-2 rounded-full text-white text-xs hover:bg-black/70 transition z-10">
            <i className={VIDEO_CHAT.expandIcon}></i>
          </button>
        </div>

        {/* Remote (stranger) */}
        <div className="relative rounded-2xl overflow-hidden bg-gray-800 flex items-center justify-center" style={{ aspectRatio: "16/9" }}>
          <video
            ref={remoteVideoRef}
            autoPlay playsInline
            className={`w-full h-full object-cover transition-opacity duration-300 ${remoteStream ? "opacity-100" : "opacity-0"}`}
          />
          {!remoteStream && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <i className="fa-solid fa-user text-5xl text-gray-600 opacity-30"></i>
              <span className="text-xs text-yellow-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse inline-block"></span>
                waiting for {stranger}…
              </span>
            </div>
          )}
          <span className="absolute bottom-2 left-2 text-xs bg-black/50 px-2 py-1 rounded-full text-white z-10">{stranger}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 flex-wrap">
        <button
          onClick={toggleCamera}
          disabled={!!mediaError}
          className={`p-4 rounded-full text-xl transition active:scale-95 shadow-md ${
            isCameraOn && !mediaError ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-red-500 text-white hover:bg-red-600"
          } disabled:opacity-40`}
          aria-label={isCameraOn ? "Turn off camera" : "Turn on camera"}
        >
          <i className={isCameraOn && !mediaError ? VIDEO_CHAT.cameraIcon : VIDEO_CHAT.cameraSlashIcon}></i>
        </button>

        <button
          onClick={toggleMic}
          disabled={!!mediaError}
          className={`p-4 rounded-full text-xl transition active:scale-95 shadow-md ${
            !isMuted ? "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600"
                     : "bg-red-500 text-white hover:bg-red-600"
          } disabled:opacity-40`}
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          <i className={isMuted ? VIDEO_CHAT.micSlashIcon : VIDEO_CHAT.micIcon}></i>
        </button>

        <div className="flex flex-col items-center text-xs text-gray-400 gap-0.5">
          <span>{isCameraOn && !mediaError ? "📷 cam on" : "📷 cam off"}</span>
          <span>{isMuted ? "🔇 muted" : "🎙 live"}</span>
        </div>
      </div>
    </div>
  );
};

export default VideoChatPanel;
