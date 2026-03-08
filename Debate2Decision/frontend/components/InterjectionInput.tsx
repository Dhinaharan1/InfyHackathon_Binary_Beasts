"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

interface Props {
  nextRound: string;
  timeout: number;
  onSubmit: (content: string) => void;
  onSkip: () => void;
}

export default function InterjectionInput({ nextRound, timeout, onSubmit, onSkip }: Props) {
  const [text, setText] = useState("");
  const [remaining, setRemaining] = useState(timeout);

  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onSkip();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeout, onSkip]);

  const handleSubmit = useCallback(() => {
    if (text.trim()) {
      onSubmit(text.trim());
      setText("");
    } else {
      onSkip();
    }
  }, [text, onSubmit, onSkip]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="glass-card-strong rounded-xl p-4 mx-auto max-w-2xl"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{"\uD83D\uDE4B"}</span>
          <div>
            <h3 className="text-sm font-semibold text-white">Your Turn to Speak</h3>
            <p className="text-xs text-gray-400">
              Ask a question or add a counter-argument before <span className="text-indigo-300">{nextRound}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
            <span className={`text-xs font-bold ${remaining <= 10 ? "text-red-400" : "text-indigo-300"}`}>
              {remaining}
            </span>
          </div>
        </div>
      </div>

      {/* Timer bar */}
      <div className="w-full bg-white/5 rounded-full h-1 mb-3">
        <motion.div
          className={`h-1 rounded-full ${remaining <= 10 ? "bg-red-500" : "bg-gradient-to-r from-indigo-500 to-purple-500"}`}
          initial={{ width: "100%" }}
          animate={{ width: `${(remaining / timeout) * 100}%` }}
          transition={{ duration: 1, ease: "linear" }}
        />
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="e.g. What about the cost implications?"
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
          autoFocus
        />
        <button
          onClick={handleSubmit}
          disabled={!text.trim()}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-all"
        >
          Submit
        </button>
        <button
          onClick={onSkip}
          className="bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 text-sm px-4 py-2.5 rounded-lg transition-all"
        >
          Skip
        </button>
      </div>
    </motion.div>
  );
}
