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
      onVote(selected);
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card-strong rounded-2xl p-6 max-w-lg mx-auto text-center"
      >
        <span className="text-4xl">{"\uD83D\uDDF3\uFE0F"}</span>
        <p className="text-white font-semibold mt-3">
          You voted for{" "}
          <span className="text-indigo-300">{selected}</span>
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Waiting for the AI verdict...
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card-strong rounded-2xl p-6 max-w-lg mx-auto"
    >
      <div className="text-center mb-5">
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="text-4xl inline-block mb-2"
        >
          {"\uD83C\uDFC6"}
        </motion.span>
        <h3 className="text-lg font-bold text-white">Who Won the Debate?</h3>
        <p className="text-xs text-gray-400 mt-1">
          Cast your vote before the AI reveals its verdict
        </p>
      </div>

      <div className="grid gap-2">
        {agents.map((agent, i) => (
          <motion.button
            key={agent.name}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => setSelected(agent.name)}
            className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
              selected === agent.name
                ? "bg-indigo-600/20 border-indigo-500/50 shadow-lg shadow-indigo-500/10"
                : "bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06] hover:border-indigo-500/30"
            }`}
          >
            <div
              className={`w-3 h-3 rounded-full border-2 flex-shrink-0 transition-all ${
                selected === agent.name
                  ? "border-indigo-400 bg-indigo-400"
                  : "border-gray-500"
              }`}
            />
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium text-white">{agent.name}</span>
              <span className="text-xs text-gray-500 ml-2">{agent.role}</span>
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
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 transition-all shadow-lg shadow-indigo-500/20 disabled:shadow-none"
        >
          Submit Vote
        </button>
      </div>
    </motion.div>
  );
}
