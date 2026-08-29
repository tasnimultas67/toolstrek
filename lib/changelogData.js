export const changelogData = [
  {
    version: "v2.5.0",
    date: "August 2026",
    isoDate: "2026-08-25",
    type: "major",
    badge: "Latest Release",
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
