"use client";

import { motion, AnimatePresence } from "framer-motion";
import AgentAvatar from "./AgentAvatar";
import TypingText from "./TypingText";
import { useSpeechSynthesis } from "./SpeechSynthesis";
import { DebateMessage, DebateSetup } from "@/hooks/useDebateWebSocket";
import { useEffect, useRef, useState, useCallback } from "react";

interface Props {
  setup: DebateSetup;
  messages: DebateMessage[];
  currentRound: string;
  activeAgent: string | null;
  thinkingAgent?: string | null;
  onAllAudioDone?: () => void;
  debateFinishedFromServer?: boolean;
}

const ROUND_ICONS: Record<string, string> = {
  "Opening Statements": "\uD83C\uDFAC",
  "Cross-Examination": "\u2694\uFE0F",
  Rebuttals: "\uD83D\uDEE1\uFE0F",
  "Closing Statements": "\uD83C\uDFC1",
};

export default function DebateStage({
  setup,
  messages,
  currentRound,
  activeAgent,
  thinkingAgent,
  onAllAudioDone,
  debateFinishedFromServer,
}: Props) {
  const { speak, stop } = useSpeechSynthesis();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const lastQueuedRef = useRef<number>(-1);

  const [liveIndex, setLiveIndex] = useState<number>(-1);
  const [liveDurationMs, setLiveDurationMs] = useState<number>(0);
  const [finishedIndex, setFinishedIndex] = useState<number>(-1);

  const debateFinishedRef = useRef(false);

  useEffect(() => {
    if (debateFinishedFromServer) {
      debateFinishedRef.current = true;
    }
  }, [debateFinishedFromServer]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, thinkingAgent, liveIndex]);

  const handleAudioEnd = useCallback(
    (msgIndex: number) => {
      setFinishedIndex(msgIndex);
      if (
        debateFinishedRef.current &&
        msgIndex === lastQueuedRef.current &&
        onAllAudioDone
      ) {
        onAllAudioDone();
      }
    },
    [onAllAudioDone]
  );

  useEffect(() => {
    if (messages.length > 0 && messages.length - 1 > lastQueuedRef.current) {
      const msgIndex = messages.length - 1;
      lastQueuedRef.current = msgIndex;

      if (voiceEnabled && messages[msgIndex].audio) {
        speak(
          messages[msgIndex].audio,
          (durationMs) => {
            setLiveIndex(msgIndex);
            setLiveDurationMs(durationMs);
          },
          () => {
            handleAudioEnd(msgIndex);
          }
        );
      } else {
        setLiveIndex(msgIndex);
        setLiveDurationMs(0);
        handleAudioEnd(msgIndex);
      }
    }
  }, [messages, voiceEnabled, speak, handleAudioEnd]);

  // If server says debate finished and audio is already done (voice off or no audio)
  useEffect(() => {
    if (
      debateFinishedFromServer &&
      !voiceEnabled &&
      onAllAudioDone
    ) {
      onAllAudioDone();
    }
  }, [debateFinishedFromServer, voiceEnabled, onAllAudioDone]);

  // Determine the currently speaking agent based on audio playback, not WebSocket
  const speakingAgentName =
    liveIndex >= 0 && liveIndex > finishedIndex && liveIndex < messages.length
      ? messages[liveIndex].agent.name
      : null;

  // Show thinking only if no agent is currently speaking from audio playback
  const showThinking = thinkingAgent && !speakingAgentName;

  const groupedMessages: Record<string, DebateMessage[]> = {};
  messages.forEach((m) => {
    if (!groupedMessages[m.round_name]) groupedMessages[m.round_name] = [];
    groupedMessages[m.round_name].push(m);
  });

  const completedRounds = Object.keys(groupedMessages).length;
  const totalRounds = 4;
  const progress = Math.min((completedRounds / totalRounds) * 100, 100);

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Header Card */}
      <div className="glass-card-strong rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-white truncate">
              {setup.topic}
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-indigo-300 font-medium bg-indigo-500/10 px-2 py-0.5 rounded-full">
                {setup.industry}
              </span>
              <span className="text-xs text-gray-500">
                {setup.agents.length} agents
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => {
                setVoiceEnabled(!voiceEnabled);
                if (voiceEnabled) stop();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                voiceEnabled
                  ? "bg-indigo-600/80 text-white shadow-lg shadow-indigo-500/20"
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              {voiceEnabled ? "\uD83D\uDD0A ON" : "\uD83D\uDD07 OFF"}
            </button>

            {currentRound && (
              <motion.div
                key={currentRound}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-1.5 bg-indigo-600/20 border border-indigo-500/20 px-3 py-1.5 rounded-lg"
              >
                <span className="text-sm">
                  {ROUND_ICONS[currentRound] || "\uD83D\uDDE3\uFE0F"}
                </span>
                <span className="text-xs font-medium text-indigo-200">
                  {currentRound}
                </span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-white/5 rounded-full h-1 mb-3">
          <motion.div
            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-1 rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Agent Bar - speaking indicator driven by audio playback */}
        <div className="flex justify-center gap-5 flex-wrap">
          {setup.agents.map((agent) => (
            <AgentAvatar
              key={agent.name}
              agent={agent}
              isSpeaking={speakingAgentName === agent.name}
              isThinking={
                showThinking ? thinkingAgent === agent.name : false
              }
              size="sm"
            />
          ))}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-2 pr-1">
        <AnimatePresence>
          {Object.entries(groupedMessages).map(([roundName, roundMsgs]) => (
            <div key={roundName}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center my-4"
              >
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500/20 text-indigo-200 px-5 py-1.5 rounded-full">
                  <span className="text-sm">
                    {ROUND_ICONS[roundName] || ""}
                  </span>
                  <span className="text-sm font-semibold">{roundName}</span>
                </div>
              </motion.div>

              {roundMsgs.map((msg, idx) => {
                const globalIndex = messages.indexOf(msg);
                const isLive = globalIndex === liveIndex && globalIndex > finishedIndex;
                const hasPlayed = globalIndex <= finishedIndex;
                const isWaiting = globalIndex > liveIndex;
                const agentIndex = setup.agents.findIndex(
                  (a) => a.name === msg.agent.name
                );
                const isLeftSide = agentIndex % 2 === 0;

                if (isWaiting) return null;

                return (
                  <motion.div
                    key={`${roundName}-${idx}`}
                    initial={{ opacity: 0, y: 20, x: isLeftSide ? -20 : 20 }}
                    animate={{ opacity: 1, y: 0, x: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className={`flex gap-3 mb-3 ${
                      isLeftSide ? "flex-row" : "flex-row-reverse"
                    }`}
                  >
                    <div className="flex-shrink-0 mt-1">
                      <AgentAvatar
                        agent={msg.agent}
                        isSpeaking={speakingAgentName === msg.agent.name && isLive}
                        size="sm"
                      />
                    </div>

                    <motion.div
                      className={`glass-card rounded-2xl p-4 max-w-[70%] ${
                        isLeftSide ? "rounded-tl-sm" : "rounded-tr-sm"
                      }`}
                      style={{
                        borderColor: msg.agent.avatar_color + "30",
                        boxShadow: isLive
                          ? `0 0 20px ${msg.agent.avatar_color}10`
                          : "none",
                      }}
                      whileHover={{ scale: 1.01 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <span
                          className="text-sm font-bold"
                          style={{ color: msg.agent.avatar_color }}
                        >
                          {msg.agent.name}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            msg.agent.stance === "for"
                              ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/20"
                              : msg.agent.stance === "against"
                                ? "bg-red-500/15 text-red-300 border border-red-500/20"
                                : "bg-amber-500/15 text-amber-300 border border-amber-500/20"
                          }`}
                        >
                          {msg.agent.stance.toUpperCase()}
                        </span>
                      </div>

                      {isLive ? (
                        <TypingText
                          text={msg.content}
                          durationMs={liveDurationMs}
                          className="text-sm text-gray-200 leading-relaxed"
                        />
                      ) : hasPlayed ? (
                        <p className="text-sm text-gray-200 leading-relaxed">
                          {msg.content}
                        </p>
                      ) : null}
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          ))}
        </AnimatePresence>

        {/* Thinking indicator - only shown when no audio is playing */}
        {showThinking && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex justify-center py-3"
          >
            <div className="glass-card rounded-full px-5 py-2 flex items-center gap-3">
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-indigo-400 rounded-full"
                    animate={{ y: [0, -6, 0] }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.8,
                      delay: i * 0.15,
                    }}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-400">
                <span className="text-indigo-300 font-medium">
                  {thinkingAgent}
                </span>{" "}
                is thinking...
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
