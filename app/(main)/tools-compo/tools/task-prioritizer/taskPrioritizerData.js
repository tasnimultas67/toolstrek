// app/(main)/tools-compo/tools/task-prioritizer/taskPrioritizerData.js

export const FRAMEWORKS = {
  EISENHOWER: "eisenhower",
  ACTION_PRIORITY: "action_priority",
  MOSCOW: "moscow"
};

export const FRAMEWORK_CONFIGS = {
  [FRAMEWORKS.EISENHOWER]: {
    id: FRAMEWORKS.EISENHOWER,
    name: "Eisenhower Matrix",
    tagline: "Urgency vs. Importance (The Classic 2×2 Decision Matrix)",
    description:
      "Sort tasks by urgency and importance into four decisive quadrants: Do First, Schedule, Delegate, or Eliminate. Eliminates firefighting and protects high-leverage focus.",
    xAxis: { left: "URGENT", right: "NOT URGENT" },
    yAxis: { top: "IMPORTANT", bottom: "NOT IMPORTANT" },
    quadrants: [
      {
        id: "q1",
        code: "Q1",
        name: "Do First",
        subtitle: "Urgent & Important",
        action: "Do Immediately",
        guidance: "Crises, impending deadlines, production bugs, and critical blockers that require swift, focused action.",
        colorName: "rose",
        colorHex: "#f43f5e",
        badgeBg: "bg-rose-500",
        lightBg: "bg-rose-50/70 dark:bg-rose-950/25",
        lightBorder: "border-rose-200/80 dark:border-rose-900/40",
        headerBg: "bg-rose-100/70 dark:bg-rose-900/30",
        accentText: "text-rose-600 dark:text-rose-400",
        ringColor: "ring-rose-500/20"
      },
      {
        id: "q2",
        code: "Q2",
        name: "Schedule",
        subtitle: "Not Urgent & Important",
        action: "Plan & Timebox",
        guidance: "Strategic planning, deep work, skill development, relationships, and preventive measures that yield exponential long-term return.",
        colorName: "indigo",
        colorHex: "#6366f1",
        badgeBg: "bg-indigo-500",
        lightBg: "bg-indigo-50/70 dark:bg-indigo-950/25",
        lightBorder: "border-indigo-200/80 dark:border-indigo-900/40",
        headerBg: "bg-indigo-100/70 dark:bg-indigo-900/30",
        accentText: "text-indigo-600 dark:text-indigo-400",
        ringColor: "ring-indigo-500/20"
      },
      {
        id: "q3",
        code: "Q3",
        name: "Delegate",
        subtitle: "Urgent & Not Important",
        action: "Hand Off or Batch",
        guidance: "Unscheduled interruptions, standard inquiries, routine administrative tasks, and requests that do not require your core expertise.",
        colorName: "amber",
        colorHex: "#f59e0b",
        badgeBg: "bg-amber-500",
        lightBg: "bg-amber-50/70 dark:bg-amber-950/25",
        lightBorder: "border-amber-200/80 dark:border-amber-900/40",
        headerBg: "bg-amber-100/70 dark:bg-amber-900/30",
        accentText: "text-amber-600 dark:text-amber-400",
        ringColor: "ring-amber-500/20"
      },
      {
        id: "q4",
        code: "Q4",
        name: "Eliminate",
        subtitle: "Not Urgent & Not Important",
        action: "Delete or Automate",
        guidance: "Low-value distractions, aimless web browsing, redundant status updates, and busywork that masquerades as productive activity.",
        colorName: "emerald",
        colorHex: "#10b981",
        badgeBg: "bg-emerald-500",
        lightBg: "bg-emerald-50/70 dark:bg-emerald-950/25",
        lightBorder: "border-emerald-200/80 dark:border-emerald-900/40",
        headerBg: "bg-emerald-100/70 dark:bg-emerald-900/30",
        accentText: "text-emerald-600 dark:text-emerald-400",
        ringColor: "ring-emerald-500/20"
      }
    ]
  },
  [FRAMEWORKS.ACTION_PRIORITY]: {
    id: FRAMEWORKS.ACTION_PRIORITY,
    name: "Action Priority Matrix",
    tagline: "Impact vs. Effort (Maximum ROI Task Pacing)",
    description:
      "Assess tasks by their business impact against the effort required to complete them. Maximize quick wins while strategically budgeting major projects.",
    xAxis: { left: "LOW EFFORT", right: "HIGH EFFORT" },
    yAxis: { top: "HIGH IMPACT", bottom: "LOW IMPACT" },
    quadrants: [
      {
        id: "q1",
        code: "P1",
        name: "Quick Wins",
        subtitle: "High Impact + Low Effort",
        action: "Execute Now",
        guidance: "High return with minimal resource investment. Deliver immediate satisfaction and momentum.",
        colorName: "emerald",
        colorHex: "#10b981",
        badgeBg: "bg-emerald-500",
        lightBg: "bg-emerald-50/70 dark:bg-emerald-950/25",
        lightBorder: "border-emerald-200/80 dark:border-emerald-900/40",
        headerBg: "bg-emerald-100/70 dark:bg-emerald-900/30",
        accentText: "text-emerald-600 dark:text-emerald-400",
        ringColor: "ring-emerald-500/20"
      },
      {
        id: "q2",
        code: "P2",
        name: "Major Projects",
        subtitle: "High Impact + High Effort",
        action: "Plan & Schedule",
        guidance: "Transformational work with substantial rewards, but demanding careful roadmap scheduling and milestone tracking.",
        colorName: "indigo",
        colorHex: "#6366f1",
        badgeBg: "bg-indigo-500",
        lightBg: "bg-indigo-50/70 dark:bg-indigo-950/25",
        lightBorder: "border-indigo-200/80 dark:border-indigo-900/40",
        headerBg: "bg-indigo-100/70 dark:bg-indigo-900/30",
        accentText: "text-indigo-600 dark:text-indigo-400",
        ringColor: "ring-indigo-500/20"
      },
      {
        id: "q3",
        code: "P3",
        name: "Fill-Ins",
        subtitle: "Low Impact + Low Effort",
        action: "Batch in Downtime",
        guidance: "Small low-stakes chores and paperwork that can be quickly batched between intense focus blocks.",
        colorName: "amber",
        colorHex: "#f59e0b",
        badgeBg: "bg-amber-500",
        lightBg: "bg-amber-50/70 dark:bg-amber-950/25",
        lightBorder: "border-amber-200/80 dark:border-amber-900/40",
        headerBg: "bg-amber-100/70 dark:bg-amber-900/30",
        accentText: "text-amber-600 dark:text-amber-400",
        ringColor: "ring-amber-500/20"
      },
      {
        id: "q4",
        code: "P4",
        name: "Thankless Tasks",
        subtitle: "Low Impact + High Effort",
        action: "Drop or Automate",
        guidance: "Energy sinks that drain cognitive capacity without moving core metrics. Eliminate whenever possible.",
        colorName: "rose",
        colorHex: "#f43f5e",
        badgeBg: "bg-rose-500",
        lightBg: "bg-rose-50/70 dark:bg-rose-950/25",
        lightBorder: "border-rose-200/80 dark:border-rose-900/40",
        headerBg: "bg-rose-100/70 dark:bg-rose-900/30",
        accentText: "text-rose-600 dark:text-rose-400",
        ringColor: "ring-rose-500/20"
      }
    ]
  },
  [FRAMEWORKS.MOSCOW]: {
    id: FRAMEWORKS.MOSCOW,
    name: "MoSCoW Matrix",
    tagline: "Agile Feature & Sprint Prioritization",
    description:
      "Categorize product requirements, project scopes, or client deliverables into Must Have, Should Have, Could Have, and Won't Have.",
    xAxis: { left: "CRITICAL", right: "OPTIONAL" },
    yAxis: { top: "IN SCOPE", bottom: "OUT OF SCOPE" },
    quadrants: [
      {
        id: "q1",
        code: "M",
        name: "Must Have",
        subtitle: "Critical Deliverables",
        action: "Non-negotiable",
        guidance: "Essential requirements without which the launch, sprint, or project is considered a total failure.",
        colorName: "rose",
        colorHex: "#f43f5e",
        badgeBg: "bg-rose-500",
        lightBg: "bg-rose-50/70 dark:bg-rose-950/25",
        lightBorder: "border-rose-200/80 dark:border-rose-900/40",
        headerBg: "bg-rose-100/70 dark:bg-rose-900/30",
        accentText: "text-rose-600 dark:text-rose-400",
        ringColor: "ring-rose-500/20"
      },
      {
        id: "q2",
        code: "S",
        name: "Should Have",
        subtitle: "High Priority Needs",
        action: "Important but Not Fatal",
        guidance: "Vital features that significantly improve quality of life and user satisfaction, but workarounds exist.",
        colorName: "indigo",
        colorHex: "#6366f1",
        badgeBg: "bg-indigo-500",
        lightBg: "bg-indigo-50/70 dark:bg-indigo-950/25",
        lightBorder: "border-indigo-200/80 dark:border-indigo-900/40",
        headerBg: "bg-indigo-100/70 dark:bg-indigo-900/30",
        accentText: "text-indigo-600 dark:text-indigo-400",
        ringColor: "ring-indigo-500/20"
      },
      {
        id: "q3",
        code: "C",
        name: "Could Have",
        subtitle: "Nice-to-Have Features",
        action: "Include if Capacity Permits",
        guidance: "Delightful enhancements to implement only if primary scope is securely delivered on time.",
        colorName: "amber",
        colorHex: "#f59e0b",
        badgeBg: "bg-amber-500",
        lightBg: "bg-amber-50/70 dark:bg-amber-950/25",
        lightBorder: "border-amber-200/80 dark:border-amber-900/40",
        headerBg: "bg-amber-100/70 dark:bg-amber-900/30",
        accentText: "text-amber-600 dark:text-amber-400",
        ringColor: "ring-amber-500/20"
      },
      {
        id: "q4",
        code: "W",
        name: "Won't Have",
        subtitle: "Out of Scope for Now",
        action: "Backlog for Future",
        guidance: "Ideas consciously agreed to be excluded from this release cycle to protect focus and deadlines.",
        colorName: "emerald",
        colorHex: "#10b981",
        badgeBg: "bg-emerald-500",
        lightBg: "bg-emerald-50/70 dark:bg-emerald-950/25",
        lightBorder: "border-emerald-200/80 dark:border-emerald-900/40",
        headerBg: "bg-emerald-100/70 dark:bg-emerald-900/30",
        accentText: "text-emerald-600 dark:text-emerald-400",
        ringColor: "ring-emerald-500/20"
      }
    ]
  }
};

export const TASK_CATEGORIES = [
  { id: "work", name: "Work & Project", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
  { id: "personal", name: "Personal Life", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" },
  { id: "urgent", name: "Urgent Bug / Hotfix", color: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300" },
  { id: "strategy", name: "Strategy & Planning", color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300" },
  { id: "health", name: "Health & Fitness", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" },
  { id: "finance", name: "Finance & Bills", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" },
  { id: "learning", name: "Study & Learning", color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300" }
];

export const THEMES = [
  {
    id: "violet",
    name: "Electric Violet",
    badge: "Signature",
    primary: "#7c00fe",
    gradient: "from-purple-600 via-indigo-600 to-violet-700",
    borderActive: "border-purple-500",
    accentText: "text-purple-600 dark:text-purple-400"
  },
  {
    id: "emerald",
    name: "Emerald Zen",
    badge: "Balanced",
    primary: "#10b981",
    gradient: "from-emerald-600 via-teal-600 to-green-700",
    borderActive: "border-emerald-500",
    accentText: "text-emerald-600 dark:text-emerald-400"
  },
  {
    id: "amber",
    name: "Amber Sunset",
    badge: "Warm Focus",
    primary: "#f59e0b",
    gradient: "from-amber-500 via-orange-500 to-rose-600",
    borderActive: "border-amber-500",
    accentText: "text-amber-600 dark:text-amber-400"
  },
  {
    id: "cyan",
    name: "Cyber Ocean",
    badge: "Modern Tech",
    primary: "#06b6d4",
    gradient: "from-cyan-500 via-sky-600 to-blue-700",
    borderActive: "border-cyan-500",
    accentText: "text-cyan-600 dark:text-cyan-400"
  },
  {
    id: "crimson",
    name: "Crimson Urgency",
    badge: "High Energy",
    primary: "#f43f5e",
    gradient: "from-rose-500 via-red-600 to-rose-700",
    borderActive: "border-rose-500",
    accentText: "text-rose-600 dark:text-rose-400"
  },
  {
    id: "slate",
    name: "Nordic Minimal",
    badge: "Clean Grayscale",
    primary: "#64748b",
    gradient: "from-slate-600 via-gray-700 to-zinc-800",
    borderActive: "border-slate-500",
    accentText: "text-slate-600 dark:text-slate-300"
  }
];

export const PRESET_TEMPLATES = [
  {
    id: "executive",
    name: "Executive & Founder Daily Focus",
    description: "Battle-tested quadrant distribution balancing immediate fires with high-leverage company growth.",
    framework: FRAMEWORKS.EISENHOWER,
    tasks: [
      {
        id: "task-ex-1",
        title: "Resolve production server outage & restore customer checkout",
        quadrant: "q1",
        category: "urgent",
        dueDate: "today",
        estimatedPomodoros: 2,
        notes: "Cloud provider alert: 502 bad gateway on API cluster.",
        completed: false,
        subtasks: [
          { id: "st-1", text: "Check Kubernetes pod memory logs", completed: true },
          { id: "st-2", text: "Deploy hotfix patch to staging", completed: false }
        ]
      },
      {
        id: "task-ex-2",
        title: "Finalize Q4 strategic growth roadmap & pitch deck",
        quadrant: "q2",
        category: "strategy",
        dueDate: "in-3-days",
        estimatedPomodoros: 4,
        notes: "Schedule 90-minute deep work block with phone muted.",
        completed: false,
        subtasks: [
          { id: "st-3", text: "Review ARR targets with finance", completed: false },
          { id: "st-4", text: "Update product release milestones", completed: false }
        ]
      },
      {
        id: "task-ex-3",
        title: "Delegate vendor software renewal & contract vetting to operations",
        quadrant: "q3",
        category: "work",
        dueDate: "tomorrow",
        estimatedPomodoros: 1,
        notes: "Send brief to Sarah; she has signing authorization under $5k.",
        completed: false,
        subtasks: []
      },
      {
        id: "task-ex-4",
        title: "Unsubscribe from redundant newsletters & archive non-urgent email threads",
        quadrant: "q4",
        category: "personal",
        dueDate: "",
        estimatedPomodoros: 1,
        notes: "Eliminate low-value inbox noise that causes decision fatigue.",
        completed: true,
        subtasks: []
      }
    ]
  },
  {
    id: "software_sprint",
    name: "Software Engineering Sprint & Backlog",
    description: "Built for agile developers and engineering managers triaging bugs and architecture goals.",
    framework: FRAMEWORKS.EISENHOWER,
    tasks: [
      {
        id: "task-se-1",
        title: "P0: Fix SQL injection vulnerability in user authentication middleware",
        quadrant: "q1",
        category: "urgent",
        dueDate: "today",
        estimatedPomodoros: 3,
        notes: "Security report #4492 submitted via bug bounty.",
        completed: false,
        subtasks: [
          { id: "st-se-1", text: "Sanitize parameterized queries", completed: true },
          { id: "st-se-2", text: "Run automated security penetration tests", completed: false }
        ]
      },
      {
        id: "task-se-2",
        title: "Architect decoupled Redis cache layer for high-throughput queries",
        quadrant: "q2",
        category: "work",
        dueDate: "in-3-days",
        estimatedPomodoros: 5,
        notes: "Will reduce primary PostgreSQL DB latency by over 65%.",
        completed: false,
        subtasks: []
      },
      {
        id: "task-se-3",
        title: "Reassign Jira QA ticket triage & flaky end-to-end tests to test pod",
        quadrant: "q3",
        category: "work",
        dueDate: "tomorrow",
        estimatedPomodoros: 1,
        notes: "Empower junior QA leads to own the test stabilization sprint.",
        completed: false,
        subtasks: []
      },
      {
        id: "task-se-4",
        title: "Debate tabs vs spaces on internal Slack channels",
        quadrant: "q4",
        category: "work",
        dueDate: "",
        estimatedPomodoros: 0,
        notes: "Classic time-sink: Prettier already handles auto-formatting.",
        completed: true,
        subtasks: []
      }
    ]
  },
  {
    id: "student",
    name: "Student & Academic Exam Mastery",
    description: "Balance coursework deadlines, exam revision, and personal wellness.",
    framework: FRAMEWORKS.EISENHOWER,
    tasks: [
      {
        id: "task-st-1",
        title: "Submit 2,500-word Research Term Paper (Due Tonight 11:59 PM)",
        quadrant: "q1",
        category: "learning",
        dueDate: "today",
        estimatedPomodoros: 4,
        notes: "Ensure citations follow IEEE format and bibliography is verified.",
        completed: false,
        subtasks: [
          { id: "st-s-1", text: "Proofread chapter 3 conclusion", completed: true },
          { id: "st-s-2", text: "Run plagiarism checker", completed: false }
        ]
      },
      {
        id: "task-st-2",
        title: "Review calculus practice exams 3 weeks ahead of midterms",
        quadrant: "q2",
        category: "learning",
        dueDate: "in-3-days",
        estimatedPomodoros: 3,
        notes: "Spaced repetition study prevents panic cramming.",
        completed: false,
        subtasks: []
      },
      {
        id: "task-st-3",
        title: "Order grocery essentials & batch-cook healthy study meals",
        quadrant: "q3",
        category: "personal",
        dueDate: "tomorrow",
        estimatedPomodoros: 1,
        notes: "Ask roommate to split delivery order.",
        completed: false,
        subtasks: []
      },
      {
        id: "task-st-4",
        title: "Mindless TikTok & Instagram scrolling during study sessions",
        quadrant: "q4",
        category: "personal",
        dueDate: "",
        estimatedPomodoros: 0,
        notes: "Turn on browser site blockers and place phone in another room.",
        completed: true,
        subtasks: []
      }
    ]
  },
  {
    id: "freelancer",
    name: "Freelancer & Client Milestone Tracker",
    description: "Keep client expectations clear and protect time for high-value business acquisition.",
    framework: FRAMEWORKS.EISENHOWER,
    tasks: [
      {
        id: "task-fl-1",
        title: "Deliver finalized brand identity assets to Client A before 5 PM",
        quadrant: "q1",
        category: "urgent",
        dueDate: "today",
        estimatedPomodoros: 3,
        notes: "Send vector SVG, PDF guide, and high-res PNG mockups.",
        completed: false,
        subtasks: []
      },
      {
        id: "task-fl-2",
        title: "Build client onboarding automation & case study portfolio",
        quadrant: "q2",
        category: "strategy",
        dueDate: "in-3-days",
        estimatedPomodoros: 4,
        notes: "High leverage: Attracts $10k+ retainers rather than hourly gigs.",
        completed: false,
        subtasks: []
      },
      {
        id: "task-fl-3",
        title: "Forward monthly invoice receipts & expenses to accountant",
        quadrant: "q3",
        category: "finance",
        dueDate: "tomorrow",
        estimatedPomodoros: 1,
        notes: "Automate with bank export CSV.",
        completed: false,
        subtasks: []
      },
      {
        id: "task-fl-4",
        title: "Obsessively tweaking website footer font weights without testing",
        quadrant: "q4",
        category: "work",
        dueDate: "",
        estimatedPomodoros: 1,
        notes: "Nobody notices 1px shifts; focus on lead generation instead.",
        completed: true,
        subtasks: []
      }
    ]
  }
];

export const INITIAL_TASKS = PRESET_TEMPLATES[0].tasks;

// Sound synthesizer using Web Audio API (zero external sound file dependencies)
class TaskSoundEngine {
  constructor() {
    this.audioCtx = null;
    this.muted = false;
    this.volume = 0.5;
  }

  init() {
    if (typeof window === "undefined") return;
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
  }

  playAdd() {
    if (this.muted) return;
    this.init();
    if (!this.audioCtx) return;

    try {
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.08); // E5

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(this.volume * 0.25, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.13);
    } catch {
      // AudioContext failure gracefully handled
    }
  }

  playComplete() {
    if (this.muted) return;
    this.init();
    if (!this.audioCtx) return;

    try {
      const now = this.audioCtx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 (major chord)

      notes.forEach((freq, idx) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        const start = now + idx * 0.045;

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.001, start);
        gain.gain.linearRampToValueAtTime(this.volume * 0.35, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.28);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(start);
        osc.stop(start + 0.3);
      });
    } catch {
      // Gracefully silent
    }
  }

  playMove() {
    if (this.muted) return;
    this.init();
    if (!this.audioCtx) return;

    try {
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(440, now); // A4
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.1); // A5

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(this.volume * 0.2, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch {
      // Gracefully silent
    }
  }

  playDelete() {
    if (this.muted) return;
    this.init();
    if (!this.audioCtx) return;

    try {
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.12);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(this.volume * 0.2, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.16);
    } catch {
      // Gracefully silent
    }
  }
}

export const taskSoundEngine = new TaskSoundEngine();

// Analysis & Coaching: calculates Eisenhower balance and actionable productivity advice
export function evaluateMatrixHealth(tasks, framework = FRAMEWORKS.EISENHOWER) {
  const total = tasks.length;
  if (total === 0) {
    return {
      score: 100,
      status: "Empty Canvas",
      color: "text-slate-500",
      advice: "Your matrix is clear. Add tasks or pick a preset template above to prioritize your day.",
      breakdown: { q1: 0, q2: 0, q3: 0, q4: 0 },
      completedCount: 0,
      completionRate: 0
    };
  }

  const counts = { q1: 0, q2: 0, q3: 0, q4: 0 };
  let completed = 0;

  tasks.forEach((t) => {
    if (counts[t.quadrant] !== undefined) {
      counts[t.quadrant]++;
    }
    if (t.completed) completed++;
  });

  const pQ1 = Math.round((counts.q1 / total) * 100);
  const pQ2 = Math.round((counts.q2 / total) * 100);
  const pQ3 = Math.round((counts.q3 / total) * 100);
  const pQ4 = Math.round((counts.q4 / total) * 100);

  const completionRate = Math.round((completed / total) * 100);

  let score = 80;
  let status = "Balanced Matrix";
  let color = "text-emerald-500";
  let advice = "Healthy distribution across urgent tasks and long-term planning.";

  if (framework === FRAMEWORKS.EISENHOWER) {
    if (pQ1 > 40) {
      score = Math.max(45, 100 - (pQ1 - 40) * 1.5);
      status = "Urgency Overload (Firefighting)";
      color = "text-rose-500";
      advice =
        "Over 40% of your tasks sit in 'Do First'. Operating in constant crisis leads to burnout. Look for tasks you can schedule earlier (Q2) or hand off (Q3).";
    } else if (pQ2 >= 45) {
      score = 95;
      status = "Optimal Executive Flow";
      color = "text-indigo-500";
      advice =
        "Excellent high-leverage balance! Over 45% of your work is dedicated to strategic Q2 'Schedule' tasks that prevent crises before they happen.";
    } else if (pQ3 + pQ4 > 50) {
      score = 60;
      status = "Triviality Clutter";
      color = "text-amber-500";
      advice =
        "More than half your tasks are low-importance chores or distractions. Ruthlessly delegate Q3 items and purge Q4 items.";
    }
  } else if (framework === FRAMEWORKS.ACTION_PRIORITY) {
    if (counts.q1 > 0 && counts.q2 > 0) {
      score = 90;
      status = "High ROI Pacing";
      color = "text-emerald-500";
      advice = "Strong mix of immediate Quick Wins and foundational Major Projects.";
    }
  }

  return {
    score: Math.round(score),
    status,
    color,
    advice,
    breakdown: { q1: pQ1, q2: pQ2, q3: pQ3, q4: pQ4 },
    counts,
    completedCount: completed,
    completionRate
  };
}

// Export formatted Markdown
export function exportToMarkdown(tasks, frameworkConfig) {
  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  let md = `# ToolsTrek Task Prioritizer Export\n`;
  md += `**Framework**: ${frameworkConfig.name}  \n`;
  md += `**Exported**: ${dateStr}  \n`;
  md += `**Total Tasks**: ${tasks.length}  \n\n`;

  frameworkConfig.quadrants.forEach((q) => {
    const qTasks = tasks.filter((t) => t.quadrant === q.id);
    md += `## ${q.code}: ${q.name} (${q.subtitle})\n`;
    md += `*Action: ${q.action}*\n\n`;

    if (qTasks.length === 0) {
      md += `*(No tasks currently in this quadrant)*\n\n`;
    } else {
      qTasks.forEach((t) => {
        const check = t.completed ? "[x]" : "[ ]";
        const due = t.dueDate ? ` (Due: ${t.dueDate})` : "";
        const category = t.category ? ` [${t.category.toUpperCase()}]` : "";
        md += `- ${check} **${t.title}**${category}${due}\n`;
        if (t.notes) {
          md += `  > ${t.notes}\n`;
        }
        if (t.subtasks && t.subtasks.length > 0) {
          t.subtasks.forEach((st) => {
            const stCheck = st.completed ? "[x]" : "[ ]";
            md += `    - ${stCheck} ${st.text}\n`;
          });
        }
      });
      md += `\n`;
    }
  });

  md += `---\n*Generated with ToolsTrek Task Prioritizer — https://toolstrek.vercel.app/tools/task-prioritizer*\n`;
  return md;
}

// Export formatted CSV
export function exportToCSV(tasks, frameworkConfig) {
  const headers = ["ID", "Quadrant Code", "Quadrant Name", "Task Title", "Category", "Completed", "Due Date", "Notes", "Subtasks Total", "Subtasks Completed"];
  const rows = tasks.map((t) => {
    const q = frameworkConfig.quadrants.find((item) => item.id === t.quadrant) || { code: t.quadrant, name: t.quadrant };
    const subTotal = (t.subtasks || []).length;
    const subDone = (t.subtasks || []).filter((s) => s.completed).length;

    const escapeCsv = (str) => `"${String(str || "").replace(/"/g, '""')}"`;

    return [
      escapeCsv(t.id),
      escapeCsv(q.code),
      escapeCsv(q.name),
      escapeCsv(t.title),
      escapeCsv(t.category || "work"),
      escapeCsv(t.completed ? "Yes" : "No"),
      escapeCsv(t.dueDate || ""),
      escapeCsv(t.notes || ""),
      subTotal,
      subDone
    ].join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}

// Generate High-Res PNG Matrix Card via HTML5 Canvas
export async function generateMatrixImage(tasks, frameworkConfig, theme) {
  if (typeof window === "undefined" || !document) return null;

  const canvas = document.createElement("canvas");
  const width = 1600;
  const height = 1200;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Background
  const isDark = document.documentElement.classList.contains("dark");
  ctx.fillStyle = isDark ? "#0f172a" : "#f8fafc";
  ctx.fillRect(0, 0, width, height);

  // Subtle Header Glow
  const gradient = ctx.createLinearGradient(0, 0, width, 0);
  gradient.addColorStop(0, "#7c00fe");
  gradient.addColorStop(0.5, "#6366f1");
  gradient.addColorStop(1, "#3b82f6");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, 8);

  // Header Text
  ctx.fillStyle = isDark ? "#ffffff" : "#0f172a";
  ctx.font = "bold 44px sans-serif";
  ctx.fillText("ToolsTrek Task Prioritizer", 70, 75);

  ctx.fillStyle = isDark ? "#94a3b8" : "#64748b";
  ctx.font = "20px sans-serif";
  ctx.fillText(`${frameworkConfig.name} — ${frameworkConfig.tagline}`, 70, 110);

  // Date & Stats Stamp
  const dateStr = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const completedCount = tasks.filter((t) => t.completed).length;
  ctx.textAlign = "right";
  ctx.fillStyle = isDark ? "#94a3b8" : "#64748b";
  ctx.font = "bold 20px sans-serif";
  ctx.fillText(`${dateStr}  ·  ${completedCount}/${tasks.length} Completed`, width - 70, 75);
  ctx.font = "16px sans-serif";
  ctx.fillText("https://toolstrek.vercel.app/tools/task-prioritizer", width - 70, 105);
  ctx.textAlign = "left";

  // Grid Dimensions
  const gridX = 70;
  const gridY = 150;
  const gridW = width - 140;
  const gridH = height - 190;
  const colW = (gridW - 24) / 2;
  const rowH = (gridH - 24) / 2;

  const positions = [
    { x: gridX, y: gridY }, // Q1 Top Left
    { x: gridX + colW + 24, y: gridY }, // Q2 Top Right
    { x: gridX, y: gridY + rowH + 24 }, // Q3 Bottom Left
    { x: gridX + colW + 24, y: gridY + rowH + 24 } // Q4 Bottom Right
  ];

  frameworkConfig.quadrants.forEach((quad, i) => {
    const pos = positions[i];
    const qTasks = tasks.filter((t) => t.quadrant === quad.id);

    // Card background
    ctx.fillStyle = isDark ? "#1e293b" : "#ffffff";
    ctx.beginPath();
    ctx.roundRect(pos.x, pos.y, colW, rowH, 16);
    ctx.fill();

    // Card border
    ctx.strokeStyle = isDark ? "#334155" : "#e2e8f0";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Card Header Bar
    ctx.fillStyle = quad.colorHex;
    ctx.beginPath();
    ctx.roundRect(pos.x, pos.y, colW, 56, [16, 16, 0, 0]);
    ctx.fill();

    // Header Title
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 22px sans-serif";
    ctx.fillText(`${quad.code}  ·  ${quad.name}`, pos.x + 20, pos.y + 36);

    ctx.textAlign = "right";
    ctx.font = "bold 16px sans-serif";
    ctx.fillText(`${qTasks.length} tasks`, pos.x + colW - 20, pos.y + 36);
    ctx.textAlign = "left";

    // Subtitle Action Guide
    ctx.fillStyle = isDark ? "#94a3b8" : "#64748b";
    ctx.font = "italic 15px sans-serif";
    ctx.fillText(`${quad.subtitle} — Action: ${quad.action}`, pos.x + 20, pos.y + 84);

    // Task Items
    let itemY = pos.y + 116;
    const maxTasksToShow = 6;
    const displayTasks = qTasks.slice(0, maxTasksToShow);

    if (displayTasks.length === 0) {
      ctx.fillStyle = isDark ? "#64748b" : "#94a3b8";
      ctx.font = "italic 16px sans-serif";
      ctx.fillText("No tasks in this quadrant", pos.x + 24, itemY + 20);
    } else {
      displayTasks.forEach((t) => {
        // Bullet or check
        ctx.fillStyle = t.completed ? "#10b981" : quad.colorHex;
        ctx.beginPath();
        ctx.arc(pos.x + 28, itemY - 5, 5, 0, Math.PI * 2);
        ctx.fill();

        // Text
        ctx.fillStyle = t.completed ? (isDark ? "#64748b" : "#94a3b8") : isDark ? "#f1f5f9" : "#1e293b";
        ctx.font = t.completed ? "16px sans-serif" : "bold 16px sans-serif";

        const titleText = t.title.length > 48 ? `${t.title.slice(0, 48)}…` : t.title;
        ctx.fillText(titleText, pos.x + 44, itemY);

        if (t.completed) {
          const textWidth = ctx.measureText(titleText).width;
          ctx.strokeStyle = isDark ? "#64748b" : "#94a3b8";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(pos.x + 44, itemY - 5);
          ctx.lineTo(pos.x + 44 + textWidth, itemY - 5);
          ctx.stroke();
        }

        itemY += 34;
      });

      if (qTasks.length > maxTasksToShow) {
        ctx.fillStyle = isDark ? "#94a3b8" : "#64748b";
        ctx.font = "italic 14px sans-serif";
        ctx.fillText(`+ ${qTasks.length - maxTasksToShow} more tasks in matrix...`, pos.x + 44, itemY);
      }
    }
  });

  return canvas.toDataURL("image/png");
}

export const EDUCATIONAL_GUIDE = [
  {
    title: "Origins of the Eisenhower Matrix",
    content:
      "The Eisenhower Matrix was popularized by Dwight D. Eisenhower, the 34th President of the United States and Supreme Commander of the Allied Expeditionary Force during World War II. Eisenhower famously stated: 'I have two kinds of problems, the urgent and the important. The urgent are not important, and the important are never urgent.' Decades later, author Stephen R. Covey formalized this wisdom into Quadrants 1 through 4 in his seminal book 'The 7 Habits of Highly Effective People'."
  },
  {
    title: "The Urgency Trap (Mere Urgency Effect)",
    content:
      "Behavioral psychology demonstrates that human brains are neurologically hardwired to prioritize urgent deadlines over genuinely important strategic goals, even when the important goal delivers drastically higher long-term payoff. This cognitive bias is known as the 'Mere Urgency Effect'. The Task Prioritizer creates an objective spatial boundary that forces you to categorize work intentionally before diving into daily execution."
  },
  {
    title: "Mastering Quadrant 2 (The Proactive High-Leverage Zone)",
    content:
      "Quadrant 2 (Not Urgent & Important) is the engine of extraordinary productivity. It contains strategic planning, physical fitness, continuous education, deep architectural work, and relationship building. Because Q2 tasks never scream with immediate deadlines, most people neglect them until they explode into Q1 crises. Effective leaders deliberately schedule uninterrupted timeblocks for Q2 every single morning."
  },
  {
    title: "Eliminating Quadrant 4 (Guilt-Free Deletion)",
    content:
      "Quadrant 4 contains non-urgent, non-important trivia: compulsive social media refresh loops, unnecessary status sync meetings, and busywork that feels productive but produces zero measurable outcomes. If a task resides in Q4 for more than one week, you should delete it with complete confidence. Freeing your backlog from Q4 clutter provides immediate psychological relief."
  }
];

export const TASK_PRIORITIZER_FAQS = [
  {
    question: "What is the Task Prioritizer & Eisenhower Matrix tool?",
    answer:
      "The Task Prioritizer is a browser-first productivity workspace that organizes your to-dos, backlog, and sprint objectives across proven decision frameworks including the Eisenhower Matrix (Urgent vs. Important), Action Priority Matrix (Impact vs. Effort), and MoSCoW Matrix (Must, Should, Could, Won't). It provides visual 2×2 grid sorting, Kanban board workflows, deadline tracking, sound cues, matrix health diagnostics, and multi-format exports."
  },
  {
    question: "How does the Eisenhower Matrix classify tasks?",
    answer:
      "The Eisenhower Matrix separates tasks into four quadrants based on two axes: Urgency and Importance. Quadrant 1 (Do First) is Urgent & Important; Quadrant 2 (Schedule) is Not Urgent but Important; Quadrant 3 (Delegate) is Urgent but Not Important; and Quadrant 4 (Eliminate) is Neither Urgent Nor Important."
  },
  {
    question: "Are my tasks private and saved automatically?",
    answer:
      "Yes, 100%. All your tasks, subtasks, notes, category tags, and custom settings persist exclusively in your browser's client-side localStorage. No account creation is required, no analytics track your task text, and zero data is sent to external cloud servers."
  },
  {
    question: "Can I move tasks between quadrants without retyping them?",
    answer:
      "Yes! You can instantly transfer any task across quadrants using the quick Move dropdown, drag-and-drop handles, or keyboard shortcuts. The tool also preserves all nested subtasks, estimated Pomodoros, and notes during transfer."
  },
  {
    question: "What export formats are supported?",
    answer:
      "You can export your complete matrix workspace as a high-resolution PNG image/card (rendered via client-side HTML5 Canvas), structured CSV spreadsheet (compatible with Excel and Google Sheets), raw JSON for backup and device transfer, or formatted GitHub-flavored Markdown ready to paste into Slack, Jira, Notion, or team standup documents."
  },
  {
    question: "What is the Matrix Health Score?",
    answer:
      "The Matrix Health Score is a real-time diagnostic engine based on Stephen Covey's 7 Habits research. It analyzes your quadrant distribution and warns you if you are trapped in Q1 firefighting (>40% urgent tasks) or bogged down in Q3/Q4 busywork (>50% non-important tasks), while rewarding proactive focus in high-leverage Q2 (>45% strategic scheduling)."
  }
];
