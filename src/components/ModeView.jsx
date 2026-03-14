import React from "react";
import { MODES, MODE_SELECTION } from "../data/appData";

const ModeView = ({ onSelectMode }) => {
  return (
    <div className="w-full max-w-3xl mx-auto">
      <h2 className="text-3xl font-semibold text-center mb-8">
        {MODE_SELECTION.heading}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {MODES.map((mode) => (
          <div
            key={mode.id}
            onClick={() => onSelectMode(mode)}
            className="bg-white dark:bg-gray-800/60 p-8 rounded-2xl shadow-lg hover:shadow-xl transition cursor-pointer border-2 border-transparent hover:border-indigo-300 active:scale-95"
          >
            <i className={`${mode.icon} text-4xl text-indigo-500 mb-4 block`}></i>
            <h3 className="text-2xl font-medium">{mode.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {mode.description}
            </p>
          </div>
        ))}
      </div>

      <div className="text-center mt-8 text-sm text-gray-400">
        <i className={`${MODE_SELECTION.locationIcon} mr-1`}></i>
        {MODE_SELECTION.locationNote}
      </div>
    </div>
  );
};

export default ModeView;
