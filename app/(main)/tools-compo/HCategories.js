"use client";
import React, { useMemo } from "react";
import Link from "next/link";
import toolsData from "../../../lib/toolsData.json";
import {
  Calculator,
  FileText,
  Image,
  Palette,
  Code2,
  Zap,
  Type,
  QrCode,
  ShieldCheck,
  GraduationCap,
  DollarSign,
  Heart,
  Laugh,
  Clock,
  Plane,
  Film,
  ArrowUpRight,
  ChevronRight,
} from "lucide-react";
import SectionInfo from "./SectionInfo";

/* -------------------------------------------------------------------------- */
/*  Category metadata (icon + description only; color is unified via accent)  */
/* -------------------------------------------------------------------------- */

const categoryMeta = {
  Calculator: {
    Icon: Calculator,
    description: "Number crunching & conversions",
  },
  PDF: { Icon: FileText, description: "Merge, split, convert & compress" },
  Image: { Icon: Image, description: "Resize, convert & edit images" },
  Design: { Icon: Palette, description: "Colors, gradients & design assets" },
  Developer: { Icon: Code2, description: "Dev utilities & inspection tools" },
  Productivity: { Icon: Zap, description: "Boost your daily workflow" },
  Text: { Icon: Type, description: "Encode, decode & manipulate text" },
  "QR Code": { Icon: QrCode, description: "Generate & scan QR codes" },
  Security: { Icon: ShieldCheck, description: "Protect your passwords & data" },
  Education: {
    Icon: GraduationCap,
    description: "Academic calculators & tools",
  },
  Finance: { Icon: DollarSign, description: "Budget, tax & financial tools" },
  Health: { Icon: Heart, description: "Wellness & fitness calculators" },
  Fun: { Icon: Laugh, description: "Space, zodiac & playful tools" },
  Time: { Icon: Clock, description: "Timezone & time conversions" },
  "Time & Date": {
    Icon: Clock,
    description: "Calendars, greetings & time zones",
  },
  Travel: { Icon: Plane, description: "Trip planners & packing tools" },
  Media: { Icon: Film, description: "GIFs, video & audio formats" },
};

// Most popular / broad first
const CATEGORY_ORDER = [
  "Productivity",
  "PDF",
  "Image",
  "Calculator",
  "Developer",
  "Text",
  "Design",
  "Finance",
  "QR Code",
  "Security",
  "Education",
  "Health",
  "Time",
  "Time & Date",
  "Travel",
  "Fun",
  "Media",
];

const toSlug = (cat) => cat.toLowerCase().replace(/\s+/g, "-");

/* -------------------------------------------------------------------------- */
/*  Section                                                                   */
/* -------------------------------------------------------------------------- */

const HCategories = () => {
  // Count tools per category
  const categoryData = useMemo(() => {
    const map = {};
    toolsData.forEach((tool) => {
      const rawCats = Array.isArray(tool.categories)
        ? tool.categories
        : [tool.category || "General"];
      new Set(rawCats.filter(Boolean)).forEach((cat) => {
        if (!map[cat]) map[cat] = { count: 0 };
        map[cat].count += 1;
      });
    });
    return map;
  }, []);

  const orderedCategories = CATEGORY_ORDER.filter(
    (cat) => categoryData[cat] && categoryMeta[cat],
  );

  return (
    <section className="relative isolate overflow-hidden border-b border-gray-100 py-16 dark:border-gray-800 sm:py-20">
      {/* Background glow + faint grid */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-120 w-205 -translate-x-1/2 rounded-full bg-brandColor/10 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(100,116,139,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(100,116,139,0.08)_1px,transparent_1px)] bg-size-[44px_44px] mask-[radial-gradient(ellipse_at_top,black_30%,transparent_75%)]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <SectionInfo
            title="Browse by Category"
            subtitle="Find the *Right Tool*, Fast"
            description={`${orderedCategories.length} categories. One destination. Everything you need is just a click away.`}
          />

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm">
            <span className="rounded-full border border-gray-200 bg-white/70 px-3.5 py-1.5 text-gray-700 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-gray-300">
              <strong className="font-semibold text-gray-900 dark:text-white">
                {toolsData.length}
              </strong>{" "}
              free tools
            </span>
            <span className="rounded-full border border-gray-200 bg-white/70 px-3.5 py-1.5 text-gray-700 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-gray-300">
              <strong className="font-semibold text-gray-900 dark:text-white">
                {orderedCategories.length}
              </strong>{" "}
              categories
            </span>
          </div>
        </div>

        {/* Category grid */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5">
          {orderedCategories.map((cat) => (
            <CategoryCard
              key={cat}
              cat={cat}
              meta={categoryMeta[cat]}
              count={categoryData[cat].count}
            />
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Link
            href="/tools"
            className="group inline-flex items-center gap-2 rounded-full bg-brandColor px-7 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-brandColorHover hover:shadow-brandColor/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brandColor"
          >
            Browse all tools
            <ChevronRight
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
              strokeWidth={2.5}
            />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HCategories;

/* -------------------------------------------------------------------------- */
/*  Compact card                                                              */
/* -------------------------------------------------------------------------- */

const CategoryCard = ({ cat, meta, count }) => {
  const { Icon } = meta;

  return (
    <Link
      href={`/tools?category=${toSlug(cat)}`}
      className="group relative flex items-center gap-3 overflow-hidden rounded-2xl border border-gray-200/80 bg-white/80 p-4 backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-brandColor/40 hover:shadow-lg hover:shadow-brandColor/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brandColor dark:border-white/10 dark:bg-gray-900/70"
    >
      {/* Hover spotlight */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-brandColor/15 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
      />

      <div className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-700 ring-1 ring-inset ring-gray-200 transition-all duration-300 group-hover:scale-105 group-hover:bg-brandColor/10 group-hover:text-brandColor group-hover:ring-brandColor/20 dark:bg-white/5 dark:text-gray-300 dark:ring-white/10">
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </div>

      <div className="relative min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold tracking-tight text-gray-900 dark:text-white sm:text-base">
          {cat}
        </h3>
        <span className="text-xs font-medium text-gray-500 transition-colors duration-300 group-hover:text-brandColor dark:text-gray-400">
          {count} {count === 1 ? "tool" : "tools"}
        </span>
      </div>

      <ArrowUpRight
        aria-hidden
        className="relative hidden h-4 w-4 shrink-0 text-gray-400 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brandColor group-hover:opacity-100 sm:block"
      />
    </Link>
  );
};
