"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import * as motion from "motion/react-client";
import { toast } from "sonner";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Check,
  ChevronRight,
  CircleCheck,
  Copy,
  Download,
  ExternalLink,
  EyeOff,
  FileArchive,
  Github,
  Globe,
  Heart,
  Image as ImageIcon,
  Layers,
  Mail,
  Megaphone,
  Moon,
  MoveHorizontal,
  Palette,
  Quote,
  RotateCw,
  ShieldCheck,
  Sparkles,
  Sun,
  Type,
  UserRound,
  X,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Brand data                                                                */
/* -------------------------------------------------------------------------- */

const BRAND = {
  name: "ToolsTrek",
  tagline: "Your Online Utility Hub.",
  site: "https://toolstrek.vercel.app",
  email: "contact.toolstrek@gmail.com",
  github: "https://github.com/tasnimultas67/toolstrek",
  x: "https://x.com/toolstrek",
  developer: "https://tasnimul.vercel.app",
  company: "https://axioree.com",
};

const KIT_ZIP = "/brand/toolstrek-brand-kit.zip";

const NAV_LINKS = [
  { label: "Logos", href: "#logos" },
  { label: "Colours", href: "#colours" },
  { label: "Typography", href: "#typography" },
  { label: "Usage", href: "#usage" },
  { label: "Messaging", href: "#messaging" },
  { label: "Press", href: "#press" },
];

const STATS = [
  { value: "100+", label: "free online tools" },
  { value: "0", label: "sign-ups required" },
  { value: "100%", label: "in-browser file tools" },
  { value: "Free", label: "now and always" },
];

const COLOURS = [
  {
    name: "Trek Green",
    role: "Primary accent",
    hex: "#0AA701",
    rgb: "10, 167, 1",
    featured: true,
  },
  {
    name: "Deep Trek",
    role: "Hover & detail",
    hex: "#0A6904",
    rgb: "10, 105, 4",
  },
  {
    name: "Ink",
    role: "Primary text",
    hex: "#231F20",
    rgb: "35, 31, 32",
  },
  {
    name: "Paper",
    role: "Light surface",
    hex: "#F6F6F6",
    rgb: "246, 246, 246",
  },
  {
    name: "Night",
    role: "Dark surface",
    hex: "#09090B",
    rgb: "9, 9, 11",
  },
  {
    name: "White",
    role: "Contrast",
    hex: "#FFFFFF",
    rgb: "255, 255, 255",
  },
];

const DOS = [
  "Use the supplied SVG files so the logo stays crisp at every size.",
  "Use the primary logo on light surfaces and the reverse logo on dark ones.",
  "Keep clear space around the logo equal to the height of the “T”.",
  "Keep the green mark and the wordmark together, at their original proportions.",
];

const DONTS = [
  {
    label: "Don’t stretch",
    icon: MoveHorizontal,
    className: "scale-x-[1.55]",
  },
  {
    label: "Don’t recolour",
    icon: Palette,
    style: { filter: "hue-rotate(145deg) saturate(2.2)" },
  },
  {
    label: "Don’t rotate",
    icon: RotateCw,
    className: "-rotate-12",
  },
  {
    label: "Don’t lower contrast",
    icon: EyeOff,
    lowContrast: true,
  },
];

const SHORT_DESCRIPTION =
  "ToolsTrek is a free online toolbox with 100+ privacy-first tools for files, images, text, calculations and everyday digital tasks.";

const BOILERPLATE =
  "ToolsTrek is an independent, open-source collection of more than 100 free online tools for everyday digital work. From PDF and image utilities to converters, calculators and text tools, it brings the small jobs into one fast, uncluttered workspace. No sign-up is required, and the file-based tools process locally in your browser.";

const CONTACT_ROWS = [
  {
    icon: Mail,
    label: "Press & general",
    value: BRAND.email,
    href: `mailto:${BRAND.email}`,
    copy: true,
  },
  {
    icon: Globe,
    label: "Website",
    value: "toolstrek.vercel.app",
    href: BRAND.site,
  },
  {
    icon: Github,
    label: "Source",
    value: "github.com/tasnimultas67/toolstrek",
    href: BRAND.github,
  },
  {
    icon: XLogo,
    label: "X / Twitter",
    value: "@toolstrek",
    href: BRAND.x,
  },
  {
    icon: UserRound,
    label: "Developer",
    value: "Tasnimul Haque",
    href: BRAND.developer,
  },
];

/* -------------------------------------------------------------------------- */
/*  Small building blocks                                                     */
/* -------------------------------------------------------------------------- */

const cx = (...classes) => classes.filter(Boolean).join(" ");

function XLogo({ className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="currentColor"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.657l-5.214-6.817-5.966 6.817H1.68l7.73-8.835L1.254 2.25h6.826l4.713 6.231 5.451-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644Z" />
    </svg>
  );
}

function CopyButton({
  value,
  label,
  tone = "light",
  showLabel = false,
  className = "",
}) {
  const [copied, setCopied] = useState(false);

  const tones = {
    light:
      "border-gray-200 bg-white/80 text-gray-600 hover:border-brandColor/40 hover:text-brandColor dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:text-brandColor",
    onLight:
      "border-gray-900/15 bg-white text-gray-700 shadow-sm shadow-black/5 hover:border-brandColor/50 hover:text-brandColor",
    dark: "border-white/15 bg-white/10 text-white/80 hover:bg-white/20 hover:text-white",
    green:
      "border-white/20 bg-white/15 text-white hover:bg-white/25 hover:text-white",
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(`${label} copied to clipboard`);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Couldn’t copy — please try again.");
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={`Copy ${label}`}
      className={cx(
        "inline-flex h-8 items-center justify-center gap-1.5 rounded-full border text-[11px] font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brandColor",
        showLabel ? "px-3" : "w-8",
        tones[tone],
        className,
      )}
    >
      {copied ? (
        <Check className="size-3.5" strokeWidth={2.5} />
      ) : (
        <Copy className="size-3.5" />
      )}
      {showLabel ? <span>{copied ? "Copied" : "Copy"}</span> : null}
    </button>
  );
}

function CopySvgButton({ src, label }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      const response = await fetch(src);
      if (!response.ok) throw new Error("Could not load SVG");
      const svg = await response.text();
      await navigator.clipboard.writeText(svg);
      setCopied(true);
      toast.success(`${label} SVG copied`);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Couldn’t copy the SVG — please try again.");
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex h-9 items-center gap-1.5 rounded-full border border-gray-200 bg-transparent px-3.5 text-xs font-medium text-gray-600 transition-colors duration-200 hover:border-brandColor/40 hover:text-brandColor focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brandColor dark:border-white/10 dark:text-gray-300 dark:hover:text-brandColor"
    >
      {copied ? (
        <Check className="size-3.5" strokeWidth={2.5} />
      ) : (
        <Copy className="size-3.5" />
      )}
      {copied ? "Copied" : "Copy SVG"}
    </button>
  );
}

function DownloadButton({
  href,
  children,
  variant = "primary",
  className = "",
}) {
  const variants = {
    primary:
      "bg-brandColor text-white shadow-lg shadow-brandColor/20 hover:bg-brandColorHover",
    secondary:
      "border border-gray-200 bg-white/70 text-gray-900 backdrop-blur hover:border-brandColor/40 hover:text-brandColor dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:text-brandColor",
    light:
      "bg-white text-gray-900 shadow-lg shadow-black/10 hover:bg-gray-100",
    ghostLight:
      "border border-white/20 bg-white/5 text-white hover:bg-white/10",
    subtle:
      "border border-gray-200 bg-transparent text-gray-700 hover:border-brandColor/40 hover:text-brandColor dark:border-white/10 dark:text-gray-300",
  };

  return (
    <a
      href={href}
      download
      className={cx(
        "group inline-flex h-10 items-center justify-center gap-2 rounded-full px-4 text-xs font-semibold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brandColor sm:h-11 sm:px-5 sm:text-sm",
        variants[variant],
        className,
      )}
    >
      {children}
    </a>
  );
}

function SectionHeading({ index, eyebrow, title, description, action }) {
  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-2xl">
        <p className="flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-brandColor">
          <span className="tabular-nums text-gray-400 dark:text-gray-600">
            {index}
          </span>
          <span className="h-px w-7 bg-brandColor/40" />
          {eyebrow}
        </p>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-4 max-w-xl text-sm leading-7 text-gray-600 dark:text-gray-400 sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

function Reveal({ children, delay = 0, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function StatStrip() {
  return (
    <div className="mt-2 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-gray-200/80 bg-gray-200/70 shadow-sm shadow-black/[0.03] dark:border-white/10 dark:bg-white/10 sm:grid-cols-4">
      {STATS.map((stat) => (
        <div
          key={stat.label}
          className="bg-white/90 px-4 py-5 backdrop-blur dark:bg-[#0b0b0d] sm:px-6 sm:py-6"
        >
          <p className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
            {stat.value}
          </p>
          <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.14em] text-gray-500 dark:text-gray-500 sm:text-xs">
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  );
}

function PageBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      <div className="absolute left-1/2 top-[-22rem] h-[40rem] w-[72rem] -translate-x-1/2 rounded-full bg-brandColor/10 blur-3xl dark:bg-brandColor/15" />
      <div className="absolute -right-32 top-24 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(100,116,139,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(100,116,139,0.08)_1px,transparent_1px)] bg-size-[44px_44px] mask-[radial-gradient(ellipse_at_top,black_22%,transparent_72%)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.055)_1px,transparent_1px)]" />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Hero logo stage                                                           */
/* -------------------------------------------------------------------------- */

function LogoStage() {
  const [stage, setStage] = useState("light");
  const isDark = stage === "dark";
  const logoSrc = isDark
    ? "/brand/toolstrek-logo-reverse.svg"
    : "/brand/toolstrek-logo-primary.svg";

  return (
    <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
      <div
        aria-hidden
        className="absolute -inset-5 rounded-[2.75rem] bg-brandColor/10 blur-2xl"
      />

      <div className="relative rounded-[2rem] border border-gray-200/80 bg-white/80 p-2 shadow-2xl shadow-black/10 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-black/40">
        <div
          className={cx(
            "relative aspect-[4/3] overflow-hidden rounded-[1.55rem] p-4 transition-colors duration-500 sm:p-6",
            isDark ? "bg-[#09090b]" : "bg-[#f6f6f6]",
          )}
        >
          <div
            aria-hidden
            className={cx(
              "absolute inset-0 bg-[radial-gradient(circle,currentColor_1px,transparent_1px)] bg-size-[16px_16px]",
              isDark ? "text-white/10" : "text-gray-900/10",
            )}
          />
          <div
            aria-hidden
            className={cx(
              "absolute -right-20 -top-20 size-56 rounded-full blur-3xl transition-opacity duration-500",
              isDark ? "bg-brandColor/25" : "bg-brandColor/10",
            )}
          />

          <div className="relative flex h-full flex-col justify-between">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span
                className={cx(
                  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]",
                  isDark
                    ? "border-white/15 bg-white/5 text-white/70"
                    : "border-gray-200 bg-white/80 text-gray-500",
                )}
              >
                <span
                  className={cx(
                    "size-1.5 rounded-full",
                    isDark ? "bg-brandColor" : "bg-brandColor",
                  )}
                />
                {isDark ? "Reverse logo" : "Primary logo"}
              </span>

              <div
                role="group"
                aria-label="Preview background"
                className={cx(
                  "inline-flex items-center gap-0.5 rounded-full border p-0.5",
                  isDark
                    ? "border-white/15 bg-white/5"
                    : "border-gray-200 bg-white/80",
                )}
              >
                <button
                  type="button"
                  onClick={() => setStage("light")}
                  aria-pressed={!isDark}
                  className={cx(
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[10px] font-medium transition-all duration-200",
                    !isDark
                      ? "bg-gray-900 text-white shadow-sm"
                      : "text-white/60 hover:text-white",
                  )}
                >
                  <Sun className="size-3" />
                  Light
                </button>
                <button
                  type="button"
                  onClick={() => setStage("dark")}
                  aria-pressed={isDark}
                  className={cx(
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[10px] font-medium transition-all duration-200",
                    isDark
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-900",
                  )}
                >
                  <Moon className="size-3" />
                  Dark
                </button>
              </div>
            </div>

            <div className="flex flex-1 items-center justify-center py-4">
              <Image
                src={logoSrc}
                alt="ToolsTrek logo"
                width={384}
                height={78}
                unoptimized
                priority
                className="h-auto w-[78%] max-w-sm"
              />
            </div>

            <div className="flex flex-wrap items-end justify-between gap-3 sm:pl-14">
              <div>
                <p
                  className={cx(
                    "text-xs font-semibold",
                    isDark ? "text-white" : "text-gray-900",
                  )}
                >
                  ToolsTrek
                </p>
                <p
                  className={cx(
                    "mt-0.5 text-[10px] tracking-wide",
                    isDark ? "text-white/45" : "text-gray-500",
                  )}
                >
                  Your Online Utility Hub
                </p>
              </div>
              <a
                href={logoSrc}
                download
                className={cx(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-semibold transition-colors duration-200",
                  isDark
                    ? "border-white/15 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
                    : "border-gray-200 bg-white text-gray-700 hover:border-brandColor/40 hover:text-brandColor",
                )}
              >
                <Download className="size-3" />
                Download SVG
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -top-3 right-6 hidden items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[10px] font-medium text-gray-600 shadow-lg shadow-black/5 dark:border-white/10 dark:bg-gray-900 dark:text-gray-300 sm:inline-flex">
        <Layers className="size-3 text-brandColor" />
        2 logo variants
      </div>

      <div className="absolute -bottom-6 -left-4 hidden size-20 items-center justify-center rounded-[1.35rem] bg-brandColor shadow-2xl shadow-brandColor/30 ring-4 ring-white dark:ring-[#09090b] sm:flex">
        <Image
          src="/brand/toolstrek-monogram-white.svg"
          alt=""
          width={78}
          height={78}
          unoptimized
          className="w-9"
        />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Asset components                                                          */
/* -------------------------------------------------------------------------- */

function LogoAssetCard({
  title,
  description,
  label,
  src,
  svg,
  png,
  dark = false,
}) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-[1.75rem] border border-gray-200/80 bg-white/80 shadow-sm shadow-black/[0.03] backdrop-blur transition-all duration-300 hover:border-brandColor/30 hover:shadow-xl hover:shadow-brandColor/10 dark:border-white/10 dark:bg-gray-900/60">
      <div className="p-2 pb-0">
        <div
          className={cx(
            "relative flex aspect-[16/7] items-center justify-center overflow-hidden rounded-[1.3rem] border",
            dark
              ? "border-white/10 bg-[#09090b]"
              : "border-gray-200/80 bg-[#f6f6f6]",
          )}
        >
          <div
            aria-hidden
            className={cx(
              "absolute inset-0 bg-[radial-gradient(circle,currentColor_1px,transparent_1px)] bg-size-[16px_16px] opacity-60",
              dark ? "text-white/10" : "text-gray-900/10",
            )}
          />
          <Image
            src={src}
            alt={`${title} — ToolsTrek`}
            width={384}
            height={78}
            unoptimized
            className="relative h-auto w-[68%] max-w-md transition-transform duration-300 group-hover:scale-[1.02]"
          />
          <span
            className={cx(
              "absolute left-3 top-3 rounded-full border px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.12em]",
              dark
                ? "border-white/15 bg-white/5 text-white/60"
                : "border-gray-200 bg-white/80 text-gray-500",
            )}
          >
            {label}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5 sm:p-6">
        <div>
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-white">
              {title}
            </h3>
            <span className="mt-0.5 shrink-0 rounded-full bg-brandColor/10 px-2.5 py-1 text-[10px] font-semibold text-brandColor">
              SVG · PNG
            </span>
          </div>
          <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
            {description}
          </p>
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-2">
          <DownloadButton href={svg} variant="primary">
            <Download className="size-3.5" />
            SVG
          </DownloadButton>
          <DownloadButton href={png} variant="secondary">
            <Download className="size-3.5" />
            PNG
          </DownloadButton>
          <CopySvgButton src={svg} label={title} />
        </div>

        <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-gray-400 dark:text-gray-600">
          PNG · 2400 px wide · transparent background
        </p>
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function BrandKitContent() {
  return (
    <div id="top" className="pb-16 sm:pb-20">
      {/* ------------------------------- Hero ------------------------------- */}
      <section className="relative isolate overflow-hidden pb-10 pt-24 sm:pb-14 sm:pt-32 lg:pb-16 lg:pt-36">
        <PageBackground />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-[1.02fr_1fr] lg:gap-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            >
              <nav
                aria-label="Breadcrumb"
                className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-500"
              >
                <Link
                  href="/"
                  className="transition-colors duration-200 hover:text-brandColor"
                >
                  Home
                </Link>
                <ChevronRight className="size-3.5 text-gray-300 dark:text-gray-700" />
                <span className="text-gray-700 dark:text-gray-300">
                  Brand &amp; Media Kit
                </span>
              </nav>

              <span className="mt-6 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/70 px-3.5 py-1.5 text-xs font-medium text-gray-700 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-gray-300">
                <Sparkles className="size-3.5 text-brandColor" />
                Official brand assets
              </span>

              <h1 className="mt-5 text-4xl font-semibold leading-[1.06] tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
                The ToolsTrek
                <br />
                <span className="bg-linear-to-r from-brandColor via-brandColor/60 to-brandColor bg-size-[200%_auto] bg-clip-text font-playfairDisplay italic text-transparent">
                  brand, in one place.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-7 text-gray-600 dark:text-gray-400 sm:text-lg sm:leading-8">
                Logos, monogram, colours and the words we use — download the
                official assets and get the details right every time you build
                with, write about, or link to ToolsTrek.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <DownloadButton href={KIT_ZIP} variant="primary">
                  <FileArchive className="size-4" />
                  Download the brand kit
                  <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </DownloadButton>
                <a
                  href="#logos"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-gray-200 bg-white/70 px-5 text-sm font-semibold text-gray-900 backdrop-blur transition-colors duration-200 hover:border-brandColor/40 hover:text-brandColor focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brandColor dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:text-brandColor sm:h-11"
                >
                  Explore the logo system
                </a>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-[11px] font-medium text-gray-500 dark:text-gray-500">
                <span className="inline-flex items-center gap-1.5">
                  <FileArchive className="size-3.5 text-brandColor" />
                  13 files · 287 KB
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="size-3.5 text-brandColor" />
                  Free for editorial use
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Globe className="size-3.5 text-brandColor" />
                  SVG + PNG
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 22 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            >
              <LogoStage />
            </motion.div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <StatStrip />

        {/* --------------------------- Sticky nav --------------------------- */}
        <div className="sticky top-20 z-30 mt-8">
          <div className="flex items-center gap-2 rounded-full border border-gray-200/80 bg-white/80 p-1.5 shadow-lg shadow-black/[0.04] backdrop-blur-xl dark:border-white/10 dark:bg-gray-950/70">
            <span className="hidden shrink-0 pl-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-400 dark:text-gray-600 lg:block">
              On this page
            </span>
            <nav
              aria-label="Brand kit sections"
              className="tool-chip-scroller flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto"
            >
              {NAV_LINKS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="shrink-0 rounded-full px-3 py-2 text-xs font-medium text-gray-600 transition-colors duration-200 hover:bg-brandColor/10 hover:text-brandColor dark:text-gray-400 dark:hover:text-brandColor"
                >
                  {item.label}
                </a>
              ))}
            </nav>
            <a
              href={KIT_ZIP}
              download
              className="hidden shrink-0 items-center gap-1.5 rounded-full bg-brandColor px-3.5 py-2 text-xs font-semibold text-white shadow-sm shadow-brandColor/20 transition-colors duration-200 hover:bg-brandColorHover sm:inline-flex"
            >
              <Download className="size-3.5" />
              .zip
            </a>
          </div>
        </div>

        {/* ------------------------------ Logos ----------------------------- */}
        <section
          id="logos"
          className="mt-14 scroll-mt-32 border-t border-gray-200/70 pt-14 dark:border-white/10 sm:mt-16 sm:pt-16"
        >
          <Reveal>
            <SectionHeading
              index="01"
              eyebrow="Logo system"
              title={
                <>
                  A mark built to{" "}
                  <span className="font-playfairDisplay italic text-brandColor">
                    travel.
                  </span>
                </>
              }
              description="Use the primary logo on light surfaces and the reverse logo on dark ones. The monogram is for tight spaces where the full wordmark would become unreadable."
              action={
                <DownloadButton href={KIT_ZIP} variant="secondary">
                  <FileArchive className="size-4 text-brandColor" />
                  Download all logos
                </DownloadButton>
              }
            />
          </Reveal>

          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            <Reveal>
              <LogoAssetCard
                title="Primary logo"
                description="The default lockup for websites, documents, presentations and light product surfaces."
                label="For light backgrounds"
                src="/brand/toolstrek-logo-primary.svg"
                svg="/brand/toolstrek-logo-primary.svg"
                png="/brand/toolstrek-logo-primary.png"
              />
            </Reveal>
            <Reveal delay={0.08}>
              <LogoAssetCard
                title="Reverse logo"
                description="The white wordmark for night surfaces, video end cards and dark editorial layouts."
                label="For dark backgrounds"
                src="/brand/toolstrek-logo-reverse.svg"
                svg="/brand/toolstrek-logo-reverse.svg"
                png="/brand/toolstrek-logo-reverse.png"
                dark
              />
            </Reveal>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Reveal>
              <article className="flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-gray-200/80 bg-white/80 shadow-sm shadow-black/[0.03] backdrop-blur dark:border-white/10 dark:bg-gray-900/60">
                <div className="p-2 pb-0">
                  <div className="grid aspect-[16/9] grid-cols-2 overflow-hidden rounded-[1.3rem] border border-gray-200/80 dark:border-white/10">
                    <div className="relative flex items-center justify-center bg-[#f6f6f6]">
                      <div
                        aria-hidden
                        className="absolute inset-0 bg-[radial-gradient(circle,currentColor_1px,transparent_1px)] bg-size-[16px_16px] text-gray-900/10"
                      />
                      <Image
                        src="/brand/toolstrek-monogram.svg"
                        alt="ToolsTrek monogram"
                        width={78}
                        height={78}
                        unoptimized
                        className="relative w-[42%]"
                      />
                    </div>
                    <div className="relative flex items-center justify-center bg-[#09090b]">
                      <div
                        aria-hidden
                        className="absolute inset-0 bg-[radial-gradient(circle,currentColor_1px,transparent_1px)] bg-size-[16px_16px] text-white/10"
                      />
                      <Image
                        src="/brand/toolstrek-monogram-white.svg"
                        alt="ToolsTrek monogram in white"
                        width={78}
                        height={78}
                        unoptimized
                        className="relative w-[42%]"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-1 flex-col gap-4 p-5 sm:p-6">
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-white">
                        Monogram
                      </h3>
                      <span className="mt-0.5 shrink-0 rounded-full bg-brandColor/10 px-2.5 py-1 text-[10px] font-semibold text-brandColor">
                        Mark only
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
                      The compact mark for favicons, app tiles, social avatars
                      and anywhere the wordmark would crowd the frame.
                    </p>
                  </div>
                  <div className="mt-auto flex flex-wrap items-center gap-2">
                    <DownloadButton
                      href="/brand/toolstrek-monogram.svg"
                      variant="primary"
                    >
                      <Download className="size-3.5" />
                      SVG
                    </DownloadButton>
                    <DownloadButton
                      href="/brand/toolstrek-monogram.png"
                      variant="secondary"
                    >
                      <Download className="size-3.5" />
                      PNG
                    </DownloadButton>
                    <a
                      href="/brand/toolstrek-monogram-white.svg"
                      download
                      className="inline-flex h-9 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium text-gray-500 transition-colors duration-200 hover:text-brandColor dark:text-gray-400"
                    >
                      White version
                      <ArrowRight className="size-3" />
                    </a>
                  </div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-gray-400 dark:text-gray-600">
                    PNG · 1024 px · transparent background
                  </p>
                </div>
              </article>
            </Reveal>

            <Reveal delay={0.08}>
              <article className="flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-gray-200/80 bg-white/80 shadow-sm shadow-black/[0.03] backdrop-blur dark:border-white/10 dark:bg-gray-900/60">
                <div className="p-2 pb-0">
                  <div className="relative flex aspect-[16/9] items-center justify-center overflow-hidden rounded-[1.3rem] border border-gray-200/80 bg-[linear-gradient(135deg,#f6f6f6_0%,#ffffff_55%,#eaf6e8_100%)] dark:border-white/10 dark:bg-[linear-gradient(135deg,#0b0b0e_0%,#101013_55%,#0a1a08_100%)]">
                    <div
                      aria-hidden
                      className="absolute inset-0 bg-[radial-gradient(circle,currentColor_1px,transparent_1px)] bg-size-[16px_16px] text-gray-900/10 dark:text-white/10"
                    />
                    <div
                      aria-hidden
                      className="absolute -right-16 -top-16 size-48 rounded-full bg-brandColor/10 blur-3xl dark:bg-brandColor/20"
                    />
                    <Image
                      src="/brand/toolstrek-app-icon.png"
                      alt="ToolsTrek app icon"
                      width={1024}
                      height={1024}
                      unoptimized
                      className="relative w-24 rounded-[1.6rem] shadow-2xl shadow-brandColor/25 sm:w-28"
                    />
                  </div>
                </div>
                <div className="flex flex-1 flex-col gap-4 p-5 sm:p-6">
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-white">
                        App icon
                      </h3>
                      <span className="mt-0.5 shrink-0 rounded-full bg-brandColor/10 px-2.5 py-1 text-[10px] font-semibold text-brandColor">
                        1024 × 1024
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
                      A square, full-bleed icon for install tiles, avatars and
                      platform profiles. Keep the green field intact.
                    </p>
                  </div>
                  <div className="mt-auto flex flex-wrap items-center gap-2">
                    <DownloadButton
                      href="/brand/toolstrek-app-icon.png"
                      variant="primary"
                    >
                      <Download className="size-3.5" />
                      PNG
                    </DownloadButton>
                    <DownloadButton
                      href="/brand/toolstrek-app-icon.svg"
                      variant="secondary"
                    >
                      <Download className="size-3.5" />
                      SVG
                    </DownloadButton>
                  </div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-gray-400 dark:text-gray-600">
                    Use on app stores, profiles &amp; install prompts
                  </p>
                </div>
              </article>
            </Reveal>
          </div>

          <Reveal className="mt-4">
            <article className="overflow-hidden rounded-[1.75rem] border border-gray-200/80 bg-white/80 shadow-sm shadow-black/[0.03] backdrop-blur dark:border-white/10 dark:bg-gray-900/60">
              <div className="grid lg:grid-cols-[1.25fr_0.75fr]">
                <div className="p-2">
                  <div className="overflow-hidden rounded-[1.3rem] border border-gray-200/80 dark:border-white/10">
                    <Image
                      src="/brand/toolstrek-social-card.png"
                      alt="ToolsTrek social card"
                      width={1200}
                      height={630}
                      unoptimized
                      className="h-auto w-full"
                    />
                  </div>
                </div>
                <div className="flex flex-col justify-center gap-5 p-5 sm:p-7 lg:p-8">
                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-brandColor/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-brandColor">
                      <Megaphone className="size-3" />
                      Social &amp; press
                    </span>
                    <h3 className="mt-4 text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
                      Social card
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
                      A ready-to-publish 1200 × 630 card for link previews,
                      articles, newsletters and press mentions.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <DownloadButton
                      href="/brand/toolstrek-social-card.png"
                      variant="primary"
                    >
                      <Download className="size-3.5" />
                      PNG
                    </DownloadButton>
                    <DownloadButton
                      href="/brand/toolstrek-social-card.svg"
                      variant="secondary"
                    >
                      <Download className="size-3.5" />
                      SVG
                    </DownloadButton>
                  </div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-gray-400 dark:text-gray-600">
                    Open Graph · X · LinkedIn · Newsletter
                  </p>
                </div>
              </div>
            </article>
          </Reveal>

          <Reveal className="mt-4">
            <div className="flex flex-col items-start justify-between gap-5 rounded-2xl border border-dashed border-gray-300 bg-white/50 p-5 dark:border-white/15 dark:bg-white/[0.03] sm:flex-row sm:items-center sm:p-6">
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brandColor/10 text-brandColor">
                  <FileArchive className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    Need everything at once?
                  </p>
                  <p className="mt-1 text-xs leading-6 text-gray-500 dark:text-gray-400">
                    The full kit includes every logo, the monogram, app icon,
                    social card, colour reference and usage notes.
                  </p>
                </div>
              </div>
              <DownloadButton href={KIT_ZIP} variant="primary" className="shrink-0">
                <Download className="size-4" />
                Download .zip
              </DownloadButton>
            </div>
          </Reveal>
        </section>

        {/* ----------------------------- Colours ---------------------------- */}
        <section
          id="colours"
          className="scroll-mt-32 border-t border-gray-200/70 pt-14 dark:border-white/10 sm:pt-16"
        >
          <Reveal>
            <SectionHeading
              index="02"
              eyebrow="Colour"
              title={
                <>
                  Green that{" "}
                  <span className="font-playfairDisplay italic text-brandColor">
                    signals action.
                  </span>
                </>
              }
              description="A tight palette built around Trek Green. Use it for accents, icons and large display moments — and let Ink and Paper carry the reading."
            />
          </Reveal>

          <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {COLOURS.map((colour, index) => {
              const isLight = colour.name === "Paper" || colour.name === "White";
              const featured = Boolean(colour.featured);

              return (
                <Reveal
                  key={colour.hex}
                  delay={index * 0.04}
                  className={featured ? "col-span-2" : "col-span-1"}
                >
                  <ColorCard colour={colour} isLight={isLight} />
                </Reveal>
              );
            })}

            <Reveal className="col-span-2 lg:col-span-1">
              <div className="flex h-full flex-col justify-between rounded-2xl border border-gray-200/80 bg-white/80 p-5 dark:border-white/10 dark:bg-gray-900/60">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-gray-600">
                    Suggested balance
                  </p>
                  <div className="mt-5 space-y-4">
                    {[
                      { label: "Neutral space", value: "60%", width: "60%", color: "#d4d4d8" },
                      { label: "Ink & text", value: "30%", width: "30%", color: "#231F20" },
                      { label: "Trek Green", value: "10%", width: "10%", color: "#0AA701" },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="flex items-center justify-between gap-2 text-[10px] font-medium text-gray-500 dark:text-gray-400">
                          <span>{item.label}</span>
                          <span className="tabular-nums">{item.value}</span>
                        </div>
                        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
                          <div
                            className="h-full rounded-full [box-shadow:inset_0_0_0_1px_rgba(0,0,0,0.14)] dark:[box-shadow:inset_0_0_0_1px_rgba(255,255,255,0.45)]"
                            style={{
                              width: item.width,
                              backgroundColor: item.color,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="mt-5 text-[11px] leading-5 text-gray-500 dark:text-gray-500">
                  Let the green do the pointing. Too much of it makes the
                  interface feel loud.
                </p>
              </div>
            </Reveal>
          </div>

          <Reveal className="mt-4">
            <div className="flex flex-col gap-3 rounded-2xl border border-gray-200/80 bg-white/60 p-5 dark:border-white/10 dark:bg-white/[0.03] sm:flex-row sm:items-center sm:gap-4">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brandColor/10 text-brandColor">
                <ShieldCheck className="size-4" />
              </span>
              <p className="text-xs leading-6 text-gray-600 dark:text-gray-400 sm:text-sm">
                <strong className="font-semibold text-gray-900 dark:text-white">
                  Accessibility note.
                </strong>{" "}
                Trek Green has a 3.2:1 contrast ratio on white, so reserve it
                for large text, icons and accents. Use Ink for body copy on
                light surfaces, or Deep Trek when green text must stay
                readable.
              </p>
            </div>
          </Reveal>
        </section>

        {/* --------------------------- Typography --------------------------- */}
        <section
          id="typography"
          className="scroll-mt-32 border-t border-gray-200/70 pt-14 dark:border-white/10 sm:pt-16"
        >
          <Reveal>
            <SectionHeading
              index="03"
              eyebrow="Typography"
              title={
                <>
                  Friendly, without{" "}
                  <span className="font-playfairDisplay italic text-brandColor">
                    shouting.
                  </span>
                </>
              }
              description="Google Sans Flex keeps the product clear and approachable. Playfair Display adds an editorial, human note — used sparingly, and almost always in italic."
            />
          </Reveal>

          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            <Reveal>
              <article className="flex h-full flex-col rounded-[1.75rem] border border-gray-200/80 bg-white/80 p-6 shadow-sm shadow-black/[0.03] backdrop-blur dark:border-white/10 dark:bg-gray-900/60 sm:p-8">
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-brandColor/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-brandColor">
                    Primary typeface
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.14em] text-gray-400 dark:text-gray-600">
                    UI · Body
                  </span>
                </div>
                <p className="mt-8 font-googleSansFlex text-6xl leading-none tracking-tight text-gray-900 dark:text-white sm:text-7xl">
                  Aa
                </p>
                <p className="mt-5 text-xl font-semibold text-gray-900 dark:text-white">
                  Google Sans Flex
                </p>
                <p className="mt-2 font-googleSansFlex text-sm leading-7 text-gray-600 dark:text-gray-400">
                  The quick brown fox jumps over the lazy dog. Clear at small
                  sizes, confident at large ones, and friendly without trying
                  too hard.
                </p>
                <div className="mt-6 grid grid-cols-3 gap-2 border-t border-gray-100 pt-5 dark:border-white/10 sm:grid-cols-6">
                  {[
                    ["300", "font-light"],
                    ["400", "font-normal"],
                    ["500", "font-medium"],
                    ["600", "font-semibold"],
                    ["700", "font-bold"],
                    ["900", "font-black"],
                  ].map(([weight, className]) => (
                    <div key={weight} className="text-center">
                      <p
                        className={cx(
                          "font-googleSansFlex text-lg text-gray-900 dark:text-white",
                          className,
                        )}
                      >
                        Aa
                      </p>
                      <p className="mt-1 text-[9px] tabular-nums text-gray-400 dark:text-gray-600">
                        {weight}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="mt-auto pt-5 text-[11px] leading-5 text-gray-500 dark:text-gray-500">
                  Use for navigation, headings, body copy and interface labels.
                </p>
              </article>
            </Reveal>

            <Reveal delay={0.08}>
              <article className="flex h-full flex-col rounded-[1.75rem] border border-gray-200/80 bg-white/80 p-6 shadow-sm shadow-black/[0.03] backdrop-blur dark:border-white/10 dark:bg-gray-900/60 sm:p-8">
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-gray-900/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-600 dark:bg-white/10 dark:text-gray-300">
                    Editorial accent
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.14em] text-gray-400 dark:text-gray-600">
                    Display · Italic
                  </span>
                </div>
                <p className="mt-8 font-playfairDisplay text-6xl italic leading-none tracking-tight text-gray-900 dark:text-white sm:text-7xl">
                  Aa
                </p>
                <p className="mt-5 font-playfairDisplay text-xl italic text-gray-900 dark:text-white">
                  Playfair Display
                </p>
                <blockquote className="mt-6 border-l-2 border-brandColor/30 pl-4 font-playfairDisplay text-2xl italic leading-snug text-gray-700 dark:text-gray-300">
                  “Small tools. Big difference.”
                </blockquote>
                <div className="mt-6 grid grid-cols-3 gap-2 border-t border-gray-100 pt-5 dark:border-white/10">
                  {[
                    ["400", "font-normal"],
                    ["500", "font-medium"],
                    ["700", "font-bold"],
                  ].map(([weight, className]) => (
                    <div key={weight} className="text-center">
                      <p
                        className={cx(
                          "font-playfairDisplay text-2xl italic text-gray-900 dark:text-white",
                          className,
                        )}
                      >
                        Aa
                      </p>
                      <p className="mt-1 text-[9px] tabular-nums text-gray-400 dark:text-gray-600">
                        {weight}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="mt-auto pt-5 text-[11px] leading-5 text-gray-500 dark:text-gray-500">
                  Use for pull quotes, campaign lines and a single italic accent
                  in a heading.
                </p>
              </article>
            </Reveal>
          </div>

          <Reveal className="mt-4">
            <div className="flex flex-col gap-5 rounded-2xl border border-gray-200/80 bg-white/60 p-5 dark:border-white/10 dark:bg-white/[0.03] sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gray-900/5 text-gray-600 dark:bg-white/10 dark:text-gray-300">
                  <Type className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    The wordmark is artwork, not a font.
                  </p>
                  <p className="mt-1 max-w-xl text-xs leading-6 text-gray-500 dark:text-gray-400">
                    Please use the supplied vector files rather than retyping
                    the name. Recreating the letterforms will break the
                    spacing and weight of the brand.
                  </p>
                </div>
              </div>
              <Image
                src="/brand/toolstrek-logo-primary.svg"
                alt="ToolsTrek wordmark"
                width={384}
                height={78}
                unoptimized
                className="h-auto w-40 shrink-0 self-start sm:self-center"
              />
            </div>
          </Reveal>
        </section>

        {/* ------------------------------ Usage ----------------------------- */}
        <section
          id="usage"
          className="scroll-mt-32 border-t border-gray-200/70 pt-14 dark:border-white/10 sm:pt-16"
        >
          <Reveal>
            <SectionHeading
              index="04"
              eyebrow="Logo usage"
              title={
                <>
                  Keep it{" "}
                  <span className="font-playfairDisplay italic text-brandColor">
                    recognisable.
                  </span>
                </>
              }
              description="A few simple rules keep the brand consistent everywhere it appears. When in doubt, use the original file, keep the proportions, and give it room to breathe."
            />
          </Reveal>

          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            <Reveal>
              <article className="h-full rounded-[1.75rem] border border-gray-200/80 bg-white/80 p-6 shadow-sm shadow-black/[0.03] backdrop-blur dark:border-white/10 dark:bg-gray-900/60 sm:p-7">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-600 dark:text-emerald-400">
                  <CircleCheck className="size-3.5" />
                  Do
                </span>
                <h3 className="mt-5 text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
                  Keep the brand intact
                </h3>
                <ul className="mt-5 space-y-3.5">
                  {DOS.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-sm leading-6 text-gray-600 dark:text-gray-400"
                    >
                      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <Check className="size-3" strokeWidth={3} />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>

            <Reveal delay={0.08}>
              <article className="h-full rounded-[1.75rem] border border-gray-200/80 bg-white/80 p-6 shadow-sm shadow-black/[0.03] backdrop-blur dark:border-white/10 dark:bg-gray-900/60 sm:p-7">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
                  <X className="size-3.5" />
                  Don’t
                </span>
                <h3 className="mt-5 text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
                  Avoid these treatments
                </h3>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  {DONTS.map((item) => {
                    const Icon = item.icon;
                    const isLowContrast = item.lowContrast;

                    return (
                      <div
                        key={item.label}
                        className={cx(
                          "relative flex h-24 items-center justify-center overflow-hidden rounded-xl border p-4",
                          isLowContrast
                            ? "border-white/10 bg-[#09090b]"
                            : "border-gray-200/80 bg-[#f6f6f6] dark:border-white/10",
                        )}
                      >
                        <Image
                          src="/brand/toolstrek-logo-primary.svg"
                          alt=""
                          width={384}
                          height={78}
                          unoptimized
                          className={cx("h-auto w-[78%]", item.className)}
                          style={item.style}
                        />
                        <span
                          className={cx(
                            "absolute bottom-1.5 left-2 inline-flex items-center gap-1 text-[9px] font-medium",
                            isLowContrast
                              ? "text-white/50"
                              : "text-gray-500 dark:text-gray-400",
                          )}
                        >
                          <Icon className="size-2.5" />
                          {item.label}
                        </span>
                        <X className="absolute right-1.5 top-1.5 size-3 text-rose-500/70" />
                      </div>
                    );
                  })}
                </div>
              </article>
            </Reveal>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <Reveal>
              <article className="h-full rounded-2xl border border-gray-200/80 bg-white/80 p-5 dark:border-white/10 dark:bg-gray-900/60">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-gray-600">
                  Clear space
                </p>
                <div className="mt-4 flex items-center justify-center rounded-xl bg-[#f6f6f6] p-6 dark:bg-white/5">
                  <div className="border border-dashed border-brandColor/60 p-4">
                    <Image
                      src="/brand/toolstrek-logo-primary.svg"
                      alt="ToolsTrek logo clear space example"
                      width={384}
                      height={78}
                      unoptimized
                      className="h-auto w-28"
                    />
                  </div>
                </div>
                <p className="mt-4 text-xs leading-6 text-gray-500 dark:text-gray-400">
                  Keep at least the height of the “T” clear on every side.
                  Nothing should touch or crowd the lockup.
                </p>
              </article>
            </Reveal>

            <Reveal delay={0.06}>
              <article className="h-full rounded-2xl border border-gray-200/80 bg-white/80 p-5 dark:border-white/10 dark:bg-gray-900/60">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-gray-600">
                  Minimum size
                </p>
                <div className="mt-4 flex min-h-24 items-end justify-center gap-8 rounded-xl bg-[#f6f6f6] p-5 dark:bg-white/5">
                  <div className="text-center">
                    <Image
                      src="/brand/toolstrek-logo-primary.svg"
                      alt="ToolsTrek logo at minimum size"
                      width={384}
                      height={78}
                      unoptimized
                      className="h-auto w-[120px]"
                    />
                    <p className="mt-2 text-[9px] font-medium text-gray-500">
                      Logo · 120 px
                    </p>
                  </div>
                  <div className="text-center">
                    <Image
                      src="/brand/toolstrek-monogram.svg"
                      alt="ToolsTrek monogram at minimum size"
                      width={78}
                      height={78}
                      unoptimized
                      className="mx-auto w-6"
                    />
                    <p className="mt-2 text-[9px] font-medium text-gray-500">
                      Mark · 24 px
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-xs leading-6 text-gray-500 dark:text-gray-400">
                  120 px minimum for digital, 30 mm for print. Never shrink the
                  wordmark below either limit.
                </p>
              </article>
            </Reveal>

            <Reveal delay={0.12}>
              <article className="h-full rounded-2xl border border-gray-200/80 bg-white/80 p-5 dark:border-white/10 dark:bg-gray-900/60">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-gray-600">
                  Backgrounds
                </p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="flex h-24 items-center justify-center rounded-xl bg-[#f6f6f6] px-3">
                    <Image
                      src="/brand/toolstrek-logo-primary.svg"
                      alt="Primary logo on light background"
                      width={384}
                      height={78}
                      unoptimized
                      className="h-auto w-full"
                    />
                  </div>
                  <div className="flex h-24 items-center justify-center rounded-xl bg-[#09090b] px-3">
                    <Image
                      src="/brand/toolstrek-logo-reverse.svg"
                      alt="Reverse logo on dark background"
                      width={384}
                      height={78}
                      unoptimized
                      className="h-auto w-full"
                    />
                  </div>
                </div>
                <p className="mt-4 text-xs leading-6 text-gray-500 dark:text-gray-400">
                  Pair the primary logo with Paper or White, and the reverse
                  logo with Night. Skip busy photography behind either.
                </p>
              </article>
            </Reveal>
          </div>
        </section>

        {/* ---------------------------- Messaging --------------------------- */}
        <section
          id="messaging"
          className="scroll-mt-32 border-t border-gray-200/70 pt-14 dark:border-white/10 sm:pt-16"
        >
          <Reveal>
            <SectionHeading
              index="05"
              eyebrow="Brand voice"
              title={
                <>
                  Say it{" "}
                  <span className="font-playfairDisplay italic text-brandColor">
                    simply.
                  </span>
                </>
              }
              description="Clear, practical and calm. Describe what ToolsTrek does, who it helps and why it feels different — without hype or jargon."
            />
          </Reveal>

          <div className="mt-10 grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
            <Reveal>
              <article className="relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#09090b] p-6 text-white shadow-xl shadow-black/20 sm:p-8">
                <div
                  aria-hidden
                  className="absolute -right-16 -top-16 size-56 rounded-full bg-brandColor/20 blur-3xl"
                />
                <Image
                  src="/brand/toolstrek-monogram-white.svg"
                  alt=""
                  width={78}
                  height={78}
                  unoptimized
                  aria-hidden
                  className="pointer-events-none absolute -right-8 top-1/2 w-44 -translate-y-1/2 opacity-[0.045]"
                />
                <Quote className="relative size-7 text-brandColor" />
                <p className="relative mt-7 font-playfairDisplay text-3xl italic leading-tight sm:text-4xl">
                  {BRAND.tagline}
                </p>
                <p className="relative mt-5 max-w-sm text-sm leading-7 text-white/55">
                  The tagline is a promise, not a headline. Use it in
                  sentence case, with the full stop, and give it room.
                </p>
                <div className="relative mt-7">
                  <CopyButton
                    value={BRAND.tagline}
                    label="Tagline"
                    tone="green"
                    showLabel
                  />
                </div>
                <div className="relative mt-auto flex flex-wrap gap-2 pt-10">
                  {["Clear", "Practical", "Calm", "Human"].map((trait) => (
                    <span
                      key={trait}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-medium text-white/60"
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              </article>
            </Reveal>

            <div className="space-y-4">
              <Reveal delay={0.06}>
                <div className="rounded-2xl border border-gray-200/80 bg-white/80 p-5 dark:border-white/10 dark:bg-gray-900/60 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-gray-600">
                      One-liner
                    </p>
                    <CopyButton
                      value={SHORT_DESCRIPTION}
                      label="One-liner"
                      showLabel
                    />
                  </div>
                  <p className="mt-4 text-sm leading-7 text-gray-700 dark:text-gray-300 sm:text-base">
                    {SHORT_DESCRIPTION}
                  </p>
                </div>
              </Reveal>

              <Reveal delay={0.12}>
                <div className="rounded-2xl border border-gray-200/80 bg-white/80 p-5 dark:border-white/10 dark:bg-gray-900/60 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-gray-600">
                      Boilerplate
                    </p>
                    <CopyButton
                      value={BOILERPLATE}
                      label="Boilerplate"
                      showLabel
                    />
                  </div>
                  <p className="mt-4 text-sm leading-7 text-gray-700 dark:text-gray-300">
                    {BOILERPLATE}
                  </p>
                </div>
              </Reveal>

              <Reveal delay={0.18}>
                <div className="flex items-start gap-3 rounded-2xl border border-brandColor/15 bg-brandColor/[0.04] p-5">
                  <Heart className="mt-0.5 size-4 shrink-0 text-brandColor" />
                  <p className="text-xs leading-6 text-gray-600 dark:text-gray-400">
                    <strong className="font-semibold text-gray-900 dark:text-white">
                      A small ask:
                    </strong>{" "}
                    always link back to{" "}
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      toolstrek.vercel.app
                    </span>{" "}
                    when you mention the project, and spell the name as one
                    word with a capital T.
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ------------------------------ Press ----------------------------- */}
        <section
          id="press"
          className="mt-14 scroll-mt-32 border-t border-gray-200/70 pt-14 dark:border-white/10 sm:mt-16 sm:pt-16"
        >
          <Reveal>
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-linear-to-br from-gray-950 via-gray-900 to-brandColorHover px-6 py-10 text-white shadow-2xl shadow-brandColor/15 sm:px-10 sm:py-12 lg:px-12">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-size-[18px_18px] mask-[radial-gradient(ellipse_at_right,black_10%,transparent_70%)]"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-brandColor/30 blur-3xl"
              />
              <Image
                src="/brand/toolstrek-monogram-white.svg"
                alt=""
                width={78}
                height={78}
                unoptimized
                aria-hidden
                className="pointer-events-none absolute -bottom-10 -right-6 w-56 opacity-[0.06] sm:w-72"
              />

              <div className="relative grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-14">
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70">
                    <BadgeCheck className="size-3.5 text-brandColor" />
                    Press &amp; partnerships
                  </span>
                  <h2 className="mt-6 max-w-md text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                    Let’s get the details right.
                  </h2>
                  <p className="mt-4 max-w-md text-sm leading-7 text-white/60">
                    Writing about ToolsTrek, reviewing a tool, or building
                    something that references the brand? Use the kit above and
                    reach out if you need something custom.
                  </p>

                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <a
                      href={`mailto:${BRAND.email}?subject=ToolsTrek%20press%20enquiry`}
                      className="group inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-gray-900 shadow-lg shadow-black/20 transition-all duration-200 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                      <Mail className="size-4 text-brandColor" />
                      Email the creator
                      <ArrowUpRight className="size-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </a>
                    <DownloadButton
                      href={KIT_ZIP}
                      variant="ghostLight"
                      className="h-11"
                    >
                      <Download className="size-4" />
                      Download press kit
                    </DownloadButton>
                  </div>

                  <p className="mt-6 max-w-sm text-[11px] leading-5 text-white/35">
                    ToolsTrek is an independent, open-source project. For
                    commercial partnerships, merchandise or anything not covered
                    by the kit, please get in touch first.
                  </p>
                </div>

                <div className="space-y-2.5">
                  {CONTACT_ROWS.map((row) => {
                    const Icon = row.icon;

                    return (
                      <div
                        key={row.label}
                        className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3.5 transition-colors duration-200 hover:bg-white/[0.07]"
                      >
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white/70">
                          <Icon className="size-4" />
                        </span>
                        <a
                          href={row.href}
                          target={
                            row.href.startsWith("http") ? "_blank" : undefined
                          }
                          rel={
                            row.href.startsWith("http")
                              ? "noopener noreferrer"
                              : undefined
                          }
                          className="min-w-0 flex-1"
                        >
                          <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/40">
                            {row.label}
                          </p>
                          <p className="mt-0.5 truncate text-sm text-white/80 transition-colors duration-200 group-hover:text-white">
                            {row.value}
                          </p>
                        </a>
                        {row.copy ? (
                          <CopyButton
                            value={row.value}
                            label="Email address"
                            tone="dark"
                          />
                        ) : null}
                        <ExternalLink className="size-3.5 shrink-0 text-white/20 transition-colors duration-200 group-hover:text-white/60" />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Reveal>

          <div className="mt-6 flex flex-col gap-3 border-t border-gray-200/70 pt-6 text-[11px] text-gray-500 dark:border-white/10 dark:text-gray-500 sm:flex-row sm:items-center sm:justify-between">
            <p>
              Last updated October 2026 · ToolsTrek brand assets. Product
              screenshots and the name are the property of ToolsTrek.
            </p>
            <a
              href="#top"
              className="inline-flex w-fit items-center gap-1.5 transition-colors duration-200 hover:text-brandColor"
            >
              Back to top
              <ArrowUpRight className="size-3.5" />
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Colour card                                                               */
/* -------------------------------------------------------------------------- */

function ColorCard({ colour, isLight }) {
  const featured = Boolean(colour.featured);

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white/80 shadow-sm shadow-black/[0.03] backdrop-blur transition-all duration-300 hover:border-brandColor/25 hover:shadow-lg hover:shadow-brandColor/5 dark:border-white/10 dark:bg-gray-900/60">
      <div
        className={cx(
          "relative flex flex-1 flex-col justify-between overflow-hidden p-4 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)] sm:p-5 dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]",
          featured ? "min-h-48 sm:min-h-56" : "min-h-28",
        )}
        style={{ backgroundColor: colour.hex }}
      >
        {featured ? (
          <Image
            src="/brand/toolstrek-monogram-white.svg"
            alt=""
            width={78}
            height={78}
            unoptimized
            aria-hidden
            className="pointer-events-none absolute -bottom-8 -right-6 w-36 opacity-15"
          />
        ) : null}

        <div className="relative flex items-start justify-between gap-3">
          <p
            className={cx(
              "text-[9px] font-semibold uppercase tracking-[0.18em]",
              isLight ? "text-gray-500" : "text-white/60",
            )}
          >
            {colour.role}
          </p>
          <CopyButton
            value={colour.hex}
            label={`${colour.name} hex`}
            tone={isLight ? "onLight" : "dark"}
          />
        </div>

        {featured ? (
          <div className="relative flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-white/60">
                Primary
              </p>
              <p className="mt-1 font-mono text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                {colour.hex}
              </p>
            </div>
            <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[9px] font-medium text-white/75">
              3.2:1 on white
            </span>
          </div>
        ) : null}
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {colour.name}
          </p>
          <span className="font-mono text-[10px] text-gray-400 dark:text-gray-500">
            {colour.hex}
          </span>
        </div>
        <p className="mt-1 font-mono text-[10px] text-gray-400 dark:text-gray-600">
          RGB {colour.rgb}
        </p>
      </div>
    </div>
  );
}
