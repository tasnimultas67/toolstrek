export const changelogData = [
  {
    version: "v2.12.0",
    date: "October 2026",
    isoDate: "2026-10-18",
    type: "minor",
    badge: "Latest Release",
    title: "Sleep Calculator & Sleep Cycle Studio",
    summary:
      "Introducing the Sleep Calculator! Discover your ideal bedtime or wake-up time based on 90-minute sleep cycles, personalised to your age group, sleep-onset time, chronotype and everyday habits such as caffeine, screens, alcohol and stress. Features a live sleep quality score, sleep stage architecture breakdown, age-based sleep needs reference, smart nap guide, sleep hygiene essentials and a downloadable branded PDF sleep plan — all running 100% in your browser.",
    categories: ["New Tools", "Improvements", "Security", "Health"],
    highlights: [
      {
        title: "Sleep Calculator & Sleep Cycle Studio",
        link: "/tools/sleep-calculator",
        description:
          "Find the perfect bedtime or wake-up time using 90-minute sleep cycles. Personalised for age, sleep-onset latency, chronotype and lifestyle habits, with a quality score, sleep stage breakdown, nap guide and PDF export.",
        tag: "Health",
      },
    ],
    changes: [
      {
        type: "Added",
        items: [
          "Dual-mode sleep engine: calculate the best bedtime from a target wake-up time, or the best wake-up times from a chosen bedtime.",
          "90-minute sleep cycle physics that anchors every suggestion to the natural end of a complete cycle rather than mid-deep-sleep.",
          "Age-aware scheduling across 8 groups (Newborn through Older Adult) with recommended hour ranges and adaptive cycle counts.",
          "Adjustable sleep-onset latency with presets for how long you typically take to fall asleep, plus automatic adjustment from lifestyle factors.",
          "Eight lifestyle & habit modifiers — caffeine after 2 PM, evening alcohol, pre-bed screens, high stress, heavy late meals, intense late workouts, regular daytime exercise and consistent sleep/wake times — each tuning onset time and quality.",
          "Live sleep quality score (0–100) with colour-coded rating bands (Excellent, Good, Fair, Needs Work) and coaching feedback.",
          "All-cycle option list with Best and In-range badges so you can trade a little sleep against an earlier or later start.",
          "Sleep architecture visualisation breaking the night into N1, N2, N3 and REM stages with per-stage duration estimates.",
          "Chronotype coach covering Lion, Bear, Wolf and Dolphin profiles with tailored bedtime advice.",
          "Age-based sleep needs reference table highlighting your selected group with a full-cycle equivalents column.",
          "Smart nap guide (Power, Caffeine, Short and Full Cycle naps) plus eight sleep hygiene essentials.",
          "Copy-to-clipboard sleep summary and a branded jsPDF sleep plan download.",
          "Interactive FAQ accordion and a friendly wellness disclaimer.",
          "Full dark mode support and a fully responsive mobile-to-desktop dashboard layout.",
        ],
      },
      {
        type: "Improved",
        items: [
          "Registered the Sleep Calculator in the global tools catalog (toolsData.json) so it appears in the All Tools grid, category filters and global search.",
          "Added the /tools/sleep-calculator route to the dynamic sitemap with a monthly change frequency and high priority.",
          "Featured the new tool at the top of the home 'Browse by Tools' grid and the header newest-tools menu.",
          "Added a Health & Wellness FAQ section covering sleep cycles, bedtime planning and sleep debt.",
          "Shipped an SEO-optimised tool page with canonical URL, OpenGraph, Twitter card and robots metadata.",
        ],
      },
      {
        type: "Security",
        items: [
          "Every calculation runs 100% client-side in the browser — your sleep schedule and habits are never uploaded anywhere.",
          "No accounts, no cookies and no third-party tracking are used to power the Sleep Calculator.",
        ],
      },
    ],
  },
  {
    version: "v2.11.0",
    date: "October 2026",
    isoDate: "2026-10-15",
    type: "minor",
    title: "Remove Metadata & EXIF Cleaner Studio",
    summary:
      "Introducing the Remove Metadata & EXIF Cleaner! Instantly strip hidden GPS location coordinates, camera models, device serial numbers, author names, creation timestamps, and tracking tags from images (JPG, PNG, WebP) and PDF documents with 100% private in-browser batch processing and ZIP export.",
    categories: ["New Tools", "Security", "Developer", "Image"],
    highlights: [
      {
        title: "Remove Metadata & EXIF Cleaner",
        link: "/tools/remove-metadata",
        description:
          "1-Click photo and PDF metadata remover with lossless JPEG header stripping, GPS geolocation purge, privacy risk inspector, batch cleaning, and ZIP bundle export.",
        tag: "Security",
      },
    ],
    changes: [
      {
        type: "Added",
        items: [
          "100% client-side EXIF, IPTC, and XMP metadata stripping with zero cloud file uploads.",
          "Lossless JPEG segment removal without recompressing or re-encoding image pixels.",
          "Canvas pixel-perfect extraction for PNG, WebP, and other image formats.",
          "PDF document metadata cleaner stripping Title, Author, Subject, Keywords, Creator, and Producer info.",
          "Pre-cleaning privacy inspector highlighting exposed GPS coordinates, camera hardware serials, and timestamps.",
          "Multi-file drag-and-drop batch queue with single-file and 'Strip All' actions.",
          "Download All in ZIP archive powered by JSZip.",
          "Sample privacy demo generator allowing instant testing of location and EXIF sanitization.",
          "Post-cleaning verification ensuring 0 metadata tags remain.",
        ],
      },
    ],
  },
  {
    version: "v2.10.0",
    date: "October 2026",
    isoDate: "2026-10-15",
    type: "minor",
    title: "CSS Box Shadow Generator Studio",
    summary:
      "Introducing the CSS Box Shadow Generator! Visually craft smooth, multi-layer CSS and Tailwind box shadows with live interactive preview, customizable offsets, blur, spread, colors, opacity, inset shadows, curated presets library, and instant 1-click code export.",
    categories: ["New Tools", "Developer", "Design"],
    highlights: [
      {
        title: "CSS Box Shadow Generator",
        link: "/tools/box-shadow-generator",
        description:
          "Visual CSS and Tailwind box shadow designer with multi-layer depth, curated presets, interactive canvas preview, and instant code copy.",
        tag: "Developer",
      },
    ],
    changes: [
      {
        type: "Added",
        items: [
          "Interactive live preview canvas with real-time shadow projection and light/slate/dark/OLED background toggles.",
          "Multi-layer shadow stacking allowing users to layer ambient and directional shadows for photorealistic elevation.",
          "Individual granular sliders for horizontal offset (X), vertical offset (Y), blur radius, spread radius, and opacity.",
          "Toggle between standard drop shadows and inset (inner) shadows for pressed or recessed UI elements.",
          "Curated designer presets library (Subtle Elevation, Smooth Floating, High Modal Pop, Neo-Brutalism, Inset Depth, SaaS Glow, Neon Cyberpunk, Warm Sunset, and Stripe-style soft elevation).",
          "One-click code generator supporting standard CSS, Tailwind CSS arbitrary class syntax (shadow-[...]), and cross-browser vendor prefixes.",
          "Interactive card mockup and hover lift preview testing.",
          "Fully responsive mobile and desktop layout with comprehensive educational guides and SEO documentation.",
        ],
      },
    ],
  },
  {
    version: "v2.09.0",
    date: "October 2026",
    isoDate: "2026-10-14",
    type: "major",
    title: "100+ Free Tools Milestone: Task Prioritizer, Countdown Timer & Pomodoro Timer Studio",
    summary:
      "A monumental milestone celebrating over 100 free, browser-first tools on ToolsTrek! Version 2.09.0 unites three flagship productivity powerhouses: Task Prioritizer & Eisenhower Matrix Studio (2×2 decision matrices, Action Priority, MoSCoW, Kanban, and Covey health diagnostics), Countdown Timer & Days Until Calculator (drift-free millisecond countdowns, working business day calculations, holiday presets, Web Audio alarms, and .ics export), and Pomodoro Timer & Deep Work Studio (synthesized ambient soundscapes, 40Hz focus tones, sprint task tracking, and streak analytics). Also includes platform-wide SEO metadata enrichment across 15+ utilities, dynamic sitemap indexing, expanded FAQ documentation, and UI optimizations.",
    categories: ["New Tools", "Productivity", "Workflow", "Time & Date", "Calculators", "Improvements", "Security"],
    highlights: [
      {
        title: "Task Prioritizer & Eisenhower Matrix Studio",
        link: "/tools/task-prioritizer",
        description:
          "Professional Eisenhower Matrix and multi-framework task prioritizer with 2×2 decision grids, Kanban columns, health analytics, and multi-format exports.",
        tag: "Productivity",
      },
      {
        title: "Countdown Timer & Days Until Calculator",
        link: "/tools/countdown-timer",
        description:
          "Professional live countdown timer and days until calculator with timezone precision, business days calculations, full-screen presentation mode, Web Audio alerts, confetti celebration, and .ics calendar exports.",
        tag: "Time & Date",
      },
      {
        title: "Days Until Calculator",
        link: "/tools/days-until-calculator",
        description:
          "Calculate exact calendar days, working/business days (excluding weekends), full weeks, and hours until any date or event with leap year handling and live countdowns.",
        tag: "Calculators",
      },
      {
        title: "Pomodoro Timer & Deep Work Studio",
        link: "/tools/pomodoro-timer",
        description:
          "Professional Pomodoro focus timer with customizable intervals, synthesized ambient audio (brown noise, rain, 40Hz gamma focus tone), integrated sprint task estimation, daily streak analytics, and distraction-free Zen mode.",
        tag: "Productivity",
      },
    ],
    changes: [
      {
        type: "Added",
        items: [
          "Triple-framework decision engine supporting Eisenhower Matrix (Urgent vs. Important), Action Priority Matrix (Impact vs. Effort), and MoSCoW (Must, Should, Could, Won't).",
          "Four flexible view layouts: 2×2 Cartesian Matrix Grid, 4-column Agile Kanban Board, Ranked Priority List, and single-quadrant Zen Focus mode.",
          "Covey Principle Matrix Health Engine calculating live quadrant distribution and delivering real-time actionable coaching advice to prevent burnout and firefighting.",
          "Subtask checklist manager inside every task with instant progress tracking (e.g. 2/3 complete).",
          "Estimated Pomodoro duration tracking (1–12 focus blocks) with Pomodoro icon badges.",
          "Relative due date and deadline urgency monitoring (Today, Tomorrow, Upcoming).",
          "In-browser synthesized Web Audio sound engine providing harmonic audio feedback on task addition, completion, quadrant moves, and deletion.",
          "High-resolution PNG matrix card exporter rendered entirely client-side via HTML5 Canvas for presentations and social sharing.",
          "Comprehensive multi-format exports including CSV spreadsheets, JSON backups, and formatted GitHub-style Markdown for Slack, Jira, and Notion.",
          "Rich catalog of battle-tested presets (Executive Focus, Software Sprint & Backlog, Student Academic Mastery, Freelancer Client Milestones).",
          "High-precision, drift-resistant millisecond timestamp delta countdown engine guaranteeing 100% timing accuracy across background tabs.",
          "Dual-mode Days Until & Date Duration Calculator isolating true calendar days, business/working days (excluding weekends), full weeks, and 8-hour sprint work hours.",
          "Target Date by Adding/Subtracting Days calculator with quick presets (+14d, +30d, +60d, +90d, +100 business days, +1 year).",
          "Rich catalog of dynamic upcoming holiday, seasonal solstice, and personal milestone presets (New Year, Christmas, Thanksgiving, Valentine's Day, Weekends, Solstices, Weddings, Retirement).",
          "6 curated designer palettes (Electric Sapphire, Sunset Ember, Emerald Forest, Cyber Violet, Golden Luxury, and Midnight Stealth).",
          "Synthesized in-browser Web Audio harmonic alert chimes (Triumphant Fanfare, Harmonic Chime, Zen Tibetan Singing Bowl, Digital Pulse, Modern Bell, Celestial Harp).",
          "Lightweight, zero-dependency HTML5 Canvas confetti explosion celebration upon countdown completion.",
          "Distraction-free Fullscreen Zen Presentation Mode with hotkey [F] and high-contrast digital display.",
          "Export to standard RFC 5545 iCalendar (.ics) format with automated 15-minute advance reminder alarms.",
          "Embeddable HTML iframe code snippet generator with live synchronized query parameter URLs.",
          "Pomodoro focus timer with customizable Focus (1-120m), Short Break (1-60m), and Long Break (1-90m) intervals with cycle dot counters and interval triggers.",
          "Integrated Sprint Task Manager featuring project category tags (Work, Study, Code, Design, Writing, Personal) and Pomodoro estimation (e.g. 4 🍅) with automatic progress incrementing.",
          "Synthesized offline ambient soundscapes engine utilizing Web Audio API for Brown Noise, Pink Noise, White Noise, Gentle Rain, and 40Hz Gamma Isochronic Focus Tones.",
          "Productivity analytics dashboard tracking daily focus hours, completed pomodoros, and daily streak records with CSV/JSON export.",
          "Keyboard shortcuts for deep work flow: [Space] Start/Pause, [Alt+S] Skip, [Alt+R] Reset, [F] Zen Fullscreen, [M] Mute.",
        ],
      },
      {
        type: "Improved",
        items: [
          "Celebrated the official milestone of 100+ high-performance browser-first tools across ToolsTrek.",
          "Comprehensive SEO and OpenGraph metadata enrichment across 15+ tool pages (Color Converter, Disposable Email Detector, Domain Age Checker, Dynamic Time Greeting Generator, Email Signature Editor, Full Page Screenshot, Gradient Generator, Monitor Hz Test, Responsive Viewport, SSL Checker, Time Converter, Timezone Clock, Typing Test, Unit Converter, and Website Tech Detector).",
          "Updated dynamic sitemap (sitemap.js) with indexed routes for all new productivity and calculation tools.",
          "Expanded FAQ knowledge base (faqs.json) with comprehensive guides for Eisenhower Matrix, Countdown Timer, Days Until Calculator, and Pomodoro Timer.",
          "Refined responsive design, precision calculations, and accessibility across Travel Budget Splitter, Regex Tester, Unit Converter, and SVG Editor.",
          "Updated platform metrics and tool counts across Header, Hero, Footer, and README documentation.",
        ],
      },
      {
        type: "Security",
        items: [
          "100% private, client-side browser storage (localStorage) for all tasks, sprint logs, countdowns, and custom presets with zero external server tracking.",
          "Zero telemetry policy enforced across all productivity utilities with no accounts, cookies, or remote data collection.",
        ],
      },
    ],
  },
  {
    version: "v2.08.0",
    date: "October 2026",
    isoDate: "2026-10-14",
    type: "minor",
    title: "Dynamic Time Greeting Generator with Target Timezone Engine, Custom Time Slots & Code Generators",
    summary:
      "A major productivity, developer, and UX release introducing the Dynamic Time Greeting Generator. Create, customize, preview, and generate real-time time-based personalized greetings with global target timezone selection, 24-hour bracket rules, multilingual translations, 24h simulation slider, and production-ready React/Next.js, Vanilla JS, HTML, Liquid Email, and Python code snippets.",
    categories: ["New Tools", "Productivity", "Developer", "Time & Date"],
    highlights: [
      {
        title: "Dynamic Time Greeting Generator",
        link: "/tools/dynamic-time-greeting-generator",
        description:
          "Generate personalized time-of-day greetings tailored to any target timezone with custom time brackets, recipient placeholders, 11+ language packs, tone presets, 24-hour time traveler slider, card visualizer, and instant code generation.",
        tag: "Time & Date",
      },
    ],
    changes: [
      {
        type: "Added",
        items: [
          "Target Timezone selector featuring 50+ global hubs, instant search filter, UTC offset indicators, and browser local detection.",
          "Live real-time ticking clock display with 12-hour AM/PM and 24-hour format options alongside local time difference metrics.",
          "Fully customizable time brackets (Early Morning, Morning, Afternoon, Evening, Night, Late Night) with custom start/end hour and minute controls.",
          "Dynamic variable placeholder engine supporting {name}, {prefix}, {suffix}, {time}, {date}, {day}, {timezone}, {company}, and {title}.",
          "Voice & tone presets for Corporate, Casual & Friendly, Energetic & Motivational, Customer Support, and Minimalist.",
          "Multilingual support with 11 native language packs including English, Spanish, French, German, Japanese, Arabic, Bengali, Hindi, Portuguese, Italian, and Chinese.",
          "Interactive 24-hour time travel simulator slider to test and audit greetings for any minute of the day.",
          "Ready-to-deploy code generator for Next.js/React hooks (SSR hydration safe), Vanilla JS, HTML widgets, Liquid/Klaviyo email templates, and Python.",
          "Visual card designer with 7 vibrant themes, layout alignments, typography scaling, and high-resolution PNG image download.",
        ],
      },
      {
        type: "Improved",
        items: [
          "Expanded central utility catalog to 96 high-performance client-side tools.",
          "Enhanced Time & Date category indexing and cross-linking across time management utilities.",
        ],
      },
      {
        type: "Security",
        items: [
          "100% client-side execution with zero external server transmission for timezone selections or personal greeting configurations.",
          "Local storage persistence keeping all custom brackets and templates securely in browser memory.",
        ],
      },
    ],
  },
  {
    version: "v2.7.0",
    date: "September 2026",
    isoDate: "2026-09-20",
    type: "minor",
    title: "Online Notepad & Scratchpad Studio with Live Markdown, Multi-Note Tabs, Audio Acoustics & Multi-Export",
    summary:
      "A flagship productivity upgrade delivering a private, modern, distraction-free in-browser Online Notepad & Scratchpad Studio featuring multi-tab note management, live Markdown preview, typewriter acoustic feedback, voice typing dictation, text-to-speech, client-side PIN encryption, and exports to PDF, Markdown, HTML, and TXT.",
    categories: ["New Tools", "Productivity", "Text", "Features"],
    highlights: [
      {
        title: "Online Notepad & Scratchpad Studio",
        link: "/tools/online-notepad",
        description:
          "Full-featured in-browser notepad with multi-tab workspace, live Markdown preview, typewriter audio synthesis, speech-to-text dictation, TTS voice reader, client-side passcode lock, Flesch readability metrics, and instant PDF/MD/HTML export.",
        tag: "Productivity",
      },
    ],
    changes: [
      {
        type: "Added",
        items: [
          "Multi-tab note management with persistent browser localStorage and auto-save timer options.",
          "Live Markdown split-screen editor and previewer with table, blockquote, and task list rendering.",
          "Voice dictation (speech-to-text) and Text-to-Speech (TTS) audio narration with adjustable speed.",
          "Acoustic typewriter key clicks synthesized in real time via Web Audio API with natural pitch variation.",
          "Client-side note PIN/passcode lock for privacy and confidentiality.",
          "Multi-format exporter supporting PDF, Markdown (.md), Plain Text (.txt), styled HTML (.html), JSON, and Print.",
          "Comprehensive text statistics including Word Count, Characters, Paragraphs, Reading & Speaking time, and Flesch Reading Ease index.",
          "Customizable typography (Inter, Serif, Monospace, Dyslexic, Script), font size slider (minimum 14px to 32px), themes (Light, Obsidian, Sepia, Cyberpunk, Nord, Amethyst), and line height.",
        ],
      },
      {
        type: "Improved",
        items: [
          "Expanded central utility catalog to 95 tools across productivity, developer, and text categories.",
          "Updated FAQ knowledge base and global search indexing for the new Online Notepad workflows.",
        ],
      },
      {
        type: "Security",
        items: [
          "Zero telemetry policy: 100% client-side execution with zero external server transmission for written notes.",
          "Client-side note PIN lock keeping sensitive thoughts protected in local memory.",
        ],
      },
    ],
  },
  {
    version: "v2.6.0",
    date: "August 2026",
    isoDate: "2026-08-30",
    type: "minor",
    title: "Daily Planner & Time-Blocking Studio, RNG Studio (CSPRNG & Seeded Distributions)",
    summary:
      "A major productivity and calculation release introducing the comprehensive Daily Planner & Time-Blocking Studio with Pomodoro soundscapes, alongside the cryptographically secure and seeded Random Number Generator Studio.",
    categories: ["New Tools", "Features", "Productivity", "Calculators"],
    highlights: [
      {
        title: "Daily Planner & Time-Blocking Studio",
        link: "/tools/daily-planner",
        description:
          "Hourly day scheduler with 15/30/60m blocks, Eisenhower priority quadrant matrix, Top 3 Frog priorities, habit & hydration tracking, integrated Pomodoro timer with ambient soundscapes, multi-theme styling, and printable PDF planner sheets.",
        tag: "Productivity",
      },
      {
        title: "Random Number Generator (RNG Studio)",
        link: "/tools/random-number-generator",
        description:
          "Cryptographically secure (CSPRNG) & reproducible seeded PRNG with custom ranges, RPG polyhedral dice (D20, D6, D100 with Advantage/Disadvantage), statistical distributions (Gaussian, Poisson, Binomial), lottery & raffle picker, and real-time histogram analytics.",
        tag: "Calculator & Math",
      },
    ],
    changes: [
      {
        type: "Added",
        items: [
          "Daily Planner Studio with hourly time-blocking, Eisenhower matrix, routines checklist, and mood/water logger.",
          "Integrated Pomodoro focus timer with ambient soundscapes (rain, white noise, coffee shop, forest).",
          "Printable Daily Planner PDF exporter with custom theme palettes and vector layouts.",
          "Random Number Generator Studio supporting Web Crypto API CSPRNG and seeded Mulberry32/xoshiro algorithms.",
          "Polyhedral RPG dice roller with advantage, disadvantage, and multi-dice formula modifiers.",
          "Statistical probability distribution generators (Gaussian Normal, Poisson, Binomial) with live empirical histograms.",
        ],
      },
      {
        type: "Improved",
        items: [
          "Expanded central utility catalog to 94 high-performance client-side tools.",
          "Updated global command search indexing and FAQ knowledge base for new productivity and mathematical workflows.",
        ],
      },
      {
        type: "Security",
        items: [
          "100% in-browser CSPRNG hardware entropy evaluation with zero remote network transmission.",
          "Zero telemetry policy with secure local storage persistence for personal planner schedules.",
        ],
      },
    ],
  },
  {
    version: "v2.5.0",
    date: "August 2026",
    isoDate: "2026-08-25",
    type: "major",
    title: "Developer Cryptography Suite, Regex AST Explainer & Health Checkup Engine",
    summary:
      "A massive upgrade for developers and power users introducing client-side cryptographic hashing with benchmark matrix, interactive Regex AST debugger with 10-language code generator, and dynamic PDF health report exports.",
    categories: ["New Tools", "Features", "Improvements", "Security"],
    highlights: [
      {
        title: "Regex Tester & Debugger",
        link: "/tools/regex-tester",
        description:
          "Real-time regex syntax highlighting, token AST breakdown, capture group inspectors, and code generation for JS, Python, Go, Rust, PHP, Java, C#, Swift, Bash.",
        tag: "Developer Tool",
      },
      {
        title: "Cryptographic Hash Generator & Verifier",
        link: "/tools/hash-generator",
        description:
          "Multi-algorithm hashing (SHA-256, Keccak-256, SHA-512, MD5, RIPEMD-160, HMAC, PBKDF2), file integrity checksum validator, and browser-based speed benchmark.",
        tag: "Security Tool",
      },
      {
        title: "Health Checkup Recommender",
        link: "/tools/health-checkup",
        description:
          "Personalized preventive health assessment matrix with customized PDF report download and zero data persistence.",
        tag: "Health & Utility",
      },
    ],
    changes: [
      {
        type: "Added",
        items: [
          "Interactive Regex Tester with AST explainers, test string replacements, and match group tables.",
          "High-performance client-side Hash Generator supporting salted hashes, HMAC keys, and batch multi-line verification.",
          "Health Checkup Recommender calculating recommended age-based screenings with formatted PDF generation.",
          "Quick Support & Sponsorship modal with direct platform links in navigation.",
        ],
      },
      {
        type: "Improved",
        items: [
          "Animated SectionInfo component with optimized cubic bezier transitions across all pages.",
          "Global search modal indexing and keyboard navigation responsiveness.",
          "Refined dark mode contrast on code syntax highlight blocks and typography tokens.",
        ],
      },
      {
        type: "Security",
        items: [
          "Strict 100% in-browser cryptographic evaluation using standard Web Crypto API and pure WebAssembly modules.",
          "Zero telemetry policy enforced across all regex and hash input buffers.",
        ],
      },
    ],
  },
  {
    version: "v2.4.0",
    date: "July 2026",
    isoDate: "2026-07-18",
    type: "minor",
    title: "Full-Page Web Screenshot Engine & High-Speed Zip Archive Creator",
    summary:
      "Introduced responsive full-page website screenshot capture with custom viewports and cookie-blocking options, alongside client-side ZIP compression and extraction.",
    categories: ["New Tools", "Features", "Improvements"],
    highlights: [
      {
        title: "Full Page Screenshot Tool",
        link: "/tools/full-page-screenshot",
        description:
          "Capture high-resolution full-length web pages across desktop, tablet, and mobile breakpoints with automatic cookie-banner dismissal.",
        tag: "Web Utility",
      },
      {
        title: "Zip Creator & Archive Manager",
        link: "/tools/zip-creator",
        description:
          "Create, compress, inspect, and bundle multi-file zip archives directly inside the browser using JSZip.",
        tag: "Productivity",
      },
    ],
    changes: [
      {
        type: "Added",
        items: [
          "Full Page Screenshot tool with PDF, WebP, PNG, and JPEG export formats.",
          "Zip Creator with file compression levels, password protection preview, and batch downloads.",
          "Category normalizer and unified tags system in the tool registry.",
        ],
      },
      {
        type: "Improved",
        items: [
          "Modernized Hero section visual aesthetics with refined Playfair Display typography accents.",
          "Optimized image compression pipeline reducing memory footprint during batch jobs.",
        ],
      },
      {
        type: "Fixed",
        items: [
          "Resolved QR scanner camera feed initialization error on iOS Safari.",
          "Corrected GitHub project repository links and social share URLs.",
        ],
      },
    ],
  },
  {
    version: "v2.3.0",
    date: "June 2026",
    isoDate: "2026-06-04",
    type: "minor",
    title: "Task Management Todo Studio & Advanced Multi-Range PDF Splitter",
    summary:
      "Launched the full-featured browser-native Todo Tool with priority matrix and persistent local storage, alongside drag-and-drop PDF page extraction.",
    categories: ["New Tools", "Improvements", "Fixes"],
    highlights: [
      {
        title: "Todo & Productivity Studio",
        link: "/tools/todo-tool",
        description:
          "Categorized task board with subtasks, due date countdowns, priority filtering, data import/export, and zero server sync required.",
        tag: "Productivity",
      },
      {
        title: "Advanced PDF Splitter",
        link: "/tools/pdf-split",
        description:
          "Visual drag-and-drop PDF page splitter with custom range selectors, thumbnail previews, and instant multi-file batch download.",
        tag: "PDF Suite",
      },
    ],
    changes: [
      {
        type: "Added",
        items: [
          "Client-side Todo Tool with local storage persistence and CSV/JSON backup exports.",
          "Visual PDF Split tool with thumbnail rendering and page reordering.",
          "Modern Tip Calculator with split-bill breakdown and currency conversions.",
        ],
      },
      {
        type: "Improved",
        items: [
          "PDF engine upgraded to latest pdf-lib and pdfjs-dist for 40% faster rendering.",
          "Re-architected QR Scanner with auto-focus enhancements and ZXing decode fallback.",
        ],
      },
      {
        type: "Fixed",
        items: [
          "Fixed QR Scanner canvas decode freeze on high-DPI retina displays.",
          "Prevented hydration mismatches in recent tools tracker on first page load.",
        ],
      },
    ],
  },
  {
    version: "v2.2.0",
    date: "April 2026",
    isoDate: "2026-04-12",
    type: "minor",
    title: "Favorites System, Recent Tools Tracking & Audio Encoding Suite",
    summary:
      "Added user-centric productivity features including a global Favorites tray, automatic recent tools history, and browser-based FLAC/MP3 audio encoders.",
    categories: ["Features", "Improvements", "Developer"],
    highlights: [
      {
        title: "Audio Encoder Suite (MP3 & FLAC)",
        link: "/tools",
        description:
          "Convert and encode audio files in high fidelity directly on the client side using Mediabunny encoders without server upload limits.",
        tag: "Audio & Media",
      },
      {
        title: "Favorites & Recent Tools",
        link: "/favorites",
        description:
          "Star frequently used tools and quickly access your tool usage history from any page.",
        tag: "Navigation",
      },
    ],
    changes: [
      {
        type: "Added",
        items: [
          "Global star favorites system with dedicated /favorites management page.",
          "Recent tools history dropdown in Header with relative time stamps and quick clear.",
          "Mediabunny FLAC and MP3 audio encoding modules.",
        ],
      },
      {
        type: "Improved",
        items: [
          "Global Search Modal (Cmd+K / Ctrl+K) enhanced with fuzzy search scoring.",
          "Mega menu navigation redesigned with categorized icons and quick jump links.",
        ],
      },
    ],
  },
  {
    version: "v2.1.0",
    date: "February 2026",
    isoDate: "2026-02-20",
    type: "minor",
    title: "PDF Merger Studio, Wi-Fi QR Generator & OCR Engine",
    summary:
      "Expanded the core utility suite with multi-document PDF merger, Wi-Fi network QR code generator, and Tesseract.js OCR optical text extraction.",
    categories: ["New Tools", "Features", "Improvements"],
    highlights: [
      {
        title: "PDF Merger Studio",
        link: "/tools/pdf-merger",
        description:
          "Combine multiple PDF documents, re-order pages seamlessly with drag-and-drop, and merge in seconds.",
        tag: "PDF Suite",
      },
      {
        title: "Wi-Fi QR Code Generator",
        link: "/tools/wifi-qr-code",
        description:
          "Generate instant scan-to-connect Wi-Fi QR codes with WPA/WPA2/WPA3 support and printable card templates.",
        tag: "QR & Barcodes",
      },
    ],
    changes: [
      {
        type: "Added",
        items: [
          "PDF Merger tool supporting drag-and-drop reordering and multi-file binding.",
          "Wi-Fi QR Generator with customizable styles, logos, and print layouts.",
          "Image-to-Text OCR utility powered by WebAssembly-based Tesseract.js.",
          "Animated theme toggler with smooth circular wipe transitions.",
        ],
      },
      {
        type: "Improved",
        items: [
          "Added GDPR ready compliance badges and updated privacy architecture.",
          "Tailwind CSS v4 engine integration for ultra-fast CSS compilation.",
        ],
      },
    ],
  },
  {
    version: "v2.0.0",
    date: "December 2025",
    isoDate: "2025-12-15",
    type: "major",
    title: "Next.js 16 Upgrade, Turbopack Engine & Modernized Design System",
    summary:
      "A ground-up rebuild of ToolsTrek on Next.js 16 and Tailwind CSS v4, delivering sub-second page loads, unified dark mode, and an expanded library of 90+ tools.",
    categories: ["Improvements", "Features", "Security"],
    highlights: [
      {
        title: "Next.js 16 + Turbopack",
        link: "/",
        description:
          "Sub-second compilation and lightning-fast client transitions powered by modern React 19 architecture.",
        tag: "Infrastructure",
      },
      {
        title: "90+ Client-Side Tools Suite",
        link: "/tools",
        description:
          "Full catalogue of text utilities, formatters, converters, calculators, color tools, and developer helpers.",
        tag: "Catalog",
      },
    ],
    changes: [
      {
        type: "Added",
        items: [
          "Brand-new design system with Outfit & Staatliches typography pairings.",
          "Interactive Category filtering and dynamic tool search on the home hub.",
          "Dedicated About Us, FAQ, and Privacy Policy documentation pages.",
        ],
      },
      {
        type: "Improved",
        items: [
          "Zero server-side data retention guarantee implemented across all tool handlers.",
          "Full accessibility audit with keyboard navigation and ARIA landmarks across all dialogs.",
        ],
      },
    ],
  },
  {
    version: "v1.0.0",
    date: "September 2025",
    isoDate: "2025-09-01",
    type: "major",
    title: "Initial Launch of ToolsTrek Platform",
    summary:
      "The initial public release of ToolsTrek: an open-source, privacy-first hub for essential online utilities designed to streamline everyday digital tasks.",
    categories: ["Features", "New Tools"],
    highlights: [
      {
        title: "Foundational Utility Tools",
        link: "/tools",
        description:
          "Core set of URL shorteners, QR generators, unit converters, date calculators, and base64 encoders.",
        tag: "Foundational",
      },
    ],
    changes: [
      {
        type: "Added",
        items: [
          "Initial open-source release on GitHub with community contribution guidelines.",
          "Core suite of 30+ fundamental conversion and text formatting tools.",
          "100% browser-based client-side execution philosophy.",
        ],
      },
    ],
  },
];

export const latestVersion = changelogData[0]?.version || "v2.5.0";
