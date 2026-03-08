"use client";

import { useRef, useCallback } from "react";

interface QueueItem {
  audioBase64: string;
  onStart: (durationMs: number) => void;
  onEnd: () => void;
}

export function useSpeechSynthesis() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const queueRef = useRef<QueueItem[]>([]);
  const playingRef = useRef(false);

  const playNext = useCallback(() => {
    if (queueRef.current.length === 0) {
      playingRef.current = false;
      return;
    }

    playingRef.current = true;
    const item = queueRef.current.shift()!;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute("src");
    }

    const audio = new Audio(`data:audio/mp3;base64,${item.audioBase64}`);
    audioRef.current = audio;
    audio.volume = 0.85;

    audio.onloadedmetadata = () => {
      const durationMs = (audio.duration || 5) * 1000;
      item.onStart(durationMs);
    };

    audio.onended = () => {
      item.onEnd();
      playingRef.current = false;
      playNext();
    };

    audio.onerror = () => {
      item.onStart(5000);
      item.onEnd();
      playingRef.current = false;
      playNext();
    };

    audio.play().catch(() => {
      item.onStart(5000);
      item.onEnd();
      playingRef.current = false;
      playNext();
    });
  }, []);

  const speak = useCallback(
    (
      audioBase64: string | undefined,
      onStart: (durationMs: number) => void,
      onEnd: () => void
    ) => {
      if (!audioBase64) {
        onStart(5000);
        return;
      }
      queueRef.current.push({ audioBase64, onStart, onEnd });
      if (!playingRef.current) {
        playNext();
      }
    },
    [playNext]
  );

  const isIdle = useCallback(() => {
    return !playingRef.current && queueRef.current.length === 0;
  }, []);

  const stop = useCallback(() => {
    queueRef.current = [];
    playingRef.current = false;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute("src");
      audioRef.current = null;
    }
  }, []);

  return { speak, stop, isIdle };
}
