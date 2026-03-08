"use client";

import { useState, useCallback } from "react";
import { useDebateWebSocket } from "@/hooks/useDebateWebSocket";
import TopicInput from "@/components/TopicInput";
import DebateStage from "@/components/DebateStage";
import VerdictCard from "@/components/VerdictCard";
import { motion } from "framer-motion";

export default function Home() {
  const {
    status,
    setup,
    messages,
    currentRound,
    activeAgent,
    thinkingAgent,
    verdict,
    error,
    statusMessage,
    startDebate,
    disconnect,
  } = useDebateWebSocket();

  // Only show verdict after all audio has finished playing
  const [audioAllDone, setAudioAllDone] = useState(false);

  const handleAllAudioDone = useCallback(() => {
    setAudioAllDone(true);
  }, []);

  const handleDisconnect = useCallback(() => {
    setAudioAllDone(false);
    disconnect();
  }, [disconnect]);

  const handleStartDebate = useCallback(
    (topic: string, language: string = "english") => {
      setAudioAllDone(false);
      startDebate(topic, language);
    },
    [startDebate]
  );

  // Verdict is ready to show only when server sent it AND all audio finished
  const showVerdict = verdict && audioAllDone;

  // Server says debate data is done (verdict received or finished status)
  const debateDataDone =
    status === "verdict" || status === "finished";

  if (status === "idle") {
    return <TopicInput onSubmit={handleStartDebate} isLoading={false} />;
  }

  if (status === "connecting" || status === "generating") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative mb-8">
            <motion.div
              className="w-20 h-20 rounded-full border-2 border-indigo-500/30 mx-auto"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
            />
            <motion.div
              className="w-20 h-20 rounded-full border-t-2 border-r-2 border-purple-500 mx-auto absolute top-0 left-1/2 -translate-x-1/2"
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-3xl">
              {status === "connecting" ? "\uD83D\uDD17" : "\uD83E\uDD16"}
            </div>
          </div>

          <h2 className="text-xl font-semibold text-white mb-2">
            {status === "connecting"
              ? "Connecting to debate server..."
              : "Setting up the debate..."}
          </h2>
          <p className="text-gray-400 text-sm max-w-sm mx-auto">
            {statusMessage ||
              "AI is analyzing the topic and creating expert debate personas"}
          </p>

          <motion.div
            className="mt-6 flex justify-center gap-1"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-indigo-500 rounded-full"
                animate={{ y: [0, -8, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 1,
                  delay: i * 0.15,
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center glass-card-strong rounded-2xl p-8 max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring" }}
            className="text-5xl mb-4"
          >
            {"\u26A0\uFE0F"}
          </motion.div>
          <h2 className="text-xl font-semibold text-white mb-2">Error</h2>
          <p className="text-red-400 text-sm mb-6 leading-relaxed">{error}</p>
          <button
            onClick={handleDisconnect}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-8 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-500/25 font-medium"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col p-3 md:p-4">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-3">
        <h1 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm">
            {"\u2696\uFE0F"}
          </span>
          Multi-Agent{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
            Debate AI
          </span>
        </h1>
        <button
          onClick={handleDisconnect}
          className="text-sm bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 px-4 py-1.5 rounded-lg transition-all hover:border-indigo-500/30"
        >
          New Debate
        </button>
      </div>

      {/* Debate Stage */}
      {setup && (
        <div className="flex-1 overflow-hidden">
          <DebateStage
            setup={setup}
            messages={messages}
            currentRound={currentRound}
            activeAgent={activeAgent}
            thinkingAgent={thinkingAgent}
            onAllAudioDone={handleAllAudioDone}
            debateFinishedFromServer={debateDataDone}
          />
        </div>
      )}

      {/* Verdict - only shown after all audio has finished */}
      {showVerdict && setup && (
        <VerdictCard verdict={verdict} topic={setup.topic} />
      )}

      {/* Status footer */}
      <div className="text-center mt-2 pb-1">
        {!showVerdict && (status === "debating" || debateDataDone) && (
          <span className="text-xs text-indigo-300/70 flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            {debateDataDone && !audioAllDone
              ? "Finishing up the debate..."
              : "Live debate in progress"}
          </span>
        )}
        {showVerdict && (
          <span className="text-xs text-gray-500">
            Debate complete. Click &quot;New Debate&quot; to start another.
          </span>
        )}
      </div>
    </div>
  );
}
