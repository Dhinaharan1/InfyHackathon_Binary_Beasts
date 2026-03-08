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
}

export interface DebateMessage {
  agent: AgentPersona;
  content: string;
  round_name: string;
  round_number: number;
  audio?: string;
}

export interface DebateSetup {
  topic: string;
  industry: string;
  agents: AgentPersona[];
  total_rounds: number;
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
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const wsRef = useRef<WebSocket | null>(null);
  const statusRef = useRef<DebateStatus>("idle");

  const updateStatus = useCallback((newStatus: DebateStatus) => {
    statusRef.current = newStatus;
    setStatus(newStatus);
  }, []);

  const startDebate = useCallback(
    (topic: string, language: string = "english") => {
      updateStatus("connecting");
      setMessages([]);
      setSetup(null);
      setVerdict(null);
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
        ws.send(JSON.stringify({ topic, language }));
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
            break;

          case "agent_thinking":
            setThinkingAgent(msg.data.agent_name);
            break;

          case "agent_message":
            setThinkingAgent(null);
            setActiveAgent(msg.data.agent.name);
            setMessages((prev) => [...prev, msg.data]);
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

  const disconnect = useCallback(() => {
    wsRef.current?.close();
    updateStatus("idle");
  }, [updateStatus]);

  return {
    status,
    setup,
    messages,
    currentRound,
    currentRoundNum,
    activeAgent,
    thinkingAgent,
    verdict,
    error,
    statusMessage,
    startDebate,
    disconnect,
  };
}
