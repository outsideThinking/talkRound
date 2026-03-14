import React from "react";
import { CHAT_BAR } from "../data/appData";

const StrangerBar = ({ stranger, distance, locationSource, onNext, onEnd }) => {
  const avatarLabel = stranger.split(" ")[1] || "?";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-4 bg-white/80 dark:bg-gray-800/50 p-3 rounded-2xl shadow-sm backdrop-blur-sm">
      {/* Avatar + info */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-lg font-bold shadow-md select-none">
          {avatarLabel}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-base">{stranger}</span>
            <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full flex items-center gap-1">
              <i className="fa-solid fa-circle" style={{ fontSize: "6px" }}></i>
              {CHAT_BAR.connectedLabel}
            </span>
          </div>
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 gap-2">
            <span>
              <i className="fa-regular fa-location-dot mr-1"></i>
              {distance}
            </span>
            <span className="w-1 h-1 bg-gray-400 rounded-full inline-block"></span>
            <span>📍 {locationSource}</span>
          </div>
        </div>
      </div>

      {/* Next / End buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={onNext}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl shadow-md transition flex items-center gap-2 text-sm font-medium active:scale-95"
        >
          <i className={CHAT_BAR.nextBtn.icon}></i>
          {CHAT_BAR.nextBtn.label}
        </button>
        <button
          onClick={onEnd}
          className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 px-5 py-3 rounded-xl shadow-sm transition flex items-center gap-2 text-sm font-medium active:scale-95"
        >
          <i className={CHAT_BAR.endBtn.icon}></i>
          {CHAT_BAR.endBtn.label}
        </button>
      </div>
    </div>
  );
};

export default StrangerBar;
