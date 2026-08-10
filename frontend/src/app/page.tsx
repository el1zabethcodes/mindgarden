"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../lib/api";
import { Note, Tag, NoteCreate, NoteUpdate } from "../lib/types";
import Header from "../components/Header";
import TagFilter from "../components/TagFilter";
import NoteCard from "../components/NoteCard";
import Drawer from "../components/Drawer";
import EmptyState from "../components/EmptyState";

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  
  // filters
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

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
      />

      {/* tag strip */}
      <TagFilter
        tags={tags}
        selectedTag={selectedTag}
        onSelectTag={setSelectedTag}
      />

      {/* main content grid */}
      <main className="w-full max-w-7xl mx-auto px-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <span className="text-slate text-sm font-sans flex items-center gap-2 animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-sage"></span>
              Tending the garden...
            </span>
          </div>
        ) : notes.length === 0 ? (
          <EmptyState onPlantNote={handlePlantNote} />
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {notes.map((note) => {
                // map linked note ids to titles
                const linkedNotes = note.linked_note_ids
                  ? note.linked_note_ids
                      .map((id) => {
                        const match = notes.find((n) => n.id === id);
                        return match ? { id: match.id, title: match.title } : null;
                      })
                      .filter((n): n is { id: string; title: string } => n !== null)
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
    </div>
  );
}
