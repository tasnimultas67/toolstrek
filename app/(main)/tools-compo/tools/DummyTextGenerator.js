"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  FileText,
  Type,
  Hash,
  AlignLeft,
  Copy,
  Check,
  Download,
  Sparkles,
  Code,
  RefreshCw,
  Info,
} from "lucide-react";
import ToolPageShell from "../ToolPageShell";

// Dictionary lists for custom generation
const WORD_LISTS = {
  lorem: [
    "lorem",
    "ipsum",
    "dolor",
    "sit",
    "amet",
    "consectetur",
    "adipiscing",
    "elit",
    "sed",
    "do",
    "eiusmod",
    "tempor",
    "incididunt",
    "ut",
    "labore",
    "et",
    "dolore",
    "magna",
    "aliqua",
    "ut",
    "enim",
    "ad",
    "minim",
    "veniam",
    "quis",
    "nostrud",
    "exercitation",
    "ullamco",
    "laboris",
    "nisi",
    "ut",
    "aliquip",
    "ex",
    "ea",
    "commodo",
    "consequat",
    "duis",
    "aute",
    "irure",
    "dolor",
    "in",
    "reprehenderit",
    "in",
    "voluptate",
    "velit",
    "esse",
    "cillum",
    "dolore",
    "eu",
    "fugiat",
    "nulla",
    "pariatur",
    "excepteur",
    "sint",
    "occaecat",
    "cupidatat",
    "non",
    "proident",
    "sunt",
    "in",
    "culpa",
    "qui",
    "officia",
    "deserunt",
    "mollit",
    "anim",
    "id",
    "est",
    "laborum",
    "tempus",
    "iaculis",
    "feugiat",
    "cursus",
    "vulputate",
    "vestibulum",
    "sodales",
    "convallis",
    "condimentum",
    "phasellus",
    "porttitor",
    "ornare",
    "aenean",
    "fringilla",
    "mauris",
    "pharetra",
    "scelerisque",
    "sollicitudin",
  ],
  tech: [
    "agile",
    "synergy",
    "paradigm",
    "cloud",
    "scale",
    "blockchain",
    "leverage",
    "disrupt",
    "framework",
    "bandwidth",
    "platform",
    "microservices",
    "deployment",
    "kubernetes",
    "react",
    "nextjs",
    "algorithm",
    "api",
    "database",
    "backend",
    "frontend",
    "fullstack",
    "saas",
    "dashboard",
    "analytics",
    "pipeline",
    "devops",
    "automation",
    "integration",
    "workflow",
    "serverless",
    "responsive",
    "interface",
    "experience",
    "scalability",
    "latency",
    "protocol",
    "compliance",
    "optimization",
    "caching",
    "query",
    "refactor",
    "iteration",
    "sprint",
    "velocity",
    "backlog",
    "telemetry",
    "observability",
    "asynchronous",
    "efficiency",
    "artificial",
    "intelligence",
    "neural",
    "network",
    "deep",
    "learning",
    "data",
    "mining",
    "server",
    "latency",
    "loadbalancer",
    "container",
    "encryption",
    "firewall",
  ],
  scifi: [
    "nebula",
    "quantum",
    "warp",
    "singularity",
    "orbit",
    "galaxy",
    "hyperdrive",
    "exoplanet",
    "cosmos",
    "supernova",
    "asteroid",
    "meteor",
    "pulsar",
    "quasar",
    "teleportation",
    "wormhole",
    "firmament",
    "gravity",
    "relativity",
    "constellation",
    "eclipse",
    "stellar",
    "solstice",
    "nanotechnology",
    "android",
    "cybernetic",
    "biosphere",
    "multiverse",
    "dimension",
    "interstellar",
    "spacecraft",
    "astronaut",
    "cosmonaut",
    "atmosphere",
    "stratosphere",
    "tether",
    "probe",
    "satellite",
    "beacon",
    "odyssey",
    "galactic",
    "terrestrial",
    "cyborg",
    "robotics",
    "chronology",
    "telepathic",
    "aurora",
    "comet",
    "fusion",
    "photon",
    "darkmatter",
  ],
};

export default function DummyTextGenerator() {
  // Client-side states
  const [mode, setMode] = useState("words"); // "words" | "characters" | "paragraphs"
  const [wordCount, setWordCount] = useState(200);
  const [charCount, setCharCount] = useState(1000);
  const [paragraphCount, setParagraphCount] = useState(3);
  const [theme, setTheme] = useState("lorem"); // "lorem" | "tech" | "scifi"
  const [useHtml, setUseHtml] = useState(false);
  const [outputText, setOutputText] = useState("");
  const [copied, setCopied] = useState(false);
  const [isRotating, setIsRotating] = useState(false);

  // Statistics of generated text
  const [stats, setStats] = useState({
    words: 0,
    characters: 0,
    paragraphs: 0,
  });

  // Generate sentences dynamically
  const generateSentence = useCallback(
    (vocabulary, minWords = 6, maxWords = 14) => {
      const len =
        Math.floor(Math.random() * (maxWords - minWords + 1)) + minWords;
      const sentenceWords = [];
      for (let i = 0; i < len; i++) {
        const idx = Math.floor(Math.random() * vocabulary.length);
        sentenceWords.push(vocabulary[idx]);
      }
      let sentence = sentenceWords.join(" ");
      sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1);

      const punct = [".", ".", ".", "?", "!"];
      const ending = punct[Math.floor(Math.random() * punct.length)];
      return sentence + ending;
    },
    [],
  );

  // Generate paragraphs dynamically
  const generateParagraph = useCallback(
    (vocabulary, minSentences = 3, maxSentences = 6) => {
      const len =
        Math.floor(Math.random() * (maxSentences - minSentences + 1)) +
        minSentences;
      const sentences = [];
      for (let i = 0; i < len; i++) {
        sentences.push(generateSentence(vocabulary));
      }
      return sentences.join(" ");
    },
    [generateSentence],
  );

  // Main Generator Logic
  const handleGenerate = useCallback(
    (forceNew = false) => {
      const vocabulary = WORD_LISTS[theme] || WORD_LISTS.lorem;
      let text = "";

      if (mode === "words") {
        const words = [];
        // Optionally prepopulate classic lorem with standard starter
        if (theme === "lorem") {
          const starter = [
            "lorem",
            "ipsum",
            "dolor",
            "sit",
            "amet",
            "consectetur",
            "adipiscing",
            "elit",
          ];
          for (let i = 0; i < Math.min(wordCount, starter.length); i++) {
            words.push(starter[i]);
          }
        }

        while (words.length < wordCount) {
          const w = vocabulary[Math.floor(Math.random() * vocabulary.length)];
          words.push(w);
        }

        // Format words into sentences
        const sentences = [];
        let idx = 0;
        while (idx < wordCount) {
          const sentenceLen = Math.min(
            Math.floor(Math.random() * 9) + 6, // 6 to 14 words
            wordCount - idx,
          );
          if (sentenceLen <= 0) break;

          const chunk = words.slice(idx, idx + sentenceLen);
          let s = chunk.join(" ");
          s = s.charAt(0).toUpperCase() + s.slice(1);
          if (idx + sentenceLen >= wordCount) {
            s += ".";
          } else {
            const puncts = [".", ".", ".", "?", "!"];
            s += puncts[Math.floor(Math.random() * puncts.length)];
          }
          sentences.push(s);
          idx += sentenceLen;
        }

        // Chunk sentences into paragraphs of about 5 sentences
        const paragraphs = [];
        const sentencesPerParagraph = 5;
        for (let i = 0; i < sentences.length; i += sentencesPerParagraph) {
          const pText = sentences.slice(i, i + sentencesPerParagraph).join(" ");
          if (useHtml) {
            paragraphs.push(`<p>${pText}</p>`);
          } else {
            paragraphs.push(pText);
          }
        }
        text = paragraphs.join("\n\n");
      } else if (mode === "characters") {
        // Generate a massive block of sentences to slice
        const paragraphs = [];
        for (let i = 0; i < 25; i++) {
          paragraphs.push(generateParagraph(vocabulary));
        }
        const massiveText = paragraphs.join(" ");
        let sliced = massiveText.slice(0, charCount);

        // Ensure the text ends cleanly (optionally with a period if sliced abruptly)
        if (sliced.length > 0 && !/[.!?]$/.test(sliced)) {
          // Strip trailing spaces or partial words if desired, but as per spec:
          // "slice the text exactly to this character length"
          // We will keep it exactly sliced.
        }

        if (useHtml) {
          // Split sliced text into paragraphs of ~300 chars to avoid one giant <p>
          const charParagraphs = [];
          const words = sliced.split(" ");
          const wordsPerParagraph = 45;
          for (let i = 0; i < words.length; i += wordsPerParagraph) {
            const chunk = words.slice(i, i + wordsPerParagraph).join(" ");
            if (chunk.trim()) {
              charParagraphs.push(`<p>${chunk}</p>`);
            }
          }
          text = charParagraphs.join("\n\n");
        } else {
          // Just join in double newlines for paragraph look
          const charParagraphs = [];
          const words = sliced.split(" ");
          const wordsPerParagraph = 45;
          for (let i = 0; i < words.length; i += wordsPerParagraph) {
            const chunk = words.slice(i, i + wordsPerParagraph).join(" ");
            if (chunk.trim()) {
              charParagraphs.push(chunk);
            }
          }
          text = charParagraphs.join("\n\n");
        }
      } else if (mode === "paragraphs") {
        const paragraphs = [];
        for (let i = 0; i < paragraphCount; i++) {
          const pText = generateParagraph(vocabulary);
          if (useHtml) {
            paragraphs.push(`<p>${pText}</p>`);
          } else {
            paragraphs.push(pText);
          }
        }
        text = paragraphs.join("\n\n");
      }

      setOutputText(text);

      // Calculate actual specs for stats panel
      const cleanText = text.replace(/<\/?[^>]+(>|$)/g, ""); // Strip HTML tags for stats
      const wCount =
        cleanText.trim() === "" ? 0 : cleanText.trim().split(/\s+/).length;
      const cCount = cleanText.length;
      const pCount = text.split("\n\n").filter((p) => p.trim() !== "").length;

      setStats({
        words: wCount,
        characters: cCount,
        paragraphs: pCount,
      });
    },
    [
      mode,
      wordCount,
      charCount,
      paragraphCount,
      theme,
      useHtml,
      generateParagraph,
    ],
  );

  // Handle regeneration manual trigger
  const handleRegenerateClick = () => {
    setIsRotating(true);
    handleGenerate(true);
    setTimeout(() => setIsRotating(false), 600);
  };

  // Safe Copy to Clipboard
  const handleCopy = async () => {
    if (!outputText) return;
    try {
      await navigator.clipboard.writeText(outputText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  // Download text file
  const handleDownload = () => {
    if (!outputText) return;
    const ext = useHtml ? "html" : "txt";
    const mime = useHtml ? "text/html" : "text/plain";
    const blob = new Blob([outputText], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `dummy-text-${theme}-${mode}.${ext}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Automatically generate on page load and control state changes
  useEffect(() => {
    handleGenerate();
  }, [handleGenerate]);

  return (
    <ToolPageShell widthClassName="max-w-7xl px-4 pt-26 pb-10">
      <div className="dark:text-slate-100 font-sans">
        {/* Header Section */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-3 dark:from-slate-200 dark:to-slate-400">
            Dummy Text Generator
          </h1>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto dark:text-slate-400">
            Generate custom, database-free placeholder text instantly in
            multiple formats, lengths, and themes.
          </p>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column - Controls Panel (5 Columns) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Control Panel Glassmorphism Container */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/50 p-6 space-y-6 transition-all hover:shadow-md dark:bg-slate-900/80 dark:border-slate-800 dark:shadow-slate-950/20">
              {/* Tab Selector */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  Generation Mode
                </label>
                <div className="flex bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/20">
                  {[
                    { id: "words", label: "Words", icon: Type },
                    { id: "characters", label: "Characters", icon: Hash },
                    { id: "paragraphs", label: "Paragraphs", icon: AlignLeft },
                  ].map((tab) => {
                    const IconComponent = tab.icon;
                    const isActive = mode === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setMode(tab.id)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                          isActive
                            ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                            : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Length Controls */}
              <div className="space-y-4">
                {mode === "words" && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Word Count
                      </label>
                      <input
                        type="number"
                        min="10"
                        max="2000"
                        value={wordCount}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          setWordCount(Math.min(2000, Math.max(1, val)));
                        }}
                        className="w-20 px-2 py-1 text-right text-sm font-medium bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                      />
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="2000"
                      step="10"
                      value={wordCount}
                      onChange={(e) => setWordCount(parseInt(e.target.value))}
                      className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-800 dark:bg-slate-700 dark:accent-slate-400"
                    />
                    <div className="flex justify-between text-xs text-slate-400 mt-1">
                      <span>10 words</span>
                      <span>2,000 words</span>
                    </div>
                  </div>
                )}

                {mode === "characters" && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Character Limit
                      </label>
                      <input
                        type="number"
                        min="50"
                        max="10000"
                        value={charCount}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          setCharCount(Math.min(10000, Math.max(10, val)));
                        }}
                        className="w-24 px-2 py-1 text-right text-sm font-medium bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                      />
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="5000"
                      step="50"
                      value={charCount <= 5000 ? charCount : 5000}
                      onChange={(e) => setCharCount(parseInt(e.target.value))}
                      className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-800 dark:bg-slate-700 dark:accent-slate-400"
                    />
                    <div className="flex justify-between text-xs text-slate-400 mt-1">
                      <span>50 chars</span>
                      <span>5,000+ chars</span>
                    </div>
                  </div>
                )}

                {mode === "paragraphs" && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Paragraph Count
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={paragraphCount}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          setParagraphCount(Math.min(20, Math.max(1, val)));
                        }}
                        className="w-16 px-2 py-1 text-right text-sm font-medium bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                      />
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      step="1"
                      value={paragraphCount}
                      onChange={(e) =>
                        setParagraphCount(parseInt(e.target.value))
                      }
                      className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-800 dark:bg-slate-700 dark:accent-slate-400"
                    />
                    <div className="flex justify-between text-xs text-slate-400 mt-1">
                      <span>1 paragraph</span>
                      <span>20 paragraphs</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Theme Settings */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  Text Theme / Vocabulary
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "lorem", label: "Lorem Ipsum" },
                    { id: "tech", label: "Tech SaaS" },
                    { id: "scifi", label: "Sci-Fi Space" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className={`py-2 px-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer text-center ${
                        theme === t.id
                          ? "bg-slate-900 border-slate-900 text-white dark:bg-slate-100 dark:border-slate-100 dark:text-slate-950 shadow-sm"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Formatting & Controls */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-slate-500" />
                  <div>
                    <span className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                      HTML Tags
                    </span>
                    <span className="block text-xs text-slate-400">
                      Wraps blocks in &lt;p&gt; tags
                    </span>
                  </div>
                </div>

                {/* Switch Toggle */}
                <button
                  onClick={() => setUseHtml(!useHtml)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 focus:outline-none ${
                    useHtml
                      ? "bg-slate-800 dark:bg-slate-200"
                      : "bg-slate-200 dark:bg-slate-700"
                  }`}
                  aria-label="Toggle HTML tags"
                >
                  <div
                    className={`bg-white dark:bg-slate-900 w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                      useHtml ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Action Button */}
              <button
                onClick={handleRegenerateClick}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-medium transition-all active:scale-[0.98] cursor-pointer dark:bg-slate-100 dark:hover:bg-white dark:text-slate-950"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isRotating ? "animate-spin" : ""}`}
                />
                <span>Regenerate Text</span>
              </button>
            </div>

            {/* Info Tips Panel */}
            <div className="bg-blue-50/40 border border-blue-100/50 rounded-xl p-4 flex gap-3 text-xs text-blue-700/90 dark:bg-blue-950/20 dark:border-blue-900/30 dark:text-blue-300/90">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-1">
                  Local Client-Side Generation
                </p>
                <p>
                  All calculations are done directly inside your web browser. No
                  network calls are made, guaranteeing maximum speed and
                  privacy.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Output & Stats Area (7 Columns) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Stats Panel */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Words", value: stats.words, icon: Type },
                { label: "Characters", value: stats.characters, icon: Hash },
                {
                  label: "Paragraphs",
                  value: stats.paragraphs,
                  icon: AlignLeft,
                },
              ].map((stat, idx) => {
                const StatIcon = stat.icon;
                return (
                  <div
                    key={idx}
                    className="bg-white/60 backdrop-blur-sm border border-slate-200/30 rounded-xl p-3 flex items-center justify-between shadow-xs dark:bg-slate-900/40 dark:border-slate-800"
                  >
                    <div>
                      <span className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
                        {stat.label}
                      </span>
                      <span className="text-lg font-bold text-slate-800 dark:text-slate-100">
                        {stat.value.toLocaleString()}
                      </span>
                    </div>
                    <StatIcon className="w-5 h-5 text-slate-400/80" />
                  </div>
                );
              })}
            </div>

            {/* Output Display Container */}
            <div className="relative bg-white border border-slate-200/50 rounded-2xl shadow-sm overflow-hidden dark:bg-slate-900 dark:border-slate-800">
              {/* Output Actions Bar */}
              <div className="flex justify-between items-center py-3 px-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Generated Output
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Download Button */}
                  <button
                    onClick={handleDownload}
                    title={`Download as .${useHtml ? "html" : "txt"}`}
                    className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-all cursor-pointer dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  {/* Copy Button */}
                  <button
                    onClick={handleCopy}
                    className={`flex items-center gap-1.5 py-1 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      copied
                        ? "bg-green-50 border-green-200 text-green-700 dark:bg-green-950/20 dark:border-green-900/30 dark:text-green-400"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied! ✓</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Text Area Content */}
              <div className="p-6 max-h-[500px] overflow-y-auto min-h-[300px]">
                <pre className="whitespace-pre-wrap font-mono text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                  {outputText}
                </pre>
              </div>
            </div>

            {/* Quick Presets Panel */}
            <div className="flex justify-between items-center text-xs text-slate-400/80 px-2">
              <span>Dynamic generation</span>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setMode("words");
                    setWordCount(200);
                  }}
                  className="hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  Preset: 200 Words
                </button>
                <span>•</span>
                <button
                  onClick={() => {
                    setMode("paragraphs");
                    setParagraphCount(5);
                  }}
                  className="hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  Preset: 5 Paragraphs
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolPageShell>
  );
}
