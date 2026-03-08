"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  onSubmit: (topic: string, language: string, numAgents: number, numRounds: number, personaConstraints: string) => void;
  isLoading: boolean;
}

const LANGUAGES = [
  { code: "english", label: "English", flag: "\uD83C\uDDEC\uD83C\uDDE7", native: "English" },
  { code: "hindi", label: "Hindi", flag: "\uD83C\uDDEE\uD83C\uDDF3", native: "\u0939\u093F\u0928\u094D\u0926\u0940" },
  { code: "tamil", label: "Tamil", flag: "\uD83C\uDDEE\uD83C\uDDF3", native: "\u0BA4\u0BAE\u0BBF\u0BB4\u0BCD" },
];

const EXAMPLE_TOPICS: Record<string, { text: string; icon: string }[]> = {
  english: [
    { text: "Should AI replace teachers?", icon: "\uD83E\uDD16" },
    { text: "Is remote work sustainable long-term?", icon: "\uD83C\uDFE0" },
    { text: "Should companies adopt a 4-day work week?", icon: "\uD83D\uDCC5" },
    { text: "Is cryptocurrency the future of finance?", icon: "\uD83D\uDCB0" },
    { text: "Should we colonize Mars?", icon: "\uD83D\uDE80" },
    { text: "Is nuclear energy the solution to climate change?", icon: "\u26A1" },
  ],
  hindi: [
    { text: "\u0915\u094D\u092F\u093E AI \u0915\u094B \u0936\u093F\u0915\u094D\u0937\u0915\u094B\u0902 \u0915\u0940 \u091C\u0917\u0939 \u0932\u0947\u0928\u0940 \u091A\u093E\u0939\u093F\u090F?", icon: "\uD83E\uDD16" },
    { text: "\u0915\u094D\u092F\u093E \u0935\u0930\u094D\u0915 \u092B\u094D\u0930\u0949\u092E \u0939\u094B\u092E \u0932\u0902\u092C\u0947 \u0938\u092E\u092F \u0924\u0915 \u091A\u0932 \u0938\u0915\u0924\u093E \u0939\u0948?", icon: "\uD83C\uDFE0" },
    { text: "\u0915\u094D\u092F\u093E \u092D\u093E\u0930\u0924 \u092E\u0947\u0902 \u092F\u0942\u0928\u093F\u0935\u0930\u094D\u0938\u0932 \u092C\u0947\u0938\u093F\u0915 \u0907\u0928\u0915\u092E \u0932\u093E\u0917\u0942 \u0939\u094B\u0928\u0940 \u091A\u093E\u0939\u093F\u090F?", icon: "\uD83D\uDCB0" },
    { text: "\u0915\u094D\u092F\u093E \u092A\u0930\u0940\u0915\u094D\u0937\u093E \u092A\u094D\u0930\u0923\u093E\u0932\u0940 \u092E\u0947\u0902 \u092C\u0926\u0932\u093E\u0935 \u091C\u0930\u0942\u0930\u0940 \u0939\u0948?", icon: "\uD83D\uDCC5" },
    { text: "\u0915\u094D\u092F\u093E \u0915\u094D\u0930\u093F\u0915\u0947\u091F \u092D\u093E\u0930\u0924 \u0915\u093E \u0938\u092C\u0938\u0947 \u092C\u0921\u093C\u093E \u0927\u0930\u094D\u092E \u0939\u0948?", icon: "\u26BD" },
    { text: "\u0915\u094D\u092F\u093E \u0938\u094B\u0936\u0932 \u092E\u0940\u0921\u093F\u092F\u093E \u0938\u092E\u093E\u091C \u0915\u0947 \u0932\u093F\u090F \u0905\u091A\u094D\u0926\u093E \u0939\u0948?", icon: "\uD83D\uDCF1" },
  ],
  tamil: [
    { text: "AI \u0B86\u0B9A\u0BBF\u0BB0\u0BBF\u0BAF\u0BB0\u0BCD\u0B95\u0BB3\u0BC1\u0B95\u0BCD\u0B95\u0BC1 \u0BAA\u0BA4\u0BBF\u0BB2\u0BBE\u0B95 \u0BB5\u0BB0 \u0BAE\u0BC1\u0B9F\u0BBF\u0BAF\u0BC1\u0BAE\u0BBE?", icon: "\uD83E\uDD16" },
    { text: "\u0BB5\u0BC0\u0B9F\u0BCD\u0B9F\u0BBF\u0BB2\u0BBF\u0BB0\u0BC1\u0BA8\u0BCD\u0BA4\u0BC1 \u0BB5\u0BC7\u0BB2\u0BC8 \u0B9A\u0BC6\u0BAF\u0BCD\u0BB5\u0BA4\u0BC1 \u0BA8\u0BBF\u0BB2\u0BC8\u0BAF\u0BBE\u0BA9\u0BA4\u0BBE?", icon: "\uD83C\uDFE0" },
    { text: "\u0BA4\u0BAE\u0BBF\u0BB4\u0BCD\u0BA8\u0BBE\u0B9F\u0BC1 \u0BA4\u0BA9\u0BBF \u0BA8\u0BBE\u0B9F\u0BBE\u0B95 \u0BAA\u0BBF\u0BB0\u0BBF\u0BAF \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BBE?", icon: "\uD83C\uDFD7\uFE0F" },
    { text: "\u0B95\u0BCD\u0BB0\u0BBF\u0B95\u0BCD\u0B95\u0BC6\u0B9F\u0BCD \u0BA4\u0BAE\u0BBF\u0BB4\u0BCD\u0BA8\u0BBE\u0B9F\u0BCD\u0B9F\u0BBF\u0BA9\u0BCD \u0BAE\u0BBF\u0B95\u0BAA\u0BCD\u0BAA\u0BC6\u0BB0\u0BBF\u0BAF \u0BB5\u0BBF\u0BB3\u0BC8\u0BAF\u0BBE\u0B9F\u0BCD\u0B9F\u0BBE?", icon: "\uD83C\uDFCF" },
    { text: "\u0B9A\u0BC2\u0BB0\u0BBF\u0BAF \u0B9A\u0B95\u0BCD\u0BA4\u0BBF \u0BA4\u0BAE\u0BBF\u0BB4\u0BCD\u0BA8\u0BBE\u0B9F\u0BCD\u0B9F\u0BBF\u0BB2\u0BCD \u0BAA\u0BAF\u0BA9\u0BCD\u0BAA\u0B9F\u0BC1\u0BA4\u0BCD\u0BA4 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BBE?", icon: "\u26A1" },
    { text: "\u0B9A\u0BCA\u0BB7\u0BB2\u0BCD \u0BAE\u0BC0\u0B9F\u0BBF\u0BAF\u0BBE \u0BA8\u0BB2\u0BCD\u0BB2\u0BA4\u0BBE \u0B95\u0BC6\u0B9F\u0BCD\u0B9F\u0BA4\u0BBE?", icon: "\uD83D\uDCF1" },
  ],
};

const FLOATING_ICONS = [
  "\uD83E\uDD16", "\uD83D\uDDE3\uFE0F", "\uD83C\uDFC6", "\u2696\uFE0F",
  "\uD83D\uDCA1", "\uD83C\uDF0D", "\uD83D\uDD25", "\uD83C\uDFAF",
];

export default function TopicInput({ onSubmit, isLoading }: Props) {
  const [topic, setTopic] = useState("");
  const [language, setLanguage] = useState("english");
  const [numAgents, setNumAgents] = useState(3);
  const [numRounds, setNumRounds] = useState(4);
  const [showConfig, setShowConfig] = useState(false);
  const [personaConstraints, setPersonaConstraints] = useState("");
  const [checking, setChecking] = useState(false);
  const [sensitivityWarning, setSensitivityWarning] = useState<{
    level: string;
    categories: string[];
    warning: string;
    suggestion: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setChecking(true);
    try {
      const res = await fetch("http://localhost:8000/api/check-topic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim() }),
      });
      const data = await res.json();
      setSensitivityWarning(data);
    } catch {
      // If check fails, proceed anyway
      onSubmit(topic.trim(), language, numAgents, numRounds, personaConstraints.trim());
    }
    setChecking(false);
  };

  const handleProceedAnyway = () => {
    setSensitivityWarning(null);
    onSubmit(topic.trim(), language, numAgents, numRounds, personaConstraints.trim());
  };

  const handleUseSuggestion = () => {
    if (sensitivityWarning?.suggestion) {
      setTopic(sensitivityWarning.suggestion);
    }
    setSensitivityWarning(null);
  };

  const handleDismissWarning = () => {
    setSensitivityWarning(null);
  };

  const ROUND_LABELS: Record<number, string[]> = {
    2: ["Opening Statements", "Closing Statements"],
    3: ["Opening Statements", "Cross-Examination", "Closing Statements"],
    4: ["Opening Statements", "Cross-Examination", "Rebuttals", "Closing Statements"],
  };

  const currentExamples = EXAMPLE_TOPICS[language] || EXAMPLE_TOPICS.english;

  return (
    <div className="flex items-center justify-center min-h-screen p-4 relative overflow-hidden">
      {FLOATING_ICONS.map((icon, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl opacity-10 select-none pointer-events-none"
          initial={{
            x: `${(i * 13 + 5) % 90}vw`,
            y: `${(i * 17 + 10) % 85}vh`,
          }}
          animate={{
            y: [
              `${(i * 17 + 10) % 85}vh`,
              `${((i * 17 + 10) % 85) - 15}vh`,
              `${(i * 17 + 10) % 85}vh`,
            ],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 4 + i * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {icon}
        </motion.div>
      ))}

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-2xl relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="inline-block mb-4"
          >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-4xl mx-auto shadow-lg shadow-indigo-500/30">
              {"\u2696\uFE0F"}
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl font-extrabold text-white mb-3 tracking-tight"
          >
            Multi-Agent{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 animated-gradient">
              Debate AI
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-gray-400 text-lg max-w-md mx-auto"
          >
            AI creates expert personas and runs a live multi-agent debate with
            real-time arguments, rebuttals, and a final verdict.
          </motion.p>
        </div>

        {/* Input card */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card-strong rounded-2xl p-6 shadow-2xl shadow-indigo-500/5"
        >
          {/* Language selector */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-300 block mb-2">
              Debate Language
            </label>
            <div className="flex gap-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    setLanguage(lang.code);
                    setTopic("");
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    language === lang.code
                      ? "bg-indigo-600/80 text-white border border-indigo-500/50 shadow-lg shadow-indigo-500/20"
                      : "bg-white/[0.03] text-gray-400 border border-white/[0.06] hover:bg-white/[0.08] hover:border-indigo-500/30"
                  }`}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <span>{lang.label}</span>
                  <span className="text-xs opacity-60">({lang.native})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Config toggle */}
          <div className="mb-4">
            <button
              type="button"
              onClick={() => setShowConfig(!showConfig)}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
            >
              <svg className={`w-3 h-3 transition-transform ${showConfig ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
              Advanced Settings
            </button>

            {showConfig && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-3 grid grid-cols-2 gap-4"
              >
                <div>
                  <label className="text-xs font-medium text-gray-400 block mb-1.5">
                    Number of Agents
                  </label>
                  <div className="flex gap-1.5">
                    {[2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setNumAgents(n)}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                          numAgents === n
                            ? "bg-indigo-600/80 text-white border border-indigo-500/50"
                            : "bg-white/[0.03] text-gray-400 border border-white/[0.06] hover:bg-white/[0.08]"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-400 block mb-1.5">
                    Number of Rounds
                  </label>
                  <div className="flex gap-1.5">
                    {[2, 3, 4].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setNumRounds(n)}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                          numRounds === n
                            ? "bg-indigo-600/80 text-white border border-indigo-500/50"
                            : "bg-white/[0.03] text-gray-400 border border-white/[0.06] hover:bg-white/[0.08]"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {(ROUND_LABELS[numRounds] || []).map((r) => (
                      <span key={r} className="text-[10px] text-gray-500 bg-white/[0.03] px-1.5 py-0.5 rounded">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Persona constraints */}
                <div className="col-span-2">
                  <label className="text-xs font-medium text-gray-400 block mb-1.5">
                    Persona Constraints <span className="text-gray-600">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={personaConstraints}
                    onChange={(e) => setPersonaConstraints(e.target.value)}
                    placeholder='e.g. "include someone from healthcare", "all female agents", "one neutral economist"'
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                  />
                  <p className="text-[10px] text-gray-600 mt-1">
                    Define specific requirements for the AI-generated debate personas
                  </p>
                </div>
              </motion.div>
            )}
          </div>

          <label className="text-sm font-medium text-gray-300 block mb-2">
            Enter a Debate Topic
          </label>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder={
                  language === "hindi"
                    ? "\u0909\u0926\u093E\u0939\u0930\u0923: \u0915\u094D\u092F\u093E AI \u0936\u093F\u0915\u094D\u0937\u0915\u094B\u0902 \u0915\u0940 \u091C\u0917\u0939 \u0932\u0947 \u0938\u0915\u0924\u093E \u0939\u0948?"
                    : language === "tamil"
                      ? "\u0B89\u0BA4\u0BBE\u0BB0\u0BA3\u0BAE\u0BCD: AI \u0B86\u0B9A\u0BBF\u0BB0\u0BBF\u0BAF\u0BB0\u0BCD\u0B95\u0BB3\u0BC1\u0B95\u0BCD\u0B95\u0BC1 \u0BAA\u0BA4\u0BBF\u0BB2\u0BBE\u0B95 \u0BB5\u0BB0 \u0BAE\u0BC1\u0B9F\u0BBF\u0BAF\u0BC1\u0BAE\u0BBE?"
                      : "e.g. Should we move to Microservices?"
                }
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-base"
                disabled={isLoading}
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={!topic.trim() || isLoading || checking}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 text-white font-semibold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 disabled:shadow-none"
            >
              {isLoading || checking ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  {checking ? "Checking..." : "Starting..."}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Start Debate
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </span>
              )}
            </button>
          </div>

          <div className="mt-5">
            <p className="text-xs text-gray-500 mb-3 uppercase tracking-wider font-medium">
              Popular Topics
            </p>
            <div className="grid grid-cols-2 gap-2">
              {currentExamples.map((ex) => (
                <button
                  key={ex.text}
                  type="button"
                  onClick={() => setTopic(ex.text)}
                  className="text-left text-sm bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-indigo-500/30 text-gray-300 px-4 py-2.5 rounded-xl transition-all flex items-center gap-2.5 group"
                >
                  <span className="text-lg group-hover:scale-110 transition-transform">
                    {ex.icon}
                  </span>
                  <span className="truncate">{ex.text}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.form>

        {/* Footer features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="flex justify-center gap-8 mt-8"
        >
          {[
            { icon: "\uD83E\uDD16", label: "AI Personas" },
            { icon: "\uD83D\uDD04", label: "2-4 Rounds" },
            { icon: "\uD83C\uDFC6", label: "Final Verdict" },
            { icon: "\uD83C\uDF10", label: "Multi-Language" },
          ].map((f) => (
            <div key={f.label} className="flex flex-col items-center gap-1">
              <span className="text-xl">{f.icon}</span>
              <span className="text-[11px] text-gray-500 font-medium">
                {f.label}
              </span>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Sensitivity Warning Modal */}
      <AnimatePresence>
        {sensitivityWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={handleDismissWarning}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="glass-card-strong rounded-2xl p-6 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const level = sensitivityWarning.level;
                const config = {
                  low: { icon: "\u2705", color: "emerald", title: "Topic Sensitivity Review", badge: "LOW", badgeBg: "bg-emerald-500/20 border-emerald-500/30 text-emerald-300" },
                  medium: { icon: "\u26A0\uFE0F", color: "amber", title: "Topic Sensitivity Review", badge: "MEDIUM", badgeBg: "bg-amber-500/20 border-amber-500/30 text-amber-300" },
                  high: { icon: "\uD83D\uDEA8", color: "red", title: "Topic Sensitivity Review", badge: "HIGH", badgeBg: "bg-red-500/20 border-red-500/30 text-red-300" },
                }[level] || { icon: "\u2705", color: "emerald", title: "Topic Sensitivity Review", badge: "LOW", badgeBg: "bg-emerald-500/20 border-emerald-500/30 text-emerald-300" };

                const barColor = { low: "bg-emerald-500", medium: "bg-amber-500", high: "bg-red-500" }[level] || "bg-emerald-500";
                const barWidth = { low: "33%", medium: "66%", high: "100%" }[level] || "33%";
                const categoryBg = { low: "bg-emerald-500/10 border-emerald-500/20 text-emerald-300", medium: "bg-amber-500/10 border-amber-500/20 text-amber-300", high: "bg-red-500/10 border-red-500/20 text-red-300" }[level] || "bg-emerald-500/10 border-emerald-500/20 text-emerald-300";
                const msgBg = { low: "bg-emerald-500/10 border-emerald-500/20", medium: "bg-amber-500/10 border-amber-500/20", high: "bg-red-500/10 border-red-500/20" }[level] || "bg-emerald-500/10 border-emerald-500/20";

                return (
                  <>
                    <div className="text-center mb-4">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.1 }}
                        className="text-4xl mb-2 inline-block"
                      >
                        {config.icon}
                      </motion.div>
                      <h3 className="text-lg font-bold text-white">{config.title}</h3>
                    </div>

                    {/* Sensitivity meter */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-gray-400">Sensitivity Level</span>
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${config.badgeBg}`}>
                          {config.badge}
                        </span>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden">
                        <motion.div
                          className={`h-2.5 rounded-full ${barColor}`}
                          initial={{ width: 0 }}
                          animate={{ width: barWidth }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                        />
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-[9px] text-emerald-400/60">Low</span>
                        <span className="text-[9px] text-amber-400/60">Medium</span>
                        <span className="text-[9px] text-red-400/60">High</span>
                      </div>
                    </div>

                    {/* Description */}
                    {sensitivityWarning.warning && (
                      <div className={`rounded-xl p-3 mb-4 border ${msgBg}`}>
                        <p className="text-sm text-gray-200 leading-relaxed">
                          {sensitivityWarning.warning}
                        </p>
                      </div>
                    )}

                    {/* Categories */}
                    {sensitivityWarning.categories.length > 0 && (
                      <div className="mb-4">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium mb-1.5">Topic Categories</p>
                        <div className="flex flex-wrap gap-1.5">
                          {sensitivityWarning.categories.map((cat) => (
                            <span
                              key={cat}
                              className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${categoryBg}`}
                            >
                              {cat}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Suggestion (only for medium/high) */}
                    {sensitivityWarning.suggestion && level !== "low" && (
                      <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3 mb-4">
                        <p className="text-[11px] text-indigo-300/70 font-medium uppercase tracking-wider mb-1">
                          Suggested Alternative
                        </p>
                        <p className="text-sm text-indigo-200">{sensitivityWarning.suggestion}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      {level === "low" ? (
                        <button
                          onClick={handleProceedAnyway}
                          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-500/25 text-sm"
                        >
                          Approve & Start Debate
                        </button>
                      ) : (
                        <>
                          {sensitivityWarning.suggestion && (
                            <button
                              onClick={handleUseSuggestion}
                              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-500/25 text-sm"
                            >
                              Use Suggested Topic
                            </button>
                          )}
                          <button
                            onClick={handleProceedAnyway}
                            className={`w-full py-2.5 rounded-xl transition-all text-sm font-medium border ${
                              level === "high"
                                ? "bg-red-500/10 border-red-500/20 text-red-300 hover:bg-red-500/20"
                                : "bg-amber-500/10 border-amber-500/20 text-amber-300 hover:bg-amber-500/20"
                            }`}
                          >
                            Proceed Anyway
                          </button>
                        </>
                      )}
                      <button
                        onClick={handleDismissWarning}
                        className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 py-2.5 rounded-xl transition-all text-sm"
                      >
                        Change Topic
                      </button>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
