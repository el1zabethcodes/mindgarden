"use client";

import React, { useState } from "react";
import { Heart, Pencil, Trash2, Link2 } from "lucide-react";
import { Note, NoteStatus } from "../lib/types";
import { formatRelativeTime } from "../lib/utils";

interface NoteCardProps {
  note: Note;
  linkedNotes: Array<{ id: string; title: string; content: string }>;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (note: Note) => void;
  onSelectNote: (id: string) => void;
}

function ConnectionChip({
  lnk,
  onSelectNote,
  getExcerpt,
}: {
  lnk: { id: string; title: string; content: string };
  onSelectNote: (id: string) => void;
  getExcerpt: (md: string) => string;
}) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <div className="relative inline-block">
      <button
        onClick={() => onSelectNote(lnk.id)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="text-[10px] font-medium text-sage-dark bg-sage-light/50 border border-sage/10 px-2 py-0.5 rounded-full hover:bg-sage-light cursor-pointer transition-colors max-w-[120px] truncate font-sans"
      >
        {lnk.title}
      </button>

      {isHovered && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-[var(--glass-bg-strong)] backdrop-blur-xl p-3 border border-[var(--glass-border)] shadow-[var(--glass-shadow-lifted)] rounded-xl z-30 text-left pointer-events-none transition-all duration-200">
          <h4 className="font-serif text-[11px] font-bold text-charcoal mb-1">{lnk.title}</h4>
          <p className="text-[9px] text-slate/85 font-sans leading-relaxed line-clamp-4">
            {getExcerpt(lnk.content) || <span className="italic text-slate/40">empty content...</span>}
          </p>
        </div>
      )}
    </div>
  );
}

function ClayMascot({ title }: { title: string }) {
  const t = title.toLowerCase();
  
  if (t.includes("docker")) {
    return (
      <svg viewBox="0 0 100 80" className="w-14 h-14 drop-shadow-sm shrink-0 select-none">
        <defs>
          <radialGradient id="clay-body-docker" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#fefeff" />
            <stop offset="30%" stopColor="#dbeafe" />
            <stop offset="85%" stopColor="#93c5fd" />
            <stop offset="100%" stopColor="#3b82f6" />
          </radialGradient>
          <linearGradient id="docker-box" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
        </defs>
        <circle cx="35" cy="50" r="18" fill="url(#clay-body-docker)" />
        <circle cx="28" cy="50" r="3" fill="#f43f5e" opacity="0.3" filter="blur(0.5px)" />
        <circle cx="42" cy="50" r="3" fill="#f43f5e" opacity="0.3" filter="blur(0.5px)" />
        <circle cx="31" cy="46" r="1.5" fill="#1e293b" />
        <circle cx="39" cy="46" r="1.5" fill="#1e293b" />
        <path d="M 33 52 Q 35 53 37 52" stroke="#1e293b" strokeWidth="1" strokeLinecap="round" fill="none" />
        <path d="M 35 32 Q 34 26 31 23" stroke="#0284c7" strokeWidth="1.5" fill="none" />
        <path d="M 31 23 C 26 19 28 15 33 17 C 37 19 35 24 31 23 Z" fill="#38bdf8" />
        
        <rect x="58" y="40" width="22" height="18" rx="3" fill="url(#docker-box)" />
        <rect x="62" y="32" width="6" height="5" rx="1" fill="#0284c7" />
        <rect x="70" y="32" width="6" height="5" rx="1" fill="#0284c7" />
        <ellipse cx="69" cy="49" rx="7" ry="3" fill="#ffffff" opacity="0.8" />
      </svg>
    );
  }
  
  if (t.includes("tailwind")) {
    return (
      <svg viewBox="0 0 100 80" className="w-14 h-14 drop-shadow-sm shrink-0 select-none">
        <defs>
          <radialGradient id="clay-body-tw" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#fdfcfb" />
            <stop offset="30%" stopColor="#d1fae5" />
            <stop offset="85%" stopColor="#a7f3d0" />
            <stop offset="100%" stopColor="#34d399" />
          </radialGradient>
        </defs>
        <circle cx="35" cy="50" r="18" fill="url(#clay-body-tw)" />
        <circle cx="28" cy="50" r="3" fill="#f43f5e" opacity="0.3" filter="blur(0.5px)" />
        <circle cx="42" cy="50" r="3" fill="#f43f5e" opacity="0.3" filter="blur(0.5px)" />
        <circle cx="31" cy="46" r="1.5" fill="#1e293b" />
        <circle cx="39" cy="46" r="1.5" fill="#1e293b" />
        <path d="M 33 52 Q 35 53 37 52" stroke="#1e293b" strokeWidth="1" strokeLinecap="round" fill="none" />
        <path d="M 35 32 Q 34 26 31 23" stroke="#047857" strokeWidth="1.5" fill="none" />
        <path d="M 31 23 C 26 19 28 15 33 17 C 37 19 35 24 31 23 Z" fill="#34d399" />
        
        <g opacity="0.8">
          <rect x="58" y="44" width="22" height="15" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
          <rect x="61" y="40" width="22" height="15" rx="2" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1" />
          <rect x="64" y="36" width="22" height="15" rx="2" fill="#e2e8f0" stroke="#64748b" strokeWidth="1" />
        </g>
      </svg>
    );
  }
  
  if (t.includes("sql") || t.includes("index")) {
    return (
      <svg viewBox="0 0 100 80" className="w-14 h-14 drop-shadow-sm shrink-0 select-none">
        <defs>
          <radialGradient id="clay-body-sql" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#fdfcfb" />
            <stop offset="30%" stopColor="#fef3c7" />
            <stop offset="85%" stopColor="#fde68a" />
            <stop offset="100%" stopColor="#f59e0b" />
          </radialGradient>
        </defs>
        <circle cx="35" cy="50" r="18" fill="url(#clay-body-sql)" />
        <circle cx="28" cy="50" r="3" fill="#f43f5e" opacity="0.3" filter="blur(0.5px)" />
        <circle cx="42" cy="50" r="3" fill="#f43f5e" opacity="0.3" filter="blur(0.5px)" />
        
        <circle cx="31" cy="46" r="4.5" stroke="#1e293b" strokeWidth="1" fill="none" />
        <circle cx="39" cy="46" r="4.5" stroke="#1e293b" strokeWidth="1" fill="none" />
        <line x1="35.5" y1="46" x2="36.5" y2="46" stroke="#1e293b" strokeWidth="1.2" />
        <circle cx="31" cy="46" r="1" fill="#1e293b" />
        <circle cx="39" cy="46" r="1" fill="#1e293b" />
        
        <path d="M 33 54 Q 35 55 37 54" stroke="#1e293b" strokeWidth="1" strokeLinecap="round" fill="none" />
        <path d="M 35 32 Q 34 26 31 23" stroke="#b45309" strokeWidth="1.5" fill="none" />
        <path d="M 31 23 C 26 19 28 15 33 17 C 37 19 35 24 31 23 Z" fill="#fbbf24" />
        
        <path d="M 56 46 L 70 42 L 78 48 L 64 52 Z" fill="#b91c1c" />
        <path d="M 58 48 L 70 44 L 76 49 L 64 53 Z" fill="#ffffff" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 100 80" className="w-12 h-12 drop-shadow-sm shrink-0 select-none">
      <defs>
        <radialGradient id="clay-body-default" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#fdfcfb" />
          <stop offset="30%" stopColor="#f1f5f9" />
          <stop offset="85%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#94a3b8" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="45" r="18" fill="url(#clay-body-default)" />
      <circle cx="43" cy="45" r="3" fill="#f43f5e" opacity="0.35" filter="blur(0.5px)" />
      <circle cx="57" cy="45" r="3" fill="#f43f5e" opacity="0.35" filter="blur(0.5px)" />
      <circle cx="46" cy="41" r="1.5" fill="#1e293b" />
      <circle cx="54" cy="41" r="1.5" fill="#1e293b" />
      <path d="M 48 47 Q 50 48 52 47" stroke="#1e293b" strokeWidth="1" strokeLinecap="round" fill="none" />
      <path d="M 50 27 Q 48 22 45 19" stroke="#64748b" strokeWidth="1.5" fill="none" />
      <path d="M 45 19 C 41 16 42 12 47 14 C 51 16 49 20 45 19 Z" fill="#cbd5e1" />
    </svg>
  );
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

  // map mood color to a tinted glass edge and a matching hover glow
  const getMoodStyles = (color: string) => {
    switch (color) {
      case "sage":
        return "border-sage/15 hover:border-sage/40 hover:shadow-[0_18px_48px_rgba(135,169,135,0.16)]";
      case "mint":
        return "border-mint/25 hover:border-mint-dark/45 hover:shadow-[0_18px_48px_rgba(143,207,160,0.18)]";
      case "slate":
        return "border-slate/15 hover:border-slate/35 hover:shadow-[0_18px_48px_rgba(100,116,139,0.12)]";
      case "lavender_cool":
        return "border-purple-200/60 hover:border-purple-300 hover:shadow-[0_18px_48px_rgba(192,132,252,0.14)]";
      case "peach":
        return "border-orange-200/60 hover:border-orange-300 hover:shadow-[0_18px_48px_rgba(251,146,60,0.14)]";
      case "rose":
        return "border-pink-200/60 hover:border-pink-300 hover:shadow-[0_18px_48px_rgba(244,114,182,0.14)]";
      default:
        return "border-[var(--glass-border-soft)] hover:border-[var(--glass-border)]";
    }
  };

  return (
    <div
      className={`relative flex flex-col justify-between h-full glass-card ${getMoodStyles(
        note.mood_color
      )} p-6 transition-all duration-300 hover:scale-[1.015] group`}
    >
      <div>
        {/* status and fav */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {renderStatusBadge(note.status)}
            <span className="font-mono text-[9px] text-slate/40 bg-slate-light/70 px-1.5 py-0.5 rounded border border-slate/10">
              #{note.id.substring(0, 7)}
            </span>
          </div>
          
          <button
            onClick={() => onToggleFavorite(note)}
            aria-label={note.is_favorite ? "remove from favorites" : "add to favorites"}
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
        <div className="cursor-pointer flex justify-between items-start gap-4 mb-4" onClick={() => onEdit(note)}>
          <div className="flex-1">
            <h3 className="font-serif text-xl font-semibold text-charcoal mb-2 line-clamp-2 leading-snug">
              {note.title}
            </h3>
            <p className="text-slate text-sm font-sans font-light leading-relaxed line-clamp-3">
              {getExcerpt(note.content) || <span className="italic text-slate/40">empty note...</span>}
            </p>
          </div>
          <ClayMascot title={note.title} />
        </div>

        {/* tags list */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {note.tags.map((tag) => (
              <span
                key={tag.id}
                className="text-[11px] font-medium text-slate/70 bg-slate-light/70 px-2 py-0.5 rounded-full border border-slate/10 font-sans"
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
                <ConnectionChip
                  key={lnk.id}
                  lnk={lnk}
                  onSelectNote={onSelectNote}
                  getExcerpt={getExcerpt}
                />
              ))}
            </div>
          </div>
        )}

        {/* time and actions */}
        <div className="flex items-center justify-between text-xs text-slate/50 font-sans">
          <div className="flex items-center gap-1.5 font-mono text-[9px] text-slate/45">
            <span>tended {formatRelativeTime(note.updated_at)}</span>
            <span>•</span>
            <span>{note.linked_note_ids?.length || 0} links</span>
            <span>•</span>
            <span>{Math.max(1, Math.ceil((note.content || "").split(/\s+/).length / 150))}m read</span>
          </div>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={() => onEdit(note)}
              aria-label={`edit note ${note.title}`}
              className="p-1.5 rounded-lg hover:bg-slate-100/70 hover:text-charcoal transition-colors cursor-pointer"
              title="edit note"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(note.id)}
              aria-label={`delete note ${note.title}`}
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
