"use client";

import React, { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { ActivityDay } from "../lib/types";

// 12 weeks of care history, one column per week
const WINDOW_DAYS = 84;

// github-style intensity scale in garden greens
const heatClass = (intensity: number): string => {
  if (intensity <= 0) return "bg-slate/15";
  if (intensity === 1) return "bg-sage/40";
  if (intensity === 2) return "bg-sage/70";
  return "bg-sage-dark";
};

export default function ActivityCalendar() {
  const [activity, setActivity] = useState<ActivityDay[]>([]);

  useEffect(() => {
    api
      .getStats(WINDOW_DAYS)
      .then((s) => setActivity(s.activity))
      .catch((err) => console.error("failed to load activity:", err));
  }, []);

  // bucket days into week columns of 7 (oldest first, ending today)
  const weeks = useMemo(() => {
    const cols: ActivityDay[][] = [];
    for (let i = 0; i < activity.length; i += 7) {
      cols.push(activity.slice(i, i + 7));
    }
    return cols;
  }, [activity]);

  const fmtDay = (d: ActivityDay) => {
    const label = new Date(d.date + "T00:00:00").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const parts: string[] = [];
    if (d.notes) parts.push(`${d.notes} note${d.notes > 1 ? "s" : ""}`);
    if (d.moods) parts.push("mood logged");
    if (d.checkins) parts.push(`${d.checkins} ritual${d.checkins > 1 ? "s" : ""}`);
    return parts.length ? `${label}: ${parts.join(", ")}` : `${label}: the garden rested`;
  };

  return (
    <div className="glass-card p-4 flex items-center gap-4 max-w-full md:max-w-md">
      <div className="shrink-0">
        <h4 className="text-[11px] uppercase tracking-wider font-semibold text-slate/60 font-sans">
          Care Heatmap
        </h4>
        <p className="text-[10px] text-slate/40 mt-0.5 font-sans">
          last 12 weeks of tending
        </p>
        <div className="flex items-center gap-1 mt-2">
          <span className="text-[8px] text-slate/40 font-sans mr-0.5">less</span>
          {[0, 1, 2, 3].map((lvl) => (
            <span key={lvl} className={`w-2 h-2 rounded-[3px] ${heatClass(lvl)}`} />
          ))}
          <span className="text-[8px] text-slate/40 font-sans ml-0.5">more</span>
        </div>
      </div>

      <div className="grid grid-flow-col grid-rows-7 gap-[3px] overflow-x-auto py-1 scrollbar-none">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((day) => (
              <div
                key={day.date}
                className={`w-2.5 h-2.5 rounded-[3px] transition-transform duration-200 hover:scale-125 cursor-pointer ${heatClass(
                  day.notes + day.moods + day.checkins
                )}`}
                title={fmtDay(day)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
