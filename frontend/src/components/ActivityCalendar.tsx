"use client";

import React, { useMemo } from "react";
import { Note } from "../lib/types";

interface ActivityCalendarProps {
  notes: Note[];
}

export default function ActivityCalendar({ notes }: ActivityCalendarProps) {
  // calculate activity grid data (12 weeks * 7 days = 84 days)
  const gridData = useMemo(() => {
    const daysToShow = 84;
    const data = [];
    const today = new Date();
    
    // map of date string -> count
    const activityMap: { [key: string]: number } = {};
    
    notes.forEach((note) => {
      if (note.updated_at) {
        const dateStr = new Date(note.updated_at).toDateString();
        activityMap[dateStr] = (activityMap[dateStr] || 0) + 1;
      }
    });

    for (let i = daysToShow - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toDateString();
      const count = activityMap[dateStr] || 0;
      data.push({
        date: d,
        count,
      });
    }
    
    return data;
  }, [notes]);

  // color map based on activity count
  const getCircleColor = (count: number) => {
    if (count === 0) return "bg-slate-200/40 border border-slate-300/10";
    if (count === 1) return "bg-sage-light border border-sage/10";
    if (count === 2) return "bg-sage/50 border border-sage/20";
    if (count === 3) return "bg-sage border border-sage-medium/30";
    return "bg-sage-dark";
  };

  return (
    <div className="bg-white/60 backdrop-blur-md border border-slate-200/40 rounded-2xl p-4 shadow-garden flex items-center gap-4 max-w-full md:max-w-md">
      <div>
        <h4 className="text-[11px] uppercase tracking-wider font-semibold text-slate/60 font-sans">
          Tend Activity
        </h4>
        <p className="text-[10px] text-slate/40 mt-0.5 font-sans">
          last 12 weeks of garden care
        </p>
      </div>

      <div className="grid grid-flow-col grid-rows-7 gap-1.5 overflow-x-auto py-1 scrollbar-none">
        {gridData.map((day, idx) => (
          <div
            key={idx}
            className={`w-2.5 h-2.5 rounded-full transition-transform duration-200 hover:scale-125 cursor-pointer ${getCircleColor(
              day.count
            )}`}
            title={`${day.date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}: ${day.count} tended`}
          />
        ))}
      </div>
    </div>
  );
}
