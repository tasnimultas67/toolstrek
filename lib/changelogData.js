export const changelogData = [
  {
    version: "v2.22.0",
    date: "October 2026",
    isoDate: "2026-10-21",
    type: "minor",
    badge: "Latest Release",
    title: "Ten new tools: Image Watermark, Collage Maker + Image Editor + Image Compressor, Percentage Calculator + Text Diff Checker + Barcode Generator, Background Remover, PDF Unlocker + Audio Converter",
    summary:
      "ToolsTrek grows to 123 tools with ten everyday utilities that all run entirely in the browser. Image Watermark adds custom text or logo watermarks to images instantly with opacity, font size, color and position customization — 100% client-side, no uploads. Collage Maker combines multiple images into beautiful grids with customizable columns, spacing and backgrounds. Image Editor applies professional photo filters including grayscale, sepia, invert, brightness, contrast, saturation, opacity and blur. The Image Compressor shrinks JPG, PNG, WebP and AVIF files to an exact target size or quality level, batch-processes photo queues with no artificial batch or per-file size caps, previews every before/after pair and exports individually or as a ZIP. The Percentage Calculator covers five question types — X% of Y, what percent X is of Y, increase/decrease, add/subtract a percentage and reverse percentages — with the substituted formula and step-by-step working for every answer. The Text Diff Checker compares two texts by line, word or character, offers unified and split views, ignores case or whitespace on request, reports similarity statistics and exports a standard .diff patch. The Barcode Generator creates nine print-ready symbologies with check-digit repair, quiet-zone and contrast audits, ZXing scan verification, and PNG/SVG/JPEG/PDF label export. The Background Remover uses an AI portrait model or a precise colour key, then composites transparent, studio, gradient, blurred or custom backdrops with edge refinement, padding and shadows. The PDF Unlocker audits encryption, page counts and permission flags, then removes passwords with a lossless qpdf 12.2.0 engine or rebuilds protected pages as a compatibility fallback. The Audio Converter converts audio files between MP3, WAV and OGG formats with bitrate, sample rate and channel settings, trim, normalize and fade in/out — all 100% client-side, no uploads.",
    categories: ["New Tools", "Features", "Design", "Security"],
    highlights: [
      {
        title: "Image Watermark with custom text & position",
        link: "/tools/image-watermark",
        description:
          "Add text or logo watermarks with opacity, font size, color picker and five position options (top-left, top-right, bottom-right, bottom-left, center) — 100% client-side, images never leave your browser.",
        tag: "Added",
      },
      {
        title: "Collage Maker with grid layouts",
        link: "/tools/collage-maker",
        description:
          "Combine multiple images into beautiful collages with customizable columns (1–6), spacing and background colors. Drag and drop, select a layout and download as PNG.",
        tag: "Added",
      },
      {
        title: "Image Editor with professional filters",
        link: "/tools/image-editor",
        description:
          "Apply grayscale, sepia, invert, brightness, contrast, saturate, opacity and blur filters with adjustable intensity. 100% client-side processing with instant preview and download.",
        tag: "Added",
      },
      {
        title: "Image Compressor with exact target sizes",
        link: "/tools/image-compressor",
        description:
          "Compress large image queues in one batch, hit a target file size in KB or MB, tune quality and maximum dimensions, compare before/after previews and download everything as a ZIP.",
        tag: "Added",
      },
      {
        title: "Percentage Calculator with five modes",
        link: "/tools/percentage-calculator",
        description:
          "Solve X% of Y, what percent X is of Y, percentage change, markups/discounts and reverse percentages — each with the formula, step-by-step working and one-click copy.",
        tag: "Added",
      },
      {
        title: "Text Diff Checker with patch export",
        link: "/tools/text-diff",
        description:
          "Compare text by line, word or character in unified or split views, ignore case and whitespace, track similarity, and copy or download a standard .diff patch.",
        tag: "Added",
      },
      {
        title: "Barcode Generator with nine symbologies",
        link: "/tools/barcode-generator",
        description:
          "Generate barcodes in Code 128, EAN-13, EAN-8, UPC-A, Code 39, ITF-14, MSI and Codabar formats. Auto-repair GS1 check digits, audit quiet zones and contrast with real ZXing scan verification, and export PNG, SVG, JPEG or PDF labels and batch CSV/ZIP sheets.",
        tag: "Added",
      },
      {
        title: "Background Remover with AI + colour key",
        link: "/tools/background-remover",
        description:
          "Remove backgrounds with an AI portrait model (MODNet) or a precise colour key. Refine alpha edges with feather, contrast, edge shift and despill, then add transparent, solid, gradient, blurred or custom backdrops with padding, shadows and aspect-ratio presets. Export PNG, WebP or JPEG.",
        tag: "Added",
      },
      {
        title: "PDF Unlocker with qpdf + raster fallback",
        link: "/tools/pdf-unlocker",
        description:
          "Audit AES-256, AES-128 and RC4 encryption, inspect page counts and the permission matrix, then remove passwords with a lossless qpdf 12.2.0 engine or rebuild pages as a compatibility fallback. Optional linearization, metadata scrubbing and annotation flattening.",
        tag: "Added",
      },
      {
        title: "Audio Converter with MP3/WAV/OGG, trim, normalize and fade effects",
        link: "/tools/audio-converter",
        description:
          "Convert audio files between MP3, WAV and OGG formats with bitrate, sample rate and channel settings. Trim, normalize and add fade in/out — all in the browser.",
        tag: "Added",
      },
    ],
    changes: [
      {
        type: "Added",
        items: [
          "New tool: Image Watermark at /tools/image-watermark — a Media utility for adding custom text or logo watermarks to images instantly with opacity, font size, color and position customization — 100% client-side, no uploads.",
          "Watermark text input, font size slider, color picker, five position options (top-left, top-right, bottom-right, bottom-left, center) and real-time preview.",
          "Download the watermarked image as PNG, copy a share link, or copy the image to use elsewhere.",
          "New tool: Collage Maker at /tools/collage-maker — a Media utility for combining multiple images into beautiful grids with customizable columns, spacing and background colors.",
          "Drag-and-drop image selection, column selector (1–6), margin input, background color picker and one-click collage generation.",
          "Download the collage as PNG, copy a share link, or remove individual images.",
          "New tool: Image Editor at /tools/image-editor — a Media utility for applying professional photo filters including grayscale, sepia, invert, brightness, contrast, saturation, opacity and blur.",
          "Filter selector with eight options, intensity slider (0–100%), real-time preview and one-click download.",
          "All processing is 100% client-side — images never leave the browser.",
          "New tool: Image Compressor at /tools/image-compressor — a Media & Productivity utility that compresses JPG, PNG, WebP and AVIF images directly in the browser.",
          "Target-size compression in KB or MB, quality mode with a 5–100% slider, maximum width/height controls with aspect-ratio preservation, and optional JPEG, WebP or PNG output.",
          "Batch queue for large image sets with validated file types, per-file progress, friendly error messages, individual retry, before/after comparison previews and a summary of total space saved.",
          "Download compressed images individually or as one ZIP archive, with unique output filenames and configurable Deflate compression.",
          "Automatic EXIF/GPS metadata removal during re-encoding, with no image ever uploaded to a server.",
          "New tool: Percentage Calculator at /tools/percentage-calculator — a Calculator & Education utility with five modes: X% of Y, X is what percent of Y, percentage increase/decrease, add/subtract a percentage, and reverse percentage.",
          "Every percentage result includes the substituted formula and step-by-step arithmetic; results update instantly, accept commas, currency symbols and trailing percent signs, and can be copied to the clipboard.",
          "Percentage input validation handles division by zero, zero starting values and malformed numbers with clear, specific messages instead of generic errors.",
          "New tool: Text Diff Checker at /tools/text-diff — a Developer & Text utility for comparing two documents, code snippets or essays.",
          "Line, word and character diff modes with unified and split views, line numbers, addition/removal highlighting, unchanged-line counts and a similarity percentage.",
          "Ignore-case and ignore-whitespace comparison options, text swapping, one-click sample data, per-pane counters and clear/reset actions.",
          "Copy or download a standard unified .diff patch generated client-side, plus large-input guards, deferred diff computation and render caps to keep the page responsive.",
          "New tool: Barcode Generator at /tools/barcode-generator — a Developer & Design utility that creates print-ready barcodes in nine symbologies.",
          "Code 128, EAN-13, EAN-8, UPC-A, Code 39, ITF-14, MSI and Codabar formats, with GS1 check-digit repair, quiet-zone and contrast audits.",
          "Real ZXing scan verification, plus PNG, SVG, JPEG and PDF label export and batch CSV/ZIP label sheets.",
          "New tool: Background Remover at /tools/background-remover — a Media & Design utility that removes image backgrounds locally.",
          "AI portrait mode using a MODNet model running in the browser, plus a colour-key mode for products and screenshots.",
          "Alpha-edge refinement with feather, contrast, edge shift and despill, plus transparent, solid, gradient, blurred and custom backdrops with padding, shadows and aspect-ratio presets.",
          "Export as PNG, WebP or JPEG without uploading the image.",
          "New tool: PDF Unlocker at /tools/pdf-unlocker — a PDF & Security utility that audits and removes PDF passwords and permission flags.",
          "AES-256, AES-128 and RC4 encryption audit, page-count inspection and a full permission matrix.",
          "Lossless password removal with a qpdf 12.2.0 WebAssembly engine, with a raster page-rebuild fallback for maximum compatibility.",
          "Optional linearization, metadata scrubbing and annotation flattening.",
          "New tool: Audio Converter at /tools/audio-converter — a Media utility that converts audio files between MP3, WAV and OGG formats.",
          "Bitrate, sample rate and channel settings, plus trim, normalize and fade in/out effects — all 100% client-side, no uploads.",
          "Registered all ten tools in lib/toolsData.json, added dedicated route metadata and JSON-LD, sitemap entries, FAQ coverage where applicable, README documentation and this changelog entry.",
        ],
      },
      {
        type: "Improved",
        items: [
          "The Image Compressor retries failed Web Worker jobs on the main thread before reporting an error, so stricter browser policies do not block compression.",
          "The Image Compressor has no artificial batch-count or per-file size caps: add as many images as your browser can handle, with per-file errors if a device runs out of memory.",
          "Image batches now read dimensions one file at a time, use memory-aware concurrency for large photo queues, normalize empty or non-standard MIME types, and retry through a native canvas encoder before reporting a file-level error.",
          "Compression settings are validated before a batch starts, and already-optimized images are kept as-is instead of being inflated when no conversion or downscale is requested.",
          "The Text Diff Checker processes diffs through useDeferredValue with a 250,000-character per-side ceiling, a 3,000-row line cap and a 4,000-segment word/character cap.",
          "The Barcode Generator auto-repairs GS1 check digits and audits quiet zones and contrast before export.",
          "The Background Remover runs its AI model locally via Transformers.js and falls back to a colour key for products and screenshots.",
          "The PDF Unlocker falls back to a raster page rebuild when the lossless qpdf engine cannot start, so password removal still works without cross-origin isolation.",
        ],
      },
      {
        type: "Design",
        items: [
          "The Image Compressor uses a two-column workspace with a sticky settings rail, drag-and-drop queue cards, progress bars and expandable before/after previews.",
          "The Percentage Calculator pairs large numeric inputs with a gradient result card that keeps the answer, formula and working visible while typing.",
          "The Text Diff Checker uses a colour-coded diff surface with line-number gutters, roomier desktop typography, compact option switches and a responsive split view that stacks cleanly on phones.",
          "The Background Remover composites transparent, solid, gradient, blurred and custom backdrops with live edge refinement and aspect-ratio presets.",
          "The PDF Unlocker presents encryption, page count and permission details in a clear audit panel before removal.",
          "All ten new tools match the ToolsTrek design system in light and dark mode and stay responsive from 360 px phones to wide desktops.",
        ],
      },
      {
        type: "Security",
        items: [
          "Every new tool runs entirely in the browser — images, text, audio and PDFs are never uploaded, logged or tracked.",
          "The Background Remover's AI model and the PDF Unlocker's qpdf engine both run locally, so sensitive files never leave the device.",
          "The Audio Converter processes audio with the Web Audio API and lamejs for MP3 encoding, with no server round-trip.",
          "No accounts, cookies or third-party analytics power any of the new tools.",
        ],
      },
    ],
  },

  {
    version: "v2.21.0",
    date: "October 2026",
    isoDate: "2026-10-20",
    type: "minor",
    title: "Dog & Cat Age Calculator: pet years, life stages & birthdays",
    summary:
      "ToolsTrek's tool library gains its 113th utility: a Dog & Cat Age Calculator that turns a pet's birthday into a complete age report. Choose a dog or cat, pick an adult size class for dogs or a lifestyle for cats, and see the human-age equivalent from the size-aware veterinary chart, the classic 7× rule or your own custom multiplier. The report adds a life-stage guide with typical lifespan ranges and remaining years, a next-birthday countdown, milestone birthdays, an optional gotcha day for time together, an estimated-birthday helper when the exact date is unknown, and playful lifetime statistics from sleep hours to heartbeats and full moons. Everything is customisable — units, decimals, visible sections, an optional pet name — and shareable as a link, text summary, branded PNG card, CSV or JSON, all 100% in the browser.",
    categories: ["New Tools", "Features", "Design", "Security"],
    highlights: [
      {
        title: "Size-aware dog & cat ages",
        link: "/tools/dog-cat-age-calculator",
        description:
          "Modern conversion for four dog size classes and three cat lifestyles, plus the classic 7× shortcut and a custom multiplier from 0.5 to 15 — switch methods any time and compare instantly.",
        tag: "Added",
      },
      {
        title: "Life stages, lifespan & birthdays",
        link: "/tools/dog-cat-age-calculator",
        description:
          "A stage-by-stage guide highlights where your pet is now and what comes next, a lifespan ring tracks life lived, and the next-birthday countdown plus milestone table covers every pet birthday.",
        tag: "Added",
      },
      {
        title: "A report worth sharing",
        link: "/tools/dog-cat-age-calculator",
        description:
          "An optional name and gotcha day personalise the report, which exports as a text summary, share link, branded PNG card, CSV or JSON — generated entirely in your browser.",
        tag: "Added",
      },
    ],
    changes: [
      {
        type: "Added",
        items: [
          "New tool: Dog & Cat Age Calculator at /tools/dog-cat-age-calculator — a Fun category calculator that converts a pet's real age into human years and builds a complete age report.",
          "Size-aware dog conversions for small (up to 10 kg), medium (10–25 kg), large (25–45 kg) and giant (45+ kg) breeds using the modern 15 + 9 + 4–7-year chart, plus cat conversions for indoor, indoor/outdoor and outdoor lifestyles.",
          "Three conversion methods — size-aware chart (recommended), the classic 7× rule and a custom multiplier from 0.5 to 15 — with the active method named throughout the report and exports.",
          "Automatic size suggestion from an optional weight in kilograms or pounds, with a one-click apply for owners who are unsure which class fits their dog.",
          "Life-stage guide covering Puppy/Kitten, Junior, Adult, Mature, Senior and Geriatric stages, with a progress bar for the current stage and a note on when the next stage begins.",
          "Typical lifespan ranges by size and lifestyle, an optional custom lifespan override, a life-lived percentage ring and a remaining-years estimate.",
          "Next-birthday countdown and a milestone table for the 1st, 2nd, 3rd, 5th, 7th, 10th, 12th, 15th and 20th birthdays, each with its human-age equivalent and reached or upcoming status.",
          "Optional gotcha day for time together, an estimated-birthday helper that works backwards from an age in years and months, and leap-day handling that celebrates on February 28 in non-leap years.",
          "Fun lifetime statistics — days and weeks alive, sleep hours, heartbeats, breaths and full moons — plus curated facts and a same-age dog-vs-cat comparison across every size class.",
          "Fully customisable report: metric or imperial units, 0–2 decimal places, three section toggles and share links that restore every setting.",
          "Share and export options: copy a text summary, copy a share link, download a branded PNG report card, or export the report as CSV or JSON — all generated client-side.",
          "Registered the tool across the library with a dedicated FAQ section, sitemap entry, toolsData.json registration for the All Tools grid and global search, and README documentation.",
        ],
      },
      {
        type: "Improved",
        items: [
          "Built on a shared data + engine module: one pet catalogue (size classes, lifestyle lifespan ranges, stage thresholds and facts) and one pure calculation engine drive the hero, stage guide, milestones, comparison, statistics, exports and JSON-LD.",
          "All date maths runs in UTC with clamped anniversaries, so timezones never shift a birthday and February 29 pets get consistent ages, next birthdays and milestone dates.",
          "Every export path has clipboard fallbacks and friendly error toasts, so a blocked clipboard, unavailable canvas or disabled download never fails silently.",
          "Tables sit inside their own scroll containers and the page grid uses min-width guards, keeping the layout intact from 360 px phones to wide desktops.",
        ],
      },
      {
        type: "Design",
        items: [
          "A warm amber-to-rose hero pairs the human-age headline with a lifespan ring, birthday and together chips and six lifetime-stat tiles in one glance.",
          "Paw-print watermarks, rounded cards and amber accents give the tool its own friendly identity while matching the ToolsTrek design system in light and dark mode.",
          "Fully responsive from small phones to desktops — the settings rail stacks above the report, size classes stay in a two-column grid, and wide comparison tables scroll horizontally.",
        ],
      },
      {
        type: "Security",
        items: [
          "Pet names, birthdays and settings are stored only in the visitor's own browser (localStorage) and in share links they create themselves — nothing is uploaded, logged or tracked.",
          "No accounts, cookies or third-party analytics power the calculator; all calculations, statistics and exports run 100% client-side.",
        ],
      },
    ],
  },
  {
    version: "v2.20.0",
    date: "October 2026",
    isoDate: "2026-10-19",
    type: "minor",
    title: "Age on Other Planets: your cosmic birthday report",
    summary:
      "ToolsTrek's tool library gains its 112th utility: an Age on Other Planets calculator that turns one birth date into a full report of your life across the solar system. Enter the day you were born — or try the Apollo 11 landing, Yuri Gagarin's flight or a leap-day birthday — and instantly see your exact age in Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune and Pluto years, your next planetary birthday on every world, and your 10th, 50th, 100th or custom milestone birthdays with the Earth dates they fall on. An optional weight and jump module uses real surface gravity, an Earth-stats panel counts your days, hours, heartbeats, breaths, full moons and sleep, and the whole report is customisable (units, decimal precision, visible planets) and shareable as a link, text summary, branded PNG card, CSV or JSON. It all runs 100% in the browser — your birth date never leaves your device.",
    categories: ["New Tools", "Features", "Design", "Security"],
    highlights: [
      {
        title: "Your exact age on nine worlds",
        link: "/tools/age-on-other-planets",
        description:
          "Day-accurate planetary ages for Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune and Pluto, based on mean sidereal orbital periods from NASA planetary fact sheets.",
        tag: "Added",
      },
      {
        title: "Planetary birthdays & milestones",
        link: "/tools/age-on-other-planets",
        description:
          "Every planet card shows a live progress bar to your next planetary birthday with the exact Earth date and a day countdown, while the Milestone planner tracks your 10th, 50th, 100th or any custom birthday on every world.",
        tag: "Added",
      },
      {
        title: "Weight, jump & a shareable report",
        link: "/tools/age-on-other-planets",
        description:
          "An optional weight & jump module applies real surface gravity, and the finished report exports as a text summary, share link, branded PNG card, CSV or JSON — all generated in your browser.",
        tag: "Added",
      },
    ],
    changes: [
      {
        type: "Added",
        items: [
          "New tool: Age on Other Planets at /tools/age-on-other-planets — a Fun category calculator that turns one birth date into a complete cosmic birthday report.",
          "Day-accurate ages on Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune and Pluto, with every world individually toggleable (Pluto included as a dwarf planet).",
          "Planetary birthday tracker: a live progress bar toward your next solar return on each planet, the exact Earth date it falls on, and a countdown in days.",
          "Milestone planner for your 10th, 25th, 50th, 100th, 500th or a custom planetary birthday, showing the Earth date, the share of the journey already completed and whether the milestone has passed.",
          "Local solar days lived on every world — including Martian sols — plus the distance travelled around the Sun on each planetary orbit.",
          "Optional weight & jump module: enter your weight and a typical Earth jump to see both scaled across real surface gravities from Pluto (0.063 g) to Jupiter (2.53 g).",
          "Earth statistics panel counting your days, hours, minutes, seconds, orbits, and approximate heartbeats, breaths, full moons and sleep.",
          "Fully customisable report: metric or imperial units, 0–3 decimal places, per-planet visibility, fun-fact toggles and an optional name that personalises the shared report card.",
          "Share and export options: copy a text summary, copy a share link that restores your dates and settings, download a branded PNG report card, or export the full comparison as CSV or JSON.",
          "Planet “orbs” — pure-CSS spheres with a ring for Saturn and cloud bands for Jupiter — so every world is recognisable at a glance in the cards, table and milestone planner.",
          "Registered the tool across the library with a dedicated FAQ section, sitemap entry, toolsData.json registration for the All Tools grid and global search, and README documentation.",
        ],
      },
      {
        type: "Improved",
        items: [
          "Updated the Fun category description to “Space, zodiac & playful tools” to reflect the roster's growth beyond astrology.",
          "Built the tool on a shared data + engine module — one planetary catalogue (orbital periods, solar days, gravity, orbital distances, fun facts) and one pure calculation engine now drive the cards, comparison table, milestone planner, statistics, exports and JSON-LD.",
          "Hardened date handling: all maths runs in UTC so a birthday never shifts a day by timezone, leap-day birthdays work with no special casing, and far-future milestone dates degrade gracefully instead of breaking the page.",
          "Added clipboard fallbacks and friendly error toasts on every export path, so a blocked clipboard or an unavailable canvas never fails silently.",
        ],
      },
      {
        type: "Design",
        items: [
          "A dark cosmic hero panel summarises your Earth age, orbit count, next Earth birthday, oldest and youngest worlds, and nine life-statistics tiles in a single glance.",
          "Fully responsive from 360 px phones to wide desktops — planet cards reflow from three columns to one, the settings rail stacks below the report, and the comparison table scrolls horizontally on small screens.",
        ],
      },
      {
        type: "Security",
        items: [
          "Birth dates, names and settings are stored only in the visitor's own browser (localStorage) and in share links they create themselves — nothing is uploaded, logged or tracked.",
          "No accounts, no cookies and no third-party analytics are used to power the Age on Other Planets calculator; all calculations and exports run 100% client-side.",
        ],
      },
    ],
  },
  {
    version: "v2.19.0",
    date: "October 2026",
    isoDate: "2026-10-19",
    type: "minor",
    title: "Chart Studio: interactive Recharts previews across all six generators",
    summary:
      "Every chart generator in the Chart Studio — pie & donut, bar & column, line & area, radar & spider, funnel and polar & rose — now renders through a professional charting engine instead of a hand-drawn SVG. The six tools share one responsive chart layer built on Recharts 3 and shadcn's chart primitives, so previews gain hover tooltips with per-series values and percentages, crisp axis ticks and gridlines, a redesigned legend that adapts to any side of the chart, and theme-aware colours. Exports are rendered from the same engine at up to 4× resolution, with the title, subtitle and legend baked in, so the downloaded PNG or SVG matches what is on screen. Existing data editing, CSV/Excel import, palettes, labels, themes and every export format are unchanged — and everything still runs 100% in the browser.",
    categories: ["Improvements", "Design", "Developer"],
    highlights: [
      {
        title: "A sharper, interactive preview in every chart tool",
        link: "/tools/bar-chart-generator",
        description:
          "All six generators now render with Recharts and shadcn chart primitives, giving each preview professional spacing, readable axes, crisp gridlines and theme-aware colours at every screen size.",
        tag: "Design",
      },
      {
        title: "Tooltips that explain the data",
        link: "/tools/line-chart-generator",
        description:
          "Hover a bar, slice, line, radar point or funnel stage to see the category plus every series' formatted value — pie, polar and funnel tooltips also show each item's share of the total.",
        tag: "Improved",
      },
      {
        title: "Exports that match the preview",
        link: "/tools/pie-chart-generator",
        description:
          "PNG and SVG exports are rebuilt from the live chart surface with the title, subtitle, background and legend included, then rasterised at the exact 1×–4× scale you choose.",
        tag: "Improved",
      },
    ],
    changes: [
      {
        type: "Improved",
        items: [
          "Replaced the hand-built SVG preview renderers in the pie, bar, line, radar, funnel and polar generators with Recharts 3 composables rendered inside shadcn ChartContainer, ChartTooltip and ChartTooltipContent primitives.",
          "Added a shared chart layer under app/(main)/tools-compo/tools/_shared/charts — one ChartPreview shell, six chart views, a shared theme/geometry module and a shared export module — so every generator follows the same layout, typography, tooltips, legends and export rules.",
          "Hover tooltips now show the category or axis label plus each series' formatted value, with percentage detail for pie slices, polar wedges and funnel stages.",
          "Rebuilt the legend as a responsive list that supports top, right, bottom and left placement, optional values, hidden series and a mobile bottom fallback — without mounting a second copy of the chart.",
          "Chart colours, gridlines and axis text now follow the selected palette and the app's light/dark theme automatically, while each tool's own canvas background, text and grid colour settings keep working.",
          "Reworked the export pipeline to clone the live Recharts surface into a standalone SVG with title, subtitle, background and legend, then reuse that document for SVG download, clipboard copy and PNG rasterisation.",
          "PNG exports honour the selected 1×–4× scale, with animations disabled so the exported frame is deterministic and matches the on-screen chart.",
          "Added Recharts 3 and a shadcn chart primitive (components/ui/chart.jsx) to the UI stack, and documented the shared chart architecture in the README.",
          "Tooltip and legend values stay consistent with every label format, decimal count, prefix/suffix, thousands separator and compact-notation setting.",
        ],
      },
      {
        type: "Fixed",
        items: [
          "Fixed the Recharts “width(0) and height(0)” console warning on charts with a left or right legend: the preview previously mounted a second, CSS-hidden canvas that measured 0 × 0 and logged a warning on every render. Side legends now use a single chart instance.",
          "Fixed duplicated chart work when a side legend was selected — only one Recharts tree is mounted now, so those layouts no longer render the entire chart twice.",
          "Fixed legend and tooltip colour indicators so they always use the series' resolved colour in both light and dark themes.",
        ],
      },
      {
        type: "Security",
        items: [
          "All chart rendering, tooltip calculation and image export still run 100% in the browser; no chart data, labels or values are uploaded.",
          "No accounts, no cookies and no third-party tracking are used to power the Chart Studio.",
        ],
      },
    ],
  },
  {
    version: "v2.18.0",
    date: "October 2026",
    isoDate: "2026-10-19",
    type: "minor",
    title: "Visited Countries Map: Track, Style & Share Your Travel Map",
    summary:
      "ToolsTrek's tool library gains its 111th utility: a genuinely complete Visited Countries Map. Mark the countries you have been to on an interactive flat world map, watch your running total, percentage of the world and continent breakdown update instantly, then export a branded, shareable travel card. The map is built around a cropped, correctly proportioned projection so the entire world is always visible in a single view — no cut-off edges and no stretched, 3D-looking globe — and it deliberately excludes Antarctica, because Antarctica is not a country. Everything runs 100% in the browser: your countries, colours, name and profile photo are saved to your own device and never leave it.",
    categories: ["New Tools", "Features", "Security"],
    highlights: [
      {
        title: "Mark every country you've visited",
        link: "/tools/country-visited-map",
        description:
          "A search-first country picker with a shuffled browsing order lets you select countries in any order, while a live count, world percentage and continent breakdown keep score of your travels.",
        tag: "Added",
      },
      {
        title: "Share or export a finished travel card",
        link: "/tools/country-visited-map",
        description:
          "Export a branded PNG photo card (with your name and an optional cropped profile photo), a plain map PNG, JSON/CSV data, or an embed snippet — and share a link that restores your map for anyone who opens it.",
        tag: "Added",
      },
      {
        title: "Never lose your progress",
        link: "/tools/country-visited-map",
        description:
          "Visited countries, custom colours, your name and profile photo are persisted to localStorage after every change, so returning visits restore your map exactly as you left it. A one-click Reset clears everything.",
        tag: "Added",
      },
      {
        title: "A map that always fits the frame",
        link: "/tools/country-visited-map",
        description:
          "The projection is cropped to the inhabited latitudes and given the matching aspect ratio, so the whole world renders flat and straight with hairline borders — never cut off and never stretched.",
        tag: "Design",
      },
    ],
    changes: [
      {
        type: "Added",
        items: [
          "New Visited Countries Map tool at /tools/country-visited-map: an interactive flat world map covering 194 sovereign countries across six inhabited continents, with Antarctica excluded because it is not a country.",
          "Country picker modal: a search field first, then every country chip in a freshly shuffled order, with a per-chip select/deselect toggle on repeated clicks plus Shuffle, Select all, Clear all and a live selected count.",
          "Live statistics: countries visited, percentage of the world explored (of 194) and a continent breakdown that read, for example, “6 of 6 continents”.",
          "Map controls in the top-right corner: zoom in, zoom out and fit-to-view, plus a fullscreen mode with its own country search and a bottom statistics bar. Deliberately no scroll-wheel zoom, so the page never traps your scroll.",
          "Complete Customize panel: one-click colour themes, individual visited/unvisited/border/ocean colours, border width, unvisited opacity, country-name labels, graticule grid lines, percentage badge, legend, and “highlight visited” emphasis — all previewed live.",
          "Profile photo with a circular crop editor: drag and drop or browse for an image, then drag to reposition and zoom to choose exactly how much appears inside the circle before saving. The photo is downscaled to a compact local copy and shown both in the toolbar and on the exported card.",
          "Export menu with four formats and an embed snippet: branded photo card PNG, map-only PNG, portable JSON backup, spreadsheet-ready CSV list, and HTML embed code.",
          "Share menu with a copy-link option (your selections are encoded in the URL) plus one-click sharing to X, Facebook, LinkedIn, WhatsApp and email.",
          "A “Reset” action beside Customize that clears visited countries, settings, the profile photo and the saved URL in a single confirmed step.",
        ],
      },
      {
        type: "Improved",
        items: [
          "Persisted the entire tool state to localStorage — visited countries and settings separately, with data saved after each change — and made saved data take priority over a ?visited= URL parameter so a returning visit never gets clobbered by an old link.",
          "Professional export filenames in the pattern visited-countries[-<your-name>]-map-<website>.<ext>, so a card exported from ToolsTrek with the name “Alex Carter” downloads as visited-countries-alex-carter-map-toolstrek.png.",
          "Registered the tool in the global tools catalog (toolsData.json) so it appears in the All Tools grid, category filters and global search, and added it to the dynamic sitemap with a monthly change frequency and high priority.",
          "Added a dedicated Visited Countries Map FAQ section covering country totals, the percentage calculation, saving and sharing, export formats, the profile photo, customisation and privacy.",
          "Refreshed the documented tool count to 111 across the README and FAQ, and grew the Travel category to three tools.",
        ],
      },
      {
        type: "Design",
        items: [
          "Reworked the map projection so the entire world is visible in one view: the projection is cropped to the inhabited latitude band and the frame's aspect ratio is matched exactly to the viewBox, eliminating the polar band, the letterboxing and any cut-off on the right.",
          "Hairline country borders and a flat, straight (non-3D) world view that defaults to blue, closely matching the familiar visited-countries poster aesthetic.",
          "Toolbar arranged as profile photo and name first, then a compact Search button, then Customize, Reset, Export and Share — each control stretching to fill the row on desktop and reflowing into a tidy two-column grid on small screens.",
          "Fully responsive from 360 px phones to wide desktops with dark-mode support and full ARIA labelling throughout (dialogs, menus, sliders and map controls).",
        ],
      },
      {
        type: "Security",
        items: [
          "Every part of the tool — the map, the statistics, the photo crop editor, the exports and the persistence — runs 100% client-side. No visited country, setting, name or photo is ever uploaded, stored on a server or tracked.",
          "No accounts, no cookies and no third-party analytics are used to power the Visited Countries Map.",
        ],
      },
    ],
  },
  {
    version: "v2.17.2",
    date: "October 2026",
    isoDate: "2026-10-19",
    type: "patch",
    title: "Production Fix: Every Server-Side Tool Restored",
    summary:
      "A build configuration had been stripping the Node.js runtime out of the deployment bundle for ToolsTrek's server-side API routes. On the deployed site that made every server-backed tool — SSL Certificate Checker, IP Checker, Domain Age Checker, Disposable Email Detector, Website Technology Detector, Social Preview and the capture endpoints behind Full Page Screenshot and Responsive Viewport — fail with a generic error page, even though the identical code worked perfectly on a local machine. Pre-rendered pages were unaffected, which is why the outage was easy to overlook. The offending rule is gone, and this release also hardens every affected route and tool so a slow or failing upstream service now produces a clear, friendly message instead of a blank failure.",
    categories: ["Fixes", "Improvements"],
    highlights: [
      {
        title: "Every server-side tool works again",
        link: "/tools/ssl-checker",
        description:
          "The build no longer excludes node_modules from each API route's deployment bundle, so the server-side tools stop crashing on startup and respond normally in production.",
        tag: "Fixes",
      },
      {
        title: "Graceful fallback for blocking sites",
        link: "/tools/responsive-viewport",
        description:
          "When a site refuses to be embedded in an iframe, the Responsive Viewport Tester can now render a real server-side screenshot at your selected viewport instead of showing only an error.",
        tag: "Fixes",
      },
    ],
    changes: [
      {
        type: "Fixed",
        items: [
          "Removed the outputFileTracingExcludes rule in next.config.mjs that stripped node_modules from every Route Handler's serverless trace. The deployed functions were missing the compiled Next.js runtime they import on boot, so all server-side API routes crashed while pre-rendered pages kept working.",
          "Fixed the SSL Certificate Checker discarding every Subject Alternative Name — the DNS: and IP Address: prefixes are now trimmed before the label is removed, so multi-domain certificates list all of their names again.",
          "Fixed the IP Checker depending on the removed request.ip property; the caller's address is now read from x-vercel-forwarded-for / x-forwarded-for headers.",
          "Fixed the Domain Age Checker failing whenever the primary RDAP service rate-limits a lookup — it now falls back to a second RDAP registry and then to WHOIS.",
          "Fixed a tracing regression where the disposable-domain data file was located with a dynamic path search, which caused the entire project to be traced into the email checker's function bundle.",
          "Server-backed tools now show a friendly, actionable message instead of the cryptic “Unexpected token '<', \"<!DOCTYPE\"… is not valid JSON” error that appeared whenever the platform returned an HTML error page.",
        ],
      },
      {
        type: "Added",
        items: [
          "New shared client helper lib/apiClient.js (apiFetch) used by every server-backed tool: it parses JSON safely even when an HTML error page is returned, applies a request timeout, preserves user-initiated cancellations and turns raw failures into readable copy.",
          "Responsive Viewport Tester: a “Render as screenshot” fallback for pages that block embedding via X-Frame-Options or CSP frame-ancestors, including loading, error and re-render states.",
        ],
      },
      {
        type: "Improved",
        items: [
          "Route Handlers now pin runtime = \"nodejs\" and declare maxDuration, and apply their own upstream timeouts so a slow third-party API returns a clean JSON timeout response rather than a platform error page.",
          "The IP Checker queries four geolocation providers in parallel and uses the first successful answer, making it resilient to any single provider being down or rate-limited.",
          "Domain Age, Technology Detector and Screenshot endpoints were retuned so their internal timeouts sit comfortably below the platform's execution limit.",
        ],
      },
    ],
  },
  {
    version: "v2.17.1",
    date: "October 2026",
    isoDate: "2026-10-19",
    type: "patch",
    title: "Funnel Chart Generator: crisp, readable chart labels",
    summary:
      "Labels drawn inside a funnel band are now guaranteed to be readable. A funnel band is a gradient, but the old code judged contrast from the base colour alone and returned white for every stage — including light amber, emerald and cyan — while also painting a thick halo in the same colour over the glyphs, which smeared the text into a blur. Labels now pick the highest-contrast ink across the whole gradient, and only fall back to a hairline halo in the opposite colour when a band genuinely cannot reach WCAG AA.",
    categories: ["Improved", "Design"],
    highlights: [
      {
        title: "Readable labels on every palette",
        link: "/tools/funnel-chart-generator",
        description:
          "Inside labels now choose white or near-black by real WCAG contrast measured across the entire band gradient, so light amber, emerald and cyan stages finally get dark text instead of unreadable white.",
        tag: "Design",
      },
    ],
    changes: [
      {
        type: "Fixed",
        items: [
          "Funnel labels are no longer smeared by a thick 3px halo painted in the same colour as the text — the halo is now an optional 1.5px hairline in the opposite ink.",
          "Label colour is chosen by worst-case WCAG contrast across both ends of the band gradient instead of a fixed luminance threshold applied to the base colour only.",
          "The highlighted-stage outline is now visible on light bands instead of disappearing into them.",
        ],
      },
      {
        type: "Improved",
        items: [
          "Every halo-free funnel label now clears the WCAG AA 4.5:1 threshold across all ten curated palettes.",
          "Chart labels use the paint-order attribute (matching the Polar Chart Generator) for consistent cross-browser rendering.",
          "Added contrastRatio, bestTextColor and labelInkFor helpers to the funnel chart engine.",
        ],
      },
    ],
  },
  {
    version: "v2.17.0",
    date: "October 2026",
    isoDate: "2026-10-18",
    type: "minor",
    title: "CSV & Excel import across the whole Chart Studio",
    summary:
      "Every chart generator — pie, bar, line, radar, funnel and polar — can now read your data straight from a CSV, TSV or Excel (.xlsx) file, or from pasted text. Drop a file anywhere in the Data tab and the tool detects the delimiter and header row, then walks you through a mapping step with a live preview: single-series charts map one category and one value column, while bar, line and radar charts map a category column plus any number of numeric series columns. The Polar Chart Generator also gains a follow-the-cursor hover tooltip and linked legend/table highlighting. Everything is parsed privately in the browser.",
    categories: ["Improved", "Design", "Developer"],
    highlights: [
      {
        title: "Import CSV, TSV and Excel data",
        link: "/tools/bar-chart-generator",
        description:
          "Drag and drop a .csv, .tsv or .xlsx file (or paste text) into any chart generator, auto-detect the header and columns, map them with a live preview, and import up to 24 categories — all processed privately in the browser.",
        tag: "Design",
      },
      {
        title: "Multi-series import for bar, line & radar",
        link: "/tools/line-chart-generator",
        description:
          "The first column becomes the categories and every numeric column you tick becomes a series, so an entire multi-series spreadsheet loads in a single step.",
        tag: "Developer",
      },
    ],
    changes: [
      {
        type: "Added",
        items: [
          "Drag-and-drop CSV, TSV and Excel (.xlsx) import in the pie, bar, line, radar, funnel and polar chart generators, with a click-to-browse fallback and a paste-your-data option.",
          "Automatic delimiter detection for comma, tab, semicolon and pipe separated files, plus quoted-field, escaped-quote and BOM handling.",
          "Dependency-free Excel parsing that reads .xlsx workbooks straight from their ZIP container in the browser — no data leaves the device.",
          "Smart header detection and column guessing, with a mapping step, a live preview table and per-column numeric hints.",
          "Multi-series mapping: pick a category column and any number of numeric value columns (up to eight) to build every series at once.",
          "Clear, friendly import errors for empty files, header-only files, missing numeric columns and unsupported legacy .xls workbooks.",
          "A follow-the-cursor hover tooltip in the Polar Chart Generator showing each wedge's category, value and percentage of total, plus linked legend and data-table highlighting.",
          "Proportional mini-bars in the polar category table so each row's share of the total is visible at a glance.",
        ],
      },
      {
        type: "Improved",
        items: [
          "The import logic now lives in one shared, well-tested module used by all six chart tools, so behaviour and messages stay consistent.",
          "Reworked polar wedge hover styling to a state-driven highlight; hover highlights are stripped from SVG and PNG exports.",
          "Added an import FAQ to each chart tool's on-page accordion and to the site-wide FAQ.",
        ],
      },
    ],
  },
  {
    version: "v2.16.0",
    date: "October 2026",
    isoDate: "2026-10-18",
    type: "minor",
    title: "Polar Chart Generator: Polar & Rose Chart Studio",
    summary:
      "Introducing the Polar Chart Generator — the sixth member of the Chart Studio family. Turn any list of categories into a polished polar area (Nightingale rose) or radial bar chart. Enter your data, choose the area-accurate square-root scale or a linear radius, add an optional centre hole with a live total, tune ring levels, rotation, gaps, corner radius, fills, labels and legends, then export a crisp high-resolution PNG or scalable SVG — all 100% in your browser.",
    categories: ["New Tools", "Design", "Developer"],
    highlights: [
      {
        title: "Polar Chart Generator & Rose Chart Studio",
        link: "/tools/polar-chart-generator",
        description:
          "Free online polar area, rose and radial bar chart maker with live SVG preview, area-accurate square-root scaling, an optional centre hole, adjustable rings and rotation, custom labels and legends, and one-click PNG/SVG export.",
        tag: "Design",
      },
    ],
    changes: [
      {
        type: "Added",
        items: [
          "Interactive polar chart generator with a live SVG preview that updates as you type.",
          "Two chart shapes — polar area (Nightingale rose) and radial bars — sharing identical geometry.",
          "Area-accurate square-root scaling or a direct linear radius, with an honest default.",
          "Optional centre hole with an adjustable inner radius and a live total shown in the middle.",
          "Adjustable number of concentric ring levels, drawn as dashed guides with a solid outer ring.",
          "Three ring-scale modes — Auto fit (nice rounded values), fixed 0–100 and fully Custom min/max.",
          "Rotatable start angle (0–355°) and clockwise or counter-clockwise category direction.",
          "Adjustable slice gap, plus rounded radial bar caps driven by a corner-radius slider.",
          "Editable category table with live percentages and per-category colour pickers and visibility toggles.",
          "Ten designer-curated colour palettes plus native per-category colour pickers for full control.",
          "Optional radial gradient fills, adjustable fill opacity, wedge outlines and a drop shadow.",
          "Value labels in value, percent or combined formats, placed inside or outside the wedge, with 0–4 decimals.",
          "Custom value prefixes and suffixes, thousands separators and compact notation (1.2K, 3.4M, 5.6B).",
          "Toggleable grid rings, category spokes, category labels and radial tick values with contrast halos.",
          "Customisable legend on the top, right, bottom or left, with optional per-category values.",
          "Eight ready-made sample datasets (website traffic, wind rose, sales by region, energy mix and more).",
          "Cycle-through category sorting (original, highest first, lowest first) for instant ranking.",
          "Light, dark and transparent canvas themes with editable background, text, gridline and outer-ring colours.",
          "Adjustable export canvas width and height for slide, print and social aspect ratios.",
          "High-resolution PNG export (1× to 4×), scalable SVG download, and one-click copy of the SVG markup.",
          "Data export as CSV (with percentages and totals) and JSON for reuse in spreadsheets and other tools.",
          "Friendly, non-blocking validation banners when there are too few categories or all values are zero.",
          "A resilient clipboard helper with a fallback path, and toast-based error recovery on every export.",
          "Interactive FAQ accordion and an educational guide on designing honest, readable rose charts.",
          "Full dark mode support and a fully responsive mobile-to-desktop studio layout.",
        ],
      },
      {
        type: "Improved",
        items: [
          "Registered the Polar Chart Generator in the global tools catalog (toolsData.json) so it appears in the All Tools grid, category filters and global search.",
          "Added the /tools/polar-chart-generator route to the dynamic sitemap with a monthly change frequency and high priority.",
          "Added a Polar & Rose Chart Generator FAQ section covering polar vs radial charts, area-accurate scaling, ring maths and design best practices.",
          "Grew the Chart Studio family to six generators and refreshed the documented tool count to 110 across the README and FAQ.",
          "Shipped an SEO-optimised tool page with canonical URL, OpenGraph, Twitter card, WebApplication and FAQPage structured data.",
        ],
      },
      {
        type: "Security",
        items: [
          "Every calculation and the chart rendering run 100% client-side using SVG and the HTML canvas — your data never leaves your browser.",
          "No accounts, no cookies and no third-party tracking are used to power the Polar Chart Generator.",
        ],
      },
    ],
  },
  {
    version: "v2.15.2",
    date: "October 2026",
    isoDate: "2026-10-18",
    type: "patch",
    title: "Engineering Overhaul: ESLint 9 Migration, E2E Test Suite & Reliability Fixes",
    summary:
      "A quality-focused release with no new tools but a markedly sturdier foundation. We migrated the repository to npm only, replaced the legacy ESLint compatibility shim with Next.js 16's native flat config, and cleared every outstanding lint finding — 256 of them across 85 files — through real refactors rather than rule relaxations. A new Playwright end-to-end smoke suite now builds and boots the app and asserts that the highest-risk tool routes render without a single runtime or console error — which immediately caught a genuine regression: dark mode was no longer surviving a page reload. We also upgraded Tailwind CSS to 4.3.3, clearing a Node 26 deprecation warning, and fixed several latent bugs uncovered along the way.",
    categories: ["Improvements", "Fixes"],
    highlights: [
      {
        title: "Bra Size Calculator — Unit Conversion Fix",
        link: "/tools/bra-size-calculator",
        description:
          "Unit conversion no longer runs on first mount, so the calculator opens with exactly the values you entered instead of a silently converted result.",
        tag: "Fixes",
      },
      {
        title: "Pomodoro Timer — Reliable Timing",
        link: "/tools/pomodoro-timer",
        description:
          "Fixed a stale-closure bug that could desynchronise the countdown, and moved internal navigation to next/link for instant client-side routing.",
        tag: "Fixes",
      },
    ],
    changes: [
      {
        type: "Improved",
        items: [
          "Migrated the project to npm only: removed pnpm-lock.yaml, pinned the package manager via the packageManager field, and regenerated package-lock.json.",
          "Replaced the legacy FlatCompat ESLint setup with Next.js 16's native flat config (eslint-config-next/core-web-vitals) and simplified the scripts to eslint . plus a new lint:fix.",
          "Resolved all 256 outstanding ESLint findings across 85 files with real code refactors — no rules were relaxed or switched off.",
          "Hardened client-only state reads (theme, favourites, recent tools and tool histories) behind useSyncExternalStore so they hydrate without mismatch warnings.",
          "Added a Playwright end-to-end smoke suite (npm run test:e2e) that builds and boots the production app, then verifies 21 high-risk routes — including the changelog page itself — render with zero runtime or console errors, plus key interactions (dark-mode persistence, Ctrl + K global search, code-formatter prefill and theme-aware toast rendering).",
          "Upgraded Tailwind CSS from 4.2.2 to 4.3.3, which adopts Node's modern registerHooks() API and clears a module.register() deprecation warning on Node 26.",
          "Documented the end-to-end suite in the README with a dedicated Testing section, refreshed prerequisites (Node.js 20.9+) and expanded the tech-stack table.",
          "Removed the now-unused next-themes dependency after rewiring the Sonner toaster to the app's own theme store.",
          "Changelog cards now preview each release with a two-line summary and reveal the full notes when the card is expanded.",
        ],
      },
      {
        type: "Fixed",
        items: [
          "Fixed the dark-mode preference being lost on every page reload — the persisted theme is now read directly from localStorage and is no longer overwritten by the server-rendered default during hydration.",
          "Fixed the Bra Size Calculator running a unit conversion on first mount instead of only when the user switches units.",
          "Fixed a stale-closure and countdown-accuracy bug in the Pomodoro Timer and replaced an internal anchor tag with next/link.",
          "Fixed the Monitor Hz Test restarting from a stale state reference.",
          "Fixed an Embla carousel cleanup leak by adding the missing reInit listener teardown.",
          "Fixed a lucide icon import rename (Image to ImageIcon) so the metadata viewer and editor keep rendering their toolbar icons.",
          "Fixed toast notifications always rendering with a light theme — the Sonner toaster now follows the app's dark/light toggle instead of a hard-coded light default.",
        ],
      },
    ],
  },
  {
    version: "v2.15.1",
    date: "October 2026",
    isoDate: "2026-10-18",
    type: "patch",
    title: "Documentation Overhaul & Repository Cleanup",
    summary:
      "A maintenance release focused on accuracy, SEO hygiene and a leaner dependency tree. The README and FAQ were rebuilt from the single source of truth (lib/toolsData.json) so the documented tool count (109), categories and feature list finally match the live app. We also removed a legacy duplicate PDF compressor page, pruned two 404-ing sitemap entries, dropped the unused Google reCAPTCHA dependency along with its dead styles, and fixed duplicate \"Latest Release\" badges across the changelog.",
    categories: ["Improvements", "Fixes"],
    highlights: [
      {
        title: "Refreshed FAQ & Help Hub",
        link: "/faq",
        description:
          "136 categorised answers across 21 sections, now aligned to the real 109-tool catalogue with corrected counts, categories and full Chart Studio coverage.",
        tag: "Docs",
      },
    ],
    changes: [
      {
        type: "Improved",
        items: [
          "Rebuilt README.md from lib/toolsData.json so the tool count (109), release badge, feature list and tool library match the live application exactly.",
          "Documented all 109 tools across 14 verified groups — including the five Chart Studio generators (Pie, Bar, Line, Radar, Funnel), Sleep Calculator, Remove Metadata and Todo Tool that were previously missing.",
          "Added a Client-Side vs. Server-Side section to the README documenting the seven real API Route Handlers (WHOIS, SSL, IP, email verification, tech detection, screenshot proxy and URL preview).",
          "Corrected the README tech stack (accurate fonts and dependencies) and removed inaccurate claims about an SMTP contact form, Nodemailer and reCAPTCHA protection.",
          "Updated the FAQ (app/(main)/data/faqs.json) to 109 tools and 16 categories, refreshed the category breakdown, and fixed the tool count in the FAQ page metadata.",
          "Added the missing \"Line & Area Chart Generator\" section title to the FAQ component so the Chart Studio FAQ renders with a proper heading.",
        ],
      },
      {
        type: "Fixed",
        items: [
          "Removed the stamp-generator sitemap entry that pointed to an empty, non-existent tool page (a soft 404 for crawlers).",
          "Removed the pdf-compression sitemap entry and deleted the unregistered legacy duplicate page (the maintained tool is /tools/compress-pdf).",
          "Fixed the duplicated \"Latest Release\" badge so only the newest changelog entry is highlighted.",
          "Fixed the broken README logo reference (favicon-96x96.png → toolstrek-logo.png).",
        ],
      },
      {
        type: "Removed",
        items: [
          "Removed the unused react-google-recaptcha dependency, its orphaned transitive packages (react-async-script and hoist-non-react-statics), and its dead CSS rules from globals.css.",
          "Removed the unused NEXT_PUBLIC_RECAPTCHA_SITE_KEY environment variable.",
          "Deleted the empty app/(main)/tools/stamp-generator directory.",
        ],
      },
    ],
  },
  {
    version: "v2.15.0",
    date: "October 2026",
    isoDate: "2026-10-18",
    type: "minor",
    title: "Line Chart Generator: Line & Area Chart Studio",
    summary:
      "Introducing the Line Chart Generator — the newest addition to the Chart Studio family! Turn any sequence of numbers into a clean, presentation-ready line or area chart. Enter your data, compare multiple series, switch between straight, smooth and step lines, toggle point markers, fill or stack the area, set the scale to auto fit or a custom range, rotate the category labels, and fine-tune axes, gridlines, labels and legends before exporting a crisp high-resolution PNG or scalable SVG — all 100% in your browser.",
    categories: ["New Tools", "Design", "Developer"],
    highlights: [
      {
        title: "Line Chart Generator & Area Chart Studio",
        link: "/tools/line-chart-generator",
        description:
          "Free online line, area and stacked area chart maker with live SVG preview, multiple series, straight, smooth and step lines, point markers, adjustable axes, labels and legends, and one-click PNG/SVG export.",
        tag: "Design",
      },
    ],
    changes: [
      {
        type: "Added",
        items: [
          "Interactive line chart generator with a live SVG preview that updates as you type.",
          "Editable data matrix (points × series) with live peak and average statistics and gaps for missing values.",
          "Straight, smooth and three step line styles (step after, step before and step middle).",
          "Monotone-safe smoothing with a curve tension slider so the spline never overshoots real data points.",
          "Support for up to six data series with per-series colours, dash patterns and visibility toggles.",
          "Overlaid and stacked area charts so composition over time is easy to read.",
          "Optional area fills with an adjustable opacity slider and an optional fade-to-transparent gradient.",
          "Point markers in five shapes (circle, square, diamond, triangle and cross) with adjustable size and fill.",
          "Solid, dashed, dotted, dash-dot and long-dash line patterns, applied globally or per series.",
          "Adjustable line width, line opacity and an inset slider to control point spacing at the plot edges.",
          "Automatic nice-number value axis with a configurable tick count, plus an auto or fully custom min/max scale.",
          "Zero-baseline toggle, solid, dashed or dotted gridlines, and an emphasised zero line.",
          "Editable category and value axis titles plus 0°, 45° and 90° category label rotation.",
          "Optional value labels in value, percent-of-total or combined formats, positioned above, below or on the line.",
          "Custom value prefixes and suffixes, thousands separators and compact notation (1.2K, 3.4M, 5.6B).",
          "Interactive hover guide with a per-series tooltip that is automatically stripped from exported images.",
          "Customisable legend on the top, right, bottom or left, including hidden series, with optional per-series totals.",
          "Ten designer-curated colour palettes plus native per-series colour pickers for full control.",
          "Eight ready-made sample datasets (website traffic, city temperatures, sales vs target, app downloads and more) for one-click starts.",
          "Cycle-through point sorting (original, highest first, lowest first) for instant ranking.",
          "Light, dark and transparent canvas themes with editable background, text, gridline and axis colours.",
          "Adjustable export canvas width and height for slide, print and social aspect ratios.",
          "High-resolution PNG export (1× to 4×), scalable SVG download, and one-click copy of the SVG markup.",
          "Data export as CSV and JSON for reuse in spreadsheets and other tools.",
          "Interactive FAQ accordion and an educational guide on reading and designing line charts.",
          "Full dark mode support and a fully responsive mobile-to-desktop studio layout.",
        ],
      },
      {
        type: "Improved",
        items: [
          "Registered the Line Chart Generator in the global tools catalog (toolsData.json) so it appears in the All Tools grid, category filters and global search.",
          "Added the /tools/line-chart-generator route to the dynamic sitemap with a monthly change frequency and high priority.",
          "Added a Line & Area Chart Generator FAQ section covering line vs area charts, smoothing, stacking and design best practices.",
          "Shipped an SEO-optimised tool page with canonical URL, OpenGraph, Twitter card, WebApplication and FAQPage structured data.",
        ],
      },
      {
        type: "Security",
        items: [
          "Every calculation and the chart rendering run 100% client-side using SVG and the HTML canvas — your data never leaves your browser.",
          "No accounts, no cookies and no third-party tracking are used to power the Line Chart Generator.",
        ],
      },
    ],
  },
  {
    version: "v2.14.0",
    date: "October 2026",
    isoDate: "2026-10-18",
    type: "minor",
    title: "Radar Chart Generator: Radar & Spider Chart Studio",
    summary:
      "Introducing the Radar Chart Generator — the newest addition to the Chart Studio family! Turn any set of dimensions into a clean, presentation-ready radar (spider) chart. Enter your data, compare multiple profiles across the same axes, switch between polygon webs and rounded circular grids, set the scale to auto fit, a fixed 0–100 range or a custom range, rotate the start angle, tune vertex points, curved outlines, area fills, gradients, labels and legends, then export a crisp high-resolution PNG or scalable SVG — all 100% in your browser.",
    categories: ["New Tools", "Design", "Developer"],
    highlights: [
      {
        title: "Radar Chart Generator & Spider Chart Studio",
        link: "/tools/radar-chart-generator",
        description:
          "Free online radar, spider and polar chart maker with live SVG preview, multiple overlapping series, polygon or circular grids, adjustable scale and rotation, vertex points, custom labels and legends, and one-click PNG/SVG export.",
        tag: "Design",
      },
    ],
    changes: [
      {
        type: "Added",
        items: [
          "Interactive radar (spider) chart generator with a live SVG preview that updates as you type.",
          "Editable data matrix (axes × series) with live totals, averages and per-series colour pickers.",
          "Support for up to six overlapping data series so profiles can be compared across the same axes.",
          "Per-series visibility toggles so any profile can be hidden without deleting its data.",
          "Polygon web and rounded circular grid shapes with an instant toggle.",
          "Adjustable number of concentric grid levels with an emphasised outer ring option.",
          "Three value-scale modes — Auto fit (nice rounded values), fixed 0–100 and fully Custom min/max.",
          "Rotatable start angle (0–355°) and clockwise or counter-clockwise axis direction.",
          "Straight or smooth curved series outlines powered by a closed Catmull-Rom spline.",
          "Optional translucent area fills with an adjustable opacity slider, plus an optional radial gradient fill.",
          "Optional vertex point markers with an adjustable radius and high-contrast styling.",
          "Ten designer-curated colour palettes plus native per-series colour pickers for full control.",
          "Optional vertex value labels in value, percent-of-maximum or combined formats with 0–4 decimals.",
          "Custom value prefixes and suffixes, thousands separators and compact notation (1.2K, 3.4M, 5.6B).",
          "Toggleable grid rings, outer ring, axis spokes, axis labels and radial tick values.",
          "Optional drop shadow on series polygons for extra depth on light backgrounds.",
          "Eight ready-made sample datasets (product comparison, skills assessment, website health, employee review, character stats and more) for one-click starts.",
          "Cycle-through axis sorting (original, highest first, lowest first) for instant ranking.",
          "Light, dark and transparent canvas themes with editable background, text, gridline and outer-ring colours.",
          "Adjustable export canvas width and height for slide, print and social aspect ratios.",
          "High-resolution PNG export (1× to 4×), scalable SVG download, and one-click copy of the SVG markup.",
          "Data export as CSV (with totals and averages) and JSON for reuse in spreadsheets and other tools.",
          "Interactive FAQ accordion and an educational guide on reading and designing radar charts.",
          "Full dark mode support and a fully responsive mobile-to-desktop studio layout.",
        ],
      },
      {
        type: "Improved",
        items: [
          "Registered the Radar Chart Generator in the global tools catalog (toolsData.json) so it appears in the All Tools grid, category filters and global search.",
          "Added the /tools/radar-chart-generator route to the dynamic sitemap with a monthly change frequency and high priority.",
          "Added a Radar & Spider Chart Generator FAQ section covering radar vs spider charts, scale maths, multi-series comparison and design best practices.",
          "Shipped an SEO-optimised tool page with canonical URL, OpenGraph, Twitter card, WebApplication and FAQPage structured data.",
        ],
      },
      {
        type: "Security",
        items: [
          "Every calculation and the chart rendering run 100% client-side using SVG and the HTML canvas — your data never leaves your browser.",
          "No accounts, no cookies and no third-party tracking are used to power the Radar Chart Generator.",
        ],
      },
    ],
  },
  {
    version: "v2.13.0",
    date: "October 2026",
    isoDate: "2026-10-18",
    type: "minor",
    title: "Chart Studio: Pie & Donut and Bar & Column Generators",
    summary:
      "Introducing the Chart Studio — two brand-new data-visualisation tools in one release! The Pie Chart Generator turns plain lists of categories and values into clean, presentation-ready pie and donut charts, while the Bar Chart Generator does the same for grouped and stacked bar and column charts. Enter your data, pick from ten curated colour palettes, fine-tune axes, labels, legends, gaps and corners, then export a crisp high-resolution PNG or scalable SVG — all 100% in your browser.",
    categories: ["New Tools", "Design", "Developer"],
    highlights: [
      {
        title: "Pie Chart Generator & Donut Studio",
        link: "/tools/pie-chart-generator",
        description:
          "Free online pie and donut chart maker with live SVG preview, curated palettes, custom labels and legends, exploded slices, and one-click PNG/SVG export.",
        tag: "Design",
      },
      {
        title: "Bar Chart Generator & Column Studio",
        link: "/tools/bar-chart-generator",
        description:
          "Free online bar and column chart maker with live SVG preview, multiple series, grouped and stacked modes, curated palettes, custom axes, labels, legends, and one-click PNG/SVG export.",
        tag: "Design",
      },
    ],
    changes: [
      {
        type: "Added",
        items: [
          "Interactive pie and donut chart generator with a live SVG preview that updates as you type.",
          "Editable data table (label, value, colour, explode) with live totals and percentage recalculation.",
          "Interactive bar and column chart generator with a live SVG preview that updates as you type.",
          "Vertical column and horizontal bar orientations with an instant toggle.",
          "Grouped and stacked bar modes with automatic axis scaling and label placement.",
          "Multi-series data support (up to 6 series) with per-series colours, names and values.",
          "Editable data matrix (categories × series) with live totals, percentages and negative-value support.",
          "Ten designer-curated colour palettes shared across both charts, plus native per-slice and per-series colour pickers for full control.",
          "Seven ready-made sample datasets for each chart (traffic sources, market share, quarterly revenue, budget vs actual and more) for one-click starts.",
          "Adjustable slice gap, rounded slice corners, rotation (start angle) and clockwise / counter-clockwise direction.",
          "Exploded (pulled-out) pie slices with a global explode-distance slider to highlight key values.",
          "Inside labels or outside labels with automatic leader lines, four label formats and 0–3 decimal precision.",
          "Adjustable bar width, group gap, rounded corner radius, fill opacity, gradient fills and drop shadows.",
          "Automatic nice-number value axis with a configurable tick count, gridlines and a zero-baseline toggle.",
          "Editable category and value axis titles plus 0°, 45° and 90° category label rotation.",
          "Value labels with value, percent-of-total or both, positioned outside, inside or centred, with 0–4 decimals.",
          "Custom value prefixes and suffixes, thousands separators and compact notation (K, M, B).",
          "Optional donut centre total with a custom caption, plus automatic high-contrast label text per slice.",
          "Customisable legend on every side (top, right, bottom or left) with optional values and per-series totals.",
          "Cycle-through category sorting (original, largest first, smallest first) for bar charts.",
          "Light, dark and transparent canvas themes with editable background, text, gridline and axis colours.",
          "Adjustable export canvas width and height for slide, print and social aspect ratios.",
          "High-resolution PNG export (1× to 4×), scalable SVG download, and one-click copy of the SVG markup.",
          "Data export as CSV and JSON for reuse in spreadsheets and other tools.",
          "Interactive FAQ accordions and educational guides on reading and designing pie and bar charts.",
          "Full dark mode support and a fully responsive mobile-to-desktop studio layout.",
        ],
      },
      {
        type: "Improved",
        items: [
          "Registered the Pie Chart Generator and Bar Chart Generator in the global tools catalog (toolsData.json) so they appear in the All Tools grid, category filters and global search.",
          "Added the /tools/pie-chart-generator and /tools/bar-chart-generator routes to the dynamic sitemap with a monthly change frequency and high priority.",
          "Added Pie & Donut and Bar & Column Chart Generator FAQ sections covering angle maths, orientation, grouping, axis scale and design best practices.",
          "Updated tool counts and category listings across the FAQ and documentation to reflect the two new additions (now 106 tools).",
          "Shipped SEO-optimised tool pages with canonical URLs, OpenGraph, Twitter cards, WebApplication and FAQPage structured data.",
        ],
      },
      {
        type: "Security",
        items: [
          "Every calculation and the chart rendering in both generators run 100% client-side using SVG and the HTML canvas — your data never leaves your browser.",
          "No accounts, no cookies and no third-party tracking are used to power the Pie Chart Generator or the Bar Chart Generator.",
        ],
      },
    ],
  },
  {
    version: "v2.12.0",
    date: "October 2026",
    isoDate: "2026-10-18",
    type: "minor",
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
