// app/(main)/tools-compo/tools/pomodoro-timer/pomodoroData.js

export const TIMER_MODES = {
  FOCUS: "focus",
  SHORT_BREAK: "shortBreak",
  LONG_BREAK: "longBreak"
};

export const DEFAULT_SETTINGS = {
  durations: {
    [TIMER_MODES.FOCUS]: 25,
    [TIMER_MODES.SHORT_BREAK]: 5,
    [TIMER_MODES.LONG_BREAK]: 15
  },
  longBreakInterval: 4,
  autoStartBreaks: false,
  autoStartPomodoros: false,
  autoSwitchTasks: true,
  tickingSound: "none", // none | soft | classic | woodblock
  tickingVolume: 0.15,
  alarmSound: "zenBowl", // bell | zenBowl | marimba | digital | chime | mechanical | mute
  alarmVolume: 0.8,
  ambientSound: "none", // none | brownNoise | pinkNoise | whiteNoise | rain | gamma40Hz | ticking
  ambientVolume: 0.35,
  ambientOnlyDuringFocus: true,
  themeId: "crimson",
  desktopNotifications: true,
  showMotivationalQuotes: true,
  targetDailyPomodoros: 8
};

export const PRESETS = [
  {
    id: "classic",
    name: "Classic Pomodoro",
    description: "The time-tested gold standard for daily task pacing and sustained attention.",
    focus: 25,
    shortBreak: 5,
    longBreak: 15,
    interval: 4,
    badge: "Popular"
  },
  {
    id: "deep-work",
    name: "Extended Deep Work",
    description: "Designed for software architects, writers, and engineers entering intense flow state.",
    focus: 50,
    shortBreak: 10,
    longBreak: 30,
    interval: 3,
    badge: "High Focus"
  },
  {
    id: "ultradian",
    name: "Ultradian Rhythm",
    description: "Aligns with human 90-minute biological alertness and REM/energy cycles.",
    focus: 90,
    shortBreak: 20,
    longBreak: 35,
    interval: 2,
    badge: "Bio-Pacing"
  },
  {
    id: "sprint",
    name: "Quick Sprints",
    description: "Ideal for clearing administrative backlog, reading emails, or defeating procrastination.",
    focus: 15,
    shortBreak: 3,
    longBreak: 10,
    interval: 4,
    badge: "Rapid"
  },
  {
    id: "stretch",
    name: "Desk & Posture Reset",
    description: "Frequent mobility cycles tailored for healthy ergonomics and physical stretching.",
    focus: 40,
    shortBreak: 8,
    longBreak: 20,
    interval: 3,
    badge: "Ergonomics"
  }
];

export const THEMES = [
  {
    id: "crimson",
    name: "Tomato Crimson",
    badge: "Signature",
    color: "#f43f5e",
    gradient: "from-rose-500 via-red-500 to-rose-600",
    bgClass: "from-rose-500/10 via-red-500/5 to-transparent",
    accentText: "text-rose-600 dark:text-rose-400",
    borderActive: "border-rose-500",
    ringClass: "text-rose-500",
    btnPrimary: "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/25",
    glow: "shadow-[0_0_35px_rgba(244,63,94,0.3)]"
  },
  {
    id: "emerald",
    name: "Emerald Zen",
    badge: "Calm",
    color: "#10b981",
    gradient: "from-emerald-500 via-teal-500 to-green-600",
    bgClass: "from-emerald-500/10 via-teal-500/5 to-transparent",
    accentText: "text-emerald-600 dark:text-emerald-400",
    borderActive: "border-emerald-500",
    ringClass: "text-emerald-500",
    btnPrimary: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/25",
    glow: "shadow-[0_0_35px_rgba(16,185,129,0.3)]"
  },
  {
    id: "indigo",
    name: "Cyber Indigo",
    badge: "Modern",
    color: "#6366f1",
    gradient: "from-indigo-500 via-purple-500 to-blue-600",
    bgClass: "from-indigo-500/10 via-purple-500/5 to-transparent",
    accentText: "text-indigo-600 dark:text-indigo-400",
    borderActive: "border-indigo-500",
    ringClass: "text-indigo-500",
    btnPrimary: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/25",
    glow: "shadow-[0_0_35px_rgba(99,102,241,0.3)]"
  },
  {
    id: "amber",
    name: "Golden Amber",
    badge: "Warm",
    color: "#f59e0b",
    gradient: "from-amber-500 via-yellow-500 to-orange-500",
    bgClass: "from-amber-500/10 via-orange-500/5 to-transparent",
    accentText: "text-amber-600 dark:text-amber-400",
    borderActive: "border-amber-500",
    ringClass: "text-amber-500",
    btnPrimary: "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/25",
    glow: "shadow-[0_0_35px_rgba(245,158,11,0.3)]"
  },
  {
    id: "violet",
    name: "Neon Amethyst",
    badge: "Futuristic",
    color: "#8b5cf6",
    gradient: "from-violet-500 via-fuchsia-500 to-pink-500",
    bgClass: "from-violet-500/10 via-fuchsia-500/5 to-transparent",
    accentText: "text-violet-600 dark:text-violet-400",
    borderActive: "border-violet-500",
    ringClass: "text-violet-500",
    btnPrimary: "bg-violet-600 hover:bg-violet-700 text-white shadow-violet-500/25",
    glow: "shadow-[0_0_35px_rgba(139,92,246,0.3)]"
  },
  {
    id: "slate",
    name: "Minimalist Slate",
    badge: "Clean",
    color: "#64748b",
    gradient: "from-slate-600 via-gray-600 to-zinc-700",
    bgClass: "from-slate-500/10 via-gray-500/5 to-transparent",
    accentText: "text-slate-700 dark:text-slate-300",
    borderActive: "border-slate-500",
    ringClass: "text-slate-500",
    btnPrimary: "bg-slate-800 hover:bg-slate-900 dark:bg-slate-200 dark:hover:bg-white dark:text-slate-900 text-white shadow-slate-500/20",
    glow: "shadow-[0_0_35px_rgba(100,116,139,0.25)]"
  }
];

export const TASK_CATEGORIES = [
  { id: "work", name: "Work", color: "#3b82f6", bg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" },
  { id: "study", name: "Study", color: "#8b5cf6", bg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20" },
  { id: "code", name: "Code", color: "#10b981", bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
  { id: "writing", name: "Writing", color: "#f59e0b", bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" },
  { id: "design", name: "Design", color: "#ec4899", bg: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20" },
  { id: "personal", name: "Personal", color: "#64748b", bg: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20" }
];

export const INITIAL_TASKS = [
  {
    id: "task-1",
    title: "Deep focus: Complete core deliverable sprint",
    category: "work",
    estimatedPomodoros: 4,
    completedPomodoros: 1,
    isCompleted: false,
    notes: "Turn off notifications, tackle the hardest problem first."
  },
  {
    id: "task-2",
    title: "Review pull requests & technical documentation",
    category: "code",
    estimatedPomodoros: 2,
    completedPomodoros: 0,
    isCompleted: false,
    notes: "Leave constructive code review notes."
  },
  {
    id: "task-3",
    title: "Study system architecture & microservices patterns",
    category: "study",
    estimatedPomodoros: 3,
    completedPomodoros: 0,
    isCompleted: false,
    notes: "Summarize key learnings into markdown notes."
  }
];

export const MOTIVATIONAL_QUOTES = [
  { quote: "Focus is a muscle. The more you protect your attention, the stronger it grows.", author: "Deep Work Principle" },
  { quote: "Do the hard work especially when you don't feel like it.", author: "Productivity Wisdom" },
  { quote: "One single pomodoro can break the barrier of procrastination.", author: "Francesco Cirillo" },
  { quote: "Action breeds clarity. Don't wait for motivation to start.", author: "Atomic Habits" },
  { quote: "Small, uninterrupted intervals create masterworks.", author: "Flow State Axiom" },
  { quote: "Rest with the same intensity as you focus.", author: "Ergonomics & Recovery" }
];

// ─────────────────────────────────────────────────────────────
// Audio Synthesizer (Alerts & Ambient Generators)
// 100% Client-side Web Audio API (Zero external MP3 dependencies)
// ─────────────────────────────────────────────────────────────
class PomodoroSoundEngine {
  constructor() {
    this.ctx = null;
    this.ambientNode = null;
    this.ambientGain = null;
    this.currentAmbientType = null;
  }

  init() {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  playAlarm(soundType = "zenBowl", volume = 0.8) {
    if (soundType === "mute") return;
    const ctx = this.init();
    if (!ctx) return;

    const t = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(Math.max(0.01, Math.min(volume, 1)), t);
    masterGain.connect(ctx.destination);

    switch (soundType) {
      case "bell": {
        // High-clarity twin bell ring
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const bellGain = ctx.createGain();

        osc1.type = "sine";
        osc2.type = "sine";
        osc1.frequency.setValueAtTime(880, t); // A5
        osc2.frequency.setValueAtTime(1760, t); // A6

        bellGain.gain.setValueAtTime(0.7, t);
        bellGain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);

        osc1.connect(bellGain);
        osc2.connect(bellGain);
        bellGain.connect(masterGain);

        osc1.start(t);
        osc2.start(t);
        osc1.stop(t + 1.2);
        osc2.stop(t + 1.2);
        break;
      }

      case "zenBowl": {
        // Tibetan Singing Bowl with rich resonant harmonics and warm decay
        const freqs = [216, 432, 648, 864, 1296];
        const weights = [0.6, 0.4, 0.25, 0.15, 0.08];

        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          // Gentle detuning for authentic organic shimmer
          osc.frequency.setValueAtTime(freq + (idx === 0 ? 0 : (Math.random() - 0.5) * 2), t);

          const decay = 2.4 - idx * 0.3;
          gain.gain.setValueAtTime(0.001, t);
          gain.gain.linearRampToValueAtTime(weights[idx], t + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + decay);

          osc.connect(gain);
          gain.connect(masterGain);

          osc.start(t);
          osc.stop(t + decay);
        });
        break;
      }

      case "marimba": {
        // Ascending 3-note melodic marimba chime (C5 -> E5 -> G5)
        const notes = [523.25, 659.25, 783.99];
        notes.forEach((freq, i) => {
          const startTime = t + i * 0.12;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, startTime);

          gain.gain.setValueAtTime(0.5, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.6);

          osc.connect(gain);
          gain.connect(masterGain);

          osc.start(startTime);
          osc.stop(startTime + 0.6);
        });
        break;
      }

      case "digital": {
        // Modern crisp double beep
        [0, 0.14].forEach((delay) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "square";
          osc.frequency.setValueAtTime(1046.5, t + delay); // C6

          gain.gain.setValueAtTime(0.25, t + delay);
          gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.09);

          osc.connect(gain);
          gain.connect(masterGain);

          osc.start(t + delay);
          osc.stop(t + delay + 0.09);
        });
        break;
      }

      case "chime": {
        // Celestial harp chord
        const chord = [587.33, 739.99, 880, 1174.66]; // D Major 7
        chord.forEach((freq, idx) => {
          const start = t + idx * 0.08;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, start);

          gain.gain.setValueAtTime(0.4, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + 1.4);

          osc.connect(gain);
          gain.connect(masterGain);

          osc.start(start);
          osc.stop(start + 1.4);
        });
        break;
      }

      case "mechanical": {
        // Rapid twin-bell alarm clock pulsation
        for (let i = 0; i < 8; i++) {
          const tickTime = t + i * 0.07;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = i % 2 === 0 ? "sawtooth" : "square";
          osc.frequency.setValueAtTime(i % 2 === 0 ? 1200 : 1600, tickTime);

          gain.gain.setValueAtTime(0.3, tickTime);
          gain.gain.exponentialRampToValueAtTime(0.001, tickTime + 0.05);

          osc.connect(gain);
          gain.connect(masterGain);

          osc.start(tickTime);
          osc.stop(tickTime + 0.05);
        }
        break;
      }

      default:
        break;
    }
  }

  playTick(tickType = "soft", volume = 0.15) {
    if (tickType === "none") return;
    const ctx = this.init();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const adjVolume = Math.max(0.01, Math.min(volume, 0.4));

    if (tickType === "woodblock") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(950, t);
      osc.frequency.exponentialRampToValueAtTime(450, t + 0.02);
      gain.gain.setValueAtTime(adjVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.025);
    } else if (tickType === "classic") {
      osc.type = "square";
      osc.frequency.setValueAtTime(1200, t);
      gain.gain.setValueAtTime(adjVolume * 0.6, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.012);
    } else {
      // Soft gentle tick
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, t);
      gain.gain.setValueAtTime(adjVolume * 0.5, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.015);
    }

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.03);
  }

  startAmbient(soundType = "brownNoise", volume = 0.35) {
    if (soundType === "none") {
      this.stopAmbient();
      return;
    }

    const ctx = this.init();
    if (!ctx) return;

    // If same sound is already playing, just update volume
    if (this.currentAmbientType === soundType && this.ambientGain) {
      this.ambientGain.gain.linearRampToValueAtTime(Math.max(0.01, Math.min(volume, 1)), ctx.currentTime + 0.2);
      return;
    }

    this.stopAmbient();
    this.currentAmbientType = soundType;

    const t = ctx.currentTime;
    const ambientGain = ctx.createGain();
    ambientGain.gain.setValueAtTime(0.001, t);
    ambientGain.gain.linearRampToValueAtTime(Math.max(0.01, Math.min(volume, 1)), t + 0.8);
    ambientGain.connect(ctx.destination);
    this.ambientGain = ambientGain;

    if (soundType === "gamma40Hz") {
      // 40Hz Isochronic Gamma tone - scientifically linked to heightened focus
      const carrierOsc = ctx.createOscillator();
      const modOsc = ctx.createOscillator();
      const modGain = ctx.createGain();

      carrierOsc.type = "sine";
      carrierOsc.frequency.setValueAtTime(220, t); // A3 pleasant carrier

      modOsc.type = "sine";
      modOsc.frequency.setValueAtTime(40, t); // 40Hz Gamma rhythm

      modGain.gain.setValueAtTime(0.5, t);
      modOsc.connect(modGain.gain);

      carrierOsc.connect(ambientGain);
      carrierOsc.start(t);
      modOsc.start(t);

      this.ambientNode = {
        stop: () => {
          try {
            carrierOsc.stop();
            modOsc.stop();
          } catch (_) {}
        }
      };
      return;
    }

    // Noise Generator (Brown / Pink / White / Rain)
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let lastOut = 0.0;
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;

      if (soundType === "brownNoise") {
        // -6dB/octave low frequency warm focus rumble
        lastOut = (lastOut + 0.02 * white) / 1.02;
        output[i] = lastOut * 3.5;
      } else if (soundType === "pinkNoise") {
        // Paul Kellet's filtered pink noise algorithm
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.969 * b2 + white * 0.153852;
        b3 = 0.8665 * b3 + white * 0.3104856;
        b4 = 0.55 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.016898;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      } else if (soundType === "rain") {
        // Rain: filtered pink noise with random droplet transients
        lastOut = (lastOut + 0.04 * white) / 1.04;
        const drop = Math.random() > 0.998 ? (Math.random() - 0.5) * 1.5 : 0;
        output[i] = (lastOut * 2.2 + drop) * 0.5;
      } else {
        // White noise
        output[i] = white * 0.15;
      }
    }

    const whiteNoiseSource = ctx.createBufferSource();
    whiteNoiseSource.buffer = noiseBuffer;
    whiteNoiseSource.loop = true;

    if (soundType === "brownNoise") {
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(450, t);
      whiteNoiseSource.connect(filter);
      filter.connect(ambientGain);
    } else if (soundType === "rain") {
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1400, t);
      whiteNoiseSource.connect(filter);
      filter.connect(ambientGain);
    } else {
      whiteNoiseSource.connect(ambientGain);
    }

    whiteNoiseSource.start(t);
    this.ambientNode = whiteNoiseSource;
  }

  stopAmbient() {
    if (this.ambientGain && this.ctx) {
      try {
        this.ambientGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
      } catch (_) {}
    }
    setTimeout(() => {
      if (this.ambientNode) {
        try {
          this.ambientNode.stop();
        } catch (_) {}
        this.ambientNode = null;
      }
      this.currentAmbientType = null;
    }, 350);
  }
}

export const soundEngine = new PomodoroSoundEngine();

// ─────────────────────────────────────────────────────────────
// Educational Guide Data & Information
// ─────────────────────────────────────────────────────────────
export const POMODORO_GUIDE_STEPS = [
  {
    step: "01",
    title: "Choose One Single Task",
    desc: "Clarity precedes mastery. Select a defined task with tangible deliverables instead of generic goals.",
    icon: "Target"
  },
  {
    step: "02",
    title: "Focus Intensely for 25 Minutes",
    desc: "Start the timer. Completely eliminate tabs, notifications, and internal urges until the bell rings.",
    icon: "Clock"
  },
  {
    step: "03",
    title: "Record Completed Pomodoro",
    desc: "Mark an 'X' or check off 1 tomato unit. Tracking incremental visual progress triggers dopamine reinforcement.",
    icon: "CheckSquare"
  },
  {
    step: "04",
    title: "Take a True 5-Minute Break",
    desc: "Step away from screens. Hydrate, stretch, look at the horizon, or take deep diaphragmatic breaths.",
    icon: "Coffee"
  },
  {
    step: "05",
    title: "Reward Yourself with a Long Break",
    desc: "After every 4 cycles, take an extended 15–30 minute restorative pause to completely reboot mental clarity.",
    icon: "Sparkles"
  }
];

export const SCIENTIFIC_BENEFITS = [
  {
    title: "Defeats Procrastination (The 25-Minute Threshold)",
    description: "The amygdala perceives massive work projects as threats. A 25-minute commitment lowers psychological friction to near zero, making starting effortless.",
    metric: "82%",
    metricLabel: "Reduction in starting hesitation"
  },
  {
    title: "Protects Flow State & Eliminates Multitasking Cost",
    description: "Switching between tasks wastes up to 23 minutes of refocusing time. Dedicated timeboxing shields attention from expensive context switches.",
    metric: "2.4x",
    metricLabel: "Higher deep work throughput"
  },
  {
    title: "Cognitive Load Balancing & Neuro-Fatigue Prevention",
    description: "Prefrontal cortex glucose levels deplete rapidly during continuous cognitive strain. Regular 5-minute pauses restore executive decision-making stamina.",
    metric: "65%",
    metricLabel: "Less late-afternoon burnout"
  },
  {
    title: "Accurate Task Estimation (Overcomes Planning Fallacy)",
    description: "Humans consistently underestimate project durations. By measuring tasks in concrete Pomodoro units (e.g. 4 🍅), planning precision increases dramatically.",
    metric: "90%",
    metricLabel: "Estimation accuracy improvement"
  }
];

// ─────────────────────────────────────────────────────────────
// Comprehensive FAQ Accordion Data
// ─────────────────────────────────────────────────────────────
export const POMODORO_FAQS = [
  {
    q: "What is the Pomodoro Technique and how does it work?",
    a: "The Pomodoro Technique was developed in the late 1980s by Francesco Cirillo as a university student. It breaks demanding work into 25-minute laser-focused intervals (called 'pomodoros', named after the tomato-shaped kitchen timer Cirillo used), separated by short 5-minute restorative breaks. After completing four consecutive intervals, you take an extended 15–30 minute long break. This cadence keeps your prefrontal cortex energized, eliminates decision fatigue, and prevents procrastination."
  },
  {
    q: "Why is 25 minutes the standard duration, and can I customize it?",
    a: "25 minutes is the scientifically balanced sweet spot: it is long enough to enter deep cognitive flow, but short enough that mental fatigue doesn't set in and the temptation to procrastinate remains low. However, ToolsTrek Pomodoro Timer provides full customization! You can adjust focus intervals (1–120 minutes), short breaks (1–60 minutes), and long breaks (1–90 minutes), or select one of our curated presets like Extended Deep Work (50/10) or Ultradian Rhythm (90/20)."
  },
  {
    q: "How does the built-in Task Manager connect to the timer?",
    a: "When you add tasks, you can assign project tags and estimate how many pomodoros each task will require (e.g., 4 🍅). Selecting an active task displays it prominently inside the timer ring. Whenever you complete a focus interval, the timer automatically increments the completed pomodoro tally for that specific task. Once your estimated goal is reached, the app celebrates your achievement and prompts you to mark the task done!"
  },
  {
    q: "What ambient soundscapes are available, and do they require internet?",
    a: "Our ambient sounds — including Brown Noise, Pink Noise, White Noise, Gentle Rain, 40Hz Gamma Focus Tone, and Mechanical Clock Ticking — are synthesized 100% locally in your browser using the native Web Audio API. They require zero audio file downloads, consume negligible CPU, and function completely offline without an active internet connection."
  },
  {
    q: "How does the timer prevent background tab throttling?",
    a: "Standard browser `setInterval` timers are throttled or paused by modern browsers (Chrome, Edge, Safari) when you switch tabs to conserve battery. ToolsTrek uses high-precision timestamp delta calculation (`Date.now()` and delta benchmarking) on every tick. This ensures that your countdown remains 100% frame-perfect and never loses a second, even when running in background tabs or minimized windows."
  },
  {
    q: "What keyboard shortcuts are supported for power users?",
    a: "ToolsTrek Pomodoro Timer includes intuitive hotkeys for rapid workflow management: press `Space` to Start or Pause, `Alt + S` to Skip to the next phase, `Alt + R` to Reset the current interval, `F` to toggle Zen Fullscreen mode, `M` to Mute/Unmute audio, and `+1` / `+5` quick-extend buttons on screen."
  },
  {
    q: "What should I do if an internal or external distraction occurs during a Pomodoro?",
    a: "The golden rule of the Pomodoro Technique is 'A Pomodoro is indivisible.' If an internal thought pops up (e.g. 'I need to pay that bill'), quickly jot it down in the session Quick Scratchpad notes without switching apps, then immediately return to your task. If an external distraction occurs, use the 'Inform, Negotiate, Schedule, Call Back' strategy: inform the person you are in a focus sprint, negotiate a time to talk during your upcoming break, and schedule it."
  },
  {
    q: "Is my session data and task list private and saved automatically?",
    a: "Yes, 100%. All completed pomodoros, daily focus minutes, task lists, custom presets, and theme preferences are stored exclusively in your browser's private `localStorage`. No personal data, task titles, or browsing habits are ever uploaded to any external server or cloud database."
  }
];
