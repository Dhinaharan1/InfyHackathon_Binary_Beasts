"use client";

import { motion, AnimatePresence } from "framer-motion";
import AnimatedAvatar from "./AnimatedAvatar";
import TypingText from "./TypingText";
import InterjectionInput from "./InterjectionInput";
import { useSpeechSynthesis } from "./SpeechSynthesis";
import { DebateMessage, DebateSetup, AnalysisResult, FactCheck } from "@/hooks/useDebateWebSocket";
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
  onCompleteEarly?: () => void;
  onVoteNow?: () => void;
  earlyCompleted?: boolean;
  debateFinishedFromServer?: boolean;
}

const ROUND_ICONS: Record<string, string> = {
  "Opening Statements": "🎬",
  "Cross-Examination": "⚔️",
  Rebuttals: "🛡️",
  "Closing Statements": "🏁",
};

const FACT_VERDICT_CONFIG: Record<string, { icon: string; color: string; bg: string; border: string; label: string }> = {
  true: { icon: "✅", color: "text-emerald-300", bg: "bg-emerald-500/10", border: "border-emerald-500/25", label: "Verified" },
  mostly_true: { icon: "🟢", color: "text-green-300", bg: "bg-green-500/10", border: "border-green-500/20", label: "Mostly True" },
  unverified: { icon: "❓", color: "text-yellow-300", bg: "bg-yellow-500/10", border: "border-yellow-500/20", label: "Unverified" },
  misleading: { icon: "⚠️", color: "text-orange-300", bg: "bg-orange-500/10", border: "border-orange-500/20", label: "Misleading" },
  false: { icon: "❌", color: "text-red-300", bg: "bg-red-500/10", border: "border-red-500/20", label: "False" },
};

type MetricKey = "overall" | "persuasiveness" | "emotional_impact" | "factual_strength";

const METRICS: { key: MetricKey; label: string }[] = [
  { key: "overall", label: "Overall" },
  { key: "persuasiveness", label: "Persuasion" },
  { key: "emotional_impact", label: "Emotion" },
  { key: "factual_strength", label: "Factual" },
];

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
  onCompleteEarly,
  onVoteNow,
  earlyCompleted = false,
  debateFinishedFromServer,
}: Props) {
  const { speak, stop, pause, resume, paused, mute, unmute, muted, getAmplitude } = useSpeechSynthesis();
  const videoRef = useRef<HTMLVideoElement>(null);
  const liveFeedRef = useRef<HTMLDivElement>(null);
  const lastQueuedRef = useRef<number>(-1);
  const [showStopConfirm, setShowStopConfirm] = useState(false);
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
  const [activeMetric, setActiveMetric] = useState<MetricKey>("overall");

  const [liveIndex, setLiveIndex] = useState<number>(-1);
  const [liveDurationMs, setLiveDurationMs] = useState<number>(0);
  const [finishedIndex, setFinishedIndex] = useState<number>(-1);
  const debateFinishedRef = useRef(false);
  const earlyCompletedRef = useRef(false);

  useEffect(() => {
    if (debateFinishedFromServer) debateFinishedRef.current = true;
  }, [debateFinishedFromServer]);

  // When earlyCompleted fires: stop all audio immediately and block future queuing
  useEffect(() => {
    if (earlyCompleted && !earlyCompletedRef.current) {
      earlyCompletedRef.current = true;
      stop();
      // Immediately mark all currently received messages as "seen" so feed shows them all
      setFinishedIndex((prev) => Math.max(prev, messages.length - 1));
      setLiveIndex(-1);
      setLiveDurationMs(0);
    }
    if (!earlyCompleted) {
      earlyCompletedRef.current = false;
    }
  }, [earlyCompleted, stop, messages.length]);

  // Auto-scroll live feed
  useEffect(() => {
    if (liveFeedRef.current) {
      liveFeedRef.current.scrollTop = liveFeedRef.current.scrollHeight;
    }
  }, [messages, finishedIndex]);

  const handleAudioEnd = useCallback(
    (msgIndex: number) => {
      setFinishedIndex(msgIndex);
      if (debateFinishedRef.current && msgIndex === lastQueuedRef.current && onAllAudioDone) {
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

      // After early completion: skip audio, just mark as finished so new messages show in feed
      if (earlyCompletedRef.current) {
        setFinishedIndex(msgIndex);
        return;
      }

      if (msg.video_url) {
        setLiveIndex(msgIndex);
        setLiveDurationMs(0);
        return;
      }

      // Always call speak() — mute/unmute only affects volume, not timing or progression
      speak(
        msg.audio,
        (durationMs) => { setLiveIndex(msgIndex); setLiveDurationMs(durationMs); },
        () => handleAudioEnd(msgIndex)
      );
    }
  }, [messages, speak, handleAudioEnd]);

  const speakingAgentName =
    liveIndex >= 0 && liveIndex > finishedIndex && liveIndex < messages.length
      ? messages[liveIndex].agent.name
      : null;
  const showThinking = thinkingAgent && !speakingAgentName;
  const liveMessage =
    liveIndex >= 0 && liveIndex > finishedIndex && liveIndex < messages.length
      ? messages[liveIndex]
      : null;

  const groupedRounds = new Set(messages.map((m) => m.round_name));
  const completedRounds = groupedRounds.size;
  const totalRounds = 4;
  const progress = Math.min((completedRounds / totalRounds) * 100, 100);

  // Fact check aggregation
  const allFacts: (FactCheck & { agent: string; round: string })[] = [];
  for (const a of analyses) {
    if (a.fact_check?.length) {
      for (const fc of a.fact_check) {
        allFacts.push({ ...fc, agent: a.agent_name, round: a.round_name });
      }
    }
  }
  const factSummary = {
    verified: allFacts.filter((f) => f.verdict === "true" || f.verdict === "mostly_true").length,
    unverified: allFacts.filter((f) => f.verdict === "unverified").length,
    flagged: allFacts.filter((f) => f.verdict === "misleading" || f.verdict === "false").length,
  };

  // Scorecard
  const getAgentScore = (agentName: string): number => {
    const agentAnalyses = analyses.filter((a) => a.agent_name === agentName);
    if (!agentAnalyses.length) return 0;
    const vals = agentAnalyses.map((a) => a.sentiment[activeMetric]);
    return Math.round(vals.reduce((s, v) => s + v, 0) / vals.length);
  };

  const scoredAgents = [...setup.agents]
    .map((a) => ({ ...a, score: getAgentScore(a.name) }))
    .sort((a, b) => b.score - a.score);

  return (
    <div className="flex flex-col h-full gap-2">
      {/* ── Top Header Bar ── */}
      <div className="glass-card-strong rounded-xl px-4 py-2.5 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-bold text-white truncate">{setup.topic}</h2>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] text-indigo-300 font-medium bg-indigo-500/10 px-2 py-0.5 rounded-full">
              {setup.industry}
            </span>
            {currentRound && (
              <motion.span
                key={currentRound}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-[10px] text-indigo-200 bg-indigo-600/20 border border-indigo-500/20 px-2 py-0.5 rounded-full"
              >
                {ROUND_ICONS[currentRound] || "🗣️"} {currentRound}
              </motion.span>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-24 bg-white/5 rounded-full h-1.5">
            <motion.div
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-1.5 rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <span className="text-[10px] text-gray-500">{completedRounds}/{totalRounds}</span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Mute / Unmute — conversation always progresses, only silences audio */}
          <button
            onClick={() => { if (muted) unmute(); else mute(); }}
            title={muted ? "Unmute audio" : "Mute audio (conversation continues)"}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              muted
                ? "bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10"
                : "bg-indigo-600/80 text-white shadow-lg shadow-indigo-500/20"
            }`}
          >
            {muted ? "🔇 Muted" : "🔊 Audio"}
          </button>

          {/* Pause / Resume — pauses audio AND typing animation */}
          <button
            onClick={() => { if (paused) resume(); else pause(); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              paused
                ? "bg-amber-600/80 text-white"
                : "bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10"
            }`}
          >
            {paused ? "▶ Resume" : "⏸ Pause"}
          </button>

          {/* End Debate */}
          {!earlyCompleted && (
            <button
              onClick={() => { pause(); setShowStopConfirm(true); }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-600/80 text-white hover:bg-red-500 shadow-lg shadow-red-500/20"
            >
              ⏹ End Debate
            </button>
          )}
        </div>
      </div>

      {/* ── Action bar: Complete Debate / Vote Now — always visible, never clipped ── */}
      {!earlyCompleted && !debateFinishedFromServer && messages.length > 0 && (
        <div className="flex-shrink-0 flex items-center gap-3 px-4 py-2 glass-card rounded-xl border border-emerald-500/15">
          <span className="text-xs text-gray-400 flex-1">
            <span className="text-emerald-400 font-semibold">{messages.length}</span> messages so far — you can end early and review the full debate before voting.
          </span>
          <button
            onClick={() => { pause(); setShowCompleteConfirm(true); }}
            className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600/80 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 border border-emerald-500/30 transition-all"
          >
            ✅ Complete Debate
          </button>
        </div>
      )}

      {earlyCompleted && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-shrink-0 flex items-center gap-3 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/25"
        >
          <span className="text-base">✅</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-emerald-300">Debate Completed — All {messages.length} messages revealed</p>
            <p className="text-[10px] text-emerald-400/70">Review the full conversation, fact checks and scores below, then vote when ready.</p>
          </div>
          <motion.button
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ repeat: Infinity, duration: 1.8 }}
            onClick={onVoteNow}
            className="flex-shrink-0 flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-lg shadow-amber-500/25 transition-all"
          >
            🗳️ Vote Now
          </motion.button>
        </motion.div>
      )}

      {/* ── Main Content: Left (Debate) + Right (Panel) ── */}
      <div className="flex flex-1 gap-3 min-h-0">

        {/* ── LEFT: Debate Stage ── */}
        <div className="flex-1 flex flex-col gap-2 min-h-0 min-w-0">

          {/* Avatar Stage */}
          <div className="glass-card rounded-xl p-4 flex flex-col items-center justify-center gap-4" style={{ minHeight: 220 }}>
            {setup.agents.map((agent) => {
              const isSpeaker = speakingAgentName === agent.name;
              const isThinkingAgent = showThinking && thinkingAgent === agent.name;
              const isOtherSpeaking = speakingAgentName && !isSpeaker && !isThinkingAgent;

              let avatarState: "idle" | "speaking" | "listening" | "thinking" = "idle";
              if (isSpeaker) avatarState = "speaking";
              else if (isThinkingAgent) avatarState = "thinking";
              else if (isOtherSpeaking) avatarState = "listening";

              return null; // rendered below in row
            })}

            {/* Agent row */}
            <div className="flex items-end justify-center gap-8 w-full">
              {setup.agents.map((agent) => {
                const isSpeaker = speakingAgentName === agent.name;
                const isThinkingAgent = showThinking && thinkingAgent === agent.name;
                const isOtherSpeaking = speakingAgentName && !isSpeaker && !isThinkingAgent;

                let avatarState: "idle" | "speaking" | "listening" | "thinking" = "idle";
                if (isSpeaker) avatarState = "speaking";
                else if (isThinkingAgent) avatarState = "thinking";
                else if (isOtherSpeaking) avatarState = "listening";

                return (
                  <motion.div
                    key={agent.name}
                    className="flex flex-col items-center gap-2"
                    animate={{ opacity: isSpeaker || !speakingAgentName ? 1 : 0.55, scale: isSpeaker ? 1.05 : 1 }}
                    transition={{ duration: 0.35 }}
                  >
                    <AnimatedAvatar
                      avatarImage={agent.avatar_image}
                      agentName={agent.name}
                      agentColor={agent.avatar_color}
                      state={avatarState}
                      getAmplitude={isSpeaker ? getAmplitude : undefined}
                      size={isSpeaker ? "lg" : "sm"}
                    />
                    <div className="text-center" style={{ minWidth: 80, maxWidth: 140 }}>
                      <p className={`font-semibold truncate ${isSpeaker ? "text-sm" : "text-xs"}`} style={{ color: agent.avatar_color }}>
                        {agent.name}
                      </p>
                      <p className={`text-gray-400 truncate ${isSpeaker ? "text-xs" : "text-[10px]"}`}>
                        {agent.role}
                      </p>
                      <span className={`inline-block mt-1 text-[9px] px-2 py-0.5 rounded-full font-semibold ${
                        agent.stance === "for" ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/20"
                        : agent.stance === "against" ? "bg-red-500/15 text-red-300 border border-red-500/20"
                        : "bg-amber-500/15 text-amber-300 border border-amber-500/20"
                      }`}>
                        {agent.stance.toUpperCase()}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Thinking indicator */}
            <AnimatePresence>
              {showThinking && !liveMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 glass-card rounded-full px-4 py-1.5"
                >
                  <div className="flex gap-1">
                    {[...Array(3)].map((_, i) => (
                      <motion.div key={i} className="w-1.5 h-1.5 bg-indigo-400 rounded-full"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-400">
                    <span className="text-indigo-300 font-medium">{thinkingAgent}</span> is thinking...
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Current speech bubble — hidden after early complete */}
          <AnimatePresence mode="wait">
            {liveMessage && !earlyCompleted && (
              <motion.div
                key={liveIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="glass-card rounded-xl p-3.5 flex-shrink-0"
                style={{ borderColor: liveMessage.agent.avatar_color + "30", boxShadow: `0 0 18px ${liveMessage.agent.avatar_color}0D` }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold" style={{ color: liveMessage.agent.avatar_color }}>
                    {liveMessage.agent.name}
                  </span>
                  <span className="text-[10px] text-gray-500">{liveMessage.agent.role}</span>
                  <motion.span className="ml-auto flex items-center gap-1 text-[9px] text-emerald-400"
                    animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> SPEAKING
                  </motion.span>
                </div>
                <div className="max-h-[90px] overflow-y-auto">
                  <TypingText
                    text={liveMessage.content}
                    durationMs={liveDurationMs}
                    paused={paused}
                    className="text-sm text-gray-200 leading-relaxed"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Live Feed — scrollable transcript */}
          <div className="glass-card rounded-xl flex-1 min-h-0 flex flex-col overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-white/[0.06] flex-shrink-0">
              {earlyCompleted ? (
                <span className="w-2 h-2 bg-emerald-500 rounded-full" />
              ) : (
                <motion.span className="w-2 h-2 bg-emerald-500 rounded-full"
                  animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5 }} />
              )}
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Conversations</span>
              <span className="ml-auto text-[10px] text-gray-600">{messages.length} messages</span>
            </div>
            <div ref={liveFeedRef} className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
              {(earlyCompleted ? messages : messages.slice(0, finishedIndex + 1)).map((msg, idx) => {
                const agent = setup.agents.find((a) => a.name === msg.agent.name);
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex gap-2.5 items-start"
                  >
                    {/* Avatar dot */}
                    <div className="w-6 h-6 rounded-full flex-shrink-0 overflow-hidden border mt-0.5"
                      style={{ borderColor: agent?.avatar_color + "50" }}>
                      {agent?.avatar_image ? (
                        <img src={agent.avatar_image.startsWith("data:") ? agent.avatar_image : `data:image/png;base64,${agent.avatar_image}`}
                          alt={agent.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-white"
                          style={{ backgroundColor: agent?.avatar_color }}>
                          {msg.agent.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[10px] font-semibold" style={{ color: agent?.avatar_color }}>
                          {msg.agent.name.split(" ")[0]}
                        </span>
                        <span className="text-[9px] text-gray-600">{msg.round_name}</span>
                      </div>
                      <p className="text-[11px] text-gray-400 leading-snug line-clamp-2">
                        {msg.content}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
              {messages.length === 0 && (
                <p className="text-[11px] text-gray-600 text-center py-4">Debate starting...</p>
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Side Panel ── */}
        <div className="w-72 flex-shrink-0 flex flex-col gap-2 min-h-0">

          {/* ── Fact Check — 50% height ── */}
          <div className="glass-card rounded-xl flex flex-col overflow-hidden flex-1 min-h-0">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-white/[0.06]">
              <span className="text-base">🔍</span>
              <span className="text-[10px] font-semibold text-gray-300 uppercase tracking-wider">Fact Check</span>
              {allFacts.length > 0 && (
                <div className="ml-auto flex gap-1">
                  {factSummary.verified > 0 && (
                    <span className="bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded-full text-[9px] font-semibold">
                      ✓{factSummary.verified}
                    </span>
                  )}
                  {factSummary.flagged > 0 && (
                    <span className="bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded-full text-[9px] font-semibold">
                      ✗{factSummary.flagged}
                    </span>
                  )}
                  {factSummary.unverified > 0 && (
                    <span className="bg-yellow-500/20 text-yellow-300 px-1.5 py-0.5 rounded-full text-[9px] font-semibold">
                      ?{factSummary.unverified}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5 min-h-0">
              {allFacts.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-[11px] text-gray-600">Claims will be fact-checked as the debate progresses.</p>
                </div>
              ) : (
                allFacts.slice(-6).map((fact, i) => {
                  const cfg = FACT_VERDICT_CONFIG[fact.verdict] || FACT_VERDICT_CONFIG.unverified;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className={`${cfg.bg} border ${cfg.border} rounded-lg p-2`}
                    >
                      <div className="flex items-start gap-1.5">
                        <span className="text-xs flex-shrink-0">{cfg.icon}</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] text-gray-300 leading-snug line-clamp-2">
                            &ldquo;{fact.claim}&rdquo;
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            <span className={`text-[9px] font-semibold uppercase ${cfg.color}`}>
                              {cfg.label}
                            </span>
                            <span className="text-[9px] text-gray-600">{fact.confidence}%</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>

          {/* ── Debate Scorecard ── */}
          <div className="glass-card rounded-xl flex flex-col overflow-hidden flex-1 min-h-0">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-white/[0.06] flex-shrink-0">
              <span className="text-base">📊</span>
              <span className="text-[10px] font-semibold text-gray-300 uppercase tracking-wider">Debate Scorecard</span>
            </div>

            {/* Metric selector */}
            <div className="flex gap-0.5 px-2 pt-2 pb-1 flex-shrink-0">
              {METRICS.map((m) => (
                <button
                  key={m.key}
                  onClick={() => setActiveMetric(m.key)}
                  className={`flex-1 px-1 py-1 rounded text-[9px] font-medium transition-all text-center leading-tight ${
                    activeMetric === m.key
                      ? "bg-indigo-600/50 text-indigo-200 border border-indigo-500/30"
                      : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2 min-h-0">
              {analyses.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-[11px] text-gray-600">Scores will appear after the first round.</p>
                </div>
              ) : (
                scoredAgents.map((agent, idx) => {
                  const agentAnalyses = analyses.filter((a) => a.agent_name === agent.name);
                  const roundScores = agentAnalyses.map((a) => ({
                    round: a.round_number,
                    val: a.sentiment[activeMetric],
                  })).sort((a, b) => a.round - b.round);

                  return (
                    <motion.div
                      key={agent.name}
                      layout
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-white/[0.025] rounded-xl p-2.5 border border-white/[0.05]"
                    >
                      {/* Agent header */}
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 rounded-full overflow-hidden border flex-shrink-0"
                          style={{ borderColor: agent.avatar_color + "50" }}>
                          {agent.avatar_image ? (
                            <img src={agent.avatar_image.startsWith("data:") ? agent.avatar_image : `data:image/png;base64,${agent.avatar_image}`}
                              alt={agent.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-white"
                              style={{ backgroundColor: agent.avatar_color }}>
                              {agent.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            {idx === 0 && analyses.length > 0 && (
                              <span className="text-[9px]">🏆</span>
                            )}
                            <p className="text-[11px] font-semibold truncate" style={{ color: agent.avatar_color }}>
                              {agent.name}
                            </p>
                          </div>
                          <p className="text-[9px] text-gray-500 truncate">{agent.role}</p>
                        </div>
                        <motion.span
                          key={`${agent.name}-${agent.score}`}
                          initial={{ scale: 1.3 }}
                          animate={{ scale: 1 }}
                          className="text-base font-bold tabular-nums"
                          style={{ color: agent.avatar_color }}
                        >
                          {agent.score || "—"}
                        </motion.span>
                      </div>

                      {/* Bar */}
                      <div className="w-full bg-white/5 rounded-full h-1.5 mb-2">
                        <motion.div
                          className="h-1.5 rounded-full"
                          style={{ backgroundColor: agent.avatar_color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${agent.score}%` }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                        />
                      </div>

                      {/* Per-round scores */}
                      {roundScores.length > 0 && (
                        <div className="flex gap-1">
                          {roundScores.map((rs) => (
                            <div key={rs.round} className="flex-1 text-center">
                              <div className="text-[8px] text-gray-600 mb-0.5">R{rs.round + 1}</div>
                              <div className="text-[10px] font-semibold tabular-nums" style={{ color: agent.avatar_color + "CC" }}>
                                {rs.val}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Interjection Modal ── */}
      <AnimatePresence>
        {pauseData && onSendInterjection && onSkipInterjection && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
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

      {/* ── Stop Confirmation ── */}
      <AnimatePresence>
        {showStopConfirm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="glass-card-strong rounded-2xl p-6 max-w-sm mx-4 text-center"
            >
              <div className="text-4xl mb-3">⚠️</div>
              <h3 className="text-lg font-bold text-white mb-2">End Debate?</h3>
              <p className="text-sm text-gray-400 mb-5">This will end the current debate and return to the main page. All progress will be lost.</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => { setShowStopConfirm(false); resume(); }}
                  className="px-5 py-2 rounded-xl text-sm font-medium bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { setShowStopConfirm(false); stop(); if (videoRef.current) { videoRef.current.pause(); videoRef.current.src = ""; } onStop?.(); }}
                  className="px-5 py-2 rounded-xl text-sm font-medium bg-red-600 hover:bg-red-500 text-white transition-all shadow-lg shadow-red-500/25"
                >
                  End Debate
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Complete Debate Confirmation ── */}
      <AnimatePresence>
        {showCompleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="glass-card-strong rounded-2xl p-6 max-w-sm mx-4 text-center"
            >
              <div className="text-4xl mb-3">✅</div>
              <h3 className="text-lg font-bold text-white mb-2">Complete Debate Early?</h3>
              <p className="text-sm text-gray-400 mb-3">
                The voice-over will stop and all <span className="text-white font-semibold">{messages.length} messages</span> will be instantly revealed in the Conversations panel.
              </p>
              <div className="text-left bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 mb-5 space-y-1.5">
                {["Full conversation transcript displayed", "Fact check results shown", "Live scorecard updated", "Click \"Vote Now\" when ready to vote"].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-gray-300">
                    <span className="text-emerald-400 flex-shrink-0">✓</span> {item}
                  </div>
                ))}
              </div>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => { setShowCompleteConfirm(false); resume(); }}
                  className="px-5 py-2 rounded-xl text-sm font-medium bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 transition-all"
                >
                  Continue Debate
                </button>
                <button
                  onClick={() => {
                    setShowCompleteConfirm(false);
                    if (videoRef.current) { videoRef.current.pause(); videoRef.current.src = ""; }
                    onCompleteEarly?.(); // sets earlyCompleted=true → useEffect stops audio
                  }}
                  className="px-5 py-2 rounded-xl text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-lg shadow-emerald-500/25"
                >
                  ✅ Complete Debate
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
