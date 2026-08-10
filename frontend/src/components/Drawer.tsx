"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, Edit3, Hash, Link2, HelpCircle, Layout, List } from "lucide-react";
import { Note, NoteStatus, NoteCreate, NoteUpdate } from "../lib/types";
import { parseMarkdown } from "../lib/utils";
import MermaidRenderer from "./MermaidRenderer";

interface DrawerProps {
  isOpen: boolean;
  note: Note | null;
  onClose: () => void;
  onSave: (data: NoteCreate | NoteUpdate) => Promise<void>;
  allNotes: Array<{ id: string; title: string }>;
}

const moodColors = [
  { name: "sage", hex: "#87a987" },
  { name: "mint", hex: "#bce3c5" },
  { name: "slate", hex: "#64748b" },
  { name: "lavender_cool", hex: "#c084fc" },
  { name: "peach", hex: "#fb923c" },
  { name: "rose", hex: "#f472b6" },
];

export default function Drawer({ isOpen, note, onClose, onSave, allNotes }: DrawerProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<NoteStatus>("seed");
  const [moodColor, setMoodColor] = useState("slate");
  const [isFavorite, setIsFavorite] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [linkedIds, setLinkedIds] = useState<string[]>([]);
  const [mode, setMode] = useState<"write" | "split" | "preview">("write");

  const titleRef = useRef<HTMLInputElement>(null);

  // reset / populate form when note changes or drawer opens
  useEffect(() => {
    if (isOpen) {
      if (note) {
        setTitle(note.title);
        setContent(note.content);
        setStatus(note.status);
        setMoodColor(note.mood_color);
        setIsFavorite(note.is_favorite);
        setTags(note.tags.map((t) => t.name));
        setLinkedIds(note.linked_note_ids || []);
      } else {
        // defaults for new note
        setTitle("");
        setContent("");
        setStatus("seed");
        setMoodColor("sage");
        setIsFavorite(false);
        setTags([]);
        setLinkedIds([]);
      }
      setMode("write");

      // auto focus title input
      setTimeout(() => {
        titleRef.current?.focus();
      }, 150);
    }
  }, [isOpen, note]);

  const triggerSave = useCallback(() => {
    if (!title.trim()) return;
    const payload = {
      title: title.trim(),
      content,
      status,
      mood_color: moodColor,
      is_favorite: isFavorite,
      tags,
      linked_note_ids: linkedIds,
    };
    onSave(payload);
  }, [title, content, status, moodColor, isFavorite, tags, linkedIds, onSave]);

  // keydown hotkeys: Esc to close, Ctrl+Enter to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        onClose();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        triggerSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, triggerSave]);

  // scan content for references to other notes
  const suggestedLinks = useMemo(() => {
    if (!content.trim() || allNotes.length === 0) return [];
    
    return allNotes.filter((n) => {
      if (note && n.id === note.id) return false;
      if (linkedIds.includes(n.id)) return false;
      
      // look for occurrence of other note titles in content (case-insensitive)
      const escapedTitle = n.title.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
      const regex = new RegExp(`\\b${escapedTitle}\\b`, "i");
      return regex.test(content);
  }, [content, allNotes, note, linkedIds]);

  // generate table of contents headings
  const tocHeadings = useMemo(() => {
    const matches = content.match(/^(#{1,3})\s+(.*)$/gm);
    if (!matches) return [];
    return matches.map((m) => {
      const parts = m.match(/^(#{1,3})\s+(.*)$/);
      if (!parts) return { level: 1, text: "" };
      return {
        level: parts[1].length,
        text: parts[2].trim()
      };
    });
  }, [content]);

  // tag list handlers
  const handleAddTag = () => {
    const clean = tagInput.trim().toLowerCase();
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
    }
    setTagInput("");
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // connections interlinking handlers
  const handleToggleLink = (targetId: string) => {
    if (linkedIds.includes(targetId)) {
      setLinkedIds(linkedIds.filter((id) => id !== targetId));
    } else {
      setLinkedIds([...linkedIds, targetId]);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 backdrop-blur-sm bg-slate-900/15"
          />

          {/* side sheet drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 240 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-2xl bg-white shadow-drawer flex flex-col h-full border-l border-slate-100"
          >
            {/* header controls */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100/80">
              <span className="text-xs uppercase tracking-widest text-slate/50 font-semibold font-sans">
                {note ? "tending note" : "planting new seed"}
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="p-2 text-slate/40 hover:text-slate hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* form container scrollable */}
            <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6">
              {/* title */}
              <div>
                <input
                  ref={titleRef}
                  type="text"
                  placeholder="Give your thought a name..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full font-serif text-3xl font-semibold border-none focus:outline-none placeholder-slate-300 text-charcoal"
                />
              </div>

              {/* metadata parameters (status & color) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50">
                {/* status */}
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-slate/60 mb-2 font-sans">
                    growth stage
                  </label>
                  <div className="flex gap-1.5">
                    {(["seed", "growing", "evergreen"] as NoteStatus[]).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setStatus(st)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border font-sans cursor-pointer transition-all ${
                          status === st
                            ? "bg-white border-slate-200 shadow-sm font-semibold text-charcoal"
                            : "border-transparent text-slate/60 hover:text-slate hover:bg-white/50"
                        }`}
                      >
                        {st === "seed" && "🌱 seed"}
                        {st === "growing" && "🌿 growing"}
                        {st === "evergreen" && "🌳 evergreen"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* mood color picker */}
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-slate/60 mb-2 font-sans">
                    mood color
                  </label>
                  <div className="flex items-center gap-2">
                    {moodColors.map((col) => (
                      <button
                        key={col.name}
                        type="button"
                        onClick={() => setMoodColor(col.name)}
                        className={`w-6 h-6 rounded-full cursor-pointer transition-transform relative ${
                          moodColor === col.name ? "scale-110 ring-2 ring-offset-2 ring-slate-400/50" : "hover:scale-105"
                        }`}
                        style={{ backgroundColor: col.hex }}
                        title={col.name}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* editor tab buttons */}
              <div className="flex border-b border-slate-100/80">
                <button
                  type="button"
                  onClick={() => setMode("write")}
                  className={`px-4 py-2 text-xs font-medium font-sans cursor-pointer flex items-center gap-1.5 border-b-2 transition-all ${
                    mode === "write"
                      ? "border-sage text-charcoal font-semibold"
                      : "border-transparent text-slate/50 hover:text-slate"
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" /> write
                </button>
                <button
                  type="button"
                  onClick={() => setMode("split")}
                  className={`px-4 py-2 text-xs font-medium font-sans cursor-pointer flex items-center gap-1.5 border-b-2 transition-all ${
                    mode === "split"
                      ? "border-sage text-charcoal font-semibold"
                      : "border-transparent text-slate/50 hover:text-slate"
                  }`}
                >
                  <Layout className="w-3.5 h-3.5" /> split
                </button>
                <button
                  type="button"
                  onClick={() => setMode("preview")}
                  className={`px-4 py-2 text-xs font-medium font-sans cursor-pointer flex items-center gap-1.5 border-b-2 transition-all ${
                    mode === "preview"
                      ? "border-sage text-charcoal font-semibold"
                      : "border-transparent text-slate/50 hover:text-slate"
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" /> preview
                </button>
              </div>

              {/* body content */}
              <div className="min-h-[250px] flex flex-col">
                {/* table of contents overlay / sidebar */}
                {mode !== "write" && tocHeadings.length > 0 && (
                  <div className="bg-slate-50/65 border border-slate-200/20 p-3 rounded-xl mb-4 text-[11px] font-sans max-h-36 overflow-y-auto">
                    <div className="flex items-center gap-1 font-bold uppercase tracking-wider text-slate/50 mb-1.5">
                      <List className="w-3 h-3" /> Outline (Jump to)
                    </div>
                    <ul className="space-y-1">
                      {tocHeadings.map((h, idx) => (
                        <li
                          key={idx}
                          style={{ paddingLeft: `${(h.level - 1) * 8}px` }}
                          className="text-slate hover:text-sage-dark cursor-pointer transition-colors truncate"
                          onClick={() => {
                            const headers = document.querySelectorAll("h1, h2, h3");
                            for (let i = 0; i < headers.length; i++) {
                              if (headers[i].textContent === h.text) {
                                headers[i].scrollIntoView({ behavior: "smooth", block: "center" });
                                break;
                              }
                            }
                          }}
                        >
                          {h.level === 1 ? "• " : h.level === 2 ? "◦ " : "▪ "} {h.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {mode === "write" && (
                  <textarea
                    placeholder="Pour your thoughts out here... (Markdown supported)"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full h-64 border-none focus:outline-none resize-none text-sm leading-relaxed text-charcoal placeholder-slate-300 font-sans"
                  />
                )}

                {mode === "split" && (
                  <div className="flex gap-6 h-[400px] border border-slate-200/30 rounded-2xl p-4 bg-slate-50/20">
                    <textarea
                      placeholder="Write markdown here..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-1/2 h-full border-none focus:outline-none resize-none text-sm leading-relaxed text-charcoal placeholder-slate-300 font-sans border-r border-slate-200/50 pr-4"
                    />
                    <div className="w-1/2 h-full overflow-y-auto pl-2 prose prose-slate prose-sm max-w-none">
                      <MermaidRenderer html={parseMarkdown(content)} />
                    </div>
                  </div>
                )}

                {mode === "preview" && (
                  <div className="prose prose-slate prose-sm max-w-none min-h-[16rem] overflow-y-auto">
                    <MermaidRenderer html={parseMarkdown(content)} />
                  </div>
                )}
              </div>

              {/* tags manager */}
              <div className="space-y-2 pt-4 border-t border-slate-100/80">
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-slate/60 font-sans">
                  tags
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {tags.map((tg) => (
                    <span
                      key={tg}
                      className="text-xs font-medium text-slate bg-slate-100 px-2.5 py-1 rounded-full flex items-center gap-1 border border-slate-200/20 font-sans"
                    >
                      #{tg}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tg)}
                        className="text-slate/40 hover:text-slate cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="relative flex items-center">
                  <Hash className="absolute left-3 w-3.5 h-3.5 text-slate/40" />
                  <input
                    type="text"
                    placeholder="add tags (comma or enter)..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    className="w-full pl-9 pr-12 py-2 bg-slate-50 border border-slate-200/50 rounded-xl focus:outline-none focus:ring-1 focus:ring-sage/40 text-xs font-sans"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="absolute right-2 px-2 py-1 text-[10px] bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-lg transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* suggested links */}
              {suggestedLinks.length > 0 && (
                <div className="space-y-2 pt-4 border-t border-slate-100/80">
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-amber-700/85 flex items-center gap-1 font-sans">
                    ✨ Suggested Connections
                  </label>
                  <div className="flex flex-wrap gap-1.5 p-2.5 bg-amber-50/40 border border-amber-200/25 rounded-xl">
                    {suggestedLinks.map((n) => (
                      <button
                        key={n.id}
                        type="button"
                        onClick={() => setLinkedIds([...linkedIds, n.id])}
                        className="text-[10px] font-medium text-amber-800 bg-white hover:bg-amber-50 border border-amber-200/50 px-2 py-0.5 rounded-full cursor-pointer transition-colors flex items-center gap-1 font-sans"
                      >
                        <span>+ Link</span> {n.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* interlinking connections selector */}
              {allNotes.length > 0 && (
                <div className="space-y-2 pt-4 border-t border-slate-100/80">
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-slate/60 flex items-center gap-1 font-sans">
                    <Link2 className="w-3.5 h-3.5" /> link with other thoughts
                  </label>
                  
                  {/* list of other notes */}
                  <div className="max-h-40 overflow-y-auto border border-slate-200/50 rounded-xl p-3 bg-slate-50/30 grid grid-cols-1 md:grid-cols-2 gap-2">
                    {allNotes
                      .filter((n) => !note || n.id !== note.id)
                      .map((n) => {
                        const isLinked = linkedIds.includes(n.id);
                        return (
                          <button
                            key={n.id}
                            type="button"
                            onClick={() => handleToggleLink(n.id)}
                            className={`flex items-center gap-2 p-2 rounded-lg text-left text-xs font-sans transition-all cursor-pointer ${
                              isLinked 
                                ? "bg-sage-light/60 border border-sage/10 text-sage-dark font-medium" 
                                : "hover:bg-slate-50 border border-transparent text-slate"
                            }`}
                          >
                            <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                              isLinked ? "bg-sage border-sage text-white" : "border-slate-300"
                            }`}>
                              {isLinked && "✓"}
                            </div>
                            <span className="truncate">{n.title}</span>
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>

            {/* footer action bar */}
            <div className="px-6 py-4 border-t border-slate-100/80 bg-slate-50/50 flex items-center justify-between">
              <span className="text-[10px] text-slate/40 flex items-center gap-1 font-sans">
                <HelpCircle className="w-3 h-3" /> ctrl + enter to save
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-slate-200/80 text-xs font-medium rounded-xl hover:bg-slate-100 text-slate font-sans cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={triggerSave}
                  disabled={!title.trim()}
                  className="px-5 py-2 bg-sage hover:bg-sage-medium disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-semibold rounded-xl shadow-sm transition-all hover:scale-[1.01] cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
