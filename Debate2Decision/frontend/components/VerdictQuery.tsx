"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ── Types ────────────────────────────────────────────────────────────────────

interface StatsItem { label: string; value: string; detail?: string }
interface ChartItem { label: string; value: number }

type QueryResponse =
  | { type: "text"; content: string }
  | { type: "stats"; data: StatsItem[]; summary: string }
  | { type: "chart"; chart_type: "bar" | "pie"; title: string; data: ChartItem[]; unit: string; summary: string }
  | { type: "diagram"; title: string; svg: string };

interface Suggestion { text: string; type: string; icon: string }
interface QA { query: string; response: QueryResponse }

interface Props {
  topic: string;
  conclusion: string;
  reasoning: string;
  winner: string;
}

// ── Colour palette ────────────────────────────────────────────────────────────

const BAR_COLORS = [
  "from-indigo-500 to-indigo-400",
  "from-purple-500 to-purple-400",
  "from-emerald-500 to-emerald-400",
  "from-amber-500 to-amber-400",
  "from-rose-500 to-rose-400",
  "from-cyan-500 to-cyan-400",
  "from-fuchsia-500 to-fuchsia-400",
  "from-orange-500 to-orange-400",
];
const PIE_COLORS = ["#6366f1","#a855f7","#10b981","#f59e0b","#f43f5e","#06b6d4","#d946ef","#f97316"];

// ── Sub-renderers ─────────────────────────────────────────────────────────────

function BarChart({ data, unit, title }: { data: ChartItem[]; unit: string; title: string }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div>
      <p className="text-xs font-semibold text-gray-300 mb-3">{title}</p>
      <div className="flex flex-col gap-2">
        {data.map((item, i) => (
          <div key={item.label} className="flex items-center gap-2">
            <span className="text-[11px] text-gray-400 w-32 flex-shrink-0 truncate text-right">{item.label}</span>
            <div className="flex-1 bg-white/5 rounded-full h-5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(item.value / max) * 100}%` }}
                transition={{ duration: 0.7, delay: i * 0.08, ease: "easeOut" }}
                className={`h-full rounded-full bg-gradient-to-r ${BAR_COLORS[i % BAR_COLORS.length]} flex items-center justify-end pr-2`}
              >
                <span className="text-[10px] font-bold text-white whitespace-nowrap">{item.value}{unit}</span>
              </motion.div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PieChart({ data, unit, title }: { data: ChartItem[]; unit: string; title: string }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  let cum = 0;
  const segments = data.map((item, i) => {
    const pct = (item.value / total) * 100;
    const start = cum; cum += pct;
    return { ...item, pct, start, color: PIE_COLORS[i % PIE_COLORS.length] };
  });
  const gradient = segments.map(s => `${s.color} ${s.start}% ${s.start + s.pct}%`).join(", ");
  return (
    <div>
      <p className="text-xs font-semibold text-gray-300 mb-3">{title}</p>
      <div className="flex items-center gap-5">
        <div className="w-28 h-28 rounded-full flex-shrink-0" style={{ background: `conic-gradient(${gradient})` }} />
        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
          {segments.map(s => (
            <div key={s.label} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
              <span className="text-[11px] text-gray-300 truncate flex-1">{s.label}</span>
              <span className="text-[11px] font-bold text-white flex-shrink-0">{s.value}{unit}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DiagramView({ svg, title }: { svg: string; title: string }) {
  const [zoom, setZoom] = useState(false);
  // Sanitise: strip any script tags just in case
  const safe = svg.replace(/<script[\s\S]*?<\/script>/gi, "");
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-gray-300">{title}</p>
        <button
          onClick={() => setZoom(true)}
          className="text-[10px] text-indigo-400 hover:text-indigo-300 transition-colors px-2 py-0.5 rounded border border-indigo-500/20 hover:border-indigo-500/40"
        >
          ⛶ Full screen
        </button>
      </div>
      <div
        className="w-full rounded-xl overflow-hidden border border-white/[0.08] bg-[#0f0f1a]"
        dangerouslySetInnerHTML={{ __html: safe }}
        style={{ lineHeight: 0 }}
      />
      {/* Full-screen modal */}
      <AnimatePresence>
        {zoom && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6"
            onClick={() => setZoom(false)}
          >
            <motion.div
              initial={{ scale: 0.85 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.85 }}
              className="max-w-5xl w-full rounded-2xl overflow-hidden border border-white/10 bg-[#0f0f1a] relative"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.07]">
                <p className="text-xs font-semibold text-gray-300">{title}</p>
                <button onClick={() => setZoom(false)} className="text-gray-400 hover:text-white text-lg leading-none">✕</button>
              </div>
              <div dangerouslySetInnerHTML={{ __html: safe }} style={{ lineHeight: 0 }} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ResponseRenderer({ response }: { response: QueryResponse }) {
  if (response.type === "text") {
    return <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{response.content}</div>;
  }
  if (response.type === "stats") {
    return (
      <div>
        <p className="text-[11px] text-indigo-300 mb-3 italic">{response.summary}</p>
        <div className="grid grid-cols-2 gap-2">
          {response.data.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-white/[0.04] border border-white/[0.07] rounded-xl p-3"
            >
              <p className="text-lg font-extrabold text-indigo-300 leading-tight">{item.value}</p>
              <p className="text-[11px] font-semibold text-gray-300 mt-0.5">{item.label}</p>
              {item.detail && <p className="text-[10px] text-gray-500 mt-1 leading-snug">{item.detail}</p>}
            </motion.div>
          ))}
        </div>
        <p className="text-[10px] text-gray-600 mt-2 italic">* AI-generated data for informational purposes</p>
      </div>
    );
  }
  if (response.type === "chart") {
    return (
      <div>
        {response.chart_type === "bar"
          ? <BarChart data={response.data} unit={response.unit} title={response.title} />
          : <PieChart data={response.data} unit={response.unit} title={response.title} />
        }
        <p className="text-[11px] text-indigo-300 mt-3 italic">{response.summary}</p>
        <p className="text-[10px] text-gray-600 mt-1 italic">* AI-generated data for informational purposes</p>
      </div>
    );
  }
  if (response.type === "diagram") {
    return <DiagramView svg={response.svg} title={response.title} />;
  }
  return null;
}

// ── Type badge ────────────────────────────────────────────────────────────────

const TYPE_BADGE: Record<string, { label: string; color: string }> = {
  diagram: { label: "Diagram", color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25" },
  stats:   { label: "Stats",   color: "bg-indigo-500/15 text-indigo-300 border-indigo-500/25" },
  chart:   { label: "Chart",   color: "bg-purple-500/15 text-purple-300 border-purple-500/25" },
  text:    { label: "Explain", color: "bg-amber-500/15 text-amber-300 border-amber-500/25" },
};

// ── Main component ────────────────────────────────────────────────────────────

export default function VerdictQuery({ topic, conclusion, reasoning, winner }: Props) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [history, setHistory] = useState<QA[]>([]);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Fetch dynamic suggestions from LLM on mount
  useEffect(() => {
    if (!topic) return;
    setLoadingSuggestions(true);
    fetch("http://localhost:8000/api/verdict-suggestions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, winner, conclusion }),
    })
      .then(r => r.json())
      .then(data => setSuggestions(data.suggestions ?? []))
      .catch(() => setSuggestions([]))
      .finally(() => setLoadingSuggestions(false));
  }, [topic, winner, conclusion]);

  // Scroll to bottom after each answer
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, loading]);

  const handleSubmit = async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed || loading) return;
    setQuery("");
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/verdict-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, conclusion, reasoning, winner, query: trimmed }),
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data: QueryResponse = await res.json();
      setHistory(prev => [...prev, { query: trimmed, response: data }]);
    } catch {
      setError("Failed to get response. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Remaining suggestions not yet asked
  const remaining = suggestions.filter(s => !history.some(h => h.query === s.text));

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="glass-card rounded-2xl p-4 flex flex-col gap-3"
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-base">🤖</span>
        <div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">AI Decision Assistant</h3>
          <p className="text-[10px] text-gray-500 mt-0.5">Ask follow-up questions — get stats, charts, diagrams or explanations</p>
        </div>
      </div>

      {/* Suggested questions */}
      <div className="flex flex-col gap-1.5">
        {loadingSuggestions ? (
          <div className="flex items-center gap-2 text-[11px] text-gray-500">
            <svg className="animate-spin h-3 w-3 text-indigo-400" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Generating suggestions for this debate...
          </div>
        ) : remaining.length > 0 ? (
          <>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Suggested questions</p>
            <div className="flex flex-col gap-1.5">
              {remaining.slice(0, history.length === 0 ? 5 : 3).map((s) => {
                const badge = TYPE_BADGE[s.type] ?? TYPE_BADGE.text;
                return (
                  <button
                    key={s.text}
                    type="button"
                    onClick={() => handleSubmit(s.text)}
                    disabled={loading}
                    className="flex items-center gap-2.5 text-left px-3 py-2 rounded-xl bg-white/[0.03] hover:bg-indigo-600/10 border border-white/[0.06] hover:border-indigo-500/30 transition-all group disabled:opacity-50"
                  >
                    <span className="text-base flex-shrink-0">{s.icon}</span>
                    <span className="flex-1 text-[12px] text-gray-300 group-hover:text-white transition-colors leading-snug">{s.text}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border flex-shrink-0 ${badge.color}`}>
                      {badge.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        ) : null}
      </div>

      {/* Q&A history */}
      <AnimatePresence>
        {history.map((qa, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-2"
          >
            {/* User question */}
            <div className="flex justify-end">
              <div className="bg-indigo-600/25 border border-indigo-500/30 text-indigo-100 text-xs px-3 py-2 rounded-xl rounded-br-sm max-w-[88%]">
                {qa.query}
              </div>
            </div>
            {/* AI response */}
            <div className="bg-white/[0.04] border border-white/[0.07] rounded-xl rounded-bl-sm p-3.5">
              <ResponseRenderer response={qa.response} />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Loading */}
      {loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-xs text-gray-400 py-1">
          <svg className="animate-spin h-3.5 w-3.5 text-indigo-400" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          AI is generating your response...
        </motion.div>
      )}

      {/* Error */}
      {error && <p className="text-xs text-red-400">{error}</p>}

      <div ref={bottomRef} />

      {/* Input */}
      <div className="flex gap-2 pt-1 border-t border-white/[0.05]">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSubmit(query)}
          placeholder="Ask anything about this debate outcome..."
          disabled={loading}
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 disabled:opacity-50"
        />
        <button
          type="button"
          onClick={() => handleSubmit(query)}
          disabled={!query.trim() || loading}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-lg shadow-indigo-500/20 disabled:shadow-none flex-shrink-0"
        >
          Ask
        </button>
      </div>
    </motion.div>
  );
}
