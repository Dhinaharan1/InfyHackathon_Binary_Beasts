"use client";

import { useState, useCallback } from "react";
import { useDebateWebSocket } from "@/hooks/useDebateWebSocket";
import TopicInput from "@/components/TopicInput";
import DebateStage from "@/components/DebateStage";
import VerdictCard from "@/components/VerdictCard";
import UserVote from "@/components/UserVote";
import VoteComparison from "@/components/VoteComparison";
import FactCheckOverlay from "@/components/FactCheckOverlay";
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
    analyses,
    pauseData,
    error,
    statusMessage,
    startDebate,
    sendInterjection,
    skipInterjection,
    disconnect,
  } = useDebateWebSocket();

  const [audioAllDone, setAudioAllDone] = useState(false);
  const [userVote, setUserVote] = useState<string | null>(null);
  const [voteSkipped, setVoteSkipped] = useState(false);

  const handleAllAudioDone = useCallback(() => {
    setAudioAllDone(true);
  }, []);

  const handleDisconnect = useCallback(() => {
    setAudioAllDone(false);
    setUserVote(null);
    setVoteSkipped(false);
    disconnect();
  }, [disconnect]);

  const handleStartDebate = useCallback(
    (topic: string, language: string = "english", demo: boolean = false, transcript?: string, numAgents: number = 3, numRounds: number = 4, personaConstraints: string = "") => {
      setAudioAllDone(false);
      setUserVote(null);
      setVoteSkipped(false);
      startDebate(topic, language, demo, transcript, numAgents, numRounds, personaConstraints);
    },
    [startDebate]
  );

  const debateDataDone = status === "verdict" || status === "finished";
  const voteDone = userVote !== null || voteSkipped;
  const showVoteScreen = debateDataDone && audioAllDone && !voteDone;
  const showVerdict = verdict && audioAllDone && voteDone;

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
      <div className="flex justify-between items-center mb-3 relative z-50">
        <h1 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm">
            {"\u2696\uFE0F"}
          </span>
          Debate 2 Decision{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
            AI
          </span>
        </h1>
        <div className="flex items-center gap-2">
          {analyses.length > 0 && <FactCheckOverlay analyses={analyses} />}
          <button
            onClick={handleDisconnect}
            className="text-sm bg-red-600/80 hover:bg-red-500 border border-red-500/50 text-white font-medium px-4 py-1.5 rounded-lg transition-all shadow-lg shadow-red-500/20"
          >
            New Debate
          </button>
        </div>
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
            analyses={analyses}
            pauseData={pauseData}
            onSendInterjection={sendInterjection}
            onSkipInterjection={skipInterjection}
            onAllAudioDone={handleAllAudioDone}
            onStop={handleDisconnect}
            debateFinishedFromServer={debateDataDone}
          />
        </div>
      )}

      {/* User Vote - shown after audio finishes, before verdict */}
      {showVoteScreen && setup && (
        <UserVote
          agents={setup.agents}
          onVote={(name) => setUserVote(name)}
          onSkip={() => setVoteSkipped(true)}
        />
      )}

      {/* Verdict + Vote Comparison */}
      {showVerdict && setup && (
        <>
          {userVote && verdict && (
            <VoteComparison userVote={userVote} aiWinner={verdict.winner} />
          )}
          <VerdictCard verdict={verdict} topic={setup.topic} />
        </>
      )}

      {/* Status footer */}
      <div className="text-center mt-2 pb-1">
        {!showVerdict && !showVoteScreen && (status === "debating" || debateDataDone) && (
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
