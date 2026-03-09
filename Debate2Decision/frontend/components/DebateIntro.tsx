"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DebateSetup } from "@/hooks/useDebateWebSocket";

interface Props {
  setup: DebateSetup;
  statusMessage: string;
  isGenerating: boolean; // still waiting for setup from server
  onReady: () => void;   // called when intro finishes → go to debate
}

const STANCE_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  for:     { label: "IN FAVOUR",  color: "text-emerald-300", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
  against: { label: "AGAINST",    color: "text-red-300",     bg: "bg-red-500/10",     border: "border-red-500/30"     },
  neutral: { label: "NEUTRAL",    color: "text-amber-300",   bg: "bg-amber-500/10",   border: "border-amber-500/30"   },
};

const ACCENT_CONFIG: Record<string, { flag: string; label: string }> = {
  indian:   { flag: "🇮🇳", label: "Indian"   },
  american: { flag: "🇺🇸", label: "American" },
  british:  { flag: "🇬🇧", label: "British"  },
};

const LOADING_STEPS = [
  { icon: "🔍", label: "Analysing the topic..." },
  { icon: "🧠", label: "Creating expert personas..." },
  { icon: "🎨", label: "Generating AI portraits..." },
  { icon: "🎙️", label: "Preparing voice profiles..." },
];

// Duration each agent card is highlighted before moving to the next (ms)
const AGENT_HIGHLIGHT_MS = 2200;
// How long the "All set!" banner shows before calling onReady (ms)
const ALLSET_MS = 2000;

export default function DebateIntro({ setup, statusMessage, isGenerating, onReady }: Props) {
  const [revealedCount, setRevealedCount] = useState(0);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [showAllSet, setShowAllSet] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  // Cycle through loading step labels while still generating
  useEffect(() => {
    if (!isGenerating) return;
    const id = setInterval(() => setLoadingStep((s) => (s + 1) % LOADING_STEPS.length), 1800);
    return () => clearInterval(id);
  }, [isGenerating]);

  // Once setup arrives, reveal agents one by one
  useEffect(() => {
    if (!setup || isGenerating) return;

    let count = 0;
    const reveal = () => {
      if (count < setup.agents.length) {
        count++;
        setRevealedCount(count);
        setTimeout(reveal, 500);
      }
    };
    reveal();
  }, [setup, isGenerating]);

  // Cycle spotlight across revealed agents
  useEffect(() => {
    if (revealedCount === 0) return;
    const id = setInterval(() => {
      setHighlightIndex((h) => (h + 1) % revealedCount);
    }, AGENT_HIGHLIGHT_MS);
    return () => clearInterval(id);
  }, [revealedCount]);

  // After all agents revealed, show "All set!" then call onReady
  useEffect(() => {
    if (!setup || revealedCount < setup.agents.length || setup.agents.length === 0) return;
    const t1 = setTimeout(() => setShowAllSet(true), 600);
    const t2 = setTimeout(() => onReady(), 600 + ALLSET_MS);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [revealedCount, setup, onReady]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 relative overflow-hidden">

      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      {/* Logo + topic */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8 relative z-10"
      >
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl shadow-lg shadow-indigo-500/30">
            ⚖️
          </div>
          <span className="text-lg font-extrabold text-white">
            Debate 2 Decision{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">AI</span>
          </span>
        </div>
        {setup && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-base font-semibold text-white max-w-xl mx-auto leading-snug"
          >
            {setup.topic}
          </motion.p>
        )}
        {setup && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="inline-block mt-2 text-xs text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full"
          >
            {setup.industry}
          </motion.span>
        )}
      </motion.div>

      {/* ── Still loading (no setup yet) ── */}
      {isGenerating && (
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex flex-col items-center gap-6 relative z-10"
        >
          {/* Spinning rings */}
          <div className="relative w-24 h-24">
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-indigo-500/20"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-1 rounded-full border-t-2 border-r-2 border-indigo-500"
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-3 rounded-full border-t-2 border-purple-400/60"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.8, ease: "linear" }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-2xl">
              <motion.span
                key={loadingStep}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {LOADING_STEPS[loadingStep].icon}
              </motion.span>
            </div>
          </div>

          {/* Animated steps list */}
          <div className="flex flex-col gap-2 items-center">
            {LOADING_STEPS.map((step, i) => (
              <motion.div
                key={i}
                className={`flex items-center gap-2.5 px-4 py-2 rounded-xl transition-all ${
                  i === loadingStep
                    ? "bg-indigo-600/20 border border-indigo-500/30"
                    : i < loadingStep
                    ? "opacity-50"
                    : "opacity-20"
                }`}
              >
                <span className={`text-base ${i < loadingStep ? "grayscale" : ""}`}>{step.icon}</span>
                <span className={`text-sm font-medium ${i === loadingStep ? "text-white" : "text-gray-500"}`}>
                  {step.label}
                </span>
                {i < loadingStep && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-emerald-400 text-xs ml-1"
                  >
                    ✓
                  </motion.span>
                )}
                {i === loadingStep && (
                  <motion.span
                    className="w-1.5 h-1.5 bg-indigo-400 rounded-full ml-1"
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  />
                )}
              </motion.div>
            ))}
          </div>

          {statusMessage && (
            <motion.p
              key={statusMessage}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-gray-500 text-center max-w-xs"
            >
              {statusMessage}
            </motion.p>
          )}
        </motion.div>
      )}

      {/* ── Agents revealed ── */}
      {setup && !isGenerating && (
        <motion.div
          key="agents"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full max-w-3xl relative z-10"
        >
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-sm text-gray-400 mb-6"
          >
            Meet your debate panel
          </motion.p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-stretch">
            {setup.agents.map((agent, idx) => {
              const isRevealed = idx < revealedCount;
              const isSpotlit = isRevealed && idx === highlightIndex;
              const stance = STANCE_CONFIG[agent.stance] || STANCE_CONFIG.neutral;
              const accent = ACCENT_CONFIG[agent.accent] || { flag: "🌍", label: agent.accent };

              return (
                <AnimatePresence key={agent.name}>
                  {isRevealed && (
                    <motion.div
                      initial={{ opacity: 0, y: 40, scale: 0.85 }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        scale: isSpotlit ? 1.04 : 1,
                      }}
                      exit={{ opacity: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 20,
                        scale: { duration: 0.3 },
                      }}
                      className={`flex-1 rounded-2xl p-4 border transition-all duration-300 ${
                        isSpotlit
                          ? "bg-white/[0.06] border-white/20 shadow-2xl"
                          : "bg-white/[0.025] border-white/[0.06]"
                      }`}
                      style={
                        isSpotlit
                          ? { boxShadow: `0 0 30px ${agent.avatar_color}25, 0 8px 32px rgba(0,0,0,0.4)` }
                          : {}
                      }
                    >
                      {/* Avatar */}
                      <div className="flex flex-col items-center gap-3">
                        <div className="relative">
                          {/* Glow ring when spotlit */}
                          {isSpotlit && (
                            <motion.div
                              className="absolute -inset-2 rounded-full opacity-40"
                              style={{ background: `radial-gradient(circle, ${agent.avatar_color}60, transparent 70%)` }}
                              animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
                              transition={{ repeat: Infinity, duration: 2 }}
                            />
                          )}
                          <div
                            className="w-20 h-20 rounded-full overflow-hidden border-2 relative z-10"
                            style={{ borderColor: isSpotlit ? agent.avatar_color : agent.avatar_color + "50" }}
                          >
                            {agent.avatar_image ? (
                              <img
                                src={agent.avatar_image.startsWith("data:") ? agent.avatar_image : `data:image/png;base64,${agent.avatar_image}`}
                                alt={agent.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div
                                className="w-full h-full flex items-center justify-center text-white text-xl font-bold"
                                style={{ backgroundColor: agent.avatar_color }}
                              >
                                {agent.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                              </div>
                            )}
                          </div>

                          {/* Entry badge */}
                          {isSpotlit && (
                            <motion.div
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gray-900 border-2 flex items-center justify-center text-xs z-20"
                              style={{ borderColor: agent.avatar_color }}
                            >
                              🎙️
                            </motion.div>
                          )}
                        </div>

                        {/* Name + role */}
                        <div className="text-center">
                          <motion.h3
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.15 }}
                            className="text-sm font-bold text-white"
                          >
                            {agent.name}
                          </motion.h3>
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.25 }}
                            className="text-xs text-gray-400 leading-tight mt-0.5"
                          >
                            {agent.role}
                          </motion.p>
                        </div>

                        {/* Stance badge */}
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.3, type: "spring" }}
                          className={`text-[10px] font-bold px-3 py-1 rounded-full border ${stance.bg} ${stance.border} ${stance.color}`}
                        >
                          {stance.label}
                        </motion.span>

                        {/* Expertise */}
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.4 }}
                          className="text-[10px] text-gray-500 text-center leading-snug line-clamp-2"
                        >
                          {agent.expertise}
                        </motion.p>

                        {/* Accent + gender */}
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 }}
                          className="flex items-center gap-1.5"
                        >
                          <span className="text-sm">{accent.flag}</span>
                          <span className="text-[10px] text-gray-600">{accent.label}</span>
                          <span className="text-gray-700">·</span>
                          <span className="text-[10px] text-gray-600 capitalize">{agent.gender}</span>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              );
            })}
          </div>

          {/* All Set Banner */}
          <AnimatePresence>
            {showAllSet && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 250, damping: 22 }}
                className="mt-8 flex flex-col items-center gap-3"
              >
                <motion.div
                  className="flex items-center gap-3 bg-gradient-to-r from-indigo-600/30 to-purple-600/30 border border-indigo-500/30 rounded-2xl px-8 py-4"
                  animate={{ boxShadow: ["0 0 0px rgba(99,102,241,0)", "0 0 30px rgba(99,102,241,0.3)", "0 0 0px rgba(99,102,241,0)"] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <motion.span
                    className="text-2xl"
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
                  >
                    🎯
                  </motion.span>
                  <div>
                    <p className="text-base font-bold text-white">All set for the debating stage!</p>
                    <p className="text-xs text-indigo-300/80 mt-0.5">Taking you in momentarily...</p>
                  </div>
                  <motion.div
                    className="flex gap-1 ml-2"
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  >
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-1.5 h-1.5 bg-indigo-400 rounded-full"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 0.7, delay: i * 0.12 }}
                      />
                    ))}
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
