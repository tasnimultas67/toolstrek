# ToolsTrek

**ToolsTrek** is a modern, browser-first online utility hub built with **Next.js 16** and **React 19**. It brings together 58 tools across text, PDF, image, QR, calculator, security, media, and developer categories — all in one fast, responsive, and privacy-friendly interface.

---

## ✨ Features

- ⚡ **Browser-first** — most tools run entirely client-side, no account required
- 🔒 **Privacy-conscious** — files and data are processed locally when possible
- 🎨 **Modern UI** — dark/light theme, smooth animations with Framer Motion
- 🔍 **Global Search** — keyboard-accessible command palette to find any tool instantly
- ⭐ **Favorites System** — pin your most-used tools, persisted via `localStorage`
- 🕐 **Recent Tools** — automatically tracks and highlights recently visited tools
- 📱 **Fully Responsive** — works seamlessly across desktop and mobile
- 📧 **Contact Form** — SMTP-powered with Google reCAPTCHA v2 protection
- 📊 **Vercel Analytics** — built-in page view and performance tracking

---

## 🛠️ Tool Library (58 Tools)

### 📝 Text

| Tool                          | Description                                                                          |
| ----------------------------- | ------------------------------------------------------------------------------------ |
| Case Converter                | Convert text between UPPER, lower, Title, Sentence, camelCase, snake_case, and more |
| Text Repeater                 | Repeat any text multiple times with customizable separator options                   |
| Markdown Previewer            | Real-time GitHub-flavored Markdown & HTML preview editor                             |
| Numbers to Words              | Convert any number into its full English word representation                         |
| Dummy Text Generator          | Generate customized Lorem Ipsum, Tech Speak, or Sci-Fi placeholder text              |
| Morse Code Decoder            | Translate text to Morse code and decode audio/text Morse back to plain text          |
| Braille Decoder & Encoder     | Convert text to/from Grade 1 English and Bangla Braille with visual guides           |
| Binary Decoder & Encoder      | Instantly convert text to binary code representations and vice-versa                 |
| Fancy Text Generator          | Transform plain text into Unicode styles, cursive fonts, gothic, and glitch styles   |
| Remove Duplicate Lines        | Remove repeated lines, sort, filter by regex, and clean text output in one click     |
| TrekGlyph Encoder & Decoder   | Encode/decode text using the exclusive geometric TrekGlyph cipher (▲/▼ symbols)     |

### 📊 Calculator

| Tool                                    | Description                                                                                          |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Age Calculator                          | Calculate exact age in years, months, days, hours, and minutes                                       |
| BMI Calculator                          | Calculate Body Mass Index with health category classification                                        |
| Days Tracker                            | Find an end date by adding or subtracting days from a start date                                     |
| EMI Calculator                          | Calculate loan EMI with amortization schedule, interest breakdown, processing fee & insurance options |
| NU CGPA Calculator                      | Calculate National University Bangladesh CGPA from subject grades                                    |
| University CGPA Calculator              | Private & public university CGPA — BUET, NSU, BRAC, UIU, AIUB, AUST presets + custom scales         |
| Unit Converter                          | Convert length, weight, temperature, area, volume, speed, and more                                   |
| VAT / GST Calculator                    | Calculate VAT, GST, and Sales Tax with country presets, PDF export, and add/remove tax modes         |
| Zakat Calculator                        | Compute annual Zakat on cash, gold, silver, investments, and liabilities with Nisab adjustment       |
| Discount Calculator                     | Calculate discounts, double discounts, BOGO deals, tax rates, and unit price comparisons             |
| Savings Calculator                      | Project savings growth with compound interest, inflation, tax, and recurring contributions           |

### 🔧 Productivity

| Tool                        | Description                                                                             |
| --------------------------- | --------------------------------------------------------------------------------------- |
| Link Shortener              | Shorten long URLs for clean, easy sharing                                               |
| Fake Info Generator         | Generate realistic fake identities for testing purposes                                 |
| Typing Test                 | Measure WPM and accuracy with live stats, heatmap, sound effects, and certificate       |
| Timezone Clock & Converter  | Live world clocks, meeting planner, timezone converter, and local alarm                 |

### 🔒 Security

| Tool               | Description                                           |
| ------------------ | ----------------------------------------------------- |
| Password Generator | Create strong, randomized passwords with custom rules |

### 🌐 Developer

| Tool                        | Description                                                                                     |
| --------------------------- | ----------------------------------------------------------------------------------------------- |
| Domain Age Checker          | Look up when any domain was first registered                                                    |
| IP Checker                  | Inspect public IP addresses or query domain/IP geolocations, networks, and maps                 |
| Color Converter             | Convert HEX, RGB, HSL, HSV, CMYK in real-time with harmonies, WCAG checker & blindness sim     |
| SSL Certificate Checker     | Inspect any domain's SSL/TLS cert — validity, issuer, SANs, fingerprints & full chain of trust |
| Gradient Generator          | Build CSS & Tailwind gradients with custom stops, linear/radial/conic types, and PNG/SVG export |
| Disposable Email Detector   | Detect temporary/disposable emails, check MX records, verify syntax, and bulk-process lists     |
| Website Tech Detector       | Identify CMS, JS frameworks, web servers, CDNs, analytics tools, and HTTP security headers      |
| View Metadata               | Reveal hidden metadata (EXIF, GPS, camera info) from images, PDFs, audio, and video files      |
| Edit Metadata               | Modify, inject, or strip EXIF/GPS/author metadata from images, PDFs, and documents             |
| Media Format Converter      | Convert MP4, WebM, MKV, MOV, MP3, WAV, OGG, FLAC in-browser via WebCodecs (MediaBunny)        |

### 📷 QR Code

| Tool              | Description                                           |
| ----------------- | ----------------------------------------------------- |
| QR Code Generator | Generate custom QR codes with color and style options |
| QR Code Scanner   | Scan QR codes via device camera in real-time          |
| WiFi QR Generator | Generate a scannable QR code for any WiFi network     |

### 🖼️ Image

| Tool                    | Description                                                                        |
| ----------------------- | ---------------------------------------------------------------------------------- |
| AVIF Converter          | Convert images to/from the AVIF format for better compression                      |
| Image to Text (OCR)     | Extract text from images locally using Tesseract.js                                |
| Color Palette Extractor | Extract color palettes from images, pick colors, copy HEX/RGB/HSL, export configs |
| SVG Converter           | Convert SVG vectors to PNG, JPEG, or WebP with custom dimensions and aspect locks  |
| Favicon Generator       | Generate standard web favicon packages (ico, png, pwa icons) client-side           |

### 📄 PDF

| Tool                 | Description                                            |
| -------------------- | ------------------------------------------------------ |
| PDF to Image         | Convert PDF pages into high-resolution PNG/JPEG images |
| Image to PDF         | Convert one or more images into a PDF document         |
| Combine Files to PDF | Merge images and PDFs into a single PDF                |
| PDF Merger           | Merge multiple PDF files into one                      |
| PDF Splitter         | Split a PDF into individual pages or ranges            |
| PDF Reorder          | Drag-and-drop to rearrange PDF pages                   |
| Compress PDF         | Reduce PDF file size without significant quality loss  |
| Crop PDF             | Trim margins and crop PDF pages online                 |
| N-Up PDF             | Print multiple pages per sheet in your PDF layout      |
| Add Attachments      | Embed file attachments inside a PDF document           |

---

## 🧰 Tech Stack

| Category          | Technologies                                                                          |
| ----------------- | ------------------------------------------------------------------------------------- |
| **Framework**     | Next.js 16.2, React 19                                                                |
| **Styling**       | Tailwind CSS 4, tw-animate-css                                                        |
| **UI Components** | Radix UI (Accordion, Dialog, Select, Slider, Switch, Popover, Label), shadcn/ui       |
| **Animation**     | Framer Motion 12, Motion                                                              |
| **Icons**         | Lucide React, Heroicons                                                               |
| **Forms**         | React Hook Form, Zod, @hookform/resolvers                                             |
| **PDF**           | pdf-lib, pdfjs-dist, jspdf, react-pdf                                                 |
| **QR Code**       | qrcode, qrcode.react, @zxing/library, jsqr                                            |
| **OCR**           | Tesseract.js                                                                          |
| **Image**         | browser-image-compression, react-dropzone, react-colorful                             |
| **Media**         | mediabunny, @mediabunny/mp3-encoder, @mediabunny/flac-encoder (WebCodecs transcoding) |
| **Markdown**      | react-markdown, remark-gfm, remark-breaks, rehype-highlight, rehype-raw, highlight.js |
| **Drag & Drop**   | @hello-pangea/dnd                                                                     |
| **Utilities**     | date-fns, jszip, clsx, tailwind-merge, class-variance-authority                       |
| **Notifications** | Sonner                                                                                |
| **Camera**        | react-webcam                                                                          |
| **Email**         | Nodemailer                                                                            |
| **reCAPTCHA**     | react-google-recaptcha                                                                |
| **Analytics**     | @vercel/analytics                                                                     |
| **Font**          | Outfit (Google Fonts via next/font)                                                   |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+
- **npm**

### Install Dependencies

```bash
npm install
```

### Run the Development Server

```bash
npm run dev
```

The app runs at **http://localhost:8080** (Turbopack enabled by default).

### Production Build

```bash
npm run build
npm start
```

### Lint

```bash
npm run lint
```

---

## 📁 Project Structure

```text
toolstrek/
├── app/
│   ├── (main)/                        # Main route group
│   │   ├── api/                       # Server-side API routes
│   │   │   ├── check-domain-age/      #   Domain WHOIS lookup
│   │   │   ├── check-ip/              #   IP geolocation lookup
│   │   │   ├── check-ssl/             #   SSL/TLS certificate inspection (Node tls)
│   │   │   ├── contact/               #   Contact form (Nodemailer + SMTP)
│   │   │   └── verify-recaptcha/      #   Google reCAPTCHA verification
│   │   ├── about-us/                  # About page
│   │   ├── data/                      # Static data (faqs.json, etc.)
│   │   ├── faq/                       # FAQ page
│   │   ├── favorites/                 # ⭐ Favorites page
│   │   ├── privacy-policy/            # Privacy Policy page
│   │   ├── recent/                    # 🕐 Recently visited tools page
│   │   ├── tools/                     # Individual tool pages (56 routes)
│   │   │   ├── add-attachments/
│   │   │   ├── age-calculate/
│   │   │   ├── avif-converter/
│   │   │   ├── binary-decoder/
│   │   │   ├── bmi-calculator/
│   │   │   ├── braille-decoder/
│   │   │   ├── case-converter/
│   │   │   ├── cgpa-calculator/
│   │   │   ├── color-converter/
│   │   │   ├── color-palette-extractor/
│   │   │   ├── combine-files-to-pdf/
│   │   │   ├── compress-pdf/
│   │   │   ├── crop-pdf/
│   │   │   ├── days-tracker/
│   │   │   ├── discount-calculator/   # NEW
│   │   │   ├── disposable-email-detector/ # NEW
│   │   │   ├── domain-age-checker/
│   │   │   ├── dummy-text-generator/
│   │   │   ├── edit-metadata/         # NEW
│   │   │   ├── emi-calculator/
│   │   │   ├── fake-info-generator/
│   │   │   ├── fancy-text-generator/
│   │   │   ├── favicon-generator/
│   │   │   ├── gradient-generator/
│   │   │   ├── image-to-pdf/
│   │   │   ├── image-to-text/
│   │   │   ├── ip-checker/
│   │   │   ├── link-shortner/
│   │   │   ├── markdown-previewer/
│   │   │   ├── media-format-converter/ # NEW
│   │   │   ├── morse-code-decoder/
│   │   │   ├── n-up-pdf/
│   │   │   ├── numbers-to-words/
│   │   │   ├── password-generator/
│   │   │   ├── pdf-compression/
│   │   │   ├── pdf-merger/
│   │   │   ├── pdf-reorder/
│   │   │   ├── pdf-split/
│   │   │   ├── pdf-to-image/
│   │   │   ├── qr-code-generator/
│   │   │   ├── qr-scanner/
│   │   │   ├── remove-duplicate-lines/
│   │   │   ├── savings-calculator/    # NEW
│   │   │   ├── ssl-checker/
│   │   │   ├── svg-converter/
│   │   │   ├── text-repeater/
│   │   │   ├── timezone-clock/
│   │   │   ├── trekglyph-encoder-decoder/ # NEW
│   │   │   ├── typing-test/
│   │   │   ├── uni-cgpa-calculator/   # NEW
│   │   │   ├── unit-converter/
│   │   │   ├── vat-gst-calculator/
│   │   │   ├── view-metadata/         # NEW
│   │   │   ├── website-tech-detector/ # NEW
│   │   │   ├── wifi-qr/
│   │   │   └── zakat-calculator/
│   │   ├── tools-compo/               # Shared UI components & page shells
│   │   │   ├── Home-Compo/            #   Homepage-specific components
│   │   │   │   ├── CTA.js             #     Call-to-action section
│   │   │   │   ├── HeroSkeleton.js    #     Hero loading skeleton
│   │   │   │   └── Reviews.js         #     User reviews/testimonials
│   │   │   ├── tools/                 # Tool implementation components
│   │   │   │   ├── AddAttachmentsTool.js
│   │   │   │   ├── AvifConverter.js
│   │   │   │   ├── BMICal.js
│   │   │   │   ├── BinaryDecoder.js
│   │   │   │   ├── BrailleDecoder.js
│   │   │   │   ├── CGPACalculator.js
│   │   │   │   ├── ColorConverter.jsx
│   │   │   │   ├── ColorPaletteExtractor.jsx
│   │   │   │   ├── CombineFilesToPDFTool.jsx
│   │   │   │   ├── CompressPDFTool.js
│   │   │   │   ├── CropPDF.js
│   │   │   │   ├── DiscountCalculator.jsx      # NEW
│   │   │   │   ├── DisposableEmailDetector.js  # NEW
│   │   │   │   ├── DomainAgeChecker.js
│   │   │   │   ├── DummyTextGenerator.js
│   │   │   │   ├── EMICalculator.js
│   │   │   │   ├── FakeInfoGenerator.js
│   │   │   │   ├── FancyTextGenerator.js
│   │   │   │   ├── FaviconGenerator.js
│   │   │   │   ├── GradientGenerator.jsx
│   │   │   │   ├── IPChecker.js
│   │   │   │   ├── ImageToPDF.js
│   │   │   │   ├── ImageToText.js
│   │   │   │   ├── MarkdownPreviewer.js
│   │   │   │   ├── MediaFormatConverter.jsx    # NEW
│   │   │   │   ├── MetadataEditor.jsx          # NEW
│   │   │   │   ├── MetadataViewer.jsx          # NEW
│   │   │   │   ├── MorseCodeDecoder.js
│   │   │   │   ├── NUpPDFTool.js
│   │   │   │   ├── NumbersToWords.js
│   │   │   │   ├── PDFReorderPages.js
│   │   │   │   ├── PDFSplitPage.js
│   │   │   │   ├── PdfToImage.js
│   │   │   │   ├── QRCodeGenerator.js
│   │   │   │   ├── RemoveDuplicateLines.js
│   │   │   │   ├── SSLChecker.jsx
│   │   │   │   ├── SvgConverter.js
│   │   │   │   ├── TextRepeater.js
│   │   │   │   ├── TimezoneClock.jsx
│   │   │   │   ├── TrekGlyphEncoderDecoder.js  # NEW
│   │   │   │   ├── TypingTest.jsx
│   │   │   │   ├── UniCGPACalculator.js        # NEW
│   │   │   │   ├── WebTechDetector.jsx         # NEW
│   │   │   │   ├── ZakatCalculator.js
│   │   │   │   ├── cgpaSubjectData.json
│   │   │   │   ├── savings-calculator/         # NEW (sub-folder)
│   │   │   │   └── vat-calculator/             # (sub-folder)
│   │   │   ├── AgeCal.js              #   Age Calculator component
│   │   │   ├── DaysTracker.js         #   Days Tracker component
│   │   │   ├── FAQCon.js              #   FAQ content component
│   │   │   ├── Footer.js              #   Site footer
│   │   │   ├── Header.js              #   Site header + navigation
│   │   │   ├── Hero.js                #   Homepage hero section
│   │   │   ├── HServices.js           #   Homepage services section
│   │   │   ├── ParentTools.js         #   Tool listing/grid component
│   │   │   ├── QRScanner.js           #   QR Scanner component
│   │   │   ├── RecentToolsHome.js     #   Recent tools on homepage
│   │   │   ├── ShortenerForm.js       #   Link shortener form
│   │   │   ├── ToolPageShell.jsx      #   Wrapper shell for tool pages
│   │   │   ├── ToolsCard.js           #   Individual tool card
│   │   │   ├── WifiQRGen.js           #   WiFi QR generator component
│   │   │   └── dynamicIcon.js         #   Dynamic Lucide icon resolver
│   │   ├── layout.js                  # Main layout (Header, Footer, Toaster)
│   │   └── page.js                    # Homepage
│   ├── error.js                       # Global error boundary
│   ├── global-error.js                # Root-level error boundary
│   ├── globals.css                    # Global styles & CSS variables
│   ├── layout.js                      # Root layout
│   ├── loading.js                     # Global loading UI
│   └── not-found.js                   # 404 page
│
├── components/
│   ├── FavoriteButton.jsx             # ⭐ Favorite toggle button component
│   ├── RecentToolsTracker.jsx         # 🕐 Passive recent-tool tracking component
│   └── ui/                            # shadcn/ui & custom primitives
│       ├── GlobalSearchModal.jsx      #   Command-palette search modal
│       ├── accordion.jsx
│       ├── button.jsx
│       ├── calendar.jsx
│       ├── card.jsx
│       ├── carousel.jsx
│       ├── command.jsx
│       ├── copy-button.jsx
│       ├── dialog.jsx
│       ├── form.jsx
│       ├── input.jsx
│       ├── label.jsx
│       ├── popover.jsx
│       ├── select.jsx
│       ├── slider.jsx
│       ├── sonner.jsx
│       ├── switch.jsx
│       └── textarea.jsx
│
├── hooks/
│   ├── useFavorites.js                # ⭐ Favorites state hook (localStorage, SSR-safe)
│   └── useRecentTools.js              # 🕐 Recent tools state hook (localStorage, SSR-safe)
│
├── lib/
│   ├── toolsData.json                 # Central tool registry (title, link, icon, category)
│   ├── useGlobalSearch.js             # Global search state/logic
│   └── utils.js                       # Shared utility functions (cn, etc.)
│
├── public/                            # Static assets
│   ├── pdf.worker.js                  # pdfjs-dist web worker
│   ├── wifi_qr_template.jpg
│   └── ...                            # Icons, images, SVGs
│
├── .env.example                       # Environment variable template
├── .gitignore
├── components.json                    # shadcn/ui config
├── eslint.config.mjs
├── jsconfig.json
├── LICENSE                            # MIT License
├── next.config.mjs                    # Next.js config (Turbopack, Webpack, image domains)
├── package.json
├── postcss.config.mjs
└── README.md
```

---

## 🤝 Contributing

ToolsTrek is open source and contributions are welcome!

1. **Fork** the repository
2. **Create a branch** for your feature or fix (`git checkout -b feature/my-tool`)
3. **Make your changes** with a clear, focused scope
4. **Test locally** — run `npm run dev` and verify everything works
5. **Open a pull request** with a short description of what changed and why

### Contribution Guidelines

- Keep changes consistent with the existing design system and component structure
- Prefer small, focused pull requests over large sweeping changes
- If adding a new tool: create the page route, add the component under `tools-compo/tools/`, and register it in `lib/toolsData.json`
- If fixing a bug: include reproduction steps in the PR description
- Be respectful and constructive in all discussions

---

## 📄 License

This project is licensed under the **MIT License** — see [LICENSE](./LICENSE) for details.
