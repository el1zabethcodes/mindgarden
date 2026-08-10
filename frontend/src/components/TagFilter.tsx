"use client";

import React from "react";
import { Tag } from "../lib/types";

interface TagFilterProps {
  tags: Tag[];
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
}

export default function TagFilter({ tags, selectedTag, onSelectTag }: TagFilterProps) {
  // map color strings to tailwind styles
  const getColorStyles = (color: string, active: boolean) => {
    switch (color) {
      case "sage":
        return active 
          ? "bg-sage text-white border-sage" 
          : "bg-sage-light/60 text-sage-dark border-sage/10 hover:bg-sage-light";
      case "mint":
        return active 
          ? "bg-mint-dark text-white border-mint-dark" 
          : "bg-mint-light/80 text-mint-dark border-mint/20 hover:bg-mint-light";
      case "slate":
        return active 
          ? "bg-slate text-white border-slate" 
          : "bg-slate-light/85 text-slate border-slate/10 hover:bg-slate-light";
      case "lavender_cool":
        return active 
          ? "bg-purple-500 text-white border-purple-500" 
          : "bg-purple-50/60 text-purple-700 border-purple-100 hover:bg-purple-50";
      case "peach":
        return active 
          ? "bg-orange-400 text-white border-orange-400" 
          : "bg-orange-50/60 text-orange-700 border-orange-100 hover:bg-orange-50";
      case "rose":
        return active 
          ? "bg-pink-400 text-white border-pink-400" 
          : "bg-pink-50/60 text-pink-700 border-pink-100 hover:bg-pink-50";
      default:
        return active 
          ? "bg-slate text-white border-slate" 
          : "bg-slate-light text-slate border-slate/10 hover:bg-slate-light";
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 mb-8 overflow-x-auto scrollbar-none flex items-center gap-2 py-1">
      <button
        onClick={() => onSelectTag(null)}
        className={`px-3 py-1.5 rounded-full text-xs font-medium border font-sans transition-all shrink-0 cursor-pointer ${
          selectedTag === null
            ? "bg-charcoal text-white border-charcoal"
            : "bg-white/70 text-slate border-slate-200/50 hover:bg-white"
        }`}
      >
        All Tags
      </button>

      {tags.map((tag) => {
        const isActive = selectedTag === tag.name;
        return (
          <button
            key={tag.id}
            onClick={() => onSelectTag(tag.name)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border font-sans transition-all shrink-0 cursor-pointer ${getColorStyles(
              tag.color,
              isActive
            )}`}
          >
            #{tag.name}
          </button>
        );
      })}
    </div>
  );
}
