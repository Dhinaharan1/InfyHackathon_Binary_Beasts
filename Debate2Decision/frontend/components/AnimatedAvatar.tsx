"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Props {
  avatarImage?: string | null;
  agentName: string;
  agentColor: string;
  state: "idle" | "speaking" | "listening" | "thinking";
  getAmplitude?: () => number;
  size: "sm" | "lg";
}

export default function AnimatedAvatar({
  avatarImage,
  agentName,
  agentColor,
  state,
  getAmplitude,
  size,
}: Props) {
  const waveCanvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const [imgLoaded, setImgLoaded] = useState(false);

  const stateRef = useRef(state);
  const getAmpRef = useRef(getAmplitude);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);
  useEffect(() => {
    getAmpRef.current = getAmplitude;
  }, [getAmplitude]);

  const dim = size === "lg" ? 200 : 64;
  const imgDim = size === "lg" ? 170 : 48;

  const initials = agentName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  const cr = parseInt(agentColor.slice(1, 3), 16);
  const cg = parseInt(agentColor.slice(3, 5), 16);
  const cb = parseInt(agentColor.slice(5, 7), 16);

  const imgSrc = avatarImage
    ? avatarImage.startsWith("data:")
      ? avatarImage
      : `data:image/png;base64,${avatarImage}`
    : null;

  // Waveform ring animation (audio-reactive bars around the avatar)
  useEffect(() => {
    const waveCanvas = waveCanvasRef.current;
    if (!waveCanvas) return;

    const dpr = window.devicePixelRatio || 1;
    const wCtx = waveCanvas.getContext("2d")!;
    waveCanvas.width = dim * dpr;
    waveCanvas.height = dim * dpr;
    wCtx.scale(dpr, dpr);

    const wCenter = dim / 2;
    const wRadius = imgDim / 2 + (size === "lg" ? 6 : 3);
    const barCount = size === "lg" ? 48 : 24;
    const barWidth = size === "lg" ? 3 : 2;
    const maxBarH = size === "lg" ? 18 : 7;

    let smoothAmp = 0;

    const animate = () => {
      const now = Date.now();
      const curState = stateRef.current;
      const rawAmp =
        curState === "speaking" ? (getAmpRef.current?.() ?? 0) : 0;
      smoothAmp += (rawAmp - smoothAmp) * 0.25;

      wCtx.clearRect(0, 0, dim, dim);

      if (smoothAmp > 0.02 && curState === "speaking") {
        for (let i = 0; i < barCount; i++) {
          const angle = (i / barCount) * Math.PI * 2 - Math.PI / 2;
          const wave = Math.sin(i * 0.8 + now / 120) * 0.3 + 0.7;
          const h = smoothAmp * maxBarH * wave;
          const x1 = wCenter + Math.cos(angle) * wRadius;
          const y1 = wCenter + Math.sin(angle) * wRadius;
          const x2 = wCenter + Math.cos(angle) * (wRadius + h);
          const y2 = wCenter + Math.sin(angle) * (wRadius + h);
          wCtx.beginPath();
          wCtx.moveTo(x1, y1);
          wCtx.lineTo(x2, y2);
          wCtx.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, ${0.3 + smoothAmp * 0.7})`;
          wCtx.lineWidth = barWidth;
          wCtx.lineCap = "round";
          wCtx.stroke();
        }
      }

      if (curState === "idle" || curState === "listening") {
        const pulse = Math.sin(now / 2000) * 0.15 + 0.15;
        wCtx.beginPath();
        wCtx.arc(wCenter, wCenter, wRadius + 2, 0, Math.PI * 2);
        wCtx.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, ${pulse})`;
        wCtx.lineWidth = 1;
        wCtx.stroke();
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animRef.current);
  }, [dim, imgDim, size, cr, cg, cb]);

  const hasImage = imgSrc;

  return (
    <div
      className="relative flex items-center justify-center flex-shrink-0"
      style={{ width: dim, height: dim }}
    >
      {/* Waveform ring canvas */}
      <canvas
        ref={waveCanvasRef}
        className="absolute inset-0 z-10 pointer-events-none"
        style={{ width: dim, height: dim }}
      />

      {/* Glow when speaking */}
      {state === "speaking" && (
        <motion.div
          className="absolute rounded-full z-0"
          style={{
            width: imgDim + 28,
            height: imgDim + 28,
            background: `radial-gradient(circle, ${agentColor}50 0%, transparent 70%)`,
          }}
          animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.4 }}
        />
      )}

      {/* Portrait circle */}
      <div
        className="rounded-full overflow-hidden z-[5] relative"
        style={{
          width: imgDim,
          height: imgDim,
          border: `${size === "lg" ? 3 : 2}px solid ${agentColor}`,
          boxShadow:
            state === "speaking"
              ? `0 0 30px ${agentColor}70, 0 0 60px ${agentColor}20`
              : state === "thinking"
                ? `0 0 20px ${agentColor}40`
                : "none",
          transition: "box-shadow 0.3s ease",
        }}
      >
        {/* Static avatar image */}
        {hasImage && (
          <img
            src={imgSrc!}
            alt={agentName}
            className="w-full h-full object-cover"
            onLoad={() => setImgLoaded(true)}
          />
        )}

        {/* Fallback initials */}
        {!hasImage && (
          <div
            className="absolute inset-0 flex items-center justify-center text-white font-bold"
            style={{
              fontSize: size === "lg" ? "3rem" : "1rem",
              background: `linear-gradient(135deg, ${agentColor} 0%, ${agentColor}CC 100%)`,
            }}
          >
            {initials}
          </div>
        )}
      </div>

      {/* Speaking badge */}
      {state === "speaking" && (
        <motion.div
          className="absolute z-20 flex items-center justify-center rounded-full bg-emerald-500 border-2 border-gray-900"
          style={{
            width: size === "lg" ? 32 : 20,
            height: size === "lg" ? 32 : 20,
            bottom: size === "lg" ? 8 : 0,
            right: size === "lg" ? 8 : 0,
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        >
          <div className="flex items-center gap-[2px]">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-full soundwave-bar"
                style={{
                  width: size === "lg" ? 3 : 2,
                  height: size === "lg" ? 6 : 4,
                }}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Thinking badge */}
      {state === "thinking" && (
        <motion.div
          className="absolute z-20 flex items-center justify-center rounded-full bg-indigo-500 border-2 border-gray-900"
          style={{
            width: size === "lg" ? 32 : 20,
            height: size === "lg" ? 32 : 20,
            bottom: size === "lg" ? 8 : 0,
            right: size === "lg" ? 8 : 0,
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
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

      {/* Listening badge */}
      {state === "listening" && (
        <motion.div
          className="absolute z-20 flex items-center justify-center rounded-full bg-gray-600 border-2 border-gray-900"
          style={{
            width: size === "lg" ? 28 : 18,
            height: size === "lg" ? 28 : 18,
            bottom: size === "lg" ? 8 : 0,
            right: size === "lg" ? 8 : 0,
          }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <span style={{ fontSize: size === "lg" ? 14 : 10 }}>
            {"\uD83D\uDC42"}
          </span>
        </motion.div>
      )}
    </div>
  );
}
