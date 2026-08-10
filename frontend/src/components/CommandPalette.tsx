"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "react-future"; // wait, standard framer-motion is fine
import { Search, Sparkles, Terminal, FileText, Layout, Network, PlusCircle } from "lucide-react";
import { Note } from "../lib/types";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  notes: Note[];
  onSelectNote: (id: string) => void;
  onPlantNote: () => void;
  onSwitchView: (view: "grid" | "board" | "graph") => void;
}

export default function CommandPalette({
  isOpen,
  onClose,
  notes,
  onSelectNote,
  onPlantNote,
  onSwitchView,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // handle keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  // click outside closure
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // filter notes and actions
  const actions = [
    { label: "Plant a new note", shortcut: "/new", icon: PlusCircle, action: () => { onPlantNote(); onClose(); } },
    { label: "Switch to Grid View", shortcut: "/grid", icon: FileText, action: () => { onSwitchView("grid"); onClose(); } },
    { label: "Switch to Kanban Board", shortcut: "/kanban", icon: Layout, action: () => { onSwitchView("board"); onClose(); } },
    { label: "Switch to Connection Graph", shortcut: "/graph", icon: Network, action: () => { onSwitchView("graph"); onClose(); } },
  ];

  const filteredActions = actions.filter((act) =>
    act.label.toLowerCase().includes(query.toLowerCase()) ||
    act.shortcut.toLowerCase().includes(query.toLowerCase())
  );

  const filteredNotes = notes.filter((n) =>
    n.title.toLowerCase().includes(query.toLowerCase()) ||
    (n.content && n.content.toLowerCase().includes(query.toLowerCase()))
  ).slice(0, 5);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-slate-950/20 backdrop-blur-sm">
      <div
        ref={containerRef}
        className="w-full max-w-xl bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/50 overflow-hidden flex flex-col max-h-[400px]"
      >
        {/* search bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
          <Search className="w-4 h-4 text-slate/50" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search notes... (e.g. /new, /graph)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent border-none text-charcoal placeholder-slate-400 focus:outline-none text-sm font-sans"
          />
          <button
            onClick={onClose}
            className="text-[10px] bg-slate-100 px-2 py-1 rounded font-mono text-slate border border-slate-200"
          >
            ESC
          </button>
        </div>

        {/* results area */}
        <div className="flex-1 overflow-y-auto p-2 space-y-3">
          {/* commands / quick actions */}
          {filteredActions.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-slate/40 flex items-center gap-1 font-sans">
                <Terminal className="w-3 h-3" /> Quick Actions
              </div>
              <div className="space-y-0.5 mt-1">
                {filteredActions.map((act, idx) => {
                  const Icon = act.icon;
                  return (
                    <button
                      key={idx}
                      onClick={act.action}
                      className="w-full text-left px-3 py-2 hover:bg-sage-light/50 rounded-xl flex items-center justify-between text-xs font-sans text-charcoal hover:text-sage-dark transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5 opacity-60" />
                        <span>{act.label}</span>
                      </div>
                      <span className="font-mono text-[10px] text-slate/45 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {act.shortcut}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* notes */}
          {filteredNotes.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-slate/40 flex items-center gap-1 font-sans">
                <Sparkles className="w-3 h-3" /> Notes & Thoughts
              </div>
              <div className="space-y-0.5 mt-1">
                {filteredNotes.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => {
                      onSelectNote(n.id);
                      onClose();
                    }}
                    className="w-full text-left px-3 py-2.5 hover:bg-sage-light/50 rounded-xl flex items-center justify-between text-xs font-sans text-charcoal hover:text-sage-dark transition-all cursor-pointer"
                  >
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="font-serif font-medium truncate text-sm">{n.title}</span>
                      <span className="font-mono text-[9px] text-slate/40">
                        {n.status} • {n.tags.map((t) => `#${t.name}`).join(" ")}
                      </span>
                    </div>
                    <span className="font-mono text-[9px] text-slate/30 shrink-0">
                      #{n.id.substring(0, 7)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredActions.length === 0 && filteredNotes.length === 0 && (
            <div className="text-center py-8 text-slate/40 text-xs font-sans">
              No matching notes or commands found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
