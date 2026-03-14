// ── useWebRTC.js ──────────────────────────────────────────────
// Manages WebRTC peer connection: offer/answer/ICE via socket relay

import { useEffect, useRef, useState, useCallback } from "react";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
};

export function useWebRTC({ socket, roomId, isInitiator, mode, localStream }) {
  const pcRef = useRef(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [connectionState, setConnectionState] = useState("new");
  const pendingCandidates = useRef([]);

  const cleanup = useCallback(() => {
    if (pcRef.current) {
      pcRef.current.onicecandidate = null;
      pcRef.current.ontrack = null;
      pcRef.current.onconnectionstatechange = null;
      pcRef.current.close();
      pcRef.current = null;
    }
    setRemoteStream(null);
    setConnectionState("closed");
    pendingCandidates.current = [];
  }, []);

  const createPeerConnection = useCallback(() => {
    cleanup();

    const pc = new RTCPeerConnection(ICE_SERVERS);
    pcRef.current = pc;

    // Add local tracks
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });
    }

    // Remote stream
    const remote = new MediaStream();
    setRemoteStream(remote);

    pc.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        remote.addTrack(track);
      });
      setRemoteStream(new MediaStream(remote.getTracks()));
    };

    // ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && socket && roomId) {
        socket.emit("webrtc_ice", { roomId, candidate: event.candidate });
      }
    };

    // Connection state
    pc.onconnectionstatechange = () => {
      setConnectionState(pc.connectionState);
      console.log("WebRTC state:", pc.connectionState);
    };

    return pc;
  }, [localStream, socket, roomId, cleanup]);

  // ── Start connection when matched ─────────────────────────────
  useEffect(() => {
    if (!socket || !roomId || !localStream) return;

    // Only do video/audio WebRTC for those modes
    if (mode === "text") return;

    const pc = createPeerConnection();

    const start = async () => {
      if (isInitiator) {
        try {
          const offer = await pc.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: mode === "video",
          });
          await pc.setLocalDescription(offer);
          socket.emit("webrtc_offer", { roomId, offer });
        } catch (err) {
          console.error("Failed to create offer:", err);
        }
      }
    };

    start();

    // Handle incoming offer
    const handleOffer = async ({ offer }) => {
      if (!pcRef.current) return;
      try {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(offer));
        // Add any pending candidates
        for (const c of pendingCandidates.current) {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(c));
        }
        pendingCandidates.current = [];

        const answer = await pcRef.current.createAnswer();
        await pcRef.current.setLocalDescription(answer);
        socket.emit("webrtc_answer", { roomId, answer });
      } catch (err) {
        console.error("Failed to handle offer:", err);
      }
    };

    // Handle incoming answer
    const handleAnswer = async ({ answer }) => {
      if (!pcRef.current) return;
      try {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
        // flush pending candidates
        for (const c of pendingCandidates.current) {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(c));
        }
        pendingCandidates.current = [];
      } catch (err) {
        console.error("Failed to handle answer:", err);
      }
    };

    // Handle ICE candidates
    const handleIce = async ({ candidate }) => {
      if (!pcRef.current) return;
      if (pcRef.current.remoteDescription) {
        try {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error("ICE error:", err);
        }
      } else {
        // Queue until remote description is set
        pendingCandidates.current.push(candidate);
      }
    };

    socket.on("webrtc_offer", handleOffer);
    socket.on("webrtc_answer", handleAnswer);
    socket.on("webrtc_ice", handleIce);

    return () => {
      socket.off("webrtc_offer", handleOffer);
      socket.off("webrtc_answer", handleAnswer);
      socket.off("webrtc_ice", handleIce);
      cleanup();
    };
  }, [socket, roomId, isInitiator, mode, localStream, createPeerConnection, cleanup]);

  return { remoteStream, connectionState, cleanup };
}
