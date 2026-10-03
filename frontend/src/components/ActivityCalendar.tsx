"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { api } from "../lib/api";
import { ActivityDay, MoodEntry } from "../lib/types";

// 12 weeks of care history, one column per week
const WINDOW_DAYS = 84;

// github-style intensity scale in garden greens
const heatClass = (intensity: number): string => {
  if (intensity <= 0) return "bg-slate/15";
  if (intensity === 1) return "bg-sage/40";
  if (intensity === 2) return "bg-sage/70";
  return "bg-sage-dark";
};

interface DayDetail {
  day: ActivityDay;
  noteTitles: Array<{ id: string; title: string }>;
  loadingNotes: boolean;
}

export default function ActivityCalendar() {
  const [activity, setActivity] = useState<ActivityDay[]>([]);
  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [detail, setDetail] = useState<DayDetail | null>(null);

  useEffect(() => {
    api
      .getStats(WINDOW_DAYS)
      .then((s) => setActivity(s.activity))
      .catch((err) => console.error("failed to load activity:", err));
    api
      .getMoodEntries(WINDOW_DAYS)
      .then(setMoods)
      .catch((err) => console.error("failed to load moods:", err));
  }, []);

  // bucket days into week columns of 7 (oldest first, ending today)
  const weeks = useMemo(() => {
    const cols: ActivityDay[][] = [];
    for (let i = 0; i < activity.length; i += 7) {
      cols.push(activity.slice(i, i + 7));
    }
    return cols;
  }, [activity]);

  const moodByDate = useMemo(
    () => new Map(moods.map((m) => [m.entry_date.slice(0, 10), m])),
    [moods]
  );

  const openDay = async (day: ActivityDay) => {
    setDetail({ day, noteTitles: [], loadingNotes: true });
    try {
      const page = await api.getFeed({
        dateFrom: day.date,
        dateTo: day.date,
        sort: "created",
        limit: 5,
      });
      setDetail({
        day,
        noteTitles: page.items.map((n) => ({ id: n.id, title: n.title })),
        loadingNotes: false,
      });
    } catch (err) {
      console.error("failed to open day detail:", err);
      setDetail({ day, noteTitles: [], loadingNotes: false });
    }
  };

  const fmtDay = (d: ActivityDay) => {
    const label = new Date(d.date + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "short",
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
    <div className="relative">
      <div className="glass-card p-4 flex items-center gap-4 max-w-full md:max-w-md">
        <div className="shrink-0">
          <h4 className="text-[11px] uppercase tracking-wider font-semibold text-slate/60 font-sans">
            Care Heatmap
          </h4>
          <p className="text-[10px] text-slate/40 mt-0.5 font-sans">
            last 12 weeks — click a day
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
                  role="button"
                  tabIndex={0}
                  onClick={() => openDay(day)}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && openDay(day)}
                  className={`w-2.5 h-2.5 rounded-[3px] transition-transform duration-200 hover:scale-125 cursor-pointer ${
                    detail?.day.date === day.date
                      ? "ring-2 ring-sage ring-offset-1"
                      : ""
                  } ${heatClass(day.notes + day.moods + day.checkins)}`}
                  title={fmtDay(day)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* day detail popover */}
      <AnimatePresence>
        {detail && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
            className="absolute left-0 top-full mt-2 z-30 w-64 glass-panel p-4"
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <h5 className="font-serif text-sm font-bold text-charcoal">
                {new Date(detail.day.date + "T00:00:00").toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </h5>
              <button
                onClick={() => setDetail(null)}
                aria-label="close day detail"
                className="p-1 text-slate/40 hover:text-slate hover:bg-slate-100/60 rounded-lg cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* summary line */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              <span className="text-[10px] font-sans text-sage-dark bg-sage-light/70 border border-sage/10 px-2 py-0.5 rounded-full">
                🌱 {detail.day.notes} notes
              </span>
              {moodByDate.get(detail.day.date) ? (
                <span className="text-[10px] font-sans text-sage-dark bg-sage-light/70 border border-sage/10 px-2 py-0.5 rounded-full">
                  mood {moodByDate.get(detail.day.date)!.score}/10
                </span>
              ) : null}
              {detail.day.checkins > 0 && (
                <span className="text-[10px] font-sans text-sage-dark bg-sage-light/70 border border-sage/10 px-2 py-0.5 rounded-full">
                  🌿 {detail.day.checkins} rituals
                </span>
              )}
            </div>

            {/* notes of the day */}
            {detail.loadingNotes ? (
              <p className="text-[11px] text-slate/40 font-sans animate-pulse">
                opening the day journal...
              </p>
            ) : detail.noteTitles.length === 0 ? (
              <p className="text-[11px] text-slate/40 font-sans italic">
                no notes planted on this day
              </p>
            ) : (
              <ul className="space-y-1.5">
                {detail.noteTitles.map((n) => (
                  <li
                    key={n.id}
                    className="text-[11px] font-sans text-slate/75 bg-[var(--glass-bg)] border border-[var(--glass-border-soft)] rounded-lg px-2.5 py-1.5 truncate"
                    title={n.title}
                  >
                    {n.title}
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
