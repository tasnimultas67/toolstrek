"use client";

import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Star, ArrowLeft, Compass } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import ToolsCard from "../tools-compo/ToolsCard";
import { useRecentTools } from "@/hooks/useRecentTools";
import { formatRelativeTime } from "@/lib/utils";
import SectionInfo from "../tools-compo/SectionInfo";

export default function FavoritesClient() {
  const { favorites } = useFavorites();
  const { recentTools } = useRecentTools();

  const recentToolsMap = useMemo(() => {
    const map = {};
    if (Array.isArray(recentTools)) {
      recentTools.forEach((t) => {
        if (t.link) map[t.link] = t.lastUsedAt;
      });
    }
    return map;
  }, [recentTools]);

  return (
    <div className="relative isolate min-h-screen overflow-hidden pt-20 md:pt-24 pb-20 text-gray-900 dark:text-white transition-colors duration-300">
      {/* ───────── Premium grid background ───────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        {/* Grid lines (light) */}
        <div
          className="absolute inset-0 opacity-100 dark:opacity-0
            bg-[linear-gradient(to_right,rgba(15,23,42,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.06)_1px,transparent_1px)]
            bg-[size:44px_44px]
            [mask-image:radial-gradient(ellipse_75%_60%_at_50%_0%,#000_55%,transparent_100%)]"
        />
        {/* Grid lines (dark) */}
        <div
          className="absolute inset-0 opacity-0 dark:opacity-100
            bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)]
            bg-[size:44px_44px]
            [mask-image:radial-gradient(ellipse_75%_60%_at_50%_0%,#000_55%,transparent_100%)]"
        />
        {/* Soft top glow */}
        <div className="absolute left-1/2 top-0 h-[360px] w-[720px] -translate-x-1/2 rounded-full bg-brandColor/10 dark:bg-brandColor/15 blur-[120px]" />
      </div>

      <div className="w-11/12 mx-auto max-w-7xl">
        {/* Navigation Breadcrumb */}
        <div className="mb-8">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 rounded-full border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] backdrop-blur-md px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-x-0.5 hover:border-brandColor/40 hover:bg-white dark:hover:bg-white/[0.08] hover:text-gray-950 dark:hover:text-white hover:shadow-[0_8px_20px_-10px] hover:shadow-brandColor/40 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandColor/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-950"
          >
            <ArrowLeft className="size-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
            Back to Home
          </Link>
        </div>

        {/* Header */}
        <div className="mb-12 w-full lg:w-7/12 mx-auto">
          <SectionInfo
            title="Saved Favorites"
            subtitle=" Your Favorite *Tools*."
            description="Quickly access your most-used online utilities. Everything is saved
            locally in your browser for instant load times and absolute privacy."
          />
        </div>

        {/* Content Section */}
        {favorites.length > 0 ? (
          <div>
            <div className="mb-6 flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-4">
              <span className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                Showing
                <span className="inline-flex min-w-[22px] items-center justify-center rounded-full bg-brandColor/10 px-1.5 py-0.5 text-[11px] font-semibold leading-none tabular-nums text-brandColor">
                  {favorites.length}
                </span>
                saved {favorites.length === 1 ? "tool" : "tools"}
              </span>
            </div>

            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              <AnimatePresence mode="popLayout">
                {favorites.map((tool, index) => (
                  <motion.div
                    key={tool.link || tool.title}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    transition={{ duration: 0.35, ease: "easeInOut" }}
                    className="h-full"
                  >
                    <ToolsCard
                      index={index}
                      {...tool}
                      lastUsed={formatRelativeTime(recentToolsMap[tool.link])}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </div>
        ) : (
          /* Premium Empty State */
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md mx-auto text-center py-16 px-6 bg-white/70 dark:bg-white/[0.04] backdrop-blur-xl border border-gray-200/80 dark:border-white/10 rounded-3xl shadow-xl mt-12 relative overflow-hidden"
          >
            {/* Visual background glow inside empty state card */}
            <div className="absolute -top-12 -left-12 w-36 h-36 bg-amber-100/40 dark:bg-amber-950/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-36 h-36 bg-brandColor/5 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center">
              <div className="mb-6 inline-flex items-center justify-center size-16 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/50 text-amber-500 shadow-sm animate-pulse">
                <Star className="size-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                No favorite tools yet.
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-8">
                Explore our catalog of developer, QR code, and productivity
                utilities. Click the star icon on any tool card to save it here
                for fast access.
              </p>
              <Link
                href="/tools"
                className="group relative inline-flex items-center gap-2 rounded-full bg-brandColor px-6 py-3 text-sm font-medium text-white border border-brandColor ring-1 ring-inset ring-white/25 shadow-[0_8px_24px_-8px] shadow-brandColor/60 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-8px] hover:shadow-brandColor/70 active:scale-[0.97] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandColor/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-950"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent"
                />
                <Compass className="size-4" /> Explore All Tools
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
