"use client";

import React, { useEffect, useState, useRef } from "react";
import { Note } from "../lib/types";

interface ConnectionGraphProps {
  notes: Note[];
  onSelectNote: (id: string) => void;
}

interface Node {
  id: string;
  title: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

interface Link {
  source: string;
  target: string;
}

const moodColorsHex: { [key: string]: string } = {
  sage: "#87a987",
  mint: "#bce3c5",
  slate: "#64748b",
  lavender_cool: "#c084fc",
  peach: "#fb923c",
  rose: "#f472b6",
};

export default function ConnectionGraph({ notes, onSelectNote }: ConnectionGraphProps) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  
  const svgRef = useRef<SVGSVGElement | null>(null);
  const width = 800;
  const height = 450;

  // initialize graph data
  useEffect(() => {
    // build nodes
    const initialNodes: Node[] = notes.map((note, idx) => {
      const angle = (idx / notes.length) * 2 * Math.PI;
      const radius = 10 + (note.linked_note_ids?.length || 0) * 4;
      return {
        id: note.id,
        title: note.title,
        // start in a circle around center
        x: width / 2 + Math.cos(angle) * 120,
        y: height / 2 + Math.sin(angle) * 120,
        vx: 0,
        vy: 0,
        radius,
        color: moodColorsHex[note.mood_color] || "#64748b",
      };
    });

    // build links
    const initialLinks: Link[] = [];
    const addedPairs = new Set<string>();

    notes.forEach((note) => {
      if (note.linked_note_ids) {
        note.linked_note_ids.forEach((targetId) => {
          const pairKey = [note.id, targetId].sort().join("-");
          if (!addedPairs.has(pairKey)) {
            // verify target node exists
            if (notes.some((n) => n.id === targetId)) {
              initialLinks.push({
                source: note.id,
                target: targetId,
              });
              addedPairs.add(pairKey);
            }
          }
        });
      }
    });

    // run force simulation loop
    const tempNodes = [...initialNodes];
    
    // simple force-directed simulation algorithm
    const ticks = 180;
    const kLink = 0.05;
    const kRepel = 1200;
    const kGravity = 0.015;

    for (let t = 0; t < ticks; t++) {
      // 1. Repulsion force between all node pairs
      for (let i = 0; i < tempNodes.length; i++) {
        for (let j = i + 1; j < tempNodes.length; j++) {
          const n1 = tempNodes[i];
          const n2 = tempNodes[j];
          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const distSq = dx * dx + dy * dy + 0.1;
          const dist = Math.sqrt(distSq);

          if (dist < 180) {
            const force = kRepel / distSq;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;

            n1.vx -= fx;
            n1.vy -= fy;
            n2.vx += fx;
            n2.vy += fy;
          }
        }
      }

      // 2. Attraction force along links
      initialLinks.forEach((link) => {
        const sourceNode = tempNodes.find((n) => n.id === link.source);
        const targetNode = tempNodes.find((n) => n.id === link.target);
        if (sourceNode && targetNode) {
          const dx = targetNode.x - sourceNode.x;
          const dy = targetNode.y - sourceNode.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 0.1;
          const force = (dist - 100) * kLink;
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;

          sourceNode.vx += fx;
          sourceNode.vy += fy;
          targetNode.vx -= fx;
          targetNode.vy -= fy;
        }
      });

      // 3. Gravity pulling to center and update positions
      tempNodes.forEach((node) => {
        const dx = width / 2 - node.x;
        const dy = height / 2 - node.y;
        
        node.vx += dx * kGravity;
        node.vy += dy * kGravity;

        // damp velocities
        node.vx *= 0.85;
        node.vy *= 0.85;

        // update position
        node.x += node.vx;
        node.y += node.vy;

        // boundary collision
        node.x = Math.max(node.radius, Math.min(width - node.radius, node.x));
        node.y = Math.max(node.radius, Math.min(height - node.radius, node.y));
      });
    }

    setNodes(tempNodes);
    setLinks(initialLinks);
  }, [notes]);

  // dragging event handlers
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (draggedNodeId === null || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * width;
    const mouseY = ((e.clientY - rect.top) / rect.height) * height;

    setNodes(
      nodes.map((node) =>
        node.id === draggedNodeId
          ? {
              ...node,
              x: Math.max(node.radius, Math.min(width - node.radius, mouseX)),
              y: Math.max(node.radius, Math.min(height - node.radius, mouseY)),
            }
          : node
      )
    );
  };

  const handleMouseUp = () => {
    setDraggedNodeId(null);
  };

  return (
    <div className="w-full bg-white/70 backdrop-blur-md border border-slate-200/40 rounded-3xl p-6 shadow-garden">
      <div className="mb-4">
        <h3 className="font-serif text-lg font-bold text-charcoal">Visual Connection Graph</h3>
        <p className="text-xs text-slate/50">Drag notes around to organize visually. Click a node to open the note details.</p>
      </div>

      <div className="relative border border-slate-100 rounded-2xl bg-slate-50/40 overflow-hidden">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto cursor-grab active:cursor-grabbing select-none"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* lines layer */}
          {links.map((link, idx) => {
            const source = nodes.find((n) => n.id === link.source);
            const target = nodes.find((n) => n.id === link.target);
            if (!source || !target) return null;
            return (
              <line
                key={idx}
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                stroke="#87a987"
                strokeWidth="1.5"
                strokeOpacity="0.45"
                strokeDasharray="4 2"
              />
            );
          })}

          {/* nodes layer */}
          {nodes.map((node) => (
            <g
              key={node.id}
              className="cursor-pointer"
              onMouseDown={(e) => {
                e.stopPropagation();
                setDraggedNodeId(node.id);
              }}
              onClick={() => {
                if (draggedNodeId === null) {
                  onSelectNote(node.id);
                }
              }}
            >
              {/* glow border */}
              <circle
                cx={node.x}
                cy={node.y}
                r={node.radius + 3}
                fill="transparent"
                stroke={node.color}
                strokeOpacity="0.25"
                strokeWidth="2"
              />
              {/* main circle */}
              <circle
                cx={node.x}
                cy={node.y}
                r={node.radius}
                fill={node.color}
                fillOpacity="0.85"
                stroke="#ffffff"
                strokeWidth="1.5"
                className="transition-all duration-300 hover:scale-110"
              />
              {/* text label */}
              <text
                x={node.x}
                y={node.y - node.radius - 6}
                textAnchor="middle"
                fill="#334155"
                className="text-[10px] font-sans font-medium bg-white"
                style={{
                  pointerEvents: "none",
                  textShadow: "0px 1px 2px rgba(255,255,255,0.9)",
                }}
              >
                {node.title.length > 18 ? node.title.substring(0, 15) + "..." : node.title}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
