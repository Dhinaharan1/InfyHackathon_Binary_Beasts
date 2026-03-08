"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AnalysisResult, FactCheck } from "@/hooks/useDebateWebSocket";

interface Props {
  analyses: AnalysisResult[];
}

const VERDICT_CONFIG: Record<string, { icon: string; color: string; bg: string; border: string }> = {
  true: { icon: "\u2705", color: "text-emerald-300", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  mostly_true: { icon: "\uD83D\uDFE2", color: "text-green-300", bg: "bg-green-500/10", border: "border-green-500/20" },
  unverified: { icon: "\u2753", color: "text-yellow-300", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
  misleading: { icon: "\u26A0\uFE0F", color: "text-orange-300", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  false: { icon: "\u274C", color: "text-red-300", bg: "bg-red-500/10", border: "border-red-500/20" },
};

export default function FactCheckOverlay({ analyses }: Props) {
  const [expanded, setExpanded] = useState(false);

  const allFacts: (FactCheck & { agent: string; round: string })[] = [];
  for (const a of analyses) {
    if (a.fact_check?.length) {
      for (const fc of a.fact_check) {
        allFacts.push({ ...fc, agent: a.agent_name, round: a.round_name });
      }
    }
  }

  if (allFacts.length === 0) return null;

  const recentFacts = allFacts.slice(-6);
  const summary = {
    verified: allFacts.filter((f) => f.verdict === "true" || f.verdict === "mostly_true").length,
    unverified: allFacts.filter((f) => f.verdict === "unverified").length,
    flagged: allFacts.filter((f) => f.verdict === "misleading" || f.verdict === "false").length,
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      className="relative"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-card text-xs font-medium text-white hover:bg-white/10 transition-all border border-white/10"
      >
        <span>{"\uD83D\uDD0D"}</span>
        Fact-Check
        <span className="flex gap-1">
          {summary.verified > 0 && (
            <span className="bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded-full text-[10px]">
              {summary.verified}
            </span>
          )}
          {summary.flagged > 0 && (
            <span className="bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded-full text-[10px]">
              {summary.flagged}
            </span>
          )}
        </span>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.95 }}
            className="absolute right-0 mt-2 w-[320px] max-h-[400px] overflow-y-auto glass-card-strong rounded-xl p-3 border border-white/10 z-50"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
                Claim Analysis
              </h4>
              <div className="flex gap-2 text-[10px]">
                <span className="text-emerald-300">{summary.verified} verified</span>
                <span className="text-yellow-300">{summary.unverified} unverified</span>
                <span className="text-red-300">{summary.flagged} flagged</span>
              </div>
            </div>
            <div className="space-y-2">
              {recentFacts.map((fact, i) => {
                const cfg = VERDICT_CONFIG[fact.verdict] || VERDICT_CONFIG.unverified;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`${cfg.bg} border ${cfg.border} rounded-lg p-2.5`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-sm flex-shrink-0 mt-0.5">{cfg.icon}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] text-white leading-snug">
                          &ldquo;{fact.claim}&rdquo;
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1">
                          {fact.explanation}
                        </p>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className={`text-[10px] font-semibold uppercase ${cfg.color}`}>
                            {fact.verdict.replace("_", " ")}
                          </span>
                          <span className="text-[10px] text-gray-500">
                            {fact.agent} &middot; {fact.confidence}% confidence
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
