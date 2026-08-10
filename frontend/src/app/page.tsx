"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../lib/api";
import { Note, Tag, NoteCreate, NoteUpdate, NoteStatus } from "../lib/types";
import Header from "../components/Header";
import TagFilter from "../components/TagFilter";
import NoteCard from "../components/NoteCard";
import Drawer from "../components/Drawer";
import EmptyState from "../components/EmptyState";
import ActivityCalendar from "../components/ActivityCalendar";
import KanbanBoard from "../components/KanbanBoard";
import ConnectionGraph from "../components/ConnectionGraph";
import CommandPalette from "../components/CommandPalette";
import OnboardingTour from "../components/OnboardingTour";

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  
  // filters
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // presets filter: "all" | "orphan" | "hub" | "code"
  const [selectedPreset, setSelectedPreset] = useState<"all" | "orphan" | "hub" | "code">("all");

  // view modes
  const [viewMode, setViewMode] = useState<"grid" | "board" | "graph">("grid");

  // command palette modal state
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // drawer state
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // debounce search queries
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
    }, 250);
    return () => clearTimeout(t);
  }, [search]);

  // fetch data function
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

  // refresh notes when filters change
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // global shortcut Ctrl+K / Cmd+K to open Command Palette
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

  // CRUD handlers
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

  // navigate when clicking internal link chip
  const handleSelectLinkedNote = async (id: string) => {
    try {
      const note = await api.getNote(id);
      setActiveNote(note);
      setIsDrawerOpen(true);
    } catch (err) {
      console.error("could not open linked note:", err);
    }
  };

  // stats calculation
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

  // mapping title for connections chip display
  const allNotesCompact = notes.map((n) => ({ id: n.id, title: n.title }));

  return (
    <div className="min-h-screen bg-pearl pb-20 selection:bg-sage-light selection:text-sage-dark">
      {/* navigation and header */}
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

      {/* activity dashboard row */}
      <div className="w-full max-w-7xl mx-auto px-4 mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6">
        <ActivityCalendar notes={notes} />
        
        {/* view mode selector */}
        <div className="bg-white/60 backdrop-blur-md border border-slate-200/40 p-1.5 rounded-2xl flex gap-1 shadow-garden self-end md:self-auto font-sans text-xs">
          {(["grid", "board", "graph"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer font-medium uppercase tracking-wider ${
                viewMode === mode
                  ? "bg-white text-charcoal shadow-sm font-semibold border border-slate-200/10"
                  : "text-slate/60 hover:text-slate"
              }`}
            >
              {mode === "grid" && "🎛️ Grid"}
              {mode === "board" && "📋 Kanban"}
              {mode === "graph" && "🕸️ Graph"}
            </button>
          ))}
        </div>
      </div>

      {/* filter presets row */}
      <div className="w-full max-w-7xl mx-auto px-4 mb-6 flex flex-wrap gap-2 text-xs font-sans">
        <span className="text-slate/40 flex items-center font-medium mr-1 uppercase tracking-wider text-[10px]">Filter Presets:</span>
        {(["all", "orphan", "hub", "code"] as const).map((preset) => (
          <button
            key={preset}
            onClick={() => setSelectedPreset(preset)}
            className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer text-[11px] ${
              selectedPreset === preset
                ? "bg-sage text-white border-sage font-medium shadow-sm"
                : "bg-white/70 text-slate border-slate-200/50 hover:bg-white"
            }`}
          >
            {preset === "all" && "✨ All Notes"}
            {preset === "orphan" && "🕸️ Orphan Notes (0 links)"}
            {preset === "hub" && "🐙 Hub Notes (>2 links)"}
            {preset === "code" && "💻 Code Snippets"}
          </button>
        ))}
      </div>

      {/* tag strip */}
      <TagFilter
        tags={tags}
        selectedTag={selectedTag}
        onSelectTag={setSelectedTag}
      />

      {/* main content grid / board / graph */}
      <main className="w-full max-w-7xl mx-auto px-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <span className="text-slate text-sm font-sans flex items-center gap-2 animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-sage"></span>
              Tending the garden...
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
                // map linked note ids to titles
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

      {/* creation/editing panel */}
      <Drawer
        isOpen={isDrawerOpen}
        note={activeNote}
        onClose={() => setIsDrawerOpen(false)}
        onSave={handleSaveNote}
        allNotes={allNotesCompact}
      />

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        notes={notes}
        onSelectNote={handleSelectLinkedNote}
        onPlantNote={handlePlantNote}
        onSwitchView={setViewMode}
      />

      <OnboardingTour />
    </div>
  );
}
