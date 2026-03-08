"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AnalysisResult } from "@/hooks/useDebateWebSocket";
import { AgentPersona } from "@/hooks/useDebateWebSocket";

interface Props {
  analyses: AnalysisResult[];
  agents: AgentPersona[];
}

type MetricKey = "overall" | "persuasiveness" | "emotional_impact" | "factual_strength";

const METRICS: { key: MetricKey; label: string; icon: string }[] = [
  { key: "overall", label: "Overall", icon: "\u2B50" },
  { key: "persuasiveness", label: "Persuasion", icon: "\uD83C\uDFAF" },
  { key: "emotional_impact", label: "Emotion", icon: "\u2764\uFE0F" },
  { key: "factual_strength", label: "Facts", icon: "\uD83D\uDCCA" },
];

export default function SentimentChart({ analyses, agents }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>("overall");

  if (analyses.length === 0) return null;

  const agentScores = agents.map((agent) => {
    const agentAnalyses = analyses.filter((a) => a.agent_name === agent.name);
    if (agentAnalyses.length === 0) return { agent, scores: [], avg: 0 };

    const scores = agentAnalyses.map((a) => ({
      round: a.round_number,
      value: a.sentiment[selectedMetric],
    }));
    const avg = Math.round(scores.reduce((sum, s) => sum + s.value, 0) / scores.length);

    return { agent, scores, avg };
  }).filter((a) => a.scores.length > 0);

  agentScores.sort((a, b) => b.avg - a.avg);

  return (
    <div className="glass-card rounded-xl p-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm">{"\uD83D\uDCC8"}</span>
          <span className="text-xs font-semibold text-white">Argument Strength</span>
          <span className="text-[10px] text-gray-500">({analyses.length} analyzed)</span>
        </div>
        <svg
          className={`w-3 h-3 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3"
          >
            {/* Metric tabs */}
            <div className="flex gap-1 mb-3">
              {METRICS.map((m) => (
                <button
                  key={m.key}
                  onClick={() => setSelectedMetric(m.key)}
                  className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-md transition-all ${
                    selectedMetric === m.key
                      ? "bg-indigo-600/60 text-white"
                      : "bg-white/[0.03] text-gray-400 hover:bg-white/[0.06]"
                  }`}
                >
                  <span>{m.icon}</span>
                  <span>{m.label}</span>
                </button>
              ))}
            </div>

            {/* Bar chart */}
            <div className="space-y-2">
              {agentScores.map(({ agent, scores, avg }) => (
                <div key={agent.name} className="flex items-center gap-2">
                  <div className="w-20 flex-shrink-0">
                    <span className="text-[11px] font-medium text-gray-300 truncate block">
                      {agent.name.split(" ")[0]}
                    </span>
                  </div>
                  <div className="flex-1 relative">
                    <div className="w-full bg-white/5 rounded-full h-4 overflow-hidden">
                      <motion.div
                        className="h-4 rounded-full flex items-center justify-end pr-1.5"
                        style={{ backgroundColor: agent.avatar_color + "CC" }}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(avg, 5)}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                      >
                        <span className="text-[9px] font-bold text-white">{avg}</span>
                      </motion.div>
                    </div>
                    {/* Round-by-round dots */}
                    <div className="flex gap-1 mt-1">
                      {scores.map((s, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-0.5"
                          title={`Round ${s.round + 1}: ${s.value}`}
                        >
                          <span className="text-[8px] text-gray-600">R{s.round + 1}</span>
                          <span className="text-[9px] text-gray-400">{s.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
