"use client";

import { motion } from "framer-motion";

interface Props {
  userVote: string;
  aiWinner: string;
}

export default function VoteComparison({ userVote, aiWinner }: Props) {
  const matched = userVote.toLowerCase() === aiWinner.toLowerCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-card rounded-xl p-4 max-w-2xl mx-auto mt-3 text-center"
    >
      <div className="flex items-center justify-center gap-3 mb-2">
        <span className="text-2xl">{matched ? "\uD83C\uDF89" : "\uD83E\uDD14"}</span>
        <h4 className="text-sm font-bold text-white">
          {matched ? "You predicted correctly!" : "Different perspectives!"}
        </h4>
      </div>
      <div className="flex items-center justify-center gap-6 text-sm">
        <div className="text-center">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Your Pick</p>
          <p className="text-indigo-300 font-semibold">{userVote}</p>
        </div>
        <div className="text-gray-600">{matched ? "=" : "vs"}</div>
        <div className="text-center">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">AI Verdict</p>
          <p className="text-purple-300 font-semibold">{aiWinner}</p>
        </div>
      </div>
      {matched && (
        <p className="text-xs text-emerald-400 mt-2">
          Great minds think alike! You and the AI judge agree.
        </p>
      )}
      {!matched && (
        <p className="text-xs text-gray-400 mt-2">
          The AI judge saw it differently. Read the verdict to see why!
        </p>
      )}
    </motion.div>
  );
}
