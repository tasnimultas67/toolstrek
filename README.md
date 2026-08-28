# ToolsTrek

<p align="center">
  <img src="public/favicon-96x96.png" alt="ToolsTrek Logo" width="80" height="80" />
</p>

<h3 align="center">Your Free, Browser-First Everyday Digital Toolbox</h3>

<p align="center">
  A high-performance, privacy-focused online utility hub built with <strong>Next.js 16</strong>, <strong>React 19</strong>, and <strong>Tailwind CSS 4</strong>.<br />
  Featuring <strong>92 powerful tools</strong> across developer, text, PDF, image, QR, calculator, finance, health, productivity, and security workflows — 100% free with no registration required.
</p>

<p align="center">
  <a href="https://github.com/tasnimultas67/toolstrek"><img src="https://img.shields.io/badge/Next.js-16.3-black?style=flat-square&logo=next.js" alt="Next.js" /></a>
  <a href="https://github.com/tasnimultas67/toolstrek"><img src="https://img.shields.io/badge/React-19.0-blue?style=flat-square&logo=react" alt="React" /></a>
  <a href="https://github.com/tasnimultas67/toolstrek"><img src="https://img.shields.io/badge/Tailwind-CSS_4-38bdf8?style=flat-square&logo=tailwind-css" alt="Tailwind CSS" /></a>
  <a href="https://github.com/tasnimultas67/toolstrek"><img src="https://img.shields.io/badge/Tools-92_Available-10b981?style=flat-square" alt="92 Tools" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/License-MIT-purple?style=flat-square" alt="MIT License" /></a>
</p>

---

## ✨ Features

- ⚡ **Browser-First Architecture** — Over 90% of tools execute 100% client-side via WebAssembly, WebCodecs, and JavaScript. No server latency.
- 🔒 **Zero Data Storage & Privacy** — Your files, passwords, documents, and inputs never leave your device.
- 🎨 **Modern Design System** — Sleek dark/light theme, rich typography (Outfit), and smooth micro-animations powered by Framer Motion.
- 🔍 **Command Palette Search** — Keyboard-accessible global search (`Cmd + K` or `Ctrl + K`) to launch any tool in milliseconds.
- ⭐ **Favorites System** — Pin your most-used tools to a dedicated Favorites dashboard, persisted via SSR-safe `localStorage`.
- 🕐 **Recent Tools Tracker** — Passively tracks and indexes recently visited utilities for rapid context switching.
- 📱 **Fully Responsive Layout** — Carefully tuned for mobile touchscreens, tablets, and high-DPI desktop displays.
- 📧 **Built-in Contact System** — SMTP-powered contact form protected by Google reCAPTCHA v2.
- 📊 **Vercel Analytics** — Lightweight, privacy-compliant page view and performance metrics.

---

## 🛠️ Tool Library (92 Tools)

### 🌐 Developer & Code Tools (25)

| Tool | Route | Description |
| :--- | :--- | :--- |
| **Regex Tester & Debugger** | `/tools/regex-tester` | Real-time regex pattern testing with AST syntax explainer, match groups, replacement, split, and multi-language code generator (JS, Python, Go, Rust, Java, C#, PHP, Ruby, Swift, Bash). |
| **Code Formatter & Beautifier** | `/tools/code-formatter` | Format and beautify JavaScript, TypeScript, HTML, CSS, JSON, XML, and SQL with custom indent sizing, theme support, and direct file export. |
| **JSON Editor** | `/tools/json-editor` | Advanced visual JSON editor and tree viewer with schema validation, sorting, minification, diff comparison, and two-way conversion to XML/YAML/CSV. |
| **JWT Decoder** | `/tools/jwt-decoder` | Decode and inspect JSON Web Tokens in real-time. Analyze headers, claims, verify signatures with custom secrets or public keys, and check token expiration client-side. |
| **SVG Editor & Visualizer** | `/tools/svg-editor` | Create, edit, optimize, and preview SVG code live. Features viewBox adjustments, global color palette replacement, and multi-format asset exports. |
| **Markdown Previewer** | `/tools/markdown-previewer` | Real-time GitHub-flavored Markdown editor with live HTML preview, syntax highlighting, table generation, and instant export. |
| **CSV Viewer & Editor** | `/tools/csv-viewer` | Inspect, sort, filter, search, and edit tabular CSV files directly in your browser with pagination and export support. |
| **Base64 Nexus** | `/tools/base64-encoder-decoder` | Encode and decode text, images, and binary files to/from Base64 strings with live preview and copy shortcuts. |
| **Hash Generator & Verifier** | `/tools/hash-generator` | Generate and verify cryptographic checksums (MD5, SHA-1, SHA-256, SHA-512, HMAC) locally in your browser. |
| **Color Converter** | `/tools/color-converter` | Real-time conversion across HEX, RGB, HSL, HSV, and CMYK with color harmonies, WCAG 2.1 contrast checker, and color blindness simulation. |
| **Gradient Generator** | `/tools/gradient-generator` | Build CSS and Tailwind gradients with custom color stops, linear/radial/conic styles, and PNG/SVG export. |
| **Responsive Viewport Tester** | `/tools/responsive-viewport` | Preview web apps across mobile, tablet, laptop, and desktop viewports with custom resolutions, orientation rotation, and bezel frames. |
| **Full Page Screenshot Tool** | `/tools/full-page-screenshot` | Capture full-page, high-resolution webpage screenshots from any live URL with custom viewport sizes. |
| **Domain Age Checker** | `/tools/domain-age-checker` | Query authoritative WHOIS registries to discover registration date, exact domain age, expiration status, and registrar data. |
| **SSL Certificate Checker** | `/tools/ssl-checker` | Live TLS inspection of any domain's SSL certificate — validity period, issuer, SANs, cipher suites, fingerprints, and full CA chain of trust. |
| **IP Checker** | `/tools/ip-checker` | Inspect your public IP or query any remote IP/domain for geographical location, ISP, ASN, timezone, and interactive map coordinates. |
| **Website Technology Detector** | `/tools/website-tech-detector` | Detect CMS, JavaScript frameworks, web servers, CDNs, analytics scripts, UI libraries, and evaluate HTTP security headers. |
| **Disposable Email Detector** | `/tools/disposable-email-detector` | Verify email syntax, run live MX record queries, detect 70,000+ temporary email providers, identify typos, and batch-process lists. |
| **Social Media URL Preview** | `/tools/social-preview` | Preview OpenGraph and Twitter card metadata for any webpage as it appears on Facebook, Twitter/X, LinkedIn, and Discord. |
| **Monitor Hz Test** | `/tools/monitor-hz-test` | Measure your display's real refresh rate (60Hz to 360Hz+) via high-precision `requestAnimationFrame` with frame stability and stutter graphs. |
| **View Metadata** | `/tools/view-metadata` | Inspect hidden EXIF camera details, GPS coordinates, lens parameters, PDF document properties, and audio/video tags. |
| **Edit Metadata** | `/tools/edit-metadata` | Modify, inject, or completely wipe EXIF metadata, camera info, author tags, and GPS coordinates from images and PDFs for privacy. |
| **Media Format Converter** | `/tools/media-format-converter` | In-browser WebCodecs & WASM transcoder for MP4, WebM, MKV, MOV, MP3, WAV, OGG, and FLAC with resolution, bitrate, rotation, and trim settings. |
| **ZIP File Creator & Compressor** | `/tools/zip-creator` | Bundle, compress, and create downloadable ZIP archives from files or entire directory trees with customizable Deflate compression levels. |
| **Paragraph Formatter** | `/tools/paragraph-formatter` | Clean, reformat, adjust alignments, line spacing, case styles, and extract styled HTML or raw clean text from messy paragraphs. |

---

### 📝 Text & Linguistic Tools (13)

| Tool | Route | Description |
| :--- | :--- | :--- |
| **Case Converter** | `/tools/case-converter` | Convert text between UPPER, lower, Title Case, Sentence case, camelCase, snake_case, kebab-case, PascalCase, and CONSTANT_CASE. |
| **Text Repeater** | `/tools/text-repeater` | Repeat words, sentences, or emoji blocks multiple times with custom line breaks, numbering, and separators. |
| **Text Analyzer Hub** | `/tools/text-analyzer-hub` | Analyze text metrics: word count, character count, sentence count, reading time, speaking time, readability scores, and keyword density. |
| **Bijoy ⇄ Unicode Converter** | `/tools/bijoy-unicode-converter` | Bidirectional Bengali text conversion between legacy ANSI Bijoy (SutonnyMJ) and modern Unicode layouts with SomewhereIn and Boishakhi support. |
| **NATO Phonetic Alphabet Converter** | `/tools/nato-phonetic-converter` | Convert text to standard international military/aviation phonetic spelling (Alpha, Bravo, Charlie...) with pronunciation guides and cheat sheets. |
| **Dummy Text Generator** | `/tools/dummy-text-generator` | Generate placeholder content: classic Lorem Ipsum, Tech Jargon, Sci-Fi excerpts, or custom paragraphs with word-count controls. |
| **Fancy Text Generator** | `/tools/fancy-text-generator` | Transform plain text into 40+ Unicode styles including cursive, gothic, bold serif, bubble, small caps, and glitch/Zalgo text. |
| **Remove Duplicate Lines** | `/tools/remove-duplicate-lines` | Deduplicate text lists, sort alphabetically, filter empty lines, and clean text strings in one click. |
| **TrekGlyph Encoder & Decoder** | `/tools/trekglyph-encoder-decoder` | Encode and decode text using ToolsTrek's exclusive geometric cipher mapping letters to ▲ and ▼ patterns with an interactive symbol pad. |
| **Morse Code Decoder** | `/tools/morse-code-decoder` | Translate plain text to Morse code and decode audio/text Morse back into readable text with sound playback and visual signals. |
| **Braille Decoder & Encoder** | `/tools/braille-decoder` | Convert English and Bangla text to/from Grade 1 Braille characters with interactive visual guides. |
| **Binary Decoder & Encoder** | `/tools/binary-decoder` | Convert text to binary code representations and decode 8-bit/16-bit binary streams back into readable ASCII/Unicode text. |
| **Numbers to Words** | `/tools/numbers-to-words` | Convert numeric amounts into full English words, currency notations (USD, BDT, INR, EUR, GBP), and cheque format strings. |

---

### 📄 PDF Management Tools (11)

| Tool | Route | Description |
| :--- | :--- | :--- |
| **PDF Merger** | `/tools/pdf-merger` | Merge multiple PDF documents into a single file with custom ordering and instant browser preview. |
| **PDF Splitter** | `/tools/pdf-split` | Split a PDF into individual pages, custom page ranges, or extract specific pages into separate documents. |
| **PDF Reorder** | `/tools/pdf-reorder` | Rearrange, rotate, delete, or re-sequence PDF pages using an intuitive drag-and-drop visual interface. |
| **Compress PDF Tool** | `/tools/compress-pdf` | Reduce PDF file size while preserving document readability and vector graphic fidelity. |
| **Crop PDF Tool** | `/tools/crop-pdf` | Visually trim margins and crop pages of any PDF document for printing or cleaner presentation. |
| **Combine PDF Files** | `/tools/combine-files-to-pdf` | Merge a mixed queue of image files (PNG, JPG, WebP) and existing PDF documents into a single unified PDF. |
| **N-Up PDF** | `/tools/n-up-pdf` | Arrange multiple pages per sheet (2-up, 4-up, 6-up, 8-up) for compact handout printing and paper saving. |
| **Add Attachments to PDF** | `/tools/add-attachments` | Embed arbitrary file attachments (spreadsheets, source code, images) directly inside a PDF document. |
| **PDF to Image Converter** | `/tools/pdf-to-image` | Export all pages or selected pages of any PDF document as high-resolution PNG or JPEG images. |
| **Image to PDF Converter** | `/tools/image-to-pdf` | Convert one or more images into a clean PDF document with customizable page sizes, margins, and orientations. |
| **Email to PDF Converter** | `/tools/email-to-pdf` | Convert email messages, headers, attachments, and rich-text bodies into archived, printable PDF documents. |

---

### 📊 Calculators & Academic Tools (7)

| Tool | Route | Description |
| :--- | :--- | :--- |
| **Age Calculator** | `/tools/age-calculate` | Calculate exact age in years, months, weeks, days, hours, minutes, and seconds with upcoming birthday countdowns. |
| **Days Tracker** | `/tools/days-tracker` | Calculate the exact duration between two dates or add/subtract days, business days, and weeks from a starting date. |
| **Unit Converter** | `/tools/unit-converter` | Convert length, mass, temperature, area, volume, speed, digital storage, energy, and pressure across metric and imperial systems. |
| **NU CGPA Calculator** | `/tools/cgpa-calculator` | Calculate National University Bangladesh GPA and CGPA across all four academic years with subject-specific grading scales. |
| **University CGPA Calculator** | `/tools/uni-cgpa-calculator` | Public & private university CGPA calculator with presets for BUET, NSU, BRAC, UIU, AIUB, AUST + custom grading builders and PDF reports. |
| **Roman Numeral Converter** | `/tools/roman-numeral-converter` | Convert integers to Roman numerals and back with step-by-step mathematical breakdowns and an interactive Roman keyboard. |
| **Class Schedule Maker** | `/tools/class-schedule-maker` | Design weekly academic timetables with courses, instructors, rooms, color-coding, conflict alerts, and image/PDF export. |

---

### 💰 Finance & Budgeting Tools (9)

| Tool | Route | Description |
| :--- | :--- | :--- |
| **EMI Calculator** | `/tools/emi-calculator` | Calculate loan EMI with month-by-month amortization schedules, interest breakdowns, processing fees, and insurance options. |
| **Savings Calculator** | `/tools/savings-calculator` | Project long-term savings growth with recurring contributions, compound interest intervals, inflation adjustments, and tax calculations. |
| **Discount Calculator** | `/tools/discount-calculator` | Calculate final sale prices, discount percentages, double discounts (stacked promos), BOGO deals, and unit price comparisons. |
| **VAT / GST Calculator** | `/tools/vat-gst-calculator` | Calculate VAT, GST, and Sales Tax in Add Tax or Remove Tax modes with global country presets and PDF invoice summaries. |
| **Zakat Calculator** | `/tools/zakat-calculator` | Compute annual Islamic Zakat on cash, gold, silver, business merchandise, stocks, and liabilities with live Nisab benchmarks. |
| **Currency Converter** | `/tools/currency-converter` | Real-time exchange rate conversions across 36+ currencies with fee/markup simulators, cash breakdown grids, and offline caching. |
| **Wedding Budget Allocator** | `/tools/wedding-budget-allocator` | Allocate and track wedding expenses with guest-count scaling, category sliders, estimated vs actual trackers, SVG donut charts, and PDF exports. |
| **Travel Budget Splitter** | `/tools/travel-budget-splitter` | Plan and split group travel expenses with multi-currency conversion, budget caps, flexible split rules, and automated debt settlement reports. |
| **Tip Calculator** | `/tools/tip-calculator` | Calculate tip amounts, split restaurant bills evenly or by custom shares, evaluate service quality, and export receipt breakdowns. |

---

### 🩺 Health & Wellness Tools (5)

| Tool | Route | Description |
| :--- | :--- | :--- |
| **Health Checkup Recommender** | `/tools/health-checkup-recommender` | Evidence-based preventive health screening planner based on age, gender, vitals, symptoms, lifestyle habits, and genetics with branded doctor PDF export. |
| **Bra Size Calculator** | `/tools/bra-size-calculator` | Professional bra sizing using the r/ABraThatFits 6-measurement algorithm with international size conversions, sister sizes, and fit reports. |
| **Water Intake Calculator** | `/tools/water-intake-calculator` | Determine daily fluid requirements based on body weight, climate, exercise, life stages, and diet with interactive logger and PDF exports. |
| **Smoking Cost Calculator** | `/tools/smoking-cost-calculator` | Calculate the financial and physical cost of smoking/vaping from 1 day to 20 years with 30+ currencies and investment growth projections. |
| **BMI Calculator** | `/tools/bmi-calculator` | Compute Body Mass Index with WHO & Asian classification cut-offs, ideal body weight ranges, and health category insights. |

---

### 🖼️ Image, Media & Design Tools (7)

| Tool | Route | Description |
| :--- | :--- | :--- |
| **Image Resizer** | `/tools/image-resizer` | Scale images by pixel or percentage, lock aspect ratios, apply social media presets (Instagram, YouTube, Twitter), and export to PNG/JPEG/WebP. |
| **GIF Maker** | `/tools/gif-maker` | Create animated GIFs from multiple image frames with drag-and-drop reordering, per-frame delays, ping-pong looping, and local encoding. |
| **AVIF Converter** | `/tools/avif-converter` | Convert modern image formats to and from AVIF for ultra-compact file sizes and faster web page load speeds. |
| **Image to Text Converter (OCR)** | `/tools/image-to-text` | Extract editable text and typography from images, scans, and screenshots locally using Tesseract.js in WebAssembly. |
| **Color Palette Extractor** | `/tools/color-palette-extractor` | Extract dominant color palettes from uploaded images and export ready-to-use CSS variables, HEX arrays, or Tailwind tokens. |
| **SVG Converter** | `/tools/svg-converter` | Convert scalable SVG vector files into high-resolution PNG, JPEG, or WebP raster formats with custom scaling. |
| **Favicon Generator** | `/tools/favicon-generator` | Generate complete favicon bundles (16×16 to 512×512, Apple Touch, PWA icons) with HTML link tags in a single downloadable ZIP. |

---

### 🔧 Productivity & Workflow Tools (8)

| Tool | Route | Description |
| :--- | :--- | :--- |
| **Todo Tool** | `/tools/todo-tool` | Feature-packed task manager with subtasks, priority levels, due dates, reminder alerts, category tags, search filters, and import/export. |
| **Email Signature Editor** | `/tools/email-signature-editor` | WYSIWYG professional email signature builder with customizable templates, social icons, logos, CTA buttons, and one-click HTML copy. |
| **Packing List Generator** | `/tools/packing-list-generator` | Customizable travel packing checklist with collapsible categories, item priority badges, packed filters, and PDF export. |
| **Timezone Clock & Converter** | `/tools/timezone-clock` | World clocks, interactive meeting planner slider across timezones, local alarms, and UTC offset visualizers. |
| **Time Converter** | `/tools/time-converter` | Convert between seconds, minutes, hours, days, weeks, months, years, and milliseconds instantly. |
| **Typing Test** | `/tools/typing-test` | Measure typing speed (WPM) and accuracy with live performance graphs, error heatmaps, mechanical sound effects, and certificates. |
| **Fake Info Generator** | `/tools/fake-info-generator` | Generate realistic mock identities, addresses, phone numbers, and company profiles for QA testing and software demos. |
| **Link Shortener** | `/tools/link-shortner` | Shorten long URLs for clean sharing on social platforms, complete with scannable QR code generation. |

---

### 📷 QR Code Tools (3)

| Tool | Route | Description |
| :--- | :--- | :--- |
| **QR Code Generator** | `/tools/qr-code-generator` | Generate custom QR codes with color styling, logo embeds, custom sizing, and error correction level options. |
| **QR Code Scanner** | `/tools/qr-scanner` | Scan and decode QR codes and barcodes directly from your device camera or uploaded image files. |
| **Wifi QR Code Generator** | `/tools/wifi-qr` | Create scannable WiFi QR codes for instant network connection, complete with printable PDF tent card templates. |

---

### 🔒 Security & Privacy Tools (2)

| Tool | Route | Description |
| :--- | :--- | :--- |
| **Password Generator** | `/tools/password-generator` | Generate strong, cryptographically secure passwords and passphrases with custom length, symbol, and digit rules. |
| **Password Strength Tester** | `/tools/password-strength-tester` | Inspect password entropy, estimated brute-force crack time, security checklists, and common pattern vulnerabilities. |

---

### 🔮 Fun & Astrology Tools (2)

| Tool | Route | Description |
| :--- | :--- | :--- |
| **Zodiac Sign Calculator** | `/tools/zodiac-sign-calculator` | Calculate Sun sign, Vedic Rashi, Chinese Zodiac, Decan traits, ruling elements, and download shareable astrological profile cards. |
| **Love Compatibility Test** | `/tools/love-compatibility-test` | Explore relationship harmony through zodiac compatibility, numerology life path numbers, love languages, and chemistry scores. |

---

## 🧰 Tech Stack

| Category | Technologies | Description |
| :--- | :--- | :--- |
| **Core Framework** | Next.js 16.3.3, React 19.0.0 | Server and client components, Turbopack, App Router architecture |
| **Styling & Design** | Tailwind CSS 4.2.2, `@tailwindcss/postcss`, `tw-animate-css` | Next-gen CSS engine, responsive utility styling, dark mode |
| **UI Components** | Radix UI Primitives, shadcn/ui, `cmdk` | Accessible accordion, dialog, popover, select, slider, switch, command palette |
| **Animations** | Framer Motion 12.38.0, Motion | Physics-based micro-interactions, layout transitions, stagger animations |
| **Iconography** | Lucide React, Heroicons | Modern, consistent vector icons |
| **Form Management** | React Hook Form, Zod, `@hookform/resolvers` | Schema validation and high-performance controlled form states |
| **PDF Processing** | `pdf-lib`, `pdfjs-dist`, `jspdf`, `react-pdf` | Client-side PDF manipulation, rendering, splitting, merging, and generation |
| **QR & Barcodes** | `qrcode`, `qrcode.react`, `@zxing/library`, `jsqr` | High-speed QR/barcode generation and camera-based decoding |
| **OCR & Image Tools** | `tesseract.js`, `browser-image-compression`, `piexifjs`, `react-dropzone`, `react-colorful`, `color-thief-browser` | In-browser OCR text extraction, image compression, EXIF editing, color picking |
| **Media & Audio** | `mediabunny`, `@mediabunny/mp3-encoder`, `@mediabunny/flac-encoder` | Client-side hardware-accelerated WebCodecs transcoding (video & audio) |
| **Code & Markdown** | `js-beautify`, `sql-formatter`, `highlight.js`, `react-markdown`, `remark-gfm`, `rehype-highlight`, `rehype-raw` | Multi-language code beautification and GitHub-flavored markdown preview |
| **Archive & Utils** | `jszip`, `date-fns`, `clsx`, `tailwind-merge`, `class-variance-authority`, `clipboard-copy`, `react-country-flag` | Client-side ZIP creation, date arithmetic, class utility merging |
| **Notifications** | Sonner | Rich, modern toast notification system |
| **Network & Security** | `whois`, Node.js `tls` | WHOIS domain lookups, live TLS certificate handshake inspection |
| **Email & Security** | Nodemailer, `react-google-recaptcha` | Contact form delivery with bot protection |
| **Analytics** | `@vercel/analytics` | Lightweight, privacy-compliant traffic analytics |
| **Typography** | Outfit (via `next/font/google`) | Clean, modern geometric sans-serif typeface |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.18+ (Node.js 20+ recommended)
- **npm**, **pnpm**, or **yarn**

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

Copy the example environment configuration file and provide your credentials (if using contact form features):

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
# Create optimized production build
npm run build

# Start the production server
npm start
```

### Code Quality

```bash
npm run lint
```

---

## 📁 Project Structure

```text
toolstrek/
├── app/
│   ├── (main)/                                # Main application route group
│   │   ├── about-us/                          # About page
│   │   ├── api/                               # Server-side API endpoints
│   │   │   ├── check-domain-age/              #   WHOIS lookup route
│   │   │   ├── check-ip/                      #   IP geolocation route
│   │   │   ├── check-ssl/                     #   Live TLS certificate inspect route
│   │   │   ├── contact/                       #   SMTP contact email sender
│   │   │   └── verify-recaptcha/              #   Google reCAPTCHA v2 verification
│   │   ├── data/
│   │   │   └── faqs.json                      # Comprehensive FAQs for all 92 tools
│   │   ├── faq/                               # FAQ page with interactive search
│   │   ├── favorites/                         # ⭐ Saved Favorite tools view
│   │   ├── privacy-policy/                    # Privacy Policy documentation
│   │   ├── recent/                            # 🕐 Recent Tools history view
│   │   ├── tools/                             # 92 Individual Tool Route Pages
│   │   │   ├── add-attachments/               #   Add Attachments to PDF
│   │   │   ├── age-calculate/                 #   Age Calculator
│   │   │   ├── avif-converter/                #   AVIF Converter
│   │   │   ├── base64-encoder-decoder/        #   Base64 Nexus
│   │   │   ├── bijoy-unicode-converter/       #   Bijoy ⇄ Unicode Converter
│   │   │   ├── binary-decoder/                #   Binary Decoder & Encoder
│   │   │   ├── bmi-calculator/                #   BMI Calculator
│   │   │   ├── bra-size-calculator/           #   Bra Size Calculator
│   │   │   ├── braille-decoder/               #   Braille Decoder & Encoder
│   │   │   ├── case-converter/                #   Case Converter
│   │   │   ├── cgpa-calculator/               #   NU CGPA Calculator
│   │   │   ├── class-schedule-maker/          #   Class Schedule Maker
│   │   │   ├── code-formatter/                #   Code Formatter & Beautifier
│   │   │   ├── color-converter/               #   Color Converter
│   │   │   ├── color-palette-extractor/       #   Color Palette Extractor
│   │   │   ├── combine-files-to-pdf/          #   Combine Mixed Files to PDF
│   │   │   ├── compress-pdf/                  #   Compress PDF
│   │   │   ├── crop-pdf/                      #   Crop PDF Pages
│   │   │   ├── csv-viewer/                    #   CSV Viewer & Editor
│   │   │   ├── currency-converter/            #   Currency Converter
│   │   │   ├── days-tracker/                  #   Days Tracker
│   │   │   ├── discount-calculator/           #   Discount Calculator
│   │   │   ├── disposable-email-detector/     #   Disposable Email Detector
│   │   │   ├── domain-age-checker/            #   Domain Age Checker
│   │   │   ├── dummy-text-generator/          #   Dummy Text Generator
│   │   │   ├── edit-metadata/                 #   Edit Metadata
│   │   │   ├── email-signature-editor/        #   Email Signature Editor
│   │   │   ├── email-to-pdf/                  #   Email to PDF Converter
│   │   │   ├── emi-calculator/                #   EMI Loan Calculator
│   │   │   ├── fake-info-generator/           #   Fake Info Generator
│   │   │   ├── fancy-text-generator/          #   Fancy Text Generator
│   │   │   ├── favicon-generator/             #   Favicon Generator
│   │   │   ├── full-page-screenshot/          #   Full Page Screenshot Tool
│   │   │   ├── gif-maker/                     #   GIF Maker
│   │   │   ├── gradient-generator/            #   Gradient Generator
│   │   │   ├── hash-generator/                #   Hash Generator & Verifier
│   │   │   ├── health-checkup-recommender/    #   Health Checkup Recommender
│   │   │   ├── image-resizer/                 #   Image Resizer
│   │   │   ├── image-to-pdf/                  #   Image to PDF Converter
│   │   │   ├── image-to-text/                 #   Image to Text (OCR)
│   │   │   ├── ip-checker/                    #   IP Geolocation Checker
│   │   │   ├── json-editor/                   #   JSON Editor & Tree Viewer
│   │   │   ├── jwt-decoder/                   #   JWT Decoder & Verifier
│   │   │   ├── link-shortner/                 #   Link Shortener
│   │   │   ├── love-compatibility-test/       #   Love Compatibility Test
│   │   │   ├── markdown-previewer/            #   Markdown Live Previewer
│   │   │   ├── media-format-converter/        #   Media Format Converter (WebCodecs)
│   │   │   ├── monitor-hz-test/               #   Monitor Hz Test
│   │   │   ├── morse-code-decoder/            #   Morse Code Decoder
│   │   │   ├── n-up-pdf/                      #   N-Up PDF Layout
│   │   │   ├── nato-phonetic-converter/       #   NATO Phonetic Alphabet
│   │   │   ├── numbers-to-words/              #   Numbers to Words
│   │   │   ├── packing-list-generator/        #   Packing List Generator
│   │   │   ├── paragraph-formatter/           #   Paragraph Formatter
│   │   │   ├── password-generator/            #   Password Generator
│   │   │   ├── password-strength-tester/      #   Password Strength Tester
│   │   │   ├── pdf-merger/                    #   PDF Merger
│   │   │   ├── pdf-reorder/                   #   PDF Page Reorder
│   │   │   ├── pdf-split/                     #   PDF Splitter
│   │   │   ├── pdf-to-image/                  #   PDF to Image Converter
│   │   │   ├── qr-code-generator/             #   QR Code Generator
│   │   │   ├── qr-scanner/                    #   QR Code Scanner
│   │   │   ├── regex-tester/                  #   Regex Tester & Debugger
│   │   │   ├── remove-duplicate-lines/        #   Remove Duplicate Lines
│   │   │   ├── responsive-viewport/           #   Responsive Viewport Tester
│   │   │   ├── roman-numeral-converter/       #   Roman Numeral Converter
│   │   │   ├── savings-calculator/            #   Savings Calculator
│   │   │   ├── smoking-cost-calculator/       #   Smoking Cost Calculator
│   │   │   ├── social-preview/                #   Social Media URL Preview
│   │   │   ├── ssl-checker/                   #   SSL Certificate Checker
│   │   │   ├── svg-converter/                 #   SVG Converter
│   │   │   ├── svg-editor/                    #   SVG Editor & Visualizer
│   │   │   ├── text-analyzer-hub/             #   Text Analyzer Hub
│   │   │   ├── text-repeater/                 #   Text Repeater
│   │   │   ├── time-converter/                #   Time Converter
│   │   │   ├── timezone-clock/                #   Timezone Clock & Converter
│   │   │   ├── tip-calculator/                #   Tip Calculator
│   │   │   ├── todo-tool/                     #   Todo Tool
│   │   │   ├── travel-budget-splitter/        #   Travel Budget Splitter
│   │   │   ├── trekglyph-encoder-decoder/     #   TrekGlyph Cipher
│   │   │   ├── typing-test/                   #   Typing Test
│   │   │   ├── uni-cgpa-calculator/           #   University CGPA Calculator
│   │   │   ├── unit-converter/                #   Unit Converter
│   │   │   ├── vat-gst-calculator/            #   VAT / GST Calculator
│   │   │   ├── view-metadata/                 #   View Metadata
│   │   │   ├── water-intake-calculator/       #   Water Intake Calculator
│   │   │   ├── website-tech-detector/         #   Website Tech Detector
│   │   │   ├── wedding-budget-allocator/      #   Wedding Budget Allocator
│   │   │   ├── wifi-qr/                       #   WiFi QR Generator
│   │   │   ├── zakat-calculator/              #   Zakat Calculator
│   │   │   ├── zip-creator/                   #   ZIP Creator & Compressor
│   │   │   └── zodiac-sign-calculator/        #   Zodiac Sign Calculator
│   │   ├── tools-compo/                       # UI Components & Tool Logic
│   │   │   ├── Home-Compo/                    #   Homepage-specific sections
│   │   │   ├── tools/                         #   Tool logic components
│   │   │   ├── FAQCon.js                      #   FAQ Accordion & Search component
│   │   │   ├── Header.js                      #   Main navigation header
│   │   │   ├── Footer.js                      #   Main site footer
│   │   │   ├── HCategories.js                 #   Category browser grid
│   │   │   └── ParentTools.js                 #   Tool listing / filtration engine
│   │   ├── layout.js                          # Main group layout
│   │   └── page.js                            # Homepage
│   ├── error.js                               # Global error boundary
│   ├── global-error.js                        # Root-level error boundary
│   ├── globals.css                            # Global styles & CSS tokens
│   ├── layout.js                              # Root HTML layout & font loader
│   ├── loading.js                             # Loading UI indicator
│   └── not-found.js                           # Custom 404 page
│
├── components/
│   ├── FavoriteButton.jsx                     # ⭐ Favorite toggle component
│   ├── RecentToolsTracker.jsx                 # 🕐 Passive tool visitation tracker
│   └── ui/                                    # Accessible UI primitives (shadcn/Radix)
│
├── hooks/
│   ├── useFavorites.js                        # SSR-safe localStorage favorites hook
│   └── useRecentTools.js                      # SSR-safe localStorage recents hook
│
├── lib/
│   ├── toolsData.json                         # Central registry for all 92 tools
│   ├── cryptoEngine.js                        # Client-side cryptographic algorithms
│   ├── disposableDomains.json                 # 70,000+ disposable email domain database
│   ├── useGlobalSearch.js                     # Global search state logic
│   └── utils.js                               # Class merging helper (`cn`)
│
├── public/                                    # Static assets, workers, and icons
├── components.json                            # shadcn/ui configuration
├── next.config.mjs                            # Next.js configuration
├── package.json                               # Dependencies and scripts
└── README.md                                  # Project documentation
```

---

## 🤝 Contributing

Contributions are warmly welcomed! To contribute:

1. **Fork** the repository.
2. **Create a branch** for your feature or fix (`git checkout -b feature/my-cool-tool`).
3. **Commit your changes** with clear, descriptive commit messages.
4. **Test locally** — ensure the dev server compiles without errors and lint passes (`npm run lint`).
5. **Open a Pull Request** describing your changes.

### Adding a New Tool

When adding a new utility:
1. Create its page route under `app/(main)/tools/<tool-slug>/page.js`.
2. Implement its interactive UI component under `app/(main)/tools-compo/tools/`.
3. Register the tool metadata (title, route, icon, categories, keywords, description) in `lib/toolsData.json`.
4. Update the FAQ and documentation if necessary.

---

## 📄 License

This project is open-source software licensed under the **[MIT License](./LICENSE)**.
