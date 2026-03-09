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
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className={`flex items-center gap-4 px-4 py-2.5 rounded-xl border flex-shrink-0 ${
        matched
          ? "bg-emerald-500/10 border-emerald-500/20"
          : "bg-indigo-500/10 border-indigo-500/20"
      }`}
    >
      <span className="text-xl flex-shrink-0">{matched ? "🎉" : "🤔"}</span>
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="text-center flex-shrink-0">
          <p className="text-[9px] text-gray-500 uppercase tracking-wider">Your Pick</p>
          <p className="text-xs font-bold text-indigo-300 truncate max-w-[100px]">{userVote}</p>
        </div>
        <span className="text-gray-600 text-sm flex-shrink-0">{matched ? "=" : "vs"}</span>
        <div className="text-center flex-shrink-0">
          <p className="text-[9px] text-gray-500 uppercase tracking-wider">AI Verdict</p>
          <p className="text-xs font-bold text-purple-300 truncate max-w-[100px]">{aiWinner}</p>
        </div>
        <p className={`text-[11px] ml-auto flex-shrink-0 ${matched ? "text-emerald-400" : "text-gray-400"}`}>
          {matched ? "Great call! You agreed with the AI judge." : "The AI judge saw it differently."}
        </p>
      </div>
    </motion.div>
  );
}
