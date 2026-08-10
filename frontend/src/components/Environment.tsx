"use client";

import React, { useEffect, useState } from "react";

export default function Environment() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // generate deterministic fireflies with custom offsets/delays
  const fireflies = Array.from({ length: 12 }).map((_, idx) => ({
    id: idx,
    size: Math.random() * 6 + 4,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 80 + 10}%`,
    duration: `${Math.random() * 8 + 8}s`,
    delay: `${Math.random() * 5}s`,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* misty hills SVG background */}
      <svg
        className="absolute bottom-0 left-0 right-0 w-full h-48 opacity-15"
        preserveAspectRatio="none"
        viewBox="0 0 1440 200"
      >
        <path
          d="M0,160 Q360,100 720,150 T1440,120 L1440,200 L0,200 Z"
          fill="#87a987"
        />
        <path
          d="M0,180 Q400,140 800,180 T1440,160 L1440,200 L0,200 Z"
          fill="#5a7d5a"
          opacity="0.7"
        />
      </svg>

      {/* floating glowing fireflies */}
      {fireflies.map((ff) => (
        <div
          key={ff.id}
          className="absolute rounded-full bg-mint-dark/50 filter blur-[2px] animate-pulse"
          style={{
            width: `${ff.size}px`,
            height: `${ff.size}px`,
            left: ff.left,
            top: ff.top,
            animationDuration: ff.duration,
            animationDelay: ff.delay,
            animationIterationCount: "infinite",
            boxShadow: "0 0 8px 3px rgba(143, 207, 160, 0.4)",
          }}
        />
      ))}

      {/* botanical bottom edge decorations (pebbles and mushrooms) */}
      <div className="absolute bottom-0 left-0 right-0 h-16 w-full">
        {/* left botanical group */}
        <svg
          className="absolute bottom-0 left-12 w-28 h-20 opacity-80"
          viewBox="0 0 100 80"
        >
          {/* pebbles */}
          <ellipse cx="25" cy="72" rx="8" ry="4" fill="#64748b" opacity="0.6" />
          <ellipse cx="78" cy="74" rx="6" ry="3" fill="#64748b" opacity="0.5" />
          
          {/* mushroom 1 */}
          <path d="M 42 70 Q 42 45 45 45 Q 48 45 48 70" fill="#fdfcfb" />
          <path d="M 32 46 C 32 26 58 26 58 46 Z" fill="#f43f5e" />
          <circle cx="40" cy="36" r="1.5" fill="#ffffff" />
          <circle cx="50" cy="39" r="1" fill="#ffffff" />
          <circle cx="45" cy="43" r="0.8" fill="#ffffff" />
          
          {/* mushroom 2 (smaller) */}
          <path d="M 64 70 Q 64 55 67 55 Q 70 55 70 70" fill="#fdfcfb" />
          <path d="M 57 56 C 57 41 77 41 77 56 Z" fill="#87a987" />
          <circle cx="64" cy="48" r="0.8" fill="#ffffff" />
          <circle cx="70" cy="50" r="1" fill="#ffffff" />
        </svg>

        {/* right botanical group */}
        <svg
          className="absolute bottom-0 right-12 w-24 h-16 opacity-75"
          viewBox="0 0 100 80"
        >
          <ellipse cx="45" cy="72" rx="9" ry="4.5" fill="#64748b" opacity="0.55" />
          
          {/* mushroom 3 */}
          <path d="M 35 70 Q 35 50 38 50 Q 41 50 41 70" fill="#fdfcfb" />
          <path d="M 27 51 C 27 36 49 36 49 51 Z" fill="#7a977a" />
          <circle cx="34" cy="43" r="1" fill="#ffffff" />
          <circle cx="42" cy="45" r="0.8" fill="#ffffff" />
        </svg>
      </div>
    </div>
  );
}
