"use client";

import React from "react";
import { Heart, Pencil, Trash2, Link2 } from "lucide-react";
import { Note, NoteStatus } from "../lib/types";
import { formatRelativeTime } from "../lib/utils";

interface NoteCardProps {
  note: Note;
  linkedNotes: Array<{ id: string; title: string }>;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (note: Note) => void;
  onSelectNote: (id: string) => void;
}

export default function NoteCard({
  note,
  linkedNotes,
  onEdit,
  onDelete,
  onToggleFavorite,
  onSelectNote,
}: NoteCardProps) {
  // strip markdown characters for a clean preview snippet
  const getExcerpt = (markdown: string) => {
    if (!markdown) return "";
    const cleanText = markdown
      .replace(/[#*`_\-\[\]\(\)]/g, "") // remove md format chars
      .replace(/\n+/g, " ")             // replace newlines with space
      .trim();
    if (cleanText.length > 140) {
      return cleanText.substring(0, 137) + "...";
    }
    return cleanText;
  };

  // map status to badge
  const renderStatusBadge = (status: NoteStatus) => {
    switch (status) {
      case "seed":
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-sage-light/60 text-sage-dark text-[11px] font-semibold tracking-wider uppercase rounded-full border border-sage/10 font-sans">
            <span>🌱</span> seed
          </span>
        );
      case "growing":
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-mint-light/70 text-mint-dark text-[11px] font-semibold tracking-wider uppercase rounded-full border border-mint/20 font-sans">
            <span>🌿</span> growing
          </span>
        );
      case "evergreen":
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-light/80 text-slate text-[11px] font-semibold tracking-wider uppercase rounded-full border border-slate/10 font-sans">
            <span>🌳</span> evergreen
          </span>
        );
      default:
        return null;
    }
  };

  // map mood color to background gradient and soft glow border/shadow styles
  const getMoodStyles = (color: string) => {
    switch (color) {
      case "sage":
        return "from-white/70 to-sage-light/20 border-sage/10 hover:border-sage/35 hover:shadow-[0_12px_36px_rgba(135,169,135,0.06)]";
      case "mint":
        return "from-white/70 to-mint-light/35 border-mint/20 hover:border-mint-dark/40 hover:shadow-[0_12px_36px_rgba(188,227,197,0.12)]";
      case "slate":
        return "from-white/70 to-slate-light/35 border-slate/10 hover:border-slate/30 hover:shadow-[0_12px_36px_rgba(100,116,139,0.05)]";
      case "lavender_cool":
        return "from-white/70 to-purple-50/15 border-purple-100 hover:border-purple-250 hover:shadow-[0_12px_36px_rgba(192,132,252,0.08)]";
      case "peach":
        return "from-white/70 to-orange-50/15 border-orange-100 hover:border-orange-250 hover:shadow-[0_12px_36px_rgba(251,146,60,0.08)]";
      case "rose":
        return "from-white/70 to-pink-50/15 border-pink-100 hover:border-pink-250 hover:shadow-[0_12px_36px_rgba(244,114,182,0.08)]";
      default:
        return "from-white/70 to-white/60 border-slate-200/30 hover:shadow-[0_12px_36px_rgba(0,0,0,0.015)]";
    }
  };

  return (
    <div
      className={`relative flex flex-col justify-between h-full bg-gradient-to-br ${getMoodStyles(
        note.mood_color
      )} backdrop-blur-md shadow-garden border rounded-2xl p-6 transition-all duration-300 hover:scale-[1.015] hover:shadow-md group`}
    >
      <div>
        {/* status and fav */}
        <div className="flex items-center justify-between mb-4">
          {renderStatusBadge(note.status)}
          
          <button
            onClick={() => onToggleFavorite(note)}
            className={`p-1.5 rounded-full transition-colors cursor-pointer ${
              note.is_favorite 
                ? "bg-rose-50/80 text-rose-500 hover:bg-rose-100" 
                : "text-slate/40 hover:text-rose-400 hover:bg-slate-100/50"
            }`}
          >
            <Heart className="w-4 h-4 fill-current" />
          </button>
        </div>

        {/* note content */}
        <div className="cursor-pointer" onClick={() => onEdit(note)}>
          <h3 className="font-serif text-xl font-semibold text-charcoal mb-2 line-clamp-2 leading-snug">
            {note.title}
          </h3>
          <p className="text-slate text-sm font-sans font-light leading-relaxed line-clamp-3 mb-4">
            {getExcerpt(note.content) || <span className="italic text-slate/40">empty note...</span>}
          </p>
        </div>

        {/* tags list */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {note.tags.map((tag) => (
              <span
                key={tag.id}
                className="text-[11px] font-medium text-slate/70 bg-slate-100/60 px-2 py-0.5 rounded-full border border-slate-200/10 font-sans"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* footer details and connections */}
      <div className="mt-auto pt-4 border-t border-slate-100/60">
        {/* linked notes connections */}
        {linkedNotes.length > 0 && (
          <div className="mb-4">
            <div className="text-[10px] uppercase tracking-wider font-semibold text-slate/50 flex items-center gap-1 mb-1.5 font-sans">
              <Link2 className="w-3 h-3" /> connections
            </div>
            <div className="flex flex-wrap gap-1">
              {linkedNotes.map((lnk) => (
                <button
                  key={lnk.id}
                  onClick={() => onSelectNote(lnk.id)}
                  className="text-[10px] font-medium text-sage-dark bg-sage-light/50 border border-sage/10 px-2 py-0.5 rounded-full hover:bg-sage-light cursor-pointer transition-colors max-w-[120px] truncate font-sans"
                >
                  {lnk.title}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* time and actions */}
        <div className="flex items-center justify-between text-xs text-slate/50 font-sans">
          <span>tended {formatRelativeTime(note.updated_at)}</span>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={() => onEdit(note)}
              className="p-1.5 rounded-lg hover:bg-slate-100/70 hover:text-charcoal transition-colors cursor-pointer"
              title="edit note"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(note.id)}
              className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer"
              title="delete note"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
