# ToolsTrek

<p align="center">
  <img src="public/toolstrek-logo.png" alt="ToolsTrek Logo" width="80" height="80" />
</p>

<h3 align="center">Your Free, Browser-First Everyday Digital Toolbox</h3>

<p align="center">
  A high-performance, privacy-focused online utility hub built with <strong>Next.js 16</strong>, <strong>React 19</strong>, and <strong>Tailwind CSS 4</strong>.<br />
  Featuring <strong>126 powerful tools</strong> across developer, text, PDF, image, chart, QR, calculator, finance, health, productivity, and security workflows — 100% free with no registration required.
</p>

<p align="center">
  <a href="https://github.com/tasnimultas67/toolstrek"><img src="https://img.shields.io/badge/Next.js-16.4-black?style=flat-square&logo=next.js" alt="Next.js" /></a>
  <a href="https://github.com/tasnimultas67/toolstrek"><img src="https://img.shields.io/badge/React-19.0-blue?style=flat-square&logo=react" alt="React" /></a>
  <a href="https://github.com/tasnimultas67/toolstrek"><img src="https://img.shields.io/badge/Tailwind-CSS_4-38bdf8?style=flat-square&logo=tailwind-css" alt="Tailwind CSS" /></a>
  <a href="https://github.com/tasnimultas67/toolstrek"><img src="https://img.shields.io/badge/Tools-126_Available-10b981?style=flat-square" alt="126 Tools" /></a>
  <a href="https://github.com/tasnimultas67/toolstrek"><img src="https://img.shields.io/badge/Release-v2.23.0-purple?style=flat-square" alt="v2.23.0" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/License-MIT-blueviolet?style=flat-square" alt="MIT License" /></a>
</p>

---

## ✨ Features

- ⚡ **Browser-First Architecture** — The large majority of tools run 100% client-side using WebAssembly, the WebCodecs API, and plain JavaScript. No uploads, no round-trips, no server latency.
- 🔒 **Zero Data Storage & Privacy** — Files, passwords, documents, and inputs are processed in volatile browser memory and never leave your device for client-side tools.
- 🎨 **Modern Design System** — Sleek dark/light theme, polished typography, and smooth micro-animations powered by Framer Motion / `motion`.
- 🔍 **Command Palette Search** — Keyboard-accessible global search (`Cmd + K` / `Ctrl + K`) to launch any tool in milliseconds.
- ⭐ **Favorites System** — Pin frequently used tools to a dedicated Favorites dashboard, persisted via SSR-safe `localStorage`.
- 🕐 **Recent Tools Tracker** — Passively indexes recently visited utilities (with a header dropdown) for rapid context switching.
- 📊 **Chart Studio** — Six interactive, export-ready chart generators (pie/donut, bar/column, line/area, radar/spider, funnel, polar/rose & radial bar) powered by Recharts 3 and shadcn chart primitives, with hover tooltips, responsive legends, CSV/Excel import, WCAG-compliant high-contrast labels, and PNG & SVG export.
- 🗺️ **Visited Countries Map** — Mark the countries you've travelled to on an interactive flat world map, watch your percentage of the world and continent breakdown update live, then export a branded photo card (with your name and a cropped profile photo), JSON/CSV data or a shareable link.
- 🪐 **Age on Other Planets** — Turn one birth date into a cosmic birthday report: day-accurate ages on Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune and Pluto, next planetary birthdays with countdowns, a milestone planner, optional weight & jump comparisons, and share link/card/CSV/JSON exports — all in your browser.
- 🐾 **Dog & Cat Age Calculator** — Convert a dog or cat's age into human years with size-aware dog charts and lifestyle-aware cat ranges, then explore life stages, typical lifespan and remaining years, next-birthday and milestone dates, gotcha-day tracking and playful lifetime statistics — with share link, branded PNG card, CSV and JSON exports.
- 🗜️ **Image Compressor** — Batch-compress JPG, PNG, WebP and AVIF images to an exact target size or quality level with no artificial batch-count or per-file size caps, compare before/after previews and download results individually or as a ZIP — with automatic EXIF/GPS metadata removal and no uploads.
- 🧮 **Percentage Calculator** — Five percentage modes in one tool: X% of Y, what percent X is of Y, increase/decrease, add/subtract a percentage and reverse percentages, each with the substituted formula and step-by-step working.
- 🔀 **Text Diff Checker** — Compare two texts by line, word or character with unified and split views, ignore-case and whitespace options, similarity statistics, and copy/download support for standard `.diff` patches.
- 🗓️ **Meeting Time Planner** — Score every possible meeting slot across up to eight time zones against each participant's working hours, handle daylight saving automatically, compare local times and date shifts on an hourly opportunity map, filter for perfect overlaps, and copy a summary or download a standards-compliant `.ics` calendar invite.
- 🪪 **Passport / ID Photo Maker** — Turn a portrait into a correctly sized passport, visa or ID photo with 10 international presets, live head and eye guides, print-resolution/background/lighting/framing checks, and 300 DPI JPEG, PNG or multi-copy PDF print-sheet exports — entirely in your browser.
- ✈️ **Flight Duration Calculator** — Calculate exact airborne time between more than 100 airports with automatic IANA time-zone and daylight-saving handling, duration/arrival/departure modes, up to six connecting flights, domestic and international layover risk scoring, custom door-to-door buffers, distance and average-speed estimates, plus copyable and PDF itinerary reports.
- 📱 **Fully Responsive Layout** — Carefully tuned for mobile touchscreens, tablets, and high-DPI desktop displays, with a responsive type scale that keeps dense workspaces readable as screens grow.
- 📈 **Vercel Analytics** — Lightweight, privacy-compliant page-view and performance metrics.
- 🧩 **SEO & PWA Ready** — Dynamic sitemap, robots, web manifest, JSON-LD structured data, and per-page OpenGraph/Twitter metadata.

---

## 🛠️ Tool Library (126 Tools)

> Every tool is registered in a single source of truth — [`lib/toolsData.json`](./lib/toolsData.json) — which drives the All Tools grid, category filters, global search, and the FAQ header counters.

### 🌐 Developer & Code Tools (24)

| Tool | Route | Description |
| :--- | :--- | :--- |
| **Regex Tester & Debugger** | `/tools/regex-tester` | Real-time regex pattern testing with an AST syntax explainer, capture groups, replace/split, and a multi-language code generator (JS, Python, Go, Rust, Java, C#, PHP, Ruby, Swift, Bash). |
| **Code Formatter & Beautifier** | `/tools/code-formatter` | Format and beautify JavaScript, TypeScript, HTML, CSS, JSON, XML, and SQL with custom indent sizing, theme support, and direct file export. |
| **JSON Editor** | `/tools/json-editor` | Visual JSON editor and tree viewer with schema validation, key sorting, minification, diff comparison, and two-way conversion to XML/YAML/CSV. |
| **Text Diff Checker** | `/tools/text-diff` | Compare two texts by line, word or character with unified and split views, ignore-case and whitespace options, similarity statistics, and `.diff` patch export. |
| **JWT Decoder** | `/tools/jwt-decoder` | Decode JSON Web Tokens and inspect headers/claims, verify signatures with custom secrets or public keys, and check expiry — entirely client-side. |
| **Markdown Previewer** | `/tools/markdown-previewer` | Real-time GitHub-flavored Markdown editor with a live HTML preview, syntax highlighting, and instant export. |
| **CSV Viewer & Editor** | `/tools/csv-viewer` | Inspect, sort, filter, search, edit, and profile tabular CSV data in the browser with pagination, custom SVG charts, and multi-format export. |
| **Base64 Nexus** | `/tools/base64-encoder-decoder` | Encode and decode text, images, and binary files to/from Base64 with URL-safe alphabets, custom alphabets, live previews, and byte statistics. |
| **Hash Generator & Verifier** | `/tools/hash-generator` | Generate and verify checksums (MD5, SHA-1/256/512, SHA-3, Keccak-256, RIPEMD-160, CRC32, HMAC, PBKDF2) with file and batch modes. |
| **SVG Editor & Visualizer** | `/tools/svg-editor` | Create, edit, optimize, and preview SVG live with viewBox adjustments, palette replacement, and multi-format asset export. |
| **Responsive Viewport Tester** | `/tools/responsive-viewport` | Preview any URL across 80+ real device viewports with orientation, DPR, media-query generation, and custom device sizes. |
| **Full Page Screenshot Tool** | `/tools/full-page-screenshot` | Capture full-page, high-resolution screenshots of any live URL with custom viewports and PNG/JPG/PDF/WebP export. |
| **Domain Age Checker** | `/tools/domain-age-checker` | Query authoritative WHOIS registries for registration date, exact domain age, expiry status, and registrar data. |
| **SSL Certificate Checker** | `/tools/ssl-checker` | Live TLS inspection — validity, issuer, SANs, DV/OV/EV type, cipher suites, fingerprints, and full chain of trust with a security score. |
| **IP Checker** | `/tools/ip-checker` | Inspect your public IP or query any IP/domain for geolocation, ISP, ASN, timezone, and map coordinates. |
| **Website Technology Detector** | `/tools/website-tech-detector` | Detect CMS, JS frameworks, servers, CDNs, analytics, UI libraries, and evaluate HTTP security headers. |
| **Disposable Email Detector** | `/tools/disposable-email-detector` | Validate syntax, run live MX lookups, detect 70,000+ throwaway providers, flag role-based addresses, and batch-process lists. |
| **Social Media URL Preview** | `/tools/social-preview` | Preview OpenGraph and Twitter card metadata for any URL as it would appear on Facebook, X, LinkedIn, and Discord. |
| **View Metadata** | `/tools/view-metadata` | Inspect hidden EXIF/GPS/camera data, PDF document properties, and audio/video tags — 100% in-browser. |
| **Edit Metadata** | `/tools/edit-metadata` | Modify or inject EXIF, camera info, author tags, and GPS coordinates in images and PDFs for privacy. |
| **Remove Metadata & EXIF Cleaner** | `/tools/remove-metadata` | Strip and sanitize hidden EXIF, GPS, camera, and author info from photos and PDFs in one click, with batch ZIP export. |
| **Monitor Hz Test** | `/tools/monitor-hz-test` | Measure your display's real refresh rate (60Hz–360Hz+) via `requestAnimationFrame` with frame-stability and stutter graphs. |
| **Fake Info Generator** | `/tools/fake-info-generator` | Generate realistic mock identities, addresses, phone numbers, and company profiles for QA testing and demos. |
| **ZIP File Creator & Compressor** | `/tools/zip-creator` | Bundle and compress files or entire directory trees into downloadable ZIP archives with configurable Deflate levels. |

---

### 🎨 Design, CSS & Chart Tools (9)

| Tool | Route | Description |
| :--- | :--- | :--- |
| **Color Converter** | `/tools/color-converter` | Real-time HEX/RGB/HSL/HSV/CMYK conversion with color harmonies, WCAG 2.1 contrast checking, and color-blindness simulation. |
| **Box Shadow Generator** | `/tools/box-shadow-generator` | Design smooth, multi-layer CSS & Tailwind box shadows with live preview, presets, and one-click code export. |
| **Gradient Generator** | `/tools/gradient-generator` | Build CSS and Tailwind gradients (linear/radial/conic) with custom color stops and PNG/SVG export. |
| **Pie Chart Generator** | `/tools/pie-chart-generator` | Pie & donut chart studio with CSV/Excel import, live SVG preview, palettes, exploded slices, labels, legends, and PNG/SVG export. |
| **Bar Chart Generator** | `/tools/bar-chart-generator` | Bar & column chart studio with CSV/Excel import, grouped/stacked modes, multi-series data, axis controls, data labels, and PNG/SVG export. |
| **Line Chart Generator** | `/tools/line-chart-generator` | Line & area chart studio with CSV/Excel import, multiple series, straight/smooth/step lines, markers, stacking, and PNG/SVG export. |
| **Radar Chart Generator** | `/tools/radar-chart-generator` | Radar & spider chart studio with CSV/Excel import, multi-series profiles, polygon/circular grids, fills/gradients, and PNG/SVG export. |
| **Funnel Chart Generator** | `/tools/funnel-chart-generator` | Funnel & conversion chart studio with CSV/Excel import, funnel/bar/step shapes, conversion & drop-off markers, WCAG-compliant labels that stay readable on every palette, and PNG/SVG export. |
| **Polar Chart Generator** | `/tools/polar-chart-generator` | Polar area (rose) & radial bar chart studio with CSV/Excel import, an interactive hover tooltip, area-accurate square-root scaling, an optional centre hole, adjustable rings, gaps and rotation, and PNG/SVG export. |

---

### 📝 Text & Language Tools (14)

| Tool | Route | Description |
| :--- | :--- | :--- |
| **Text Analyzer Hub** | `/tools/text-analyzer-hub` | Analyze word/character/sentence counts, reading & speaking time, readability scores, and keyword density. |
| **Case Converter** | `/tools/case-converter` | Convert text between UPPER, lower, Title Case, Sentence case, camelCase, snake_case, kebab-case, PascalCase, and CONSTANT_CASE. |
| **Text Repeater** | `/tools/text-repeater` | Repeat words, sentences, or emoji blocks with custom line breaks, numbering, and separators. |
| **Remove Duplicate Lines** | `/tools/remove-duplicate-lines` | Deduplicate lines with case-insensitive matching, whitespace trimming, blank-line removal, regex filtering, and 6 sort modes. |
| **Paragraph Formatter** | `/tools/paragraph-formatter` | Clean and reformat paragraphs, adjust alignment/line spacing/case, and extract styled HTML or clean text. |
| **Dummy Text Generator** | `/tools/dummy-text-generator` | Generate Lorem Ipsum, Tech Jargon, or Sci-Fi placeholder text with word/character/paragraph controls. |
| **Fancy Text Generator** | `/tools/fancy-text-generator` | Transform plain text into 40+ Unicode styles — cursive, gothic, bubble, small caps, and glitch/Zalgo. |
| **Numbers to Words** | `/tools/numbers-to-words` | Convert numbers into full words, currency notations (USD, BDT, INR, EUR, GBP), and cheque-format strings. |
| **NATO Phonetic Alphabet Converter** | `/tools/nato-phonetic-converter` | Convert text to international phonetic spelling (Alpha, Bravo, Charlie…) with pronunciation guides and reverse decoding. |
| **Bijoy ⇄ Unicode Converter** | `/tools/bijoy-unicode-converter` | Bidirectional Bengali conversion between legacy ANSI Bijoy (SutonnyMJ) and Unicode, with SomewhereIn & Boishakhi support. |
| **Morse Code Decoder** | `/tools/morse-code-decoder` | Translate text to/from Morse with sound playback, visual dot/dash display, and a full A–Z reference chart. |
| **Braille Decoder & Encoder** | `/tools/braille-decoder` | Convert English and Bangla text to/from Grade 1 Braille with interactive visual dot-pattern guides. |
| **Binary Decoder & Encoder** | `/tools/binary-decoder` | Convert text to 8/16-bit binary and back with custom byte separators, bit-level editing, and ASCII references. |
| **TrekGlyph Encoder & Decoder** | `/tools/trekglyph-encoder-decoder` | Encode and decode text using ToolsTrek's exclusive geometric cipher (▲/▼ patterns) with a click-to-insert symbol pad. |

---

### 📄 PDF Tools (11)

| Tool | Route | Description |
| :--- | :--- | :--- |
| **PDF Merger** | `/tools/pdf-merger` | Merge multiple PDFs into one file with custom ordering and instant browser preview. |
| **PDF Splitter** | `/tools/pdf-split` | Split a PDF into single pages, custom ranges, or extracted page sets. |
| **PDF Reorder** | `/tools/pdf-reorder` | Rearrange, rotate, delete, or re-sequence pages with an intuitive drag-and-drop interface. |
| **Compress PDF** | `/tools/compress-pdf` | Reduce PDF file size while preserving readability and vector fidelity. |
| **Crop PDF** | `/tools/crop-pdf` | Visually trim margins and crop pages for printing or a cleaner presentation. |
| **Combine Files to PDF** | `/tools/combine-files-to-pdf` | Merge a mixed queue of images (PNG, JPG, WebP) and existing PDFs into a single unified document. |
| **N-Up PDF** | `/tools/n-up-pdf` | Arrange multiple pages per sheet (2-up, 4-up, 6-up, 8-up) for compact handouts and paper saving. |
| **Add Attachments to PDF** | `/tools/add-attachments` | Embed arbitrary file attachments (spreadsheets, source code, images) directly inside a PDF. |
| **PDF to Image** | `/tools/pdf-to-image` | Export all or selected pages as high-resolution PNG or JPEG images. |
| **Image to PDF** | `/tools/image-to-pdf` | Convert one or more images into a clean PDF with custom page sizes, margins, and orientations. |
| **Email to PDF** | `/tools/email-to-pdf` | Convert EML messages, headers, attachments, and rich-text bodies into archived, printable PDFs. |

---

### 🧮 Calculator Tools (6)

| Tool | Route | Description |
| :--- | :--- | :--- |
| **Percentage Calculator** | `/tools/percentage-calculator` | Five modes for X% of Y, percent-of-whole, increase/decrease, add/subtract a percentage and reverse percentages, with formula breakdowns and copy support. |
| **Random Number Generator (RNG Studio)** | `/tools/random-number-generator` | CSPRNG and seeded RNG with custom ranges, polyhedral dice (D20/D6/D100 with advantage/disadvantage), probability distributions, lottery/raffle picker, and histograms. |
| **Age Calculator** | `/tools/age-calculate` | Exact age in years, months, weeks, days, hours, minutes, and seconds with birthday countdowns. |
| **Days Tracker** | `/tools/days-tracker` | Calculate the exact duration between two dates or add/subtract days, business days, and weeks. |
| **Unit Converter** | `/tools/unit-converter` | Convert length, mass, temperature, area, volume, speed, digital storage, energy, and pressure across metric & imperial systems. |
| **Roman Numeral Converter** | `/tools/roman-numeral-converter` | Convert integers to Roman numerals and back with step-by-step breakdowns and an interactive Roman keyboard. |

---

### 💰 Finance & Budgeting Tools (8)

| Tool | Route | Description |
| :--- | :--- | :--- |
| **EMI Calculator** | `/tools/emi-calculator` | Loan EMI with month-by-month amortization, interest breakdowns, processing fees, and insurance options. |
| **Savings Calculator** | `/tools/savings-calculator` | Project savings growth with recurring contributions, compound intervals, inflation, tax, and step-ups. |
| **Discount Calculator** | `/tools/discount-calculator` | Final sale prices, discount percentages, stacked promos, BOGO deals, and unit-price comparisons. |
| **VAT / GST Calculator** | `/tools/vat-gst-calculator` | Add or remove VAT/GST/Sales Tax with global country presets and PDF invoice summaries. |
| **Zakat Calculator** | `/tools/zakat-calculator` | Compute annual Zakat on cash, gold, silver, merchandise, stocks, and liabilities with live Nisab benchmarks. |
| **Currency Converter** | `/tools/currency-converter` | Real-time exchange rates across 36+ currencies with fee simulators, cash breakdown grids, and offline caching. |
| **Wedding Budget Allocator** | `/tools/wedding-budget-allocator` | Allocate and track wedding expenses with guest-count scaling, category sliders, SVG donut charts, and PDF export. |
| **Tip Calculator** | `/tools/tip-calculator` | Calculate tips and split bills evenly or by custom shares, with service-quality input and receipt breakdowns. |

---

### 🩺 Health & Wellness Tools (6)

| Tool | Route | Description |
| :--- | :--- | :--- |
| **Health Checkup Recommender** | `/tools/health-checkup-recommender` | Evidence-based preventive screening planner (USPSTF/WHO/AHA/CDC) with branded doctor PDF export. |
| **BMI Calculator** | `/tools/bmi-calculator` | Body Mass Index with WHO & Asian cut-offs, ideal-weight ranges, and health category insights. |
| **Water Intake Calculator** | `/tools/water-intake-calculator` | Daily fluid requirements based on weight, climate, exercise, life stage, and diet, with logging and PDF export. |
| **Bra Size Calculator** | `/tools/bra-size-calculator` | r/ABraThatFits 6-measurement algorithm with international conversions, sister sizes, and fit reports. |
| **Smoking Cost Calculator** | `/tools/smoking-cost-calculator` | Financial and physical cost of smoking/vaping from 1 day to 20 years, with 30+ currencies and investment growth projections. |
| **Sleep Calculator** | `/tools/sleep-calculator` | Best bedtime/wake-up times using 90-minute cycles, personalised by age, chronotype, and habits, with a quality score, stage breakdown, nap guide, and PDF plan. |

---

### 🖼️ Image, Media & Design Tools (13)

| Tool | Route | Description |
| :--- | :--- | :--- |
| **Image Watermark** | `/tools/image-watermark` | Add text or logo watermarks with opacity, font, color, position, rotation, tiling, blend modes, stroke and shadow — export PNG/JPEG/WebP. |
| **Collage Maker** | `/tools/collage-maker` | Combine photos into grid, masonry or polaroid collages with customizable spacing, corners, backgrounds and shadows. |
| **Image Editor** | `/tools/image-editor` | Edit photos with professional filters and adjustments (brightness, contrast, temperature, vignette, presets) and export PNG/JPEG/WebP. |
| **Passport / ID Photo Maker** | `/tools/passport-photo-maker` | Crop portraits to 10 international passport, visa and ID sizes with live head/eye guides, print-readiness checks, 300 DPI JPEG/PNG/PDF export and multi-copy print sheets. |
| **Image Compressor** | `/tools/image-compressor` | Compress JPG, PNG, WebP and AVIF images to an exact target size or quality, batch-process image queues with no artificial count or per-file size caps, preview before/after, and download individually or as a ZIP. |
| **Image Resizer** | `/tools/image-resizer` | Scale by pixel or percentage, lock aspect ratios, use social presets, and export to PNG/JPEG/WebP. |
| **Image to Text (OCR)** | `/tools/image-to-text` | Extract editable text from images, scans, and screenshots locally via Tesseract.js in WebAssembly. |
| **AVIF Converter** | `/tools/avif-converter` | Convert to and from AVIF for ultra-compact file sizes and faster web page loads. |
| **SVG Converter** | `/tools/svg-converter` | Rasterize SVG vectors into high-resolution PNG, JPEG, or WebP with custom scaling. |
| **Favicon Generator** | `/tools/favicon-generator` | Generate full favicon bundles (16×16–512×512, Apple Touch, PWA icons) with HTML link tags in a ZIP. |
| **Color Palette Extractor** | `/tools/color-palette-extractor` | Extract dominant palettes from images and export CSS variables, HEX arrays, or Tailwind tokens. |
| **GIF Maker** | `/tools/gif-maker` | Create animated GIFs from image frames with drag-and-drop ordering, per-frame delays, and local encoding. |
| **Media Format Converter** | `/tools/media-format-converter` | In-browser WebCodecs & WASM transcoder for MP4, WebM, MKV, MOV, MP3, WAV, OGG, and FLAC with trim/bitrate/rotation settings. |

---

### 🔧 Productivity & Time Tools (15)

| Tool | Route | Description |
| :--- | :--- | :--- |
| **Meeting Time Planner** | `/tools/meeting-time-planner` | Find the best slot for up to eight participants across time zones with working-hour scoring, DST-aware conversions, an hourly opportunity map, overlap filters and `.ics` calendar export. |
| **Task Prioritizer & Eisenhower Matrix Studio** | `/tools/task-prioritizer` | Eisenhower Matrix, Action Priority (Impact/Effort), and MoSCoW prioritizer with 2×2 grids, Kanban, health diagnostics, and PNG/CSV/Markdown export. |
| **Countdown Timer & Days Until Calculator** | `/tools/countdown-timer` | Live countdown with timezone precision, business-day math, fullscreen mode, Web Audio alerts, confetti, and `.ics` export. |
| **Days Until Calculator** | `/tools/days-until-calculator` | Exact calendar/working days, weeks, and hours until any date with custom weekend modes and leap-year accuracy. |
| **Pomodoro Timer & Deep Work Studio** | `/tools/pomodoro-timer` | Customizable focus intervals with synthesized ambient audio, sprint estimation, streaks, and Zen mode. |
| **Daily Planner & Time-Blocking Studio** | `/tools/daily-planner` | Hourly time-blocking, Eisenhower Matrix, Top-3 priorities, habit tracking, hydration/mood logging, and printable PDFs. |
| **Dynamic Time Greeting Generator** | `/tools/dynamic-time-greeting-generator` | Timezone-aware greetings with custom brackets, 11-language packs, a 24-hour simulator, and React/JS/HTML/email code snippets. |
| **Custom Calendar Generator & Print Studio** | `/tools/calendar-generator` | Printable annual/multi-month calendars with custom paper sizes, holiday databases, lunar phases, and PDF/PNG/JPEG export. |
| **Online Notepad & Scratchpad Studio** | `/tools/online-notepad` | Multi-tab notes with live Markdown preview, voice dictation, TTS, passcode lock, readability stats, and multi-format export. |
| **Todo Tool** | `/tools/todo-tool` | Task manager with subtasks, priorities, due dates, reminders, tags, filters, and import/export. |
| **Email Signature Editor** | `/tools/email-signature-editor` | WYSIWYG signature builder with templates, social icons, logos, CTA buttons, and one-click HTML copy. |
| **Timezone Clock & Converter** | `/tools/timezone-clock` | World clocks, an interactive meeting-planner slider, local alarms, and UTC offset visualizers. |
| **Time Converter** | `/tools/time-converter` | Convert between seconds, minutes, hours, days, weeks, months, years, and milliseconds. |
| **Typing Test** | `/tools/typing-test` | Measure WPM and accuracy with live graphs, an error heatmap, mechanical sounds, and shareable certificates. |
| **Link Shortener** | `/tools/link-shortner` | Shorten long URLs for clean sharing, complete with scannable QR generation. |

---

### 🎓 Education Tools (3)

| Tool | Route | Description |
| :--- | :--- | :--- |
| **NU CGPA Calculator** | `/tools/cgpa-calculator` | National University Bangladesh GPA/CGPA across all four years with official credit hours and grading. |
| **University CGPA Calculator** | `/tools/uni-cgpa-calculator` | Public & private university CGPA with BUET/NSU/BRAC/UIU/AIUB/AUST presets, custom scales, and PDF result cards. |
| **Class Schedule Maker** | `/tools/class-schedule-maker` | Design weekly academic timetables with instructors, rooms, colors, conflict alerts, and image/PDF export. |

---

### 📷 QR Code Tools (3)

| Tool | Route | Description |
| :--- | :--- | :--- |
| **QR Code Generator** | `/tools/qr-code-generator` | Generate custom QR codes with color styling, logo embeds, custom sizing, and error-correction levels. |
| **QR Code Scanner** | `/tools/qr-scanner` | Scan and decode QR codes and barcodes from your device camera or uploaded images. |
| **Wifi QR Code Generator** | `/tools/wifi-qr` | Create scannable WiFi QR codes for instant network connection, with printable PDF tent-card templates. |

---

### 🔒 Security & Privacy Tools (2)

| Tool | Route | Description |
| :--- | :--- | :--- |
| **Password Generator** | `/tools/password-generator` | Generate strong, cryptographically secure passwords and passphrases with custom length and character rules. |
| **Password Strength Tester** | `/tools/password-strength-tester` | Inspect entropy, estimated brute-force crack time, security checklists, and common pattern vulnerabilities. |

---

### 🔮 Fun & Astrology Tools (4)

| Tool | Route | Description |
| :--- | :--- | :--- |
| **Zodiac Sign Calculator** | `/tools/zodiac-sign-calculator` | Sun sign, Vedic Rashi, Chinese Zodiac, decan traits, ruling elements, and shareable profile cards. |
| **Love Compatibility Test** | `/tools/love-compatibility-test` | Relationship harmony via zodiac compatibility, numerology life paths, love languages, and chemistry scores. |
| **Age on Other Planets** | `/tools/age-on-other-planets` | Your exact age on Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune and Pluto — with next planetary birthdays, a milestone planner, weight & jump comparisons, and shareable report exports. |
| **Dog & Cat Age Calculator** | `/tools/dog-cat-age-calculator` | Human-age conversion for dogs and cats with size- and lifestyle-aware charts, life stages, lifespan estimates, birthday milestones, gotcha-day tracking, and shareable report exports. |

---

### ✈️ Travel Tools (4)

| Tool | Route | Description |
| :--- | :--- | :--- |
| **Visited Countries Map** | `/tools/country-visited-map` | Mark every country you've been to on an interactive world map, track your % of the world explored and continent breakdown, add your name and a cropped profile photo, then export a branded PNG card, JSON/CSV data or a shareable link. |
| **Packing List Generator** | `/tools/packing-list-generator` | Customizable travel checklists with collapsible categories, priority badges, packed filters, and PDF export. |
| **Travel Budget Splitter** | `/tools/travel-budget-splitter` | Plan and split group trip expenses with multi-currency conversion, split rules, and debt-settlement reports. |
| **Flight Duration Calculator** | `/tools/flight-duration-calculator` | Calculate exact flight time between any airports with automatic time-zone and daylight-saving handling, duration/arrival/departure modes, multi-city connections, layover risk scoring, door-to-door buffers, distance estimates and PDF reports. |

---

## 🔐 Client-Side vs. Server-Side

ToolsTrek is **browser-first**: the overwhelming majority of tools complete their work in the client with no network request. Only features that genuinely require live external data use a thin Next.js Route Handler under `app/(main)/api/`:

| API Route | Used By | Purpose |
| :--- | :--- | :--- |
| `/api/check-domain-age` | Domain Age Checker | Authoritative WHOIS registry lookup |
| `/api/check-ssl` | SSL Certificate Checker | Live TLS handshake & certificate chain inspection |
| `/api/check-ip` | IP Checker | IP/domain geolocation lookup |
| `/api/check-email` | Disposable Email Detector | Syntax + MX record verification |
| `/api/detect-tech` | Website Technology Detector | Remote page tech-stack detection |
| `/api/url-preview` | Social Media URL Preview | Fetch OpenGraph/Twitter metadata |
| `/api/screenshot` | Full Page Screenshot Tool | Server-side Microlink proxy (bypasses CORS/adblockers) |

---

## 🧰 Tech Stack

| Category | Technologies | Description |
| :--- | :--- | :--- |
| **Core Framework** | Next.js 16.4, React 19 | App Router, Server & Client Components, Turbopack |
| **Styling & Design** | Tailwind CSS 4.3, `@tailwindcss/postcss`, `tw-animate-css` | Next-gen CSS engine, responsive utilities, dark mode |
| **UI Components** | Radix UI, shadcn/ui, `cmdk`, Headless UI, Heroicons, Lucide | Accessible primitives, command palette, mega-menu |
| **Animation** | Framer Motion / `motion` 12, `embla-carousel-react` | Physics-based micro-interactions & carousels |
| **Forms & Validation** | React Hook Form, Zod, `@hookform/resolvers` | Schema validation and performant form state |
| **Drag & Drop** | `@hello-pangea/dnd` | Reorderable lists (PDF pages, GIF frames, tasks, queues) |
| **PDF Processing** | `pdf-lib`, `pdfjs-dist`, `jspdf`, `react-pdf` | Client-side PDF manipulation, rendering, and generation |
| **QR & Barcodes** | `qrcode`, `qrcode.react`, `@zxing/library`, `jsqr` | QR/barcode generation and camera-based decoding |
| **OCR & Images** | `tesseract.js`, `browser-image-compression`, `piexifjs`, `react-dropzone`, `react-colorful`, `color-thief-browser`, `html2canvas` | In-browser OCR, compression, EXIF editing, color picking |
| **Media & Audio** | `mediabunny`, `@mediabunny/mp3-encoder`, `@mediabunny/flac-encoder` | Hardware-accelerated WebCodecs transcoding (video & audio) |
| **Code & Markdown** | `js-beautify`, `sql-formatter`, `diff`, `highlight.js`, `react-markdown`, `remark-gfm`, `remark-breaks`, `rehype-highlight`, `rehype-raw` | Beautification, text comparison, syntax highlighting and GitHub-flavored Markdown rendering |
| **Charts** | Recharts 3, shadcn chart primitives | Responsive SVG chart previews with hover tooltips, themed legends and PNG/SVG export |
| **Archive & Utilities** | `jszip`, `date-fns`, `clsx`, `tailwind-merge`, `class-variance-authority`, `clipboard-copy`, `react-country-flag` | Client-side ZIP creation, date math, class merging |
| **Network & Security** | `whois`, Node.js `tls` | WHOIS lookups and live TLS inspection in Route Handlers |
| **Camera** | `react-webcam` | QR scanning and image capture |
| **Notifications** | Sonner | Theme-aware toast notifications that follow the app's dark/light toggle |
| **Theming** | Custom `ThemeProvider` (`app/theme-context.jsx`) | Class-based dark/light mode persisted in `localStorage`; the app intentionally ignores `prefers-color-scheme` |
| **Analytics** | `@vercel/analytics` | Lightweight, privacy-compliant traffic analytics |
| **Typography** | Google Sans Flex, Playfair Display, Staatliches (via `next/font/google`) | Body, display, and brand wordmark typefaces |
| **Code Quality** | ESLint 9 (flat config), `eslint-config-next` 16 | Next.js Core Web Vitals rules with a zero-warning lint run |
| **Testing** | Playwright | End-to-end smoke suite for route rendering and key interactions |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20.9+ (Node.js 22 or 24 LTS recommended)
- **npm** (this project uses npm — see `packageManager` in `package.json`)

### Installation

```bash
# Clone the repository
git clone https://github.com/tasnimultas67/toolstrek.git

# Navigate into the project folder
cd toolstrek

# Install dependencies
npm install
```

### Environment Configuration

ToolsTrek runs with **no required environment variables**. An optional `.env` file (see `.env.example`) may define values for future/optional integrations, but every current tool works without it:

```bash
cp .env.example .env
```

### Development Server

Start the local development server with Turbopack:

```bash
npm run dev
```

The application will be accessible at **http://localhost:8080**.

### Production Build

```bash
# Create an optimized production build
npm run build

# Start the production server
npm start
```

### Code Quality

```bash
npm run lint
```

### End-to-End Smoke Tests

```bash
npx playwright install chromium   # one-time: download the browser
npm run test:e2e
```

The Playwright suite in `e2e/` builds and boots the app, then verifies the
high-risk tool routes render with no uncaught exceptions or console errors, plus
key interactions across theme persistence, global search, code-formatter
prefill, image compression (including nine-image batch and 51-image queue
regressions), percentage calculation and text diffing. Use
`npm run test:e2e:ui` for the interactive runner.

---

## 📁 Project Structure

```text
toolstrek/
├── app/
│   ├── (main)/                                # Main application route group
│   │   ├── about-us/                          # About page
│   │   ├── api/                               # Server-side Route Handlers (7)
│   │   │   ├── check-domain-age/              #   WHOIS lookup
│   │   │   ├── check-email/                   #   Disposable email + MX verification
│   │   │   ├── check-ip/                      #   IP geolocation
│   │   │   ├── check-ssl/                     #   Live TLS certificate inspection
│   │   │   ├── detect-tech/                   #   Website tech-stack detection
│   │   │   ├── screenshot/                    #   Microlink screenshot proxy
│   │   │   └── url-preview/                   #   OpenGraph/Twitter metadata
│   │   ├── changelog/                         # Release timeline page
│   │   ├── data/
│   │   │   └── faqs.json                      # FAQ content (categorised Q&A)
│   │   ├── faq/                               # FAQ page with live search & filters
│   │   ├── favorites/                         # ⭐ Saved favorite tools
│   │   ├── privacy-policy/                    # Privacy policy
│   │   ├── recent/                            # 🕐 Recent tools history
│   │   ├── tools/                             # 126 tool route pages (one folder per tool)
│   │   │   ├── <tool-slug>/page.js            #   SEO metadata + renders the tool UI
│   │   │   └── ...
│   │   ├── tools-compo/                       # Shared UI & tool logic components
│   │   │   ├── Home-Compo/                    #   Homepage sections
│   │   │   ├── tools/                         #   Tool logic components (grouped by tool)
│   │   │   │   └── _shared/charts/            #     Shared Recharts views, theme & export helpers
│   │   │   ├── Header.js                      #   Navigation, mega-menu, search, history
│   │   │   ├── Footer.js                      #   Site footer
│   │   │   ├── FAQCon.js                      #   FAQ accordion + search/filter UI
│   │   │   ├── ParentTools.js                 #   Tool grid, category filters & pagination
│   │   │   └── ...
│   │   ├── layout.js                          # Route-group layout
│   │   └── page.js                            # Homepage
│   ├── layout.js                              # Root layout, fonts, metadata, JSON-LD
│   ├── globals.css                            # Global styles & CSS design tokens
│   ├── sitemap.js / robots.js / manifest.js   # SEO & PWA route handlers
│   ├── loading.js / error.js / global-error.js / not-found.js
│   └── theme-context.jsx                      # Theme provider wrapper
│
├── components/
│   ├── FavoriteButton.jsx                     # ⭐ Favorite toggle
│   ├── RecentToolsTracker.jsx                 # 🕐 Passive visitation tracker
│   └── ui/                                    # Accessible UI primitives (shadcn/Radix)
│
├── hooks/
│   ├── useFavorites.js                        # SSR-safe localStorage favorites hook
│   └── useRecentTools.js                      # SSR-safe localStorage recents hook
│
├── lib/
│   ├── toolsData.json                         # Central registry for all 126 tools (source of truth)
│   ├── changelogData.js                       # Release notes + latestVersion helper
│   ├── disposableDomains.json                 # 70,000+ disposable email domain database
│   ├── cryptoEngine.js                        # Client-side cryptographic helpers
│   ├── countries.js                           # Country registry for the Visited Countries Map
│   ├── world-geo.js                           # World GeoJSON loader + map projection helpers
│   ├── useGlobalSearch.js                     # Global search state logic
│   └── utils.js                               # `cn` class-merge helper + formatters
│
├── e2e/                                       # Playwright end-to-end smoke tests
├── public/                                    # Static assets, workers, and icons
├── components.json                            # shadcn/ui configuration
├── next.config.mjs                            # Next.js configuration
├── playwright.config.js                       # Playwright test runner configuration
├── jsconfig.json                              # Path aliases (`@/*` → repo root)
├── package.json                               # Dependencies and scripts
└── README.md                                  # Project documentation
```

---

## 🤝 Contributing

Contributions are warmly welcomed! To contribute:

1. **Fork** the repository.
2. **Create a branch** for your feature or fix (`git checkout -b feature/my-cool-tool`).
3. **Commit your changes** with clear, descriptive commit messages.
4. **Test locally** — ensure the production build succeeds (`npm run build`), lint passes (`npm run lint`), and the smoke suite passes (`npm run test:e2e`).
5. **Open a Pull Request** describing your changes.

### Adding a New Tool

When adding a new utility:

1. Create its page route under `app/(main)/tools/<tool-slug>/page.js` (include SEO metadata: title, description, canonical, OpenGraph).
2. Implement its interactive UI under `app/(main)/tools-compo/tools/` (use a sub-folder for tool-specific engines/data).
3. Register the tool metadata (title, link, description, icon, categories, keywords) in `lib/toolsData.json` — this is the **single source of truth** for the grid, filters, search, and FAQ counters.
4. Add the route to `app/(main)/tools/`-level navigation where relevant, append the page to `app/sitemap.js`, and add a changelog entry in `lib/changelogData.js`.
5. Update the FAQ (`app/(main)/data/faqs.json`) and documentation if necessary.

---

## 📄 License

This project is open-source software licensed under the **[MIT License](./LICENSE)**.
