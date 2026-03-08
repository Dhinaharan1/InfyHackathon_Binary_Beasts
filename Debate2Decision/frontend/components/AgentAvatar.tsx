"use client";

import { motion } from "framer-motion";
import { AgentPersona } from "@/hooks/useDebateWebSocket";

interface Props {
  agent: AgentPersona;
  isSpeaking: boolean;
  isThinking?: boolean;
  size?: "sm" | "md" | "lg";
}

const stanceConfig: Record<string, { icon: string; bg: string; label: string }> = {
  for: { icon: "\u2714", bg: "bg-emerald-500", label: "FOR" },
  against: { icon: "\u2718", bg: "bg-red-500", label: "AGAINST" },
  neutral: { icon: "\u2696", bg: "bg-amber-500", label: "NEUTRAL" },
};

export default function AgentAvatar({
  agent,
  isSpeaking,
  isThinking = false,
  size = "sm",
}: Props) {
  const dimensions = {
    sm: { outer: "w-14 h-14", text: "text-lg", nameSize: "text-xs", roleSize: "text-[10px]" },
    md: { outer: "w-20 h-20", text: "text-2xl", nameSize: "text-sm", roleSize: "text-xs" },
    lg: { outer: "w-28 h-28", text: "text-4xl", nameSize: "text-base", roleSize: "text-sm" },
  };

  const dim = dimensions[size];
  const initials = agent.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  const stance = stanceConfig[agent.stance] || stanceConfig.neutral;

  return (
    <motion.div
      className="flex flex-col items-center gap-1.5"
      animate={
        isSpeaking
          ? { scale: [1, 1.05, 1] }
          : isThinking
          ? { scale: [1, 1.02, 1] }
          : { scale: 1 }
      }
      transition={{
        repeat: isSpeaking || isThinking ? Infinity : 0,
        duration: isSpeaking ? 1.2 : 2,
      }}
    >
      <div className="relative">
        {/* Glow ring when speaking */}
        {isSpeaking && (
          <motion.div
            className={`absolute inset-0 rounded-full`}
            style={{
              background: `radial-gradient(circle, ${agent.avatar_color}40 0%, transparent 70%)`,
            }}
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.2, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          />
        )}

        {/* Avatar circle */}
        <div
          className={`${dim.outer} rounded-full flex items-center justify-center ${dim.text} font-bold text-white relative overflow-hidden ${
            isSpeaking ? "agent-speaking ring-2" : ""
          }`}
          style={{
            backgroundColor: agent.avatar_color,
            boxShadow: isSpeaking ? `0 0 0 2px ${agent.avatar_color}` : undefined,
          }}
        >
          {/* Gradient overlay */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background: `linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%, rgba(0,0,0,0.2) 100%)`,
            }}
          />
          <span className="relative z-10 drop-shadow-lg">{initials}</span>
        </div>

        {/* Speaking indicator with soundwave */}
        {isSpeaking && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-gray-900 flex items-center justify-center"
          >
            <div className="flex items-center gap-[2px]">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-[2px] bg-white rounded-full soundwave-bar"
                  style={{ height: "4px" }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Thinking indicator */}
        {isThinking && !isSpeaking && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -bottom-1 -right-1 w-6 h-6 bg-indigo-500 rounded-full border-2 border-gray-900 flex items-center justify-center"
          >
            <div className="flex items-center gap-[2px]">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 h-1 bg-white rounded-full thinking-dot"
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Stance badge */}
        <div
          className={`absolute -top-1 -left-1 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold border-2 border-gray-900 ${stance.bg}`}
        >
          {stance.icon}
        </div>
      </div>

      <div className="text-center min-w-[120px] max-w-[160px]">
        <p className={`${dim.nameSize} font-semibold text-white leading-tight`}>
          {agent.name}
        </p>
        <p className={`${dim.roleSize} text-gray-400 leading-tight`}>{agent.role}</p>
      </div>
    </motion.div>
  );
}
