"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api } from "../lib/api";
import { MoodEntry } from "../lib/types";
import { moodEmoji } from "./MoodPicker";

const localDayKey = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export default function MoodStrip() {
  const [entries, setEntries] = useState<MoodEntry[]>([]);

  useEffect(() => {
    api
      .getMoodEntries(14)
      .then(setEntries)
      .catch((err) => console.error("failed to load mood entries:", err));
  }, []);

  const byDate = new Map(entries.map((e) => [e.entry_date.slice(0, 10), e]));

  // oldest first, 14 day window ending today
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    return d;
  });

  return (
    <motion.div
      className="w-full max-w-7xl mx-auto px-6 mb-6"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 22 }}
    >
      <div className="glass-inset px-5 py-4 flex items-center gap-6 flex-wrap">
        <div className="shrink-0">
          <h3 className="text-[11px] uppercase tracking-wider font-bold text-slate/60 font-sans">
            how the garden has felt
          </h3>
          <p className="text-[10px] text-slate/40 mt-0.5 font-sans">
            last 14 days of mood logs
          </p>
        </div>

        <div className="flex items-end gap-2.5 flex-wrap">
          {days.map((d) => {
            const key = localDayKey(d);
            const entry = byDate.get(key);
            return (
              <div
                key={key}
                className="flex flex-col items-center gap-1"
                title={
                  entry
                    ? `${key}: ${entry.score}/10${entry.note ? " — " + entry.note : ""}`
                    : `${key}: not logged`
                }
              >
                <span
                  className={`text-base leading-none select-none ${entry ? "" : "text-slate/30"}`}
                  aria-hidden
                >
                  {entry ? moodEmoji(entry.score) : "·"}
                </span>
                <span
                  className={`text-[8px] font-mono ${
                    entry ? "text-slate/50" : "text-slate/25"
                  }`}
                >
                  {d.getDate()}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
