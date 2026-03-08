"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface Props {
  nextRound: string;
  timeoutSeconds: number;
  onSubmit: (text: string) => void;
  onSkip: () => void;
}

export default function InterjectionInput({ nextRound, timeoutSeconds, onSubmit, onSkip }: Props) {
  const [text, setText] = useState("");
  const [remaining, setRemaining] = useState(timeoutSeconds);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
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
  }, [onSkip]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) onSubmit(text.trim());
  };

  const progress = (remaining / timeoutSeconds) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      className="glass-card-strong rounded-2xl p-4 max-w-xl mx-auto"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{"\uD83D\uDE4B"}</span>
          <div>
            <p className="text-xs font-semibold text-indigo-300">Your Turn to Speak</p>
            <p className="text-[10px] text-gray-500">Ask a question or challenge the debaters before {nextRound}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="relative w-8 h-8">
            <svg className="w-8 h-8 -rotate-90" viewBox="0 0 32 32">
              <circle cx="16" cy="16" r="14" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
              <circle
                cx="16" cy="16" r="14" fill="none"
                stroke={remaining <= 5 ? "#ef4444" : "#6366f1"}
                strokeWidth="2" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 14}`}
                strokeDashoffset={`${2 * Math.PI * 14 * (1 - progress / 100)}`}
                className="transition-all duration-1000"
              />
            </svg>
            <span className={`absolute inset-0 flex items-center justify-center text-[9px] font-bold ${remaining <= 5 ? "text-red-400" : "text-gray-300"}`}>
              {remaining}s
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g. What about the impact on small businesses?"
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-all"
        >
          Send
        </button>
        <button
          type="button"
          onClick={onSkip}
          className="text-gray-400 hover:text-gray-200 text-sm px-3 py-2.5 rounded-xl hover:bg-white/5 transition-all"
        >
          Skip
        </button>
      </form>
    </motion.div>
  );
}
