import React from "react";
import { LANDING } from "../data/appData";

const LandingView = ({ onStart }) => {
  return (
    <div className="w-full max-w-2xl mx-auto text-center space-y-8">
      {/* Headline */}
      <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
        {LANDING.headline}{" "}
        <span className="text-indigo-500">{LANDING.headlineAccent}</span>{" "}
        {LANDING.headlineSuffix}
      </h1>

      {/* Subtext */}
      <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto">
        {LANDING.subtext}
      </p>

      {/* CTA Button */}
      <button
        onClick={onStart}
        className="bg-indigo-600 hover:bg-indigo-700 text-white text-xl px-12 py-5 rounded-2xl shadow-xl shadow-indigo-500/30 transition-all active:scale-95 flex items-center gap-3 mx-auto font-medium"
      >
        <i className={LANDING.ctaIcon}></i>
        {LANDING.ctaLabel}
      </button>

      {/* Feature badges */}
      <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm text-gray-500 dark:text-gray-400">
        {LANDING.features.map((f) => (
          <span key={f.label} className="flex items-center gap-1">
            <i className={`${f.icon} text-indigo-400`}></i> {f.label}
          </span>
        ))}
      </div>
    </div>
  );
};

export default LandingView;
