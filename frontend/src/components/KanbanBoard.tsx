"use client";

import React, { useState } from "react";
import { Note, NoteStatus } from "../lib/types";
import NoteCard from "./NoteCard";

interface KanbanBoardProps {
  notes: Note[];
  onMoveNote: (id: string, newStatus: NoteStatus) => Promise<void>;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (note: Note) => void;
  onSelectNote: (id: string) => void;
}

const columns: { status: NoteStatus; label: string; emoji: string; bg: string; text: string }[] = [
  { status: "seed", label: "Seeds", emoji: "🌱", bg: "bg-sage-light/30 border-sage/10", text: "text-sage-dark" },
  { status: "growing", label: "Growing", emoji: "🌿", bg: "bg-mint-light/40 border-mint/20", text: "text-mint-dark" },
  { status: "evergreen", label: "Evergreen", emoji: "🌳", bg: "bg-slate-light/60 border-slate/10", text: "text-slate" },
];

export default function KanbanBoard({
  notes,
  onMoveNote,
  onEdit,
  onDelete,
  onToggleFavorite,
  onSelectNote,
}: KanbanBoardProps) {
  const [activeDragCol, setActiveDragCol] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, colStatus: string) => {
    e.preventDefault();
    setActiveDragCol(colStatus);
  };

  const handleDragLeave = () => {
    setActiveDragCol(null);
  };

  const handleDrop = async (e: React.DragEvent, colStatus: NoteStatus) => {
    e.preventDefault();
    setActiveDragCol(null);
    const noteId = e.dataTransfer.getData("text/plain");
    if (noteId) {
      await onMoveNote(noteId, colStatus);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      {columns.map((col) => {
        const colNotes = notes.filter((n) => n.status === col.status);
        const isDraggingOver = activeDragCol === col.status;

        return (
          <div
            key={col.status}
            onDragOver={(e) => handleDragOver(e, col.status)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col.status)}
            className={`flex flex-col min-h-[500px] rounded-3xl border p-5 transition-all duration-300 ${col.bg} ${
              isDraggingOver ? "ring-2 ring-sage/30 scale-[1.005]" : ""
            }`}
          >
            {/* column header */}
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{col.emoji}</span>
                <h3 className={`font-serif text-lg font-bold ${col.text}`}>{col.label}</h3>
              </div>
              <span className="text-xs bg-white/70 backdrop-blur-md px-2 py-0.5 rounded-full border border-slate-200/20 text-slate font-medium font-sans">
                {colNotes.length}
              </span>
            </div>

            {/* notes list */}
            <div className="flex flex-col gap-4 flex-1">
              {colNotes.map((note) => {
                // map linked note ids to titles for chips
                const linkedNotes = note.linked_note_ids
                  ? note.linked_note_ids
                      .map((id) => {
                        const match = notes.find((n) => n.id === id);
                        return match ? { id: match.id, title: match.title } : null;
                      })
                      .filter((n): n is { id: string; title: string } => n !== null)
                  : [];

                return (
                  <div
                    key={note.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, note.id)}
                    className="cursor-grab active:cursor-grabbing hover:scale-[1.005] transition-transform duration-200"
                  >
                    <NoteCard
                      note={note}
                      linkedNotes={linkedNotes}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onToggleFavorite={onToggleFavorite}
                      onSelectNote={onSelectNote}
                    />
                  </div>
                );
              })}

              {colNotes.length === 0 && (
                <div className="flex-1 flex items-center justify-center border-2 border-dashed border-slate-300/10 rounded-2xl p-8 text-center text-slate/40 text-xs py-16 font-sans">
                  drag notes here to tend
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
