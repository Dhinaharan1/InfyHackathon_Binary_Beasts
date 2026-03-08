"use client";

import { motion, AnimatePresence } from "framer-motion";
import AnimatedAvatar from "./AnimatedAvatar";
import TypingText from "./TypingText";
import SentimentChart from "./SentimentChart";
import InterjectionInput from "./InterjectionInput";

import { useSpeechSynthesis } from "./SpeechSynthesis";
import { DebateMessage, DebateSetup, AnalysisResult } from "@/hooks/useDebateWebSocket";
import { useEffect, useRef, useState, useCallback } from "react";

interface Props {
  setup: DebateSetup;
  messages: DebateMessage[];
  currentRound: string;
  activeAgent: string | null;
  thinkingAgent?: string | null;
  analyses?: AnalysisResult[];
  pauseData?: { nextRound: string; timeoutSeconds: number } | null;
  onSendInterjection?: (text: string) => void;
  onSkipInterjection?: () => void;
  onAllAudioDone?: () => void;
  onStop?: () => void;
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
  analyses = [],
  pauseData,
  onSendInterjection,
  onSkipInterjection,
  onAllAudioDone,
  onStop,
  debateFinishedFromServer,
}: Props) {
  const { speak, stop, pause, resume, paused, getAmplitude } =
    useSpeechSynthesis();
  const scrollRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const lastQueuedRef = useRef<number>(-1);
  const [showStopConfirm, setShowStopConfirm] = useState(false);

  const [liveIndex, setLiveIndex] = useState<number>(-1);
  const [liveDurationMs, setLiveDurationMs] = useState<number>(0);
  const [finishedIndex, setFinishedIndex] = useState<number>(-1);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

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
  }, [messages, thinkingAgent, finishedIndex]);

  const handleAudioEnd = useCallback(
    (msgIndex: number) => {
      setFinishedIndex(msgIndex);
      setIsVideoPlaying(false);
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
      const msg = messages[msgIndex];
      lastQueuedRef.current = msgIndex;

      if (msg.video_url) {
        setLiveIndex(msgIndex);
        setIsVideoPlaying(true);
        setLiveDurationMs(0);
        return;
      }

      if (voiceEnabled && msg.audio) {
        speak(
          msg.audio,
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

  useEffect(() => {
    if (debateFinishedFromServer && !voiceEnabled && onAllAudioDone) {
      onAllAudioDone();
    }
  }, [debateFinishedFromServer, voiceEnabled, onAllAudioDone]);

  const speakingAgentName =
    liveIndex >= 0 && liveIndex > finishedIndex && liveIndex < messages.length
      ? messages[liveIndex].agent.name
      : null;

  const showThinking = thinkingAgent && !speakingAgentName;

  const groupedRounds = new Set(messages.map((m) => m.round_name));
  const completedRounds = groupedRounds.size;
  const totalRounds = 4;
  const progress = Math.min((completedRounds / totalRounds) * 100, 100);

  const finishedMessages = messages.slice(0, finishedIndex + 1);
  const liveMessage =
    liveIndex >= 0 && liveIndex > finishedIndex && liveIndex < messages.length
      ? messages[liveIndex]
      : null;

  const historyByRound: Record<string, DebateMessage[]> = {};
  finishedMessages.forEach((m) => {
    if (!historyByRound[m.round_name]) historyByRound[m.round_name] = [];
    historyByRound[m.round_name].push(m);
  });

  const hasVideo = liveMessage?.video_url;
  const speakingAgent = speakingAgentName
    ? setup.agents.find((a) => a.name === speakingAgentName)
    : null;

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Header */}
      <div className="glass-card-strong rounded-xl p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-white truncate">
              {setup.topic}
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-indigo-300 font-medium bg-indigo-500/10 px-2 py-0.5 rounded-full">
                {setup.industry}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => {
                const turningOff = voiceEnabled;
                setVoiceEnabled(!voiceEnabled);
                if (turningOff) {
                  stop();
                  if (videoRef.current) {
                    videoRef.current.pause();
                    videoRef.current.src = "";
                  }
                  if (liveIndex >= 0 && liveIndex > finishedIndex) {
                    setLiveDurationMs(0);
                    setFinishedIndex(liveIndex);
                    setIsVideoPlaying(false);
                  }
                }
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                voiceEnabled
                  ? "bg-indigo-600/80 text-white shadow-lg shadow-indigo-500/20"
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              {voiceEnabled ? "\uD83D\uDD0A ON" : "\uD83D\uDD07 OFF"}
            </button>

            {!hasVideo && (
              <button
                onClick={() => {
                  if (paused) resume();
                  else pause();
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  paused
                    ? "bg-amber-600/80 text-white shadow-lg shadow-amber-500/20"
                    : "bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10"
                }`}
              >
                {paused ? "\u25B6 Resume" : "\u23F8 Pause"}
              </button>
            )}

            <button
              onClick={() => {
                pause();
                if (videoRef.current) videoRef.current.pause();
                setShowStopConfirm(true);
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all bg-red-600/80 text-white hover:bg-red-500 shadow-lg shadow-red-500/20"
            >
              {"\u23F9"} Stop
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

        <div className="w-full bg-white/5 rounded-full h-1">
          <motion.div
            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-1 rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Main Stage */}
      <div className="glass-card rounded-xl p-4 flex-1 min-h-0 overflow-hidden flex flex-col justify-start">
        {hasVideo && liveMessage && speakingAgent ? (
          /* ── Video Mode: compact video + all agents panel ── */
          <div className="flex flex-col gap-4">
            {/* Top row: all agents + video side by side */}
            <div className="flex items-start gap-5">
              {/* Left: agent panel */}
              <div className="flex flex-col gap-3 flex-shrink-0">
                {setup.agents.map((agent) => {
                  const isSpeaker = speakingAgentName === agent.name;
                  return (
                    <motion.div
                      key={agent.name}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                        isSpeaker
                          ? "glass-card-strong"
                          : "bg-white/[0.02]"
                      }`}
                      animate={{ opacity: isSpeaker ? 1 : 0.6 }}
                    >
                      <div className="relative flex-shrink-0">
                        <div
                          className="w-12 h-12 rounded-full overflow-hidden border-2"
                          style={{
                            borderColor: isSpeaker
                              ? agent.avatar_color
                              : agent.avatar_color + "40",
                            boxShadow: isSpeaker
                              ? `0 0 12px ${agent.avatar_color}40`
                              : "none",
                          }}
                        >
                          {agent.avatar_image ? (
                            <img
                              src={
                                agent.avatar_image.startsWith("data:")
                                  ? agent.avatar_image
                                  : `data:image/png;base64,${agent.avatar_image}`
                              }
                              alt={agent.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div
                              className="w-full h-full flex items-center justify-center text-white text-sm font-bold"
                              style={{ backgroundColor: agent.avatar_color }}
                            >
                              {agent.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)}
                            </div>
                          )}
                        </div>
                        {isSpeaker && (
                          <motion.div
                            className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-gray-900 flex items-center justify-center"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                          >
                            <div className="w-1.5 h-1.5 bg-white rounded-full" />
                          </motion.div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p
                          className="text-xs font-semibold truncate"
                          style={{ color: agent.avatar_color }}
                        >
                          {agent.name}
                        </p>
                        <p className="text-[10px] text-gray-500 truncate">
                          {agent.role}
                        </p>
                        <span
                          className={`inline-block text-[9px] px-1.5 py-0.5 rounded-full font-semibold mt-0.5 ${
                            agent.stance === "for"
                              ? "bg-emerald-500/15 text-emerald-400"
                              : agent.stance === "against"
                                ? "bg-red-500/15 text-red-400"
                                : "bg-amber-500/15 text-amber-400"
                          }`}
                        >
                          {agent.stance.toUpperCase()}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Right: video player */}
              <div className="flex-1 min-w-0">
                <div
                  className="relative rounded-xl overflow-hidden border"
                  style={{
                    borderColor: speakingAgent.avatar_color + "30",
                  }}
                >
                  <video
                    ref={videoRef}
                    src={liveMessage.video_url!}
                    autoPlay
                    className="w-full aspect-[4/5] object-cover bg-gray-900"
                    onPlay={() => {
                      setIsVideoPlaying(true);
                      if (videoRef.current) {
                        setLiveDurationMs(
                          (videoRef.current.duration || 10) * 1000
                        );
                      }
                    }}
                    onEnded={() => handleAudioEnd(liveIndex)}
                    onError={() => handleAudioEnd(liveIndex)}
                  />

                  {/* Name overlay at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-0.5 h-6 rounded-full"
                        style={{
                          backgroundColor: speakingAgent.avatar_color,
                        }}
                      />
                      <div>
                        <p
                          className="text-xs font-bold"
                          style={{ color: speakingAgent.avatar_color }}
                        >
                          {speakingAgent.name}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {speakingAgent.role}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Speech text below */}
            <motion.div
              key={liveIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-xl p-3"
              style={{
                borderColor: liveMessage.agent.avatar_color + "20",
              }}
            >
              <TypingText
                text={liveMessage.content}
                durationMs={liveDurationMs}
                paused={false}
                className="text-sm text-gray-200 leading-relaxed"
              />
            </motion.div>
          </div>
        ) : (
          /* ── Static Avatar Mode: spotlight layout ── */
          <>
            <div className="flex items-center justify-center gap-6 md:gap-10">
              {setup.agents.map((agent) => {
                const isSpeaker = speakingAgentName === agent.name;
                const isThinkingAgent =
                  showThinking && thinkingAgent === agent.name;
                const isOtherSpeaking =
                  speakingAgentName && !isSpeaker && !isThinkingAgent;

                let avatarState:
                  | "idle"
                  | "speaking"
                  | "listening"
                  | "thinking" = "idle";
                if (isSpeaker) avatarState = "speaking";
                else if (isThinkingAgent) avatarState = "thinking";
                else if (isOtherSpeaking) avatarState = "listening";

                return (
                  <motion.div
                    key={agent.name}
                    layout
                    className="flex flex-col items-center gap-2"
                    animate={{
                      opacity: isSpeaker || !speakingAgentName ? 1 : 0.7,
                    }}
                    transition={{ duration: 0.4 }}
                  >
                    <AnimatedAvatar
                      avatarImage={agent.avatar_image}
                      agentName={agent.name}
                      agentColor={agent.avatar_color}
                      state={avatarState}
                      getAmplitude={isSpeaker ? getAmplitude : undefined}
                      size={isSpeaker ? "lg" : "sm"}
                    />
                    <div className="text-center min-w-[80px] max-w-[160px]">
                      <p
                        className={`font-semibold leading-tight ${
                          isSpeaker ? "text-sm" : "text-xs"
                        }`}
                        style={{ color: agent.avatar_color }}
                      >
                        {agent.name}
                      </p>
                      <p
                        className={`text-gray-400 leading-tight ${
                          isSpeaker ? "text-xs" : "text-[10px]"
                        }`}
                      >
                        {agent.role}
                      </p>
                      <span
                        className={`inline-block mt-1 text-[9px] px-2 py-0.5 rounded-full font-semibold ${
                          agent.stance === "for"
                            ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/20"
                            : agent.stance === "against"
                              ? "bg-red-500/15 text-red-300 border border-red-500/20"
                              : "bg-amber-500/15 text-amber-300 border border-amber-500/20"
                        }`}
                      >
                        {agent.stance.toUpperCase()}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              {liveMessage && (
                <motion.div
                  key={liveIndex}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="mt-3 glass-card rounded-2xl p-3 max-w-2xl mx-auto max-h-[80px] overflow-y-auto"
                  style={{
                    borderColor: liveMessage.agent.avatar_color + "40",
                    boxShadow: `0 0 20px ${liveMessage.agent.avatar_color}10`,
                  }}
                  ref={(el) => {
                    if (el) {
                      const observer = new MutationObserver(() => {
                        el.scrollTop = el.scrollHeight;
                      });
                      observer.observe(el, { childList: true, subtree: true, characterData: true });
                    }
                  }}
                >
                  <TypingText
                    text={liveMessage.content}
                    durationMs={liveDurationMs}
                    paused={paused}
                    className="text-sm text-gray-200 leading-relaxed text-center"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        {/* Thinking indicator */}
        {showThinking && !liveMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 flex justify-center"
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

      {/* Interjection Input - floating modal overlay */}
      <AnimatePresence>
        {pauseData && onSendInterjection && onSkipInterjection && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <InterjectionInput
                nextRound={pauseData.nextRound}
                timeoutSeconds={pauseData.timeoutSeconds}
                onSubmit={onSendInterjection}
                onSkip={onSkipInterjection}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Sentiment Chart */}
      <AnimatePresence>
        {analyses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-4 right-4 z-40"
          >
            <SentimentChart analyses={analyses} agents={setup.agents} />
          </motion.div>
        )}
      </AnimatePresence>



      

      {/* Stop Confirmation */}
      <AnimatePresence>
        {showStopConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass-card-strong rounded-2xl p-6 max-w-sm mx-4 text-center"
            >
              <div className="text-4xl mb-3">{"\u26A0\uFE0F"}</div>
              <h3 className="text-lg font-bold text-white mb-2">
                Stop Discussion?
              </h3>
              <p className="text-sm text-gray-400 mb-5">
                This will end the current debate and return to the main screen.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => {
                    setShowStopConfirm(false);
                    resume();
                    if (videoRef.current) videoRef.current.play();
                  }}
                  className="px-5 py-2 rounded-xl text-sm font-medium bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowStopConfirm(false);
                    stop();
                    if (videoRef.current) {
                      videoRef.current.pause();
                      videoRef.current.src = "";
                    }
                    setIsVideoPlaying(false);
                    onStop?.();
                  }}
                  className="px-5 py-2 rounded-xl text-sm font-medium bg-red-600 hover:bg-red-500 text-white transition-all shadow-lg shadow-red-500/25"
                >
                  Stop Debate
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
