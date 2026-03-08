"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AgentPersona } from "@/hooks/useDebateWebSocket";

interface Props {
  agents: AgentPersona[];
  onVote: (agentName: string | null) => void;
}

export default function UserVote({ agents, onVote }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card-strong rounded-2xl p-6 max-w-xl mx-auto mt-4"
    >
      <div className="text-center mb-5">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="text-4xl mb-2 inline-block"
        >
          {"\uD83D\uDDF3\uFE0F"}
        </motion.div>
        <h3 className="text-lg font-bold text-white">Cast Your Vote</h3>
        <p className="text-sm text-gray-400 mt-1">
          Who do you think won the debate? Vote before seeing the AI verdict!
        </p>
      </div>

      <div className="space-y-2 mb-5">
        {agents.map((agent) => {
          const initials = agent.name.split(" ").map((n) => n[0]).join("").slice(0, 2);
          return (
            <motion.button
              key={agent.name}
              onClick={() => setSelected(agent.name)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                selected === agent.name
                  ? "border-indigo-500/50 bg-indigo-600/20 shadow-lg shadow-indigo-500/10"
                  : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.12]"
              }`}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                style={{ backgroundColor: agent.avatar_color }}
              >
                {initials}
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-white">{agent.name}</p>
                <p className="text-xs text-gray-400">{agent.role}</p>
              </div>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                  agent.stance === "for"
                    ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/20"
                    : agent.stance === "against"
                      ? "bg-red-500/15 text-red-300 border border-red-500/20"
                      : "bg-amber-500/15 text-amber-300 border border-amber-500/20"
                }`}
              >
                {agent.stance.toUpperCase()}
              </span>
              {selected === agent.name && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0"
                >
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => onVote(selected)}
          disabled={!selected}
          className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 text-white font-semibold py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-500/25"
        >
          Submit Vote
        </button>
        <button
          onClick={() => onVote(null)}
          className="bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 px-5 py-2.5 rounded-xl transition-all text-sm"
        >
          Skip
        </button>
      </div>
    </motion.div>
  );
}
