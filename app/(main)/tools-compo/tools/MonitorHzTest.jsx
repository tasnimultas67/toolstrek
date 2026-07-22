"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Monitor,
  Play,
  Square,
  Zap,
  Gauge,
  RefreshCw,
  Palette,
  Info,
  Copy,
  Check,
  MoveHorizontal,
  Sun,
} from "lucide-react";
import ToolPageShell from "../ToolPageShell";
import { cn } from "@/lib/utils";

const PRESETS = [30, 60, 75, 120, 144, 240];

export default function MonitorHzTest() {
  const [targetHz, setTargetHz] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const [testMode, setTestMode] = useState("flicker");
  const [estimatedHz, setEstimatedHz] = useState(null);
  const [copied, setCopied] = useState(false);

  const flickerRef = useRef(null);
  const barRef = useRef(null);
  const rafRef = useRef(null);
  const stateRef = useRef({
    running: false,
    mode: "flicker",
    hz: 60,
    lastToggle: 0,
    lastMove: 0,
    on: true,
    phase: 0,
    intervalMs: 1000 / 60,
    halfInterval: 1000 / 120,
  });

  const stop = useCallback(() => {
    stateRef.current.running = false;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setIsRunning(false);
  }, []);

  const start = useCallback(() => {
    if (stateRef.current.running) {
      stop();
      return;
    }

    stateRef.current.running = true;
    stateRef.current.mode = testMode;
    stateRef.current.hz = targetHz;
    stateRef.current.intervalMs = 1000 / targetHz;
    stateRef.current.halfInterval = stateRef.current.intervalMs / 2;
    stateRef.current.lastToggle = performance.now();
    stateRef.current.lastMove = stateRef.current.lastToggle;
    stateRef.current.on = true;
    stateRef.current.phase = 0;
    setIsRunning(true);

    const tick = (now) => {
      const s = stateRef.current;
      if (!s.running) return;

      if (s.mode === "flicker" || s.mode === "pulse") {
        if (now - s.lastToggle >= s.halfInterval) {
          s.lastToggle = now;
          s.on = !s.on;
          if (flickerRef.current) {
            flickerRef.current.style.backgroundColor = s.on ? "#ffffff" : "#000000";
          }
        }
      }

      if (s.mode === "motion") {
        if (now - s.lastMove >= s.intervalMs) {
          s.lastMove = now;
          s.phase = (s.phase + 1) % 100;
        }
        if (barRef.current) {
          const x = 50 * Math.abs(Math.sin((s.phase / 100) * Math.PI * 2));
          barRef.current.style.left = `calc(${x}% - 2rem)`;
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [testMode, targetHz, stop]);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    if (isRunning) {
      stop();
      start();
    }
  }, [testMode, targetHz, isRunning, stop, start]);

  const handleAutoScan = useCallback(() => {
    stop();
    const candidates = [30, 60, 75, 90, 100, 120, 144, 165, 180, 240];
    let idx = 0;
    setEstimatedHz("scanning...");
    setIsRunning(false);

    const scan = () => {
      if (idx >= candidates.length) {
        setEstimatedHz("complete");
        setTimeout(() => setEstimatedHz(null), 2000);
        return;
      }
      setTargetHz(candidates[idx]);
      setEstimatedHz(`${candidates[idx]} Hz`);
      setTimeout(() => {
        idx++;
        scan();
      }, 1800);
    };

    scan();
  }, [stop]);

  const handleCopyHz = () => {
    navigator.clipboard.writeText(`${targetHz} Hz`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <ToolPageShell widthClassName="max-w-5xl">
      <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-500/10 text-violet-600 dark:text-violet-400 rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
            <Monitor className="w-3.5 h-3.5" />
            Display Hardware
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-violet-600 via-indigo-600 to-emerald-600 bg-clip-text text-transparent dark:from-violet-400 dark:to-emerald-400">
            Monitor Hz Test
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 max-w-2xl mx-auto">
            Detect your display refresh rate using interactive flicker, pulse, and motion tests. Adjust frequency, observe the animation, and find the Hz where flicker disappears or motion feels native.
          </p>
        </div>

        <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 md:p-6">
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-violet-500/10 rounded-xl">
                  <Gauge className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Target Frequency</p>
                  <p className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 font-mono">
                    {targetHz} <span className="text-lg text-slate-500">Hz</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyHz}
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
                  title="Copy Hz value"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-500" />}
                </button>
                <button
                  onClick={isRunning ? stop : start}
                  className={cn(
                    "px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer",
                    isRunning
                      ? "bg-rose-500 hover:bg-rose-600 text-white"
                      : "bg-violet-600 hover:bg-violet-700 text-white"
                  )}
                >
                  {isRunning ? (
                    <>
                      <Square className="w-4 h-4" /> Stop
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" /> Start Test
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>1 Hz</span>
                <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">{(1000 / targetHz).toFixed(2)} ms / frame</span>
                <span>240 Hz</span>
              </div>
              <input
                type="range"
                min="1"
                max="240"
                value={targetHz}
                onChange={(e) => {
                  setTargetHz(Number(e.target.value));
                  if (isRunning) {
                    stop();
                    start();
                  }
                }}
                className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-violet-600 dark:accent-violet-500"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {PRESETS.map((hz) => (
                <button
                  key={hz}
                  onClick={() => setTargetHz(hz)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer",
                    targetHz === hz
                      ? "bg-violet-500/15 border-violet-500/40 text-violet-700 dark:text-violet-300"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-violet-300 dark:hover:border-violet-800"
                  )}
                >
                  {hz} Hz
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { value: "flicker", label: "Flicker Test", icon: Palette },
                { value: "motion", label: "Motion Test", icon: MoveHorizontal },
                { value: "pulse", label: "Pulse Test", icon: Sun },
              ].map((mode) => (
                <button
                  key={mode.value}
                  onClick={() => setTestMode(mode.value)}
                  className={cn(
                    "px-3 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer",
                    testMode === mode.value
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-emerald-300"
                  )}
                >
                  <mode.icon className="w-3.5 h-3.5" />
                  {mode.label}
                </button>
              ))}
            </div>

            <button
              onClick={handleAutoScan}
              disabled={isRunning}
              className="w-full py-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-violet-400 dark:hover:border-violet-600 hover:bg-violet-50/50 dark:hover:bg-violet-950/20 text-sm font-semibold text-slate-600 dark:text-slate-300 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className="w-4 h-4" />
              Auto-Scan Frequencies
            </button>
          </div>
        </div>

        <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-lg bg-black">
          {estimatedHz === "scanning..." && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 px-4 py-2 bg-black/80 text-white rounded-full text-xs font-bold border border-white/20 backdrop-blur-sm">
              Scanning: {estimatedHz}
            </div>
          )}
          {estimatedHz === "complete" && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 px-4 py-2 bg-emerald-500/90 text-white rounded-full text-xs font-bold shadow-lg backdrop-blur-sm">
              Scan complete. Try values near typical rates (60, 120, 144, 240).
            </div>
          )}

          {testMode === "flicker" && (
            <div
              ref={flickerRef}
              className="w-full h-64 md:h-80"
              style={{ backgroundColor: isRunning ? undefined : "#ffffff" }}
            />
          )}

          {testMode === "pulse" && (
            <div
              ref={flickerRef}
              className="w-full h-64 md:h-80"
              style={{ backgroundColor: isRunning ? undefined : "#ffffff" }}
            />
          )}

          {testMode === "motion" && (
            <div className="relative w-full h-64 md:h-80 bg-slate-100 dark:bg-slate-950 overflow-hidden">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full px-8 md:px-16">
                  <div className="relative w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      ref={barRef}
                      className="absolute top-0 h-full w-16 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full shadow-lg"
                      style={{ left: `calc(50% - 2rem)` }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-[10px] text-slate-400 font-mono">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-4 left-0 right-0 text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Bar updates at {targetHz} updates/sec
                </p>
              </div>
            </div>
          )}

          {!isRunning && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-10">
              <div className="text-center">
                <Play className="w-12 h-12 text-white/80 mx-auto mb-3" />
                <p className="text-white font-semibold text-sm">Press Start Test to begin</p>
                <p className="text-white/60 text-xs mt-1">Observe the animation and adjust Hz accordingly</p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-4 h-4 text-violet-500" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">How it works</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              The display updates frames at its native refresh rate. When the test frequency matches your monitor Hz, the animation appears smooth. Lower values show visible flicker or stutter.
            </p>
          </div>

          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Flicker Fusion</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              In the Flicker or Pulse test, alternating colors at your monitor&apos;s exact Hz will appear steady. Slower rates show obvious flashing. This is the Critical Flicker Frequency (CFF) principle.
            </p>
          </div>

          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <div className="flex items-center gap-2 mb-2">
              <MoveHorizontal className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Motion Test</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              The moving bar test reveals refresh rate through perceived motion smoothness. At native Hz the motion looks continuous; mismatched rates cause visible judder or temporal aliasing.
            </p>
          </div>
        </div>
      </div>
    </ToolPageShell>
  );
}
