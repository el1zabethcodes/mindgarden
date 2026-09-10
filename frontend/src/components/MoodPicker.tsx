"use client";

import React from "react";

// botanical scale: from a wilted petal to a full bloom
export function moodEmoji(score: number | null): string {
  if (score === null) return "🍃";
  if (score <= 1) return "🥀";
  if (score <= 3) return "🍂";
  if (score <= 5) return "🌱";
  if (score <= 7) return "🌿";
  if (score <= 9) return "🌳";
  return "🌸";
}

interface MoodPickerProps {
  value: number | null;
  onChange: (value: number | null) => void;
}

export default function MoodPicker({ value, onChange }: MoodPickerProps) {
  return (
    <div>
      <label className="block text-[11px] uppercase tracking-wider font-semibold text-slate/60 mb-2 font-sans">
        how tending felt
      </label>
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1.5 flex-wrap">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((score) => {
            const active = value === score;
            return (
              <button
                key={score}
                type="button"
                onClick={() => onChange(active ? null : score)}
                title={`${score} / 10`}
                className={`w-7 h-7 rounded-full text-[11px] font-semibold border transition-all cursor-pointer font-sans ${
                  active
                    ? "bg-sage text-white border-sage shadow-sm scale-110"
                    : "bg-slate-light/70 text-slate/60 border-slate/10 hover:border-sage/40 hover:text-sage-dark"
                }`}
              >
                {score}
              </button>
            );
          })}
        </div>
        <span className="text-xl select-none" aria-hidden>
          {moodEmoji(value)}
        </span>
        {value !== null && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-[10px] text-slate/40 hover:text-slate underline cursor-pointer font-sans"
          >
            clear
          </button>
        )}
      </div>
    </div>
  );
}
