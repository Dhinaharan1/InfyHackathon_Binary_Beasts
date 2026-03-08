"use client";

import { useRef, useCallback, useState } from "react";

interface QueueItem {
  audioBase64: string;
  onStart: (durationMs: number) => void;
  onEnd: () => void;
}

export function useSpeechSynthesis() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const queueRef = useRef<QueueItem[]>([]);
  const playingRef = useRef(false);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  const ensureAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      const ctx = new AudioContext();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;

      const gain = ctx.createGain();
      gain.gain.value = 0.85;

      analyser.connect(gain);
      gain.connect(ctx.destination);

      audioCtxRef.current = ctx;
      analyserRef.current = analyser;
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
    }

    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }

    return { ctx: audioCtxRef.current, analyser: analyserRef.current! };
  }, []);

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

    const { ctx, analyser } = ensureAudioContext();

    const audio = new Audio(`data:audio/mp3;base64,${item.audioBase64}`);
    audioRef.current = audio;

    try {
      const source = ctx.createMediaElementSource(audio);
      source.connect(analyser);
    } catch {
      audio.volume = 0.85;
    }

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
  }, [ensureAudioContext]);

  const speak = useCallback(
    (
      audioBase64: string | undefined,
      onStart: (durationMs: number) => void,
      onEnd: () => void
    ) => {
      if (!audioBase64) {
        onStart(5000);
        onEnd();
        return;
      }
      queueRef.current.push({ audioBase64, onStart, onEnd });
      if (!playingRef.current) {
        playNext();
      }
    },
    [playNext]
  );

  const getAmplitude = useCallback((): number => {
    if (!analyserRef.current || !dataArrayRef.current) return 0;
    analyserRef.current.getByteTimeDomainData(dataArrayRef.current);

    let sum = 0;
    const data = dataArrayRef.current;
    for (let i = 0; i < data.length; i++) {
      const val = (data[i] - 128) / 128;
      sum += val * val;
    }
    return Math.min(Math.sqrt(sum / data.length) * 4, 1);
  }, []);

  const isIdle = useCallback(() => {
    return !playingRef.current && queueRef.current.length === 0;
  }, []);

  const pause = useCallback(() => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      pausedRef.current = true;
      setPaused(true);
    }
  }, []);

  const resume = useCallback(() => {
    if (audioRef.current && pausedRef.current) {
      audioRef.current.play().catch(() => {});
      pausedRef.current = false;
      setPaused(false);
    }
  }, []);

  const stop = useCallback(() => {
    queueRef.current = [];
    playingRef.current = false;
    pausedRef.current = false;
    setPaused(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute("src");
      audioRef.current = null;
    }
  }, []);

  return { speak, stop, pause, resume, paused, isIdle, getAmplitude };
}
