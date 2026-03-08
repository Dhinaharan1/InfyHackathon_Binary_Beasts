"use client";

import { motion } from "framer-motion";
import { Verdict } from "@/hooks/useDebateWebSocket";

interface Props {
  verdict: Verdict;
  topic?: string;
}

export default function VerdictCard({ verdict, topic }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, type: "spring" }}
      className="glass-card-strong rounded-2xl p-6 max-w-2xl mx-auto mt-4 relative overflow-hidden"
    >
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl" />

      <div className="relative z-10">
        <div className="text-center mb-5">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="text-5xl mb-2 inline-block"
          >
            {"\uD83C\uDFC6"}
          </motion.div>
          <h3 className="text-xl font-bold text-white">Debate Verdict</h3>
          {topic && (
            <p className="text-sm text-gray-400 mt-1">
              Topic: <span className="text-indigo-300">{topic}</span>
            </p>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/20 rounded-xl p-4 mb-4 text-center"
        >
          <p className="text-indigo-300/70 text-xs font-medium uppercase tracking-wider mb-1">
            Winner
          </p>
          <p className="text-2xl font-bold text-white">{verdict.winner}</p>
          <p className="text-indigo-300 text-sm">{verdict.winner_role}</p>
          {verdict.winner_stance && (
            <p className="mt-2 text-sm">
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                  verdict.winner_stance === "for"
                    ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/20"
                    : verdict.winner_stance === "against"
                      ? "bg-red-500/15 text-red-300 border border-red-500/20"
                      : "bg-amber-500/15 text-amber-300 border border-amber-500/20"
                }`}
              >
                {verdict.winner_stance.toUpperCase()}
              </span>
            </p>
          )}
        </motion.div>

        {/* Clear conclusion */}
        {verdict.conclusion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 mb-4 text-center"
          >
            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-2">
              Final Conclusion
            </p>
            <p className="text-sm text-gray-200 leading-relaxed">
              {verdict.conclusion}
            </p>
          </motion.div>
        )}

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-gray-300 text-center text-sm mb-5 italic bg-white/[0.02] rounded-lg p-3"
        >
          &ldquo;{verdict.reasoning}&rdquo;
        </motion.p>

        <div className="space-y-2.5">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Scores
          </h4>
          {verdict.scores
            ?.sort((a, b) => b.score - a.score)
            .map((s, i) => (
              <motion.div
                key={s.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + i * 0.12 }}
                className="flex items-center gap-3 glass-card rounded-xl p-3"
              >
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    i === 0
                      ? "bg-amber-500/20 text-amber-300"
                      : i === 1
                        ? "bg-gray-400/20 text-gray-300"
                        : i === 2
                          ? "bg-orange-500/20 text-orange-300"
                          : "bg-white/5 text-gray-400"
                  }`}
                >
                  {i === 0
                    ? "\uD83E\uDD47"
                    : i === 1
                      ? "\uD83E\uDD48"
                      : i === 2
                        ? "\uD83E\uDD49"
                        : `#${i + 1}`}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-white truncate">
                      {s.name}{" "}
                      <span className="text-gray-500 text-xs">{s.role}</span>
                    </span>
                    <span className="text-sm font-bold text-indigo-300 flex-shrink-0 ml-2">
                      {s.score}
                    </span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-1.5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${s.score}%` }}
                      transition={{ delay: 1 + i * 0.12, duration: 0.8 }}
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 h-1.5 rounded-full"
                    />
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1 truncate">
                    {s.strength}
                  </p>
                </div>
              </motion.div>
            ))}
        </div>
      </div>
    </motion.div>
  );
}
