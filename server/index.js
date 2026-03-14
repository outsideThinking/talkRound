// ============================================================
//  talkround · Signaling Server
//  Node.js + Express + Socket.io
//  Handles: user matching, text chat relay, WebRTC signaling
// ============================================================

import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// ── State ────────────────────────────────────────────────────
const waitingQueue = {
  text: [],   // socket ids waiting for text match
  audio: [],  // socket ids waiting for audio match
  video: [],  // socket ids waiting for video match
};

// roomId → { users: [socketId, socketId], mode }
const rooms = new Map();

// socketId → { roomId, mode, peerId }
const users = new Map();

// ── Helpers ───────────────────────────────────────────────────
function generateRoomId() {
  return Math.random().toString(36).substring(2, 10);
}

function getOnlineCount() {
  return io.engine.clientsCount;
}

function broadcastOnlineCount() {
  io.emit("online_count", getOnlineCount());
}

function leaveRoom(socketId) {
  const user = users.get(socketId);
  if (!user || !user.roomId) return;

  const room = rooms.get(user.roomId);
  if (!room) return;

  // Notify partner
  const partner = room.users.find((id) => id !== socketId);
  if (partner) {
    io.to(partner).emit("partner_disconnected");
    // Put partner back in queue
    const partnerUser = users.get(partner);
    if (partnerUser) {
      partnerUser.roomId = null;
      waitingQueue[partnerUser.mode] = waitingQueue[partnerUser.mode] || [];
      waitingQueue[partnerUser.mode].push(partner);
      io.to(partner).emit("waiting", { message: "Looking for a new partner..." });
      tryMatch(partnerUser.mode);
    }
  }

  rooms.delete(user.roomId);
  user.roomId = null;
}

function tryMatch(mode) {
  const queue = waitingQueue[mode];
  if (!queue || queue.length < 2) return;

  const [a, b] = [queue.shift(), queue.shift()];

  // Verify both still connected
  const sockA = io.sockets.sockets.get(a);
  const sockB = io.sockets.sockets.get(b);

  if (!sockA || !sockB) {
    // Re-add whichever is still alive
    if (sockA) queue.unshift(a);
    if (sockB) queue.unshift(b);
    if (queue.length >= 2) tryMatch(mode);
    return;
  }

  const roomId = generateRoomId();
  rooms.set(roomId, { users: [a, b], mode });

  const userA = users.get(a);
  const userB = users.get(b);
  if (userA) userA.roomId = roomId;
  if (userB) userB.roomId = roomId;

  sockA.join(roomId);
  sockB.join(roomId);

  // Tell A to initiate the WebRTC offer (initiator = true)
  io.to(a).emit("matched", {
    roomId,
    mode,
    initiator: true,
    partnerPeerId: userB?.peerId || null,
  });

  // Tell B to wait for offer (initiator = false)
  io.to(b).emit("matched", {
    roomId,
    mode,
    initiator: false,
    partnerPeerId: userA?.peerId || null,
  });

  console.log(`✅ Matched [${mode}] room=${roomId} | ${a} <-> ${b}`);
}

// ── Socket.io events ──────────────────────────────────────────
io.on("connection", (socket) => {
  console.log(`🔌 Connected: ${socket.id}`);
  users.set(socket.id, { roomId: null, mode: null, peerId: null });
  broadcastOnlineCount();

  // Client sends their PeerJS peerId after connecting
  socket.on("register_peer", ({ peerId }) => {
    const user = users.get(socket.id);
    if (user) user.peerId = peerId;
    console.log(`🪪 Peer registered: ${socket.id} → ${peerId}`);
  });

  // Client wants to find a match
  socket.on("find_match", ({ mode }) => {
    const user = users.get(socket.id);
    if (!user) return;

    // Leave current room if any
    leaveRoom(socket.id);

    user.mode = mode;

    // Remove from all queues first
    Object.keys(waitingQueue).forEach((m) => {
      waitingQueue[m] = waitingQueue[m].filter((id) => id !== socket.id);
    });

    waitingQueue[mode].push(socket.id);
    socket.emit("waiting", { message: "Finding someone nearby..." });
    console.log(`🔍 ${socket.id} waiting for [${mode}] match`);
    tryMatch(mode);
  });

  // ── WebRTC signaling relay ──────────────────────────────────

  // Relay SDP offer
  socket.on("webrtc_offer", ({ roomId, offer }) => {
    socket.to(roomId).emit("webrtc_offer", { offer, from: socket.id });
  });

  // Relay SDP answer
  socket.on("webrtc_answer", ({ roomId, answer }) => {
    socket.to(roomId).emit("webrtc_answer", { answer, from: socket.id });
  });

  // Relay ICE candidates
  socket.on("webrtc_ice", ({ roomId, candidate }) => {
    socket.to(roomId).emit("webrtc_ice", { candidate, from: socket.id });
  });

  // ── Text chat relay ─────────────────────────────────────────
  socket.on("chat_message", ({ roomId, text, time }) => {
    socket.to(roomId).emit("chat_message", { text, time, from: "stranger" });
  });

  // Typing indicator relay
  socket.on("typing_start", ({ roomId }) => {
    socket.to(roomId).emit("typing_start");
  });

  socket.on("typing_stop", ({ roomId }) => {
    socket.to(roomId).emit("typing_stop");
  });

  // ── Next / Skip ─────────────────────────────────────────────
  socket.on("next", () => {
    const user = users.get(socket.id);
    if (!user) return;
    const mode = user.mode;
    leaveRoom(socket.id);
    if (mode) {
      waitingQueue[mode] = waitingQueue[mode].filter((id) => id !== socket.id);
      waitingQueue[mode].push(socket.id);
      socket.emit("waiting", { message: "Finding someone new..." });
      tryMatch(mode);
    }
  });

  // ── End chat ─────────────────────────────────────────────────
  socket.on("end_chat", () => {
    leaveRoom(socket.id);
    const user = users.get(socket.id);
    if (user) {
      Object.keys(waitingQueue).forEach((m) => {
        waitingQueue[m] = waitingQueue[m].filter((id) => id !== socket.id);
      });
    }
  });

  // ── Disconnect ───────────────────────────────────────────────
  socket.on("disconnect", () => {
    console.log(`❌ Disconnected: ${socket.id}`);
    leaveRoom(socket.id);
    Object.keys(waitingQueue).forEach((m) => {
      waitingQueue[m] = waitingQueue[m].filter((id) => id !== socket.id);
    });
    users.delete(socket.id);
    broadcastOnlineCount();
  });
});

// ── Start ─────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`\n🚀 talkround signaling server running on http://localhost:${PORT}\n`);
});
