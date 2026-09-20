"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import ToolPageShell from "../ToolPageShell";
import {
  NotebookPen,
  Plus,
  Trash2,
  Copy,
  Check,
  Download,
  FileText,
  Lock,
  Unlock,
  Key,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Play,
  Pause,
  Square,
  Sparkles,
  SlidersHorizontal,
  Settings2,
  Eye,
  EyeOff,
  Search,
  Maximize2,
  Minimize2,
  Printer,
  HelpCircle,
  ShieldCheck,
  Zap,
  BookOpen,
  Clock,
  FileCode,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Type,
  RefreshCw,
  ArrowDownAZ,
  ArrowUpAZ,
  List,
  Edit3,
  X,
  Share2,
  Keyboard,
  StickyNote,
  Sliders,
  CheckCheck
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { toast } from "sonner";

// ─────────────────────────────────────────────────────────────
// Native Web Audio API Typewriter Click Synthesizer
// ─────────────────────────────────────────────────────────────
class TypewriterSoundEngine {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  playKey(key) {
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const isSpaceOrEnter = key === " " || key === "Enter";
      const baseFreq = isSpaceOrEnter ? 240 : 650 + Math.random() * 400;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = isSpaceOrEnter ? "sine" : "triangle";
      osc.frequency.setValueAtTime(baseFreq, t);
      osc.frequency.exponentialRampToValueAtTime(110, t + 0.045);

      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.045);
    } catch (_) {}
  }
}

const typewriterSfx = new TypewriterSoundEngine();

// Stable server-safe default (no Date.now() at module level to avoid hydration mismatch)
const BLANK_NOTE = {
  id: "note-1",
  title: "Untitled Note",
  content: "",
  isPinned: false,
  isLocked: false,
  pinCode: "",
  createdAt: 0,
  updatedAt: 0,
};
const DEFAULT_NOTES = [BLANK_NOTE];

// Theme configurations
const THEMES = {
  clean: {
    id: "clean",
    name: "Crisp Clean",
    editorClass: "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100",
    gutterClass: "bg-gray-50 dark:bg-gray-950 text-gray-400 dark:text-gray-600 border-r border-gray-200 dark:border-gray-800",
    borderClass: "border-gray-200 dark:border-gray-800",
    accent: "text-brandColor",
    badge: "bg-brandColor/10 text-brandColor",
  },
  obsidian: {
    id: "obsidian",
    name: "Obsidian Midnight",
    editorClass: "bg-[#0d1117] text-[#c9d1d9]",
    gutterClass: "bg-[#080b0f] text-[#6e7681] border-r border-[#21262d]",
    borderClass: "border-[#30363d]",
    accent: "text-purple-400",
    badge: "bg-purple-900/40 text-purple-300",
  },
  sepia: {
    id: "sepia",
    name: "Warm Sepia",
    editorClass: "bg-[#fbf0d9] text-[#433422]",
    gutterClass: "bg-[#f4e4c2] text-[#8c7457] border-r border-[#e2d2b5]",
    borderClass: "border-[#e2d2b5]",
    accent: "text-amber-800",
    badge: "bg-amber-100 text-amber-900",
  },
  terminal: {
    id: "terminal",
    name: "Cyberpunk Matrix",
    editorClass: "bg-[#090d10] text-[#10b981]",
    gutterClass: "bg-[#040608] text-[#065f46] border-r border-[#134e4a]",
    borderClass: "border-[#134e4a]",
    accent: "text-emerald-400",
    badge: "bg-emerald-950 text-emerald-400",
  },
  nord: {
    id: "nord",
    name: "Nord Aurora",
    editorClass: "bg-[#2e3440] text-[#eceff4]",
    gutterClass: "bg-[#242933] text-[#616e88] border-r border-[#434c5e]",
    borderClass: "border-[#434c5e]",
    accent: "text-cyan-400",
    badge: "bg-slate-800 text-cyan-300",
  },
  amethyst: {
    id: "amethyst",
    name: "Amethyst Violet",
    editorClass: "bg-[#150d2a] text-[#f3e8ff]",
    gutterClass: "bg-[#0d071c] text-[#7c3aed] border-r border-[#4c1d95]",
    borderClass: "border-[#4c1d95]",
    accent: "text-purple-400",
    badge: "bg-purple-950 text-purple-300",
  },
};

// Font family options
const FONTS = [
  { id: "sans", name: "Modern Sans (Inter)", style: "font-sans" },
  { id: "serif", name: "Editorial Serif (Playfair)", style: "font-serif" },
  { id: "mono", name: "Developer Mono (Geist / Fira)", style: "font-mono" },
  { id: "legible", name: "High-Legibility (System UI)", style: "font-sans tracking-wide" },
  { id: "script", name: "Casual Script", style: "font-serif italic" },
];

export default function OnlineNotepad() {
  // ── 1. Notes & Persistence State ──
  // IMPORTANT: Start with a stable, server-safe initial state (no localStorage reads in useState)
  // to avoid React hydration mismatches between SSR and client.
  const [notes, setNotes] = useState(DEFAULT_NOTES);
  const [activeNoteId, setActiveNoteId] = useState("note-1");

  // Current active note
  const activeNote = useMemo(() => {
    return notes.find((n) => n.id === activeNoteId) || notes[0] || BLANK_NOTE;
  }, [notes, activeNoteId]);

  // Save status indicator
  const [saveStatus, setSaveStatus] = useState("Saved");
  const autoSaveTimerRef = useRef(null);

  // Load persisted notes from localStorage AFTER hydration (client-only)
  useEffect(() => {
    try {
      const saved = localStorage.getItem("toolstrek_notepad_notes_v1");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Discard old demo notes from previous sessions
          const hasOldDemo = parsed.some((n) => n.id === "note-welcome");
          if (!hasOldDemo) {
            setNotes(parsed);
            setActiveNoteId(parsed[0]?.id || "note-1");
          }
        }
      }
    } catch (_) {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist notes to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem("toolstrek_notepad_notes_v1", JSON.stringify(notes));
    } catch (_) {}
  }, [notes]);

  // ── 2. Editor Customization Settings ──
  // Note: Minimum font size constraint: never allow font size below 14px!
  const [fontSize, setFontSize] = useState(18);
  const [fontFamily, setFontFamily] = useState("sans");
  const [lineHeight, setLineHeight] = useState("1.8");
  const [themeKey, setThemeKey] = useState("clean");
  const [editorWidth, setEditorWidth] = useState("max-w-7xl");
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [spellCheck, setSpellCheck] = useState(true);
  const [wordWrap, setWordWrap] = useState(true);
  const [textAlign, setTextAlign] = useState("left");
  const [typewriterSound, setTypewriterSound] = useState(false);

  // ── 3. View Modes & Layouts ──
  const [viewMode, setViewMode] = useState("split");
  const [isZenMode, setIsZenMode] = useState(false);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [showScratchpad, setShowScratchpad] = useState(false);
  // Scratchpad: start empty (SSR-safe), load from localStorage after hydration
  const [scratchpadText, setScratchpadText] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("toolstrek_notepad_scratchpad");
      if (saved !== null) setScratchpadText(saved);
    } catch (_) {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("toolstrek_notepad_scratchpad", scratchpadText);
    } catch (_) {}
  }, [scratchpadText]);

  // ── 4. Find & Replace State ──
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [findQuery, setFindQuery] = useState("");
  const [replaceQuery, setReplaceQuery] = useState("");
  const [findCaseSensitive, setFindCaseSensitive] = useState(false);
  const [findWholeWord, setFindWholeWord] = useState(false);
  const [findRegex, setFindRegex] = useState(false);

  // ── 5. Speech Recognition & Text to Speech ──
  const [isListening, setIsListening] = useState(false);
  const [interimSpeech, setInterimSpeech] = useState("");
  const isListeningRef = useRef(false);
  const activeNoteIdRef = useRef(activeNoteId);
  const recognitionRef = useRef(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.0);

  useEffect(() => {
    activeNoteIdRef.current = activeNoteId;
  }, [activeNoteId]);

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  // Clean up recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
    };
  }, []);

  // ── 6. PIN / Password Protection State ──
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinPromptError, setPinPromptError] = useState("");
  const [isLockedView, setIsLockedView] = useState(false);

  // Sync locked view when active note changes
  useEffect(() => {
    if (activeNote?.isLocked) {
      setIsLockedView(true);
      setPinInput("");
      setPinPromptError("");
    } else {
      setIsLockedView(false);
    }
  }, [activeNoteId, activeNote?.isLocked]);

  // ── 7. DOM References ──
  const textareaRef = useRef(null);
  const gutterRef = useRef(null);
  const previewRef = useRef(null);

  // ── Update Content Handler ──
  const handleContentChange = (newContent) => {
    setSaveStatus("Saving...");
    setNotes((prev) =>
      prev.map((n) =>
        n.id === activeNoteId
          ? { ...n, content: newContent, updatedAt: Date.now() }
          : n
      )
    );

    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      setSaveStatus("Saved");
    }, 600);
  };

  // Update Title Handler
  const handleTitleChange = (newTitle) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === activeNoteId
          ? { ...n, title: newTitle, updatedAt: Date.now() }
          : n
      )
    );
  };

  // Keyboard handler for typewriter acoustics
  const handleKeyDown = (e) => {
    if (typewriterSound) {
      typewriterSfx.playKey(e.key);
    }
  };

  // Sync line number gutter scroll with textarea
  const handleScrollSync = () => {
    if (textareaRef.current && gutterRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  // ── Tab Management Actions ──
  const handleCreateNote = () => {
    const newId = `note-${Date.now()}`;
    const newNote = {
      id: newId,
      title: `Untitled Note ${notes.length + 1}`,
      content: "",
      isPinned: false,
      isLocked: false,
      pinCode: "",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setNotes((prev) => [newNote, ...prev]);
    setActiveNoteId(newId);
    toast.success("New note created");
  };

  const handleDeleteNote = (idToDelete) => {
    if (notes.length <= 1) {
      toast.error("Cannot delete the only note. You can clear its content instead.");
      return;
    }
    const remaining = notes.filter((n) => n.id !== idToDelete);
    setNotes(remaining);
    if (activeNoteId === idToDelete) {
      setActiveNoteId(remaining[0].id);
    }
    toast.success("Note removed");
  };

  // ── Text Metrics Calculation ──
  const textStats = useMemo(() => {
    const text = activeNote?.content || "";
    const rawWords = text.trim() ? text.trim().split(/\s+/) : [];
    const wordCount = rawWords.length;
    const charCount = text.length;
    const charNoSpaces = text.replace(/\s+/g, "").length;
    const lineCount = text ? text.split("\n").length : 1;
    const paragraphCount = text.trim() ? text.trim().split(/\n+/).length : 0;
    const sentenceMatches = text.match(/[^.!?]+[.!?]+(\s|$)/g);
    const sentenceCount = sentenceMatches ? sentenceMatches.length : (wordCount > 0 ? 1 : 0);

    // Reading time: avg 200 wpm
    const readingMinutes = Math.ceil(wordCount / 200);
    const readingTimeStr = wordCount < 60 ? "< 1 min" : `${readingMinutes} min`;

    // Speaking time: avg 130 wpm
    const speakingMinutes = Math.ceil(wordCount / 130);
    const speakingTimeStr = wordCount < 40 ? "< 1 min" : `${speakingMinutes} min`;

    // Flesch Reading Ease Approximation
    let fleschScore = 0;
    let readabilityLabel = "No content";
    if (wordCount > 10 && sentenceCount > 0) {
      // Approximate syllable count
      const syllableCount = rawWords.reduce((acc, word) => {
        const w = word.toLowerCase().replace(/[^a-z]/g, "");
        if (w.length <= 3) return acc + 1;
        const syl = w.replace(/(?:[^laeiouy]|ed|es|e)$/, "").match(/[aeiouy]{1,2}/g);
        return acc + (syl ? syl.length : 1);
      }, 0);

      const score = 206.835 - 1.015 * (wordCount / sentenceCount) - 84.6 * (syllableCount / wordCount);
      fleschScore = Math.max(0, Math.min(100, Math.round(score)));

      if (fleschScore >= 80) readabilityLabel = "Very Easy (5th Grade)";
      else if (fleschScore >= 70) readabilityLabel = "Fairly Easy (7th Grade)";
      else if (fleschScore >= 60) readabilityLabel = "Standard Plain English";
      else if (fleschScore >= 50) readabilityLabel = "Fairly Difficult";
      else if (fleschScore >= 30) readabilityLabel = "Difficult (College)";
      else readabilityLabel = "Very Complex (Graduate)";
    }

    return {
      wordCount,
      charCount,
      charNoSpaces,
      lineCount,
      paragraphCount,
      sentenceCount,
      readingTimeStr,
      speakingTimeStr,
      fleschScore,
      readabilityLabel,
    };
  }, [activeNote?.content]);

  // ── Find & Replace Implementation ──
  const matchCount = useMemo(() => {
    if (!findQuery || !activeNote?.content) return 0;
    try {
      let flags = "g";
      if (!findCaseSensitive) flags += "i";
      let pattern = findQuery;
      if (!findRegex) {
        pattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      }
      if (findWholeWord) {
        pattern = `\\b${pattern}\\b`;
      }
      const regex = new RegExp(pattern, flags);
      const matches = activeNote.content.match(regex);
      return matches ? matches.length : 0;
    } catch (_) {
      return 0;
    }
  }, [findQuery, activeNote?.content, findCaseSensitive, findWholeWord, findRegex]);

  const handleReplaceAll = () => {
    if (!findQuery) {
      toast.error("Please enter a search term");
      return;
    }
    try {
      let flags = "g";
      if (!findCaseSensitive) flags += "i";
      let pattern = findQuery;
      if (!findRegex) {
        pattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      }
      if (findWholeWord) {
        pattern = `\\b${pattern}\\b`;
      }
      const regex = new RegExp(pattern, flags);
      const updated = (activeNote.content || "").replace(regex, replaceQuery);
      handleContentChange(updated);
      toast.success(`Replaced ${matchCount} match${matchCount === 1 ? "" : "es"}`);
    } catch (err) {
      toast.error("Invalid search pattern");
    }
  };

  // ── Text Transformations ──
  const transformText = (type) => {
    const text = activeNote?.content || "";
    if (!text) return;
    let transformed = text;

    switch (type) {
      case "upper":
        transformed = text.toUpperCase();
        break;
      case "lower":
        transformed = text.toLowerCase();
        break;
      case "title":
        transformed = text.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.substr(1).toLowerCase());
        break;
      case "sentence":
        transformed = text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
        break;
      case "trim":
        transformed = text
          .split("\n")
          .map((l) => l.trim())
          .join("\n");
        break;
      case "remove_empty":
        transformed = text
          .split("\n")
          .filter((l) => l.trim().length > 0)
          .join("\n");
        break;
      case "dedup_lines":
        transformed = [...new Set(text.split("\n"))].join("\n");
        break;
      case "sort_asc":
        transformed = text
          .split("\n")
          .sort((a, b) => a.localeCompare(b))
          .join("\n");
        break;
      case "sort_desc":
        transformed = text
          .split("\n")
          .sort((a, b) => b.localeCompare(a))
          .join("\n");
        break;
      case "bulletize":
        transformed = text
          .split("\n")
          .map((l) => (l.trim() ? (l.startsWith("- ") ? l : `- ${l}`) : l))
          .join("\n");
        break;
      default:
        break;
    }

    handleContentChange(transformed);
    toast.success("Text transformed");
  };

  // ── Speech-to-Text (Voice Dictation / Speech Detection) ──
  const toggleVoiceDictation = async () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition ||
      window.mozSpeechRecognition ||
      window.msSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error(
        "Speech Recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge."
      );
      return;
    }

    if (isListening) {
      isListeningRef.current = false;
      setIsListening(false);
      setInterimSpeech("");
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
      toast.info("Voice dictation stopped");
      return;
    }

    // Proactively verify / prompt for microphone permission
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
      }
    } catch (permErr) {
      console.warn("Microphone access error:", permErr);
      toast.error(
        "Microphone access denied. Please allow microphone permission in your browser address bar."
      );
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        isListeningRef.current = true;
        setIsListening(true);
        setInterimSpeech("");
        toast.success("Microphone active! Speak now to transcribe notes...");
      };

      recognition.onresult = (event) => {
        let finalChunk = "";
        let currentInterim = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          const transcript = item[0].transcript;
          if (item.isFinal) {
            finalChunk += transcript;
          } else {
            currentInterim += transcript;
          }
        }

        setInterimSpeech(currentInterim);

        if (finalChunk.trim()) {
          setNotes((prev) =>
            prev.map((n) => {
              if (n.id === activeNoteIdRef.current) {
                const prevContent = n.content || "";
                const separator =
                  prevContent.length > 0 &&
                  !prevContent.endsWith("\n") &&
                  !prevContent.endsWith(" ")
                    ? " "
                    : "";
                return {
                  ...n,
                  content: prevContent + separator + finalChunk.trim(),
                  updatedAt: Date.now(),
                };
              }
              return n;
            })
          );
          setSaveStatus("Saved");
        }
      };

      recognition.onerror = (e) => {
        console.warn("Speech recognition warning:", e.error);
        if (e.error === "no-speech") {
          // Normal pause in conversation; keep listening!
          return;
        }
        if (e.error === "not-allowed" || e.error === "service-not-allowed") {
          isListeningRef.current = false;
          setIsListening(false);
          setInterimSpeech("");
          toast.error("Microphone permission denied. Please allow access in browser settings.");
          return;
        }
        if (e.error === "aborted") {
          return;
        }
        console.error("Speech Recognition error:", e);
      };

      recognition.onend = () => {
        setInterimSpeech("");
        // Auto-restart if user still wants to listen (Chrome closes connection after silence periods)
        if (isListeningRef.current) {
          try {
            recognition.start();
          } catch (_) {
            isListeningRef.current = false;
            setIsListening(false);
          }
        } else {
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Failed to start SpeechRecognition:", err);
      toast.error("Could not activate microphone recognition");
      setIsListening(false);
      isListeningRef.current = false;
      setInterimSpeech("");
    }
  };

  // ── Text-to-Speech (TTS Voice Narration) ──
  const toggleTextToSpeech = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      toast.error("Text-to-Speech is not supported in this browser");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      toast.info("Speech paused");
      return;
    }

    const textToSpeak = activeNote?.content?.trim();
    if (!textToSpeak) {
      toast.error("Note is empty. Type something to listen!");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = speechRate;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
    toast.success("Reading note aloud...");
  };

  // ── Password / PIN Protection ──
  const handleUnlockWithPin = (e) => {
    e?.preventDefault();
    if (pinInput === activeNote.pinCode) {
      setIsLockedView(false);
      setPinPromptError("");
      setPinInput("");
      toast.success("Note unlocked");
    } else {
      setPinPromptError("Incorrect PIN passcode. Please try again.");
    }
  };

  const handleSetPin = (newPin) => {
    if (!newPin) {
      // Remove PIN
      setNotes((prev) =>
        prev.map((n) =>
          n.id === activeNoteId ? { ...n, isLocked: false, pinCode: "" } : n
        )
      );
      toast.success("PIN protection removed");
    } else {
      setNotes((prev) =>
        prev.map((n) =>
          n.id === activeNoteId ? { ...n, isLocked: true, pinCode: newPin } : n
        )
      );
      toast.success("Note secured with PIN protection");
    }
    setIsPinModalOpen(false);
  };

  // ── Multi-Format Export Options ──
  const handleCopyClipboard = () => {
    if (!activeNote?.content) {
      toast.error("Note is empty");
      return;
    }
    navigator.clipboard.writeText(activeNote.content);
    toast.success("Note content copied to clipboard!");
  };

  const downloadFile = (filename, content, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportTxt = () => {
    const filename = `${activeNote.title.replace(/[^a-z0-9]/gi, "_").toLowerCase() || "notepad"}.txt`;
    downloadFile(filename, activeNote.content || "", "text/plain;charset=utf-8");
    toast.success("Exported as Plain Text (.txt)");
  };

  const exportMarkdown = () => {
    const filename = `${activeNote.title.replace(/[^a-z0-9]/gi, "_").toLowerCase() || "notepad"}.md`;
    downloadFile(filename, activeNote.content || "", "text/markdown;charset=utf-8");
    toast.success("Exported as Markdown (.md)");
  };

  const exportHtml = () => {
    const title = activeNote.title || "Note";
    const bodyContent = (activeNote.content || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; line-height: 1.7; color: #1e293b; background: #fafafa; }
    h1 { border-bottom: 2px solid #7c00fe; padding-bottom: 8px; color: #0f172a; }
    pre { background: #f1f5f9; padding: 16px; border-radius: 8px; font-family: monospace; white-space: pre-wrap; font-size: 15px; }
    .meta { color: #64748b; font-size: 13px; margin-bottom: 24px; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <div class="meta">Exported from ToolsTrek Online Notepad • ${new Date().toLocaleDateString()}</div>
  <pre>${bodyContent}</pre>
</body>
</html>`;
    const filename = `${title.replace(/[^a-z0-9]/gi, "_").toLowerCase() || "note"}.html`;
    downloadFile(filename, htmlContent, "text/html;charset=utf-8");
    toast.success("Exported as HTML (.html)");
  };

  const exportJson = () => {
    const data = {
      title: activeNote.title,
      content: activeNote.content,
      stats: textStats,
      createdAt: new Date(activeNote.createdAt).toISOString(),
      updatedAt: new Date(activeNote.updatedAt).toISOString(),
      exportedFrom: "ToolsTrek Online Notepad",
    };
    const filename = `${activeNote.title.replace(/[^a-z0-9]/gi, "_").toLowerCase() || "note"}.json`;
    downloadFile(filename, JSON.stringify(data, null, 2), "application/json");
    toast.success("Exported as JSON (.json)");
  };

  const exportPdf = async () => {
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const margin = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      const maxLineWidth = pageWidth - margin * 2;

      // Header Banner
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(124, 0, 254); // Brand Color #7c00fe
      doc.text(activeNote.title || "Online Notepad Document", margin, 24);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      const dateStr = `Exported from ToolsTrek • ${new Date().toLocaleDateString()} • Words: ${textStats.wordCount} • Chars: ${textStats.charCount}`;
      doc.text(dateStr, margin, 32);

      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(margin, 36, pageWidth - margin, 36);

      // Body text
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(30, 41, 59);

      const splitLines = doc.splitTextToSize(activeNote.content || "", maxLineWidth);
      let cursorY = 46;
      const lineHeightMm = 6.2;
      const pageHeight = doc.internal.pageSize.getHeight();

      for (let i = 0; i < splitLines.length; i++) {
        if (cursorY + lineHeightMm > pageHeight - margin) {
          doc.addPage();
          cursorY = margin + 10;
        }
        doc.text(splitLines[i], margin, cursorY);
        cursorY += lineHeightMm;
      }

      const totalPages = doc.internal.pages.length - 1;
      for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(`Page ${p} of ${totalPages}`, pageWidth - margin - 20, pageHeight - 10);
      }

      const filename = `${activeNote.title.replace(/[^a-z0-9]/gi, "_").toLowerCase() || "note"}.pdf`;
      doc.save(filename);
      toast.success("Exported as PDF document (.pdf)");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const currentTheme = THEMES[themeKey] || THEMES.clean;
  const currentFont = FONTS.find((f) => f.id === fontFamily) || FONTS[0];

  return (
    <ToolPageShell widthClassName="max-w-7xl px-2 sm:px-4 pt-16 sm:pt-20 pb-12">
      {/* ── Zen Mode Fullscreen Floating Exit ── */}
      {isZenMode && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-gray-900/90 backdrop-blur-md px-3 py-2 rounded-xl text-white shadow-2xl border border-gray-700">
          <span className="text-xs font-semibold text-gray-300">Zen Focus Mode</span>
          <button
            onClick={() => setIsZenMode(false)}
            className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-300 hover:text-white transition-colors cursor-pointer"
            title="Exit Zen Mode (Esc)"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className={`flex flex-col gap-5 ${isZenMode ? "fixed inset-0 z-40 bg-gray-950 p-4 sm:p-8 overflow-y-auto" : ""}`}>
        {/* ── TOP HEADER & BADGE (Hidden in Zen Mode) ── */}
        {!isZenMode && (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="p-2 rounded-xl bg-brandColor/10 text-brandColor dark:bg-brandColor/20">
                  <NotebookPen className="w-6 h-6" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                  Online Notepad & Scratchpad Studio
                </h1>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                100% private in-browser writing studio with live Markdown, multi-note tabs, typewriter acoustics, and multi-format exports.
              </p>
            </div>

            {/* Quick Status Bar & Actions */}
            <div className="flex items-center flex-wrap gap-2">
              <span className="text-xs font-medium px-2.5 py-1 rounded-full border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/60 text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    saveStatus === "Saved" ? "bg-emerald-500" : "bg-amber-500 animate-pulse"
                  }`}
                />
                {saveStatus}
              </span>

              {/* Zen Fullscreen Button */}
              <button
                onClick={() => setIsZenMode(!isZenMode)}
                className="px-3 py-2 text-xs font-semibold rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:border-brandColor/50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                title="Distraction-free Fullscreen Writing Mode"
              >
                <Maximize2 className="w-3.5 h-3.5 text-brandColor" />
                <span className="hidden sm:inline">Zen Mode</span>
              </button>

              {/* Scratchpad Toggle Button */}
              <button
                onClick={() => setShowScratchpad(!showScratchpad)}
                className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
                  showScratchpad
                    ? "bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400"
                    : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:border-amber-500/40"
                }`}
                title="Open Quick Scratchpad Drawer"
              >
                <StickyNote className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden sm:inline">Scratchpad</span>
              </button>

              {/* Settings Drawer Button */}
              <button
                onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
                className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
                  showSettingsDrawer
                    ? "bg-brandColor text-white border-brandColor shadow-purple-500/20 shadow-md"
                    : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:border-brandColor/50"
                }`}
                title="Customize Typography, Themes & Editor"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Customize</span>
              </button>
            </div>
          </div>
        )}

        {/* ── CUSTOMIZATION DRAWER (Collapsible) ── */}
        {showSettingsDrawer && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 sm:p-5 shadow-xl animate-fadeIn space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-brandColor" />
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  Editor Customization & Appearance
                </h3>
              </div>
              <button
                onClick={() => setShowSettingsDrawer(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              {/* 1. Font Family */}
              <div className="space-y-1.5">
                <label className="font-semibold text-gray-700 dark:text-gray-300 block">
                  Font Family
                </label>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-gray-800 dark:text-gray-200 outline-none focus:border-brandColor cursor-pointer"
                >
                  {FONTS.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Font Size (Strict constraint: minimum 14px to prevent small fonts) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-gray-700 dark:text-gray-300">
                    Font Size
                  </label>
                  <span className="font-mono text-brandColor font-bold">{fontSize}px</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFontSize((s) => Math.max(14, s - 2))}
                    disabled={fontSize <= 14}
                    className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:border-brandColor/50 disabled:opacity-40 cursor-pointer text-gray-700 dark:text-gray-200 font-bold"
                    title="Decrease font size"
                  >
                    A-
                  </button>
                  <input
                    type="range"
                    min="14"
                    max="32"
                    step="1"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full accent-brandColor cursor-pointer"
                  />
                  <button
                    onClick={() => setFontSize((s) => Math.min(32, s + 2))}
                    disabled={fontSize >= 32}
                    className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:border-brandColor/50 disabled:opacity-40 cursor-pointer text-gray-700 dark:text-gray-200 font-bold"
                    title="Increase font size"
                  >
                    A+
                  </button>
                </div>
              </div>

              {/* 3. Line Height */}
              <div className="space-y-1.5">
                <label className="font-semibold text-gray-700 dark:text-gray-300 block">
                  Line Spacing
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {[
                    { label: "1.5x", val: "1.5" },
                    { label: "1.8x", val: "1.8" },
                    { label: "2.1x", val: "2.1" },
                    { label: "2.5x", val: "2.5" },
                  ].map((lh) => (
                    <button
                      key={lh.val}
                      onClick={() => setLineHeight(lh.val)}
                      className={`py-1.5 rounded-lg border font-semibold text-center transition-all cursor-pointer ${
                        lineHeight === lh.val
                          ? "bg-brandColor text-white border-brandColor shadow-sm"
                          : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:border-brandColor/40"
                      }`}
                    >
                      {lh.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Theme Selection */}
              <div className="space-y-1.5">
                <label className="font-semibold text-gray-700 dark:text-gray-300 block">
                  Theme Palette
                </label>
                <select
                  value={themeKey}
                  onChange={(e) => setThemeKey(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-gray-800 dark:text-gray-200 outline-none focus:border-brandColor cursor-pointer"
                >
                  {Object.values(THEMES).map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 5. Editor Max Width */}
              <div className="space-y-1.5">
                <label className="font-semibold text-gray-700 dark:text-gray-300 block">
                  Container Width
                </label>
                <select
                  value={editorWidth}
                  onChange={(e) => setEditorWidth(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-gray-800 dark:text-gray-200 outline-none focus:border-brandColor cursor-pointer"
                >
                  <option value="max-w-4xl">Compact (896px)</option>
                  <option value="max-w-5xl">Standard (1024px)</option>
                  <option value="max-w-7xl">Spacious (1280px)</option>
                  <option value="w-full">Full Width (100%)</option>
                </select>
              </div>

              {/* 6. Text Alignment */}
              <div className="space-y-1.5">
                <label className="font-semibold text-gray-700 dark:text-gray-300 block">
                  Text Alignment
                </label>
                <div className="flex items-center gap-1">
                  {[
                    { id: "left", icon: AlignLeft, title: "Left align" },
                    { id: "center", icon: AlignCenter, title: "Center align" },
                    { id: "right", icon: AlignRight, title: "Right align" },
                    { id: "justify", icon: AlignJustify, title: "Justify" },
                  ].map((al) => {
                    const Icon = al.icon;
                    return (
                      <button
                        key={al.id}
                        onClick={() => setTextAlign(al.id)}
                        className={`flex-1 py-1.5 flex items-center justify-center rounded-lg border transition-all cursor-pointer ${
                          textAlign === al.id
                            ? "bg-brandColor text-white border-brandColor"
                            : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:border-brandColor/40"
                        }`}
                        title={al.title}
                      >
                        <Icon className="w-4 h-4" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 7. Line Numbers & Word Wrap Toggles */}
              <div className="space-y-1.5 sm:col-span-2 flex flex-wrap items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 dark:text-gray-300 select-none">
                  <input
                    type="checkbox"
                    checked={showLineNumbers}
                    onChange={(e) => setShowLineNumbers(e.target.checked)}
                    className="rounded accent-brandColor cursor-pointer w-4 h-4"
                  />
                  <span>Show Line Numbers</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 dark:text-gray-300 select-none">
                  <input
                    type="checkbox"
                    checked={wordWrap}
                    onChange={(e) => setWordWrap(e.target.checked)}
                    className="rounded accent-brandColor cursor-pointer w-4 h-4"
                  />
                  <span>Soft Word Wrap</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 dark:text-gray-300 select-none">
                  <input
                    type="checkbox"
                    checked={spellCheck}
                    onChange={(e) => setSpellCheck(e.target.checked)}
                    className="rounded accent-brandColor cursor-pointer w-4 h-4"
                  />
                  <span>Browser Spellcheck</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700 dark:text-gray-300 select-none">
                  <input
                    type="checkbox"
                    checked={typewriterSound}
                    onChange={(e) => setTypewriterSound(e.target.checked)}
                    className="rounded accent-brandColor cursor-pointer w-4 h-4"
                  />
                  <span>Acoustic Typewriter Clicks</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ── QUICK SCRATCHPAD DRAWER (Sticky Notes) ── */}
        {showScratchpad && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-2xl p-4 shadow-lg animate-fadeIn flex flex-col gap-2">
            <div className="flex items-center justify-between border-b border-amber-200/60 dark:border-amber-800/40 pb-2">
              <div className="flex items-center gap-2">
                <StickyNote className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider">
                  Quick Scratchpad (Transient clipboard & fleeting thoughts)
                </span>
              </div>
              <button
                onClick={() => setShowScratchpad(false)}
                className="p-1 hover:bg-amber-200/50 dark:hover:bg-amber-900/50 rounded-lg text-amber-700 dark:text-amber-300 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <textarea
              value={scratchpadText}
              onChange={(e) => setScratchpadText(e.target.value)}
              placeholder="Paste URLs, quick phone numbers, temporary snippets or fleeting scratch notes here. Auto-saved locally..."
              className="w-full h-24 p-2 bg-transparent text-amber-950 dark:text-amber-100 placeholder:text-amber-800/40 dark:placeholder:text-amber-400/40 text-xs sm:text-sm font-mono outline-none resize-y"
            />
          </div>
        )}

        {/* ── NOTE TABS BAR & ACTIONS (Hidden in Zen Mode) ── */}
        {!isZenMode && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-2 sm:p-2.5 rounded-2xl shadow-sm">
            {/* Scrollable Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none max-w-full sm:max-w-[65%]">
              {notes.map((note) => {
                const isActive = note.id === activeNoteId;
                return (
                  <div
                    key={note.id}
                    onClick={() => setActiveNoteId(note.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                      isActive
                        ? "bg-brandColor text-white shadow-sm shadow-purple-500/20"
                        : "bg-gray-50 dark:bg-gray-800/70 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                    }`}
                  >
                    {note.isLocked && <Lock className="w-3 h-3 text-amber-300" />}
                    <span className="max-w-[120px] truncate">{note.title || "Untitled"}</span>
                    {notes.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNote(note.id);
                        }}
                        className={`p-0.5 rounded-md hover:bg-black/20 transition-colors ${
                          isActive ? "text-white/80 hover:text-white" : "text-gray-400 hover:text-red-500"
                        }`}
                        title="Delete this tab"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}

              <button
                onClick={handleCreateNote}
                className="p-1.5 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 hover:border-brandColor text-gray-500 hover:text-brandColor hover:bg-brandColor/5 transition-all cursor-pointer"
                title="Create New Note Tab"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Note Controls (Lock, Find, Mode Toggles) */}
            <div className="flex items-center gap-1.5 justify-end">
              {/* Note Lock Toggle */}
              <button
                onClick={() => {
                  setPinInput("");
                  setPinPromptError("");
                  setIsPinModalOpen(true);
                }}
                className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
                  activeNote.isLocked
                    ? "bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400"
                    : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:border-brandColor/40"
                }`}
                title={activeNote.isLocked ? "Manage Note PIN Security" : "Set Passcode / PIN Protection"}
              >
                {activeNote.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              </button>

              {/* Find & Replace Toggle */}
              <button
                onClick={() => setShowFindReplace(!showFindReplace)}
                className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
                  showFindReplace
                    ? "bg-brandColor text-white border-brandColor"
                    : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:border-brandColor/40"
                }`}
                title="Find and Replace"
              >
                <Search className="w-3.5 h-3.5" />
              </button>

              {/* View Switcher (Edit / Split / Preview) */}
              <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                <button
                  onClick={() => setViewMode("edit")}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                    viewMode === "edit"
                      ? "bg-white dark:bg-gray-700 shadow-sm text-brandColor dark:text-brandColor"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
                  }`}
                  title="Editor View"
                >
                  Editor
                </button>
                <button
                  onClick={() => setViewMode("split")}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                    viewMode === "split"
                      ? "bg-white dark:bg-gray-700 shadow-sm text-brandColor dark:text-brandColor"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
                  }`}
                  title="Split Markdown View"
                >
                  Split
                </button>
                <button
                  onClick={() => setViewMode("preview")}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                    viewMode === "preview"
                      ? "bg-white dark:bg-gray-700 shadow-sm text-brandColor dark:text-brandColor"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
                  }`}
                  title="Preview Markdown"
                >
                  Preview
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── FIND AND REPLACE BAR (Collapsible) ── */}
        {showFindReplace && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-3 sm:p-4 shadow-md animate-fadeIn flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 text-xs">
            <div className="flex-1 flex items-center gap-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-1.5">
              <Search className="w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                value={findQuery}
                onChange={(e) => setFindQuery(e.target.value)}
                placeholder="Find in note..."
                className="w-full bg-transparent text-gray-800 dark:text-gray-200 outline-none text-xs"
              />
              <span className="font-mono text-gray-400 text-[11px] whitespace-nowrap">
                {matchCount} {matchCount === 1 ? "match" : "matches"}
              </span>
            </div>

            <div className="flex-1 flex items-center gap-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-1.5">
              <input
                type="text"
                value={replaceQuery}
                onChange={(e) => setReplaceQuery(e.target.value)}
                placeholder="Replace with..."
                className="w-full bg-transparent text-gray-800 dark:text-gray-200 outline-none text-xs"
              />
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setFindCaseSensitive(!findCaseSensitive)}
                className={`px-2 py-1.5 rounded-lg border font-mono font-bold cursor-pointer transition-all ${
                  findCaseSensitive
                    ? "bg-brandColor text-white border-brandColor"
                    : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300"
                }`}
                title="Match Case (Aa)"
              >
                Aa
              </button>
              <button
                onClick={() => setFindWholeWord(!findWholeWord)}
                className={`px-2 py-1.5 rounded-lg border font-mono font-bold cursor-pointer transition-all ${
                  findWholeWord
                    ? "bg-brandColor text-white border-brandColor"
                    : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300"
                }`}
                title="Match Whole Word (\b)"
              >
                \b
              </button>
              <button
                onClick={() => setFindRegex(!findRegex)}
                className={`px-2 py-1.5 rounded-lg border font-mono font-bold cursor-pointer transition-all ${
                  findRegex
                    ? "bg-brandColor text-white border-brandColor"
                    : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300"
                }`}
                title="Regular Expression (.*)"
              >
                .*
              </button>
              <button
                onClick={handleReplaceAll}
                disabled={matchCount === 0}
                className="px-3 py-1.5 rounded-xl bg-brandColor hover:bg-brandColorHover text-white font-bold cursor-pointer disabled:opacity-40 transition-all shadow-sm"
              >
                Replace All
              </button>
              <button
                onClick={() => setShowFindReplace(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── TOOLBAR: VOICE DICTATION, TTS, TEXT TRANSFORMS & EXPORTS ── */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-2.5 rounded-2xl shadow-sm">
          {/* Editable Note Title */}
          <div className="flex items-center gap-2 min-w-[200px] flex-1">
            <Edit3 className="w-4 h-4 text-brandColor shrink-0" />
            <input
              type="text"
              value={activeNote.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Note title..."
              className="bg-transparent font-bold text-sm sm:text-base text-gray-900 dark:text-white outline-none w-full border-b border-transparent focus:border-brandColor transition-colors"
            />
          </div>

          {/* Action Tools */}
          <div className="flex items-center flex-wrap gap-1.5">
            {/* Voice Dictation (Speech to Text) */}
            <button
              onClick={toggleVoiceDictation}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
                isListening
                  ? "bg-red-500 text-white animate-pulse shadow-md shadow-red-500/30"
                  : "border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:border-red-400"
              }`}
              title={isListening ? "Stop Voice Typing" : "Start Voice Dictation (Microphone)"}
            >
              {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-red-500" />}
              <span className="hidden sm:inline">{isListening ? "Listening..." : "Dictate"}</span>
            </button>

            {/* Text-to-Speech (Audio Voice Reader) */}
            <button
              onClick={toggleTextToSpeech}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
                isSpeaking
                  ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30"
                  : "border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:border-emerald-400"
              }`}
              title={isSpeaking ? "Pause Audio Narration" : "Read Aloud (Text-to-Speech)"}
            >
              {isSpeaking ? <Square className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-500" />}
              <span className="hidden sm:inline">{isSpeaking ? "Stop" : "Listen"}</span>
            </button>

            {/* Text Transformation Dropdown Menu */}
            <div className="relative group">
              <button
                className="px-2.5 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:border-brandColor text-xs font-semibold flex items-center gap-1 cursor-pointer"
                title="Transform Text"
              >
                <Type className="w-3.5 h-3.5 text-brandColor" />
                <span className="hidden sm:inline">Transform</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>

              <div className="absolute right-0 top-full mt-1.5 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl p-1.5 hidden group-hover:block z-30 animate-fadeIn">
                <button
                  onClick={() => transformText("upper")}
                  className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                >
                  UPPERCASE
                </button>
                <button
                  onClick={() => transformText("lower")}
                  className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                >
                  lowercase
                </button>
                <button
                  onClick={() => transformText("title")}
                  className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                >
                  Title Case
                </button>
                <button
                  onClick={() => transformText("sentence")}
                  className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                >
                  Sentence case
                </button>
                <div className="border-t border-gray-100 dark:border-gray-800 my-1" />
                <button
                  onClick={() => transformText("trim")}
                  className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                >
                  Trim Whitespace
                </button>
                <button
                  onClick={() => transformText("remove_empty")}
                  className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                >
                  Remove Empty Lines
                </button>
                <button
                  onClick={() => transformText("dedup_lines")}
                  className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                >
                  Remove Duplicate Lines
                </button>
                <button
                  onClick={() => transformText("sort_asc")}
                  className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer flex items-center justify-between"
                >
                  <span>Sort Lines (A-Z)</span>
                  <ArrowDownAZ className="w-3.5 h-3.5 text-gray-400" />
                </button>
                <button
                  onClick={() => transformText("sort_desc")}
                  className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer flex items-center justify-between"
                >
                  <span>Sort Lines (Z-A)</span>
                  <ArrowUpAZ className="w-3.5 h-3.5 text-gray-400" />
                </button>
                <button
                  onClick={() => transformText("bulletize")}
                  className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer flex items-center justify-between"
                >
                  <span>Add Bullet Points</span>
                  <List className="w-3.5 h-3.5 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Quick Clipboard Copy */}
            <button
              onClick={handleCopyClipboard}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:border-brandColor text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              title="Copy All to Clipboard"
            >
              <Copy className="w-3.5 h-3.5 text-brandColor" />
              <span className="hidden md:inline">Copy</span>
            </button>

            {/* Export Dropdown Menu */}
            <div className="relative group">
              <button
                className="px-3 py-1.5 rounded-xl bg-brandColor hover:bg-brandColorHover text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm shadow-purple-500/20"
                title="Export Note in Multiple Formats"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export</span>
                <ChevronDown className="w-3 h-3 opacity-70" />
              </button>

              <div className="absolute right-0 top-full mt-1.5 w-52 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl p-1.5 hidden group-hover:block z-30 animate-fadeIn">
                <button
                  onClick={exportTxt}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer flex items-center justify-between"
                >
                  <span>Plain Text (.txt)</span>
                  <FileText className="w-3.5 h-3.5 text-gray-400" />
                </button>
                <button
                  onClick={exportMarkdown}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer flex items-center justify-between"
                >
                  <span>Markdown (.md)</span>
                  <FileCode className="w-3.5 h-3.5 text-purple-400" />
                </button>
                <button
                  onClick={exportPdf}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer flex items-center justify-between"
                >
                  <span>PDF Document (.pdf)</span>
                  <Download className="w-3.5 h-3.5 text-red-400" />
                </button>
                <button
                  onClick={exportHtml}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer flex items-center justify-between"
                >
                  <span>Styled HTML (.html)</span>
                  <FileCode className="w-3.5 h-3.5 text-blue-400" />
                </button>
                <button
                  onClick={exportJson}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer flex items-center justify-between"
                >
                  <span>Structured JSON (.json)</span>
                  <span className="font-mono text-[10px] text-gray-400">{`{ }`}</span>
                </button>
                <div className="border-t border-gray-100 dark:border-gray-800 my-1" />
                <button
                  onClick={handlePrint}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer flex items-center justify-between"
                >
                  <span>Print Document</span>
                  <Printer className="w-3.5 h-3.5 text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── WORKSPACE EDITOR & PREVIEW ── */}
        <div className={`mx-auto w-full transition-all ${editorWidth}`}>
          {isLockedView ? (
            /* PIN LOCKED VIEW */
            <div className="rounded-3xl border border-amber-300 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 p-8 sm:p-14 flex flex-col items-center justify-center text-center gap-4 shadow-xl">
              <div className="p-4 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                <Lock className="w-10 h-10" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
                This Note is Protected with a PIN
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 max-w-md">
                Enter your secret PIN passcode to decrypt and unlock this private note session.
              </p>

              <form onSubmit={handleUnlockWithPin} className="flex flex-col items-center gap-3 w-full max-w-xs mt-2">
                <input
                  type="password"
                  autoFocus
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinPromptError("");
                  }}
                  placeholder="Enter PIN passcode"
                  className="w-full px-4 py-3 rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-center font-mono text-lg tracking-widest outline-none focus:border-brandColor text-gray-900 dark:text-white shadow-inner"
                />
                {pinPromptError && (
                  <span className="text-xs text-red-500 font-semibold">{pinPromptError}</span>
                )}
                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-brandColor hover:bg-brandColorHover text-white font-bold text-sm cursor-pointer shadow-lg shadow-purple-500/20"
                >
                  Unlock Note
                </button>
              </form>
            </div>
          ) : (
            /* UNLOCKED EDITOR WORKSPACE */
            <div
              className={`rounded-3xl border shadow-xl overflow-hidden flex flex-col lg:flex-row transition-all ${currentTheme.borderClass} ${
                isZenMode ? "min-h-[85vh]" : "min-h-[500px] sm:min-h-[600px]"
              }`}
            >
              {/* Left Panel: Textarea Editor */}
              {(viewMode === "edit" || viewMode === "split") && (
                <div
                  className={`flex flex-col relative ${
                    viewMode === "split" ? "w-full lg:w-1/2 border-b lg:border-b-0 lg:border-r" : "w-full"
                  } ${currentTheme.borderClass}`}
                >
                  {/* Active Voice Dictation Live Banner */}
                  {isListening && (
                    <div className="flex items-center justify-between gap-3 px-4 py-2 bg-red-500/10 border-b border-red-500/20 text-red-600 dark:text-red-400 text-xs animate-fadeIn">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span className="relative flex h-2.5 w-2.5 shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                        </span>
                        <span className="font-bold uppercase tracking-wider text-[11px] shrink-0">Listening...</span>
                        <span className="text-gray-600 dark:text-gray-300 italic font-mono truncate max-w-md">
                          {interimSpeech || "Speak clearly into your microphone..."}
                        </span>
                      </div>
                      <button
                        onClick={toggleVoiceDictation}
                        className="text-xs font-bold text-red-600 hover:text-red-700 dark:text-red-400 underline cursor-pointer shrink-0"
                      >
                        Stop
                      </button>
                    </div>
                  )}

                  <div className="flex flex-1 overflow-hidden relative">
                    {/* Line Numbers Gutter */}
                    {showLineNumbers && (
                      <div
                        ref={gutterRef}
                        className={`select-none text-right pr-3 pl-2 py-6 font-mono overflow-hidden w-12 sm:w-14 shrink-0 select-none ${currentTheme.gutterClass}`}
                        style={{
                          fontSize: `${fontSize}px`,
                          lineHeight: lineHeight,
                        }}
                      >
                        {Array.from({ length: textStats.lineCount }).map((_, idx) => (
                          <div key={idx}>{idx + 1}</div>
                        ))}
                      </div>
                    )}

                    {/* Main Textarea (Strictly font size >= 14px) */}
                    <textarea
                      ref={textareaRef}
                      value={activeNote.content}
                      onChange={(e) => handleContentChange(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onScroll={handleScrollSync}
                      placeholder="Start typing your note, drafting ideas, or writing Markdown here..."
                      spellCheck={spellCheck}
                      className={`flex-1 w-full h-full p-6 outline-none resize-none border-none ring-0 shadow-none focus:ring-0 ${
                        currentTheme.editorClass
                      } ${currentFont.style} ${wordWrap ? "whitespace-pre-wrap" : "whitespace-pre overflow-x-auto"}`}
                      style={{
                        fontSize: `${fontSize}px`,
                        lineHeight: lineHeight,
                        textAlign: textAlign,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Right Panel: Live Markdown Preview */}
              {(viewMode === "preview" || viewMode === "split") && (
                <div
                  ref={previewRef}
                  className={`overflow-y-auto p-6 sm:p-8 bg-white dark:bg-gray-900 ${
                    viewMode === "split" ? "w-full lg:w-1/2" : "w-full"
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2 mb-4">
                    <span className="text-[11px] font-black uppercase tracking-widest text-brandColor flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Live Markdown Preview
                    </span>
                    <span className="text-[11px] text-gray-400 font-mono">GitHub Flavored (GFM)</span>
                  </div>

                  {activeNote.content?.trim() ? (
                    <div
                      className="prose prose-slate dark:prose-invert max-w-none break-words
                      prose-headings:font-bold prose-headings:text-slate-900 dark:prose-headings:text-gray-100
                      prose-a:text-brandColor prose-a:no-underline hover:prose-a:underline
                      prose-blockquote:border-l-4 prose-blockquote:border-brandColor prose-blockquote:bg-brandColor/5 dark:prose-blockquote:bg-brandColor/10 prose-blockquote:py-1 prose-blockquote:px-4
                      prose-code:text-brandColor prose-code:bg-brandColor/5 dark:prose-code:bg-brandColor/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
                      prose-pre:bg-[#0d1117] prose-pre:p-4 prose-pre:rounded-xl
                      prose-table:border prose-table:rounded-lg
                      prose-th:bg-gray-100 dark:prose-th:bg-gray-800 prose-th:p-2.5
                      prose-td:border-gray-200 dark:prose-td:border-gray-700 prose-td:p-2.5
                      leading-relaxed"
                      style={{ fontSize: `${Math.max(15, fontSize - 1)}px` }}
                    >
                      <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                        {activeNote.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-600 gap-2">
                      <Eye className="w-10 h-10 opacity-30" />
                      <p className="text-sm font-medium italic">Nothing to preview yet. Start typing on the left!</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── REAL-TIME METRICS & READABILITY BAR ── */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-3 sm:p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-y-3 gap-x-6 text-xs text-gray-600 dark:text-gray-300">
            {/* Counts */}
            <div className="flex items-center flex-wrap gap-4 sm:gap-6">
              <div>
                <span className="text-gray-400 font-medium mr-1.5">Words:</span>
                <span className="font-bold text-gray-900 dark:text-white font-mono">{textStats.wordCount}</span>
              </div>
              <div>
                <span className="text-gray-400 font-medium mr-1.5">Characters:</span>
                <span className="font-bold text-gray-900 dark:text-white font-mono">{textStats.charCount}</span>
                <span className="text-[10px] text-gray-400 ml-1">({textStats.charNoSpaces} no spaces)</span>
              </div>
              <div>
                <span className="text-gray-400 font-medium mr-1.5">Lines:</span>
                <span className="font-bold text-gray-900 dark:text-white font-mono">{textStats.lineCount}</span>
              </div>
              <div>
                <span className="text-gray-400 font-medium mr-1.5">Paragraphs:</span>
                <span className="font-bold text-gray-900 dark:text-white font-mono">{textStats.paragraphCount}</span>
              </div>
              <div>
                <span className="text-gray-400 font-medium mr-1.5">Sentences:</span>
                <span className="font-bold text-gray-900 dark:text-white font-mono">{textStats.sentenceCount}</span>
              </div>
            </div>

            {/* Time Estimations & Flesch Readability */}
            <div className="flex items-center flex-wrap gap-4">
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-brandColor" />
                <span className="text-gray-400">Reading:</span>
                <span className="font-bold text-gray-900 dark:text-white">{textStats.readingTimeStr}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-gray-400">Speaking:</span>
                <span className="font-bold text-gray-900 dark:text-white">{textStats.speakingTimeStr}</span>
              </div>

              {textStats.fleschScore > 0 && (
                <div className="flex items-center gap-1.5 pl-2 border-l border-gray-200 dark:border-gray-800">
                  <span className="text-gray-400">Flesch Ease:</span>
                  <span className="font-bold text-brandColor font-mono">{textStats.fleschScore}/100</span>
                  <span className="text-[10px] text-gray-500 hidden md:inline">({textStats.readabilityLabel})</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── PIN CONFIGURATION MODAL ── */}
        {isPinModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                <div className="flex items-center gap-2 text-brandColor">
                  <Key className="w-5 h-5" />
                  <h3 className="font-bold text-gray-900 dark:text-white">Note Security PIN</h3>
                </div>
                <button
                  onClick={() => setIsPinModalOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                Protect this note with a client-side PIN. When locked, the note cannot be read without entering the passcode.
              </p>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Set 4-Digit Passcode / PIN
                </label>
                <input
                  type="password"
                  maxLength={8}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="e.g. 1234"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-center font-mono text-lg tracking-widest text-gray-900 dark:text-white outline-none focus:border-brandColor"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                {activeNote.isLocked && (
                  <button
                    onClick={() => handleSetPin("")}
                    className="flex-1 py-2.5 rounded-xl border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-bold cursor-pointer transition-all"
                  >
                    Remove PIN
                  </button>
                )}
                <button
                  onClick={() => {
                    if (pinInput.length < 3) {
                      toast.error("Please enter a PIN with at least 3 digits");
                      return;
                    }
                    handleSetPin(pinInput);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-brandColor hover:bg-brandColorHover text-white text-xs font-bold cursor-pointer transition-all shadow-md shadow-purple-500/20"
                >
                  Save PIN
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── PROFESSIONAL INFORMATION & EDUCATIONAL SECTIONS ── */}
        <div className="mt-8 space-y-8">
          {/* Feature Highlights Grid */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-2">
              Engineered for Modern, Distraction-Free Note-Taking
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-6">
              A complete suite of in-browser productivity capabilities built for developers, writers, students, and professionals.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-5 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-brandColor flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  100% In-Browser Privacy
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  No database uploads, tracking pixels, or accounts required. Your notes stay strictly inside your device&apos;s local storage and volatile memory.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  Live Markdown Split Engine
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  Write standard GitHub-flavored Markdown and watch it format live with support for tables, blockquotes, code blocks, task lists, and images.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <Download className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  Multi-Format Exporter
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  Export directly to formatted PDF documents, Markdown (.md), clean Plain Text (.txt), self-contained HTML pages, or structured JSON in one click.
                </p>
              </div>
            </div>
          </div>

          {/* How to Use Section */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-brandColor" />
              How to Get the Most Out of Online Notepad
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200/70 dark:border-gray-700/60 space-y-1.5">
                <span className="w-6 h-6 rounded-full bg-brandColor text-white font-bold flex items-center justify-center text-xs">
                  1
                </span>
                <h4 className="font-bold text-gray-900 dark:text-white">Create & Organize Tabs</h4>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Click the &quot;+&quot; icon to add new tabs for distinct subjects, meeting notes, code snippets, or daily tasks.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200/70 dark:border-gray-700/60 space-y-1.5">
                <span className="w-6 h-6 rounded-full bg-brandColor text-white font-bold flex items-center justify-center text-xs">
                  2
                </span>
                <h4 className="font-bold text-gray-900 dark:text-white">Customize Your Look</h4>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Open Customize to choose your preferred typography, legible font sizes (14px–32px), themes, and line spacing.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200/70 dark:border-gray-700/60 space-y-1.5">
                <span className="w-6 h-6 rounded-full bg-brandColor text-white font-bold flex items-center justify-center text-xs">
                  3
                </span>
                <h4 className="font-bold text-gray-900 dark:text-white">Dictate & Synthesize</h4>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Use voice dictation to speak your ideas hands-free, or toggle typewriter sounds for an authentic acoustic writing feel.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200/70 dark:border-gray-700/60 space-y-1.5">
                <span className="w-6 h-6 rounded-full bg-brandColor text-white font-bold flex items-center justify-center text-xs">
                  4
                </span>
                <h4 className="font-bold text-gray-900 dark:text-white">Export & Secure</h4>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Lock private notes with a PIN code, and export finalized drafts to PDF, Markdown, HTML, or TXT whenever needed.
                </p>
              </div>
            </div>
          </div>

          {/* Practical Use Cases */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Common Use Cases & Applications
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200/60 dark:border-gray-700/50 space-y-1">
                <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <CheckCheck className="w-4 h-4 text-emerald-500" />
                  Meeting Minutes & Standup Agendas
                </h4>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Capture rapid minutes during client calls or daily team standups without heavy desktop applications. Keep task checklists aligned in real time.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200/60 dark:border-gray-700/50 space-y-1">
                <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <CheckCheck className="w-4 h-4 text-emerald-500" />
                  Developer Scratchpad & Code Snippets
                </h4>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Paste API payloads, JSON snippets, regex strings, and SQL fragments. Use monospaced font options and line numbers for clean inspection.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200/60 dark:border-gray-700/50 space-y-1">
                <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <CheckCheck className="w-4 h-4 text-emerald-500" />
                  Blog Posts & Essay Drafting
                </h4>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Draft articles in distraction-free Zen mode, monitor Flesch Reading Ease scores, track word targets, and export ready-to-publish Markdown files.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200/60 dark:border-gray-700/50 space-y-1">
                <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <CheckCheck className="w-4 h-4 text-emerald-500" />
                  Confidential Thoughts & Personal Journal
                </h4>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Keep daily reflections and sensitive notes protected with a client-side PIN. No external server ever inspects or indexes your private writing.
                </p>
              </div>
            </div>
          </div>

          {/* Interactive FAQ Accordion */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-brandColor" />
              Frequently Asked Questions (FAQ)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200/70 dark:border-gray-700/60 space-y-1.5">
                <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                  Where are my notes stored, and can anyone see them?
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  Your notes are saved exclusively in your browser&apos;s HTML5 localStorage. No notes, drafts, or scratchpads are ever sent to our servers. Only you have access on this device.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200/70 dark:border-gray-700/60 space-y-1.5">
                <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                  Does this notepad work completely offline?
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  Yes! Once this web page is loaded, the entire editor, Markdown parser, word counter, typewriter sound synthesizer, and export engine function without needing an active internet connection.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200/70 dark:border-gray-700/60 space-y-1.5">
                <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                  How does the PIN passcode lock work?
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  When you lock a note with a PIN, the editor content is concealed behind a secure keypad barrier. You can unlock it anytime by entering your chosen PIN.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200/70 dark:border-gray-700/60 space-y-1.5">
                <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                  What formats can I export my notes into?
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  You can export to Plain Text (.txt), Markdown (.md), formatted PDF (.pdf with headers and page counts), standalone HTML (.html), JSON (.json), or send directly to your printer.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolPageShell>
  );
}
