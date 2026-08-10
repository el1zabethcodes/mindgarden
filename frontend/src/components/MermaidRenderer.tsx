"use client";

import React, { useEffect, useRef } from "react";
import mermaid from "mermaid";

// initialize configuration once
try {
  mermaid.initialize({
    startOnLoad: false,
    theme: "base",
    securityLevel: "loose",
    themeVariables: {
      primaryColor: "#f1f5f1",
      primaryBorderColor: "#87a987",
      lineColor: "#64748b",
      textColor: "#1e293b",
      mainBkg: "#f1f5f1",
      nodeBorder: "#87a987",
      actorBorder: "#87a987",
      signalColor: "#64748b",
    },
  });
} catch (e) {
  // ignore
}

export default function MermaidRenderer({ html }: { html: string }) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      const els = containerRef.current.querySelectorAll(".mermaid");
      if (els.length > 0) {
        els.forEach((el, idx) => {
          // get the original syntax encoded in data-syntax attribute
          const syntax = el.getAttribute("data-syntax");
          const code = syntax ? decodeURIComponent(syntax) : el.textContent || "";
          const id = `mermaid-svg-${idx}-${Math.floor(Math.random() * 10000)}`;

          try {
            mermaid.render(id, code).then(({ svg }) => {
              el.innerHTML = svg;
            }).catch((err) => {
              console.error("mermaid rendering error:", err);
            });
          } catch (err) {
            console.error("mermaid execution error:", err);
          }
        });
      }
    }
  }, [html]);

  return (
    <div
      ref={containerRef}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
