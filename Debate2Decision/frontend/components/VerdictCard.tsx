"use client";

import { motion } from "framer-motion";
import { Verdict } from "@/hooks/useDebateWebSocket";
import VerdictQuery from "./VerdictQuery";

interface Props {
  verdict: Verdict;
  topic?: string;
  userVote?: string | null;
  onNewDebate: () => void;
}

const MEDAL = ["🥇", "🥈", "🥉"];
const SCORE_COLOR = [
  { bar: "from-amber-400 to-yellow-300", text: "text-amber-300", card: "bg-amber-500/8 border-amber-500/20" },
  { bar: "from-slate-400 to-gray-300",   text: "text-gray-300",  card: "bg-white/[0.03] border-white/[0.07]" },
  { bar: "from-orange-500 to-orange-400", text: "text-orange-300", card: "bg-orange-500/8 border-orange-500/15" },
];

const STANCE_STYLE: Record<string, string> = {
  for:     "bg-emerald-500/15 text-emerald-300 border border-emerald-500/25",
  against: "bg-red-500/15 text-red-300 border border-red-500/25",
  neutral: "bg-amber-500/15 text-amber-300 border border-amber-500/25",
};

export default function VerdictCard({ verdict, topic, userVote, onNewDebate }: Props) {
  const sorted = [...(verdict.scores ?? [])].sort((a, b) => b.score - a.score);
  const aiWinner = verdict.winner;
  const votedCorrectly = userVote ? userVote.toLowerCase() === aiWinner.toLowerCase() : null;

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-6 relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-indigo-600/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-purple-600/8 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl" />
      </div>

      {/* ── Top bar ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-5 relative z-10 flex-shrink-0"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm shadow-lg shadow-indigo-500/30">
            ⚖️
          </div>
          <span className="text-base font-extrabold text-white">
            Debate 2 Decision{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">AI</span>
          </span>
        </div>
        <button
          onClick={onNewDebate}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-all shadow-lg shadow-indigo-500/25"
        >
          <span>+</span> New Debate
        </button>
      </motion.div>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col gap-4 relative z-10 min-h-0">

        {/* ── Hero winner section ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card-strong rounded-2xl p-5 relative overflow-hidden"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* Trophy */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.25, type: "spring", stiffness: 220 }}
              className="text-6xl flex-shrink-0"
            >
              🏆
            </motion.div>

            {/* Winner info */}
            <div className="flex-1 min-w-0 text-center sm:text-left">
              <p className="text-[10px] text-amber-400/80 font-bold uppercase tracking-widest mb-1">Debate Winner</p>
              <h1 className="text-3xl font-extrabold text-white leading-tight">{verdict.winner}</h1>
              <p className="text-sm text-gray-400 mt-0.5">{verdict.winner_role}</p>
              {verdict.winner_stance && (
                <span className={`inline-block mt-2 text-[10px] px-3 py-1 rounded-full font-bold ${STANCE_STYLE[verdict.winner_stance] ?? STANCE_STYLE.neutral}`}>
                  {verdict.winner_stance.toUpperCase()}
                </span>
              )}
            </div>

            {/* Topic + vote result */}
            <div className="flex-shrink-0 flex flex-col gap-2 items-end">
              {topic && (
                <div className="text-right">
                  <p className="text-[9px] text-gray-600 uppercase tracking-wider">Topic</p>
                  <p className="text-[11px] text-indigo-300 max-w-[200px] leading-snug text-right">{topic}</p>
                </div>
              )}
              {votedCorrectly !== null && (
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold ${
                  votedCorrectly ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/20" : "bg-indigo-500/15 text-indigo-300 border border-indigo-500/20"
                }`}>
                  {votedCorrectly ? "🎉 You predicted correctly!" : `🤔 You picked ${userVote}`}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── Two-column: Conclusion+Reasoning | Scores ── */}
        <div className="flex gap-4 flex-1 min-h-0">

          {/* LEFT: Conclusion + Reasoning + AI Query */}
          <div className="flex-1 flex flex-col gap-3 min-w-0 overflow-y-auto pr-1">

            {verdict.conclusion && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card rounded-2xl p-5 flex-shrink-0"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">📋</span>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Final Conclusion</p>
                </div>
                <p className="text-sm text-gray-200 leading-relaxed">{verdict.conclusion}</p>
              </motion.div>
            )}

            {verdict.reasoning && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-card rounded-2xl p-5 border-l-2 border-indigo-500/40 flex-shrink-0"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">🧠</span>
                  <p className="text-[10px] text-indigo-400/80 uppercase tracking-wider font-bold">Judge&apos;s Reasoning</p>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed italic">
                  &ldquo;{verdict.reasoning}&rdquo;
                </p>
              </motion.div>
            )}

            {/* AI Decision Assistant */}
            <VerdictQuery
              topic={topic ?? ""}
              conclusion={verdict.conclusion ?? ""}
              reasoning={verdict.reasoning ?? ""}
              winner={verdict.winner ?? ""}
            />
          </div>

          {/* RIGHT: Scoreboard */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
            className="w-80 flex-shrink-0 glass-card-strong rounded-2xl p-5 flex flex-col gap-4"
          >
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-lg">📊</span>
              <h3 className="text-sm font-bold text-white">Final Scoreboard</h3>
            </div>

            <div className="flex flex-col gap-3 flex-1">
              {sorted.map((s, i) => {
                const colors = SCORE_COLOR[i] ?? SCORE_COLOR[2];
                return (
                  <motion.div
                    key={s.name}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className={`rounded-xl p-3.5 border ${colors.card}`}
                  >
                    {/* Header row */}
                    <div className="flex items-center gap-2.5 mb-2.5">
                      <span className="text-xl flex-shrink-0">{MEDAL[i] ?? `#${i + 1}`}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{s.name}</p>
                        <p className="text-[10px] text-gray-500 truncate">{s.role}</p>
                      </div>
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.55 + i * 0.1, type: "spring", stiffness: 200 }}
                        className={`text-2xl font-extrabold tabular-nums flex-shrink-0 ${colors.text}`}
                      >
                        {s.score}
                      </motion.span>
                    </div>

                    {/* Animated bar */}
                    <div className="w-full bg-white/5 rounded-full h-2 mb-2.5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${s.score}%` }}
                        transition={{ delay: 0.6 + i * 0.12, duration: 0.9, ease: "easeOut" }}
                        className={`h-2 rounded-full bg-gradient-to-r ${colors.bar}`}
                      />
                    </div>

                    {/* Strength */}
                    <p className="text-[10px] text-gray-500 leading-snug">{s.strength}</p>
                  </motion.div>
                );
              })}
            </div>

            {/* CTA */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              onClick={onNewDebate}
              className="w-full py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-500/25 flex-shrink-0"
            >
              Start a New Debate →
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
