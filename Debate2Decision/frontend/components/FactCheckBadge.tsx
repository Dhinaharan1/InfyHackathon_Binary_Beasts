"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AnalysisResult } from "@/hooks/useDebateWebSocket";

interface Props {
  analysis: AnalysisResult;
}

const VERDICT_STYLES: Record<string, { color: string; bg: string; icon: string }> = {
  accurate: { color: "text-emerald-300", bg: "bg-emerald-500/15 border-emerald-500/20", icon: "\u2713" },
  misleading: { color: "text-red-300", bg: "bg-red-500/15 border-red-500/20", icon: "\u2717" },
  partially_true: { color: "text-amber-300", bg: "bg-amber-500/15 border-amber-500/20", icon: "~" },
  unverifiable: { color: "text-gray-300", bg: "bg-gray-500/15 border-gray-500/20", icon: "?" },
};

const ACCURACY_STYLES: Record<string, { color: string; icon: string }> = {
  high: { color: "text-emerald-400", icon: "\uD83D\uDFE2" },
  medium: { color: "text-amber-400", icon: "\uD83D\uDFE1" },
  low: { color: "text-red-400", icon: "\uD83D\uDD34" },
};

export default function FactCheckBadge({ analysis }: Props) {
  const [expanded, setExpanded] = useState(false);
  const { fact_check } = analysis;
  const accuracy = ACCURACY_STYLES[fact_check.overall_accuracy] || ACCURACY_STYLES.medium;

  return (
    <div className="mt-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className={`inline-flex items-center gap-1.5 text-[10px] font-medium px-2 py-1 rounded-full border transition-all hover:bg-white/[0.05] ${
          fact_check.overall_accuracy === "high"
            ? "border-emerald-500/20 text-emerald-300"
            : fact_check.overall_accuracy === "low"
              ? "border-red-500/20 text-red-300"
              : "border-amber-500/20 text-amber-300"
        }`}
      >
        <span>{accuracy.icon}</span>
        <span>Fact Check: {fact_check.overall_accuracy}</span>
        <svg
          className={`w-2.5 h-2.5 transition-transform ${expanded ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {expanded && fact_check.claims.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 space-y-1.5"
          >
            {fact_check.claims.map((claim, i) => {
              const style = VERDICT_STYLES[claim.verdict] || VERDICT_STYLES.unverifiable;
              return (
                <div key={i} className={`text-[11px] px-2.5 py-1.5 rounded-lg border ${style.bg}`}>
                  <div className="flex items-start gap-1.5">
                    <span className={`font-bold ${style.color} flex-shrink-0 mt-0.5`}>{style.icon}</span>
                    <div>
                      <span className="text-gray-200">{claim.claim}</span>
                      <p className="text-gray-400 mt-0.5">{claim.explanation}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
