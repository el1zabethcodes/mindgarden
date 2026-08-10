"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Navigation, Terminal, ArrowRight, X } from "lucide-react";

export default function OnboardingTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    try {
      const seen = localStorage.getItem("mindgarden_tour_seen");
      if (!seen) {
        setIsOpen(true);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem("mindgarden_tour_seen", "true");
    setIsOpen(false);
  };

  const steps = [
    {
      title: "Welcome to Mindgarden 🌱",
      desc: "This is your calm digital workspace for capturing ideas, book notes, and technical drafts. Notes grow from Seeds to Growing and Evergreen structures over time.",
      icon: Sparkles,
      color: "text-sage bg-sage-light/50",
    },
    {
      title: "Connections & Columns 🕸️",
      desc: "Link notes together dynamically. Traverse your digital thoughts using the visual Connection Graph, or drag cards in Kanban view to tend their growth stage.",
      icon: Navigation,
      color: "text-mint-dark bg-mint-light/60",
    },
    {
      title: "Command Palette ⌘K",
      desc: "Press Cmd+K or Ctrl+K anywhere to activate the Command Palette. Quickly search your thoughts, filter tags, or run action commands like /new or /graph.",
      icon: Terminal,
      color: "text-slate bg-slate-100",
    },
  ];

  if (!isOpen) return null;

  const current = steps[step - 1];
  const Icon = current.icon;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/20 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md bg-white border border-slate-200/50 shadow-2xl rounded-3xl p-6 relative flex flex-col font-sans"
        >
          {/* close */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate/40 hover:text-slate hover:bg-slate-50 transition-colors cursor-pointer"
            title="skip tour"
          >
            <X className="w-4 h-4" />
          </button>

          {/* step icon */}
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${current.color}`}>
            <Icon className="w-6 h-6" />
          </div>

          {/* step content */}
          <h3 className="font-serif text-2xl font-bold text-charcoal mb-2">
            {current.title}
          </h3>
          <p className="text-slate text-sm leading-relaxed mb-6 font-light">
            {current.desc}
          </p>

          {/* progress indicator */}
          <div className="flex items-center justify-between mt-auto">
            <div className="flex gap-1.5">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    step === s ? "w-4 bg-sage" : "bg-slate-200"
                  }`}
                />
              ))}
            </div>

            <div className="flex gap-2">
              {step > 1 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="px-3.5 py-1.5 border border-slate-200 text-xs font-semibold rounded-xl hover:bg-slate-50 text-slate cursor-pointer"
                >
                  Back
                </button>
              )}

              {step < 3 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  className="px-4 py-2 bg-sage hover:bg-sage-medium text-white text-xs font-semibold rounded-xl shadow-sm hover:scale-[1.01] flex items-center gap-1 cursor-pointer"
                >
                  Next <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={handleClose}
                  className="px-4 py-2 bg-sage hover:bg-sage-medium text-white text-xs font-semibold rounded-xl shadow-sm hover:scale-[1.01] cursor-pointer"
                >
                  Explore Garden
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
