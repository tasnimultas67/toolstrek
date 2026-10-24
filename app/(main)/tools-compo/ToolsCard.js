// components/ToolsCard.jsx
"use client";
import Link from "next/link";
import React from "react";
import { motion } from "framer-motion";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { iconMap } from "./dynamicIcon";
import FavoriteButton from "@/components/FavoriteButton";
import { useRouter, useSearchParams } from "next/navigation";

// Helper: category name → URL slug
const toSlug = (cat) => cat.toLowerCase().replace(/\s+/g, "-");

const ToolsCard = ({
  title,
  link,
  description,
  icon,
  categories,
  category, // backward-compat fallback
  lastUsed,
  index,
}) => {
  const IconComponent = iconMap[icon];
  const router = useRouter();
  const searchParams = useSearchParams();

  // Normalise to array and deduplicate
  const toolCategories = Array.isArray(categories)
    ? [...new Set(categories.filter(Boolean))]
    : [category || "General"];

  const handleCategoryClick = (e, cat) => {
    e.preventDefault();
    e.stopPropagation();
    const params = new URLSearchParams(searchParams.toString());
    params.set("category", toSlug(cat));
    router.push(`/tools?${params.toString()}`);
  };

  return (
    // Raise the whole hovered card above its neighbours
    <Link
      href={link}
      className="group relative block hover:z-[9999] focus-within:z-[9999]"
      suppressHydrationWarning
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.08 }}
        className="h-full relative overflow-hidden rounded-2xl group-hover:rounded-b-none group-focus-within:rounded-b-none border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 group-hover:bg-white dark:group-hover:bg-gray-950 group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)] group-hover:-translate-y-1 group-hover:border-brandColor/40 dark:group-hover:border-brandColor/60 group-focus-within:border-brandColor/40 dark:group-focus-within:border-brandColor/60 group-hover:border-b-transparent group-focus-within:border-b-transparent transition-all duration-300"
      >
        <div className="relative z-10 flex flex-col h-full">
          <div className="p-4.5">
            {/* Header */}
            <div className="flex items-start justify-start gap-2">
              {/* Icon */}
              <div className="mb-4 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brandColor/15 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-300 transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                {IconComponent && <IconComponent className="h-5 w-5" />}
              </div>

              {/* Title Information */}
              <div>
                <h3 className="text-lg tracking-tight leading-tight font-semibold text-gray-900 dark:text-white">
                  {title}
                </h3>

                {/* Category list (max 2, comma separated, +N for the rest) */}
                <div className="flex flex-wrap items-center gap-x-1 mb-2">
                  {toolCategories.slice(0, 2).map((cat, i, arr) => {
                    const hasMore = toolCategories.length > 2;
                    const showComma = i < arr.length - 1 || hasMore;

                    return (
                      <span key={cat} className="inline-flex items-center">
                        <button
                          onClick={(e) => handleCategoryClick(e, cat)}
                          className="inline-flex items-center text-[11px] font-medium text-gray-500 dark:text-gray-400 hover:text-brandColor dark:hover:text-brandColor transition-colors duration-150 cursor-pointer"
                        >
                          {cat}
                        </button>
                        {showComma && (
                          <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500">
                            ,
                          </span>
                        )}
                      </span>
                    );
                  })}

                  {toolCategories.length > 2 && (
                    <span
                      title={toolCategories.slice(2).join(", ")}
                      className="inline-flex items-center text-[11px] font-medium text-gray-400 dark:text-gray-500"
                    >
                      +{toolCategories.length - 2}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col grow">
              <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400 line-clamp-2">
                {description}
              </p>
              {lastUsed && (
                <span className="text-xs text-brandColor mt-2.5 font-medium flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-brandColor/80 animate-pulse" />
                  {lastUsed}
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/*
        Card Footer: sits OUTSIDE the card (below it), so it overlays the
        card underneath. It slides down using an animated clip-path, which
        also lets the shadow spill out on the sides and bottom.
      */}
      <div
        className="
          pointer-events-none absolute inset-x-0 top-full -mt-1 z-[9999]
          [clip-path:inset(0_-40px_100%_-40px)]
          group-hover:pointer-events-auto group-hover:[clip-path:inset(0_-40px_-60px_-40px)]
          group-focus-within:pointer-events-auto group-focus-within:[clip-path:inset(0_-40px_-60px_-40px)]
          transition-[clip-path] duration-300 ease-out
        "
      >
        <div
          className="
            flex items-center justify-between px-5 py-1.5
            rounded-b-2xl border border-t-0 border-brandColor/40 dark:border-brandColor/60
            bg-indigo-50 dark:bg-indigo-950
            shadow-[0_20px_40px_rgba(0,0,0,0.18)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.6)]
            -translate-y-full group-hover:translate-y-0 group-focus-within:translate-y-0
            transition-transform duration-300 ease-out
          "
        >
          <div className="flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400">
            Get started
            <ArrowRightIcon className="ml-2 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </div>

          {/* Favorite Button */}
          <FavoriteButton
            tool={{
              title,
              link,
              description,
              icon,
              categories: toolCategories,
            }}
          />
        </div>
      </div>
    </Link>
  );
};

export default ToolsCard;
