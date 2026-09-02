"use client";

import { ChevronRight } from "lucide-react";

interface SidebarProps {
  currentNav: string;
  onNavChange: (nav: string) => void;
  progressPercent?: number;
}

export default function Sidebar({ currentNav, onNavChange, progressPercent = 75 }: SidebarProps) {
  const navItems = [
    { name: "Garden", label: "🌿 Garden" },
    { name: "Links", label: "🔗 Links" },
    { name: "Map", label: "🗺️ Map" },
    { name: "Tags", label: "🏷️ Tags" },
    { name: "Archive", label: "📦 Archive" },
    { name: "Settings", label: "⚙️ Settings" },
  ];

  return (
    <aside className="w-64 glass-panel glass-rail flex flex-col h-screen fixed left-0 top-0 z-30 p-6">
      {/* top branding */}
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-black text-sage-dark tracking-tight">
          Mindgarden
        </h1>
        <span className="text-[10px] uppercase font-bold tracking-widest text-slate/40 block mt-0.5">
          Elizaveta&apos;s Space
        </span>
      </div>

      {/* 3D clay mascot seedling */}
      <div className="flex flex-col items-center justify-center p-4 glass-inset mb-6">
        <svg viewBox="0 0 100 100" className="w-24 h-24 drop-shadow-md">
          <defs>
            <radialGradient id="clay-body" cx="35%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#fdfcfb" />
              <stop offset="25%" stopColor="#f3eae1" />
              <stop offset="70%" stopColor="#dec8b5" />
              <stop offset="100%" stopColor="#bfa38f" />
            </radialGradient>
            <radialGradient id="clay-leaf" cx="35%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#bce3c5" />
              <stop offset="50%" stopColor="#87a987" />
              <stop offset="100%" stopColor="#5a7d5a" />
            </radialGradient>
          </defs>
          <circle cx="50" cy="55" r="28" fill="url(#clay-body)" />
          <circle cx="38" cy="55" r="4.5" fill="#f43f5e" opacity="0.35" filter="blur(1px)" />
          <circle cx="62" cy="55" r="4.5" fill="#f43f5e" opacity="0.35" filter="blur(1px)" />
          <circle cx="44" cy="49" r="2.2" fill="#1e293b" />
          <circle cx="44.8" cy="47.8" r="0.7" fill="#ffffff" />
          <circle cx="56" cy="49" r="2.2" fill="#1e293b" />
          <circle cx="56.8" cy="47.8" r="0.7" fill="#ffffff" />
          <path d="M 47 56 Q 50 58 53 56" stroke="#1e293b" strokeWidth="1.2" strokeLinecap="round" fill="none" />
          <path d="M 50 27 Q 48 20 45 16" stroke="#5a7d5a" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M 45 16 C 36 10 40 4 48 8 C 55 12 52 18 45 16 Z" fill="url(#clay-leaf)" />
        </svg>
        <span className="text-[11px] font-medium text-sage-dark bg-sage-light px-2 py-0.5 rounded-full mt-2 font-sans">
          Clay Sprout
        </span>
      </div>

      {/* navigation menu */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = currentNav === item.name;
          return (
            <button
              key={item.name}
              onClick={() => onNavChange(item.name)}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all flex items-center justify-between font-sans cursor-pointer ${
                isActive
                  ? "bg-sage/15 text-sage-dark font-semibold border border-sage/10"
                  : "text-slate/75 hover:bg-slate-100/50 hover:text-charcoal"
              }`}
            >
              <span>{item.label}</span>
              {isActive && <ChevronRight className="w-3.5 h-3.5 text-sage-dark" />}
            </button>
          );
        })}
      </nav>

      {/* bottom widgets */}
      <div className="space-y-4 mt-auto">
        {/* quote card */}
        <div className="glass-inset p-3.5">
          <p className="font-serif italic text-xs text-sage-dark/95 leading-relaxed">
            &ldquo;Small seeds, great forests&rdquo;
          </p>
        </div>

        {/* daily progress */}
        <div className="glass-inset p-3.5">
          <div className="flex justify-between items-center text-[10px] font-sans font-bold uppercase tracking-wider text-slate/50 mb-1.5">
            <span>Daily growth</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-200/60 h-2 rounded-full overflow-hidden">
            <div
              className="bg-sage h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>
    </aside>
  );
}
