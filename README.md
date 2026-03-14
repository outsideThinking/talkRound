# talkround · instant anonymous chat

A fully working React.js + Node.js app with **real** text chat, audio calls, and video calls using **WebRTC** and **Socket.io**.

---

## Architecture

```
talkround/
├── server/                     ← Node.js signaling server (Socket.io)
│   ├── index.js                ← Matching engine + WebRTC relay + chat
│   └── package.json
├── src/
│   ├── App.jsx                 ← Root component
│   ├── main.jsx
│   ├── index.css
│   ├── data/
│   │   └── appData.js          ← ALL content/config in one place
│   ├── hooks/
│   │   ├── useSocket.js        ← Singleton Socket.io connection
│   │   ├── useWebRTC.js        ← WebRTC peer connection (offer/answer/ICE)
│   │   └── useMediaStream.js   ← Camera/mic MediaStream access
│   └── components/
│       ├── Header.jsx
│       ├── Footer.jsx
│       ├── LandingView.jsx
│       ├── ModeView.jsx
│       ├── ChatView.jsx        ← Orchestrates matching + mode panels
│       ├── StrangerBar.jsx
│       ├── SafetyRow.jsx
│       ├── TextChatPanel.jsx   ← Real-time text via Socket.io
│       ├── AudioChatPanel.jsx  ← Real audio via WebRTC
│       └── VideoChatPanel.jsx  ← Real video+audio via WebRTC
├── .env                        ← VITE_SERVER_URL=http://localhost:3001
├── package.json
└── vite.config.js
```

---

## Quick Start (Local)

You need TWO terminals.

### Terminal 1 — Signaling Server

```bash
cd server
npm install
npm run dev
# Server running on http://localhost:3001
```

### Terminal 2 — Frontend

```bash
npm install
npm run dev
# App running on http://localhost:5173
```

Open two browser tabs at http://localhost:5173, select the same mode, and you are matched instantly.

---

## How Each Mode Works

| Mode  | Technology | What happens |
|-------|-----------|--------------|
| Text  | Socket.io  | Messages relayed via server. Typing indicators included. |
| Audio | WebRTC     | Mic access requested, peer-to-peer audio via STUN |
| Video | WebRTC     | Camera+mic requested, peer-to-peer video+audio via STUN |

---

## Customising Content

All labels, lists, timings, and config are in src/data/appData.js.

---

## Production

1. Deploy server/ to Railway, Render, or Fly.io
2. Set .env VITE_SERVER_URL=https://your-server.com
3. npm run build, deploy dist/ to Vercel or Netlify
4. Add TURN server to useWebRTC.js ICE config for cross-network video
