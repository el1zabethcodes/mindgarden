"use client";

import React from "react";
import { Search, Sprout, Leaf, TreeDeciduous, Plus } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

interface HeaderProps {
  notesCount: number;
  seedCount: number;
  growingCount: number;
  evergreenCount: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  onPlantNote: () => void;
  onToggleCommandPalette: () => void;
}

export default function Header({
  notesCount,
  seedCount,
  growingCount,
  evergreenCount,
  searchQuery,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  onPlantNote,
  onToggleCommandPalette,
}: HeaderProps) {
  return (
    <header className="w-full max-w-7xl mx-auto px-4 pt-10 pb-6">
      {/* top brand and cta */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl text-charcoal tracking-tight font-bold">
            Good morning, Elizaveta 🌿
          </h1>
          <p className="text-slate text-sm mt-1 font-sans font-light">
            Let’s grow something wonderful today.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <ThemeToggle />
          <button
            onClick={onPlantNote}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-sage hover:bg-sage-medium text-white font-medium rounded-full shadow-garden transition-all duration-300 hover:scale-[1.01]"
          >
            <Plus className="w-4 h-4" />
            <span>Plant Note</span>
          </button>
        </div>
      </div>

      {/* stats dashboard */}
      <div className="grid grid-cols-3 md:flex items-center gap-3 md:gap-4 mb-8">
        <button
          onClick={() => onStatusChange("all")}
          className={`flex-1 md:flex-none px-4 py-3 rounded-2xl transition-all duration-200 text-left md:min-w-[120px] ${
            selectedStatus === "all"
              ? "bg-[var(--glass-bg-strong)] border border-[var(--glass-border)] shadow-[var(--glass-shadow)]"
              : "hover:bg-[var(--glass-bg)]"
          }`}
        >
          <div className="text-slate text-xs uppercase tracking-wider font-semibold font-sans">All</div>
          <div className="text-charcoal font-serif text-xl font-bold mt-1">{notesCount}</div>
        </button>

        <button
          onClick={() => onStatusChange("seed")}
          className={`flex-grow md:flex-none px-4 py-3 rounded-2xl transition-all duration-200 text-left md:min-w-[120px] ${
            selectedStatus === "seed"
              ? "bg-[var(--glass-bg-strong)] border border-[var(--glass-border)] shadow-[var(--glass-shadow)]"
              : "hover:bg-[var(--glass-bg)]"
          }`}
        >
          <div className="text-slate text-xs uppercase tracking-wider font-semibold flex items-center gap-1 font-sans">
            <Sprout className="w-3.5 h-3.5 text-sage" /> Seed
          </div>
          <div className="text-charcoal font-serif text-xl font-bold mt-1">{seedCount}</div>
        </button>

        <button
          onClick={() => onStatusChange("growing")}
          className={`flex-grow md:flex-none px-4 py-3 rounded-2xl transition-all duration-200 text-left md:min-w-[120px] ${
            selectedStatus === "growing"
              ? "bg-[var(--glass-bg-strong)] border border-[var(--glass-border)] shadow-[var(--glass-shadow)]"
              : "hover:bg-[var(--glass-bg)]"
          }`}
        >
          <div className="text-slate text-xs uppercase tracking-wider font-semibold flex items-center gap-1 font-sans">
            <Leaf className="w-3.5 h-3.5 text-sage-medium" /> Growing
          </div>
          <div className="text-charcoal font-serif text-xl font-bold mt-1">{growingCount}</div>
        </button>

        <button
          onClick={() => onStatusChange("evergreen")}
          className={`flex-grow md:flex-none px-4 py-3 rounded-2xl transition-all duration-200 text-left md:min-w-[120px] ${
            selectedStatus === "evergreen"
              ? "bg-[var(--glass-bg-strong)] border border-[var(--glass-border)] shadow-[var(--glass-shadow)]"
              : "hover:bg-[var(--glass-bg)]"
          }`}
        >
          <div className="text-slate text-xs uppercase tracking-wider font-semibold flex items-center gap-1 font-sans">
            <TreeDeciduous className="w-3.5 h-3.5 text-sage-dark" /> Evergreen
          </div>
          <div className="text-charcoal font-serif text-xl font-bold mt-1">{evergreenCount}</div>
        </button>
      </div>

      {/* search and controls */}
      <div className="relative w-full">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate" />
        <input
          type="text"
          placeholder="Search thoughts, links, and ideas..."
          aria-label="search notes"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-11 pr-16 py-3.5 bg-[var(--glass-bg)] backdrop-blur-md focus:bg-[var(--glass-bg-strong)] border border-[var(--glass-border-soft)] rounded-2xl focus:outline-none focus:ring-1 focus:ring-sage/40 shadow-sm transition-all text-sm text-charcoal font-sans"
        />
        <button
          onClick={onToggleCommandPalette}
          className="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-1 text-[10px] bg-slate-light/80 hover:bg-slate-light text-slate border border-slate/10 rounded font-mono flex items-center gap-0.5 cursor-pointer shadow-sm transition-all"
          title="open command palette (Cmd+K)"
        >
          <span>⌘</span><span>K</span>
        </button>
      </div>
    </header>
  );
}
