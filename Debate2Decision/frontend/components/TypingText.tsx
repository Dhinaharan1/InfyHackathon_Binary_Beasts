"use client";

import { useState, useEffect, useRef } from "react";

interface Props {
  text: string;
  speed?: number;
  durationMs?: number;
  paused?: boolean;
  onComplete?: () => void;
  className?: string;
}

export default function TypingText({
  text,
  speed,
  durationMs,
  paused = false,
  onComplete,
  className = "",
}: Props) {
  const [displayed, setDisplayed] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const indexRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setDisplayed("");
    setIsComplete(false);
    indexRef.current = 0;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [text]);

  useEffect(() => {
    if (paused || isComplete) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    let charSpeed: number;
    if (durationMs && text.length > 0) {
      charSpeed = Math.max(durationMs / text.length, 8);
    } else {
      charSpeed = speed || 20;
    }

    intervalRef.current = setInterval(() => {
      if (indexRef.current < text.length) {
        indexRef.current++;
        setDisplayed(text.slice(0, indexRef.current));
      } else {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
        setIsComplete(true);
        onComplete?.();
      }
    }, charSpeed);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [paused, isComplete, durationMs, speed, text, onComplete]);

  return (
    <span className={className}>
      {displayed}
      {!isComplete && !paused && <span className="typing-cursor" />}
    </span>
  );
}
