"use client";

import { useState, useCallback } from "react";
import { useDebateWebSocket } from "@/hooks/useDebateWebSocket";
import TopicInput from "@/components/TopicInput";
import DebateIntro from "@/components/DebateIntro";
import DebateStage from "@/components/DebateStage";
import VerdictCard from "@/components/VerdictCard";
import UserVote from "@/components/UserVote";
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
    forceComplete,
  } = useDebateWebSocket();

  const [audioAllDone, setAudioAllDone] = useState(false);
  const [earlyCompleted, setEarlyCompleted] = useState(false); // user clicked "Complete Debate"
  const [showVoteNow, setShowVoteNow] = useState(false);       // user clicked "Vote Now" after early complete
  const [userVote, setUserVote] = useState<string | null>(null);
  const [voteSkipped, setVoteSkipped] = useState(false);
  const [introReady, setIntroReady] = useState(false);

  const handleAllAudioDone = useCallback(() => {
    setAudioAllDone(true);
  }, []);

  // User confirmed "Complete Debate" — stop WS/TTS, stay on debate screen, reveal all messages
  const handleCompleteEarly = useCallback(() => {
    forceComplete();           // closes WS, sets status → "finished"
    setEarlyCompleted(true);   // unlocks full message display + shows "Vote Now" button
  }, [forceComplete]);

  // User clicked "Vote Now" after reviewing all messages
  const handleVoteNow = useCallback(() => {
    setAudioAllDone(true);     // satisfies the vote/verdict gate
    setShowVoteNow(true);
  }, []);

  const handleDisconnect = useCallback(() => {
    setAudioAllDone(false);
    setEarlyCompleted(false);
    setShowVoteNow(false);
    setUserVote(null);
    setVoteSkipped(false);
    setIntroReady(false);
    disconnect();
  }, [disconnect]);

  const handleStartDebate = useCallback(
    (topic: string, language: string = "english", demo: boolean = false, transcript?: string, numAgents: number = 3, numRounds: number = 4, personaConstraints: string = "") => {
      setAudioAllDone(false);
      setEarlyCompleted(false);
      setShowVoteNow(false);
      setUserVote(null);
      setVoteSkipped(false);
      setIntroReady(false);
      startDebate(topic, language, demo, transcript, numAgents, numRounds, personaConstraints);
    },
    [startDebate]
  );

  const debateDataDone = status === "verdict" || status === "finished";
  const voteDone = userVote !== null || voteSkipped;
  // Show vote overlay: natural (audio done) OR early complete (user clicked Vote Now)
  const showVoteOverlay = ((debateDataDone && audioAllDone) || showVoteNow) && !voteDone;
  // Show verdict: vote is done AND (verdict arrived from server OR user early-completed)
  // audioAllDone must be true — set by handleAllAudioDone (natural) or handleVoteNow (early)
  const showVerdict = voteDone && audioAllDone && (!!verdict || earlyCompleted);

  if (status === "idle") {
    return <TopicInput onSubmit={handleStartDebate} isLoading={false} />;
  }

  // Show intro screen while connecting/generating OR while debating but intro not yet finished
  if (
    status === "connecting" ||
    status === "generating" ||
    (status === "debating" && !introReady)
  ) {
    return (
      <DebateIntro
        setup={setup!}
        statusMessage={statusMessage}
        isGenerating={!setup}
        onReady={() => setIntroReady(true)}
      />
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

  // ── Full-page Verdict screen (replaces everything) ──
  if (showVerdict && setup) {
    // Verdict may still be loading from server (early complete path) — show interim screen
    if (!verdict) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center glass-card-strong rounded-2xl p-10 max-w-sm"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="text-5xl mb-5 inline-block"
            >
              ⚖️
            </motion.div>
            <h2 className="text-lg font-bold text-white mb-2">Generating Verdict...</h2>
            <p className="text-sm text-gray-400">The AI judges are deliberating on the debate.</p>
            <div className="mt-5 flex justify-center gap-1.5">
              {[0,1,2].map(i => (
                <motion.div key={i} className="w-2 h-2 bg-indigo-500 rounded-full"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.2 }}
                />
              ))}
            </div>
          </motion.div>
        </div>
      );
    }
    return (
      <VerdictCard
        verdict={verdict}
        topic={setup.topic}
        userVote={userVote}
        onNewDebate={handleDisconnect}
      />
    );
  }

  // ── Debate screen (with optional UserVote overlay) ──
  return (
    <div className="h-screen flex flex-col p-3 md:p-4">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-3 relative z-10">
        <h1 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm">
            {"\u2696\uFE0F"}
          </span>
          Debate 2 Decision{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
            AI
          </span>
        </h1>
        <button
          onClick={handleDisconnect}
          className="text-sm bg-red-600/80 hover:bg-red-500 border border-red-500/50 text-white font-medium px-4 py-1.5 rounded-lg transition-all shadow-lg shadow-red-500/20"
        >
          New Debate
        </button>
      </div>

      {/* Debate Stage — always rendered while on this screen */}
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
            onCompleteEarly={handleCompleteEarly}
            onVoteNow={handleVoteNow}
            earlyCompleted={earlyCompleted}
            debateFinishedFromServer={debateDataDone}
          />
        </div>
      )}

      {/* Status footer */}
      {(status === "debating" || debateDataDone) && !showVoteOverlay && !earlyCompleted && (
        <div className="text-center mt-2 pb-1 flex-shrink-0">
          <span className="text-xs text-indigo-300/70 flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            {debateDataDone && !audioAllDone ? "Finishing up the debate..." : "Live debate in progress"}
          </span>
        </div>
      )}

      {/* UserVote — fixed overlay, doesn't shift layout */}
      {showVoteOverlay && setup && (
        <UserVote
          agents={setup.agents}
          onVote={(name) => setUserVote(name)}
          onSkip={() => setVoteSkipped(true)}
        />
      )}
    </div>
  );
}
