"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon, Sprout } from "lucide-react";

const NAME_KEY = "mindgarden-gardener-name";
const THEME_KEY = "mindgarden-theme";

export default function SettingsPanel() {
  const [name, setName] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setName(localStorage.getItem(NAME_KEY) ?? "");
    setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
  }, []);

  const applyTheme = (next: "light" | "dark") => {
    setTheme(next);
    localStorage.setItem(THEME_KEY, next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  const saveName = () => {
    localStorage.setItem(NAME_KEY, name.trim());
    window.dispatchEvent(new CustomEvent("mindgarden:name-changed", { detail: name.trim() }));
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-6 pb-10">
      <div className="mb-6">
        <h2 className="font-serif text-2xl md:text-3xl text-charcoal font-bold tracking-tight">
          Garden Settings ⚙️
        </h2>
        <p className="text-slate text-sm mt-1 font-sans font-light">
          small comforts for your daily visit — accounts arrive in a future season
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* gardener name */}
        <div className="glass-panel p-6">
          <h3 className="text-[11px] uppercase tracking-wider font-bold text-slate/60 font-sans mb-3">
            gardener name
          </h3>
          <div className="flex gap-3 flex-wrap">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveName()}
              placeholder="how the garden should greet you"
              aria-label="gardener name"
              className="flex-1 min-w-[220px] px-4 py-3 text-sm font-sans bg-[var(--glass-bg)] border border-[var(--glass-border-soft)] rounded-2xl focus:outline-none focus:ring-1 focus:ring-sage/40 text-charcoal placeholder:text-slate/40"
            />
            <button
              onClick={saveName}
              className="px-5 py-3 text-sm font-sans font-medium bg-sage hover:bg-sage-medium text-white rounded-2xl transition-all cursor-pointer"
            >
              {saved ? "saved ✓" : "save"}
            </button>
          </div>
          <p className="text-[10px] text-slate/40 font-sans mt-2">
            stays in this browser only — no account needed
          </p>
        </div>

        {/* theme */}
        <div className="glass-panel p-6">
          <h3 className="text-[11px] uppercase tracking-wider font-bold text-slate/60 font-sans mb-3">
            time of day
          </h3>
          <div className="grid grid-cols-2 gap-4 max-w-md">
            <button
              onClick={() => applyTheme("light")}
              className={`flex items-center gap-3 p-4 rounded-2xl border transition-all cursor-pointer font-sans text-sm ${
                theme === "light"
                  ? "bg-[var(--glass-bg-strong)] border-[var(--glass-border)] shadow-[var(--glass-shadow)] font-semibold text-charcoal"
                  : "border-transparent text-slate/60 hover:text-slate"
              }`}
            >
              <Sun className="w-5 h-5 text-sage" /> daylight
            </button>
            <button
              onClick={() => applyTheme("dark")}
              className={`flex items-center gap-3 p-4 rounded-2xl border transition-all cursor-pointer font-sans text-sm ${
                theme === "dark"
                  ? "bg-[var(--glass-bg-strong)] border-[var(--glass-border)] shadow-[var(--glass-shadow)] font-semibold text-charcoal"
                  : "border-transparent text-slate/60 hover:text-slate"
              }`}
            >
              <Moon className="w-5 h-5 text-sage" /> night garden
            </button>
          </div>
        </div>

        {/* about */}
        <div className="glass-panel p-6">
          <h3 className="text-[11px] uppercase tracking-wider font-bold text-slate/60 font-sans mb-3">
            about this garden
          </h3>
          <div className="flex items-center gap-3 text-sm font-sans text-slate/70">
            <Sprout className="w-4 h-4 text-sage" />
            <span>
              Mindgarden v0.1 — a calm knowledge garden grown with FastAPI, SQLite and Next.js
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
