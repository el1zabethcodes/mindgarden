"use client";

import React from "react";

/** soft pulsing placeholder blocks shown while the garden loads */
export function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-slate-light/80 ${className}`}
      aria-hidden
    />
  );
}

/** mirrors one glass note card at rest */
export function NoteCardSkeleton() {
  return (
    <div className="glass-card p-6 flex flex-col h-64">
      <div className="flex items-center justify-between mb-4">
        <SkeletonBlock className="h-5 w-24 rounded-full" />
        <SkeletonBlock className="h-5 w-5 rounded-full" />
      </div>
      <SkeletonBlock className="h-6 w-3/4 mb-3" />
      <SkeletonBlock className="h-3.5 w-full mb-2" />
      <SkeletonBlock className="h-3.5 w-5/6 mb-2" />
      <SkeletonBlock className="h-3.5 w-2/3" />
      <div className="mt-auto flex gap-1.5">
        <SkeletonBlock className="h-4 w-14 rounded-full" />
        <SkeletonBlock className="h-4 w-14 rounded-full" />
      </div>
    </div>
  );
}

/** chart-sized placeholder for the greenhouse */
export function ChartSkeleton() {
  return (
    <div className="glass-panel p-6 md:p-8">
      <div className="flex justify-between mb-6">
        <div className="space-y-2">
          <SkeletonBlock className="h-3 w-40 rounded-full" />
          <SkeletonBlock className="h-2.5 w-28 rounded-full" />
        </div>
        <SkeletonBlock className="h-6 w-28 rounded-full" />
      </div>
      <div className="flex items-end gap-2 h-48">
        {Array.from({ length: 16 }, (_, i) => (
          <SkeletonBlock
            key={i}
            className={`flex-1 ${i % 3 === 0 ? "h-2/5" : i % 3 === 1 ? "h-3/5" : "h-4/5"}`}
          />
        ))}
      </div>
    </div>
  );
}

/** the four summary cards of the greenhouse */
export function SummaryCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="glass-card p-5 space-y-3">
          <SkeletonBlock className="h-2.5 w-20 rounded-full" />
          <SkeletonBlock className="h-8 w-12" />
          <SkeletonBlock className="h-2.5 w-24 rounded-full" />
        </div>
      ))}
    </div>
  );
}
