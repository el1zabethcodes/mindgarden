"use client";

import React, { useState } from "react";
import { TreeDeciduous } from "lucide-react";

export default function GrowthChart() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // monthly growth dataset
  const data = [
    { month: "Mar", total: 2, label: "2 Seeds planted" },
    { month: "Apr", total: 4, label: "4 Notes growing" },
    { month: "May", total: 5, label: "5 Connections made" },
    { month: "Jun", total: 8, label: "8 Thoughts established" },
    { month: "Jul", total: 7, label: "7 Notes tended" },
    { month: "Aug", total: 10, label: "10 Evergreen gardens" },
  ];

  // SVG coordinates mapping inside viewBox="0 0 500 120"
  const points = [
    { x: 40, y: 95 },
    { x: 120, y: 75 },
    { x: 200, y: 65 },
    { x: 280, y: 40 },
    { x: 360, y: 48 },
    { x: 440, y: 20 },
  ];

  // generate path string (smooth bezier curves)
  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i];
    const next = points[i + 1];
    const cpX1 = curr.x + 40;
    const cpY1 = curr.y;
    const cpX2 = next.x - 40;
    const cpY2 = next.y;
    pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${next.x} ${next.y}`;
  }

  return (
    <div className="bg-white/70 backdrop-blur-md border border-slate-200/30 p-5 rounded-3xl shadow-garden flex-1 min-w-[320px] flex flex-col justify-between relative overflow-hidden">
      {/* header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-slate text-[10px] uppercase tracking-wider font-bold font-sans flex items-center gap-1">
            <TreeDeciduous className="w-3.5 h-3.5 text-sage" /> Growth Analytics
          </div>
          <h4 className="font-serif text-lg font-bold text-charcoal mt-0.5">
            Garden Growth Trend
          </h4>
        </div>
        
        {/* tooltip overlay */}
        {hoveredIdx !== null && (
          <div className="absolute top-4 right-5 bg-sage-dark text-white px-2.5 py-1 rounded-xl text-[10px] font-sans font-medium shadow-md transition-all">
            {data[hoveredIdx].month}: {data[hoveredIdx].label}
          </div>
        )}
      </div>

      {/* chart area */}
      <div className="relative h-28 w-full mt-2">
        <svg viewBox="0 0 500 120" className="w-full h-full overflow-visible">
          {/* chart path */}
          <path
            d={pathD}
            fill="none"
            stroke="#a5bca5"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* grid helper lines */}
          <line x1="40" y1="110" x2="440" y2="110" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />

          {/* leaf nodes */}
          {points.map((pt, idx) => {
            const isHovered = hoveredIdx === idx;
            return (
              <g
                key={idx}
                transform={`translate(${pt.x}, ${pt.y})`}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* stem connector */}
                <path
                  d="M 0 0 Q -2 -6 -5 -10"
                  stroke="#5a7d5a"
                  strokeWidth="2"
                  fill="none"
                />
                {/* leaf shape */}
                <path
                  d="M -5 -10 C -11 -15 -6 -21 1 -16 C 5 -12 1 -5 -5 -10 Z"
                  fill={isHovered ? "#5a7d5a" : "#87a987"}
                  className="transition-colors duration-200"
                />
                
                {/* hover helper anchor */}
                <circle cx="0" cy="0" r="14" fill="transparent" />
              </g>
            );
          })}
        </svg>
      </div>

      {/* axis labels */}
      <div className="flex justify-between px-4 text-[9px] font-mono text-slate/50 mt-1 border-t border-slate-100/50 pt-2">
        {data.map((d, i) => (
          <span key={i}>{d.month}</span>
        ))}
      </div>
    </div>
  );
}
