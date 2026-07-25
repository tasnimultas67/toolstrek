// components/ToolsCard.jsx
"use client";
import Link from "next/link";
import React from "react";
import { motion } from "framer-motion";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { getIcon } from "./dynamicIcon";
import FavoriteButton from "@/components/FavoriteButton";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

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
  const IconComponent = getIcon(icon);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Normalise to array
  const toolCategories = Array.isArray(categories)
    ? categories
    : [category || "General"];

  const handleCategoryClick = (e, cat) => {
    e.preventDefault();
    e.stopPropagation();
    const params = new URLSearchParams(searchParams.toString());
    params.set("category", toSlug(cat));
    // Always navigate to /tools page for category filter
    router.push(`/tools?${params.toString()}`);
  };

  return (
    <Link href={link} className="group relative" suppressHydrationWarning>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.08 }}
        className="h-full relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 group-hover:bg-white dark:group-hover:bg-gray-950 group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.2)] group-hover:-translate-y-1 hover:border-brandColor/40 dark:hover:border-brandColor/60 transitions-all duration-300"
      >
        {/* Card Content */}
        <div className="relative z-10 flex flex-col h-full space-y-2">
          <div className="p-5">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-300 transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
              {IconComponent && <IconComponent className="h-6 w-6" />}
            </div>
            {/* Card Content */}
            <div className="flex flex-col grow">
              <h3 className="text-xl tracking-tight font-semibold text-gray-900 dark:text-white mb-2">
                {title}
              </h3>

              {/* Category badges */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {toolCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={(e) => handleCategoryClick(e, cat)}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-brandColor/10 hover:text-brandColor dark:hover:text-brandColor transition-colors duration-150 cursor-pointer border border-transparent hover:border-brandColor/20"
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400 line-clamp-3">
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

          {/* Card Footer */}
          <div className="flex items-center justify-between px-5 py-1.5 mt-auto bg-[#e8e8e8] dark:bg-gray-800 border-t border-gray-200 dark:border-gray-800 transition-colors group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950">
            <div className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
              Get started
              <ArrowRightIcon className="ml-2 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </div>
            {/* Favorite Button */}
            <div className="">
              <FavoriteButton
                tool={{ title, link, description, icon, categories: toolCategories }}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default ToolsCard;
