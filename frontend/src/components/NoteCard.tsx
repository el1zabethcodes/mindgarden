"use client";

import React from "react";
import { Heart, Pencil, Trash2, Link2, Sprout, Leaf, TreeDeciduous } from "lucide-react";
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
    let cleanText = markdown
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
          <span className="flex items-center gap-1 px-2.5 py-1 bg-sage-light text-sage-dark text-[11px] font-semibold tracking-wider uppercase rounded-full border border-sage/15 font-sans">
            <Sprout className="w-3 h-3" /> seed
          </span>
        );
      case "growing":
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 bg-mint-light text-mint-dark text-[11px] font-semibold tracking-wider uppercase rounded-full border border-mint/25 font-sans">
            <Leaf className="w-3 h-3" /> growing
          </span>
        );
      case "evergreen":
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 bg-slate-light text-slate text-[11px] font-semibold tracking-wider uppercase rounded-full border border-slate/10 font-sans">
            <TreeDeciduous className="w-3 h-3" /> evergreen
          </span>
        );
      default:
        return null;
    }
  };

  // map mood color to background gradient styles
  const getMoodStyles = (color: string) => {
    switch (color) {
      case "sage":
        return "from-white/80 to-sage-light/30 border-sage/15";
      case "mint":
        return "from-white/80 to-mint-light/45 border-mint/30";
      case "slate":
        return "from-white/80 to-slate-light/45 border-slate/15";
      case "lavender_cool":
        return "from-white/80 to-purple-50/20 border-purple-100";
      case "peach":
        return "from-white/80 to-orange-50/25 border-orange-100";
      case "rose":
        return "from-white/80 to-pink-50/25 border-pink-100";
      default:
        return "from-white/80 to-white/70 border-slate-200/40";
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
