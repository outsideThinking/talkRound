// ── useMediaStream.js ─────────────────────────────────────────
// Requests and manages the local MediaStream for audio/video modes

import { useEffect, useRef, useState } from "react";

export function useMediaStream(mode) {
  const [localStream, setLocalStream] = useState(null);
  const [mediaError, setMediaError] = useState(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (mode === "text") return;

    const constraints = {
      audio: true,
      video: mode === "video" ? { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" } : false,
    };

    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        streamRef.current = stream;
        setLocalStream(stream);
        setMediaError(null);
      })
      .catch((err) => {
        console.error("Media error:", err);
        if (err.name === "NotAllowedError") {
          setMediaError("Permission denied. Please allow camera/microphone access.");
        } else if (err.name === "NotFoundError") {
          setMediaError("No camera or microphone found on this device.");
        } else {
          setMediaError(`Media error: ${err.message}`);
        }
      });

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        setLocalStream(null);
      }
    };
  }, [mode]);

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setLocalStream(null);
    }
  };

  return { localStream, mediaError, stopStream };
}
