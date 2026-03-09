"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AgentPersona } from "@/hooks/useDebateWebSocket";

interface Props {
  agents: AgentPersona[];
  onVote: (agentName: string) => void;
  onSkip: () => void;
}

export default function UserVote({ agents, onVote, onSkip }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (selected) {
      setSubmitted(true);
      setTimeout(() => onVote(selected), 800);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="submitted"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative z-10 glass-card-strong rounded-2xl p-8 max-w-sm w-full text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 250 }}
              className="text-5xl mb-4"
            >
              🗳️
            </motion.div>
            <p className="text-white font-bold text-lg">
              You voted for{" "}
              <span className="text-indigo-300">{selected}</span>
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Revealing the AI verdict...
            </p>
            <motion.div
              className="mt-5 flex justify-center gap-1"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-indigo-500 rounded-full"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                />
              ))}
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="vote"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="relative z-10 glass-card-strong rounded-2xl p-6 max-w-sm w-full"
          >
            <div className="text-center mb-5">
              <motion.span
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                className="text-4xl inline-block mb-2"
              >
                🏆
              </motion.span>
              <h3 className="text-lg font-bold text-white">Who Won the Debate?</h3>
              <p className="text-xs text-gray-400 mt-1">
                Cast your vote before the AI reveals its verdict
              </p>
            </div>

            <div className="flex flex-col gap-2">
              {agents.map((agent, i) => (
                <motion.button
                  key={agent.name}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.07 }}
                  onClick={() => setSelected(agent.name)}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                    selected === agent.name
                      ? "bg-indigo-600/20 border-indigo-500/50 shadow-lg shadow-indigo-500/10"
                      : "bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06] hover:border-indigo-500/30"
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className="w-9 h-9 rounded-full overflow-hidden border flex-shrink-0"
                    style={{ borderColor: agent.avatar_color + "60" }}
                  >
                    {agent.avatar_image ? (
                      <img
                        src={agent.avatar_image.startsWith("data:") ? agent.avatar_image : `data:image/png;base64,${agent.avatar_image}`}
                        alt={agent.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center text-[10px] font-bold text-white"
                        style={{ backgroundColor: agent.avatar_color }}
                      >
                        {agent.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{agent.name}</p>
                    <p className="text-[10px] text-gray-500 truncate">{agent.role}</p>
                  </div>

                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold flex-shrink-0 ${
                    agent.stance === "for"
                      ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/20"
                      : agent.stance === "against"
                        ? "bg-red-500/15 text-red-300 border border-red-500/20"
                        : "bg-amber-500/15 text-amber-300 border border-amber-500/20"
                  }`}>
                    {agent.stance.toUpperCase()}
                  </span>

                  <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all ${
                    selected === agent.name ? "border-indigo-400 bg-indigo-400" : "border-gray-600"
                  }`} />
                </motion.button>
              ))}
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={onSkip}
                className="flex-1 py-2.5 rounded-xl text-sm text-gray-400 bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-all"
              >
                Skip Vote
              </button>
              <button
                onClick={handleSubmit}
                disabled={!selected}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 transition-all shadow-lg shadow-indigo-500/20 disabled:shadow-none"
              >
                Submit Vote
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
