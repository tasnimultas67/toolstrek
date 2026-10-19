export const changelogData = [
  {
    version: "v2.18.0",
    date: "October 2026",
    isoDate: "2026-10-19",
    type: "minor",
    badge: "Latest Release",
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
