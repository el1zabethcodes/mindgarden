"use client";

import React, { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Stats, TagStat } from "../lib/types";

const TAG_HEX: Record<string, string> = {
  sage: "#87a987",
  mint: "#8fcfa0",
  slate: "#94a89a",
  lavender_cool: "#c4a7e0",
  peach: "#f0b07e",
  rose: "#e8a3c0",
};

const tagColor = (t: TagStat) => TAG_HEX[t.color] ?? "#87a987";

const W = 760;
const H = 240;
const PAD_X = 20;
const PAD_Y = 28;

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    api
      .getStats(30)
      .then(setStats)
      .catch((err) => {
        console.error("failed to load greenhouse stats:", err);
        setFailed(true);
      });
  }, []);

  const mood = stats?.mood ?? [];
  const logged = mood.filter((p) => p.avg_score !== null);

  // map day points into chart space
  const points = mood.map((p, i) => ({
    ...p,
    x: PAD_X + (i / Math.max(1, mood.length - 1)) * (W - PAD_X * 2),
    y:
      p.avg_score === null
        ? null
        : H - PAD_Y - ((p.avg_score - 1) / 9) * (H - PAD_Y * 2),
  }));

  const linePoints = points.filter((p) => p.y !== null) as Array<
    typeof points[number] & { y: number }
  >;

  const linePath = linePoints
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  const areaPath =
    linePoints.length >= 2
      ? `${linePath} L ${linePoints[linePoints.length - 1].x.toFixed(1)} ${H - PAD_Y} L ${linePoints[0].x.toFixed(1)} ${H - PAD_Y} Z`
      : "";

  const avgY =
    stats?.totals.avg_mood != null
      ? H - PAD_Y - ((stats.totals.avg_mood - 1) / 9) * (H - PAD_Y * 2)
      : null;

  const fmtDay = (iso: string) =>
    new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

  const activeDays = (stats?.activity ?? []).filter(
    (d) => d.notes + d.moods + d.checkins > 0
  ).length;

  return (
    <div className="w-full max-w-7xl mx-auto px-6 pb-10">
      {/* heading */}
      <div className="mb-6">
        <h2 className="font-serif text-2xl md:text-3xl text-charcoal font-bold tracking-tight">
          The Greenhouse 🌤️
        </h2>
        <p className="text-slate text-sm mt-1 font-sans font-light">
          a gentle look at how your inner garden has been growing this month
        </p>
      </div>

      {failed ? (
        <div className="glass-panel p-10 text-center text-slate/60 font-sans text-sm">
          the greenhouse is resting — could not reach the stats api
        </div>
      ) : !stats ? (
        <div className="glass-panel p-10 text-center text-slate/60 font-sans text-sm animate-pulse">
          gathering sunlight...
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="glass-panel p-6 md:p-8">
            <div className="flex items-baseline justify-between mb-4 flex-wrap gap-2">
              <div>
                <h3 className="text-[11px] uppercase tracking-wider font-bold text-slate/60 font-sans">
                  mood over the last {stats.days} days
                </h3>
                <p className="text-[10px] text-slate/40 mt-0.5 font-sans">
                  from wilting (1) to blooming (10)
                </p>
              </div>
              {stats.totals.avg_mood !== null && (
                <span className="text-[11px] font-sans text-sage-dark bg-sage-light/70 border border-sage/10 px-3 py-1 rounded-full">
                  average mood {stats.totals.avg_mood}/10
                </span>
              )}
            </div>
            {logged.length === 0 ? (
              <div className="py-16 text-center text-slate/50 font-sans text-sm italic">
                no moods logged yet — the chart blooms with your first entry 🌱
              </div>
            ) : (
              <svg
                viewBox={`0 0 ${W} ${H}`}
                className="w-full h-auto"
                role="img"
                aria-label="daily mood chart"
              >
                <defs>
                  <linearGradient id="mood-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#87a987" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="#87a987" stopOpacity="0.02" />
                  </linearGradient>
                </defs>

                {/* soft baseline guides */}
                <line x1={PAD_X} x2={W - PAD_X} y1={PAD_Y} y2={PAD_Y} stroke="currentColor" className="text-slate/10" strokeWidth="1" />
                <line x1={PAD_X} x2={W - PAD_X} y1={H - PAD_Y} y2={H - PAD_Y} stroke="currentColor" className="text-slate/10" strokeWidth="1" />

                {/* average line */}
                {avgY !== null && (
                  <line
                    x1={PAD_X}
                    x2={W - PAD_X}
                    y1={avgY}
                    y2={avgY}
                    stroke="#a3bfa3"
                    strokeWidth="1"
                    strokeDasharray="4 6"
                    opacity="0.6"
                  />
                )}

                {/* area + line */}
                {areaPath && <path d={areaPath} fill="url(#mood-fill)" />}
                {linePath && (
                  <path
                    d={linePath}
                    fill="none"
                    stroke="#729772"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* points */}
                {linePoints.map((p) => (
                  <circle
                    key={p.date}
                    cx={p.x}
                    cy={p.y}
                    r="3.5"
                    fill="#f6faf6"
                    stroke="#729772"
                    strokeWidth="2"
                  >
                    <title>{`${fmtDay(p.date)}: ${p.avg_score}/10`}</title>
                  </circle>
                ))}

                {/* window labels */}
                {mood.length > 0 && (
                  <>
                    <text x={PAD_X} y={H - 8} className="fill-current text-slate/40" fontSize="10">
                      {fmtDay(mood[0].date)}
                    </text>
                    <text
                      x={W - PAD_X}
                      y={H - 8}
                      textAnchor="end"
                      className="fill-current text-slate/40"
                      fontSize="10"
                    >
                      {fmtDay(mood[mood.length - 1].date)}
                    </text>
                  </>
                )}
              </svg>
            )}
          </div>

          {/* summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-card p-5">
              <div className="text-[10px] uppercase tracking-wider font-bold text-slate/50 font-sans">
                notes planted
              </div>
              <div className="font-serif text-3xl font-black text-charcoal mt-1">
                {stats.totals.notes}
              </div>
              <div className="text-[10px] text-slate/40 font-sans mt-1">
                seeds, saplings and evergreens alike
              </div>
            </div>
            <div className="glass-card p-5">
              <div className="text-[10px] uppercase tracking-wider font-bold text-slate/50 font-sans">
                days tended
              </div>
              <div className="font-serif text-3xl font-black text-charcoal mt-1">
                {activeDays}
                <span className="text-base text-slate/40 font-sans"> / {stats.days}</span>
              </div>
              <div className="text-[10px] text-slate/40 font-sans mt-1">
                any note, mood or check-in counts
              </div>
            </div>
            <div className="glass-card p-5">
              <div className="text-[10px] uppercase tracking-wider font-bold text-slate/50 font-sans">
                habits growing
              </div>
              <div className="font-serif text-3xl font-black text-charcoal mt-1">
                {stats.totals.habits}
              </div>
              <div className="text-[10px] text-slate/40 font-sans mt-1">
                little rituals in the garden
              </div>
            </div>
            <div className="glass-card p-5">
              <div className="text-[10px] uppercase tracking-wider font-bold text-slate/50 font-sans">
                longest streak
              </div>
              <div className="font-serif text-3xl font-black text-charcoal mt-1">
                {stats.totals.longest_streak}
                <span className="text-base text-sage"> 🌿</span>
              </div>
              <div className="text-[10px] text-slate/40 font-sans mt-1">
                consecutive days of care
              </div>
            </div>
          </div>

          {/* top tags */}
          <div className="glass-panel p-6 md:p-8">
            <h3 className="text-[11px] uppercase tracking-wider font-bold text-slate/60 font-sans mb-4">
              tags that keep coming back
            </h3>
            {stats.top_tags.length === 0 ? (
              <p className="text-slate/50 font-sans text-sm italic">
                tag a few notes and the patterns will surface here
              </p>
            ) : (
              <div className="space-y-3">
                {stats.top_tags.map((t) => {
                  const max = stats.top_tags[0].count || 1;
                  return (
                    <div key={t.id} className="flex items-center gap-4">
                      <span className="text-xs font-medium text-slate/80 font-sans w-32 truncate shrink-0">
                        #{t.name}
                      </span>
                      <div className="flex-1 h-2.5 rounded-full bg-slate-light/60 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.max(6, (t.count / max) * 100)}%`,
                            backgroundColor: tagColor(t),
                          }}
                        />
                      </div>
                      <span className="text-[11px] font-mono text-slate/50 w-8 text-right shrink-0">
                        {t.count}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
