"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { AnalysisResult, AgentPersona } from "@/hooks/useDebateWebSocket";

interface Props {
  analyses: AnalysisResult[];
  agents: AgentPersona[];
}

type MetricKey = "overall" | "persuasiveness" | "emotional_impact" | "factual_strength";

const METRICS: { key: MetricKey; label: string; icon: string }[] = [
  { key: "overall", label: "All", icon: "\u2B50" },
  { key: "persuasiveness", label: "Per", icon: "\uD83C\uDFAF" },
  { key: "emotional_impact", label: "Emo", icon: "\uD83D\uDD25" },
  { key: "factual_strength", label: "Fct", icon: "\uD83D\uDCCA" },
];

const ROUND_LABELS = ["R1", "R2", "R3", "R4"];

export default function SentimentChart({ analyses, agents }: Props) {
  const [activeMetric, setActiveMetric] = useState<MetricKey>("overall");
  const [collapsed, setCollapsed] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<{
    agent: string;
    value: number;
    x: number;
    y: number;
  } | null>(null);

  if (analyses.length === 0) return null;

  const chartW = 200;
  const chartH = 90;
  const padL = 22;
  const padR = 6;
  const padT = 6;
  const padB = 14;
  const plotW = chartW - padL - padR;
  const plotH = chartH - padT - padB;

  const maxRound = Math.max(...analyses.map((a) => a.round_number));
  const roundCount = maxRound + 1;

  const getAgentData = (agentName: string): { round: number; value: number }[] => {
    return analyses
      .filter((a) => a.agent_name === agentName)
      .map((a) => ({
        round: a.round_number,
        value: a.sentiment[activeMetric],
      }))
      .sort((a, b) => a.round - b.round);
  };

  const toX = (round: number) => padL + (roundCount > 1 ? (round / (roundCount - 1)) * plotW : plotW / 2);
  const toY = (val: number) => padT + plotH - (val / 100) * plotH;

  const buildPath = (points: { round: number; value: number }[]) => {
    if (points.length < 2) return "";
    let d = `M ${toX(points[0].round)} ${toY(points[0].value)}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpx1 = toX(prev.round) + (toX(curr.round) - toX(prev.round)) * 0.4;
      const cpx2 = toX(curr.round) - (toX(curr.round) - toX(prev.round)) * 0.4;
      d += ` C ${cpx1} ${toY(prev.value)}, ${cpx2} ${toY(curr.value)}, ${toX(curr.round)} ${toY(curr.value)}`;
    }
    return d;
  };

  const agentLatestScores = agents.map((agent) => {
    const data = getAgentData(agent.name);
    const latest = data.length > 0 ? data[data.length - 1].value : 0;
    return { name: agent.name, color: agent.avatar_color, score: latest };
  }).sort((a, b) => b.score - a.score);

  return (
    <div
      className="w-[260px] rounded-xl border border-white/[0.08] shadow-2xl shadow-black/40"
      style={{ backgroundColor: "rgba(15, 15, 30, 0.92)", backdropFilter: "blur(12px)" }}
    >
      {/* Header - clickable to collapse */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-2.5 py-1.5 border-b border-white/[0.06] hover:bg-white/[0.03] transition-colors"
      >
        <span className="text-[9px] text-indigo-300 font-semibold uppercase tracking-wider flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          Live Scores
        </span>
        <span className="text-[9px] text-gray-500">{collapsed ? "\u25B2" : "\u25BC"}</span>
      </button>

      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {/* Metric tabs */}
            <div className="flex gap-0.5 px-2 pt-1.5 pb-1">
              {METRICS.map((m) => (
                <button
                  key={m.key}
                  onClick={() => setActiveMetric(m.key)}
                  className={`flex-1 px-1 py-0.5 rounded text-[8px] font-medium transition-all text-center ${
                    activeMetric === m.key
                      ? "bg-indigo-600/40 text-indigo-200"
                      : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                  }`}
                >
                  {m.icon} {m.label}
                </button>
              ))}
            </div>

            {/* SVG Chart */}
            <div className="px-1.5">
              <svg
                viewBox={`0 0 ${chartW} ${chartH}`}
                className="w-full"
                style={{ height: 80 }}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                {/* Grid */}
                {[0, 50, 100].map((v) => (
                  <g key={v}>
                    <line
                      x1={padL} y1={toY(v)} x2={chartW - padR} y2={toY(v)}
                      stroke="rgba(255,255,255,0.05)" strokeWidth={0.5}
                    />
                    <text x={padL - 3} y={toY(v) + 3} textAnchor="end" fill="rgba(255,255,255,0.2)" fontSize={6}>
                      {v}
                    </text>
                  </g>
                ))}

                {/* Round labels */}
                {Array.from({ length: roundCount }).map((_, i) => (
                  <text key={i} x={toX(i)} y={chartH - 2} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize={7} fontWeight={500}>
                    {ROUND_LABELS[i] || `R${i + 1}`}
                  </text>
                ))}

                {/* Lines */}
                {agents.map((agent) => {
                  const data = getAgentData(agent.name);
                  const path = buildPath(data);
                  if (!path) return null;
                  return (
                    <g key={agent.name}>
                      <motion.path
                        d={path} fill="none" stroke={agent.avatar_color}
                        strokeWidth={2.5} strokeLinecap="round" opacity={0.25}
                        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                      />
                      <motion.path
                        d={path} fill="none" stroke={agent.avatar_color}
                        strokeWidth={1.2} strokeLinecap="round"
                        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                      />
                    </g>
                  );
                })}

                {/* Points */}
                {agents.map((agent) =>
                  getAgentData(agent.name).map((pt) => (
                    <motion.circle
                      key={`${agent.name}-${pt.round}`}
                      cx={toX(pt.round)} cy={toY(pt.value)}
                      r={hoveredPoint?.agent === agent.name ? 3.5 : 2}
                      fill={agent.avatar_color}
                      stroke="rgba(0,0,0,0.6)" strokeWidth={0.5}
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring" }}
                      style={{ cursor: "pointer" }}
                      onMouseEnter={() => setHoveredPoint({ agent: agent.name, value: pt.value, x: toX(pt.round), y: toY(pt.value) })}
                    />
                  ))
                )}

                {/* Tooltip */}
                {hoveredPoint && (
                  <g>
                    <rect
                      x={Math.min(hoveredPoint.x - 22, chartW - padR - 46)} y={hoveredPoint.y - 18}
                      width={44} height={14} rx={3}
                      fill="rgba(0,0,0,0.85)" stroke="rgba(255,255,255,0.1)" strokeWidth={0.5}
                    />
                    <text
                      x={Math.min(hoveredPoint.x, chartW - padR - 24)} y={hoveredPoint.y - 9}
                      textAnchor="middle" fill="white" fontSize={7} fontWeight={600}
                    >
                      {hoveredPoint.agent.split(" ")[0]}: {hoveredPoint.value}
                    </text>
                  </g>
                )}
              </svg>
            </div>

            {/* Leaderboard */}
            <div className="px-2.5 pb-2 flex flex-col gap-0.5">
              {agentLatestScores.map((item, idx) => (
                <motion.div
                  key={item.name}
                  layout
                  className="flex items-center gap-1.5"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                >
                  <span className="text-[8px] text-gray-600 w-2.5">{idx + 1}.</span>
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-[9px] text-gray-400 truncate flex-1">{item.name.split(" ")[0]}</span>
                  <motion.span
                    key={item.score}
                    className="text-[9px] font-bold tabular-nums"
                    style={{ color: item.color }}
                    initial={{ scale: 1.4 }}
                    animate={{ scale: 1 }}
                  >
                    {item.score}
                  </motion.span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
