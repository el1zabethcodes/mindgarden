"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../lib/api";
import { Note, Tag, NoteCreate, NoteUpdate, NoteStatus } from "../lib/types";
import { Sprout, Leaf, TreeDeciduous } from "lucide-react";
import Header from "../components/Header";
import TagFilter from "../components/TagFilter";
import NoteCard from "../components/NoteCard";
import Drawer from "../components/Drawer";
import EmptyState from "../components/EmptyState";
import ActivityCalendar from "../components/ActivityCalendar";
import KanbanBoard from "../components/KanbanBoard";
import ConnectionGraph from "../components/ConnectionGraph";
import CommandPalette from "../components/CommandPalette";
import Sidebar from "../components/Sidebar";
import Environment from "../components/Environment";
import GrowthChart from "../components/GrowthChart";
import OnboardingTour from "../components/OnboardingTour";
import MoodStrip from "../components/MoodStrip";
import Dashboard from "../components/Dashboard";
import HabitsPanel from "../components/HabitsPanel";

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  
  // filters
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // presets & active nav
  const [selectedPreset, setSelectedPreset] = useState<"all" | "orphan" | "hub" | "code">("all");
  const [currentNav, setCurrentNav] = useState("Garden");

  // view modes
  const [viewMode, setViewMode] = useState<"grid" | "board" | "graph">("grid");

  // modals
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 250);
    return () => clearTimeout(t);
  }, [search]);

  // fetch data
  const refreshData = React.useCallback(async () => {
    try {
      const activeStatus = status === "all" ? undefined : status;
      const activeTag = selectedTag || undefined;
      
      const [fetchedNotes, fetchedTags] = await Promise.all([
        api.getNotes({
          search: debouncedSearch || undefined,
          status: activeStatus,
          tag: activeTag,
        }),
        api.getTags(),
      ]);

      setNotes(fetchedNotes);
      setTags(fetchedTags);
    } catch (err) {
      console.error("error fetching mindgarden data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, status, selectedTag]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // hotkeys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handlePlantNote = () => {
    setActiveNote(null);
    setIsDrawerOpen(true);
  };

  const handleEditNote = (note: Note) => {
    setActiveNote(note);
    setIsDrawerOpen(true);
  };

  const handleDeleteNote = async (id: string) => {
    if (confirm("Are you sure you want to delete this seed of thought?")) {
      try {
        await api.deleteNote(id);
        await refreshData();
      } catch (err) {
        console.error("failed to delete note:", err);
      }
    }
  };

  const handleToggleFavorite = async (note: Note) => {
    try {
      await api.updateNote(note.id, { is_favorite: !note.is_favorite });
      await refreshData();
    } catch (err) {
      console.error("failed to toggle favorite status:", err);
    }
  };

  const handleMoveNote = async (id: string, newStatus: NoteStatus) => {
    try {
      await api.updateNote(id, { status: newStatus });
      await refreshData();
    } catch (err) {
      console.error("failed to update note status:", err);
    }
  };

  const handleSaveNote = async (data: NoteCreate | NoteUpdate) => {
    try {
      if (activeNote) {
        await api.updateNote(activeNote.id, data as NoteUpdate);
      } else {
        await api.createNote(data as NoteCreate);
      }
      setIsDrawerOpen(false);
      await refreshData();
    } catch (err) {
      console.error("failed to save note:", err);
    }
  };

  const handleSelectLinkedNote = async (id: string) => {
    try {
      const note = await api.getNote(id);
      setActiveNote(note);
      setIsDrawerOpen(true);
    } catch (err) {
      console.error("could not open linked note:", err);
    }
  };

  // stats
  const totalCount = notes.length;
  const seedCount = notes.filter((n) => n.status === "seed").length;
  const growingCount = notes.filter((n) => n.status === "growing").length;
  const evergreenCount = notes.filter((n) => n.status === "evergreen").length;

  // client side filter presets
  const finalDisplayNotes = notes.filter((n) => {
    if (selectedPreset === "orphan") {
      return !n.linked_note_ids || n.linked_note_ids.length === 0;
    }
    if (selectedPreset === "hub") {
      return n.linked_note_ids && n.linked_note_ids.length > 2;
    }
    if (selectedPreset === "code") {
      return n.content && n.content.includes("```");
    }
    return true;
  });

  const allNotesCompact = notes.map((n) => ({ id: n.id, title: n.title }));

  return (
    <div className="min-h-screen bg-transparent pb-32 relative">
      {/* background animations and decorative shapes */}
      <Environment />

      {/* left glass navigation sidebar */}
      <Sidebar
        currentNav={currentNav}
        onNavChange={setCurrentNav}
        progressPercent={Math.min(100, Math.round((evergreenCount / Math.max(1, totalCount)) * 100))}
      />

      {/* main content (offset by sidebar width) */}
      <div className="pl-64 z-10 relative">
        
        {/* Header containing welcome greetings */}
        <Header
          notesCount={totalCount}
          seedCount={seedCount}
          growingCount={growingCount}
          evergreenCount={evergreenCount}
          searchQuery={search}
          onSearchChange={setSearch}
          selectedStatus={status}
          onStatusChange={setStatus}
          onPlantNote={handlePlantNote}
          onToggleCommandPalette={() => setIsCommandPaletteOpen((prev) => !prev)}
        />

        {/* Analytics and interactive charts row */}
        {currentNav === "Growth" ? (
          <Dashboard />
        ) : (
        <>
        <div className="w-full max-w-7xl mx-auto px-6 mb-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* stats widgets container */}
          <div className="lg:col-span-2 glass-panel p-5 flex flex-col justify-between">
            <span className="text-slate text-[10px] uppercase tracking-wider font-bold font-sans">
              Garden Analytics
            </span>
            <div className="grid grid-cols-3 gap-4 mt-3">
              <button
                onClick={() => setStatus(status === "seed" ? "all" : "seed")}
                className={`p-4 rounded-2xl border transition-all text-left ${
                  status === "seed" ? "bg-sage/15 border-sage/30 shadow-sm" : "bg-slate-50/50 border-slate-200/10 hover:bg-white"
                }`}
              >
                <div className="text-[10px] uppercase font-bold text-slate/50 flex items-center gap-1 font-sans">
                  <Sprout className="w-3.5 h-3.5 text-sage" /> Seed
                </div>
                <div className="font-serif text-3xl font-black text-charcoal mt-1">{seedCount}</div>
              </button>

              <button
                onClick={() => setStatus(status === "growing" ? "all" : "growing")}
                className={`p-4 rounded-2xl border transition-all text-left ${
                  status === "growing" ? "bg-sage/15 border-sage/30 shadow-sm" : "bg-slate-50/50 border-slate-200/10 hover:bg-white"
                }`}
              >
                <div className="text-[10px] uppercase font-bold text-slate/50 flex items-center gap-1 font-sans">
                  <Leaf className="w-3.5 h-3.5 text-sage-medium" /> Growing
                </div>
                <div className="font-serif text-3xl font-black text-charcoal mt-1">{growingCount}</div>
              </button>

              <button
                onClick={() => setStatus(status === "evergreen" ? "all" : "evergreen")}
                className={`p-4 rounded-2xl border transition-all text-left ${
                  status === "evergreen" ? "bg-sage/15 border-sage/30 shadow-sm" : "bg-slate-50/50 border-slate-200/10 hover:bg-white"
                }`}
              >
                <div className="text-[10px] uppercase font-bold text-slate/50 flex items-center gap-1 font-sans">
                  <TreeDeciduous className="w-3.5 h-3.5 text-sage-dark" /> Evergreen
                </div>
                <div className="font-serif text-3xl font-black text-charcoal mt-1">{evergreenCount}</div>
              </button>
            </div>
            
            {/* simple layout view switchers and calendar logs */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100/50">
              <ActivityCalendar />
              
              <div className="glass-inset p-1 flex gap-1 text-xs font-sans">
                {(["grid", "board", "graph"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer font-medium uppercase tracking-wider text-[10px] ${
                      viewMode === mode
                        ? "bg-white/70 text-charcoal shadow-sm font-semibold border border-[var(--glass-border)]"
                        : "text-slate/60 hover:text-slate"
                    }`}
                  >
                    {mode === "grid" && "Grid"}
                    {mode === "board" && "Board"}
                    {mode === "graph" && "Graph"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive SVG Leaf-Node Growth Trend Chart */}
          <GrowthChart />
        </div>

        {/* Filter presets bar */}
        <MoodStrip />

        <HabitsPanel />

        <div className="w-full max-w-7xl mx-auto px-6 mb-6 flex flex-wrap gap-2 text-xs font-sans">
          <span className="text-slate/40 flex items-center font-bold mr-1 uppercase tracking-wider text-[9px]">Filters:</span>
          {(["all", "orphan", "hub", "code"] as const).map((preset) => (
            <button
              key={preset}
              onClick={() => setSelectedPreset(preset)}
              className={`px-3 py-1.5 rounded-full border transition-all cursor-pointer text-[10px] font-semibold uppercase tracking-wider ${
                selectedPreset === preset
                  ? "bg-sage text-white border-sage font-semibold shadow-sm"
                  : "bg-[var(--glass-bg)] backdrop-blur-md text-slate border-[var(--glass-border-soft)] hover:bg-[var(--glass-bg-strong)]"
              }`}
            >
              {preset === "all" && "All"}
              {preset === "orphan" && "🕸️ Orphans"}
              {preset === "hub" && "🐙 Hubs"}
              {preset === "code" && "💻 Code"}
            </button>
          ))}
        </div>

        {/* tags list bar */}
        <TagFilter
          tags={tags}
          selectedTag={selectedTag}
          onSelectTag={setSelectedTag}
        />

        {/* main layout renders */}
        <main className="w-full max-w-7xl mx-auto px-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <span className="text-slate text-sm font-sans flex items-center gap-2 animate-pulse">
                <span className="w-2.5 h-2.5 rounded-full bg-sage"></span>
                Tending garden...
              </span>
            </div>
          ) : finalDisplayNotes.length === 0 ? (
            <EmptyState onPlantNote={handlePlantNote} />
          ) : viewMode === "board" ? (
            <KanbanBoard
              notes={finalDisplayNotes}
              onMoveNote={handleMoveNote}
              onEdit={handleEditNote}
              onDelete={handleDeleteNote}
              onToggleFavorite={handleToggleFavorite}
              onSelectNote={handleSelectLinkedNote}
            />
          ) : viewMode === "graph" ? (
            <ConnectionGraph
              notes={finalDisplayNotes}
              onSelectNote={handleSelectLinkedNote}
            />
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {finalDisplayNotes.map((note) => {
                  const linkedNotes = note.linked_note_ids
                    ? note.linked_note_ids
                        .map((id) => {
                          const match = notes.find((n) => n.id === id);
                          return match ? { id: match.id, title: match.title, content: match.content } : null;
                        })
                        .filter((n): n is { id: string; title: string; content: string } => n !== null)
                    : [];

                  return (
                    <motion.div
                      key={note.id}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.25 }}
                    >
                      <NoteCard
                        note={note}
                        linkedNotes={linkedNotes}
                        onEdit={handleEditNote}
                        onDelete={handleDeleteNote}
                        onToggleFavorite={handleToggleFavorite}
                        onSelectNote={handleSelectLinkedNote}
                      />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </main>
        </>
        )}
      </div>

      {/* footer floating glass banner */}
      <footer className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20 glass-chip px-6 py-3 font-serif italic text-xs text-sage-dark select-none text-center">
        “A garden is never finished, it is always just beginning.”
      </footer>

      {/* drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        note={activeNote}
        onClose={() => setIsDrawerOpen(false)}
        onSave={handleSaveNote}
        allNotes={allNotesCompact}
      />

      {/* command palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        notes={notes}
        onSelectNote={handleSelectLinkedNote}
        onPlantNote={handlePlantNote}
        onSwitchView={setViewMode}
      />

      {/* interactive tour */}
      <OnboardingTour />
    </div>
  );
}
