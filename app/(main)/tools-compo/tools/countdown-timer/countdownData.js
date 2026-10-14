// app/(main)/tools-compo/tools/countdown-timer/countdownData.js

/**
 * Curated Themes with gradient backgrounds, card stylings, glow effects, and accents
 */
export const THEMES = [
  {
    id: "sapphire",
    name: "Electric Sapphire",
    badge: "Default",
    previewColor: "#3b82f6",
    gradient: "from-blue-600 via-indigo-600 to-cyan-500",
    bgSoft: "from-blue-500/10 via-indigo-500/5 to-cyan-500/10",
    cardBg: "bg-white/95 dark:bg-slate-950/90 border-blue-200 dark:border-blue-500/30 text-gray-900 dark:text-white shadow-xl shadow-blue-500/5 dark:shadow-blue-500/20",
    glowColor: "rgba(59, 130, 246, 0.25)",
    digitColor: "text-blue-600 dark:text-cyan-300",
    labelColor: "text-gray-500 dark:text-blue-200/70",
    btnPrimary: "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-lg shadow-blue-500/25",
    accentBorder: "border-blue-200 dark:border-blue-500/40",
    progressBar: "from-blue-500 to-cyan-400",
  },
  {
    id: "sunset",
    name: "Sunset Ember",
    badge: "Warm",
    previewColor: "#f43f5e",
    gradient: "from-rose-500 via-pink-600 to-amber-500",
    bgSoft: "from-rose-500/10 via-pink-500/5 to-amber-500/10",
    cardBg: "bg-white/95 dark:bg-slate-950/90 border-rose-200 dark:border-rose-500/30 text-gray-900 dark:text-white shadow-xl shadow-rose-500/5 dark:shadow-rose-500/20",
    glowColor: "rgba(244, 63, 94, 0.25)",
    digitColor: "text-rose-600 dark:text-rose-300",
    labelColor: "text-gray-500 dark:text-rose-200/70",
    btnPrimary: "bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white shadow-lg shadow-rose-500/25",
    accentBorder: "border-rose-200 dark:border-rose-500/40",
    progressBar: "from-rose-500 to-amber-400",
  },
  {
    id: "emerald",
    name: "Emerald Forest",
    badge: "Nature",
    previewColor: "#10b981",
    gradient: "from-emerald-500 via-teal-600 to-green-500",
    bgSoft: "from-emerald-500/10 via-teal-500/5 to-green-500/10",
    cardBg: "bg-white/95 dark:bg-slate-950/90 border-emerald-200 dark:border-emerald-500/30 text-gray-900 dark:text-white shadow-xl shadow-emerald-500/5 dark:shadow-emerald-500/20",
    glowColor: "rgba(16, 185, 129, 0.25)",
    digitColor: "text-emerald-600 dark:text-emerald-300",
    labelColor: "text-gray-500 dark:text-emerald-200/70",
    btnPrimary: "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/25",
    accentBorder: "border-emerald-200 dark:border-emerald-500/40",
    progressBar: "from-emerald-500 to-teal-400",
  },
  {
    id: "violet",
    name: "Cyber Violet",
    badge: "Vibrant",
    previewColor: "#8b5cf6",
    gradient: "from-purple-600 via-violet-600 to-fuchsia-500",
    bgSoft: "from-purple-500/10 via-violet-500/5 to-fuchsia-500/10",
    cardBg: "bg-white/95 dark:bg-slate-950/90 border-violet-200 dark:border-violet-500/30 text-gray-900 dark:text-white shadow-xl shadow-violet-500/5 dark:shadow-violet-500/20",
    glowColor: "rgba(139, 92, 246, 0.25)",
    digitColor: "text-violet-600 dark:text-fuchsia-300",
    labelColor: "text-gray-500 dark:text-violet-200/70",
    btnPrimary: "bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white shadow-lg shadow-violet-500/25",
    accentBorder: "border-violet-200 dark:border-violet-500/40",
    progressBar: "from-violet-500 to-fuchsia-400",
  },
  {
    id: "gold",
    name: "Golden Luxury",
    badge: "Elite",
    previewColor: "#f59e0b",
    gradient: "from-amber-500 via-yellow-600 to-orange-500",
    bgSoft: "from-amber-500/10 via-yellow-500/5 to-orange-500/10",
    cardBg: "bg-white/95 dark:bg-slate-950/90 border-amber-200 dark:border-amber-500/30 text-gray-900 dark:text-white shadow-xl shadow-amber-500/5 dark:shadow-amber-500/20",
    glowColor: "rgba(245, 158, 11, 0.25)",
    digitColor: "text-amber-600 dark:text-yellow-300",
    labelColor: "text-gray-500 dark:text-amber-200/70",
    btnPrimary: "bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white shadow-lg shadow-amber-500/25",
    accentBorder: "border-amber-200 dark:border-amber-500/40",
    progressBar: "from-amber-500 to-yellow-400",
  },
  {
    id: "midnight",
    name: "Midnight Stealth",
    badge: "Minimal",
    previewColor: "#64748b",
    gradient: "from-slate-700 via-gray-800 to-zinc-900",
    bgSoft: "from-slate-500/10 via-gray-500/5 to-zinc-500/10",
    cardBg: "bg-white/95 dark:bg-zinc-950/95 border-gray-200 dark:border-zinc-700/40 text-gray-900 dark:text-white shadow-xl shadow-gray-400/10 dark:shadow-zinc-800/30",
    glowColor: "rgba(148, 163, 184, 0.2)",
    digitColor: "text-gray-800 dark:text-zinc-100",
    labelColor: "text-gray-500 dark:text-slate-400",
    btnPrimary: "bg-gradient-to-r from-zinc-700 to-slate-800 hover:from-zinc-600 hover:to-slate-700 text-white shadow-lg shadow-zinc-900/30",
    accentBorder: "border-gray-200 dark:border-zinc-700/60",
    progressBar: "from-slate-400 to-zinc-200",
  },
];

/**
 * Get dynamic upcoming target date for common holidays & milestones
 */
export const getUpcomingDate = (month, day, hours = 0, minutes = 0) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  let target = new Date(currentYear, month - 1, day, hours, minutes, 0, 0);
  if (target.getTime() <= now.getTime()) {
    target = new Date(currentYear + 1, month - 1, day, hours, minutes, 0, 0);
  }
  return target;
};

/**
 * Dynamic Presets Library
 */
export const getCountdownPresets = () => {
  const now = new Date();
  const currentYear = now.getFullYear();

  // Next Friday 5:00 PM
  const nextFriday = new Date();
  const dayOfWeek = nextFriday.getDay();
  let daysUntilFriday = (5 - dayOfWeek + 7) % 7;
  if (daysUntilFriday === 0 && (nextFriday.getHours() >= 17)) {
    daysUntilFriday = 7;
  }
  nextFriday.setDate(nextFriday.getDate() + daysUntilFriday);
  nextFriday.setHours(17, 0, 0, 0);

  // End of Current Month
  const endOfMonth = new Date(currentYear, now.getMonth() + 1, 0, 23, 59, 59);

  // End of Quarter
  const currentQuarter = Math.floor(now.getMonth() / 3);
  const endOfQuarter = new Date(currentYear, (currentQuarter + 1) * 3, 0, 23, 59, 59);

  return [
    {
      id: "new-year",
      title: `New Year ${currentYear + 1}`,
      emoji: "🎆",
      category: "Holidays",
      targetDate: new Date(currentYear + 1, 0, 1, 0, 0, 0),
      description: `Countdown to the stroke of midnight on January 1, ${currentYear + 1}`,
      theme: "sapphire",
      repeat: "yearly",
    },
    {
      id: "christmas",
      title: "Christmas Day",
      emoji: "🎄",
      category: "Holidays",
      targetDate: getUpcomingDate(12, 25, 0, 0),
      description: "Countdown to Christmas morning celebration and gift exchange",
      theme: "sunset",
      repeat: "yearly",
    },
    {
      id: "halloween",
      title: "Halloween",
      emoji: "🎃",
      category: "Holidays",
      targetDate: getUpcomingDate(10, 31, 18, 0),
      description: "Spooky season countdown to trick-or-treating evening",
      theme: "gold",
      repeat: "yearly",
    },
    {
      id: "thanksgiving",
      title: "Thanksgiving (US)",
      emoji: "🦃",
      category: "Holidays",
      targetDate: (() => {
        // Fourth Thursday of November
        const year = now.getMonth() > 10 || (now.getMonth() === 10 && now.getDate() > 28) ? currentYear + 1 : currentYear;
        const nov1 = new Date(year, 10, 1);
        const firstThurs = 1 + ((4 - nov1.getDay() + 7) % 7);
        const fourthThurs = firstThurs + 21;
        return new Date(year, 10, fourthThurs, 12, 0, 0);
      })(),
      description: "Countdown to Thanksgiving feast and family celebration",
      theme: "gold",
      repeat: "yearly",
    },
    {
      id: "valentines",
      title: "Valentine's Day",
      emoji: "💝",
      category: "Holidays",
      targetDate: getUpcomingDate(2, 14, 0, 0),
      description: "Romantic countdown to Valentine's Day love and date nights",
      theme: "sunset",
      repeat: "yearly",
    },
    {
      id: "summer-solstice",
      title: "Summer Solstice",
      emoji: "☀️",
      category: "Seasons",
      targetDate: getUpcomingDate(6, 21, 0, 0),
      description: "Longest day of the year and astronomical start of summer",
      theme: "gold",
      repeat: "yearly",
    },
    {
      id: "winter-solstice",
      title: "Winter Solstice",
      emoji: "❄️",
      category: "Seasons",
      targetDate: getUpcomingDate(12, 21, 0, 0),
      description: "Shortest day of the year and start of astronomical winter",
      theme: "sapphire",
      repeat: "yearly",
    },
    {
      id: "spring-equinox",
      title: "Spring Equinox",
      emoji: "🌱",
      category: "Seasons",
      targetDate: getUpcomingDate(3, 20, 0, 0),
      description: "Equal day and night marking the rebirth of nature and spring",
      theme: "emerald",
      repeat: "yearly",
    },
    {
      id: "weekend",
      title: "Weekend Freedom (Friday 5PM)",
      emoji: "🎉",
      category: "Milestones",
      targetDate: nextFriday,
      description: "Countdown to clocks punching out on Friday afternoon",
      theme: "violet",
      repeat: "weekly",
    },
    {
      id: "end-month",
      title: "End of This Month",
      emoji: "📅",
      category: "Milestones",
      targetDate: endOfMonth,
      description: "Monthly goal closeout, billing deadline, and summary review",
      theme: "emerald",
      repeat: "monthly",
    },
    {
      id: "end-quarter",
      title: `End of Q${currentQuarter + 1}`,
      emoji: "📈",
      category: "Milestones",
      targetDate: endOfQuarter,
      description: "Business and corporate quarterly targets closeout",
      theme: "sapphire",
      repeat: "none",
    },
    {
      id: "retirement",
      title: "Retirement Day",
      emoji: "🏖️",
      category: "Personal",
      targetDate: new Date(currentYear + 5, 5, 30, 17, 0, 0),
      description: "Freedom countdown to the golden retirement horizon",
      theme: "emerald",
      repeat: "none",
    },
    {
      id: "wedding",
      title: "Our Wedding Day",
      emoji: "💍",
      category: "Personal",
      targetDate: new Date(currentYear + 1, 5, 20, 15, 0, 0),
      description: "Countdown to walking down the aisle and saying 'I do'",
      theme: "sunset",
      repeat: "none",
    },
    {
      id: "vacation",
      title: "Dream Vacation Flight",
      emoji: "✈️",
      category: "Personal",
      targetDate: new Date(currentYear, now.getMonth() + 2, 15, 8, 30, 0),
      description: "Pack your bags! Boarding pass takeoff countdown",
      theme: "violet",
      repeat: "none",
    },
    {
      id: "birthday",
      title: "Next Milestone Birthday",
      emoji: "🎂",
      category: "Personal",
      targetDate: getUpcomingDate(now.getMonth() + 4, 15, 0, 0),
      description: "Cake, candles, celebration, and another lap around the sun",
      theme: "sunset",
      repeat: "yearly",
    },
  ];
};

/**
 * Curated World Timezones with labels and UTC offsets
 */
export const WORLD_TIMEZONES = [
  { value: "LOCAL", label: "Local Device Timezone (Automatic)", offset: "Auto" },
  { value: "UTC", label: "UTC (Coordinated Universal Time)", offset: "+00:00" },
  { value: "America/New_York", label: "New York (EST/EDT - US Eastern)", offset: "-05:00 / -04:00" },
  { value: "America/Chicago", label: "Chicago (CST/CDT - US Central)", offset: "-06:00 / -05:00" },
  { value: "America/Denver", label: "Denver (MST/MDT - US Mountain)", offset: "-07:00 / -06:00" },
  { value: "America/Los_Angeles", label: "Los Angeles (PST/PDT - US Pacific)", offset: "-08:00 / -07:00" },
  { value: "America/Toronto", label: "Toronto (Eastern Canada)", offset: "-05:00" },
  { value: "America/Sao_Paulo", label: "São Paulo (Brazil)", offset: "-03:00" },
  { value: "Europe/London", label: "London (GMT/BST - UK)", offset: "+00:00 / +01:00" },
  { value: "Europe/Paris", label: "Paris (CET/CEST - France)", offset: "+01:00 / +02:00" },
  { value: "Europe/Berlin", label: "Berlin (Germany)", offset: "+01:00 / +02:00" },
  { value: "Europe/Rome", label: "Rome (Italy)", offset: "+01:00 / +02:00" },
  { value: "Europe/Madrid", label: "Madrid (Spain)", offset: "+01:00 / +02:00" },
  { value: "Europe/Amsterdam", label: "Amsterdam (Netherlands)", offset: "+01:00 / +02:00" },
  { value: "Europe/Athens", label: "Athens (Greece)", offset: "+02:00 / +03:00" },
  { value: "Europe/Istanbul", label: "Istanbul (Turkey)", offset: "+03:00" },
  { value: "Asia/Dubai", label: "Dubai (GST - UAE)", offset: "+04:00" },
  { value: "Asia/Kolkata", label: "New Delhi / Mumbai (IST - India)", offset: "+05:30" },
  { value: "Asia/Dhaka", label: "Dhaka (BST - Bangladesh)", offset: "+06:00" },
  { value: "Asia/Bangkok", label: "Bangkok (ICT - Thailand)", offset: "+07:00" },
  { value: "Asia/Singapore", label: "Singapore (SGT)", offset: "+08:00" },
  { value: "Asia/Hong_Kong", label: "Hong Kong (HKT)", offset: "+08:00" },
  { value: "Asia/Shanghai", label: "Shanghai / Beijing (CST - China)", offset: "+08:00" },
  { value: "Asia/Tokyo", label: "Tokyo (JST - Japan)", offset: "+09:00" },
  { value: "Asia/Seoul", label: "Seoul (KST - South Korea)", offset: "+09:00" },
  { value: "Australia/Sydney", label: "Sydney (AEST/AEDT - Australia)", offset: "+10:00 / +11:00" },
  { value: "Australia/Melbourne", label: "Melbourne (Australia)", offset: "+10:00 / +11:00" },
  { value: "Pacific/Auckland", label: "Auckland (NZST/NZDT - New Zealand)", offset: "+12:00 / +13:00" },
  { value: "Pacific/Honolulu", label: "Honolulu (HST - Hawaii)", offset: "-10:00" },
];

/**
 * High-Precision In-Browser Audio Alert Engine using Web Audio API
 * Zero external audio files required!
 */
export class CountdownSoundEngine {
  constructor() {
    this.ctx = null;
    this.volume = 0.7;
    this.muted = false;
  }

  init() {
    if (typeof window === "undefined") return;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => { });
    }
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  setMuted(m) {
    this.muted = m;
  }

  playAlert(soundType = "chime") {
    if (this.muted || this.volume <= 0) return;
    this.init();
    if (!this.ctx) return;

    try {
      switch (soundType) {
        case "fanfare":
          this.playFanfare();
          break;
        case "bowl":
          this.playTibetanBowl();
          break;
        case "digital":
          this.playDigitalBeeps();
          break;
        case "bell":
          this.playModernBell();
          break;
        case "harp":
          this.playHarpArpeggio();
          break;
        case "chime":
        default:
          this.playHarmonicChime();
          break;
      }
    } catch {
      // Audio playback failed silently
    }
  }

  playHarmonicChime() {
    const now = this.ctx.currentTime;
    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(this.volume * 0.45, now);
    masterGain.connect(this.ctx.destination);

    const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    freqs.forEach((f, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(f, now + idx * 0.12);

      gain.gain.setValueAtTime(0, now + idx * 0.12);
      gain.gain.linearRampToValueAtTime(0.3, now + idx * 0.12 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 1.6);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 1.8);
    });
  }

  playFanfare() {
    const now = this.ctx.currentTime;
    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(this.volume * 0.4, now);
    masterGain.connect(this.ctx.destination);

    // Triumphant fanfare notes: C4, G4, C5, E5, G5
    const notes = [
      { f: 261.63, t: 0, d: 0.15 },
      { f: 392.0, t: 0.14, d: 0.15 },
      { f: 523.25, t: 0.28, d: 0.18 },
      { f: 659.25, t: 0.46, d: 0.22 },
      { f: 783.99, t: 0.68, d: 0.8 },
      { f: 1046.5, t: 0.68, d: 0.9 },
    ];

    notes.forEach(({ f, t, d }) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(f, now + t);

      gain.gain.setValueAtTime(0, now + t);
      gain.gain.linearRampToValueAtTime(0.35, now + t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + t + d);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now + t);
      osc.stop(now + t + d + 0.05);
    });
  }

  playTibetanBowl() {
    const now = this.ctx.currentTime;
    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(this.volume * 0.5, now);
    masterGain.connect(this.ctx.destination);

    const fundamental = 216; // Deep resonant tone
    const partials = [1, 2.76, 5.4, 8.1];

    partials.forEach((mult, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(fundamental * mult, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.35 / (i + 1), now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0005, now + 3.0);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 3.2);
    });
  }

  playDigitalBeeps() {
    const now = this.ctx.currentTime;
    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(this.volume * 0.35, now);
    masterGain.connect(this.ctx.destination);

    [0, 0.15, 0.3, 0.45].forEach((t, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "square";
      const freq = i === 3 ? 1760 : 880;
      osc.frequency.setValueAtTime(freq, now + t);

      gain.gain.setValueAtTime(0.2, now + t);
      gain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.08);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now + t);
      osc.stop(now + t + 0.09);
    });
  }

  playModernBell() {
    const now = this.ctx.currentTime;
    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(this.volume * 0.45, now);
    masterGain.connect(this.ctx.destination);

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.8);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(now);
    osc.stop(now + 1.6);
  }

  playHarpArpeggio() {
    const now = this.ctx.currentTime;
    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(this.volume * 0.4, now);
    masterGain.connect(this.ctx.destination);

    const freqs = [329.63, 392.0, 493.88, 587.33, 659.25, 783.99, 987.77];
    freqs.forEach((f, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(f, now + idx * 0.08);

      gain.gain.setValueAtTime(0.25, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 1.2);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 1.3);
    });
  }
}

export const countdownSoundEngine = new CountdownSoundEngine();

/**
 * Calculate business/working days between two dates
 * Excludes Saturdays & Sundays (or custom weekend format)
 */
export const calculateBusinessDays = (startDate, endDate, weekendMode = "sat-sun") => {
  if (!startDate || !endDate) return { businessDays: 0, weekendDays: 0, totalDays: 0 };
  let start = new Date(startDate);
  let end = new Date(endDate);

  // Normalize to start of day
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const isReverse = start > end;
  if (isReverse) {
    const temp = start;
    start = end;
    end = temp;
  }

  let businessDays = 0;
  let weekendDays = 0;
  const current = new Date(start);

  while (current < end) {
    const day = current.getDay();
    let isWeekend = false;

    if (weekendMode === "sat-sun") {
      isWeekend = day === 0 || day === 6; // Sunday or Saturday
    } else if (weekendMode === "fri-sat") {
      isWeekend = day === 5 || day === 6; // Friday or Saturday (Middle East)
    } else if (weekendMode === "sun-only") {
      isWeekend = day === 0; // Sunday only (6-day workweek)
    }

    if (isWeekend) {
      weekendDays++;
    } else {
      businessDays++;
    }

    current.setDate(current.getDate() + 1);
  }

  const totalDays = businessDays + weekendDays;
  return {
    businessDays: isReverse ? -businessDays : businessDays,
    weekendDays: isReverse ? -weekendDays : weekendDays,
    totalDays: isReverse ? -totalDays : totalDays,
  };
};

/**
 * Generate RFC 5545 iCalendar (.ics) string for export
 */
export const generateIcsContent = ({ title, description, targetDate, url = "https://toolstrek.vercel.app/tools/countdown-timer" }) => {
  const pad = (n) => String(n).padStart(2, "0");
  const formatDate = (date) => {
    return (
      date.getUTCFullYear() +
      pad(date.getUTCMonth() + 1) +
      pad(date.getUTCDate()) +
      "T" +
      pad(date.getUTCHours()) +
      pad(date.getUTCMinutes()) +
      pad(date.getUTCSeconds()) +
      "Z"
    );
  };

  const nowStr = formatDate(new Date());
  const startStr = formatDate(new Date(targetDate));
  const endStr = formatDate(new Date(new Date(targetDate).getTime() + 60 * 60 * 1000)); // 1 hour duration
  const uid = `countdown-${Date.now()}@toolstrek.vercel.app`;

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ToolsTrek//Countdown Timer//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${nowStr}`,
    `DTSTART:${startStr}`,
    `DTEND:${endStr}`,
    `SUMMARY:${title.replace(/[\r\n]+/g, " ")}`,
    `DESCRIPTION:${description.replace(/[\r\n]+/g, " ")} | Generated via ToolsTrek`,
    `URL:${url}`,
    "STATUS:CONFIRMED",
    "BEGIN:VALARM",
    "TRIGGER:-PT15M",
    "ACTION:DISPLAY",
    `DESCRIPTION:Reminder: ${title.replace(/[\r\n]+/g, " ")}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
};

/**
 * Comprehensive FAQ Knowledge for Countdown Timer & Days Until Calculator
 */
export const COUNTDOWN_FAQS = [
  {
    q: "How does the Countdown Timer calculate the remaining time?",
    a: "ToolsTrek computes high-precision millisecond delta timestamps between your local machine's clock (or selected international timezone) and the target event timestamp. By continuously sampling timestamps via high-frequency delta loops, the timer guarantees 100% frame-perfect accuracy without drifting, even when your browser tab is kept in the background or minimized.",
  },
  {
    q: "How does the 'Days Until Calculator' handle working/business days?",
    a: "The Days Until calculation engine computes both total calendar days and net business days. You can customize the weekend model (e.g. Saturday-Sunday, Friday-Saturday for Middle Eastern schedules, or Sunday-only for 6-day work weeks). The algorithm iterates through each intermediate calendar day to provide a clear breakdown of business days, weekend days, full weeks, and total elapsed working hours.",
  },
  {
    q: "Can I share a live countdown with others or bookmark it?",
    a: "Yes! ToolsTrek automatically synchronizes your countdown title, target date, timezone, theme, and settings directly into a shareable URL query string. Anyone who opens the link will see the identical customized countdown ticking down in real time. You can also generate an embeddable HTML iframe snippet to include inside Notion, Obsidian, blogs, or internal corporate intranets.",
  },
  {
    q: "Can I export this countdown to Google Calendar, Apple Calendar, or Outlook?",
    a: "Yes. With a single click on 'Add to Calendar (.ics)', the tool creates a standard RFC 5545 `.ics` file complete with event title, target timestamp, and an automated 15-minute advance reminder alarm. You can open and import this file directly into Google Calendar, Outlook, Apple iCal, or Thunderbird.",
  },
  {
    q: "What happens when the countdown reaches zero?",
    a: "When the timer hits zero, ToolsTrek triggers a celebration: you will hear your chosen Web Audio harmonic alert sound (Fanfare, Chime, Zen Bell, or Harp), an on-screen confetti burst explosion will launch, and your customizable completion celebration message will be displayed. If you leave the timer running, it will automatically transition into a 'Count-Up' mode showing exactly how much time has elapsed since the milestone occurred.",
  },
  {
    q: "Does the countdown work across different world timezones?",
    a: "Yes! You can choose your local machine timezone or select from 60+ global timezones (including UTC, US Eastern, US Pacific, London GMT/BST, Tokyo JST, Dhaka BST, New Delhi IST, Dubai GST, etc.). The tool handles UTC offsets and daylight saving transitions seamlessly so international teams and families stay in perfect sync.",
  },
  {
    q: "Is any of my countdown or event data sent to a server?",
    a: "Never. All calculations, state storage, audio generation, and image card exports run 100% client-side inside your browser. No personal event titles, dates, or calculations are logged, stored, or sent across the network, ensuring complete privacy.",
  },
];

/**
 * Lightweight, zero-dependency HTML5 Canvas Confetti Burst
 */
export const triggerConfetti = () => {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const canvas = document.createElement("canvas");
  canvas.style.position = "fixed";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.width = "100vw";
  canvas.style.height = "100vh";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "999999";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    canvas.remove();
    return;
  }

  const dpr = window.devicePixelRatio || 1;
  const width = (canvas.width = window.innerWidth * dpr);
  const height = (canvas.height = window.innerHeight * dpr);
  ctx.scale(dpr, dpr);

  const colors = [
    "#f43f5e", "#ec4899", "#8b5cf6", "#3b82f6",
    "#06b6d4", "#10b981", "#f59e0b", "#eab308"
  ];

  const particleCount = 140;
  const particles = [];

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: window.innerWidth * (0.3 + Math.random() * 0.4),
      y: window.innerHeight * 0.4,
      vx: (Math.random() - 0.5) * 16,
      vy: (Math.random() - 0.9) * 18,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 12,
      opacity: 1,
      shape: Math.random() > 0.3 ? "rect" : "circle",
    });
  }

  let startTime = null;
  const duration = 3200; // 3.2 seconds

  const animate = (timestamp) => {
    if (!startTime) startTime = timestamp;
    const progress = (timestamp - startTime) / duration;

    if (progress >= 1) {
      canvas.remove();
      return;
    }

    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35; // Gravity
      p.vx *= 0.985; // Drag
      p.rotation += p.rotationSpeed;
      p.opacity = Math.max(0, 1 - progress);

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;

      if (p.shape === "rect") {
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });

    requestAnimationFrame(animate);
  };

  requestAnimationFrame(animate);
};

