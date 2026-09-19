"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { api } from "../lib/api";
import { Habit } from "../lib/types";

const HABIT_EMOJI: Record<string, string> = {
  seedling: "🌱",
  leaf: "🍃",
  sun: "☀️",
  droplet: "💧",
  book: "📖",
  moon: "🌙",
};

const habitEmoji = (key: string): string => HABIT_EMOJI[key] ?? "🌿";

const localDayKey = (offsetAgo: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - offsetAgo);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export default function HabitsPanel() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newName, setNewName] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(() => {
    api
      .getHabits()
      .then(setHabits)
      .catch((err) => console.error("failed to load habits:", err));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleCheckIn = async (habit: Habit) => {
    // optimistic sprout, reconciled by the refresh
    setHabits((prev) =>
      prev.map((h) => (h.id === habit.id ? { ...h, total_checkins: h.total_checkins + 1 } : h))
    );
    try {
      await api.checkInHabit(habit.id);
      refresh();
    } catch (err) {
      console.error("check-in failed:", err);
      refresh();
    }
  };

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name || busy) return;
    setBusy(true);
    try {
      await api.createHabit({ name });
      setNewName("");
      refresh();
    } catch (err) {
      console.error("failed to plant habit:", err);
    } finally {
      setBusy(false);
    }
  };

  const today = localDayKey(0);
  // today's state comes from the last element of recent_days
  const isCheckedToday = (h: Habit) => h.recent_days[h.recent_days.length - 1] === true;

  return (
    <div className="w-full max-w-7xl mx-auto px-6 mb-6">
      <div className="glass-panel p-5 md:p-6">
        <div className="flex items-baseline justify-between mb-4 flex-wrap gap-2">
          <div>
            <h3 className="text-[11px] uppercase tracking-wider font-bold text-slate/60 font-sans">
              daily rituals
            </h3>
            <p className="text-[10px] text-slate/40 mt-0.5 font-sans">
              small acts of care, tended one day at a time
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              placeholder="a new gentle habit..."
              className="px-3 py-2 text-xs font-sans bg-[var(--glass-bg)] border border-[var(--glass-border-soft)] rounded-xl focus:outline-none focus:ring-1 focus:ring-sage/40 w-44 text-charcoal placeholder:text-slate/40"
            />
            <button
              onClick={handleCreate}
              disabled={!newName.trim() || busy}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-sans font-medium bg-sage hover:bg-sage-medium disabled:opacity-40 text-white rounded-xl transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> plant
            </button>
          </div>
        </div>

        {habits.length === 0 ? (
          <p className="text-slate/50 font-sans text-sm italic py-4 text-center">
            no rituals yet — plant the first one and tend it gently 🌱
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {habits.map((h) => {
              const last7 = h.recent_days.slice(-7);
              return (
                <div
                  key={h.id}
                  className="glass-inset p-4 flex items-center gap-4 justify-between"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl select-none" aria-hidden>
                      {habitEmoji(h.icon)}
                    </span>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-charcoal font-sans truncate">
                        {h.name}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {/* last 7 days: soft dots, filled when tended */}
                        <div className="flex gap-1">
                          {last7.map((tended, i) => (
                            <span
                              key={i}
                              className={`w-1.5 h-1.5 rounded-full ${
                                tended ? "bg-sage" : "bg-slate/20"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] font-sans text-slate/45">
                          {h.current_streak > 0 ? `🌿 ${h.current_streak}-day streak` : `${h.total_checkins} check-ins`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleCheckIn(h)}
                    className={`px-3.5 py-2 text-xs font-sans font-medium rounded-xl transition-all cursor-pointer shrink-0 ${
                      isCheckedToday(h)
                        ? "bg-sage-light/70 text-sage-dark border border-sage/20"
                        : "bg-sage/15 text-sage-dark border border-sage/15 hover:bg-sage/25"
                    }`}
                    title={isCheckedToday(h) ? `tended today (${today}) — see you tomorrow` : "tend this ritual today"}
                  >
                    {isCheckedToday(h) ? "tended ✓" : "tend"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
