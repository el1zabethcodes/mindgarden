"use client";

import React from "react";
import { Sprout } from "lucide-react";

interface EmptyStateProps {
  onPlantNote: () => void;
}

export default function EmptyState({ onPlantNote }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="bg-sage-light p-5 rounded-full mb-6">
        <Sprout className="w-10 h-10 text-sage-medium" />
      </div>
      <h3 className="font-serif text-2xl text-charcoal mb-2">
        Your garden is empty
      </h3>
      <p className="text-slate text-sm max-w-sm mb-6 leading-relaxed">
        Plant your first seed of thought. Capture ideas, book reviews, recipes, or daily reflections and watch them grow.
      </p>
      <button
        onClick={onPlantNote}
        className="px-6 py-2.5 bg-sage hover:bg-sage-medium text-white font-medium rounded-full shadow-garden hover:shadow-lg transition-all duration-300 hover:scale-[1.01]"
      >
        Plant a Note
      </button>
    </div>
  );
}
