"use client";

import { useState, useCallback, useRef } from "react";

export interface AgentPersona {
  name: string;
  role: string;
  industry: string;
  stance: string;
  expertise: string;
  personality: string;
  avatar_color: string;
  avatar_emoji: string;
  gender: string;
  accent: string;
  emotional_style: string;
  avatar_image?: string | null;
}

export interface DebateMessage {
  agent: AgentPersona;
  content: string;
  round_name: string;
  round_number: number;
  audio?: string;
  video_url?: string | null;
}

export interface DebateSetup {
  topic: string;
  industry: string;
  agents: AgentPersona[];
  total_rounds: number;
}

export interface FactCheck {
  claim: string;
  verdict: "true" | "mostly_true" | "unverified" | "misleading" | "false";
  confidence: number;
  explanation: string;
}

export interface AnalysisResult {
  agent_name: string;
  round_number: number;
  round_name: string;
  sentiment: {
    persuasiveness: number;
    emotional_impact: number;
    factual_strength: number;
    overall: number;
  };
  fact_check?: FactCheck[];
}

export interface Verdict {
  winner: string;
  winner_role: string;
  winner_stance: string;
  conclusion: string;
  reasoning: string;
  scores: { name: string; role: string; score: number; strength: string }[];
}

export type DebateStatus =
  | "idle"
  | "connecting"
  | "generating"
  | "debating"
  | "verdict"
  | "finished"
  | "error";

export function useDebateWebSocket() {
  const [status, setStatus] = useState<DebateStatus>("idle");
  const [setup, setSetup] = useState<DebateSetup | null>(null);
  const [messages, setMessages] = useState<DebateMessage[]>([]);
  const [currentRound, setCurrentRound] = useState<string>("");
  const [currentRoundNum, setCurrentRoundNum] = useState<number>(-1);
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  const [thinkingAgent, setThinkingAgent] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);
  const [pauseData, setPauseData] = useState<{
    nextRound: string;
    timeoutSeconds: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const wsRef = useRef<WebSocket | null>(null);
  const statusRef = useRef<DebateStatus>("idle");

  const updateStatus = useCallback((newStatus: DebateStatus) => {
    statusRef.current = newStatus;
    setStatus(newStatus);
  }, []);

  const startDebate = useCallback(
    (topic: string, language: string = "english", demo: boolean = false, transcript?: string, numAgents: number = 3, numRounds: number = 4, personaConstraints: string = "") => {
      updateStatus("connecting");
      setMessages([]);
      setSetup(null);
      setVerdict(null);
      setAnalyses([]);
      setPauseData(null);
      setError(null);
      setCurrentRound("");
      setCurrentRoundNum(-1);
      setActiveAgent(null);
      setThinkingAgent(null);
      setStatusMessage("");

      const ws = new WebSocket("ws://localhost:8000/ws/debate");
      wsRef.current = ws;

      ws.onopen = () => {
        updateStatus("generating");
        ws.send(JSON.stringify({
          topic, language, demo,
          transcript: transcript || null,
          num_agents: numAgents,
          num_rounds: numRounds,
          persona_constraints: personaConstraints,
        }));
      };

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);

        switch (msg.type) {
          case "status":
            setStatusMessage(msg.data.message);
            if (statusRef.current !== "debating") {
              updateStatus("generating");
            }
            break;

          case "setup":
            setSetup(msg.data);
            updateStatus("debating");
            break;

          case "round_start":
            setCurrentRound(msg.data.round_name);
            setCurrentRoundNum(msg.data.round_number);
            setPauseData(null);
            break;

          case "agent_thinking":
            setThinkingAgent(msg.data.agent_name);
            break;

          case "agent_message":
            setThinkingAgent(null);
            setActiveAgent(msg.data.agent.name);
            setMessages((prev) => [...prev, msg.data]);
            break;

          case "analysis":
            setAnalyses((prev) => [...prev, msg.data]);
            break;

          case "round_pause":
            setPauseData({
              nextRound: msg.data.next_round,
              timeoutSeconds: msg.data.timeout_seconds,
            });
            break;

          case "interjection_received":
            break;

          case "round_end":
            setActiveAgent(null);
            setThinkingAgent(null);
            break;

          case "verdict":
            setVerdict(msg.data);
            updateStatus("verdict");
            break;

          case "debate_end":
            updateStatus("finished");
            setActiveAgent(null);
            setThinkingAgent(null);
            break;

          case "error":
            setError(msg.data.message);
            updateStatus("error");
            break;
        }
      };

      ws.onerror = () => {
        setError("Connection failed. Is the backend running?");
        updateStatus("error");
      };

      ws.onclose = () => {
        const current = statusRef.current;
        if (
          current !== "finished" &&
          current !== "error" &&
          current !== "verdict" &&
          current !== "idle"
        ) {
          setError(
            "Connection closed unexpectedly. The backend may have encountered an error."
          );
          updateStatus("error");
        }
      };
    },
    [updateStatus]
  );

  const sendInterjection = useCallback((text: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "interjection", text }));
      setPauseData(null);
    }
  }, []);

  const skipInterjection = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "skip" }));
      setPauseData(null);
    }
  }, []);

  const disconnect = useCallback(() => {
    wsRef.current?.close();
    updateStatus("idle");
  }, [updateStatus]);

  // Stop TTS display but keep WS open so verdict still arrives from server
  const forceComplete = useCallback(() => {
    // Do NOT close the websocket — let backend keep sending until verdict arrives
    // We just signal the UI to stop showing live audio and reveal all messages
    setActiveAgent(null);
    setThinkingAgent(null);
  }, []);

  return {
    status,
    setup,
    messages,
    currentRound,
    currentRoundNum,
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
  };
}
