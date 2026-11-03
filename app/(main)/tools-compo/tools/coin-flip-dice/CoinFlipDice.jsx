"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  Coins,
  Dices,
  Download,
  History,
  Info,
  Plus,
  RotateCcw,
  Settings2,
  Sparkles,
  Target,
  Trash2,
  Trophy,
  Volume2,
  VolumeX,
} from "lucide-react";
import { toast } from "sonner";
import { useRecentTools } from "@/hooks/useRecentTools";
import {
  ActionButton,
  Callout,
  Chip,
  CopyButton,
  FaqAccordion,
  Field,
  Hero,
  NumberStepper,
  SectionCard,
  Segmented,
  SliderRow,
  Stat,
  ToggleRow,
  fieldClass,
  labelClass,
} from "../_shared/toolkit/ToolKit";
import { downloadText, pickIndex, randomInt, toCsv, uid } from "../_shared/toolkit/random";
import {
  COIN_DICE_FAQS,
  COIN_STORAGE_KEY,
  DEFAULT_COIN_DICE_SETTINGS,
  DEFAULT_COIN_FACES,
  DEMO_SETUPS,
  DICE_PRESETS,
} from "./coinDiceData";

const TOOL_META = {
  title: "Coin Flip & Dice",
  link: "/tools/coin-flip-dice",
  icon: "Coins",
};

const PIPS = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

function normalizeFace(face, index) {
  return {
    id: face?.id || uid("face"),
    label: String(face?.label ?? "").slice(0, 40) || `Side ${index + 1}`,
    weight: Math.max(0.01, Number(face?.weight) || 1),
    color: face?.color || ["#f59e0b", "#6366f1", "#10b981"][index % 3],
  };
}

function DieFace({ value, sides }) {
  if (sides > 6) {
    return (
      <span className="text-2xl font-black tabular-nums text-slate-900 dark:text-white sm:text-3xl">{value}</span>
    );
  }
  const dots = PIPS[value] || [];
  return (
    <span className="grid h-full w-full grid-cols-3 grid-rows-3 gap-1 p-2.5" aria-hidden="true">
      {Array.from({ length: 9 }, (_, index) => (
        <span
          key={index}
          className={`rounded-full ${dots.includes(index) ? "bg-slate-900 dark:bg-white" : "bg-transparent"}`}
        />
      ))}
    </span>
  );
}

function formatSigned(value) {
  const number = Number(value) || 0;
  return number > 0 ? `+${number}` : String(number);
}

export default function CoinFlipDice() {
  const { addRecentTool } = useRecentTools();

  const [faces, setFaces] = useState(DEFAULT_COIN_FACES);
  const [settings, setSettings] = useState(DEFAULT_COIN_DICE_SETTINGS);
  const [history, setHistory] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  const [coinResults, setCoinResults] = useState([]);
  const [diceResults, setDiceResults] = useState([]);
  const [dicePairs, setDicePairs] = useState([]);
  const [diceTotal, setDiceTotal] = useState(null);
  const [busy, setBusy] = useState(false);
  const [spinningFaces, setSpinningFaces] = useState([]);

  const timerRef = useRef(null);
  const intervalRef = useRef(null);
  const audioRef = useRef(null);
  const importRef = useRef(null);

  useEffect(() => {
    addRecentTool(TOOL_META);
    const timer = window.setTimeout(() => {
      try {
        const raw = typeof window !== "undefined" ? window.localStorage.getItem(COIN_STORAGE_KEY) : null;
        if (raw) {
          const saved = JSON.parse(raw);
          if (Array.isArray(saved.faces) && saved.faces.length) {
            setFaces(saved.faces.map(normalizeFace));
          }
          if (saved.settings) setSettings({ ...DEFAULT_COIN_DICE_SETTINGS, ...saved.settings });
          if (Array.isArray(saved.history)) setHistory(saved.history.slice(0, 100));
        }
      } catch {
        // Ignore corrupt local data and start fresh.
      }
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [addRecentTool]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(
        COIN_STORAGE_KEY,
        JSON.stringify({ faces, settings, history: history.slice(0, 100) }),
      );
    } catch {
      // Storage can be unavailable in private windows; the tool still works.
    }
  }, [faces, settings, history, hydrated]);

  useEffect(
    () => () => {
      window.clearTimeout(timerRef.current);
      window.clearInterval(intervalRef.current);
      if (audioRef.current) {
        audioRef.current.close().catch(() => {});
        audioRef.current = null;
      }
    },
    [],
  );

  const playTone = useCallback(
    (frequency, duration = 0.08, type = "sine", volume = 0.035) => {
      if (!settings.sound || typeof window === "undefined") return;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioRef.current) audioRef.current = new AudioCtx();
      const context = audioRef.current;
      if (context.state === "suspended") context.resume().catch(() => {});
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = type;
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(volume, context.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + duration + 0.02);
    },
    [settings.sound],
  );

  const playLand = useCallback(() => {
    [660, 880, 1100].forEach((frequency, index) => {
      window.setTimeout(() => playTone(frequency, 0.16, "triangle", 0.045), index * 80);
    });
  }, [playTone]);

  const totalFaceWeight = useMemo(
    () =>
      faces.reduce(
        (sum, face) => sum + (settings.coinBiasMode === "weighted" ? Math.max(0.01, Number(face.weight) || 1) : 1),
        0,
      ),
    [faces, settings.coinBiasMode],
  );

  const coinOdds = useMemo(() => {
    if (!faces.length) return {};
    return faces.reduce((map, face) => {
      const weight = settings.coinBiasMode === "weighted" ? Math.max(0.01, Number(face.weight) || 1) : 1;
      map[face.id] = totalFaceWeight ? (weight / totalFaceWeight) * 100 : 0;
      return map;
    }, {});
  }, [faces, settings.coinBiasMode, totalFaceWeight]);

  const stats = useMemo(() => {
    const coinEntries = history.filter((item) => item.mode === "coin");
    const diceEntries = history.filter((item) => item.mode === "dice");
    const facesFlat = coinEntries.flatMap((item) => item.results);
    const distribution = facesFlat.reduce((map, label) => {
      map[label] = (map[label] || 0) + 1;
      return map;
    }, {});
    const top = Object.entries(distribution).sort((a, b) => b[1] - a[1])[0];
    const values = diceEntries.map((item) => Number(item.total) || 0);
    return {
      flips: coinEntries.length,
      rolls: diceEntries.length,
      topFace: top ? `${top[0]} ×${top[1]}` : "—",
      best: values.length ? Math.max(...values) : "—",
      average: values.length
        ? (values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1)
        : "—",
    };
  }, [history]);

  const distribution = useMemo(() => {
    const counts = history
      .filter((item) => item.mode === "coin")
      .flatMap((item) => item.results)
      .reduce((map, label) => {
        map[label] = (map[label] || 0) + 1;
        return map;
      }, {});
    const topCount = Math.max(1, ...Object.values(counts));
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([label, count]) => ({ label, count, percent: (count / topCount) * 100 }));
  }, [history]);

  const addFace = () => {
    setFaces((current) => [
      ...current,
      normalizeFace({ label: `Side ${current.length + 1}` }, current.length),
    ]);
  };

  const updateFace = (id, patch) => {
    setFaces((current) => current.map((face) => (face.id === id ? { ...face, ...patch } : face)));
  };

  const removeFace = (id) => {
    if (faces.length <= 2) {
      toast.error("A coin needs at least two sides.");
      return;
    }
    setFaces((current) => current.filter((face) => face.id !== id));
    setCoinResults([]);
  };

  const resetCoinFaces = () => {
    setFaces(DEFAULT_COIN_FACES.map(normalizeFace));
    setCoinResults([]);
    toast.success("Coin reset to Heads and Tails.");
  };

  const applyDemo = (key) => {
    const demo = DEMO_SETUPS[key];
    if (!demo) return;
    setFaces(demo.coinFaces.map(normalizeFace));
    setSettings((current) => ({
      ...current,
      coinCount: demo.coinCount,
      diceCount: demo.diceCount,
      diceSides: demo.diceSides,
      diceModifier: demo.diceModifier,
      tab: key === "dungeon" ? "dice" : "coin",
    }));
    clearResults();
    toast.success(`${demo.label} loaded. Nothing has been drawn yet.`);
  };

  const clearResults = () => {
    window.clearTimeout(timerRef.current);
    window.clearInterval(intervalRef.current);
    setCoinResults([]);
    setDiceResults([]);
    setDicePairs([]);
    setDiceTotal(null);
    setBusy(false);
    setSpinningFaces([]);
  };

  const flipCoins = useCallback(() => {
    if (busy) return;
    if (faces.length < 2) {
      toast.error("Add at least two sides before flipping.");
      return;
    }
    window.clearTimeout(timerRef.current);
    window.clearInterval(intervalRef.current);
    setDiceResults([]);
    setDiceTotal(null);
    setDicePairs([]);
    setCoinResults([]);
    setBusy(true);

    const count = Math.max(1, Math.min(20, Number(settings.coinCount) || 1));
    const weights = faces.map((face) =>
      settings.coinBiasMode === "weighted" ? Math.max(0.01, Number(face.weight) || 1) : 1,
    );
    const results = Array.from({ length: count }, () => {
      const index = pickIndex(weights);
      return faces[index < 0 ? 0 : index];
    });

    // The outcome is locked in before the animation so the visual never changes it.
    intervalRef.current = window.setInterval(() => {
      setSpinningFaces(
        Array.from({ length: count }, () => faces[randomInt(0, faces.length - 1)]),
      );
      playTone(700, 0.02, "square", 0.012);
    }, 90);

    timerRef.current = window.setTimeout(() => {
      window.clearInterval(intervalRef.current);
      setSpinningFaces([]);
      setCoinResults(results);
      setBusy(false);
      playLand();
      setHistory((current) =>
        [
          {
            id: uid("flip"),
            mode: "coin",
            results: results.map((face) => face.label),
            total: null,
            at: Date.now(),
          },
          ...current,
        ].slice(0, 100),
      );
    }, Math.max(400, Number(settings.coinDuration) * 1000));
  }, [busy, faces, settings.coinBiasMode, settings.coinCount, settings.coinDuration, playTone, playLand]);

  const rollDice = useCallback(() => {
    if (busy) return;
    const sides = Math.max(2, Math.min(1000, Number(settings.diceSides) || 6));
    const count = Math.max(1, Math.min(20, Number(settings.diceCount) || 1));
    const modifier = Number(settings.diceModifier) || 0;

    window.clearTimeout(timerRef.current);
    window.clearInterval(intervalRef.current);
    setCoinResults([]);
    setDiceResults([]);
    setDicePairs([]);
    setDiceTotal(null);
    setBusy(true);

    const rollPool = () => Array.from({ length: count }, () => randomInt(1, sides));
    const primary = rollPool();
    const secondary = settings.diceMode === "normal" ? null : rollPool();
    const primarySum = primary.reduce((sum, value) => sum + value, 0) + modifier;
    const secondarySum = secondary ? secondary.reduce((sum, value) => sum + value, 0) + modifier : null;

    let kept = primary;
    let keptSum = primarySum;
    let keptSecondary = null;
    if (settings.diceMode === "advantage" && secondarySum > primarySum) {
      kept = secondary;
      keptSum = secondarySum;
      keptSecondary = primarySum;
    } else if (settings.diceMode === "disadvantage" && secondarySum < primarySum) {
      kept = secondary;
      keptSum = secondarySum;
      keptSecondary = primarySum;
    } else if (secondary) {
      keptSecondary = secondarySum;
    }

    intervalRef.current = window.setInterval(() => {
      setDiceResults(Array.from({ length: count }, () => randomInt(1, sides)));
      playTone(360 + randomInt(0, 90), 0.025, "square", 0.014);
    }, 75);

    timerRef.current = window.setTimeout(() => {
      window.clearInterval(intervalRef.current);
      setDiceResults(kept);
      setDiceTotal(keptSum);
      setDicePairs(
        secondary
          ? [
              { label: "First roll", value: primarySum, kept: kept === primary },
              { label: "Second roll", value: secondarySum, kept: kept === secondary },
            ]
          : [],
      );
      setBusy(false);
      playLand();
      setHistory((current) =>
        [
          {
            id: uid("roll"),
            mode: "dice",
            results: kept.map(String),
            total: keptSum,
            sides,
            count,
            modifier,
            diceMode: settings.diceMode,
            at: Date.now(),
          },
          ...current,
        ].slice(0, 100),
      );
    }, Math.max(400, Number(settings.diceDuration) * 1000));
  }, [
    busy,
    settings.diceCount,
    settings.diceDuration,
    settings.diceModifier,
    settings.diceMode,
    settings.diceSides,
    playTone,
    playLand,
  ]);

  const exportHistory = () => {
    if (!history.length) {
      toast.error("Flip or roll first to build a history.");
      return;
    }
    downloadText(
      toCsv([
        ["Mode", "Results", "Total", "Timestamp"],
        ...history.map((item) => [
          item.mode === "coin" ? "Coin flip" : "Dice roll",
          item.results.join(" / "),
          item.total ?? "",
          new Date(item.at).toISOString(),
        ]),
      ]),
      "toolstrek-coin-dice-history.csv",
      "text/csv;charset=utf-8",
    );
  };

  const exportConfig = () => {
    downloadText(
      JSON.stringify({ name: "ToolsTrek coin & dice", faces, settings }, null, 2),
      "toolstrek-coin-dice.json",
      "application/json",
    );
  };

  const importConfig = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      const list = Array.isArray(parsed) ? parsed : parsed.faces;
      if (Array.isArray(list) && list.length >= 2) setFaces(list.map(normalizeFace));
      if (parsed.settings) setSettings({ ...DEFAULT_COIN_DICE_SETTINGS, ...parsed.settings });
      clearResults();
      toast.success("Coin and dice configuration imported.");
    } catch {
      toast.error("That file is not a valid ToolsTrek coin & dice JSON export.");
    }
  };

  const recent = history.slice(0, 8);
  const activeFace = coinResults[0];
  const others = coinResults.slice(1);
  const isCoinTab = settings.tab === "coin";

  return (
    <div className="tool-page-content space-y-5">
      <style>{`
        @keyframes coin-toss {
          0% { transform: rotateY(0deg) translateY(0) scale(1); }
          35% { transform: rotateY(720deg) translateY(-26px) scale(1.04); }
          70% { transform: rotateY(1440deg) translateY(-8px) scale(1.01); }
          100% { transform: rotateY(1800deg) translateY(0) scale(1); }
        }
        @keyframes dice-shake {
          0%, 100% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(-9deg) scale(0.96); }
          60% { transform: rotate(8deg) scale(1.03); }
        }
        .coin-tossing { animation: coin-toss var(--coin-duration, 1.6s) cubic-bezier(.2,.65,.25,1) both; }
        .dice-shaking { animation: dice-shake .32s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .coin-tossing, .dice-shaking { animation: none; }
        }
      `}</style>

      <Hero
        eyebrow="Chance studio"
        icon={Coins}
        title="Coin Flip & Dice"
        description="Flip fair or weighted custom coins and roll any dice you need — d4 to d100, pools, modifiers, advantage and disadvantage. Every outcome comes from cryptographically secure randomness and stays on your device."
        badges={["Crypto-secure", "Custom coin faces", "Any dice sides", "Private history"]}
        tone="amber"
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div className="space-y-5">
          <SectionCard
            icon={isCoinTab ? Coins : Dices}
            title={isCoinTab ? "Coin toss" : "Dice table"}
            description={
              isCoinTab
                ? "The result is chosen securely before the coin animation begins."
                : "Roll the pool below. Advantage rolls twice and keeps the higher total."
            }
            tone="amber"
            actions={
              <>
                <Chip tone="amber">{isCoinTab ? `${faces.length} sides` : `d${settings.diceSides}`}</Chip>
                <Chip tone="emerald">{isCoinTab ? `${settings.coinCount} coin${settings.coinCount === 1 ? "" : "s"}` : `${settings.diceCount} dice`}</Chip>
              </>
            }
          >
            <Segmented
              value={settings.tab}
              onChange={(value) => {
                setSettings((current) => ({ ...current, tab: value }));
                clearResults();
              }}
              options={[
                { value: "coin", label: "Coin flip", icon: <Coins className="h-3.5 w-3.5" /> },
                { value: "dice", label: "Dice roll", icon: <Dices className="h-3.5 w-3.5" /> },
              ]}
              columns={2}
              tone="amber"
            />

            {isCoinTab ? (
              <div className="mt-5 rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-4 dark:border-amber-900/50 dark:from-amber-950/30 dark:via-slate-900 dark:to-orange-950/20 sm:p-6">
                <div className="flex min-h-[210px] flex-wrap items-center justify-center gap-4">
                  {busy ? (
                    Array.from({ length: Math.max(1, Number(settings.coinCount) || 1) }, (_, index) => {
                      const face = spinningFaces[index % Math.max(1, spinningFaces.length)] || faces[index % faces.length];
                      return (
                        <div key={`spinning-${index}`} className="flex flex-col items-center">
                          <div
                            className="coin-tossing flex h-28 w-28 items-center justify-center rounded-full border-[5px] shadow-lg sm:h-32 sm:w-32"
                            style={{
                              borderColor: face?.color || "#f59e0b",
                              background: `radial-gradient(circle at 32% 28%, #ffffff, ${face?.color || "#f59e0b"} 78%)`,
                              animationDelay: `${index * 60}ms`,
                              ["--coin-duration"]: `${settings.coinDuration}s`,
                            }}
                          >
                            <span className="flex h-[82%] w-[82%] items-center justify-center rounded-full border border-white/40 bg-black/10 px-1 text-center text-sm font-black uppercase tracking-wide text-white drop-shadow sm:text-base">
                              {face?.label || "…"}
                            </span>
                          </div>
                          <span className="mt-2 rounded-full bg-white/80 px-2 py-0.5 text-xs font-bold text-slate-600 shadow-sm dark:bg-slate-800 dark:text-slate-300">
                            Coin {index + 1}
                          </span>
                        </div>
                      );
                    })
                  ) : coinResults.length === 0 ? (
                    <div className="relative">
                      <div className="flex h-40 w-40 items-center justify-center rounded-full border-[6px] border-amber-300 bg-gradient-to-br from-amber-200 via-amber-300 to-orange-400 shadow-xl shadow-amber-500/30 dark:border-amber-600 dark:from-amber-500 dark:via-amber-600 dark:to-orange-700">
                        <div className="flex h-[124px] w-[124px] flex-col items-center justify-center rounded-full border border-white/60 bg-white/20 text-amber-950 backdrop-blur-sm dark:text-amber-50">
                          <Coins className="h-9 w-9" />
                          <span className="mt-1 text-xs font-black uppercase tracking-[0.18em]">Ready</span>
                        </div>
                      </div>
                      {[0, 1, 2].map((index) => (
                        <span
                          key={index}
                          className="absolute inset-0 rounded-full border border-amber-400/40"
                          style={{ transform: `scale(${1.08 + index * 0.07})` }}
                        />
                      ))}
                    </div>
                  ) : (
                    coinResults.map((face, index) => (
                      <div key={`${face.id}-${index}`} className="flex flex-col items-center">
                        <div
                          className={`flex h-28 w-28 items-center justify-center rounded-full border-[5px] shadow-lg sm:h-32 sm:w-32 ${
                            busy ? "coin-tossing" : ""
                          }`}
                          style={{
                            borderColor: face.color,
                            background: `radial-gradient(circle at 32% 28%, #ffffff, ${face.color} 78%)`,
                            boxShadow: `0 14px 30px -12px ${face.color}`,
                            animationDelay: busy ? `${index * 60}ms` : undefined,
                            ["--coin-duration"]: `${settings.coinDuration}s`,
                          }}
                        >
                          <span
                            className="flex h-[82%] w-[82%] items-center justify-center rounded-full border border-white/40 bg-black/10 px-1 text-center text-sm font-black uppercase tracking-wide text-white drop-shadow sm:text-base"
                            style={{ wordBreak: "break-word" }}
                          >
                            {face.label}
                          </span>
                        </div>
                        <span className="mt-2 rounded-full bg-white/80 px-2 py-0.5 text-xs font-bold text-slate-600 shadow-sm dark:bg-slate-800 dark:text-slate-300">
                          Coin {index + 1}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                {busy && spinningFaces.length > 0 && (
                  <p className="mt-2 text-center text-sm font-semibold text-amber-700 dark:text-amber-300" aria-live="polite">
                    Flipping…
                  </p>
                )}

                <button
                  type="button"
                  onClick={flipCoins}
                  disabled={busy || faces.length < 2}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 px-6 py-3 text-base font-black text-white shadow-lg shadow-amber-500/25 transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-45 dark:focus-visible:ring-offset-slate-900"
                >
                  <Coins className={`h-4 w-4 ${busy ? "animate-pulse" : ""}`} />
                  {busy ? "Flipping…" : `Flip ${settings.coinCount} coin${settings.coinCount === 1 ? "" : "s"}`}
                </button>

                {coinResults.length > 0 && !busy && (
                  <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/30">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">
                          <Trophy className="h-5 w-5" />
                        </span>
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-300">
                            Outcome
                          </p>
                          <p className="text-xl font-black leading-tight text-slate-900 dark:text-white">
                            {activeFace?.label}
                            {others.length > 0 && (
                              <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
                                {" "}
                                + {others.map((face) => face.label).join(", ")}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <CopyButton text={coinResults.map((face) => face.label).join(" / ")} label="Copy" tone="emerald" />
                        <ActionButton icon={RotateCcw} onClick={flipCoins} disabled={busy}>
                          Flip again
                        </ActionButton>
                      </div>
                    </div>
                  </div>
                )}

                <p aria-live="polite" className="sr-only">
                  {busy ? "Flipping" : coinResults.length ? `Result: ${coinResults.map((face) => face.label).join(", ")}` : ""}
                </p>
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-amber-100 bg-gradient-to-br from-slate-50 via-white to-amber-50 p-4 dark:border-amber-900/50 dark:from-slate-950/40 dark:via-slate-900 dark:to-amber-950/20 sm:p-6">
                <div className="flex min-h-[210px] flex-wrap items-center justify-center gap-3">
                  {(busy || diceResults.length ? diceResults : Array.from({ length: settings.diceCount }, () => null)).map(
                    (value, index) => (
                      <div
                        key={index}
                        className={`flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-slate-200 bg-white shadow-md dark:border-slate-700 dark:bg-slate-800 sm:h-24 sm:w-24 ${
                          busy ? "dice-shaking" : ""
                        }`}
                        style={{ animationDelay: `${index * 40}ms` }}
                      >
                        {value === null || value === undefined ? (
                          <Dices className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                        ) : (
                          <DieFace value={value} sides={settings.diceSides} />
                        )}
                      </div>
                    ),
                  )}
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300">
                  <span className="rounded-full bg-white px-3 py-1 shadow-sm dark:bg-slate-800">
                    {settings.diceCount}d{settings.diceSides}
                  </span>
                  <span className="rounded-full bg-white px-3 py-1 shadow-sm dark:bg-slate-800">
                    {formatSigned(settings.diceModifier)} modifier
                  </span>
                  {settings.diceMode !== "normal" && (
                    <span className="rounded-full bg-amber-100 px-3 py-1 capitalize text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">
                      {settings.diceMode}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={rollDice}
                  disabled={busy}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 px-6 py-3 text-base font-black text-white shadow-lg shadow-amber-500/25 transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-45 dark:focus-visible:ring-offset-slate-900"
                >
                  <Dices className={`h-4 w-4 ${busy ? "animate-pulse" : ""}`} />
                  {busy ? "Rolling…" : "Roll the dice"}
                </button>

                {diceTotal !== null && !busy && (
                  <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/30">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-lg font-black text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">
                          {diceTotal}
                        </span>
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-300">
                            Total
                          </p>
                          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                            {diceResults.join(" + ")}
                            {Number(settings.diceModifier) !== 0 && ` ${formatSigned(settings.diceModifier)}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <CopyButton text={String(diceTotal)} label="Copy total" tone="emerald" />
                        <ActionButton icon={RotateCcw} onClick={rollDice}>
                          Roll again
                        </ActionButton>
                      </div>
                    </div>
                    {dicePairs.length > 0 && (
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {dicePairs.map((pair) => (
                          <div
                            key={pair.label}
                            className={`rounded-xl border px-3 py-2 text-sm font-bold ${
                              pair.kept
                                ? "border-emerald-300 bg-white text-emerald-800 dark:border-emerald-700 dark:bg-slate-900 dark:text-emerald-200"
                                : "border-slate-200 bg-white/60 text-slate-500 line-through dark:border-slate-700 dark:bg-slate-900/40"
                            }`}
                          >
                            {pair.label}: {pair.value}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <p aria-live="polite" className="sr-only">
                  {busy ? "Rolling" : diceTotal !== null ? `Total: ${diceTotal}` : ""}
                </p>
              </div>
            )}
          </SectionCard>

          <SectionCard
            icon={Coins}
            title="Coin faces"
            description="Rename the sides, recolour them, or give a side more weight. At least two sides are required."
            tone="amber"
            actions={
              <>
                <ActionButton icon={Plus} onClick={addFace}>
                  Add side
                </ActionButton>
                <ActionButton icon={RotateCcw} onClick={resetCoinFaces}>
                  Reset
                </ActionButton>
              </>
            }
          >
            <div className="space-y-2">
              {faces.map((face, index) => (
                <div
                  key={face.id}
                  className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/60 p-2 dark:border-slate-800 dark:bg-slate-800/30"
                >
                  <input
                    type="color"
                    value={face.color}
                    onChange={(event) => updateFace(face.id, { color: event.target.value })}
                    className="h-9 w-9 shrink-0 cursor-pointer rounded-lg border border-slate-200 bg-transparent p-0.5 dark:border-slate-700"
                    aria-label={`Colour for ${face.label}`}
                  />
                  <input
                    value={face.label}
                    onChange={(event) => updateFace(face.id, { label: event.target.value.slice(0, 40) })}
                    placeholder={`Side ${index + 1}`}
                    className={`${fieldClass(false)} min-w-[120px] flex-1`}
                    aria-label={`Label for side ${index + 1}`}
                  />
                  <div className="flex items-center gap-2">
                    <div className="relative w-20">
                      <input
                        type="number"
                        min="0.01"
                        step="1"
                        value={face.weight}
                        onChange={(event) =>
                          updateFace(face.id, {
                            weight: event.target.value === "" ? "" : Number(event.target.value),
                          })
                        }
                        onBlur={(event) =>
                          updateFace(face.id, { weight: Math.max(0.01, Number(event.target.value) || 1) })
                        }
                        className={`${fieldClass(false)} pr-7 text-center tabular-nums`}
                        aria-label={`Weight for ${face.label}`}
                        disabled={settings.coinBiasMode !== "weighted"}
                      />
                      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                        ×
                      </span>
                    </div>
                    <span className="w-16 shrink-0 text-right text-sm font-bold tabular-nums text-slate-500 dark:text-slate-400">
                      {(coinOdds[face.id] || 0).toFixed(1)}%
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFace(face.id)}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-300"
                      aria-label={`Remove ${face.label}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <Segmented
                label="Coin fairness"
                value={settings.coinBiasMode}
                onChange={(value) => {
                  setSettings((current) => ({ ...current, coinBiasMode: value }));
                  setCoinResults([]);
                }}
                options={[
                  { value: "fair", label: "Fair (equal)" },
                  { value: "weighted", label: "Weighted" },
                ]}
                columns={2}
                tone="amber"
              />
            </div>
            {settings.coinBiasMode === "weighted" && (
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Weighted mode is active. A side with weight 2 is twice as likely as a side with weight 1.
              </p>
            )}
          </SectionCard>

          <SectionCard
            icon={Target}
            title="Demo setups"
            description="These presets only fill in configuration. No flip or roll is performed until you press the button."
            tone="violet"
          >
            <div className="grid gap-2 sm:grid-cols-3">
              {Object.entries(DEMO_SETUPS).map(([key, demo]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => applyDemo(key)}
                  className="flex flex-col items-start gap-1 rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-violet-300 hover:bg-violet-50/60 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-violet-700 dark:hover:bg-violet-950/30"
                >
                  <span className="inline-flex items-center gap-1.5 text-sm font-black text-slate-900 dark:text-white">
                    <Sparkles className="h-3.5 w-3.5 text-violet-500" />
                    {demo.label}
                  </span>
                  <span className="text-sm leading-snug text-slate-500 dark:text-slate-400">{demo.description}</span>
                </button>
              ))}
            </div>
          </SectionCard>
        </div>

        <div className="space-y-5">
          <SectionCard icon={Settings2} title="Rules & animation" description="Tune both the coin and the dice." tone="violet">
            <div className="space-y-4">
              <NumberStepper
                label="Coins per flip"
                value={settings.coinCount}
                min={1}
                max={20}
                onChange={(value) => setSettings((current) => ({ ...current, coinCount: value }))}
                suffix="coins"
              />
              <SliderRow
                label="Coin animation"
                value={settings.coinDuration}
                min={0.4}
                max={4}
                step={0.1}
                onChange={(value) => setSettings((current) => ({ ...current, coinDuration: value }))}
                format={(value) => `${value.toFixed(1)}s`}
                tone="amber"
              />

              <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-800/30">
                <span className={labelClass}>Dice preset</span>
                <div className="grid grid-cols-4 gap-1.5">
                  {DICE_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() =>
                        setSettings((current) => ({ ...current, diceSides: preset.sides, tab: "dice" }))
                      }
                      className={`rounded-lg border px-1.5 py-2 text-sm font-black transition ${
                        Number(settings.diceSides) === preset.sides
                          ? "border-amber-400 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                      aria-pressed={Number(settings.diceSides) === preset.sides}
                      title={preset.blurb}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Field label="Dice count">
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={settings.diceCount}
                      onChange={(event) =>
                        setSettings((current) => ({
                          ...current,
                          diceCount: Math.max(1, Math.min(20, Number(event.target.value) || 1)),
                        }))
                      }
                      className={fieldClass(false)}
                    />
                  </Field>
                  <Field label="Custom sides">
                    <input
                      type="number"
                      min="2"
                      max="1000"
                      value={settings.diceSides}
                      onChange={(event) =>
                        setSettings((current) => ({
                          ...current,
                          diceSides: Math.max(2, Math.min(1000, Number(event.target.value) || 2)),
                        }))
                      }
                      className={fieldClass(false)}
                    />
                  </Field>
                  <Field label="Flat modifier" className="col-span-2">
                    <input
                      type="number"
                      value={settings.diceModifier}
                      onChange={(event) =>
                        setSettings((current) => ({ ...current, diceModifier: Number(event.target.value) || 0 }))
                      }
                      className={fieldClass(false)}
                    />
                  </Field>
                </div>
                <div className="mt-3">
                  <Segmented
                    label="Roll mode"
                    value={settings.diceMode}
                    onChange={(value) => setSettings((current) => ({ ...current, diceMode: value }))}
                    options={[
                      { value: "normal", label: "Normal" },
                      { value: "advantage", label: "Advantage" },
                      { value: "disadvantage", label: "Disadv." },
                    ]}
                    columns={3}
                    tone="violet"
                  />
                </div>
              </div>

              <SliderRow
                label="Dice animation"
                value={settings.diceDuration}
                min={0.3}
                max={3}
                step={0.1}
                onChange={(value) => setSettings((current) => ({ ...current, diceDuration: value }))}
                format={(value) => `${value.toFixed(1)}s`}
                tone="amber"
              />
              <ToggleRow
                checked={settings.sound}
                onChange={(value) => setSettings((current) => ({ ...current, sound: value }))}
                label="Sound effects"
                description="Locally synthesised ticks and a landing chime. No audio files are downloaded."
                tone="violet"
              />
              <ActionButton
                icon={RotateCcw}
                onClick={() => {
                  setSettings(DEFAULT_COIN_DICE_SETTINGS);
                  toast.success("Rules reset to defaults.");
                }}
              >
                Reset rules
              </ActionButton>
            </div>
          </SectionCard>

          <SectionCard
            icon={History}
            title="Session history"
            description="Every flip and roll is logged locally with its timestamp."
            tone="emerald"
            actions={
              <>
                <ActionButton icon={Download} onClick={exportHistory} disabled={!history.length}>
                  CSV
                </ActionButton>
                <ActionButton
                  variant="ghost"
                  icon={Trash2}
                  onClick={() => {
                    setHistory([]);
                    toast.success("History cleared.");
                  }}
                  disabled={!history.length}
                >
                  Clear
                </ActionButton>
              </>
            }
          >
            <div className="grid grid-cols-2 gap-2">
              <Stat label="Coin flips" value={stats.flips} tone="amber" />
              <Stat label="Dice rolls" value={stats.rolls} tone="violet" />
              <Stat label="Top coin side" value={stats.topFace} tone="emerald" />
              <Stat label="Best roll" value={stats.best} tone="emerald" />
            </div>

            {settings.showDistribution && distribution.length > 0 && (
              <div className="mt-3 space-y-1.5">
                {distribution.slice(0, 5).map((row) => (
                  <div key={row.label} className="flex items-center gap-2">
                    <span className="w-20 truncate text-sm font-semibold text-slate-600 dark:text-slate-300">
                      {row.label}
                    </span>
                    <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <span
                        className="block h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
                        style={{ width: `${Math.max(6, row.percent)}%` }}
                      />
                    </span>
                    <span className="w-10 shrink-0 text-right text-sm font-bold tabular-nums text-slate-500 dark:text-slate-400">
                      {row.count}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-3 max-h-56 space-y-1.5 overflow-y-auto pr-1">
              {recent.length === 0 ? (
                <p className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  No flips or rolls yet. Results will appear here.
                </p>
              ) : (
                recent.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800/40"
                  >
                    <span className="flex items-center gap-2 truncate font-bold text-slate-800 dark:text-slate-100">
                      {item.mode === "coin" ? (
                        <Coins className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                      ) : (
                        <Dices className="h-3.5 w-3.5 shrink-0 text-violet-500" />
                      )}
                      <span className="truncate">
                        {item.results.join(" · ")}
                        {item.total !== null && item.total !== undefined && ` = ${item.total}`}
                      </span>
                    </span>
                    <span className="shrink-0 font-mono text-sm text-slate-500 dark:text-slate-400">
                      {new Date(item.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </SectionCard>

          <SectionCard icon={Download} title="Save & transfer" description="Export the configuration or import it on another device." tone="sky">
            <div className="flex flex-wrap gap-2">
              <ActionButton icon={Download} onClick={exportConfig}>
                Export JSON
              </ActionButton>
              <ActionButton icon={Download} onClick={() => importRef.current?.click()}>
                Import JSON
              </ActionButton>
              <input
                ref={importRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={importConfig}
              />
            </div>
            <p className="mt-3 flex items-start gap-1.5 text-sm text-slate-500 dark:text-slate-400">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              The export contains your coin faces and rules only — never a fabricated result or personal data.
            </p>
          </SectionCard>

          <Callout tone="emerald" variant="success" title="Provably fair draws">
            <span className="inline-flex items-start gap-1.5">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Outcomes use <code>crypto.getRandomValues</code>. Neither the coin nor the dice contact a server, and
              history can be exported or wiped at any time.
            </span>
          </Callout>

          <Callout tone="amber" variant="info" title="Quick tip">
            Press the flip or roll button repeatedly to build a distribution. With enough throws the history bars
            approach the theoretical odds shown next to each coin side.
          </Callout>
        </div>
      </div>

      <FaqAccordion items={COIN_DICE_FAQS} tone="amber" />
    </div>
  );
}
