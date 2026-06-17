"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Star, ArrowLeft, Compass } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import ToolsCard from "../tools-compo/ToolsCard";

export default function FavoritesClient() {
  const { favorites } = useFavorites();

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 dark:from-gray-950 to-white dark:to-gray-900 pt-28 md:pt-32 pb-20 relative overflow-hidden">
      {/* Background Decorative Elements for Premium Aesthetics */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-30 pointer-events-none">
        <div className="absolute top-24 left-10 w-72 h-72 bg-brandColor/20 rounded-full blur-3xl" />
        <div className="absolute bottom-24 right-10 w-72 h-72 bg-indigo-200/20 rounded-full blur-3xl" />
      </div>

      <div className="w-11/12 mx-auto max-w-7xl">
        {/* Navigation Breadcrumb */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-brandColor dark:hover:text-brandColor transition-colors duration-200"
          >
            <ArrowLeft className="size-4" />
            Back to Home
          </Link>
        </div>

        {/* Header */}
        <div className="mb-12 text-center lg:text-left">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 mb-4 text-xs font-semibold tracking-wider text-amber-600 dark:text-amber-400 uppercase bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-full">
            <Star className="size-3.5 fill-amber-500 text-amber-500" /> Saved Favorites
          </span>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
            Your Favorite Tools
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
            Quickly access your most-used online utilities. Everything is saved
            locally in your browser for instant load times and absolute privacy.
          </p>
        </div>

        {/* Content Section */}
        {favorites.length > 0 ? (
          <div>
            <div className="mb-6 flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Showing {favorites.length} saved {favorites.length === 1 ? "tool" : "tools"}
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
                    <ToolsCard index={index} {...tool} />
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
            className="max-w-md mx-auto text-center py-16 px-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-gray-100 dark:border-gray-800 rounded-3xl shadow-xl mt-12 relative overflow-hidden"
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
                Explore our catalog of developer, QR code, and productivity utilities.
                Click the star icon on any tool card to save it here for fast access.
              </p>
              <Link
                href="/tools"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-brandColor hover:bg-brandColorHover rounded-xl shadow-md transition-all duration-200 hover:scale-105 cursor-pointer"
              >
                <Compass className="size-4" /> Explore All Tools
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
