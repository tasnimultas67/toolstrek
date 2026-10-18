"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  Sun,
  Sunrise,
  SunMedium,
  Sunset,
  Moon,
  Sparkles,
  Clock,
  Globe,
  Sliders,
  Copy,
  Check,
  RotateCcw,
  Download,
  Share2,
  Calendar,
  Layers,
  Code2,
  Sparkle,
  Search,
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  Eye,
  Settings2,
  Compass,
  FileCode,
  Flame,
  Info,
  CheckCircle2,
  Laptop,
  Mail,
  Zap,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  Maximize2
} from "lucide-react";
import { toast } from "sonner";
import ToolPageShell from "../ToolPageShell";
import FavoriteButton from "@/components/FavoriteButton";
import toolsData from "@/lib/toolsData.json";
import {
  POPULAR_TIMEZONES,
  DEFAULT_SLOTS,
  TONE_PRESETS,
  LANGUAGE_PACKS,
  CARD_THEMES,
  FAQ_ITEMS,
  GREETING_MATRIX_DATA
} from "./dynamic-time-greeting/greetingData";

const STORAGE_KEY = "toolstrek_dynamic_greeting_v1";

export default function DynamicTimeGreetingGenerator() {
  // ─── Timezone & Live Clock State ───
  const [targetTimezone, setTargetTimezone] = useState("UTC");
  const [deviceTimezone, setDeviceTimezone] = useState("UTC");
  const [timezoneSearch, setTimezoneSearch] = useState("");
  const [isTimezoneDropdownOpen, setIsTimezoneDropdownOpen] = useState(false);
  const [use24Hour, setUse24Hour] = useState(false);
  const [now, setNow] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  // ─── Simulation Mode State ───
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulatedMinutes, setSimulatedMinutes] = useState(570); // 09:30 AM default

  // ─── Customization State ───
  const [slots, setSlots] = useState(DEFAULT_SLOTS);
  const [variables, setVariables] = useState({
    name: "Alex",
    prefix: "Hey",
    suffix: "👋",
    company: "ToolsTrek",
    title: "Lead Engineer",
    customSubtitle: ""
  });

  // ─── Visual Card Styling ───
  const [selectedThemeId, setSelectedThemeId] = useState("aurora");
  const [cardAlign, setCardAlign] = useState("left"); // left | center | right
  const [cardSize, setCardSize] = useState("standard"); // compact | standard | large
  const [showElements, setShowElements] = useState({
    clock: true,
    date: true,
    timezone: true,
    subtitle: true,
    emoji: true,
    badge: true
  });

  // ─── Tabs & Modals ───
  const [activeTab, setActiveTab] = useState("visual"); // visual | slots | presets | simulator | code
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [selectedTone, setSelectedTone] = useState("corporate");
  const [codeType, setCodeType] = useState("react"); // react | js | html | email | python | json
  const [copiedKey, setCopiedKey] = useState(null);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // ─── Ref for Image Export ───
  const cardRef = useRef(null);
  const timezoneDropdownRef = useRef(null);

  // ─── Initialize Device Timezone & Restore Saved State ───
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration of persisted settings and device timezone from localStorage/Intl; must run post-mount to avoid an SSR hydration mismatch
    setMounted(true);
    try {
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
      setDeviceTimezone(detected);

      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.targetTimezone) setTargetTimezone(parsed.targetTimezone);
        if (parsed.slots && Array.isArray(parsed.slots)) setSlots(parsed.slots);
        if (parsed.variables) setVariables(parsed.variables);
        if (parsed.selectedThemeId) setSelectedThemeId(parsed.selectedThemeId);
        if (parsed.cardAlign) setCardAlign(parsed.cardAlign);
        if (parsed.cardSize) setCardSize(parsed.cardSize);
        if (parsed.showElements) setShowElements(parsed.showElements);
        if (typeof parsed.use24Hour === "boolean") setUse24Hour(parsed.use24Hour);
      } else {
        setTargetTimezone(detected);
      }
    } catch (e) {
      console.warn("Storage or Timezone error:", e);
    }
  }, []);

  // ─── Live Clock Interval ───
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // ─── Persist to LocalStorage ───
  const savePreferences = useCallback(() => {
    if (!mounted) return;
    try {
      const payload = {
        targetTimezone,
        slots,
        variables,
        selectedThemeId,
        cardAlign,
        cardSize,
        showElements,
        use24Hour
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn("Failed to persist greeting settings:", e);
    }
  }, [mounted, targetTimezone, slots, variables, selectedThemeId, cardAlign, cardSize, showElements, use24Hour]);

  useEffect(() => {
    savePreferences();
  }, [savePreferences]);

  // ─── Close Timezone Dropdown on Outside Click ───
  useEffect(() => {
    function handleClickOutside(event) {
      if (timezoneDropdownRef.current && !timezoneDropdownRef.current.contains(event.target)) {
        setIsTimezoneDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ─── Compute Target Time Details ───
  const targetTimeInfo = useMemo(() => {
    try {
      let dateToUse = now;
      if (isSimulating) {
        const simHours = Math.floor(simulatedMinutes / 60);
        const simMins = simulatedMinutes % 60;
        const d = new Date(now);
        d.setHours(simHours, simMins, 0, 0);
        dateToUse = d;
      }

      // Format parts in target timezone
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: targetTimezone,
        hour12: false,
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long"
      });

      const parts = formatter.formatToParts(dateToUse);
      const partMap = {};
      parts.forEach((p) => {
        partMap[p.type] = p.value;
      });

      const hour24 = parseInt(partMap.hour, 10);
      const minute = parseInt(partMap.minute, 10);
      const second = isSimulating ? 0 : parseInt(partMap.second || "0", 10);
      const hour12 = hour24 % 12 || 12;
      const ampm = hour24 >= 12 ? "PM" : "AM";
      const totalMinutes = hour24 * 60 + minute;

      // Time string formatted
      const pad = (n) => String(n).padStart(2, "0");
      const timeStr = use24Hour
        ? `${pad(hour24)}:${pad(minute)}${isSimulating ? "" : `:${pad(second)}`}`
        : `${pad(hour12)}:${pad(minute)}${isSimulating ? "" : `:${pad(second)}`} ${ampm}`;

      const dateStr = `${partMap.weekday}, ${partMap.month} ${partMap.day}, ${partMap.year}`;
      const dayName = partMap.weekday;

      // Calculate UTC offset
      let offsetStr = "+00:00";
      try {
        const offsetFormatter = new Intl.DateTimeFormat("en-US", {
          timeZone: targetTimezone,
          timeZoneName: "longOffset"
        });
        const offsetPart = offsetFormatter.formatToParts(dateToUse).find((p) => p.type === "timeZoneName");
        if (offsetPart) offsetStr = offsetPart.value.replace("GMT", "UTC");
      } catch {
        offsetStr = "UTC";
      }

      // Relative difference from device
      let relativeDiff = "";
      if (deviceTimezone === targetTimezone) {
        relativeDiff = "Same as your device time";
      } else {
        try {
          const targetOffsetMin = -new Date().toLocaleTimeString("en-US", { timeZone: targetTimezone, timeZoneName: "shortOffset" });
          // Simpler comparison using diff of formatted hours
          const devHour = now.getHours() + now.getMinutes() / 60;
          const tgtHour = hour24 + minute / 60;
          let diffHours = Math.round(tgtHour - devHour);
          if (diffHours > 12) diffHours -= 24;
          if (diffHours < -12) diffHours += 24;

          if (diffHours === 0) {
            relativeDiff = "Matches your local hour";
          } else if (diffHours > 0) {
            relativeDiff = `+${diffHours}h ahead of your local time`;
          } else {
            relativeDiff = `${diffHours}h behind your local time`;
          }
        } catch {
          relativeDiff = "Target timezone active";
        }
      }

      return {
        hour24,
        minute,
        second,
        totalMinutes,
        timeStr,
        dateStr,
        dayName,
        offsetStr,
        relativeDiff
      };
    } catch (e) {
      console.warn("Timezone parsing fallback:", e);
      return {
        hour24: 12,
        minute: 0,
        second: 0,
        totalMinutes: 720,
        timeStr: "12:00 PM",
        dateStr: "Wednesday, October 14, 2026",
        dayName: "Wednesday",
        offsetStr: "UTC",
        relativeDiff: "Active"
      };
    }
  }, [targetTimezone, deviceTimezone, now, isSimulating, simulatedMinutes, use24Hour]);

  // ─── Slot Resolver Logic ───
  const activeSlot = useMemo(() => {
    const curM = targetTimeInfo.totalMinutes;

    // First try enabled slots
    const matched = slots.find((s) => {
      if (!s.enabled) return false;
      const startM = s.startHour * 60 + (s.startMinute || 0);
      const endM = s.endHour * 60 + (s.endMinute ?? 59);

      if (startM <= endM) {
        return curM >= startM && curM <= endM;
      } else {
        // Spans midnight (e.g. 21:00 to 03:59)
        return curM >= startM || curM <= endM;
      }
    });

    if (matched) return matched;

    // Fallback: Default to morning or first enabled slot
    return (
      slots.find((s) => s.enabled) || {
        id: "default",
        name: "General Greeting",
        icon: "Sun",
        greeting: "Hello, {name}!",
        subtitle: "Welcome back.",
        accent: "from-purple-600 to-indigo-600",
        badgeBg: "bg-purple-500/10 text-purple-400"
      }
    );
  }, [slots, targetTimeInfo.totalMinutes]);

  // ─── Interpolate Variables into Template ───
  const interpolate = useCallback(
    (template) => {
      if (!template) return "";
      return template
        .replace(/{name}/g, variables.name || "Friend")
        .replace(/{prefix}/g, variables.prefix || "")
        .replace(/{suffix}/g, variables.suffix || "")
        .replace(/{time}/g, targetTimeInfo.timeStr)
        .replace(/{date}/g, targetTimeInfo.dateStr)
        .replace(/{day}/g, targetTimeInfo.dayName)
        .replace(/{timezone}/g, targetTimezone)
        .replace(/{company}/g, variables.company || "")
        .replace(/{title}/g, variables.title || "")
        .replace(/{slot_name}/g, activeSlot.name || "");
    },
    [variables, targetTimeInfo, targetTimezone, activeSlot]
  );

  const activeGreeting = useMemo(() => {
    return interpolate(activeSlot.greeting);
  }, [activeSlot, interpolate]);

  const activeSubtitle = useMemo(() => {
    if (variables.customSubtitle) {
      return interpolate(variables.customSubtitle);
    }
    return interpolate(activeSlot.subtitle);
  }, [variables.customSubtitle, activeSlot, interpolate]);

  // ─── Get Slot Icon Component ───
  const getSlotIcon = (iconName, className = "w-5 h-5") => {
    switch (iconName) {
      case "Sunrise":
        return <Sunrise className={className} />;
      case "Sun":
        return <Sun className={className} />;
      case "SunMedium":
        return <SunMedium className={className} />;
      case "Sunset":
        return <Sunset className={className} />;
      case "Moon":
        return <Moon className={className} />;
      case "Sparkles":
      default:
        return <Sparkles className={className} />;
    }
  };

  // ─── Active Theme ───
  const currentTheme = useMemo(() => {
    return CARD_THEMES.find((t) => t.id === selectedThemeId) || CARD_THEMES[0];
  }, [selectedThemeId]);

  // ─── Filtered Timezones List ───
  const filteredTimezones = useMemo(() => {
    if (!timezoneSearch.trim()) return POPULAR_TIMEZONES;
    const q = timezoneSearch.toLowerCase();
    return POPULAR_TIMEZONES.filter(
      (tz) =>
        tz.city.toLowerCase().includes(q) ||
        tz.country.toLowerCase().includes(q) ||
        tz.timezone.toLowerCase().includes(q) ||
        tz.label.toLowerCase().includes(q) ||
        tz.offset.includes(q)
    );
  }, [timezoneSearch]);

  // ─── Handler Functions ───
  const handleDetectLocalTimezone = () => {
    try {
      const local = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
      setTargetTimezone(local);
      toast.success(`Target timezone set to your local location: ${local}`);
    } catch {
      toast.error("Unable to detect local timezone");
    }
  };

  const handleCopy = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleResetDefaults = () => {
    if (confirm("Reset all greeting settings, custom slots, and variables to default factory settings?")) {
      setSlots(DEFAULT_SLOTS);
      setVariables({
        name: "Alex",
        prefix: "Hey",
        suffix: "👋",
        company: "ToolsTrek",
        title: "Lead Engineer",
        customSubtitle: ""
      });
      setSelectedThemeId("aurora");
      setCardAlign("left");
      setCardSize("standard");
      setShowElements({
        clock: true,
        date: true,
        timezone: true,
        subtitle: true,
        emoji: true,
        badge: true
      });
      setIsSimulating(false);
      localStorage.removeItem(STORAGE_KEY);
      toast.success("Reset to factory defaults");
    }
  };

  const applyTonePreset = (preset) => {
    setSelectedTone(preset.id);
    setSlots((prev) =>
      prev.map((slot) => {
        const replacement = preset.slots[slot.id];
        if (replacement) {
          return {
            ...slot,
            greeting: replacement.greeting,
            subtitle: replacement.subtitle
          };
        }
        return slot;
      })
    );
    toast.success(`Applied ${preset.name} tone style!`);
  };

  const applyLanguagePack = (lang) => {
    setSelectedLanguage(lang.id);
    setSlots((prev) =>
      prev.map((slot) => {
        const replacement = lang.slots[slot.id];
        if (replacement) {
          return {
            ...slot,
            greeting: replacement.greeting,
            subtitle: replacement.subtitle
          };
        }
        return slot;
      })
    );
    toast.success(`Applied ${lang.name} language greetings!`);
  };

  // ─── Slot CRUD Operations ───
  const handleUpdateSlot = (id, key, value) => {
    setSlots((prev) =>
      prev.map((slot) => (slot.id === id ? { ...slot, [key]: value } : slot))
    );
  };

  const handleToggleSlotEnabled = (id) => {
    setSlots((prev) =>
      prev.map((slot) => (slot.id === id ? { ...slot, enabled: !slot.enabled } : slot))
    );
  };

  const handleDeleteSlot = (id) => {
    if (slots.length <= 1) {
      toast.error("You must keep at least one active slot");
      return;
    }
    setSlots((prev) => prev.filter((s) => s.id !== id));
    toast.info("Slot removed");
  };

  const handleAddNewSlot = () => {
    const newId = `custom-slot-${Date.now()}`;
    const newSlot = {
      id: newId,
      name: "Custom Period",
      icon: "Sun",
      startHour: 13,
      startMinute: 0,
      endHour: 14,
      endMinute: 30,
      greeting: "Hello, {name}!",
      subtitle: "Custom greeting timeframe.",
      enabled: true,
      accent: "from-blue-600 to-indigo-600",
      badgeBg: "bg-blue-500/10 text-blue-400"
    };
    setSlots((prev) => [...prev, newSlot]);
    toast.success("New custom slot added. Configure start and end hours below.");
  };

  // ─── Export Card as Image ───
  const handleDownloadImage = async () => {
    if (!cardRef.current) return;
    try {
      toast.loading("Generating greeting visual...", { id: "export-img" });
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: null,
        logging: false
      });
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `dynamic-greeting-${activeSlot.id}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Greeting image downloaded!", { id: "export-img" });
    } catch (e) {
      console.error("Image export error:", e);
      toast.error("Could not export image. Please try again.", { id: "export-img" });
    }
  };

  // ─── Generate Embeddable Code Snippets ───
  const generatedCode = useMemo(() => {
    const serializedSlots = JSON.stringify(
      slots.map((s) => ({
        id: s.id,
        name: s.name,
        startHour: s.startHour,
        startMinute: s.startMinute || 0,
        endHour: s.endHour,
        endMinute: s.endMinute ?? 59,
        greeting: s.greeting,
        subtitle: s.subtitle,
        enabled: s.enabled
      })),
      null,
      2
    );

    if (codeType === "react") {
      return `import React, { useState, useEffect } from "react";

// Dynamic Time Greeting Hook for Next.js / React (SSR Hydration Safe)
export function useDynamicGreeting({
  timezone = "${targetTimezone}",
  recipientName = "${variables.name}"
} = {}) {
  const [greeting, setGreeting] = useState("${activeGreeting}");
  const [subtitle, setSubtitle] = useState("${activeSubtitle}");
  const [activeSlot, setActiveSlot] = useState("${activeSlot.name}");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const slots = ${serializedSlots};

    function calculate() {
      const now = new Date();
      const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        hour12: false,
        hour: "numeric",
        minute: "numeric",
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric"
      }).formatToParts(now);

      const map = {};
      parts.forEach(p => { map[p.type] = p.value; });
      const hour = parseInt(map.hour, 10);
      const minute = parseInt(map.minute, 10);
      const curM = hour * 60 + minute;

      const matched = slots.find(s => {
        if (!s.enabled) return false;
        const startM = s.startHour * 60 + s.startMinute;
        const endM = s.endHour * 60 + s.endMinute;
        return startM <= endM ? (curM >= startM && curM <= endM) : (curM >= startM || curM <= endM);
      }) || slots[0];

      const interpolate = (tpl) => tpl
        .replace(/{name}/g, recipientName)
        .replace(/{day}/g, map.weekday)
        .replace(/{time}/g, \`\${hour}:\${String(minute).padStart(2, "0")}\`)
        .replace(/{timezone}/g, timezone);

      setGreeting(interpolate(matched.greeting));
      setSubtitle(interpolate(matched.subtitle));
      setActiveSlot(matched.name);
    }

    calculate();
    const interval = setInterval(calculate, 60000);
    return () => clearInterval(interval);
  }, [timezone, recipientName]);

  return { greeting, subtitle, activeSlot, mounted };
}

// Example Component Usage:
export default function UserGreetingBanner() {
  const { greeting, subtitle, mounted } = useDynamicGreeting();

  if (!mounted) {
    // Prevent SSR hydration flicker
    return <div className="text-xl font-bold">Welcome back!</div>;
  }

  return (
    <div className="p-6 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl text-white">
      <h1 className="text-2xl font-bold">{greeting}</h1>
      <p className="text-sm opacity-90 mt-1">{subtitle}</p>
    </div>
  );
}`;
    }

    if (codeType === "js") {
      return `/**
 * Pure Vanilla JavaScript Dynamic Time Greeting
 * @param {string} timezone - IANA timezone (e.g. "${targetTimezone}")
 * @param {string} name - Recipient name (e.g. "${variables.name}")
 * @returns {{ greeting: string, subtitle: string, slot: string }}
 */
function getDynamicGreeting(timezone = "${targetTimezone}", name = "${variables.name}") {
  const slots = ${serializedSlots};

  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour12: false,
    hour: "numeric",
    minute: "numeric",
    weekday: "long"
  }).formatToParts(now);

  const map = {};
  parts.forEach(p => { map[p.type] = p.value; });
  const hour = parseInt(map.hour, 10);
  const minute = parseInt(map.minute, 10);
  const curM = hour * 60 + minute;

  const matched = slots.find(s => {
    if (!s.enabled) return false;
    const startM = s.startHour * 60 + s.startMinute;
    const endM = s.endHour * 60 + s.endMinute;
    return startM <= endM ? (curM >= startM && curM <= endM) : (curM >= startM || curM <= endM);
  }) || slots[0];

  const interpolate = (tpl) => tpl
    .replace(/{name}/g, name)
    .replace(/{day}/g, map.weekday)
    .replace(/{time}/g, \`\${hour}:\${String(minute).padStart(2, "0")}\`)
    .replace(/{timezone}/g, timezone);

  return {
    greeting: interpolate(matched.greeting),
    subtitle: interpolate(matched.subtitle),
    slot: matched.name
  };
}

// Example usage:
const currentGreeting = getDynamicGreeting();
console.log(currentGreeting.greeting);
console.log(currentGreeting.subtitle);`;
    }

    if (codeType === "html") {
      return `<!-- Embeddable Dynamic Greeting Widget -->
<div id="greeting-widget" style="padding: 24px; border-radius: 16px; background: linear-gradient(135deg, #7c3aed, #4f46e5); color: #fff; font-family: system-ui, sans-serif;">
  <h2 id="greeting-title" style="margin: 0; font-size: 24px; font-weight: 700;">${activeGreeting}</h2>
  <p id="greeting-sub" style="margin: 8px 0 0; opacity: 0.9; font-size: 14px;">${activeSubtitle}</p>
</div>

<script>
(function() {
  const timezone = "${targetTimezone}";
  const name = "${variables.name}";
  const slots = ${serializedSlots};

  function update() {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour12: false,
      hour: "numeric",
      minute: "numeric"
    }).formatToParts(new Date());

    const map = {};
    parts.forEach(p => { map[p.type] = p.value; });
    const curM = parseInt(map.hour, 10) * 60 + parseInt(map.minute, 10);

    const matched = slots.find(s => {
      if (!s.enabled) return false;
      const startM = s.startHour * 60 + s.startMinute;
      const endM = s.endHour * 60 + s.endMinute;
      return startM <= endM ? (curM >= startM && curM <= endM) : (curM >= startM || curM <= endM);
    }) || slots[0];

    document.getElementById("greeting-title").textContent = matched.greeting.replace(/{name}/g, name);
    document.getElementById("greeting-sub").textContent = matched.subtitle.replace(/{name}/g, name);
  }

  update();
})();
<\/script>`;
    }

    if (codeType === "email") {
      return `{# Liquid / Klaviyo / Shopify Dynamic Email Template Greeting #}
{% assign current_hour = 'now' | date: '%H' | plus: 0 %}

{% if current_hour >= 4 and current_hour < 12 %}
  Good morning, {{ first_name | default: '${variables.name}' }}!
{% elsif current_hour >= 12 and current_hour < 17 %}
  Good afternoon, {{ first_name | default: '${variables.name}' }}!
{% elsif current_hour >= 17 and current_hour < 21 %}
  Good evening, {{ first_name | default: '${variables.name}' }}!
{% else %}
  Hello, {{ first_name | default: '${variables.name}' }}!
{% endif %}

<!-- HTML Email Greeting Header Block -->
<table width="100%" cellpadding="0" cellspacing="0" style="background:#7c3aed;border-radius:12px;padding:24px;color:#ffffff;font-family:sans-serif;">
  <tr>
    <td>
      <h1 style="margin:0;font-size:22px;color:#ffffff;">
        {% if current_hour >= 4 and current_hour < 12 %}
          Good morning, {{ first_name | default: '${variables.name}' }}!
        {% elsif current_hour >= 12 and current_hour < 17 %}
          Good afternoon, {{ first_name | default: '${variables.name}' }}!
        {% elsif current_hour >= 17 and current_hour < 21 %}
          Good evening, {{ first_name | default: '${variables.name}' }}!
        {% else %}
          Hello, {{ first_name | default: '${variables.name}' }}!
        {% endif %}
      </h1>
      <p style="margin:6px 0 0;font-size:14px;color:#e9d5ff;">
        We hope you're having a wonderful day. Here is your daily digest!
      </p>
    </td>
  </tr>
</table>`;
    }

    if (codeType === "python") {
      return `# Python Backend Dynamic Greeting Function
from datetime import datetime
import zoneinfo

def get_time_greeting(name="${variables.name}", timezone_str="${targetTimezone}"):
    tz = zoneinfo.ZoneInfo(timezone_str)
    now = datetime.now(tz)
    hour = now.hour

    if 4 <= hour < 12:
        return f"Good morning, {name}!"
    elif 12 <= hour < 17:
        return f"Good afternoon, {name}!"
    elif 17 <= hour < 21:
        return f"Good evening, {name}!"
    elif 21 <= hour < 24:
        return f"Good night, {name}!"
    else:
        return f"Burning the midnight oil, {name}?"

# Example execution
if __name__ == "__main__":
    greeting = get_time_greeting()
    print("Generated greeting:", greeting)`;
    }

    // JSON export
    return JSON.stringify(
      {
        targetTimezone,
        variables,
        selectedThemeId,
        slots
      },
      null,
      2
    );
  }, [codeType, slots, targetTimezone, variables, activeGreeting, activeSubtitle, activeSlot, selectedThemeId]);

  return (
    <ToolPageShell>
      <div className="w-full space-y-8 animate-fadeIn text-slate-800 dark:text-slate-100">
        {/* ─── HEADER & BREADCRUMBS ─── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800/80 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-purple-600 dark:text-purple-400 uppercase">
              <span>Tools</span>
              <span>/</span>
              <span>Productivity & UX</span>
              <span>/</span>
              <span className="text-slate-500 dark:text-slate-400">Time Greeting Generator</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
              <span className="p-2 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/25 inline-flex items-center justify-center">
                <SunMedium className="w-6 h-6 animate-pulse" />
              </span>
              Dynamic Time Greeting Generator
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
              Create, preview, and generate personalized time-based greetings tailored to any target timezone, customized time brackets, multilingual phrases, and ready-to-deploy code snippets.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
            <button
              onClick={handleResetDefaults}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-red-500 dark:hover:text-red-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-xs"
              title="Reset all settings to default"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Defaults</span>
            </button>

            <FavoriteButton
              tool={
                toolsData.find((t) => t.link === "/tools/dynamic-time-greeting-generator") || {
                  link: "/tools/dynamic-time-greeting-generator",
                  title: "Dynamic Time Greeting Generator"
                }
              }
            />
          </div>
        </div>

        {/* ─── TARGET TIMEZONE & LIVE CLOCK CONTROL BAR ─── */}
        <div className="bg-gradient-to-r from-purple-50/60 via-indigo-50/40 to-slate-50/50 dark:from-slate-900/90 dark:via-purple-950/20 dark:to-slate-900/90 border border-purple-200/60 dark:border-purple-900/30 rounded-3xl p-4 sm:p-6 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
            {/* Timezone Selector Dropdown & Search */}
            <div className="lg:col-span-5 relative" ref={timezoneDropdownRef}>
              <label className="block text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" />
                  Target Timezone Selection
                </span>
                <button
                  type="button"
                  onClick={handleDetectLocalTimezone}
                  className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Compass className="w-3 h-3" />
                  Detect Local
                </button>
              </label>

              {/* Selector button */}
              <div
                onClick={() => setIsTimezoneDropdownOpen(!isTimezoneDropdownOpen)}
                className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 text-sm flex items-center justify-between cursor-pointer hover:border-purple-500 transition-all shadow-xs"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="font-semibold text-slate-800 dark:text-slate-100 truncate">
                    {targetTimezone}
                  </span>
                  <span className="text-xs text-purple-600 dark:text-purple-400 font-mono px-2 py-0.5 bg-purple-50 dark:bg-purple-950/60 rounded-md">
                    {targetTimeInfo.offsetStr}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>

              {/* Popover Dropdown */}
              {isTimezoneDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden animate-fadeIn max-h-[380px] flex flex-col">
                  {/* Search Input */}
                  <div className="p-2.5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/50 flex items-center gap-2">
                    <Search className="w-4 h-4 text-slate-400 ml-1" />
                    <input
                      type="text"
                      placeholder="Search city, country, or timezone..."
                      value={timezoneSearch}
                      onChange={(e) => setTimezoneSearch(e.target.value)}
                      className="w-full bg-transparent text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none"
                      autoFocus
                    />
                    {timezoneSearch && (
                      <button
                        onClick={() => setTimezoneSearch("")}
                        className="text-xs text-slate-400 hover:text-slate-600 px-1"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* List of Timezones */}
                  <div className="overflow-y-auto p-1.5 space-y-1">
                    {filteredTimezones.map((tz) => {
                      const isSelected = tz.timezone === targetTimezone;
                      return (
                        <div
                          key={tz.timezone + tz.city}
                          onClick={() => {
                            setTargetTimezone(tz.timezone);
                            setIsTimezoneDropdownOpen(false);
                            setTimezoneSearch("");
                            toast.success(`Target timezone updated to ${tz.city}`);
                          }}
                          className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-colors ${
                            isSelected
                              ? "bg-purple-600 text-white font-semibold"
                              : "hover:bg-purple-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200"
                          }`}
                        >
                          <div className="truncate mr-2">
                            <span className="font-semibold">{tz.city}</span>
                            <span className={`text-[11px] ml-1.5 opacity-70 ${isSelected ? "text-purple-100" : "text-slate-400"}`}>
                              {tz.country} • {tz.timezone}
                            </span>
                          </div>
                          <span
                            className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
                              isSelected ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                            }`}
                          >
                            {tz.offset}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Fast presets buttons */}
              <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1 no-scrollbar text-[11px]">
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Fast:</span>
                {[
                  { name: "New York", tz: "America/New_York" },
                  { name: "London", tz: "Europe/London" },
                  { name: "Dhaka", tz: "Asia/Dhaka" },
                  { name: "Dubai", tz: "Asia/Dubai" },
                  { name: "Tokyo", tz: "Asia/Tokyo" }
                ].map((item) => (
                  <button
                    key={item.name}
                    onClick={() => setTargetTimezone(item.tz)}
                    className={`px-2 py-0.5 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap ${
                      targetTimezone === item.tz
                        ? "bg-purple-600 text-white shadow-xs"
                        : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-purple-400"
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Target Clock Card */}
            <div className="lg:col-span-4 bg-white/90 dark:bg-slate-950/80 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-3.5 sm:p-4 shadow-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-purple-600" />
                  Target Wall Clock
                </span>
                <button
                  onClick={() => setUse24Hour(!use24Hour)}
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-purple-100 text-slate-600 dark:text-slate-300 cursor-pointer transition-colors"
                >
                  {use24Hour ? "24H Format" : "12H Format"}
                </button>
              </div>

              <div className="flex items-baseline gap-2">
                <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
                  {targetTimeInfo.timeStr}
                </div>
                {isSimulating && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                    Simulated
                  </span>
                )}
              </div>

              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
                <span>{targetTimeInfo.dateStr}</span>
                <span className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">
                  {targetTimeInfo.relativeDiff}
                </span>
              </div>
            </div>

            {/* Active Slot Status Pill */}
            <div className="lg:col-span-3 bg-white/90 dark:bg-slate-950/80 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-3.5 sm:p-4 shadow-xs flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${activeSlot.accent || "from-purple-600 to-indigo-600"} text-white flex items-center justify-center shadow-md flex-shrink-0`}
              >
                {getSlotIcon(activeSlot.icon, "w-6 h-6")}
              </div>
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold tracking-wider text-purple-600 dark:text-purple-400 block">
                  Active Bracket
                </span>
                <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                  {activeSlot.name}
                </h2>
                <span className="text-[11px] text-slate-400 font-mono block">
                  {String(activeSlot.startHour).padStart(2, "0")}:
                  {String(activeSlot.startMinute || 0).padStart(2, "0")} –{" "}
                  {String(activeSlot.endHour).padStart(2, "0")}:
                  {String(activeSlot.endMinute ?? 59).padStart(2, "0")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── NAVIGATION TABS ─── */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-px no-scrollbar">
          {[
            { id: "visual", label: "Visual Studio & Preview", icon: Eye },
            { id: "slots", label: "Custom Time Slots", icon: Sliders },
            { id: "presets", label: "Tones & Multilingual", icon: Globe },
            { id: "simulator", label: "24H Time Traveler", icon: Compass },
            { id: "code", label: "Code & Snippets", icon: FileCode }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "border-purple-600 text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-950/20 rounded-t-xl"
                    : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-purple-600 dark:text-purple-400" : "text-slate-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ─── TAB 1: VISUAL STUDIO & LIVE PREVIEW ─── */}
        {activeTab === "visual" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Live Card Display & Export Actions */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  Live Rendered Greeting Card
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleCopy(activeGreeting, "greeting-txt")}
                    className="px-2.5 py-1 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-purple-400 flex items-center gap-1 cursor-pointer transition-all"
                  >
                    {copiedKey === "greeting-txt" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                    Copy Text
                  </button>
                  <button
                    onClick={handleDownloadImage}
                    className="px-2.5 py-1 text-xs font-semibold bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Save PNG
                  </button>
                </div>
              </div>

              {/* Visual Card Container */}
              <div
                ref={cardRef}
                style={{
                  boxShadow: `0 20px 40px -15px ${currentTheme.glowColor}`
                }}
                className={`relative overflow-hidden rounded-3xl p-6 sm:p-10 border transition-all duration-300 bg-gradient-to-br ${currentTheme.gradient} ${currentTheme.borderClass}`}
              >
                {/* Background decorative glow */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-black/10 blur-3xl pointer-events-none" />

                {/* Top Badge & Timezone */}
                <div className="flex items-center justify-between gap-3 mb-6 flex-wrap relative z-10">
                  {showElements.badge && (
                    <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${currentTheme.badgeBg}`}>
                      {getSlotIcon(activeSlot.icon, "w-3.5 h-3.5")}
                      <span>{activeSlot.name}</span>
                    </div>
                  )}

                  {showElements.timezone && (
                    <div className="text-[11px] font-mono opacity-80 flex items-center gap-1 text-white/90">
                      <Globe className="w-3 h-3" />
                      <span>{targetTimezone}</span>
                    </div>
                  )}
                </div>

                {/* Main Dynamic Greeting Headline */}
                <div
                  className={`relative z-10 space-y-2.5 text-${cardAlign} ${
                    cardAlign === "center" ? "mx-auto" : ""
                  }`}
                >
                  <h2
                    className={`font-black tracking-tight leading-tight ${currentTheme.textClass} ${
                      cardSize === "compact"
                        ? "text-xl sm:text-2xl"
                        : cardSize === "large"
                        ? "text-3xl sm:text-5xl"
                        : "text-2xl sm:text-4xl"
                    }`}
                  >
                    {activeGreeting}
                  </h2>

                  {showElements.subtitle && activeSubtitle && (
                    <p
                      className={`font-medium max-w-xl leading-relaxed ${currentTheme.subtextClass} ${
                        cardSize === "compact" ? "text-xs sm:text-sm" : "text-sm sm:text-base"
                      } ${cardAlign === "center" ? "mx-auto" : ""}`}
                    >
                      {activeSubtitle}
                    </p>
                  )}
                </div>

                {/* Bottom Bar: Clock & Date */}
                {(showElements.clock || showElements.date) && (
                  <div className="mt-8 pt-5 border-t border-white/15 flex items-center justify-between text-xs opacity-90 relative z-10 flex-wrap gap-2 text-white">
                    {showElements.clock && (
                      <div className="flex items-center gap-1.5 font-mono font-bold">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{targetTimeInfo.timeStr}</span>
                      </div>
                    )}
                    {showElements.date && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{targetTimeInfo.dateStr}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Theme Quick Switcher */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
                  Visual Theme Palette
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                  {CARD_THEMES.map((theme) => {
                    const isSelected = theme.id === selectedThemeId;
                    return (
                      <button
                        key={theme.id}
                        onClick={() => setSelectedThemeId(theme.id)}
                        className={`p-2 rounded-xl text-left border transition-all cursor-pointer flex flex-col gap-1.5 ${
                          isSelected
                            ? "border-purple-600 ring-2 ring-purple-500/20 bg-purple-50/50 dark:bg-purple-950/20"
                            : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                        }`}
                      >
                        <div className={`w-full h-6 rounded-lg bg-gradient-to-r ${theme.gradient}`} />
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate">
                          {theme.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: Customization Controls & Variables */}
            <div className="lg:col-span-5 space-y-6">
              {/* Recipient & Variables Form */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <Settings2 className="w-4 h-4 text-purple-600" />
                  Personalization & Placeholders
                </h3>

                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Recipient Name <code className="text-purple-600 dark:text-purple-400 text-[11px]">{"{name}"}</code>
                    </label>
                    <input
                      type="text"
                      value={variables.name}
                      onChange={(e) => setVariables({ ...variables, name: e.target.value })}
                      placeholder="e.g. Alex, Sarah, Team"
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Prefix Salutation <code className="text-purple-600 dark:text-purple-400 text-[10px]">{"{prefix}"}</code>
                      </label>
                      <input
                        type="text"
                        value={variables.prefix}
                        onChange={(e) => setVariables({ ...variables, prefix: e.target.value })}
                        placeholder="e.g. Hey, Hi, Dear"
                        className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Emoji / Suffix <code className="text-purple-600 dark:text-purple-400 text-[10px]">{"{suffix}"}</code>
                      </label>
                      <input
                        type="text"
                        value={variables.suffix}
                        onChange={(e) => setVariables({ ...variables, suffix: e.target.value })}
                        placeholder="e.g. 👋, ✨, ☕"
                        className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Company Name <code className="text-purple-600 dark:text-purple-400 text-[10px]">{"{company}"}</code>
                      </label>
                      <input
                        type="text"
                        value={variables.company}
                        onChange={(e) => setVariables({ ...variables, company: e.target.value })}
                        placeholder="e.g. ToolsTrek"
                        className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        User Role/Title <code className="text-purple-600 dark:text-purple-400 text-[10px]">{"{title}"}</code>
                      </label>
                      <input
                        type="text"
                        value={variables.title}
                        onChange={(e) => setVariables({ ...variables, title: e.target.value })}
                        placeholder="e.g. Product Lead"
                        className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Custom Subtitle Override (Optional)
                    </label>
                    <input
                      type="text"
                      value={variables.customSubtitle}
                      onChange={(e) => setVariables({ ...variables, customSubtitle: e.target.value })}
                      placeholder="Leave blank to use default slot subtitle"
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Layout & Typography Controls */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <Sliders className="w-4 h-4 text-purple-600" />
                  Layout & Visual Display Elements
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Text Alignment
                    </label>
                    <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl">
                      {["left", "center", "right"].map((align) => (
                        <button
                          key={align}
                          onClick={() => setCardAlign(align)}
                          className={`py-1 text-xs font-bold capitalize rounded-lg transition-all cursor-pointer ${
                            cardAlign === align
                              ? "bg-white dark:bg-slate-800 text-purple-600 shadow-xs"
                              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                          }`}
                        >
                          {align}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Typography Size
                    </label>
                    <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl">
                      {["compact", "standard", "large"].map((size) => (
                        <button
                          key={size}
                          onClick={() => setCardSize(size)}
                          className={`py-1 text-xs font-bold capitalize rounded-lg transition-all cursor-pointer ${
                            cardSize === size
                              ? "bg-white dark:bg-slate-800 text-purple-600 shadow-xs"
                              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Visible Badges and Toggles */}
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Toggle Card Elements
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { key: "clock", label: "Target Clock" },
                      { key: "date", label: "Date Display" },
                      { key: "timezone", label: "Timezone Pill" },
                      { key: "subtitle", label: "Subtitle Text" },
                      { key: "badge", label: "Period Badge" }
                    ].map((item) => (
                      <label
                        key={item.key}
                        className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/60 dark:border-slate-800/60 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300"
                      >
                        <input
                          type="checkbox"
                          checked={showElements[item.key]}
                          onChange={(e) =>
                            setShowElements({
                              ...showElements,
                              [item.key]: e.target.checked
                            })
                          }
                          className="rounded text-purple-600 focus:ring-purple-500 w-3.5 h-3.5 cursor-pointer"
                        />
                        <span>{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 2: CUSTOM TIME SLOTS & RULES ─── */}
        {activeTab === "slots" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-purple-600" />
                  Custom Time Bracket Rules & Templates
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Every bracket is 100% customizable. Customize start/end hours, greeting templates, and subtitles.
                </p>
              </div>

              <button
                onClick={handleAddNewSlot}
                className="self-start sm:self-auto px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                Add New Bracket
              </button>
            </div>

            {/* 24-Hour Visual Coverage Bar */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                24-Hour Day Timeline Coverage
              </span>
              <div className="w-full h-8 rounded-xl overflow-hidden flex bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                {slots
                  .filter((s) => s.enabled)
                  .map((slot) => {
                    const startM = slot.startHour * 60 + (slot.startMinute || 0);
                    const endM = slot.endHour * 60 + (slot.endMinute ?? 59);
                    const durationM = endM >= startM ? endM - startM + 1 : 1440 - startM + endM + 1;
                    const widthPercent = (durationM / 1440) * 100;
                    const isActive = activeSlot.id === slot.id;

                    return (
                      <div
                        key={slot.id}
                        style={{ width: `${widthPercent}%` }}
                        className={`h-full bg-gradient-to-r ${slot.accent || "from-purple-600 to-indigo-600"} transition-all relative group cursor-pointer flex items-center justify-center text-white text-[10px] font-bold ${
                          isActive ? "ring-2 ring-white z-10" : "opacity-80 hover:opacity-100"
                        }`}
                        title={`${slot.name} (${String(slot.startHour).padStart(2, "0")}:00 – ${String(slot.endHour).padStart(2, "0")}:59)`}
                      >
                        <span className="truncate px-1 hidden sm:inline">{slot.name}</span>
                      </div>
                    );
                  })}
              </div>
              <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1.5 px-0.5">
                <span>00:00 (Midnight)</span>
                <span>06:00 (Dawn)</span>
                <span>12:00 (Noon)</span>
                <span>18:00 (Sunset)</span>
                <span>24:00 (Night)</span>
              </div>
            </div>

            {/* Slots List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {slots.map((slot) => {
                const isActive = activeSlot.id === slot.id;
                return (
                  <div
                    key={slot.id}
                    className={`bg-white dark:bg-slate-900 border rounded-3xl p-5 transition-all shadow-xs space-y-4 ${
                      isActive
                        ? "border-purple-500 ring-2 ring-purple-500/15"
                        : "border-slate-200 dark:border-slate-800"
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`p-2 rounded-xl bg-gradient-to-tr ${slot.accent || "from-purple-600 to-indigo-600"} text-white`}
                        >
                          {getSlotIcon(slot.icon, "w-4 h-4")}
                        </div>
                        <div>
                          <input
                            type="text"
                            value={slot.name}
                            onChange={(e) => handleUpdateSlot(slot.id, "name", e.target.value)}
                            className="font-bold text-sm text-slate-800 dark:text-slate-100 bg-transparent border-b border-dashed border-slate-300 dark:border-slate-700 outline-none focus:border-purple-500"
                          />
                          {isActive && (
                            <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 block">
                              ● Currently Active in Target Timezone
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={slot.enabled}
                            onChange={() => handleToggleSlotEnabled(slot.id)}
                            className="rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                          />
                          <span>{slot.enabled ? "Active" : "Disabled"}</span>
                        </label>
                        <button
                          onClick={() => handleDeleteSlot(slot.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                          title="Delete slot"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Time Hours & Minutes Range */}
                    <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1">
                          Start Time (24H)
                        </label>
                        <div className="flex items-center gap-1 font-mono text-xs">
                          <input
                            type="number"
                            min="0"
                            max="23"
                            value={slot.startHour}
                            onChange={(e) =>
                              handleUpdateSlot(slot.id, "startHour", Math.min(23, Math.max(0, parseInt(e.target.value) || 0)))
                            }
                            className="w-14 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-center"
                          />
                          <span>:</span>
                          <input
                            type="number"
                            min="0"
                            max="59"
                            value={slot.startMinute || 0}
                            onChange={(e) =>
                              handleUpdateSlot(slot.id, "startMinute", Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))
                            }
                            className="w-14 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-center"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1">
                          End Time (24H)
                        </label>
                        <div className="flex items-center gap-1 font-mono text-xs">
                          <input
                            type="number"
                            min="0"
                            max="23"
                            value={slot.endHour}
                            onChange={(e) =>
                              handleUpdateSlot(slot.id, "endHour", Math.min(23, Math.max(0, parseInt(e.target.value) || 0)))
                            }
                            className="w-14 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-center"
                          />
                          <span>:</span>
                          <input
                            type="number"
                            min="0"
                            max="59"
                            value={slot.endMinute ?? 59}
                            onChange={(e) =>
                              handleUpdateSlot(slot.id, "endMinute", Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))
                            }
                            className="w-14 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-center"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Greeting Headline Template */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Headline Template
                      </label>
                      <input
                        type="text"
                        value={slot.greeting}
                        onChange={(e) => handleUpdateSlot(slot.id, "greeting", e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-purple-500 font-medium"
                      />
                    </div>

                    {/* Subtitle Template */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Subtitle Template
                      </label>
                      <input
                        type="text"
                        value={slot.subtitle}
                        onChange={(e) => handleUpdateSlot(slot.id, "subtitle", e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-purple-500 text-slate-600 dark:text-slate-400"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── TAB 3: TONES & MULTILINGUAL PRESETS ─── */}
        {activeTab === "presets" && (
          <div className="space-y-8">
            {/* Tone Presets */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Flame className="w-5 h-5 text-purple-600" />
                  Voice & Tone Presets
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Switch the personality and mood of your greetings with one click.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {TONE_PRESETS.map((tone) => {
                  const isSelected = selectedTone === tone.id;
                  return (
                    <div
                      key={tone.id}
                      onClick={() => applyTonePreset(tone)}
                      className={`p-5 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "border-purple-600 bg-purple-50/60 dark:bg-purple-950/30 ring-2 ring-purple-500/20"
                          : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-purple-300"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                            {tone.name}
                          </h4>
                          {isSelected && <Check className="w-4 h-4 text-purple-600" />}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                          {tone.description}
                        </p>
                      </div>

                      <div className="bg-white/80 dark:bg-slate-950/80 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-600 dark:text-slate-300">
                        <span className="font-bold text-purple-600 dark:text-purple-400 block text-[10px] uppercase">
                          Sample Morning:
                        </span>
                        {tone.slots.morning.greeting.replace("{name}", variables.name)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Multilingual Language Packs */}
            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Globe className="w-5 h-5 text-purple-600" />
                  Multilingual Language Packs (11+ Global Languages)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select any language to instantly load authentic, culturally natural greetings for every time bracket.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {LANGUAGE_PACKS.map((lang) => {
                  const isSelected = selectedLanguage === lang.id;
                  return (
                    <button
                      key={lang.id}
                      onClick={() => applyLanguagePack(lang)}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                        isSelected
                          ? "border-purple-600 bg-purple-50 dark:bg-purple-950/30 ring-2 ring-purple-500/20"
                          : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-purple-300"
                      }`}
                    >
                      <span className="text-2xl">{lang.flag}</span>
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-100 truncate">
                        {lang.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 4: 24-HOUR TIME TRAVEL SIMULATOR ─── */}
        {activeTab === "simulator" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Compass className="w-5 h-5 text-purple-600" />
                  Interactive 24-Hour Time Travel Simulator
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Slide through any minute of the day to audit exactly what greeting your users will see at that specific moment.
                </p>
              </div>

              {isSimulating ? (
                <button
                  onClick={() => setIsSimulating(false)}
                  className="self-start sm:self-auto px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Return to Live Clock
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsSimulating(true);
                    setSimulatedMinutes(targetTimeInfo.totalMinutes);
                  }}
                  className="self-start sm:self-auto px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  Engage Simulator
                </button>
              )}
            </div>

            {/* Slider Control Panel */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Simulated Time of Day
                  </span>
                  <div className="text-3xl sm:text-4xl font-black font-mono text-purple-600 dark:text-purple-400">
                    {targetTimeInfo.timeStr}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {[
                    { label: "Dawn (05:30)", mins: 330 },
                    { label: "Morning (09:00)", mins: 540 },
                    { label: "Lunch (12:30)", mins: 750 },
                    { label: "Sunset (18:15)", mins: 1095 },
                    { label: "Night (22:00)", mins: 1320 },
                    { label: "Midnight (01:45)", mins: 105 }
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => {
                        setIsSimulating(true);
                        setSimulatedMinutes(preset.mins);
                      }}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-purple-100 dark:hover:bg-purple-950 text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Slider Input */}
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="1439"
                  step="5"
                  value={isSimulating ? simulatedMinutes : targetTimeInfo.totalMinutes}
                  onChange={(e) => {
                    setIsSimulating(true);
                    setSimulatedMinutes(parseInt(e.target.value, 10));
                  }}
                  className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />

                <div className="flex justify-between text-xs font-mono text-slate-400">
                  <span>00:00 (12 AM)</span>
                  <span>06:00 (6 AM)</span>
                  <span>12:00 (12 PM)</span>
                  <span>18:00 (6 PM)</span>
                  <span>23:59 (11:59 PM)</span>
                </div>
              </div>

              {/* Triggered Result Preview Box */}
              <div className="p-5 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/40 flex items-start gap-4">
                <div
                  className={`p-3 rounded-xl bg-gradient-to-tr ${activeSlot.accent || "from-purple-600 to-indigo-600"} text-white`}
                >
                  {getSlotIcon(activeSlot.icon, "w-6 h-6")}
                </div>
                <div>
                  <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block">
                    Triggered Rule: {activeSlot.name}
                  </span>
                  <h4 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                    &quot;{activeGreeting}&quot;
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    {activeSubtitle}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 5: CODE & EXPORT SNIPPETS ─── */}
        {activeTab === "code" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-purple-600" />
                  Ready-to-Deploy Code & Template Generators
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Export copy-pasteable snippets with zero dependencies. Pre-wired for your custom slots and target timezone.
                </p>
              </div>

              <button
                onClick={() => handleCopy(generatedCode, "full-code")}
                className="self-start sm:self-auto px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                {copiedKey === "full-code" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                Copy Code
              </button>
            </div>

            {/* Language Sub-tabs */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl overflow-x-auto no-scrollbar">
              {[
                { id: "react", label: "React / Next.js Hook" },
                { id: "js", label: "Vanilla JavaScript" },
                { id: "html", label: "HTML/CSS Widget" },
                { id: "email", label: "Liquid / Klaviyo Email" },
                { id: "python", label: "Python Backend" },
                { id: "json", label: "JSON Config" }
              ].map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => setCodeType(lang.id)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                    codeType === lang.id
                      ? "bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-xs"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            {/* Code Block Container */}
            <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 text-slate-200 shadow-lg">
              <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800/80 bg-slate-900/60 text-xs text-slate-400">
                <span className="font-mono">{codeType.toUpperCase()} Snippet</span>
                <button
                  onClick={() => handleCopy(generatedCode, "code-block")}
                  className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  {copiedKey === "code-block" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>Copy</span>
                </button>
              </div>
              <pre className="p-5 text-xs font-mono overflow-x-auto leading-relaxed max-h-[500px]">
                <code>{generatedCode}</code>
              </pre>
            </div>
          </div>
        )}

        {/* ─── "MORE DATA" / COMPREHENSIVE EDUCATIONAL & REFERENCE SECTION ─── */}
        <div className="mt-16 space-y-12 border-t border-slate-200/80 dark:border-slate-800/80 pt-12">
          {/* Section 1: Strategic Impact & Feature Highlights */}
          <div className="space-y-4">
            <div className="text-center max-w-2xl mx-auto space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                User Experience & Psychological Resonance
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Why Dynamic Time Greetings Elevate Digital Products
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                A subtle, context-aware greeting transforms static web software into an intuitive, living workspace.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              {[
                {
                  title: "Humanized Connection",
                  desc: "Greeting users with time context creates an instant subconscious feeling of attention and hospitality, reducing immediate bounce rates.",
                  icon: Sparkles
                },
                {
                  title: "Target Timezone Precision",
                  desc: "Respects your recipient's physical location rather than arbitrary server time, eliminating awkward 'Good Morning' greetings sent at midnight.",
                  icon: Globe
                },
                {
                  title: "28% Higher Email CTR",
                  desc: "Newsletters and onboarding emails featuring recipient time-aware greetings consistently outperform generic 'Hello customer' salutations.",
                  icon: Mail
                },
                {
                  title: "Zero-Latency Client Math",
                  desc: "Calculations run natively in the browser via standard Intl APIs without making external API calls or tracking private IP locations.",
                  icon: Zap
                }
              ].map((card, idx) => {
                const Icon = card.icon;
                return (
                  <div
                    key={idx}
                    className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {card.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: 24-Hour Greeting Matrix Table */}
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Reference Guide
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                24-Hour Greeting Matrix & Business Etiquette
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Recommended phraseology across business hours, casual communication, and late-night scenarios.
              </p>
            </div>

            <div className="overflow-x-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Time Bracket</th>
                    <th className="py-3.5 px-4">Standard Hours</th>
                    <th className="py-3.5 px-4">Formal / Professional</th>
                    <th className="py-3.5 px-4">Casual / Friendly</th>
                    <th className="py-3.5 px-4 hidden lg:table-cell">Optimal Use Case</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-600 dark:text-slate-300">
                  {GREETING_MATRIX_DATA.map((row, i) => (
                    <tr key={i} className="hover:bg-purple-50/30 dark:hover:bg-purple-950/10 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        {row.bracket}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-purple-600 dark:text-purple-400">
                        {row.hours}
                      </td>
                      <td className="py-3.5 px-4">{row.formal}</td>
                      <td className="py-3.5 px-4">{row.casual}</td>
                      <td className="py-3.5 px-4 text-slate-400 hidden lg:table-cell">{row.bestFor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Next.js & SSR Hydration Blueprint */}
          <div className="bg-gradient-to-r from-purple-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
            <div className="flex items-center gap-2.5 text-purple-300 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Next.js Architecture Guide</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Solving Server vs Client Hydration Mismatches in Next.js
            </h2>
            <p className="text-xs sm:text-sm text-purple-200 leading-relaxed max-w-3xl">
              When rendering time greetings on a server (e.g. AWS/Vercel running in UTC), the server will generate a greeting for UTC while the client&apos;s device might be in Tokyo (+9) or New York (-4). If rendered directly into server HTML, React triggers a hydration error:
              <code className="text-xs bg-black/40 px-2 py-0.5 rounded text-amber-300 ml-1">
                Text content does not match server-rendered HTML
              </code>.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="bg-black/30 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-1.5">
                <h4 className="font-bold text-xs uppercase text-purple-300">
                  Approach 1: Client Mounting Guard (Recommended)
                </h4>
                <p className="text-xs text-purple-200 leading-relaxed">
                  Render a neutral fallback like &quot;Welcome back&quot; during SSR, and swap to the timezone greeting inside a <code className="text-white">useEffect</code> once the client mounts.
                </p>
              </div>

              <div className="bg-black/30 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-1.5">
                <h4 className="font-bold text-xs uppercase text-purple-300">
                  Approach 2: Cookie-Based SSR Timezone
                </h4>
                <p className="text-xs text-purple-200 leading-relaxed">
                  Store the user&apos;s timezone in an HTTP cookie upon their first visit. Read the cookie on the server in Next.js <code className="text-white">cookies()</code> to render matching HTML immediately.
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: Supported Variables Reference Table */}
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Template Tags
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Supported Template Placeholders & Variables
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Incorporate any of these placeholders into your greeting headlines, subtitles, or code templates.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { tag: "{name}", desc: "Recipient's name or placeholder (e.g. Alex)" },
                { tag: "{time}", desc: "Formatted local wall time (e.g. 02:45 PM)" },
                { tag: "{date}", desc: "Full localized date string (e.g. October 14, 2026)" },
                { tag: "{day}", desc: "Current day of the week (e.g. Wednesday)" },
                { tag: "{timezone}", desc: "Target IANA timezone ID (e.g. America/New_York)" },
                { tag: "{prefix}", desc: "Salutation prefix (e.g. Hey, Welcome, Dear)" },
                { tag: "{suffix}", desc: "Emoji or punctuation suffix (e.g. 👋, ✨)" },
                { tag: "{company}", desc: "Organization / Company name (e.g. ToolsTrek)" }
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs"
                >
                  <code className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-1.5 py-0.5 rounded">
                    {item.tag}
                  </code>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Real-World Industry Scenarios */}
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Implementation Scenarios
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Where Dynamic Time Greetings Create Value
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  title: "SaaS Dashboards & Team Workspaces",
                  desc: "Greet remote team members in Slack bots, Linear/Notion-style project boards, and CRM systems with accurate local time salutations.",
                  tag: "Productivity"
                },
                {
                  title: "E-Commerce Customer Portals",
                  desc: "Make account areas and order status pages feel tailored and personal when shoppers log in to check order tracking.",
                  tag: "E-Commerce"
                },
                {
                  title: "Personalized Email Marketing",
                  desc: "Serve morning promotions or evening reminders dynamically tailored to when subscribers open their newsletters in Klaviyo or Mailchimp.",
                  tag: "Marketing"
                },
                {
                  title: "Customer Support Chatbots",
                  desc: "Start Intercom or Zendesk chats with polite, time-sensitive opening messages that adapt automatically between morning and evening shifts.",
                  tag: "Support"
                },
                {
                  title: "Smart Office Signage & Kiosks",
                  desc: "Display welcoming lobby screens and conference room displays that adjust graphics and greetings automatically as the workday progresses.",
                  tag: "Hardware & IoT"
                },
                {
                  title: "Mobile App Onboarding",
                  desc: "Offer a warm first impression for first-time app users opening their app early in the morning or late at night.",
                  tag: "Mobile Apps"
                }
              ].map((useCase, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2"
                >
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                    {useCase.tag}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {useCase.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {useCase.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 6: Frequently Asked Questions (FAQ) Accordion */}
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                FAQ
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-purple-600" />
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-2.5">
              {FAQ_ITEMS.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 overflow-hidden shadow-xs"
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full text-left px-5 py-4 font-bold text-sm text-slate-800 dark:text-slate-200 hover:text-purple-600 dark:hover:text-purple-400 flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                          isOpen ? "rotate-180 text-purple-600" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-4 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 pt-3 animate-fadeIn">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Complementary Time & Productivity Utilities */}
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Connected Utilities
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Complementary Time & Planning Tools
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Streamline global scheduling, plan time-blocked days, and design custom calendars with these related tools.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  title: "World Timezone Clock",
                  link: "/tools/timezone-clock",
                  desc: "Track real-time clocks for multiple cities, compare time with an interactive meeting planner slider, and set local alarms.",
                  icon: Clock,
                  badge: "Popular"
                },
                {
                  title: "Custom Calendar Generator",
                  link: "/tools/calendar-generator",
                  desc: "Design and print high-res annual or monthly wall calendars with holidays, moon phases, and custom paper sizes.",
                  icon: Calendar,
                  badge: "Studio"
                },
                {
                  title: "Daily Planner Studio",
                  link: "/tools/daily-planner",
                  desc: "Hourly time-blocking planner with Eisenhower matrix, routine tracking, and Pomodoro focus ambient sounds.",
                  icon: Sliders,
                  badge: "Productivity"
                },
                {
                  title: "Time Unit Converter",
                  link: "/tools/time-converter",
                  desc: "Instantly convert milliseconds, seconds, minutes, hours, days, weeks, and months with high-precision accuracy.",
                  icon: ArrowRight,
                  badge: "Utility"
                }
              ].map((tool, i) => {
                const Icon = tool.icon;
                return (
                  <a
                    key={i}
                    href={tool.link}
                    className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-600 transition-all shadow-xs group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-purple-100 dark:group-hover:bg-purple-900 group-hover:text-purple-600 transition-colors">
                          {tool.badge}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {tool.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        {tool.desc}
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center gap-1 text-xs font-semibold text-purple-600 dark:text-purple-400">
                      <span>Explore tool</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Privacy & Zero-Tracking Guarantee Footer */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>
              100% Client-Side Computation: No IP lookups, zero server tracking, and all configuration settings stay strictly in your browser.
            </span>
          </div>
        </div>
      </div>
    </ToolPageShell>
  );
}
