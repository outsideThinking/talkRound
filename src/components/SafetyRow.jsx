import React from "react";
import { SAFETY } from "../data/appData";

const SafetyRow = ({ isConnected, onReport, onBlock }) => {
  return (
    <div className="flex justify-between items-center mb-3 text-sm">
      {/* Report / Block */}
      <div className="flex gap-3">
        <button
          onClick={onReport}
          className="text-gray-500 hover:text-red-500 transition flex items-center gap-1"
        >
          <i className={SAFETY.reportIcon}></i>
          {SAFETY.reportLabel}
        </button>
        <button
          onClick={onBlock}
          className="text-gray-500 hover:text-red-500 transition flex items-center gap-1"
        >
          <i className={SAFETY.blockIcon}></i>
          {SAFETY.blockLabel}
        </button>
      </div>

      {/* Connection badge */}
      {isConnected ? (
        <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-xs flex items-center gap-1">
          <i className="fa-solid fa-wifi"></i> connected
        </div>
      ) : (
        <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-3 py-1 rounded-full text-xs flex items-center gap-1">
          <i className="fa-solid fa-circle-exclamation"></i> disconnected
        </div>
      )}
    </div>
  );
};

export default SafetyRow;
