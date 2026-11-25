# ToolsTrek

<p align="center">
  <img src="public/brand/toolstrek-app-icon.png" alt="ToolsTrek Logo" width="80" height="80" />
</p>

<h3 align="center">Your Free, Browser-First Everyday Digital Toolbox</h3>

<p align="center">
  A high-performance, privacy-focused online utility hub built with <strong>Next.js 16</strong>, <strong>React 19</strong>, and <strong>Tailwind CSS 4</strong>.<br />
  Featuring <strong>164 powerful tools</strong> across developer, text, PDF, image, chart, QR, calculator, finance, health, productivity, media, and security workflows — 100% free with no registration required.
</p>

<p align="center">
  <a href="https://github.com/tasnimultas67/toolstrek"><img src="https://img.shields.io/badge/Next.js-16.4-black?style=flat-square&logo=next.js" alt="Next.js" /></a>
  <a href="https://github.com/tasnimultas67/toolstrek"><img src="https://img.shields.io/badge/React-19.0-blue?style=flat-square&logo=react" alt="React" /></a>
  <a href="https://github.com/tasnimultas67/toolstrek"><img src="https://img.shields.io/badge/Tailwind-CSS_4-38bdf8?style=flat-square&logo=tailwind-css" alt="Tailwind CSS" /></a>
  <a href="https://github.com/tasnimultas67/toolstrek"><img src="https://img.shields.io/badge/Tools-164_Available-10b981?style=flat-square" alt="164 Tools" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/License-MIT-blueviolet?style=flat-square" alt="MIT License" /></a>
</p>

---

## ✨ Features

- ⚡ **Browser-First Architecture** — Most tools run in your browser using JavaScript, WebAssembly, or WebCodecs. Live lookup features use server routes when they need DNS, WHOIS, TLS, geolocation, or remote page data.
- 🔒 **Privacy-Aware Processing** — Local tools process data on your device. Lookup tools send only the requested details to the relevant endpoint or provider; favorites, recents, and theme preferences stay in browser storage.
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
- 🔑 **UUID / ULID Generator** — Generate cryptographically secure UUID v4, v7, v1 and v5 values, sortable ULIDs or custom NanoIDs in batches of up to 1,000. Format case, hyphens, braces and separators, inspect any pasted UUID or ULID for version, variant and embedded timestamp, then copy or download the batch as TXT, JSON or CSV — all locally with Web Crypto.
- ⛽ **Fuel Cost & Road Trip Calculator** — Turn distance, fuel economy and pump prices into a complete road-trip budget in metric or imperial units. Add round-trip distance, driving-style and load adjustments, up to twelve passengers, tolls, parking, accommodation, food and a trip budget, then see fuel used, per-person cost, full-tank range, planned fuel stops and CO₂ — with copyable summaries and CSV exports.
- 🗓️ **Meeting Time Planner** — Score every possible meeting slot across up to eight time zones against each participant's working hours, handle daylight saving automatically, compare local times and date shifts on an hourly opportunity map, filter for perfect overlaps, and copy a summary or download a standards-compliant `.ics` calendar invite.
- 🪪 **Passport / ID Photo Maker** — Turn a portrait into a correctly sized passport, visa or ID photo with 10 international presets, live head and eye guides, print-resolution/background/lighting/framing checks, and 300 DPI JPEG, PNG or multi-copy PDF print-sheet exports — entirely in your browser.
- ✈️ **Flight Duration Calculator** — Calculate exact airborne time between more than 100 airports with automatic IANA time-zone and daylight-saving handling, duration/arrival/departure modes, up to six connecting flights, domestic and international layover risk scoring, custom door-to-door buffers, distance and average-speed estimates, plus copyable and PDF itinerary reports.
- 🤰 **Pregnancy Due Date Calculator** — Estimate a due date from last period, conception, ultrasound or IVF transfer, with cycle-length adjustment, gestational and fetal age, trimester progress, conception and implantation estimates, full-term and milestone windows, and copyable or `.ics` calendar exports.
- ✂️ **Image Cropper** — Crop, straighten, rotate, flip and resize photos with a draggable, resizable crop box, ten aspect ratios, social and print presets, zoom and pan, composition grids, numeric pixel fields, and full-resolution PNG, JPEG or WebP export — with drag-and-drop, file picker and clipboard paste.
- 🧾 **Invoice Generator** — Build a polished, itemised invoice with live totals, per-item tax and discounts, inclusive or exclusive tax modes, invoice-level discounts, shipping, deposits and rounding, 40 currencies, logo upload, six accent themes and two templates, then download a print-ready vector PDF, print it, or export and import JSON drafts — auto-saved locally.
- 🔗 **URL Encoder / Decoder** — Encode and decode URLs, query strings and form data with component, full-URL, form and custom-safe-character modes, strict RFC 3986 handling, uppercase or lowercase hex, line-by-line batch processing, a live URL inspector, a query-string builder and a reserved-character reference — with tolerant decoding of malformed input.
- 📱 **Fully Responsive Layout** — Carefully tuned for mobile touchscreens, tablets, and high-DPI desktop displays, with a responsive type scale that keeps dense workspaces readable as screens grow.
- 🛠️ **Developer Utilities** — Build cron schedules, inspect DNS and email authentication, send browser-based API requests, OCR scanned PDFs, and validate `robots.txt` and sitemap XML.
- 📈 **Vercel Analytics** — Aggregate page-view and visitor trends. Vercel documents that Web Analytics does not use cookies.
- 🧩 **Search & AI Discovery** — Registry-generated sitemap, crawler rules, JSON-LD, per-page OpenGraph/Twitter metadata, and a plain-text `/llms.txt` tool index.

---

## 🤖 AI & Crawler Discovery

- `/sitemap.xml` is generated from `lib/toolsData.json`, so each registered tool URL is included once without maintaining a second slug list.
- `/llms.txt` provides a readable overview and links to the public site pages and tool catalog. The format is an emerging convention, not an indexing protocol or ranking guarantee.
- `app/robots.js` allows public pages to general crawlers and OpenAI's `OAI-SearchBot`. It continues to disallow training and bulk-crawl agents such as `GPTBot`, `ClaudeBot`, and `Google-Extended`.
- Google documents that `Google-Extended` controls certain Gemini uses and is separate from Google Search crawling. These preferences take effect after deployment and depend on crawlers honoring `robots.txt`.

References: [OpenAI crawler documentation](https://developers.openai.com/api/docs/bots), [Google-Extended documentation](https://developers.google.com/crawling/docs/google-extended), [llms.txt proposal](https://llmstxt.org/).

---

## 🛠️ Tool Library (164 Tools)

> The registry in [`lib/toolsData.json`](./lib/toolsData.json) drives the tool directory, global search, sitemap, and AI discovery file. Run `npm run docs:catalog` after changing the registry to refresh this README section.

### Developer (32)

| Tool | Route | Description |
| :--- | :--- | :--- |
| **API Request Builder** | `/tools/api-request-builder` | Compose GET, POST, PUT, PATCH, DELETE and HEAD requests directly from your browser. Configure JSON headers and bodies, inspect formatted responses and timing, and keep credentials transient without a ToolsTrek proxy. |
| **Barcode Generator** | `/tools/barcode-generator` | Generate print-ready EAN-13, EAN-8, UPC-A, Code 128, Code 39, ITF-14, MSI and Codabar barcodes in your browser. Repair GS1 check digits, audit quiet zones, bar width and contrast, verify with a real ZXing scan, and export PNG, SVG, JPEG, PDF labels or batch CSV label sheets. |
| **Box Shadow Generator** | `/tools/box-shadow-generator` | Visually design modern, smooth CSS and Tailwind box shadows. Customize horizontal/vertical offsets, blur radius, spread, colors, and multi-layer depth with 1-click CSS code copy. |
| **Code Formatter** | `/tools/code-formatter` | Format and beautify your source code instantly. Supports JavaScript, TypeScript, HTML, CSS, JSON, XML, and SQL with customizable indent sizing, theme support, line wrapping options, and direct file upload/download capabilities. |
| **Color Converter** | `/tools/color-converter` | Convert color codes between HEX, RGB, HSL, HSV, and CMYK formats. Adjust interactive sliders in real-time, generate color harmonies, verify WCAG readability contrast, simulate color blindness, and inspect tints & shades. |
| **Config File Generator** | `/tools/config-file-generator` | Generate .gitignore, robots.txt, HTML meta tags and Apache .htaccess files from explained, selectable options. Cover operating systems, editors, frameworks, secrets, crawl rules, Open Graph, Twitter cards, security headers, caching, error pages and maintenance mode, then copy or download everything as a ZIP. |
| **Cron Expression Builder** | `/tools/cron-expression-builder` | Build and explain standard five-field cron expressions with numbers, lists, ranges and steps, then preview upcoming run times in the browser's local timezone or UTC. Supports Unix-style syntax, not Quartz extensions. |
| **CSV Editor** | `/tools/csv-viewer` | An advanced, interactive CSV viewer and editor. Upload or paste CSV data to explore dynamically with table pagination, cell editing, column visibility toggles, descriptive column data profiling, custom SVG chart generation, and multi-format exports. |
| **DNS & Email Authentication Checker** | `/tools/dns-email-auth-checker` | Look up public A, AAAA, CNAME, MX, NS, CAA and TXT records, then check SPF and DMARC records and query a chosen DKIM selector. Results are served from the DNS lookup endpoint; no email content or passwords are requested. |
| **Domain Age Checker** | `/tools/domain-age-checker` | Uncover critical web history insights by looking up the exact registration date and age of any website domain. Essential for digital marketers, SEO specialists, and cybersecurity researchers analyzing site authority and trustworthiness. |
| **Edit Metadata** | `/tools/edit-metadata` | Modify, inject, or strip metadata (EXIF, GPS, camera settings, author details) from your images, PDFs, and documents. 100% private, client-side, zero server uploads. |
| **Email Detector** | `/tools/disposable-email-detector` | Detect temporary and disposable emails instantly. Verify syntax, check live MX records, find role-based addresses, correct common spelling typos, and process email lists in bulk. |
| **Format Converter** | `/tools/media-format-converter` | Convert video and audio files (MP4, WebM, MKV, MOV, MP3, WAV, OGG, FLAC) directly in your browser. Local, private, and hardware-accelerated transcoding powered by MediaBunny. |
| **Full Page Screenshot Tool** | `/tools/full-page-screenshot` | Capture high-quality full-page screenshots of any website. Customize viewports, enforce minimum font sizes (12px on mobile, 14px on desktop), block cookie banners/ads, and download as PNG, JPG, PDF, or WebP. |
| **Gradient Generator** | `/tools/gradient-generator` | Create beautiful CSS and Tailwind gradients. Customize colors, add multiple stops, choose linear, radial, or conic styles, and access advanced options like image export (PNG/SVG) and repeating gradients. |
| **Hash Generator** | `/tools/hash-generator` | Generate, verify, benchmark, and analyze cryptographic hashes (SHA-256, MD5, SHA-1, SHA-512, SHA-3, Keccak-256, RIPEMD-160, CRC32, HMAC, PBKDF2). Features custom salt, HMAC keys, batch multi-line mode, file checksums, live matrix, and code generator. |
| **IP Checker** | `/tools/ip-checker` | Inspect your public IP address or look up any IP address/domain to get detailed geolocation, network provider (ISP), timezone, local time, security flags, and an interactive map location. |
| **JSON Editor** | `/tools/json-editor` | An advanced online JSON editor and viewer. Format, minify, sort, query, diff, and validate JSON against schema. Interactively edit, add, and delete nodes using the visual tree view. Instantly convert between JSON and XML/YAML/CSV formats. |
| **Markdown Previewer** | `/tools/markdown-previewer` | An interactive, side-by-side editing suite designed to write and review Markdown prose. Watch your raw text convert to fully rendered HTML code in real-time, making it perfect for perfecting GitHub repositories and project READMEs. |
| **Metadata Cleaner** | `/tools/remove-metadata` | Strip hidden EXIF tags, GPS location coordinates, camera models, serial numbers, author info, and tracking details from photos (JPG, PNG, WebP) and PDF documents. 100% private, client-side, zero cloud uploads with batch processing and ZIP download. |
| **Monitor Hz Test** | `/tools/monitor-hz-test` | Detect your display refresh rate using interactive flicker, pulse, and motion tests. Supports 30Hz, 60Hz, 120Hz, 144Hz, 240Hz and custom frequencies. 100% private and runs entirely in your browser. |
| **Regex Tester** | `/tools/regex-tester` | Test, debug, match, replace, split, and explain regular expressions in real-time. Features interactive capture group inspection, AST syntax explainer, multi-language code generator (JS, Python, PHP, Java, C#, Go, Rust, Ruby, Swift, Bash), custom themes, and zero initial demo data with on-demand presets. |
| **Responsive Viewport Tester** | `/tools/responsive-viewport` | Preview any website across 80+ real device viewports including iPhones, Android phones, tablets, laptops, desktops, TVs, and wearables. Check breakpoints, measure dimensions in px/em/rem/cm, inspect DPR, generate CSS media queries, and add custom device sizes. |
| **Robots.txt & Sitemap Validator** | `/tools/robots-sitemap-validator` | Validate robots.txt directives and sitemap XML structure, absolute URLs, duplicate entries and common file limits. Paste content or load a local file; validation happens in your browser without fetching the domain. |
| **Social Preview** | `/tools/social-preview` | Preview and customize how your web links appear across social media platforms like Facebook, X (Twitter), LinkedIn, Slack, and Discord. Scrape live metadata, simulate card layouts, design cover images, and generate ready-to-use HTML/JSON-LD codes. |
| **SSL Checker** | `/tools/ssl-checker` | Instantly inspect any domain's SSL/TLS certificate. View issuer, expiry dates, Subject Alternative Names (SANs), certificate type (DV/OV/EV), security score, TLS protocol & cipher suites, SHA fingerprints, and a full certificate chain — all free and server-side. |
| **SVG Editor** | `/tools/svg-editor` | Create, edit, optimize, and preview SVG code in real-time. Featuring viewBox/dimension adjustment, a global color palette replacement system, SVG optimization/prettification, and flexible format exports. |
| **Tech Detector** | `/tools/website-tech-detector` | Instantly detect the full technology stack powering any website. Identifies CMS, JavaScript frameworks (React, Vue, Next.js, Angular), web servers (Nginx, Apache), CDNs (Cloudflare, Vercel), analytics tools, and analyzes HTTP security headers with a score. |
| **Text Diff Checker** | `/tools/text-diff` | Compare two texts and highlight every added, removed and unchanged line, word or character. Switch between unified and split views, ignore case and whitespace, see similarity statistics, and copy or download a standard .diff patch — all in your browser. |
| **URL Encoder / Decoder** | `/tools/url-encoder-decoder` | Encode or decode URLs, query strings and form data with full control over percent-encoding. Choose component, full-URL or form semantics, set custom safe characters, toggle uppercase hex and strict RFC 3986 mode, process values line by line, inspect every part of a URL and build query strings. Malformed input is preserved instead of throwing errors. |
| **UUID / ULID Generator** | `/tools/uuid-ulid-generator` | Generate cryptographically secure UUID v4, v7, v1 and v5 values, sortable ULIDs or custom NanoIDs. Format batches of up to 1,000, choose case, hyphens, braces and separators, inspect any UUID or ULID, and copy or download as TXT, JSON or CSV. 100% browser-based and private. |
| **View Metadata** | `/tools/view-metadata` | Instantly reveal every hidden metadata detail inside any file — images (EXIF, GPS, camera info), PDFs, audio, video, documents, and more. No upload needed; everything runs 100% in your browser. |

### Media (20)

| Tool | Route | Description |
| :--- | :--- | :--- |
| **Audio Converter** | `/tools/audio-converter` | Convert audio files between MP3, WAV and OGG formats with bitrate, sample rate and channel settings. Trim, normalize and add fade in/out — all in your browser. |
| **AVIF Converter** | `/tools/avif-converter` | Optimize your web presence by processing raw image assets into next-generation AVIF files. Experience ultra-efficient, state-of-the-art compression algorithms that slash loading times while keeping original visual details crisp and clean. |
| **Background Remover** | `/tools/background-remover` | Remove image backgrounds locally with an AI portrait model or a precise colour key for products and screenshots. Refine alpha edges, despill colour fringes, add transparent, solid, gradient, blurred or custom backdrops, adjust padding, shadows and aspect ratio, and export PNG, WebP or JPEG. |
| **Collage Maker** | `/tools/collage-maker` | Combine multiple images into beautiful collages with customizable grids, spacing, and backgrounds. Select photos, choose layout, and download as PNG — all client-side. |
| **Color Palette Extractor** | `/tools/color-palette-extractor` | Analyze digital artwork or photos to capture dominant visual theme colors. Grab precise individual coordinates, extract detailed HEX, RGB, and HSL palettes, and export configurations directly into clean CSS sheets or Tailwind styling structures. |
| **Favicon Generator** | `/tools/favicon-generator` | Create a professional favicon pack from any image in seconds. Apply rounded corners, background color, and custom padding, then download all standard sizes (16×16 to 512×512) as a ready-to-use ZIP — fully client-side with no uploads required. |
| **GIF Maker** | `/tools/gif-maker` | Create animated GIFs from multiple images entirely in your browser. Upload frames, drag to reorder, set per-frame delays, choose output size and quality, enable ping-pong loops, dithering, transparency and more. No server uploads — 100% private. |
| **Image Compressor** | `/tools/image-compressor` | Compress JPG, PNG, WebP and AVIF images directly in your browser. Target an exact file size, tune quality and dimensions, batch-compress large photo queues with no artificial count or file-size caps and per-file progress, compare before and after previews, and download individually or as a ZIP — with automatic EXIF/GPS metadata removal. |
| **Image Cropper** | `/tools/image-cropper` | Crop, straighten, rotate and resize photos online with pixel-perfect control. Lock any aspect ratio, use social media presets, zoom and pan, flip images, apply composition grids and export at full source resolution as PNG, JPEG or WebP. Drag-and-drop, file picker and clipboard paste supported — all locally in your browser. |
| **Image Editor** | `/tools/image-editor` | Apply professional photo filters including grayscale, sepia, invert, brightness, contrast, saturation, and blur. 100% client-side processing with intensity controls. No uploads required. |
| **Image Resizer** | `/tools/image-resizer` | Resize your images online for free. Adjust dimensions using pixels or percentages, lock aspect ratios, and choose from popular social media presets. Supports advanced canvas scaling (Fill/Crop, Fit/Pad, Stretch), quality controls, rotation, flipping, and formats like PNG, JPEG, and WebP. |
| **Image Text** | `/tools/image-to-text` | Utilize powerful Optical Character Recognition (OCR) technology to extract typography and legible text directly from uploaded graphics, screenshots, or receipts. All operations are processed safely and locally within your browser. |
| **Image Watermark** | `/tools/image-watermark` | Add custom text or logo watermarks to images instantly. 100% client-side processing with opacity, font size, color, and position customization. No uploads, complete privacy. |
| **Passport / ID Photo Maker** | `/tools/passport-photo-maker` | Turn any portrait into a correctly sized passport, visa or ID photo. Choose from 10 international presets, align live head and eye guides, check print resolution, background, lighting and framing, then export a 300 DPI JPEG, PNG or PDF print sheet. 100% browser-based and private. |
| **Screen Recorder** | `/tools/screen-recorder` | Record your screen, an application window or a single browser tab with system audio and microphone narration mixed into one track. Add a circular webcam overlay, clock or watermark, pick 480p to 4K, pause and resume, then download the WebM or MP4 file. Nothing is uploaded. |
| **Subtitle (SRT/VTT) Editor & Sync** | `/tools/subtitle-editor` | Import, edit, retime and validate SRT or WebVTT subtitles in the browser. Shift or scale the whole timeline, fix frame-rate drift, replace text across cues, check overlaps, reading speed and line length, preview against a local video, and export SRT, VTT, CSV, a transcript or JSON. |
| **SVG Converter** | `/tools/svg-converter` | Rasterize scalable vector assets into standard fixed image layouts without breaking structural dependencies. Safely convert SVG layers into high-quality PNG background files, flat JPEGs, or lightweight modern WebP items. |
| **Video to GIF** | `/tools/video-to-gif` | Turn any moment from an MP4, WebM, MOV, MKV or OGG video into a looping GIF. Scrub to a frame-accurate range, then set width, frame rate, speed, palette quality, dithering, loop count and ping-pong playback. Encoding runs locally in the browser with no uploads and no watermark. |
| **Video Trimmer** | `/tools/video-trimmer` | Trim video and audio with frame-accurate in and out points, a scrubbable timeline and live selection preview. Resize, set the bitrate, mute audio, then export MP4, WebM, MKV, M4A, MP3, WAV or OGG. Processing runs locally with MediaBunny and WebCodecs, so files never leave your device. |
| **Voice Recorder & Mic / Camera Test** | `/tools/voice-recorder` | Record voice notes, inspect your microphone with a live waveform, dB meter, noise floor and clipping readout, and check any webcam with resolution selection, framing guides and PNG snapshots. Choose WebM, OGG, M4A or WAV with bitrate, sample rate, mono or stereo and audio processing. Nothing is uploaded. |

### PDF (14)

| Tool | Route | Description |
| :--- | :--- | :--- |
| **Email Converter** | `/tools/email-to-pdf` | Convert EML email files to high-quality PDF documents right in your browser. Configure paper size (A4, Letter, A3), orientation, margins, headers toggle, font styles, and color modes, while extracting and downloading attachments. |
| **Image to PDF Converter** | `/tools/image-to-pdf` | Compile distinct photographs, graphical designs, or scanned documents directly into a standardized multi-page PDF document. Arrange image orders dynamically to create polished digital portfolios, reports, or shared handouts. |
| **N-Up PDF** | `/tools/n-up-pdf` | Optimize layout designs and printing overhead costs by packing multiple distinct target pages onto a single sheet of paper. Fully customize grid distributions ($2$-up, $4$-up, etc.) for streamlined hand-out creation and material conservation. |
| **PDF Attachments** | `/tools/add-attachments` | Supercharge document packets by embedding supplementary files, supporting spread-sheets, or media assets directly within the internal architecture of your target PDF. Keep all project context bound inside one neat container. |
| **PDF Combiner** | `/tools/combine-files-to-pdf` | An advanced file assembly hub designed to stitch independent document fragments into unified, high-quality portfolios. Easily organize diverse pages in logical sequences and lock them down within a single clean master file. |
| **PDF Compressor** | `/tools/compress-pdf` | Shrink heavy, resource-intensive document file sizes down to lightweight profiles perfect for email attachments or web portals. Intelligently optimizes resolution and asset sizes without sacrificing text legibility. |
| **PDF Cropper** | `/tools/crop-pdf` | Trim unnecessary outer edges, modify visible document canvas margins, and cut precise page selections out of standard PDF formats. Perfect for cleaning up skewed scans, adjusting white space, or isolating specific layout regions. |
| **PDF Merger** | `/tools/pdf-merger` | Combine independent document streams, distinct reports, or split records directly into one cohesive, sequential PDF booklet. Organize file priority pipelines before merging to guarantee proper organizational layouts. |
| **PDF OCR & Text Extractor** | `/tools/pdf-ocr-text-extractor` | Extract selectable PDF text and run English OCR on scanned pages in your browser. Process up to 25 MB and 30 pages per run, then download the combined page-by-page text as TXT without uploading the document. |
| **PDF Page Rotator** | `/tools/pdf-page-rotator` | Rotate individual PDF pages, ranges such as 1-3,5 or every page left, right and 180° with live thumbnails. Preview the final orientation, audit original sizes and rotations, reset pages, and export the full document or only the selected pages — losslessly and entirely in your browser. |
| **PDF Reorder** | `/tools/pdf-reorder` | Fix misaligned page sequencing errors by dragging, dropping, and flipping document layouts into their correct placements. Instantly restructure internal page ordering prior to executing final outputs or distribution tasks. |
| **PDF Splitter** | `/tools/pdf-split` | Break down large, bulky PDF records into targeted standalone files. Extract specific page ranges, divide individual chapters, or isolate single-page certificates quickly and efficiently without modifying original structures. |
| **PDF to Image** | `/tools/pdf-to-image` | Extract individual elements or complete document layouts from cumbersome portable files. Convert distinct PDF pages into high-resolution PNG, JPEG, or WebP graphic assets for seamless inclusion in web galleries or presentation decks. |
| **PDF Unlocker** | `/tools/pdf-unlocker` | Audit PDF encryption, page counts and print/copy/edit restrictions, then remove passwords and permission flags locally with a lossless qpdf engine. Optionally linearize, scrub metadata or flatten annotations, and fall back to a raster page rebuild for maximum compatibility. |

### Productivity (26)

| Tool | Route | Description |
| :--- | :--- | :--- |
| **Base64 Nexus** | `/tools/base64-encoder-decoder` | A professional and feature-rich Base64 encoder and decoder. Supports standard Base64, URL-safe Base64, custom alphabets, file upload encoding, live previews of images/PDFs, detailed byte stats, and code snippet examples. |
| **Calendar Generator** | `/tools/calendar-generator` | Create, customize, and download high-resolution printable calendars for any year (2027 and beyond). Features full year & multi-month views, custom paper sizes (A4, A3, Letter, custom mm/in), holiday database for 10+ countries, custom personal events, lunar moon phases, week numbers, designer themes, and export to crisp PDF, PNG, & JPEG. |
| **Countdown Timer** | `/tools/countdown-timer` | Professional live countdown timer and days until calculator. Track upcoming events, holidays, deadlines, and milestones with timezone precision, working/business days calculations, full-screen presentation mode, Web Audio alerts, confetti celebration, and .ics calendar exports. |
| **Currency Converter** | `/tools/currency-converter` | Convert currencies in real-time with live exchange rates. Features custom markup/service fee adjustments, interactive historical trend mock charts, travel bills/cash breakdown, and multi-currency comparison grids. Supports 36 major currencies with a search-enabled dropdown and offline fallback. |
| **Daily Planner** | `/tools/daily-planner` | Professional, fully customizable Daily Planner & Time-Blocking Studio. Features hourly time-blocking, Eisenhower Matrix, Top 3 Frog priorities, habit & routine tracking, water & mood logger, integrated Pomodoro timer with ambient sounds, multi-theme styling, and printable PDF sheets. |
| **Days Until Calculator** | `/tools/days-until-calculator` | Calculate exact calendar days, working/business days (excluding weekends), full weeks, and hours until any date or event. Features custom weekend modes, leap year calculations, and live milestone countdowns. |
| **Email Signature Editor** | `/tools/email-signature-editor` | Create stunning professional email signatures online for free. Customize fonts, colors, layouts, social icons, profile photos, company logos, CTA buttons, legal disclaimers, and more. Export HTML for Gmail, Outlook, Apple Mail, Thunderbird, and Office 365. |
| **Fake Info Generator** | `/tools/fake-info-generator` | Generate comprehensive, realistic mock data and user identities for development and QA testing. Create randomized names, addresses, phone numbers, and emails instantly without exposing real or sensitive user information. |
| **HTML Email Signature Generator** | `/tools/html-email-signature-generator` | Build a professional HTML email signature with five templates, live desktop, tablet and mobile previews, brand colors, custom fonts, photo upload, social links and call-to-action buttons. Copy rich HTML for Gmail or Outlook, or export HTML, plain text, vCard and JSON. |
| **JWT Decoder** | `/tools/jwt-decoder` | Decode and analyze JSON Web Tokens (JWT) in real-time. Inspect the header, payload, signature, and verify signatures using a custom secret or public key. Adheres to strict security checks. |
| **Link Shortener** | `/tools/link-shortner` | Transform long, clunky URLs into neat, compact, and easily shareable links. This tool is perfect for maximizing character counts on social media, improving click-through rates, and tracking link management seamlessly. |
| **Meeting Time Planner** | `/tools/meeting-time-planner` | Find the best meeting time for teams across time zones. Score every slot against each participant's working hours, handle daylight saving automatically, compare local times and date shifts, filter for perfect overlaps, and export an .ics calendar invite. 100% browser-based and private. |
| **NATO Alphabet** | `/tools/nato-phonetic-converter` | Convert any text to the NATO phonetic alphabet (Alpha, Bravo, Charlie…) used by military, aviation, and emergency services worldwide. Features real-time conversion, character-by-character breakdown with pronunciations, bidirectional decoding, and a full interactive reference chart. |
| **Numbers to Words** | `/tools/numbers-to-words` | Instantly convert numerical values into their full written text representation. Ideal for writing out official financial checks, drafting legal documents, completing banking forms, or verifying the correct spelling of large numbers. |
| **Online Notepad** | `/tools/online-notepad` | Modern, fully customizable in-browser Online Notepad & Scratchpad Studio. Features multi-tab note management, live Markdown preview, typewriter acoustics, voice dictation, text-to-speech, password protection, real-time statistics, and multi-format exports (TXT, MD, PDF, HTML, JSON). |
| **Paragraph Formatter** | `/tools/paragraph-formatter` | Clean, format, and adjust alignments, line-spacings, case types, and styling of text paragraphs. Generate styled HTML or download clean text instantly. |
| **Pomodoro Timer** | `/tools/pomodoro-timer` | Professional Pomodoro focus timer with customizable intervals, synthesized ambient audio (brown noise, rain, 40Hz gamma focus tone), integrated sprint task estimation, daily streak analytics, and distraction-free Zen mode. |
| **Resume / CV Builder** | `/tools/resume-builder` | Build an ATS-friendly resume or CV with a live A4 or US Letter preview. Choose from four templates, customise the accent colour, typeface, spacing and margins, reorder or hide sections, add a photo, and compare your draft against a job advert. Print a vector PDF or export JSON, all locally. |
| **Roman Numeral Converter** | `/tools/roman-numeral-converter` | Convert numbers to Roman numerals and back with ease. Features real-time conversion, step-by-step mathematical breakdown, interactive Roman keyboard, historical presets, and a detailed reference cheat sheet. |
| **Task Prioritizer** | `/tools/task-prioritizer` | Professional Eisenhower Decision Matrix and multi-framework task prioritizer. Sort tasks by urgency and importance (Do First, Schedule, Delegate, Eliminate), evaluate Action Priority ROI, view Kanban boards, track deadlines, and export to CSV, JSON, PNG, or Markdown. |
| **Text Analyzer Hub** | `/tools/text-analyzer-hub` | An all-in-one text processing utility hub. Analyze character, word, sentence, and line counts. Perform advanced case conversions, text cleanup (duplicate/empty line removal), find & replace with regular expressions, and base64/hex/binary/url encoding and decoding. |
| **Time Greeting** | `/tools/dynamic-time-greeting-generator` | Create, customize, and generate personalized time-of-day greetings tailored to any target timezone. Features custom time brackets, recipient placeholders, 11+ multilingual packs, tone presets, 24-hour time simulator, visual card exporter, and ready-to-use React, JS, HTML, and email template snippets. |
| **Timezone Clock** | `/tools/timezone-clock` | View real-time clocks for multiple cities, compare timezones with an interactive meeting planner slider, set local alarms, and customize your dashboard. Keep track of UTC offsets, day/night cycles, and local times worldwide. |
| **Todo Tool** | `/tools/todo-tool` | A comprehensive todo tool for task management, planning, and productivity with subtasks, reminders, priority levels, categories, custom views, and intelligent filtering. Supports tags, file attachments, and export/import features. |
| **Typing Test** | `/tools/typing-test` | Improve your typing speed and accuracy with this interactive typing speed test. Features live stats, real-time WPM graphs, key-by-key response heatmap, synthesized mechanical sound effects, and dynamic certificate downloads. |
| **Zip Creator** | `/tools/zip-creator` | Bundle, compress, and create downloadable ZIP folders from multiple files or entire directory trees directly in your browser. Configure compression levels (Store, Fast, Balanced, Max Deflate), manage folder hierarchies, preview contents, inspect archives, and download instantly with 100% privacy. |

### Calculator (22)

| Tool | Route | Description |
| :--- | :--- | :--- |
| **Age Calculator** | `/tools/age-calculate` | Calculate your precise chronological age or the exact duration between two dates down to the exact number of years, months, weeks, and days. Perfect for birthday countdowns, milestone tracking, and administrative record-keeping. |
| **BMI Calculator** | `/tools/bmi-calculator` | Evaluate body composition by calculating your Body Mass Index (BMI) using your height and weight parameters. This health tool categorizes results according to standard medical ranges to help you monitor your overall fitness and wellness. |
| **Bra Calculator** | `/tools/bra-size-calculator` | Calculate your professional and accurate bra size using the gold-standard r/ABraThatFits 6-measurement algorithm or standard basic sizing. Supports international conversions, sister sizing, shape adjustments, AMAB trans-inclusive sizing, and features an interactive SVG visualizer with exportable PDF fit reports. |
| **Days Tracker** | `/tools/days-tracker` | An intuitive calendar planning utility that calculates the exact target end date by adding or subtracting a specific number of days from your chosen starting point. Great for project timelines, deadline tracking, and shipping estimations. |
| **Discount Calculator** | `/tools/discount-calculator` | Calculate discount savings, sale prices, double discounts, tax rates, BOGO deals, and compare unit prices. Features history tracking, custom currencies, and exportable PDF summaries. |
| **EMI Calculator** | `/tools/emi-calculator` | Calculate your Equated Monthly Installment (EMI) for home, car, or personal loans. Get a full amortization schedule, principal vs. interest breakdown, processing fee, insurance add-on, and an interactive repayment chart — all in your browser. |
| **Factorial Calculator** | `/tools/factorial-calculator` | Calculate factorials with exact BigInt precision, including double factorials, derangements, permutations, combinations and prime factorization. See trailing zeros, digit counts and Stirling's approximation, generate a reference table and copy or download full values up to n = 100,000. |
| **Fibonacci Generator** | `/tools/fibonacci-generator` | Generate exact Fibonacci sequences with BigInt up to index 100,000. Choose custom seeds, ranges, steps and negative indices, check whether a number is Fibonacci, inspect prime terms, digit counts and golden-ratio convergence, build Zeckendorf decompositions, and export as text, CSV or JSON. |
| **Matrix Calculator** | `/tools/matrix-calculator` | Add, multiply, invert and decompose matrices up to 8 × 8 with live results. Sixteen operations include determinant, inverse, rank, trace, adjugate, cofactor, RREF, integer powers, Kronecker and Hadamard products and solving Ax = b, with precision controls and CSV, TSV, LaTeX or JSON export. |
| **Matrix Generator** | `/tools/matrix-generator` | Generate random, identity, diagonal, triangular, symmetric, skew-symmetric, sparse, Hilbert, Vandermonde and other matrices in one click. Control size, number range, decimals and seed reproducibility, edit cells directly, inspect determinant, rank, inverse and transpose, and export to CSV, TSV, JSON, LaTeX, Markdown, Python, MATLAB or JavaScript. |
| **Percentage Calculator** | `/tools/percentage-calculator` | A five-in-one percentage calculator for X% of Y, what percent X is of Y, percentage increase or decrease, adding or subtracting a percentage, and reverse percentages. Every result includes the substituted formula, step-by-step working and one-click copy. |
| **Random Number Generator** | `/tools/random-number-generator` | Cryptographically secure (CSPRNG) and reproducible seeded Random Number Generator. Features customizable ranges, polyhedral RPG dice roller (D20, D6, D100 with Advantage/Disadvantage), Gaussian/Poisson/Binomial probability distributions, lottery & raffle picker, interactive empirical histogram, and multi-format export. |
| **Savings Calculator** | `/tools/savings-calculator` | Calculate how your savings grow over time. Plan with initial deposits, recurring contributions, compound interest intervals, and advanced options like inflation, taxes, and annual increase step-ups. Export clean PDF reports. |
| **Shoe & Clothing Size Converter** | `/tools/shoe-clothing-size-converter` | Convert shoe and clothing sizes between EU, UK, US, Mondopoint and centimetres for women, men and children. Add foot or body measurements for a size recommendation, compare brand-specific fit notes, build a custom conversion chart and export it as CSV or PDF. |
| **Sleep Calculator** | `/tools/sleep-calculator` | Find your perfect bedtime or wake-up time with a free sleep cycle calculator. Works out the best times in 90-minute cycles based on your age, how long you take to fall asleep, your chronotype and daily habits like caffeine, screens, alcohol and stress. Includes sleep quality score, sleep stage breakdown, smart nap guide and a downloadable PDF sleep plan. |
| **Smoking Cost** | `/tools/smoking-cost-calculator` | Calculate the true financial and health cost of smoking cigarettes, vape, or tobacco. View expenses per day, 7 days, 1 month, 6 months, 1 year, 5 years, 10 years, and 20 years. Features BDT default and 30+ global currencies, tabs for Per Pack, Per Pcs, Vape, and compound interest investment growth. |
| **Tax Calculator** | `/tools/vat-gst-calculator` | Calculate VAT, GST, Sales Tax, and Tax-Inclusive Prices instantly. Add or remove tax, calculate tax amount only, download professional PDF reports, and use country presets. |
| **Tip Calculator** | `/tools/tip-calculator` | Calculate tips, split bills, rate service quality, apply tax/discounts, and split costs evenly or by custom shares. Keeps history stored locally and offers advanced calculation options. |
| **Trigonometric Function Calculator** | `/tools/trigonometric-calculator` | Evaluate all six trigonometric functions plus hyperbolics in degrees, radians, gradians or turns, with exact values at special angles, inverse functions, atan2 quadrant handling, a right-triangle solver and an interactive unit circle. Includes step-by-step identities, reference angles and CSV export. |
| **Unit Converter** | `/tools/unit-converter` | An all-in-one dimensional calculator capable of instantly transforming measurement metrics. Calculate scales across length, mass weight, temperature variations, square area limits, speed intervals, time zones, and data storage. |
| **Water Calculator** | `/tools/water-intake-calculator` | Calculate your daily fluid and water requirements based on body weight, age, gender, activity level, climate, pregnancy/breastfeeding, caffeine, and diet. Features advanced options, metric & imperial unit toggles, an interactive daily intake logger, hourly schedules, and downloadable PDF reports. |
| **Zakat Calculator** | `/tools/zakat-calculator` | Calculate your yearly Zakat obligation easily. Enter cash, gold, silver, investments, and liabilities to find your net wealth and due Zakat with advanced Nisab, calendar rate adjustments, and custom settings. |

### Fun (7)

| Tool | Route | Description |
| :--- | :--- | :--- |
| **Age on Other Planets** | `/tools/age-on-other-planets` | Find out how old you are on every planet. Enter your birth date to see your exact age on Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune and Pluto, plus your next planetary birthday, milestone dates, weight and jump heights. Fully customisable with share links, a branded PNG card, CSV and JSON export — 100% in your browser. |
| **Coin Flip & Dice** | `/tools/coin-flip-dice` | Flip custom coins with editable faces, colours and weights, or roll d4, d6, d8, d10, d12, d20, d100 or any side count from 2 to 1000. Roll pools with flat modifiers, use advantage or disadvantage, and review distribution stats and a private session history with CSV export. |
| **Dog & Cat Age Calculator** | `/tools/dog-cat-age-calculator` | Convert your dog or cat's age into human years with size-aware dog charts and lifestyle-aware cat conversions, then explore life stages, typical lifespan and remaining years. Add a gotcha day, track the next birthday and milestone dates, and export a share link, branded PNG card, CSV or JSON — 100% in your browser. |
| **Love Compatibility Test** | `/tools/love-compatibility-test` | Discover how compatible you are with your partner using name numerology, zodiac astrology, love languages, MBTI personality types, and relationship goals. A fun and insightful multi-dimensional compatibility analysis. |
| **Random Picker** | `/tools/random-picker` | Draw one winner or several names, shuffle an entire list, split people into balanced teams, or generate unique random numbers. Filter duplicates, apply per-item weights, tune the reveal animation, then export results and history as CSV. Your pool starts empty and never leaves the browser. |
| **Wheel Spinner** | `/tools/wheel-spinner` | Spin a customisable prize wheel built from your own options, each with its own weight and colour. Choose weighted or equal odds, bulk-paste lists, apply palettes, add sound and confetti, remove winners for elimination rounds, and export the wheel or spin history as JSON or CSV. |
| **Zodiac Sign Calculator** | `/tools/zodiac-sign-calculator` | Calculate your exact Zodiac Sun Sign, Vedic Rashi, Chinese Zodiac animal, Decan sub-ruler, Cusp traits, and love compatibility with an interactive astrological breakdown, personality matrix, and exportable PNG profile card. |

### Education (3)

| Tool | Route | Description |
| :--- | :--- | :--- |
| **Class Schedule Maker** | `/tools/class-schedule-maker` | Build and export your perfect weekly class schedule. Add classes with colors, choose from 6 stunning themes (Modern Dark, Ocean, Forest, Sunset, Clean Light, Minimal), and export as a high-quality PDF or PNG image. Includes live preview, advanced settings, time range control, and toggle for rooms, professors, and credits. |
| **NU CGPA Calculator** | `/tools/cgpa-calculator` | A tailored academic grading tool engineered specifically for National University Bangladesh students. Easily compute your semester-wise and cumulative CGPA based on the university's official credit hours and letter-grade scoring system. |
| **University CGPA Calculator** | `/tools/uni-cgpa-calculator` | A versatile academic calculator designed for Private and Public University students in Bangladesh. Calculate semester GPA or cumulative CGPA, choose from BUET, NSU, BRAC, UIU, AIUB, AUST presets, design custom grading scales, and download your result card as an image. |

### QR Code (3)

| Tool | Route | Description |
| :--- | :--- | :--- |
| **QR Code Generator** | `/tools/qr-code-generator` | Generate scalable, bespoke QR codes tailored for marketing campaigns, physical inventory tags, business cards, or product labels. Supports direct input mapping for custom web links, plain text messages, or email drafts. |
| **QR Code Scanner** | `/tools/qr-scanner` | Use your smartphone or computer's built-in camera to quickly decode any QR code or barcode. Instantly read URLs, contact information, text payloads, or Wi-Fi configurations without needing to download external native applications. |
| **WiFi QR Generator** | `/tools/wifi-qr` | Create a custom QR code that allows guests to instantly connect to your local Wi-Fi network without manually typing complex passwords. Simply fill in your network name and security type, then print or display the generated image. |

### Security (4)

| Tool | Route | Description |
| :--- | :--- | :--- |
| **Password Entropy Calculator** | `/tools/password-entropy-calculator` | Measure password strength with transparent Shannon entropy, character-pool and pattern-aware penalties, common-password detection and realistic crack-time models. Compare attack scenarios, build memorable passphrases, plan length upgrades and export a full security report — all locally in your browser. |
| **Password Generator** | `/tools/password-generator` | Protect your digital accounts with a powerful utility that generates strong, randomized passwords. Fully customize your security preferences by toggling uppercase letters, lowercase letters, numbers, and specialized symbols. |
| **Password Strength Tester** | `/tools/password-strength-tester` | Analyze your password strength with entropy calculation, crack time estimation, security checklist, and advanced character analysis — all locally in your browser. |
| **Suspicious URL Analyzer** | `/tools/suspicious-url-analyzer` | Analyze any URL for phishing signals with 27 heuristics covering punycode, lookalike domains, risky TLDs, IP hosts, URL shorteners, credential traps and more. Score risk with adjustable strictness, bulk-scan a list, add custom allow and block rules, inspect URL anatomy and export the findings. |

### Text (10)

| Tool | Route | Description |
| :--- | :--- | :--- |
| **Bangla Converter** | `/tools/bijoy-unicode-converter` | Convert Bengali text seamlessly between legacy Bijoy (SutonnyMJ/ANSI) and modern Unicode layouts. Includes support for SomewhereIn and Boishakhi keyboard formats, dynamic font scaling, file imports, character references, and instant downloads. |
| **Binary Converter** | `/tools/binary-decoder` | Instantly convert text to binary code and decode binary back to plain text. Customize byte separators (spaces, commas, none), explore bit-level editing, check character statistics, and view a complete ASCII binary reference chart. |
| **Braille Converter** | `/tools/braille-decoder` | Encode text into Braille or decode Braille back to readable text. Supports Bangla (Bengali Braille) and English (Grade 1 Standard Braille) with a full visual dot-pattern reference chart. Real-time conversion — all client-side with no uploads needed. |
| **Case Converter** | `/tools/case-converter` | Streamline text editing by instantly shifting code or copy blocks between standard string schemas. Safely swap formatting between UPPERCASE, lowercase, Title Case, Sentence case, camelCase, PascalCase, snake_case, and kebab-case. |
| **Deduplicate Lines** | `/tools/remove-duplicate-lines` | Instantly remove duplicate lines from any text. Supports case-insensitive matching, leading/trailing whitespace trimming, blank line removal, regex-based line filtering, 6 sort modes (A–Z, Z–A, length, reverse, shuffle), and optional line-number prepending. Copy or download your clean output in one click. |
| **Dummy Text Generator** | `/tools/dummy-text-generator` | Generate customized dummy text locally. Specify exact word count, character limits, or paragraph quantities. Choose from classic Lorem Ipsum, modern Tech Speak, or Sci-Fi Space vocabularies, with support for standard HTML paragraph tags. |
| **Fancy Text** | `/tools/fancy-text-generator` | Transform plain text into cool Unicode styles, cursive fonts, gothic calligraphy, and glitch styles for profiles and social posts. |
| **Morse Code Decoder** | `/tools/morse-code-decoder` | Instantly translate text to Morse code or decode Morse signals back to readable text. Features real-time translation, audio playback with adjustable speed and tone, a visual dot/dash display, and a complete A–Z reference chart — all client-side with no uploads needed. |
| **Text Repeater** | `/tools/text-repeater` | Automate tedious data generation tasks by replicating text loops thousands of times instantly. Configure tailored styling constraints such as custom item delimiters, specific spacing additions, or programmatic line breaks. |
| **TrekGlyph Tool** | `/tools/trekglyph-encoder-decoder` | Instantly translate plain text into exclusive custom geometric TrekGlyph cipher using '▲' and '▼' symbols, and decode it back in real-time. Features real-time interactive conversion, a click-to-insert symbol pad, and a complete symbol reference dictionary. |

### Time & Date (1)

| Tool | Route | Description |
| :--- | :--- | :--- |
| **Time Converter** | `/tools/time-converter` | Instantly convert between different units of time. Convert hours to minutes, days to seconds, years to milliseconds, and more with this versatile time converter. |

### Finance (3)

| Tool | Route | Description |
| :--- | :--- | :--- |
| **Freelance Hourly Rate Calculator** | `/tools/freelance-rate-calculator` | Work out a defensible freelance hourly, daily, weekly and project rate from your income target, billable capacity, overheads, taxes, pension, holiday and unpaid admin time. Compare employee and contractor scenarios, add value-based pricing and export a client-ready quote breakdown. |
| **Invoice Generator** | `/tools/invoice-generator` | Create professional invoices online for free with a live preview and instant totals. Add unlimited line items with per-item tax and discounts, choose inclusive or exclusive tax, switch between 40 currencies, upload your logo, pick a template and accent colour, then download a print-ready vector PDF or print directly. Drafts auto-save locally in your browser. |
| **Wedding Budget** | `/tools/wedding-budget-allocator` | Allocate, customize, and track your wedding budget. Features guest count sliders, interactive priority profiles, manual category sliders, estimated vs. actual itemized trackers, custom categories, a dynamic SVG donut chart, and high-quality PDF exports. |

### Travel (5)

| Tool | Route | Description |
| :--- | :--- | :--- |
| **Flight Duration Calculator** | `/tools/flight-duration-calculator` | Calculate exact flight duration with automatic time zone and daylight-saving handling. Solve for duration, arrival time or departure time, build multi-city itineraries with up to six flights, check layover risk, add door-to-door airport buffers and export a PDF report. 100% browser-based and private. |
| **Fuel Cost & Road Trip Calculator** | `/tools/fuel-cost-calculator` | Calculate fuel cost for any road trip in metric or imperial units. Include round trips, L/100 km, km/L, US or UK MPG, passenger splits, tolls, parking, accommodation, food, budget, fuel stops and CO₂, then copy a summary or download a CSV. 100% browser-based and private. |
| **Packing List Generator** | `/tools/packing-list-generator` | Build a fully customizable travel packing checklist with collapsible categories, priority levels (High / Medium / Low), add/edit/delete items and categories, trip settings (name, destination, dates, travelers, trip type), mark-all / clear-all, filter by packed/unpacked, and one-click PDF export. |
| **Travel Budget** | `/tools/travel-budget-splitter` | Plan, track, and split travel expenses with group members. Supports customizable travel categories, budget limits, multi-currency conversion, custom exchange rates, complex split rules (equal, weights, percentages, unequal, exclusions), debt simplification settlement, and PDF export. |
| **Visited Countries Map** | `/tools/country-visited-map` | Track every country you've been to on an interactive world map. Mark countries, see what % of the world you've explored, and build a shareable travel map you can keep updating. Fully customizable colors, export to PNG/JSON/CSV, and shareable links — all client-side and private. |

### Health (3)

| Tool | Route | Description |
| :--- | :--- | :--- |
| **Baby Growth Percentile & Feeding Calculator** | `/tools/baby-growth-feeding-calculator` | Track baby weight, length and head circumference against WHO-aligned references. See z-scores, percentiles and a growth chart, apply corrected age for premature babies, log measurements over time, estimate daily milk volume, formula scoops and feed times, and export a PDF summary or CSV log. |
| **Health Recommender** | `/tools/health-checkup-recommender` | Generate an evidence-based, fully customizable medical checkup & preventive screening plan based on age, gender, lifestyle habits, vitals (BMI), symptoms, family genetics, and diagnosed conditions. Features 36+ clinical investigations, interactive test checklist, custom test adder, doctor discussion guide, and downloadable high-resolution multi-page PDF reports with custom branding. |
| **Pregnancy Due Date Calculator** | `/tools/pregnancy-due-date-calculator` | Estimate your pregnancy due date from your last period, conception date, ultrasound scan or IVF transfer. See gestational age, trimester progress, days to go, conception and implantation estimates, full-term and milestone windows, then copy a summary or download an .ics calendar. 100% browser-based and private. |

### Design (11)

| Tool | Route | Description |
| :--- | :--- | :--- |
| **Bar Chart Generator** | `/tools/bar-chart-generator` | Free online bar chart and column chart generator with an interactive live preview and hover tooltips. Import a CSV, TSV or Excel file or type your data to build grouped or stacked bar charts with multiple series, curated colour palettes, adjustable axes and gridlines, labels, legends, rounded bars and one-click PNG or SVG export — all 100% in your browser. |
| **Business Card Maker** | `/tools/business-card-maker` | Design a print-ready business card with five layouts, US, European, square, slim and custom sizes, logo upload, locally generated QR codes, an optional card back, brand colours, typeface controls, bleed and safe-area preview, sheet imposition and 300 DPI PNG or PDF export. |
| **Color Contrast Checker** | `/tools/color-contrast-checker` | Test any foreground and background pair against WCAG 2.2 AA and AAA, score APCA contrast, preview real interface text, check large-text thresholds, simulate protanopia, deuteranopia and tritanopia, and generate accessible color fixes. Supports hex, RGB, HSL and eyedropper input. |
| **Funnel Chart Generator** | `/tools/funnel-chart-generator` | Free online funnel chart and conversion chart generator with an interactive live preview and hover tooltips. Import a CSV, TSV or Excel file or type your stages to build customisable funnels with funnel, bar or step shapes, WCAG-compliant high-contrast labels, conversion and drop-off labels, curated colour palettes, adjustable labels and legends, and one-click PNG or SVG export — all 100% in your browser. |
| **Letterhead Maker** | `/tools/letterhead-maker` | Create a print-ready company letterhead with four layouts, A4, US Letter, A5 and custom paper sizes, logo upload, brand and ink colours, typeface controls, bleed and safe-area preview, recipient and letter content, and 300 DPI PNG or PDF export. |
| **Line Chart Generator** | `/tools/line-chart-generator` | Free online line chart and area chart generator with an interactive live preview and hover tooltips. Import a CSV, TSV or Excel file or type your data to build straight, smooth or step line charts and stacked area charts with multiple series, curated colour palettes, markers, adjustable axes and gridlines, labels, legends and one-click PNG or SVG export — all 100% in your browser. |
| **Meme Generator** | `/tools/meme-generator` | Create memes on a real canvas editor: upload or paste a photo, add unlimited draggable text layers and style each one with custom fonts, gradient fills, outlines, shadows, highlight boxes, rotation and spacing. Export PNG, JPEG or WebP up to 3x resolution, or save the editable project as JSON. No uploads. |
| **Pie Chart Generator** | `/tools/pie-chart-generator` | Free online pie chart and donut chart generator with an interactive live preview and hover tooltips. Import a CSV, TSV or Excel file or type your data to create beautiful charts with curated colour palettes, adjustable labels, legends, exploded slices, rounded corners and one-click PNG or SVG export — all 100% in your browser. |
| **Polar Chart Generator** | `/tools/polar-chart-generator` | Free online polar chart and rose chart generator with an interactive live preview and hover tooltips. Import a CSV, TSV or Excel file or type your data to build polar area, Nightingale rose or radial bar charts with area-accurate square-root scaling, an optional centre hole, adjustable rings, rotation, gaps and corner radius, custom labels and legends, and one-click PNG or SVG export — all 100% in your browser. |
| **Print Size & DPI Calculator** | `/tools/print-size-calculator` | Convert between pixels, millimetres, centimetres and inches at any DPI or PPI. Check print quality, compare ISO A/B/C, US, photo and custom paper sizes, add bleed, safe margins and crop marks, and export a print-ready spec sheet or resize plan. |
| **Radar Chart Generator** | `/tools/radar-chart-generator` | Free online radar chart and spider chart generator with an interactive live preview and hover tooltips. Import a CSV, TSV or Excel file or type your data to build radial charts with multiple overlapping series, polygon or circular grids, adjustable scale and rotation, vertex points, custom labels and legends, and one-click PNG or SVG export — all 100% in your browser. |


## 🔐 Client-Side vs. Server-Side

ToolsTrek is **browser-first**: most tools complete their work in the client. Features that need live external data use a Next.js Route Handler under `app/(main)/api/`. The API Request Builder instead connects directly from the user's browser to the destination API; it does not use a ToolsTrek proxy.

| API Route | Used By | Purpose |
| :--- | :--- | :--- |
| `/api/check-domain-age` | Domain Age Checker | Authoritative WHOIS registry lookup |
| `/api/check-ssl` | SSL Certificate Checker | Live TLS handshake & certificate chain inspection |
| `/api/check-ip` | IP Checker | IP/domain geolocation lookup |
| `/api/check-email` | Disposable Email Detector | Syntax + MX record verification |
| `/api/dns-lookup` | DNS & Email Authentication Checker | DNS, SPF, DMARC, and optional DKIM lookup |
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
| **Analytics** | `@vercel/analytics` | Aggregate page-view and visitor insights; Vercel documents no cookie use |
| **Typography** | Google Sans Flex, Playfair Display, Staatliches (via `next/font/google`) | Body, display, and brand wordmark typefaces |
| **Code Quality** | ESLint 9 (flat config), `eslint-config-next` 16 | Next.js-aware static analysis |
| **Testing** | Node.js built-in test runner, Playwright | Cron/validator unit tests and production-browser smoke tests |
| **Catalog Checks** | `scripts/audit-tool-catalog.mjs` | Checks unique slugs, route files, canonical URLs, and Open Graph URLs |
| **Continuous Integration** | GitHub Actions | Runs lint, catalog checks, unit tests, and browser smoke tests on pushes and pull requests |

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

# Validate tool routes and canonical/social metadata
npm run validate:catalog

# Run focused unit tests for utility logic
npm run test:unit

# Refresh the README tool catalog after changing lib/toolsData.json
npm run docs:catalog
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
│   │   ├── api/                               # Server-side Route Handlers (8)
│   │   │   ├── check-domain-age/              #   WHOIS lookup
│   │   │   ├── check-email/                   #   Disposable email + MX verification
│   │   │   ├── check-ip/                      #   IP geolocation
│   │   │   ├── check-ssl/                     #   Live TLS certificate inspection
│   │   │   ├── dns-lookup/                    #   DNS and email-authentication records
│   │   │   ├── detect-tech/                   #   Website tech-stack detection
│   │   │   ├── screenshot/                    #   Microlink screenshot proxy
│   │   │   └── url-preview/                   #   OpenGraph/Twitter metadata
│   │   ├── data/
│   │   │   └── faqs.json                      # FAQ content (categorised Q&A)
│   │   ├── faq/                               # FAQ page with live search & filters
│   │   ├── favorites/                         # ⭐ Saved favorite tools
│   │   ├── privacy-policy/                    # Privacy policy
│   │   ├── recent/                            # 🕐 Recent tools history
│   │   ├── tools/                             # 164 tool route pages (one folder per tool)
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
│   ├── sitemap.js / robots.js                 # SEO route handlers
│   ├── llms.txt/route.js                       # AI-readable public tool index
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
│   ├── toolsData.json                         # Central registry for all 164 tools (source of truth)
│   ├── siteConfig.js                          # Shared site URL and registry-derived count
│   ├── cronExpression.js                      # Cron parser and next-run calculations
│   └── siteFileValidators.js                  # Local robots.txt and sitemap XML validation
│   ├── disposableDomains.json                 # 70,000+ disposable email domain database
│   ├── cryptoEngine.js                        # Client-side cryptographic helpers
│   ├── countries.js                           # Country registry for the Visited Countries Map
│   ├── world-geo.js                           # World GeoJSON loader + map projection helpers
│   ├── useGlobalSearch.js                     # Global search state logic
│   └── utils.js                               # `cn` class-merge helper + formatters
│
├── tests/                                     # Node.js unit tests
├── e2e/                                       # Playwright end-to-end smoke tests
├── scripts/                                   # Catalog audit and README generator
├── .github/workflows/ci.yml                   # GitHub Actions quality workflow
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
4. **Test locally** — run `npm run lint`, `npm run validate:catalog`, `npm run test:unit`, and `npm run test:e2e`; confirm `npm run build` succeeds.
5. **Open a Pull Request** describing your changes.

### Adding a New Tool

When adding a new utility:

1. Create its page route under `app/(main)/tools/<tool-slug>/page.js` (include SEO metadata: title, description, canonical, OpenGraph).
2. Implement its interactive UI under `app/(main)/tools-compo/tools/` (use a sub-folder for tool-specific engines/data).
3. Register the tool metadata (title, link, description, icon, categories, keywords) in `lib/toolsData.json` — this is the **single source of truth** for the grid, filters, search, and FAQ counters.
4. Add the route to navigation where relevant. The sitemap and `/llms.txt` are generated from the registry automatically.
5. Run `npm run validate:catalog` and `npm run docs:catalog` to check metadata and update the README table.
6. Update the FAQ (`app/(main)/data/faqs.json`) and navigation if needed.

---

## 📄 License

This project is open-source software licensed under the **[MIT License](./LICENSE)**.
