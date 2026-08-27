"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  Sparkles,
  Play,
  RotateCcw,
  Copy,
  Check,
  Download,
  Upload,
  Trash2,
  Settings,
  Share2,
  Sliders,
  HelpCircle,
  BookOpen,
  Code2,
  FileCode,
  FileText,
  ArrowRightLeft,
  Scissors,
  Split,
  Search,
  Zap,
  Info,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Maximize2,
  Minimize2,
  Layers,
  Clock,
  Hash,
  ListFilter,
  Palette,
  ExternalLink,
  ShieldCheck,
  Terminal,
  FileJson,
  Braces,
  Bookmark
} from "lucide-react";
import ToolPageShell from "../ToolPageShell";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ─── Preset Demo Data (Loaded ONLY on demand via button) ──────────────────────
const DEMO_PRESETS = [
  {
    id: "email",
    title: "Email & Domain Extractor",
    icon: "Mail",
    description: "Extracts username, domain, and TLD with named capture groups.",
    pattern: "(?<user>[a-zA-Z0-9._%+-]+)@(?<domain>[a-zA-Z0-9.-]+\\.(?<tld>[a-zA-Z]{2,}))",
    flags: { g: true, i: true, m: true, s: false, u: false, y: false, d: true },
    testString: `Contact our support team at support@toolstrek.com for general queries.
For enterprise billing, reach out to billing.dept@enterprise-corp.org or sales@cloud-matrix.io.
Dev inquiries: alex.dev_99@subdomain.example.co.uk or admin@localhost (not matched).
Legacy backup contacts: old-contact@webmail.net and test.user+filter@gmail.com.`,
    substitution: "[$<user> at $<domain>]",
    splitLimit: 0
  },
  {
    id: "server-log",
    title: "Web Server Access Logs",
    icon: "Terminal",
    description: "Parses IP addresses, timestamps, HTTP methods, paths, status codes & bytes.",
    pattern: "(?<ip>\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3})\\s+-\\s+\\[(?<time>[^\\]]+)\\]\\s+\"(?<method>GET|POST|PUT|DELETE|PATCH)\\s+(?<path>\\S+)\\s+HTTP/\\d\\.\\d\"\\s+(?<status>\\d{3})\\s+(?<bytes>\\d+)",
    flags: { g: true, i: false, m: true, s: false, u: false, y: false, d: true },
    testString: `192.168.1.105 - [27/Aug/2026:14:32:10 +0000] "GET /api/v1/users?page=2 HTTP/1.1" 200 4821
10.0.0.42 - [27/Aug/2026:14:32:11 +0000] "POST /api/v1/auth/login HTTP/1.1" 201 1024
172.16.254.1 - [27/Aug/2026:14:32:15 +0000] "GET /static/css/main.bundle.css HTTP/1.1" 304 0
192.168.1.18 - [27/Aug/2026:14:32:18 +0000] "DELETE /api/v1/records/894 HTTP/1.1" 403 256
203.0.113.195 - [27/Aug/2026:14:32:22 +0000] "GET /non-existent-page HTTP/1.1" 404 1520`,
    substitution: "[$<method>] $<path> -> Status: $<status> (Client: $<ip>)",
    splitLimit: 0
  },
  {
    id: "url",
    title: "URL & Query Parameter Parser",
    icon: "ExternalLink",
    description: "Extracts protocol, hostname, path, query parameters, and URL fragments.",
    pattern: "(?<protocol>https?):\\/\\/(?<domain>[a-zA-Z0-9.-]+)(?<path>\\/[^\\s?#]*)?(?:\\?(?<query>[^\\s#]*))?(?:#(?<hash>\\S*))?",
    flags: { g: true, i: true, m: true, s: false, u: false, y: false, d: true },
    testString: `Visit our main portal at https://toolstrek.com/tools/regex-tester?theme=dark&mode=full#demo
API documentation: https://api.toolstrek.com/v2/docs/authentication?lang=js&strict=true
External partner service: http://legacy-cdn.internal-network.org:8080/assets/logo.svg
Short URL: https://bit.ly/3xY89zQ`,
    substitution: "Host: $<domain> | Query: $<query>",
    splitLimit: 0
  },
  {
    id: "iso-date",
    title: "ISO 8601 Timestamps & Dates",
    icon: "Clock",
    description: "Captures YYYY-MM-DD dates and optional HH:MM:SS timestamps with timezones.",
    pattern: "(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})(?:T(?<hour>\\d{2}):(?<minute>\\d{2}):(?<second>\\d{2})(?:\\.(?<ms>\\d{3}))?(?<tz>Z|[+-]\\d{2}:?\\d{2})?)?",
    flags: { g: true, i: false, m: true, s: false, u: false, y: false, d: true },
    testString: `Events schedule:
- Sprint Planning: 2026-08-27T09:30:00Z
- Release Deadline: 2026-09-15
- Server Maintenance: 2026-10-01T23:00:00.500+06:00
- Historical Record: 1999-12-31T23:59:59Z`,
    substitution: "$<day>/$<month>/$<year> (Time: $<hour>:$<minute>)",
    splitLimit: 0
  },
  {
    id: "html-tag",
    title: "HTML / JSX Tag Stripper",
    icon: "FileCode",
    description: "Matches HTML elements with their tag name, attributes, and inner content.",
    pattern: "<(?<tag>[a-zA-Z0-9]+)(?<attrs>[^>]*)>(?<content>[\\s\\S]*?)<\\/\\k<tag>>",
    flags: { g: true, i: true, m: true, s: false, u: false, y: false, d: true },
    testString: `<div class="card p-4 shadow-lg">
  <h1 id="title" style="color: blue;">Welcome to ToolsTrek</h1>
  <p class="description">Test your regular expressions in real-time.</p>
  <button onClick={handleClick}>Click Here</button>
</div>`,
    substitution: "[$<tag>] -> $<content>",
    splitLimit: 0
  },
  {
    id: "hex-colors",
    title: "Hex Color Extractor",
    icon: "Palette",
    description: "Matches 3, 6, and 8-digit hexadecimal color values (#RGB, #RRGGBB, #RRGGBBAA).",
    pattern: "#(?<hex>[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\\b",
    flags: { g: true, i: true, m: true, s: false, u: false, y: false, d: true },
    testString: `/* Theme Palette */
:root {
  --primary: #7c00fe;
  --primary-hover: #4635b1;
  --accent: #00f0ff;
  --accent-alpha: #00f0ff80;
  --bg-dark: #0a0a0f;
  --white: #fff;
  --slate: #94a3b8;
  --invalid: #12345z (ignored)
}`,
    substitution: "rgba(from #$<hex>)",
    splitLimit: 0
  },
  {
    id: "card-mask",
    title: "Credit Card & Phone Masker",
    icon: "ShieldCheck",
    description: "Matches 16-digit card patterns and formats or masks them.",
    pattern: "(?<bin>\\d{4})[ -]?(?<mid1>\\d{4})[ -]?(?<mid2>\\d{4})[ -]?(?<last4>\\d{4})",
    flags: { g: true, i: false, m: true, s: false, u: false, y: false, d: true },
    testString: `Sample transactions for testing:
Visa Card: 4532 8901 2345 6789
MasterCard: 5412-7512-3412-3456
Corporate Card: 4000123456789010
Amex: 3782 822463 10005 (not matched due to 15 digits)`,
    substitution: "$<bin>-****-****-$<last4>",
    splitLimit: 0
  }
];

// ─── Theme Accent Styles ──────────────────────────────────────────────────────
const THEMES = [
  {
    id: "violet",
    name: "Violet Glow",
    badgeClass: "bg-purple-500/20 text-purple-600 dark:text-purple-300 border-purple-500/30",
    matchBg: "bg-purple-500/25 dark:bg-purple-500/35 border-purple-500/50 text-purple-900 dark:text-purple-100",
    matchAltBg: "bg-indigo-500/25 dark:bg-indigo-500/35 border-indigo-500/50 text-indigo-900 dark:text-indigo-100",
    groupColors: [
      "bg-blue-500/30 border-blue-500/60 text-blue-900 dark:text-blue-200",
      "bg-emerald-500/30 border-emerald-500/60 text-emerald-900 dark:text-emerald-200",
      "bg-amber-500/30 border-amber-500/60 text-amber-900 dark:text-amber-200",
      "bg-pink-500/30 border-pink-500/60 text-pink-900 dark:text-pink-200",
      "bg-cyan-500/30 border-cyan-500/60 text-cyan-900 dark:text-cyan-200"
    ],
    ringClass: "focus:ring-purple-500/50"
  },
  {
    id: "cyan",
    name: "Cyber Cyan",
    badgeClass: "bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border-cyan-500/30",
    matchBg: "bg-cyan-500/25 dark:bg-cyan-500/35 border-cyan-500/50 text-cyan-900 dark:text-cyan-100",
    matchAltBg: "bg-teal-500/25 dark:bg-teal-500/35 border-teal-500/50 text-teal-900 dark:text-teal-100",
    groupColors: [
      "bg-sky-500/30 border-sky-500/60 text-sky-900 dark:text-sky-200",
      "bg-emerald-500/30 border-emerald-500/60 text-emerald-900 dark:text-emerald-200",
      "bg-violet-500/30 border-violet-500/60 text-violet-900 dark:text-violet-200",
      "bg-amber-500/30 border-amber-500/60 text-amber-900 dark:text-amber-200",
      "bg-fuchsia-500/30 border-fuchsia-500/60 text-fuchsia-900 dark:text-fuchsia-200"
    ],
    ringClass: "focus:ring-cyan-500/50"
  },
  {
    id: "emerald",
    name: "Emerald Matrix",
    badgeClass: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/30",
    matchBg: "bg-emerald-500/25 dark:bg-emerald-500/35 border-emerald-500/50 text-emerald-900 dark:text-emerald-100",
    matchAltBg: "bg-lime-500/25 dark:bg-lime-500/35 border-lime-500/50 text-lime-900 dark:text-lime-100",
    groupColors: [
      "bg-teal-500/30 border-teal-500/60 text-teal-900 dark:text-teal-200",
      "bg-blue-500/30 border-blue-500/60 text-blue-900 dark:text-blue-200",
      "bg-amber-500/30 border-amber-500/60 text-amber-900 dark:text-amber-200",
      "bg-purple-500/30 border-purple-500/60 text-purple-900 dark:text-purple-200",
      "bg-rose-500/30 border-rose-500/60 text-rose-900 dark:text-rose-200"
    ],
    ringClass: "focus:ring-emerald-500/50"
  },
  {
    id: "amber",
    name: "Sunset Amber",
    badgeClass: "bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-500/30",
    matchBg: "bg-amber-500/25 dark:bg-amber-500/35 border-amber-500/50 text-amber-900 dark:text-amber-100",
    matchAltBg: "bg-orange-500/25 dark:bg-orange-500/35 border-orange-500/50 text-orange-900 dark:text-orange-100",
    groupColors: [
      "bg-rose-500/30 border-rose-500/60 text-rose-900 dark:text-rose-200",
      "bg-yellow-500/30 border-yellow-500/60 text-yellow-900 dark:text-yellow-200",
      "bg-cyan-500/30 border-cyan-500/60 text-cyan-900 dark:text-cyan-200",
      "bg-emerald-500/30 border-emerald-500/60 text-emerald-900 dark:text-emerald-200",
      "bg-purple-500/30 border-purple-500/60 text-purple-900 dark:text-purple-200"
    ],
    ringClass: "focus:ring-amber-500/50"
  },
  {
    id: "rose",
    name: "Rose Quartz",
    badgeClass: "bg-rose-500/20 text-rose-600 dark:text-rose-300 border-rose-500/30",
    matchBg: "bg-rose-500/25 dark:bg-rose-500/35 border-rose-500/50 text-rose-900 dark:text-rose-100",
    matchAltBg: "bg-pink-500/25 dark:bg-pink-500/35 border-pink-500/50 text-pink-900 dark:text-pink-100",
    groupColors: [
      "bg-violet-500/30 border-violet-500/60 text-violet-900 dark:text-violet-200",
      "bg-sky-500/30 border-sky-500/60 text-sky-900 dark:text-sky-200",
      "bg-amber-500/30 border-amber-500/60 text-amber-900 dark:text-amber-200",
      "bg-emerald-500/30 border-emerald-500/60 text-emerald-900 dark:text-emerald-200",
      "bg-indigo-500/30 border-indigo-500/60 text-indigo-900 dark:text-indigo-200"
    ],
    ringClass: "focus:ring-rose-500/50"
  }
];

// ─── Regex Cheatsheet Library ────────────────────────────────────────────────
const CHEATSHEET_CATEGORIES = [
  {
    name: "Character Classes",
    items: [
      { token: "\\d", label: "Digit [0-9]", desc: "Matches any single decimal digit (0-9)" },
      { token: "\\D", label: "Non-digit", desc: "Matches any character that is NOT a decimal digit" },
      { token: "\\w", label: "Word character", desc: "Matches letters, digits, and underscores [a-zA-Z0-9_]" },
      { token: "\\W", label: "Non-word character", desc: "Matches anything other than a word character" },
      { token: "\\s", label: "Whitespace", desc: "Matches space, tab, newline, carriage return, form feed" },
      { token: "\\S", label: "Non-whitespace", desc: "Matches any non-whitespace character" },
      { token: ".", label: "Any character", desc: "Matches any character except newlines (unless dotAll flag 's' is set)" },
      { token: "[abc]", label: "Character set", desc: "Matches any character inside the brackets (a, b, or c)" },
      { token: "[^abc]", label: "Negated set", desc: "Matches any character NOT listed inside the brackets" },
      { token: "[a-z]", label: "Character range", desc: "Matches any character from 'a' through 'z' in alphabetical order" }
    ]
  },
  {
    name: "Anchors & Boundaries",
    items: [
      { token: "^", label: "Start of string / line", desc: "Matches beginning of input (or start of line with 'm' flag)" },
      { token: "$", label: "End of string / line", desc: "Matches end of input (or end of line with 'm' flag)" },
      { token: "\\b", label: "Word boundary", desc: "Matches position where word character meets non-word character" },
      { token: "\\B", label: "Non-word boundary", desc: "Matches any position that is NOT a word boundary" }
    ]
  },
  {
    name: "Quantifiers",
    items: [
      { token: "*", label: "0 or more", desc: "Matches preceding element zero or more times (greedy)" },
      { token: "+", label: "1 or more", desc: "Matches preceding element one or more times (greedy)" },
      { token: "?", label: "0 or 1 (optional)", desc: "Matches preceding element zero or one time (optional)" },
      { token: "{n}", label: "Exactly n times", desc: "Matches preceding element exactly n times" },
      { token: "{n,}", label: "At least n times", desc: "Matches preceding element n or more times" },
      { token: "{n,m}", label: "Between n and m times", desc: "Matches preceding element between n and m times inclusive" },
      { token: "*?", label: "Lazy 0 or more", desc: "Matches as few characters as possible (non-greedy)" },
      { token: "+?", label: "Lazy 1 or more", desc: "Matches at least one character, but fewest possible" }
    ]
  },
  {
    name: "Groups & Lookarounds",
    items: [
      { token: "(abc)", label: "Capturing group", desc: "Groups expressions together and remembers the match as $1, $2..." },
      { token: "(?<name>abc)", label: "Named group", desc: "Captures match into a named group accessible via $<name>" },
      { token: "(?:abc)", label: "Non-capturing group", desc: "Groups expressions without storing match in backreferences" },
      { token: "(?=abc)", label: "Positive lookahead", desc: "Asserts that 'abc' immediately follows, without including it in match" },
      { token: "(?!abc)", label: "Negative lookahead", desc: "Asserts that 'abc' does NOT immediately follow" },
      { token: "(?<=abc)", label: "Positive lookbehind", desc: "Asserts that 'abc' immediately precedes" },
      { token: "(?<!abc)", label: "Negative lookbehind", desc: "Asserts that 'abc' does NOT immediately precede" },
      { token: "a|b", label: "Alternation (OR)", desc: "Matches either expression 'a' or expression 'b'" }
    ]
  },
  {
    name: "Escapes & Special",
    items: [
      { token: "\\n", label: "Newline", desc: "Line feed character (ASCII 10)" },
      { token: "\\t", label: "Tab", desc: "Horizontal tab character (ASCII 9)" },
      { token: "\\r", label: "Carriage return", desc: "Carriage return (ASCII 13)" },
      { token: "\\\\", label: "Backslash literal", desc: "Escapes backslash character" },
      { token: "\\/", label: "Slash literal", desc: "Escapes forward slash character" }
    ]
  }
];

// Common production-ready patterns for quick-load
const COMMON_RECIPES = [
  {
    name: "Email (RFC 5322)",
    pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
    flags: "i",
    desc: "Validates standard email address format."
  },
  {
    name: "URL (HTTP/HTTPS)",
    pattern: "https?:\\/\\/(?:www\\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)",
    flags: "gi",
    desc: "Matches standard HTTP and HTTPS web URLs."
  },
  {
    name: "IPv4 Address",
    pattern: "\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b",
    flags: "g",
    desc: "Matches valid IPv4 addresses from 0.0.0.0 to 255.255.255.255."
  },
  {
    name: "IPv6 Address",
    pattern: "(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,7}:|(?:[0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}",
    flags: "gi",
    desc: "Matches full or abbreviated IPv6 hexadecimal addresses."
  },
  {
    name: "UUID v4",
    pattern: "\\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}\\b",
    flags: "gi",
    desc: "Matches canonical Universally Unique Identifier version 4."
  },
  {
    name: "Strong Password",
    pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
    flags: "",
    desc: "Min 8 chars, at least 1 uppercase, 1 lowercase, 1 digit, 1 special symbol."
  },
  {
    name: "Phone Number (International)",
    pattern: "\\+?[1-9]\\d{1,14}(?:\\s*\\([0-9]{1,4}\\))?(?:\\s*[-.\\s]?[0-9]{1,4}){1,5}",
    flags: "g",
    desc: "Matches E.164 and international telephone numbers."
  },
  {
    name: "Semantic Versioning (SemVer)",
    pattern: "^v?(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(?:-((?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\\.(?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\\+([0-9a-zA-Z-]+(?:\\.[0-9a-zA-Z-]+)*))?$",
    flags: "",
    desc: "Matches SemVer 2.0.0 strings e.g. v1.2.3-beta.1+build.104"
  },
  {
    name: "Slug / URL Identifier",
    pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$",
    flags: "",
    desc: "Matches kebab-case clean URL slugs."
  },
  {
    name: "HTML / XML Tag",
    pattern: "<\\/?([a-zA-Z0-9]+)(?:\\s+[^>]*)?>",
    flags: "gi",
    desc: "Matches opening and closing HTML tags."
  },
  {
    name: "JWT (JSON Web Token)",
    pattern: "^[A-Za-z0-9-_=]+\\.[A-Za-z0-9-_=]+\\.?[A-Za-z0-9-_.+/=]*$",
    flags: "",
    desc: "Validates format of header.payload.signature JWT strings."
  },
  {
    name: "Hex Color Code",
    pattern: "^#([0-9a-fA-F]{3,8})$",
    flags: "i",
    desc: "Matches CSS hex color codes."
  }
];

// ─── AST Token Explainer Engine ──────────────────────────────────────────────
function explainRegexAST(pattern, flagsStr) {
  if (!pattern) return [];
  const explanations = [];

  // Flag explanations
  const flagDescriptions = {
    g: "Global: Find all matches rather than stopping after first match",
    i: "Case-insensitive: Ignore casing differences (A-Z matches a-z)",
    m: "Multiline: ^ and $ match beginning and end of each line",
    s: "DotAll: . matches any character including newlines",
    u: "Unicode: Full Unicode code point support",
    y: "Sticky: Matches only from the index indicated by lastIndex",
    d: "Has Indices: Generates substring start and end indices",
    v: "Unicode Sets: Advanced Unicode set operations"
  };

  if (flagsStr) {
    const activeFlags = flagsStr.split("").filter((f, i, arr) => arr.indexOf(f) === i);
    activeFlags.forEach(f => {
      if (flagDescriptions[f]) {
        explanations.push({
          type: "flag",
          token: `Flag: ${f}`,
          title: `Flag '${f}'`,
          desc: flagDescriptions[f],
          category: "Configuration"
        });
      }
    });
  }

  // Parse pattern tokens iteratively
  let i = 0;
  const len = pattern.length;
  let groupCounter = 0;

  while (i < len) {
    const char = pattern[i];

    // Anchors
    if (char === "^") {
      explanations.push({
        type: "anchor",
        token: "^",
        title: "Beginning of String / Line",
        desc: "Matches the position at the start of the string (or start of a line if 'm' multiline flag is enabled).",
        category: "Anchor"
      });
      i++;
      continue;
    }

    if (char === "$") {
      explanations.push({
        type: "anchor",
        token: "$",
        title: "End of String / Line",
        desc: "Matches the position at the end of the string (or end of a line if 'm' multiline flag is enabled).",
        category: "Anchor"
      });
      i++;
      continue;
    }

    // Escaped sequences
    if (char === "\\") {
      const nextChar = pattern[i + 1];
      if (!nextChar) {
        explanations.push({
          type: "error",
          token: "\\",
          title: "Dangling Escape",
          desc: "Backslash at the end of pattern has no escaped character.",
          category: "Syntax Error"
        });
        break;
      }

      const escapeTokens = {
        d: { title: "Digit [0-9]", desc: "Matches any single ASCII decimal digit (0-9)." },
        D: { title: "Non-Digit", desc: "Matches any character that is NOT a decimal digit." },
        w: { title: "Word Character", desc: "Matches any ASCII letter, digit, or underscore [a-zA-Z0-9_]." },
        W: { title: "Non-Word Character", desc: "Matches any character that is NOT a letter, digit, or underscore." },
        s: { title: "Whitespace Character", desc: "Matches space, tab, newline, carriage return, or form feed." },
        S: { title: "Non-Whitespace Character", desc: "Matches any character that is NOT whitespace." },
        b: { title: "Word Boundary", desc: "Matches a position where a word character meets a non-word character or string boundary." },
        B: { title: "Non-Word Boundary", desc: "Matches any position that is NOT a word boundary." },
        n: { title: "Newline Character", desc: "Matches ASCII Line Feed (LF, \\n, 0x0A)." },
        r: { title: "Carriage Return", desc: "Matches ASCII Carriage Return (CR, \\r, 0x0D)." },
        t: { title: "Tab Character", desc: "Matches horizontal tab (\\t, 0x09)." }
      };

      if (escapeTokens[nextChar]) {
        explanations.push({
          type: "escape",
          token: `\\${nextChar}`,
          title: escapeTokens[nextChar].title,
          desc: escapeTokens[nextChar].desc,
          category: "Character Escape"
        });
      } else if (nextChar === "k" && pattern[i + 2] === "<") {
        // Named backreference \k<name>
        const closeIdx = pattern.indexOf(">", i + 3);
        if (closeIdx !== -1) {
          const name = pattern.substring(i + 3, closeIdx);
          explanations.push({
            type: "backref",
            token: `\\k<${name}>`,
            title: `Named Backreference: '${name}'`,
            desc: `Matches the exact text captured by the named group '${name}'.`,
            category: "Backreference"
          });
          i = closeIdx + 1;
          continue;
        }
      } else if (/\d/.test(nextChar)) {
        // Numbered backreference \1
        explanations.push({
          type: "backref",
          token: `\\${nextChar}`,
          title: `Numbered Backreference: Group #${nextChar}`,
          desc: `Matches the exact text captured by capturing group #${nextChar}.`,
          category: "Backreference"
        });
      } else {
        explanations.push({
          type: "literal",
          token: `\\${nextChar}`,
          title: `Escaped Literal: '${nextChar}'`,
          desc: `Matches the literal character '${nextChar}'.`,
          category: "Literal"
        });
      }
      i += 2;
      continue;
    }

    // Groups & Parentheses
    if (char === "(") {
      if (pattern.startsWith("(?<", i)) {
        const closeIdx = pattern.indexOf(">", i + 3);
        if (closeIdx !== -1) {
          const groupName = pattern.substring(i + 3, closeIdx);
          groupCounter++;
          explanations.push({
            type: "group",
            token: `(?<${groupName}>...)`,
            title: `Named Capture Group: '${groupName}'`,
            desc: `Creates a named capturing group '${groupName}' accessible in results and substitutions.`,
            category: "Grouping"
          });
          i = closeIdx + 1;
          continue;
        }
      } else if (pattern.startsWith("(?:", i)) {
        explanations.push({
          type: "group",
          token: "(?:...)",
          title: "Non-Capturing Group",
          desc: "Groups sub-expressions without saving the matched substring in numbered backreferences.",
          category: "Grouping"
        });
        i += 3;
        continue;
      } else if (pattern.startsWith("(?=", i)) {
        explanations.push({
          type: "lookaround",
          token: "(?=...)",
          title: "Positive Lookahead",
          desc: "Asserts that the sub-expression matches what immediately follows, without consuming characters.",
          category: "Lookaround"
        });
        i += 3;
        continue;
      } else if (pattern.startsWith("(?!", i)) {
        explanations.push({
          type: "lookaround",
          token: "(?!...)",
          title: "Negative Lookahead",
          desc: "Asserts that the sub-expression does NOT match what immediately follows.",
          category: "Lookaround"
        });
        i += 3;
        continue;
      } else if (pattern.startsWith("(?<=", i)) {
        explanations.push({
          type: "lookaround",
          token: "(?<=...)",
          title: "Positive Lookbehind",
          desc: "Asserts that the sub-expression matches what immediately precedes the current position.",
          category: "Lookaround"
        });
        i += 4;
        continue;
      } else if (pattern.startsWith("(?<!", i)) {
        explanations.push({
          type: "lookaround",
          token: "(?<!...)",
          title: "Negative Lookbehind",
          desc: "Asserts that the sub-expression does NOT match what immediately precedes.",
          category: "Lookaround"
        });
        i += 4;
        continue;
      } else {
        groupCounter++;
        explanations.push({
          type: "group",
          token: "(...)",
          title: `Capturing Group #${groupCounter}`,
          desc: `Groups sub-expressions and captures the matched text into backreference $${groupCounter}.`,
          category: "Grouping"
        });
        i++;
        continue;
      }
    }

    // Character Sets [...]
    if (char === "[") {
      let closeIdx = i + 1;
      // Handle escaped brackets or bracket at start [^]] or []]
      if (pattern[closeIdx] === "^") closeIdx++;
      if (pattern[closeIdx] === "]") closeIdx++;
      while (closeIdx < len && pattern[closeIdx] !== "]") {
        if (pattern[closeIdx] === "\\") closeIdx++;
        closeIdx++;
      }
      if (closeIdx < len && pattern[closeIdx] === "]") {
        const setContent = pattern.substring(i, closeIdx + 1);
        const isNegated = setContent.startsWith("[^");
        explanations.push({
          type: "set",
          token: setContent,
          title: isNegated ? "Negated Character Set" : "Character Set",
          desc: isNegated
            ? `Matches any character EXCEPT those specified in ${setContent}.`
            : `Matches any single character listed inside ${setContent}.`,
          category: "Character Class"
        });
        i = closeIdx + 1;
        continue;
      }
    }

    // Quantifiers
    if (char === "*") {
      const isLazy = pattern[i + 1] === "?";
      explanations.push({
        type: "quantifier",
        token: isLazy ? "*?" : "*",
        title: isLazy ? "0 or More Times (Lazy / Non-Greedy)" : "0 or More Times (Greedy)",
        desc: isLazy
          ? "Matches the preceding item zero or more times, matching as few characters as possible."
          : "Matches the preceding item zero or more times, matching as many characters as possible.",
        category: "Quantifier"
      });
      i += isLazy ? 2 : 1;
      continue;
    }

    if (char === "+") {
      const isLazy = pattern[i + 1] === "?";
      explanations.push({
        type: "quantifier",
        token: isLazy ? "+?" : "+",
        title: isLazy ? "1 or More Times (Lazy / Non-Greedy)" : "1 or More Times (Greedy)",
        desc: isLazy
          ? "Matches the preceding item one or more times, matching as few characters as possible."
          : "Matches the preceding item one or more times, matching as many characters as possible.",
        category: "Quantifier"
      });
      i += isLazy ? 2 : 1;
      continue;
    }

    if (char === "?") {
      explanations.push({
        type: "quantifier",
        token: "?",
        title: "Optional (0 or 1 Time)",
        desc: "Matches the preceding item zero or one time.",
        category: "Quantifier"
      });
      i++;
      continue;
    }

    if (char === "{") {
      const closeIdx = pattern.indexOf("}", i);
      if (closeIdx !== -1) {
        const rangeStr = pattern.substring(i, closeIdx + 1);
        const isLazy = pattern[closeIdx + 1] === "?";
        explanations.push({
          type: "quantifier",
          token: isLazy ? `${rangeStr}?` : rangeStr,
          title: `Custom Quantifier: ${rangeStr}`,
          desc: `Matches the preceding item within repetitions specified by ${rangeStr}${isLazy ? " (lazy mode)" : ""}.`,
          category: "Quantifier"
        });
        i = closeIdx + 1 + (isLazy ? 1 : 0);
        continue;
      }
    }

    // Alternation |
    if (char === "|") {
      explanations.push({
        type: "alternation",
        token: "|",
        title: "Alternation (OR)",
        desc: "Matches either the expression on the left or the expression on the right.",
        category: "Logic"
      });
      i++;
      continue;
    }

    // Dot .
    if (char === ".") {
      explanations.push({
        type: "wildcard",
        token: ".",
        title: "Any Character (Wildcard)",
        desc: "Matches any character (except line breaks, unless 's' dotAll flag is set).",
        category: "Character Class"
      });
      i++;
      continue;
    }

    // Collect consecutive plain literal characters
    let literalBuf = char;
    i++;
    while (
      i < len &&
      !"^$\\()[]{}*+?|.".includes(pattern[i])
    ) {
      literalBuf += pattern[i];
      i++;
    }

    explanations.push({
      type: "literal",
      token: literalBuf,
      title: `Literal: "${literalBuf}"`,
      desc: `Matches the exact literal text "${literalBuf}".`,
      category: "Literal"
    });
  }

  return explanations;
}

// ─── Code Snippet Generator Engine ──────────────────────────────────────────
function generateRegexCode(language, pattern, flags, testString, substitution) {
  const safePattern = (pattern || "").replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const safeRawPattern = pattern || "";
  const flagsStr = Object.entries(flags)
    .filter(([_, val]) => val)
    .map(([key]) => key)
    .join("");

  switch (language) {
    case "javascript":
      return `// JavaScript / TypeScript (Node.js & Browser)
const regex = new RegExp("${safePattern}", "${flagsStr}");
const text = \`${(testString || "").replace(/`/g, "\\`")}\`;

// 1. Find all matches
const matches = [...text.matchAll(regex)];
for (const match of matches) {
  console.log('Match found:', match[0], 'at index', match.index);
  if (match.groups) {
    console.log('Named groups:', match.groups);
  }
}

// 2. Replacement
const result = text.replace(regex, "${(substitution || "").replace(/"/g, '\\"')}");
console.log('Substituted result:\\n', result);`;

    case "python":
      return `# Python 3
import re

pattern = r"${safeRawPattern}"
flags = 0
${flags.i ? "flags |= re.IGNORECASE\n" : ""}${flags.m ? "flags |= re.MULTILINE\n" : ""}${flags.s ? "flags |= re.DOTALL\n" : ""}${flags.u ? "flags |= re.UNICODE\n" : ""}
text = """${testString || ""}"""

# 1. Find all matches with details
for match in re.finditer(pattern, text, flags):
    print(f"Match: {match.group(0)} at ({match.start()}, {match.end()})")
    if match.groupdict():
        print(f"  Named groups: {match.groupdict()}")

# 2. Substitution
sub_result = re.sub(pattern, r"${substitution || ""}", text, flags=flags)
print("\\nSubstituted result:\\n", sub_result)`;

    case "php":
      return `<?php
// PHP (PCRE)
$pattern = '/${safeRawPattern.replace(/\//g, "\\/")}/${flagsStr}';
$text = <<<'EOD'
${testString || ""}
EOD;

// 1. Find all matches
if (preg_match_all($pattern, $text, $matches, PREG_SET_ORDER | PREG_OFFSET_CAPTURE)) {
    foreach ($matches as $match) {
        echo "Match: " . $match[0][0] . " at offset " . $match[0][1] . "\\n";
    }
}

// 2. Replacement
$result = preg_replace($pattern, '${substitution || ""}', $text);
echo "\\nSubstituted text:\\n" . $result;
?>`;

    case "java":
      return `// Java (java.util.regex)
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class RegexExample {
    public static void main(String[] args) {
        int flags = 0;
        ${flags.i ? "flags |= Pattern.CASE_INSENSITIVE;\n        " : ""}${flags.m ? "flags |= Pattern.MULTILINE;\n        " : ""}${flags.s ? "flags |= Pattern.DOTALL;\n        " : ""}
        Pattern pattern = Pattern.compile("${safePattern}", flags);
        String text = "${(testString || "").replace(/\n/g, "\\n").replace(/"/g, '\\"')}";

        // 1. Find matches
        Matcher matcher = pattern.matcher(text);
        while (matcher.find()) {
            System.out.println("Match: " + matcher.group() + " at [" + matcher.start() + ", " + matcher.end() + "]");
        }

        // 2. Replacement
        String replaced = matcher.replaceAll("${(substitution || "").replace(/"/g, '\\"')}");
        System.out.println("Replaced: " + replaced);
    }
}`;

    case "csharp":
      return `// C# (.NET)
using System;
using System.Text.RegularExpressions;

class Program {
    static void Main() {
        RegexOptions options = RegexOptions.None;
        ${flags.i ? "options |= RegexOptions.IgnoreCase;\n        " : ""}${flags.m ? "options |= RegexOptions.Multiline;\n        " : ""}${flags.s ? "options |= RegexOptions.Singleline;\n        " : ""}
        string pattern = @"${safeRawPattern.replace(/"/g, '""')}";
        string text = @"${(testString || "").replace(/"/g, '""')}";

        Regex regex = new Regex(pattern, options);

        // 1. Find matches
        MatchCollection matches = regex.Matches(text);
        foreach (Match match in matches) {
            Console.WriteLine($"Match: {match.Value} at Index {match.Index}");
        }

        // 2. Replacement
        string result = regex.Replace(text, @"${(substitution || "").replace(/"/g, '""')}");
        Console.WriteLine($"Result: {result}");
    }
}`;

    case "go":
      return `// Go (Golang regexp package)
package main

import (
	"fmt"
	"regexp"
)

func main() {
	pattern := \`${safeRawPattern}\`
	text := \`${testString || ""}\`

	re := regexp.MustCompile(pattern)

	// 1. Find all matches with indices
	matches := re.FindAllStringSubmatchIndex(text, -1)
	for _, loc := range matches {
		fmt.Printf("Match: %s at [%d, %d]\\n", text[loc[0]:loc[1]], loc[0], loc[1])
	}

	// 2. Replacement
	result := re.ReplaceAllString(text, \`${substitution || ""}\`)
	fmt.Println("Result:", result)
}`;

    case "rust":
      return `// Rust (regex crate: cargo add regex)
use regex::Regex;

fn main() {
    let re = Regex::new(r"${safeRawPattern}").unwrap();
    let text = r#"${testString || ""}"#;

    // 1. Iterate matches
    for mat in re.find_iter(text) {
        println!("Match: '{}' at [{}, {}]", mat.as_str(), mat.start(), mat.end());
    }

    // 2. Replacement
    let result = re.replace_all(text, "${substitution || ""}");
    println!("Replaced: {}", result);
}`;

    case "ruby":
      return `# Ruby
pattern = /${safeRawPattern}/${flagsStr}
text = <<~TEXT
${testString || ""}
TEXT

# 1. Find matches with positions
text.scan(pattern) do
  match = Regexp.last_match
  puts "Match: #{match[0]} at #{match.begin(0)}..#{match.end(0)}"
end

# 2. Replacement
result = text.gsub(pattern, "${substitution || ""}")
puts "\\nSubstituted text:\\n" + result`;

    case "swift":
      return `// Swift (Foundation)
import Foundation

let pattern = "${safePattern}"
let text = "${(testString || "").replace(/\n/g, "\\n").replace(/"/g, '\\"')}"

do {
    let regex = try NSRegularExpression(pattern: pattern, options: [
        ${flags.i ? ".caseInsensitive, " : ""}${flags.m ? ".anchorsMatchLines, " : ""}${flags.s ? ".dotMatchesLineSeparators" : ""}
    ])
    let nsRange = NSRange(text.startIndex..., in: text)
    
    // 1. Matches
    let matches = regex.matches(in: text, options: [], range: nsRange)
    for match in matches {
        if let range = Range(match.range, in: text) {
            print("Match: \\(text[range])")
        }
    }
    
    // 2. Replace
    let replaced = regex.stringByReplacingMatches(in: text, options: [], range: nsRange, withTemplate: "${substitution || ""}")
    print("Replaced: \\(replaced)")
} catch {
    print("Invalid regex: \\(error)")
}`;

    case "bash":
      return `# Bash / Ripgrep / Sed
# 1. Grep / Ripgrep pattern search:
rg -P "${safeRawPattern}" input.txt

# 2. GNU Sed replacement:
sed -E 's/${safeRawPattern.replace(/\//g, "\\/")}/${(substitution || "").replace(/\//g, "\\/")}/${flags.g ? "g" : ""}${flags.i ? "i" : ""}' input.txt`;

    default:
      return "";
  }
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function RegexTester() {
  // ─── Core Inputs: DEFAULT ZERO DEMO DATA ────────────────────────────────────
  const [pattern, setPattern] = useState("");
  const [testString, setTestString] = useState("");
  const [substitution, setSubstitution] = useState("");
  const [splitLimit, setSplitLimit] = useState(0);

  // ─── Flag States ────────────────────────────────────────────────────────────
  const [flags, setFlags] = useState({
    g: true,  // global
    i: false, // ignoreCase
    m: true,  // multiline
    s: false, // dotAll
    u: false, // unicode
    y: false, // sticky
    d: false  // hasIndices
  });

  // ─── UI & Mode States ───────────────────────────────────────────────────────
  // 'match' | 'replace' | 'split' | 'explain' | 'codegen' | 'cheatsheet'
  const [activeTab, setActiveTab] = useState("match");
  const [selectedTheme, setSelectedTheme] = useState("violet");
  const [fontSize, setFontSize] = useState("text-sm"); // 'text-xs' | 'text-sm' | 'text-base'
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [wordWrap, setWordWrap] = useState(true);
  const [showWhitespace, setShowWhitespace] = useState(false);
  const [invertMatch, setInvertMatch] = useState(false);
  const [maxMatchesLimit, setMaxMatchesLimit] = useState(500);

  // Code Generator language state
  const [codeLang, setCodeLang] = useState("javascript");

  // Advanced Replace Option: Custom JavaScript Function
  const [useJsReplace, setUseJsReplace] = useState(false);
  const [jsReplaceCode, setJsReplaceCode] = useState("return match.toUpperCase();");

  // Filter for matches list
  const [matchSearchFilter, setMatchSearchFilter] = useState("");
  const [expandedMatchIndex, setExpandedMatchIndex] = useState(null);

  // Demo Preset Dropdown / Modal state
  const [showDemoMenu, setShowDemoMenu] = useState(false);

  // Hovered match index for sync highlight
  const [hoveredMatchIdx, setHoveredMatchIdx] = useState(null);

  // File upload input ref
  const fileInputRef = useRef(null);
  const testInputRef = useRef(null);
  const highlightOverlayRef = useRef(null);

  // ─── Load from Share URL Hash on Mount (if present) ─────────────────────────
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      try {
        const hash = window.location.hash.substring(1);
        if (hash.startsWith("data=")) {
          const jsonStr = decodeURIComponent(atob(hash.replace("data=", "")));
          const parsed = JSON.parse(jsonStr);
          if (parsed.p !== undefined) setPattern(parsed.p);
          if (parsed.t !== undefined) setTestString(parsed.t);
          if (parsed.s !== undefined) setSubstitution(parsed.s);
          if (parsed.f) {
            setFlags({
              g: !!parsed.f.g,
              i: !!parsed.f.i,
              m: !!parsed.f.m,
              s: !!parsed.f.s,
              u: !!parsed.f.u,
              y: !!parsed.f.y,
              d: !!parsed.f.d
            });
          }
          toast.success("Loaded shared Regex workspace!");
        }
      } catch (err) {
        // invalid hash, ignore and start clean
      }
    }
  }, []);

  // ─── Flags String Builder ───────────────────────────────────────────────────
  const flagsString = useMemo(() => {
    return Object.entries(flags)
      .filter(([_, enabled]) => enabled)
      .map(([flag]) => flag)
      .join("");
  }, [flags]);

  const toggleFlag = (flagKey) => {
    setFlags(prev => ({
      ...prev,
      [flagKey]: !prev[flagKey]
    }));
  };

  // ─── Regex Compilation & Safe Execution Engine ─────────────────────────────
  const evaluationResult = useMemo(() => {
    if (!pattern) {
      return {
        isValid: true,
        regex: null,
        error: null,
        matches: [],
        totalMatches: 0,
        totalGroups: 0,
        execTimeMs: 0,
        timeout: false
      };
    }

    let regex = null;
    try {
      regex = new RegExp(pattern, flagsString);
    } catch (err) {
      return {
        isValid: false,
        regex: null,
        error: err.message,
        matches: [],
        totalMatches: 0,
        totalGroups: 0,
        execTimeMs: 0,
        timeout: false
      };
    }

    if (!testString) {
      return {
        isValid: true,
        regex,
        error: null,
        matches: [],
        totalMatches: 0,
        totalGroups: 0,
        execTimeMs: 0,
        timeout: false
      };
    }

    const startTime = performance.now();
    const matches = [];
    let groupCountMax = 0;
    let timeout = false;

    try {
      if (flags.g) {
        let match;
        let iterations = 0;
        const maxIterations = maxMatchesLimit;

        // Reset regex index
        regex.lastIndex = 0;

        while ((match = regex.exec(testString)) !== null) {
          iterations++;
          const matchIndex = match.index;
          const matchText = match[0];
          const start = matchIndex;
          const end = matchIndex + matchText.length;

          // Extract captured groups
          const groups = [];
          for (let g = 1; g < match.length; g++) {
            groups.push({
              index: g,
              value: match[g] !== undefined ? match[g] : null,
              name: null
            });
          }

          // Extract named groups if present
          const namedGroups = match.groups ? { ...match.groups } : null;
          if (namedGroups) {
            Object.keys(namedGroups).forEach(name => {
              const val = namedGroups[name];
              const existing = groups.find(grp => grp.value === val);
              if (existing) {
                existing.name = name;
              }
            });
          }

          if (groups.length > groupCountMax) {
            groupCountMax = groups.length;
          }

          // Line and column lookup
          const textBefore = testString.substring(0, start);
          const lines = textBefore.split("\n");
          const lineNum = lines.length;
          const colNum = lines[lines.length - 1].length + 1;

          matches.push({
            id: iterations,
            match: matchText,
            start,
            end,
            length: matchText.length,
            groups,
            namedGroups,
            line: lineNum,
            col: colNum
          });

          // Prevent zero-length infinite loop
          if (match[0].length === 0) {
            regex.lastIndex++;
          }

          // Safety guard against massive loops or timeout
          if (iterations >= maxIterations || performance.now() - startTime > 100) {
            if (performance.now() - startTime > 100) timeout = true;
            break;
          }
        }
      } else {
        // Single match
        const match = regex.exec(testString);
        if (match) {
          const matchIndex = match.index;
          const matchText = match[0];
          const start = matchIndex;
          const end = matchIndex + matchText.length;

          const groups = [];
          for (let g = 1; g < match.length; g++) {
            groups.push({
              index: g,
              value: match[g] !== undefined ? match[g] : null,
              name: null
            });
          }

          const namedGroups = match.groups ? { ...match.groups } : null;
          if (namedGroups) {
            Object.keys(namedGroups).forEach(name => {
              const val = namedGroups[name];
              const existing = groups.find(grp => grp.value === val);
              if (existing) {
                existing.name = name;
              }
            });
          }

          groupCountMax = groups.length;

          const textBefore = testString.substring(0, start);
          const lines = textBefore.split("\n");
          const lineNum = lines.length;
          const colNum = lines[lines.length - 1].length + 1;

          matches.push({
            id: 1,
            match: matchText,
            start,
            end,
            length: matchText.length,
            groups,
            namedGroups,
            line: lineNum,
            col: colNum
          });
        }
      }
    } catch (execErr) {
      return {
        isValid: false,
        regex,
        error: `Runtime execution error: ${execErr.message}`,
        matches: [],
        totalMatches: 0,
        totalGroups: 0,
        execTimeMs: 0,
        timeout: false
      };
    }

    const execTimeMs = (performance.now() - startTime).toFixed(3);

    return {
      isValid: true,
      regex,
      error: null,
      matches,
      totalMatches: matches.length,
      totalGroups: groupCountMax,
      execTimeMs,
      timeout
    };
  }, [pattern, flagsString, testString, maxMatchesLimit, flags.g]);

  // ─── Substitution Calculation Engine ────────────────────────────────────────
  const substitutionResult = useMemo(() => {
    if (!evaluationResult.isValid || !evaluationResult.regex || !testString) {
      return { text: testString || "", count: 0, error: null };
    }

    try {
      if (useJsReplace) {
        // Custom JavaScript replacement function
        let replaceCount = 0;
        /* eslint-disable no-new-func */
        const customFn = new Function(
          "match",
          "p1",
          "p2",
          "p3",
          "offset",
          "string",
          "groups",
          jsReplaceCode
        );
        /* eslint-enable no-new-func */

        const replaced = testString.replace(evaluationResult.regex, (...args) => {
          replaceCount++;
          try {
            return customFn(...args);
          } catch (e) {
            return args[0]; // fallback
          }
        });

        return { text: replaced, count: replaceCount, error: null };
      } else {
        // Standard token replacement
        let replaceCount = 0;
        const replaced = testString.replace(evaluationResult.regex, (...args) => {
          replaceCount++;
          // Standard JS replacement handling
          return substitution.replace(/\$([$&`']|\d+|\{([^}]+)\}|<([^>]+)>)/g, (orig, token, bracketName, angleName) => {
            const name = bracketName || angleName;
            if (name) {
              const groupsObj = args[args.length - 1];
              return (groupsObj && groupsObj[name] !== undefined) ? groupsObj[name] : orig;
            }
            if (token === "$") return "$";
            if (token === "&") return args[0];
            if (token === "`") return args[args.length - 2] ? testString.slice(0, args[args.length - 2]) : "";
            if (token === "'") return testString.slice((args[args.length - 2] || 0) + args[0].length);
            const num = parseInt(token, 10);
            if (!isNaN(num) && num > 0 && num < args.length - 2) {
              return args[num] !== undefined ? args[num] : "";
            }
            return orig;
          });
        });

        return { text: replaced, count: replaceCount, error: null };
      }
    } catch (subErr) {
      return { text: "", count: 0, error: subErr.message };
    }
  }, [evaluationResult, testString, substitution, useJsReplace, jsReplaceCode]);

  // ─── Split Calculation Engine ───────────────────────────────────────────────
  const splitResult = useMemo(() => {
    if (!evaluationResult.isValid || !evaluationResult.regex || !testString) {
      return [];
    }

    try {
      const parts = splitLimit > 0
        ? testString.split(evaluationResult.regex, splitLimit)
        : testString.split(evaluationResult.regex);
      return parts;
    } catch (e) {
      return [];
    }
  }, [evaluationResult, testString, splitLimit]);

  // ─── Explain AST Engine ─────────────────────────────────────────────────────
  const astExplanations = useMemo(() => {
    return explainRegexAST(pattern, flagsString);
  }, [pattern, flagsString]);

  // Current Theme colors
  const themeObj = useMemo(() => {
    return THEMES.find(t => t.id === selectedTheme) || THEMES[0];
  }, [selectedTheme]);

  // ─── Synchronized Scroll Handling ───────────────────────────────────────────
  const handleScroll = (e) => {
    if (highlightOverlayRef.current) {
      highlightOverlayRef.current.scrollTop = e.target.scrollTop;
      highlightOverlayRef.current.scrollLeft = e.target.scrollLeft;
    }
  };

  // ─── Load Demo Preset ───────────────────────────────────────────────────────
  const loadPreset = (preset) => {
    setPattern(preset.pattern);
    setFlags(preset.flags);
    setTestString(preset.testString);
    setSubstitution(preset.substitution || "");
    if (preset.splitLimit !== undefined) setSplitLimit(preset.splitLimit);
    setShowDemoMenu(false);
    toast.success(`Loaded "${preset.title}" demo data!`);
  };

  // ─── Clear All Inputs (Back to Zero Data) ───────────────────────────────────
  const handleClearAll = () => {
    setPattern("");
    setTestString("");
    setSubstitution("");
    setSplitLimit(0);
    setExpandedMatchIndex(null);
    setHoveredMatchIdx(null);
    if (window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname);
    }
    toast.info("Cleared all fields back to blank state.");
  };

  // ─── Auto Escape Tool ───────────────────────────────────────────────────────
  const handleAutoEscape = () => {
    if (!pattern) {
      toast.warning("Pattern is empty. Enter text to escape.");
      return;
    }
    const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    setPattern(escaped);
    toast.success("Escaped special regex characters for literal matching!");
  };

  // ─── Share Workspace URL ────────────────────────────────────────────────────
  const handleShareWorkspace = () => {
    try {
      const data = {
        p: pattern,
        t: testString,
        s: substitution,
        f: flags
      };
      const encoded = btoa(encodeURIComponent(JSON.stringify(data)));
      const url = `${window.location.origin}${window.location.pathname}#data=${encoded}`;
      navigator.clipboard.writeText(url);
      window.history.replaceState(null, "", `#data=${encoded}`);
      toast.success("Shareable URL copied to clipboard!");
    } catch (err) {
      toast.error("Failed to generate share URL.");
    }
  };

  // ─── File Upload Handler ────────────────────────────────────────────────────
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File is too large (> 5MB). Please upload a smaller file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === "string") {
        setTestString(content);
        toast.success(`Loaded file: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
      }
    };
    reader.readAsText(file);
  };

  // ─── Export Matches ─────────────────────────────────────────────────────────
  const handleExportMatches = (format = "json") => {
    if (evaluationResult.matches.length === 0) {
      toast.warning("No matches available to export.");
      return;
    }

    let content = "";
    let mimeType = "text/plain";
    let extension = "txt";

    if (format === "json") {
      content = JSON.stringify(evaluationResult.matches, null, 2);
      mimeType = "application/json";
      extension = "json";
    } else if (format === "csv") {
      const headers = ["Index", "Match", "Start", "End", "Length", "Line", "Col", "Groups"];
      const rows = evaluationResult.matches.map(m => [
        m.id,
        `"${m.match.replace(/"/g, '""')}"`,
        m.start,
        m.end,
        m.length,
        m.line,
        m.col,
        `"${m.groups.map(g => (g.name ? `${g.name}: ` : "") + (g.value || "")).join("; ").replace(/"/g, '""')}"`
      ]);
      content = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
      mimeType = "text/csv";
      extension = "csv";
    } else {
      content = evaluationResult.matches.map(m => m.match).join("\n");
      mimeType = "text/plain";
      extension = "txt";
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `regex-matches-${Date.now()}.${extension}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${evaluationResult.matches.length} matches as .${extension}!`);
  };

  // ─── Render Highlighted Overlay Text ────────────────────────────────────────
  const renderHighlightedText = () => {
    if (!testString) {
      return (
        <span className="text-muted-foreground/40 italic">
          Test string is empty. Type or paste your sample text above, or click "Load Demo Data" to test.
        </span>
      );
    }

    if (!evaluationResult.isValid || evaluationResult.matches.length === 0) {
      // Plain text render (with optional whitespace dots)
      if (showWhitespace) {
        return testString
          .replace(/ /g, "·")
          .replace(/\t/g, "⇥\t")
          .replace(/\n/g, "↵\n");
      }
      return testString;
    }

    const chunks = [];
    let lastIndex = 0;

    evaluationResult.matches.forEach((m, idx) => {
      // Unmatched prefix chunk
      if (m.start > lastIndex) {
        const unmatchedText = testString.substring(lastIndex, m.start);
        chunks.push(
          <span key={`unmatch-${lastIndex}`} className={invertMatch ? themeObj.matchBg : ""}>
            {showWhitespace ? unmatchedText.replace(/ /g, "·").replace(/\t/g, "⇥\t").replace(/\n/g, "↵\n") : unmatchedText}
          </span>
        );
      }

      // Matched chunk
      const matchText = m.match;
      const isHovered = hoveredMatchIdx === idx;
      const isAlt = idx % 2 === 1;

      chunks.push(
        <mark
          key={`match-${m.id}-${m.start}`}
          onMouseEnter={() => setHoveredMatchIdx(idx)}
          onMouseLeave={() => setHoveredMatchIdx(null)}
          className={cn(
            "rounded-sm px-0.5 transition-all duration-150 relative inline font-mono",
            invertMatch ? "bg-transparent text-foreground" : (isAlt ? themeObj.matchAltBg : themeObj.matchBg),
            isHovered && "ring-2 ring-brandColor ring-offset-1 font-semibold z-10"
          )}
          title={`Match #${m.id} at [${m.start}, ${m.end}]`}
        >
          {showWhitespace ? matchText.replace(/ /g, "·").replace(/\t/g, "⇥\t").replace(/\n/g, "↵\n") : matchText}
        </mark>
      );

      lastIndex = m.end;
    });

    // Trailing unmatched chunk
    if (lastIndex < testString.length) {
      const tailText = testString.substring(lastIndex);
      chunks.push(
        <span key={`unmatch-tail`} className={invertMatch ? themeObj.matchBg : ""}>
          {showWhitespace ? tailText.replace(/ /g, "·").replace(/\t/g, "⇥\t").replace(/\n/g, "↵\n") : tailText}
        </span>
      );
    }

    return chunks;
  };

  // ─── Filtered Matches List ──────────────────────────────────────────────────
  const filteredMatches = useMemo(() => {
    if (!matchSearchFilter.trim()) return evaluationResult.matches;
    const q = matchSearchFilter.toLowerCase();
    return evaluationResult.matches.filter(m =>
      m.match.toLowerCase().includes(q) ||
      m.groups.some(g => g.value && g.value.toLowerCase().includes(q)) ||
      (m.namedGroups && Object.entries(m.namedGroups).some(([k, v]) => k.toLowerCase().includes(q) || (v && v.toLowerCase().includes(q))))
    );
  }, [evaluationResult.matches, matchSearchFilter]);

  return (
    <ToolPageShell widthClassName="max-w-7xl">
      <div className="flex flex-col gap-6 w-full text-foreground pb-12">
        
        {/* ─── Hero Header & Toolbar ────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-brandColor/10 text-brandColor dark:bg-brandColor/20 border border-brandColor/20">
                <Code2 className="w-6 h-6" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Regex Tester & Debugger
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-brandColor/10 text-brandColor border border-brandColor/20 hidden sm:inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> ECMAScript & PCRE
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1.5 max-w-2xl">
              Professional, real-time regular expression tester with interactive match inspection, syntax explanation, instant substitutions, multi-language code generation, and zero initial demo data.
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Demo Data Button with Dropdown Menu */}
            <div className="relative">
              <button
                id="demo-data-button"
                onClick={() => setShowDemoMenu(!showDemoMenu)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-brandColor to-purple-600 hover:from-brandColorHover hover:to-purple-700 text-white shadow-md shadow-brandColor/20 transition-all active:scale-95 cursor-pointer"
                title="Click to load ready-to-test regex demo data"
              >
                <Sparkles className="w-4 h-4" />
                <span>Load Demo Data</span>
                <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", showDemoMenu && "rotate-180")} />
              </button>

              {/* Demo Presets Dropdown */}
              {showDemoMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowDemoMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-card border border-border shadow-2xl z-50 p-2 animate-fadeIn backdrop-blur-xl">
                    <div className="px-3 py-2 border-b border-border/50 flex items-center justify-between">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Select Demo Scenario
                      </span>
                      <span className="text-[11px] text-brandColor font-medium">
                        {DEMO_PRESETS.length} presets
                      </span>
                    </div>
                    <div className="max-h-80 overflow-y-auto divide-y divide-border/30 py-1">
                      {DEMO_PRESETS.map(preset => (
                        <button
                          key={preset.id}
                          onClick={() => loadPreset(preset)}
                          className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-muted/70 transition-colors flex items-start gap-3 group"
                        >
                          <div className="p-2 rounded-lg bg-brandColor/10 text-brandColor group-hover:bg-brandColor group-hover:text-white transition-colors shrink-0 mt-0.5">
                            <Zap className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-foreground group-hover:text-brandColor transition-colors truncate">
                              {preset.title}
                            </div>
                            <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                              {preset.description}
                            </p>
                            <code className="text-[10px] text-muted-foreground/80 font-mono block truncate mt-1 bg-muted px-1.5 py-0.5 rounded border border-border/40">
                              /{preset.pattern}/{Object.entries(preset.flags).filter(([_, v]) => v).map(([k]) => k).join("")}
                            </code>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Clear All Button */}
            <button
              onClick={handleClearAll}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium border border-border/80 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors active:scale-95 cursor-pointer"
              title="Clear all fields back to blank"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>

            {/* Share Workspace Button */}
            <button
              onClick={handleShareWorkspace}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium border border-border/80 hover:bg-muted transition-colors active:scale-95 cursor-pointer"
              title="Generate and copy shareable link"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Share</span>
            </button>

            {/* Auto Escape Helper */}
            <button
              onClick={handleAutoEscape}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium border border-border/80 hover:bg-muted transition-colors active:scale-95 cursor-pointer"
              title="Escape special regex characters in pattern for literal search"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Auto-Escape</span>
            </button>
          </div>
        </div>

        {/* ─── Main Pattern Input Box & Flags Strip ───────────────────────── */}
        <div className="flex flex-col gap-3 p-4 sm:p-5 rounded-2xl bg-card border border-border shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <label htmlFor="regex-pattern-input" className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-brandColor" />
              <span>Regular Expression Pattern</span>
            </label>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>Execution Time:</span>
              <span className={cn("font-mono font-bold", evaluationResult.execTimeMs > 10 ? "text-amber-500" : "text-emerald-500")}>
                {evaluationResult.execTimeMs} ms
              </span>
            </div>
          </div>

          {/* Regex Input Bar */}
          <div className="relative flex items-center rounded-xl bg-background border border-border/80 focus-within:border-brandColor focus-within:ring-2 focus-within:ring-brandColor/20 transition-all font-mono text-sm sm:text-base">
            <span className="pl-3.5 pr-1 text-muted-foreground/60 select-none font-bold text-lg">/</span>
            <input
              id="regex-pattern-input"
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="Enter regex pattern here (e.g. [a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})"
              className="w-full py-3 bg-transparent outline-none text-foreground placeholder:text-muted-foreground/40 font-mono"
              spellCheck={false}
              autoComplete="off"
            />
            <span className="px-1 text-muted-foreground/60 select-none font-bold text-lg">/</span>
            <span className="pr-3.5 font-bold text-brandColor select-none tracking-widest text-sm">
              {flagsString || "—"}
            </span>
          </div>

          {/* Error Banner if Regex is Invalid */}
          {!evaluationResult.isValid && evaluationResult.error && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold">Invalid Regular Expression:</span>{" "}
                <span>{evaluationResult.error}</span>
              </div>
            </div>
          )}

          {/* Timeout Banner */}
          {evaluationResult.timeout && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Catastrophic Backtracking Guard:</span> Execution paused after 100ms to prevent browser freeze. Consider optimizing your quantifiers (e.g. avoid nested greedy loops).
              </div>
            </div>
          )}

          {/* Interactive Flags Modifier Strip */}
          <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-border/40">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-semibold text-muted-foreground mr-1">Flags:</span>
              {[
                { key: "g", label: "global", desc: "g - Global match (all occurrences)" },
                { key: "i", label: "ignore case", desc: "i - Case-insensitive match" },
                { key: "m", label: "multiline", desc: "m - Multiline mode (^ and $ match line bounds)" },
                { key: "s", label: "dotAll", desc: "s - Dot matches newlines (\\n)" },
                { key: "u", label: "unicode", desc: "u - Full Unicode pattern support" },
                { key: "y", label: "sticky", desc: "y - Match only from lastIndex" },
                { key: "d", label: "hasIndices", desc: "d - Generate substring match indices" }
              ].map(({ key, label, desc }) => (
                <button
                  key={key}
                  onClick={() => toggleFlag(key)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all border cursor-pointer",
                    flags[key]
                      ? "bg-brandColor text-white border-brandColor shadow-sm shadow-brandColor/20"
                      : "bg-muted/50 text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                  )}
                  title={desc}
                >
                  <span className="font-bold uppercase">{key}</span>
                  <span className="ml-1 text-[10px] font-normal opacity-80 hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>

            {/* Quick Stats Pill */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1 font-mono">
                <span className="font-bold text-foreground">{evaluationResult.totalMatches}</span>
                <span>matches</span>
              </div>
              <div className="flex items-center gap-1 font-mono">
                <span className="font-bold text-foreground">{evaluationResult.totalGroups}</span>
                <span>groups</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Mode Selector Tabs ─────────────────────────────────────────── */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-card border border-border/80 overflow-x-auto">
          {[
            { id: "match", label: "Match & Test", icon: Eye, count: evaluationResult.totalMatches },
            { id: "replace", label: "Replace / Substitute", icon: ArrowRightLeft, count: substitutionResult.count },
            { id: "split", label: "Split String", icon: Scissors, count: splitResult.length },
            { id: "explain", label: "Regex Explainer (AST)", icon: HelpCircle, count: astExplanations.length },
            { id: "codegen", label: "Code Generator (10 Languages)", icon: FileCode },
            { id: "cheatsheet", label: "Cheatsheet & Library", icon: BookOpen }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer",
                  isActive
                    ? "bg-brandColor text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={cn(
                    "px-1.5 py-0.2 rounded-full text-[10px] font-mono",
                    isActive ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                  )}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ─── TAB CONTENT 1: MATCH & TEST ────────────────────────────────── */}
        {activeTab === "match" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Synchronized Highlighting Textarea & Controls (8 cols) */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="flex flex-col rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
                
                {/* Editor Header Bar & Customization Controls */}
                <div className="flex items-center justify-between flex-wrap gap-2 px-4 py-2.5 bg-muted/30 border-b border-border">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-brandColor" />
                      <span>Test String</span>
                    </span>
                    <span className="text-[11px] font-mono text-muted-foreground">
                      ({testString.length} chars, {testString ? testString.split("\n").length : 0} lines)
                    </span>
                  </div>

                  {/* Editor Customization Toggles */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Whitespace Visualizer Toggle */}
                    <button
                      onClick={() => setShowWhitespace(!showWhitespace)}
                      className={cn(
                        "px-2 py-1 rounded text-[11px] font-medium border transition-colors cursor-pointer",
                        showWhitespace ? "bg-brandColor/15 border-brandColor text-brandColor" : "border-border/60 hover:bg-muted text-muted-foreground"
                      )}
                      title="Show invisible whitespace characters (spaces, tabs, newlines)"
                    >
                      <span>· Whitespace</span>
                    </button>

                    {/* Invert Match Toggle */}
                    <button
                      onClick={() => setInvertMatch(!invertMatch)}
                      className={cn(
                        "px-2 py-1 rounded text-[11px] font-medium border transition-colors cursor-pointer",
                        invertMatch ? "bg-brandColor/15 border-brandColor text-brandColor" : "border-border/60 hover:bg-muted text-muted-foreground"
                      )}
                      title="Invert highlight to show non-matching portions"
                    >
                      <span>Invert</span>
                    </button>

                    {/* Word Wrap Toggle */}
                    <button
                      onClick={() => setWordWrap(!wordWrap)}
                      className={cn(
                        "px-2 py-1 rounded text-[11px] font-medium border transition-colors cursor-pointer",
                        wordWrap ? "bg-brandColor/15 border-brandColor text-brandColor" : "border-border/60 hover:bg-muted text-muted-foreground"
                      )}
                      title="Toggle Word Wrap"
                    >
                      <span>Wrap</span>
                    </button>

                    {/* Theme Accent Picker */}
                    <select
                      value={selectedTheme}
                      onChange={(e) => setSelectedTheme(e.target.value)}
                      className="px-2 py-1 rounded text-[11px] bg-background border border-border/60 text-foreground outline-none font-medium cursor-pointer"
                      title="Select Highlight Accent Colorway"
                    >
                      {THEMES.map(th => (
                        <option key={th.id} value={th.id}>{th.name}</option>
                      ))}
                    </select>

                    {/* Font Size Picker */}
                    <select
                      value={fontSize}
                      onChange={(e) => setFontSize(e.target.value)}
                      className="px-2 py-1 rounded text-[11px] bg-background border border-border/60 text-foreground outline-none font-medium cursor-pointer"
                      title="Select Font Size"
                    >
                      <option value="text-xs">12px</option>
                      <option value="text-sm">14px</option>
                      <option value="text-base">16px</option>
                    </select>

                    {/* Upload File Button */}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                      title="Upload text or log file"
                    >
                      <Upload className="w-3.5 h-3.5" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".txt,.log,.json,.csv,.md,.html,.js,.py"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Dual-Layer Synchronized Textarea & Highlight Overlay */}
                <div className="relative min-h-[320px] max-h-[500px] overflow-hidden flex">
                  {/* Optional Line Numbers Gutter */}
                  {showLineNumbers && (
                    <div className="select-none py-3 px-2 bg-muted/20 border-r border-border/50 text-right text-[11px] font-mono text-muted-foreground/50 shrink-0 min-w-[2.5rem] overflow-hidden">
                      {(testString ? testString.split("\n") : [""]).map((_, idx) => (
                        <div key={`line-${idx + 1}`}>{idx + 1}</div>
                      ))}
                    </div>
                  )}

                  {/* Container for overlay + textarea */}
                  <div className="relative flex-1 min-h-[320px] max-h-[500px] overflow-hidden">
                    {/* Layer 1: Formatted Syntax Highlight Backdrop */}
                    <div
                      ref={highlightOverlayRef}
                      aria-hidden="true"
                      className={cn(
                        "absolute inset-0 p-3 font-mono pointer-events-none overflow-auto select-none whitespace-pre",
                        wordWrap ? "whitespace-pre-wrap break-words" : "whitespace-pre",
                        fontSize
                      )}
                      style={{ margin: 0 }}
                    >
                      {renderHighlightedText()}
                    </div>

                    {/* Layer 2: Transparent Native Editable Textarea */}
                    <textarea
                      ref={testInputRef}
                      value={testString}
                      onChange={(e) => setTestString(e.target.value)}
                      onScroll={handleScroll}
                      placeholder="Type or paste your test string here, or click 'Load Demo Data' button to test with realistic scenarios..."
                      className={cn(
                        "absolute inset-0 w-full h-full p-3 font-mono bg-transparent text-transparent caret-foreground outline-none resize-none overflow-auto",
                        wordWrap ? "whitespace-pre-wrap break-words" : "whitespace-pre",
                        fontSize
                      )}
                      spellCheck={false}
                    />
                  </div>
                </div>

                {/* Textarea Bottom Quick Bar */}
                <div className="flex items-center justify-between px-4 py-2 bg-muted/20 border-t border-border/40 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(testString);
                        toast.success("Test string copied to clipboard!");
                      }}
                      className="hover:text-foreground transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy Text</span>
                    </button>
                    <span>•</span>
                    <button
                      onClick={() => setTestString("")}
                      className="hover:text-destructive transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Clear Text</span>
                    </button>
                  </div>

                  <div className="text-[11px] text-muted-foreground/70">
                    Type pattern above to test live
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Matches Inspector & Capture Groups Tree (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="flex flex-col rounded-2xl bg-card border border-border shadow-sm p-4 h-full min-h-[380px]">
                
                {/* Header with Search Filter & Export */}
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-border/60">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Match Inspector
                    </span>
                    <span className={cn("px-2 py-0.5 rounded-full text-xs font-mono font-bold", themeObj.badgeClass)}>
                      {evaluationResult.totalMatches} found
                    </span>
                  </div>

                  {/* Export Options */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleExportMatches("json")}
                      className="p-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-1 cursor-pointer"
                      title="Download matches as JSON"
                    >
                      <FileJson className="w-3.5 h-3.5" />
                      <span className="text-[10px]">JSON</span>
                    </button>
                    <button
                      onClick={() => handleExportMatches("csv")}
                      className="p-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-1 cursor-pointer"
                      title="Download matches as CSV"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span className="text-[10px]">CSV</span>
                    </button>
                  </div>
                </div>

                {/* Filter Search Input */}
                {evaluationResult.matches.length > 5 && (
                  <div className="relative my-2.5">
                    <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={matchSearchFilter}
                      onChange={(e) => setMatchSearchFilter(e.target.value)}
                      placeholder="Filter matches or groups..."
                      className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-background border border-border/70 text-xs text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-brandColor"
                    />
                  </div>
                )}

                {/* Matches List Body */}
                <div className="flex-1 overflow-y-auto max-h-[460px] divide-y divide-border/40 pr-1 mt-2">
                  {evaluationResult.matches.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground/60">
                      <Search className="w-8 h-8 stroke-[1.5] mb-2 opacity-50" />
                      <p className="text-xs font-medium text-foreground">No matches found</p>
                      <p className="text-[11px] max-w-xs mt-1">
                        {!pattern
                          ? "Enter a regular expression pattern and test string, or load demo data."
                          : "Your regex didn't match anything in the current test string."}
                      </p>
                      {!testString && (
                        <button
                          onClick={() => loadPreset(DEMO_PRESETS[0])}
                          className="mt-3 px-3 py-1.5 rounded-lg text-xs font-semibold bg-brandColor/10 text-brandColor hover:bg-brandColor hover:text-white transition-colors cursor-pointer"
                        >
                          Load Email Demo Preset
                        </button>
                      )}
                    </div>
                  ) : (
                    filteredMatches.map((m, idx) => {
                      const isExpanded = expandedMatchIndex === idx;
                      const isHovered = hoveredMatchIdx === idx;
                      return (
                        <div
                          key={`match-card-${m.id}`}
                          onMouseEnter={() => setHoveredMatchIdx(idx)}
                          onMouseLeave={() => setHoveredMatchIdx(null)}
                          className={cn(
                            "py-2.5 px-2 rounded-xl transition-all",
                            isHovered ? "bg-muted/80" : "hover:bg-muted/40"
                          )}
                        >
                          {/* Top Row: Match index, span, copy button */}
                          <div className="flex items-center justify-between gap-2">
                            <button
                              onClick={() => setExpandedMatchIndex(isExpanded ? null : idx)}
                              className="flex items-center gap-2 text-left flex-1 min-w-0 cursor-pointer"
                            >
                              <span className={cn(
                                "w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-mono font-bold shrink-0",
                                idx % 2 === 1 ? "bg-indigo-500/20 text-indigo-400" : "bg-brandColor/20 text-brandColor"
                              )}>
                                #{m.id}
                              </span>
                              <span className="text-xs font-mono font-semibold text-foreground truncate">
                                {m.match || <span className="italic opacity-50">Empty Match</span>}
                              </span>
                            </button>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="text-[10px] font-mono text-muted-foreground/70">
                                [{m.start}..{m.end}]
                              </span>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(m.match);
                                  toast.success(`Copied match #${m.id}`);
                                }}
                                className="p-1 rounded hover:bg-background text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                title="Copy match value"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => setExpandedMatchIndex(isExpanded ? null : idx)}
                                className="p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                              >
                                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>

                          {/* Expanded Capture Groups Breakdown */}
                          {isExpanded && (
                            <div className="mt-2.5 pl-7 pr-2 flex flex-col gap-1.5 text-xs animate-fadeIn">
                              <div className="text-[10px] font-mono text-muted-foreground">
                                Line {m.line}, Column {m.col} • Length: {m.length}
                              </div>

                              {m.groups.length > 0 ? (
                                <div className="flex flex-col gap-1 mt-1 bg-background/60 p-2 rounded-lg border border-border/50">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                    Captured Groups ({m.groups.length}):
                                  </span>
                                  {m.groups.map(grp => (
                                    <div key={`grp-${grp.index}`} className="flex items-center justify-between gap-2 py-0.5">
                                      <div className="flex items-center gap-1.5 truncate">
                                        <span className="px-1.5 py-0.2 rounded bg-muted text-[10px] font-mono font-bold text-muted-foreground">
                                          {grp.name ? `$${grp.index} (${grp.name})` : `$${grp.index}`}
                                        </span>
                                        <span className="font-mono text-foreground truncate">
                                          {grp.value !== null ? grp.value : <span className="opacity-40 italic">undefined</span>}
                                        </span>
                                      </div>
                                      {grp.value && (
                                        <button
                                          onClick={() => {
                                            navigator.clipboard.writeText(grp.value);
                                            toast.success(`Copied group ${grp.name || `$${grp.index}`}`);
                                          }}
                                          className="p-0.5 text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
                                          title="Copy group value"
                                        >
                                          <Copy className="w-2.5 h-2.5" />
                                        </button>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-[11px] text-muted-foreground/60 italic">
                                  No capturing groups in this match.
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Footer with Copy All Matches */}
                {evaluationResult.matches.length > 0 && (
                  <div className="pt-3 mt-2 border-t border-border/60 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground text-[11px]">
                      Showing {filteredMatches.length} of {evaluationResult.totalMatches} matches
                    </span>
                    <button
                      onClick={() => {
                        const allMatches = evaluationResult.matches.map(m => m.match).join("\n");
                        navigator.clipboard.writeText(allMatches);
                        toast.success(`Copied all ${evaluationResult.totalMatches} matches!`);
                      }}
                      className="font-semibold text-brandColor hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy All Matches</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB CONTENT 2: REPLACE / SUBSTITUTION ───────────────────────── */}
        {activeTab === "replace" && (
          <div className="flex flex-col gap-6">
            <div className="p-5 rounded-2xl bg-card border border-border shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <ArrowRightLeft className="w-4 h-4 text-brandColor" />
                    <span>Substitution Pattern Configuration</span>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Substitute regex matches with formatted tokens ($1, $2, $&, $`, $', $&lt;name&gt;) or custom JS function.
                  </p>
                </div>

                {/* Toggle Custom JS Replacer */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Custom JS Function:</span>
                  <button
                    onClick={() => setUseJsReplace(!useJsReplace)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors cursor-pointer",
                      useJsReplace ? "bg-brandColor text-white border-brandColor" : "bg-muted text-muted-foreground border-border hover:text-foreground"
                    )}
                  >
                    {useJsReplace ? "Enabled" : "Disabled"}
                  </button>
                </div>
              </div>

              {!useJsReplace ? (
                /* Standard Substitution Pattern Input */
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 rounded-xl bg-background border border-border px-3 py-2 font-mono text-sm focus-within:border-brandColor focus-within:ring-2 focus-within:ring-brandColor/20 transition-all">
                    <span className="text-muted-foreground text-xs select-none">Pattern:</span>
                    <input
                      type="text"
                      value={substitution}
                      onChange={(e) => setSubstitution(e.target.value)}
                      placeholder="e.g. [$1 at $<domain>] or [MASKED-$4]"
                      className="w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground/40 font-mono"
                    />
                  </div>

                  {/* Token Reference Pill Helpers */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[11px] text-muted-foreground">
                    <span>Quick tokens:</span>
                    {[
                      { token: "$1", desc: "First capture group" },
                      { token: "$2", desc: "Second capture group" },
                      { token: "$&", desc: "Entire matched text" },
                      { token: "$<name>", desc: "Named capture group" },
                      { token: "$`", desc: "Text before match" },
                      { token: "$'", desc: "Text after match" },
                      { token: "$$", desc: "Literal dollar sign" }
                    ].map(t => (
                      <button
                        key={t.token}
                        onClick={() => setSubstitution(prev => prev + t.token)}
                        className="px-2 py-0.5 rounded bg-muted hover:bg-brandColor/15 hover:text-brandColor border border-border/50 transition-colors font-mono cursor-pointer"
                        title={t.desc}
                      >
                        {t.token}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* Custom JS Replacer Function Editor */
                <div className="flex flex-col gap-2">
                  <div className="p-3 rounded-xl bg-background border border-border font-mono text-xs">
                    <div className="text-muted-foreground/70 select-none pb-1">
                      function (match, p1, p2, p3, offset, string, groups) &#123;
                    </div>
                    <textarea
                      value={jsReplaceCode}
                      onChange={(e) => setJsReplaceCode(e.target.value)}
                      rows={3}
                      className="w-full bg-transparent outline-none text-foreground font-mono resize-y py-1 pl-4"
                      placeholder="return match.toUpperCase();"
                    />
                    <div className="text-muted-foreground/70 select-none pt-1">&#125;</div>
                  </div>
                </div>
              )}
            </div>

            {/* Substitution Results Diff View */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Original Source */}
              <div className="flex flex-col rounded-2xl bg-card border border-border shadow-sm p-4">
                <div className="flex items-center justify-between pb-3 border-b border-border/50 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  <span>Original Text</span>
                  <span className="font-mono text-muted-foreground font-normal">{testString.length} chars</span>
                </div>
                <div className="mt-3 p-3 rounded-xl bg-muted/20 border border-border/40 font-mono text-xs text-muted-foreground whitespace-pre-wrap overflow-auto max-h-[350px]">
                  {testString || <span className="opacity-40 italic">Empty test string</span>}
                </div>
              </div>

              {/* Replaced Output */}
              <div className="flex flex-col rounded-2xl bg-card border border-border shadow-sm p-4">
                <div className="flex items-center justify-between pb-3 border-b border-border/50 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <span className="text-brandColor">Substituted Result</span>
                    <span className="px-2 py-0.2 rounded-full bg-brandColor/10 text-brandColor font-mono text-[10px]">
                      {substitutionResult.count} replacements
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(substitutionResult.text);
                      toast.success("Copied substituted result!");
                    }}
                    className="flex items-center gap-1 font-semibold text-brandColor hover:underline cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </button>
                </div>
                <div className="mt-3 p-3 rounded-xl bg-background border border-border font-mono text-xs text-foreground whitespace-pre-wrap overflow-auto max-h-[350px]">
                  {substitutionResult.text || <span className="opacity-40 italic">No output</span>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB CONTENT 3: SPLIT STRING ────────────────────────────────── */}
        {activeTab === "split" && (
          <div className="flex flex-col gap-6">
            <div className="p-5 rounded-2xl bg-card border border-border shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Scissors className="w-4 h-4 text-brandColor" />
                    <span>Split String by Regular Expression Delimiter</span>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Splits the test string wherever the regex matches occurs into an array of substrings.
                  </p>
                </div>

                {/* Split Limit Config */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Split Limit:</span>
                  <input
                    type="number"
                    min="0"
                    max="1000"
                    value={splitLimit}
                    onChange={(e) => setSplitLimit(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    className="w-20 px-2.5 py-1 rounded-lg bg-background border border-border text-xs font-mono text-foreground outline-none"
                    title="0 = unlimited splits"
                  />
                  <span className="text-[11px] text-muted-foreground/60">(0 = unlimited)</span>
                </div>
              </div>
            </div>

            {/* Split Results Array List */}
            <div className="flex flex-col rounded-2xl bg-card border border-border shadow-sm p-4">
              <div className="flex items-center justify-between pb-3 border-b border-border/50 text-xs">
                <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-muted-foreground">
                  <span>Split Chunks ({splitResult.length})</span>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(splitResult, null, 2));
                    toast.success("Copied split array as JSON!");
                  }}
                  className="font-semibold text-brandColor hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy as JSON Array</span>
                </button>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[450px] overflow-y-auto pr-1">
                {splitResult.length === 0 ? (
                  <div className="col-span-full py-8 text-center text-xs text-muted-foreground italic">
                    No split results. Provide a pattern and test string.
                  </div>
                ) : (
                  splitResult.map((chunk, idx) => (
                    <div
                      key={`chunk-${idx}`}
                      className="p-3 rounded-xl bg-background border border-border/70 flex flex-col gap-1 hover:border-brandColor/50 transition-colors"
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                        <span className="font-bold text-brandColor">Index [{idx}]</span>
                        <span>{chunk.length} chars</span>
                      </div>
                      <div className="text-xs font-mono text-foreground whitespace-pre-wrap break-words">
                        {chunk || <span className="opacity-40 italic">Empty string</span>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB CONTENT 4: REGEX EXPLAINER (AST) ────────────────────────── */}
        {activeTab === "explain" && (
          <div className="flex flex-col gap-4">
            <div className="p-5 rounded-2xl bg-card border border-border shadow-sm">
              <div className="flex items-center justify-between flex-wrap gap-2 pb-4 border-b border-border/60">
                <div>
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-brandColor" />
                    <span>Plain English Regex Breakdown</span>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Interactive syntax breakdown explaining every token, quantifier, group, anchor, and flag in your pattern.
                  </p>
                </div>
                <div className="text-xs font-mono text-brandColor font-semibold">
                  /{pattern || "..."}/{flagsString}
                </div>
              </div>

              {/* Explanations List */}
              <div className="flex flex-col gap-3 mt-4">
                {astExplanations.length === 0 ? (
                  <div className="py-12 text-center text-xs text-muted-foreground italic">
                    Type a regular expression in the top bar to inspect its plain English syntax breakdown.
                  </div>
                ) : (
                  astExplanations.map((item, idx) => (
                    <div
                      key={`ast-${idx}`}
                      className="p-3.5 rounded-xl bg-background border border-border/70 hover:border-brandColor/40 transition-all flex items-start gap-3.5"
                    >
                      <div className="px-2.5 py-1 rounded-lg bg-brandColor/10 text-brandColor border border-brandColor/20 font-mono text-xs font-bold shrink-0 mt-0.5">
                        {item.token}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-foreground">{item.title}</span>
                          <span className="px-2 py-0.2 rounded text-[10px] bg-muted text-muted-foreground font-medium">
                            {item.category}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB CONTENT 5: CODE GENERATOR (10 LANGUAGES) ───────────────── */}
        {activeTab === "codegen" && (
          <div className="flex flex-col gap-4">
            <div className="p-5 rounded-2xl bg-card border border-border shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-border/60">
                <div>
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-brandColor" />
                    <span>Multi-Language Code Generator</span>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Export your regex with proper escaping and match execution logic in 10 programming languages.
                  </p>
                </div>

                {/* Copy Snippet Button */}
                <button
                  onClick={() => {
                    const snippet = generateRegexCode(codeLang, pattern, flags, testString, substitution);
                    navigator.clipboard.writeText(snippet);
                    toast.success(`Copied ${codeLang.toUpperCase()} snippet!`);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-brandColor text-white shadow-sm hover:bg-brandColorHover transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Snippet</span>
                </button>
              </div>

              {/* Language Selector Bar */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {[
                  { id: "javascript", label: "JavaScript / TS" },
                  { id: "python", label: "Python" },
                  { id: "php", label: "PHP" },
                  { id: "java", label: "Java" },
                  { id: "csharp", label: "C# (.NET)" },
                  { id: "go", label: "Go" },
                  { id: "rust", label: "Rust" },
                  { id: "ruby", label: "Ruby" },
                  { id: "swift", label: "Swift" },
                  { id: "bash", label: "Bash / Ripgrep" }
                ].map(lang => (
                  <button
                    key={lang.id}
                    onClick={() => setCodeLang(lang.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer",
                      codeLang === lang.id
                        ? "bg-brandColor/15 text-brandColor border border-brandColor/40 font-bold"
                        : "bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>

              {/* Code Snippet Box */}
              <div className="relative rounded-xl bg-zinc-950 p-4 font-mono text-xs text-zinc-100 overflow-x-auto border border-zinc-800 leading-relaxed max-h-[480px]">
                <pre>{generateRegexCode(codeLang, pattern, flags, testString, substitution)}</pre>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB CONTENT 6: CHEATSHEET & LIBRARY ────────────────────────── */}
        {activeTab === "cheatsheet" && (
          <div className="flex flex-col gap-6">
            
            {/* Ready-to-Use Common Recipes */}
            <div className="p-5 rounded-2xl bg-card border border-border shadow-sm flex flex-col gap-4">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-brandColor" />
                  <span>Production-Ready Regex Recipes</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Click any recipe to insert or test its pattern instantly.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {COMMON_RECIPES.map((recipe, idx) => (
                  <div
                    key={`recipe-${idx}`}
                    className="p-3 rounded-xl bg-background border border-border hover:border-brandColor/40 transition-all flex flex-col justify-between gap-2.5"
                  >
                    <div>
                      <div className="text-xs font-bold text-foreground flex items-center justify-between">
                        <span>{recipe.name}</span>
                        {recipe.flags && (
                          <span className="text-[10px] font-mono font-bold text-brandColor">
                            /{recipe.flags}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                        {recipe.desc}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/40">
                      <code className="text-[10px] font-mono text-muted-foreground truncate bg-muted px-1.5 py-0.5 rounded max-w-[160px]">
                        {recipe.pattern}
                      </code>
                      <button
                        onClick={() => {
                          setPattern(recipe.pattern);
                          // configure flags
                          const newFlags = {
                            g: recipe.flags.includes("g"),
                            i: recipe.flags.includes("i"),
                            m: recipe.flags.includes("m"),
                            s: recipe.flags.includes("s"),
                            u: recipe.flags.includes("u"),
                            y: recipe.flags.includes("y"),
                            d: recipe.flags.includes("d")
                          };
                          setFlags(newFlags);
                          setActiveTab("match");
                          toast.success(`Loaded "${recipe.name}" pattern!`);
                        }}
                        className="px-2 py-1 rounded text-xs font-semibold bg-brandColor/10 text-brandColor hover:bg-brandColor hover:text-white transition-colors cursor-pointer shrink-0"
                      >
                        Use Pattern
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Reference Cheatsheet */}
            <div className="p-5 rounded-2xl bg-card border border-border shadow-sm flex flex-col gap-6">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-brandColor" />
                  <span>Regular Expression Syntax Quick Reference</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Click the "+ Insert" button on any token to append it to your active regex pattern.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {CHEATSHEET_CATEGORIES.map(cat => (
                  <div key={cat.name} className="flex flex-col gap-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-brandColor">
                      {cat.name}
                    </h4>
                    <div className="divide-y divide-border/40 bg-background rounded-xl border border-border/70 overflow-hidden">
                      {cat.items.map(item => (
                        <div
                          key={item.token}
                          className="px-3 py-2 flex items-center justify-between gap-3 hover:bg-muted/40 transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <code className="px-1.5 py-0.5 rounded bg-muted text-xs font-mono font-bold text-foreground shrink-0">
                              {item.token}
                            </code>
                            <div className="min-w-0">
                              <div className="text-xs font-semibold text-foreground truncate">{item.label}</div>
                              <div className="text-[11px] text-muted-foreground line-clamp-1">{item.desc}</div>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              setPattern(prev => prev + item.token);
                              toast.success(`Inserted ${item.token} into pattern`);
                            }}
                            className="text-[11px] font-semibold text-brandColor hover:underline shrink-0 px-1.5 py-0.5 cursor-pointer"
                          >
                            + Insert
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── Educational Guide & Features Section ─────────────────────────── */}
        <div className="mt-8 p-6 rounded-2xl bg-card border border-border/80 flex flex-col gap-6">
          <div>
            <h2 className="text-lg font-bold text-foreground">
              About the ToolsTrek Regex Tester & Debugger
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Regular expressions (regex) are powerful formal patterns used for pattern matching, validation, text parsing, data extraction, and search-and-replace routines across software engineering.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-background border border-border/60 flex flex-col gap-1.5">
              <span className="font-bold text-foreground text-sm flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-brandColor" /> Zero Demo Data by Default
              </span>
              <p className="text-muted-foreground leading-relaxed">
                All input fields start completely clean so you can paste your own data immediately without clearing out pre-filled placeholders. Load realistic demo presets on-demand whenever needed.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-background border border-border/60 flex flex-col gap-1.5">
              <span className="font-bold text-foreground text-sm flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-brandColor" /> Sub-Millisecond Execution
              </span>
              <p className="text-muted-foreground leading-relaxed">
                Calculates regex evaluations instantly with built-in catastrophic backtracking protection, microsecond benchmarking, and dual-layer synchronized syntax highlighting.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-background border border-border/60 flex flex-col gap-1.5">
              <span className="font-bold text-foreground text-sm flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-brandColor" /> 10-Language Code Export
              </span>
              <p className="text-muted-foreground leading-relaxed">
                Ready-to-run snippets in JavaScript/TypeScript, Python, PHP, Java, C#, Go, Rust, Ruby, Swift, and Bash with proper backslash escaping and capture group handlers.
              </p>
            </div>
          </div>
        </div>

      </div>
    </ToolPageShell>
  );
}
