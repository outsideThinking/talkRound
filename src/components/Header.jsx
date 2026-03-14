import React from "react";
import { APP_META, ONLINE_COUNTER } from "../data/appData";

const Header = ({ darkMode, toggleDarkMode, onlineCount }) => {
  return (
    <header className="flex justify-between items-center mb-6">
      {/* Logo + online badge */}
      <div className="flex items-center gap-2">
        <i className="fa-solid fa-comment text-xl text-indigo-500"></i>
        <span className="font-semibold text-lg tracking-tight">
          talk<span className="text-indigo-500">round</span>
        </span>
        <span className="ml-2 text-xs bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full flex items-center gap-1">
          <i className="fa-solid fa-circle text-green-500" style={{ fontSize: "8px" }}></i>
          <span>{onlineCount}</span> online
        </span>
      </div>

      {/* Theme toggle */}
      <button
        onClick={toggleDarkMode}
        className="p-3 rounded-full bg-white/70 dark:bg-gray-800/70 shadow-sm hover:shadow-md transition active:scale-95"
        aria-label="Toggle theme"
      >
        <i
          className={`fa-solid ${
            darkMode ? "fa-sun text-yellow-300" : "fa-moon text-gray-700"
          } text-xl`}
        ></i>
      </button>
    </header>
  );
};

export default Header;
