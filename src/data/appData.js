// ============================================================
//  talkround · Central Data File
//  All static content, config, and seed data lives here.
// ============================================================

export const APP_META = {
  name: "talkround",
  tagline: "instant anonymous chat",
  footerNote: "📍 approximate location · no data stored · temporary session",
  titleTag: "talkround · instant anonymous chat",
};

// ── Landing View ──────────────────────────────────────────────
export const LANDING = {
  headline: "Talk to People",
  headlineAccent: "Around You",
  headlineSuffix: "Instantly",
  subtext: "No signup. No login. Just real conversations.",
  ctaLabel: "Start now",
  ctaIcon: "fa-solid fa-play",
  features: [
    { icon: "fa-regular fa-circle-check", label: "anonymous" },
    { icon: "fa-regular fa-compass",       label: "nearby first" },
    { icon: "fa-regular fa-message",       label: "text • audio • video" },
  ],
};

// ── Mode Selection ────────────────────────────────────────────
export const MODE_SELECTION = {
  heading: "choose how to connect",
  locationNote: "we'll ask location to find nearby people",
  locationIcon: "fa-regular fa-location-dot",
};

export const MODES = [
  {
    id: "text",
    icon: "fa-solid fa-message",
    title: "Text chat",
    description: "share words, emojis & images",
    permissionAlert: null,
  },
  {
    id: "audio",
    icon: "fa-solid fa-microphone",
    title: "Audio chat",
    description: "voice only · mic required",
    permissionAlert: "[demo] microphone permission requested (simulated)",
  },
  {
    id: "video",
    icon: "fa-solid fa-video",
    title: "Video chat",
    description: "face to face · camera + mic",
    permissionAlert: "[demo] camera + microphone permission requested (simulated)",
  },
];

// ── Stranger / Chat State ─────────────────────────────────────
export const STRANGER_LIST = [
  "Stranger 1",
  "Stranger 2",
  "Stranger 3",
  "Stranger 4",
  "Stranger 5",
  "Stranger 6",
];

export const getDefaultMessages = (strangerId) => [
  {
    from: "stranger",
    text: `Hi from ${strangerId}`,
    time: `12:3${Math.floor(Math.random() * 5)}`,
  },
  { from: "me", text: "hello!", time: "12:40" },
];

export const randomDistance = () =>
  `${Math.floor(Math.random() * 18) + 1} km away`;

export const getRandomStranger = (currentId, blockedSet, list = STRANGER_LIST) => {
  let available = list.filter((s) => !blockedSet.has(s) && s !== currentId);
  if (available.length === 0) available = list.filter((s) => !blockedSet.has(s));
  if (available.length === 0) return "Stranger X";
  return available[Math.floor(Math.random() * available.length)];
};

// ── Chat Bar ──────────────────────────────────────────────────
export const CHAT_BAR = {
  connectedLabel: "connected",
  nextBtn: { label: "Next", icon: "fa-solid fa-forward" },
  endBtn: { label: "End",  icon: "fa-solid fa-phone-slash" },
};

// ── Safety Row ────────────────────────────────────────────────
export const SAFETY = {
  reportLabel: "report",
  reportIcon: "fa-regular fa-flag",
  blockLabel: "block",
  blockIcon: "fa-regular fa-circle-xmark",
  reportConfirmMsg: "report sent (demo) · thank you",
};

// ── Text Chat Panel ───────────────────────────────────────────
export const TEXT_CHAT = {
  inputPlaceholder: "say something...",
  sendIcon: "fa-regular fa-paper-plane",
  emojiIcon: "fa-regular fa-face-smile",
  imageIcon: "fa-regular fa-image",
  typingText: "Stranger is typing",
  typingIcon: "fa-regular fa-comment-dots",
  emojiInsert: " 😊 ",
  imageMessage: "📸 Image shared (demo)",
  strangerReply: "👍 cool!",
  strangerReplyDelay: 1500,
};

// ── Audio Chat Panel ──────────────────────────────────────────
export const AUDIO_CHAT = {
  micActiveLabel: "microphone • active",
  micReadyLabel: "mic ready",
  echoLabel: "echo cancellation",
  micIcon: "fa-solid fa-microphone",
  micSlashIcon: "fa-solid fa-microphone-slash",
  micReadyIcon: "fa-regular fa-circle-check",
  echoIcon: "fa-regular fa-user",
};

// ── Video Chat Panel ──────────────────────────────────────────
export const VIDEO_CHAT = {
  yourLabel: "you",
  controlsLabel: "controls (demo)",
  cameraIcon: "fa-solid fa-video",
  cameraSlashIcon: "fa-solid fa-video-slash",
  micIcon: "fa-solid fa-microphone",
  micSlashIcon: "fa-solid fa-microphone-slash",
  switchIcon: "fa-solid fa-camera-rotate",
  expandIcon: "fa-solid fa-arrows-up-down-left-right",
  switchCameraAlert: "camera switch simulation (mobile flip)",
};

// ── Online Counter ────────────────────────────────────────────
export const ONLINE_COUNTER = {
  minCount: 873,
  maxOffset: 500,
  intervalMs: 8000,
  initialDisplay: "1.2k",
};

// ── Location Prompt ───────────────────────────────────────────
export const LOCATION_PROMPT = {
  confirmMessage:
    "[demo] allow location to find nearby people? click OK to allow, cancel to simulate global fallback",
  nearbySource: "nearby",
  globalSource: "global (location denied)",
  globalDistance: "random · global",
  globalDistanceSymbol: "──",
};
