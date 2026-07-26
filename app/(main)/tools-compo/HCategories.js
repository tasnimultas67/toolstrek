"use client";
import React, { useMemo } from "react";
import Link from "next/link";
import toolsData from "../../../lib/toolsData.json";
import { getIcon } from "./dynamicIcon";
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
  ChevronRight,
} from "lucide-react";

// Category metadata: icon, gradient colors, description
const categoryMeta = {
  Calculator: {
    Icon: Calculator,
    gradient: "from-blue-500 to-cyan-500",
    bg: "from-blue-500/10 to-cyan-500/10",
    border: "border-blue-500/20",
    text: "text-blue-600 dark:text-blue-400",
    description: "Number crunching & conversions",
  },
  PDF: {
    Icon: FileText,
    gradient: "from-red-500 to-orange-500",
    bg: "from-red-500/10 to-orange-500/10",
    border: "border-red-500/20",
    text: "text-red-600 dark:text-red-400",
    description: "Merge, split, convert & compress",
  },
  Image: {
    Icon: Image,
    gradient: "from-violet-500 to-purple-500",
    bg: "from-violet-500/10 to-purple-500/10",
    border: "border-violet-500/20",
    text: "text-violet-600 dark:text-violet-400",
    description: "Resize, convert & edit images",
  },
  Design: {
    Icon: Palette,
    gradient: "from-pink-500 to-rose-500",
    bg: "from-pink-500/10 to-rose-500/10",
    border: "border-pink-500/20",
    text: "text-pink-600 dark:text-pink-400",
    description: "Colors, gradients & design assets",
  },
  Developer: {
    Icon: Code2,
    gradient: "from-emerald-500 to-teal-500",
    bg: "from-emerald-500/10 to-teal-500/10",
    border: "border-emerald-500/20",
    text: "text-emerald-600 dark:text-emerald-400",
    description: "Dev utilities & inspection tools",
  },
  Productivity: {
    Icon: Zap,
    gradient: "from-amber-500 to-yellow-500",
    bg: "from-amber-500/10 to-yellow-500/10",
    border: "border-amber-500/20",
    text: "text-amber-600 dark:text-amber-400",
    description: "Boost your daily workflow",
  },
  Text: {
    Icon: Type,
    gradient: "from-indigo-500 to-blue-500",
    bg: "from-indigo-500/10 to-blue-500/10",
    border: "border-indigo-500/20",
    text: "text-indigo-600 dark:text-indigo-400",
    description: "Encode, decode & manipulate text",
  },
  "QR Code": {
    Icon: QrCode,
    gradient: "from-sky-500 to-blue-500",
    bg: "from-sky-500/10 to-blue-500/10",
    border: "border-sky-500/20",
    text: "text-sky-600 dark:text-sky-400",
    description: "Generate & scan QR codes",
  },
  Security: {
    Icon: ShieldCheck,
    gradient: "from-slate-600 to-gray-500",
    bg: "from-slate-500/10 to-gray-500/10",
    border: "border-slate-500/20",
    text: "text-slate-600 dark:text-slate-400",
    description: "Protect your passwords & data",
  },
  Education: {
    Icon: GraduationCap,
    gradient: "from-lime-500 to-green-500",
    bg: "from-lime-500/10 to-green-500/10",
    border: "border-lime-500/20",
    text: "text-lime-600 dark:text-lime-400",
    description: "Academic calculators & tools",
  },
  Finance: {
    Icon: DollarSign,
    gradient: "from-green-500 to-emerald-600",
    bg: "from-green-500/10 to-emerald-600/10",
    border: "border-green-500/20",
    text: "text-green-600 dark:text-green-400",
    description: "Budget, tax & financial tools",
  },
  Health: {
    Icon: Heart,
    gradient: "from-rose-500 to-red-500",
    bg: "from-rose-500/10 to-red-500/10",
    border: "border-rose-500/20",
    text: "text-rose-600 dark:text-rose-400",
    description: "Wellness & fitness calculators",
  },
  Fun: {
    Icon: Laugh,
    gradient: "from-fuchsia-500 to-pink-500",
    bg: "from-fuchsia-500/10 to-pink-500/10",
    border: "border-fuchsia-500/20",
    text: "text-fuchsia-600 dark:text-fuchsia-400",
    description: "Zodiac, compatibility & more",
  },
  Time: {
    Icon: Clock,
    gradient: "from-cyan-500 to-sky-500",
    bg: "from-cyan-500/10 to-sky-500/10",
    border: "border-cyan-500/20",
    text: "text-cyan-600 dark:text-cyan-400",
    description: "Timezone & time conversions",
  },
  Travel: {
    Icon: Plane,
    gradient: "from-orange-500 to-amber-500",
    bg: "from-orange-500/10 to-amber-500/10",
    border: "border-orange-500/20",
    text: "text-orange-600 dark:text-orange-400",
    description: "Trip planners & packing tools",
  },
  Media: {
    Icon: Film,
    gradient: "from-purple-500 to-violet-500",
    bg: "from-purple-500/10 to-violet-500/10",
    border: "border-purple-500/20",
    text: "text-purple-600 dark:text-purple-400",
    description: "GIFs, video & audio formats",
  },
};

// Category order (most popular / broad first)
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
  "Travel",
  "Fun",
  "Media",
];

const toSlug = (cat) => cat.toLowerCase().replace(/\s+/g, "-");

const HCategories = () => {
  // Count tools per category & collect a sample icon from each
  const categoryData = useMemo(() => {
    const map = {};
    toolsData.forEach((tool) => {
      const cats = Array.isArray(tool.categories)
        ? tool.categories
        : [tool.category || "General"];
      cats.forEach((cat) => {
        if (!map[cat]) map[cat] = { count: 0, sampleIcon: tool.icon };
        map[cat].count += 1;
      });
    });
    return map;
  }, []);

  const orderedCategories = CATEGORY_ORDER.filter((cat) => categoryData[cat]);

  return (
    <section className="relative py-20 px-2 overflow-hidden border-b border-gray-100 dark:border-gray-800">
      {/* Subtle background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brandColor/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-11/12 mx-auto">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <span className="inline-block px-4 py-1.5 mb-4 text-sm font-semibold tracking-wider text-brandColor uppercase bg-brandColor/10 rounded-full">
            Browse by Category
          </span>
          <h2 className="text-3xl lg:text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
            Find the Right Tool, Fast
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {orderedCategories.length} categories. One destination. Everything
            you need is just a click away.
          </p>
        </div>

        {/* 4-column grid of category cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {orderedCategories.map((cat) => {
            const meta = categoryMeta[cat];
            const data = categoryData[cat];
            if (!meta || !data) return null;

            const { Icon, gradient, bg, border, text, description } = meta;

            return (
              <Link
                key={cat}
                href={`/tools?category=${toSlug(cat)}`}
                className={`group relative flex flex-col gap-4 p-5 rounded-2xl bg-white dark:bg-gray-900 border ${border} dark:border-white/5 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/30`}
              >
                {/* Gradient orb on hover */}
                <div
                  className={`absolute -top-8 -right-8 w-28 h-28 bg-gradient-to-br ${gradient} rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-300 blur-2xl`}
                />

                {/* Icon */}
                <div
                  className={`relative inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${bg} border ${border} transition-transform duration-300 group-hover:scale-110`}
                >
                  <Icon
                    className={`w-5 h-5 ${text} transition-colors duration-300`}
                    strokeWidth={1.75}
                  />
                </div>

                {/* Text content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-base font-semibold tracking-tight text-gray-900 dark:text-white truncate group-hover:text-brandColor transition-colors duration-200">
                      {cat}
                    </h3>
                    <ChevronRight
                      className={`w-4 h-4 shrink-0 ${text} opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200`}
                    />
                  </div>
                  <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400 line-clamp-1 leading-relaxed">
                    {description}
                  </p>
                </div>

                {/* Tool count badge */}
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${bg} ${text} border ${border}`}
                  >
                    {data.count} {data.count === 1 ? "tool" : "tools"}
                  </span>
                  {/* <span className="text-[10px] text-gray-400 dark:text-gray-600 font-medium uppercase tracking-wider group-hover:text-brandColor transition-colors duration-200">
                    Explore →
                  </span> */}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-10 text-center">
          <Link
            href="/tools"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brandColor text-white text-sm font-semibold hover:bg-brandColorHover transition-all duration-200 hover:scale-105 shadow-md shadow-brandColor/20"
          >
            Browse All Tools
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HCategories;
