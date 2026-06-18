"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";

export default function FavoriteButton({ tool, className = "" }) {
  const { isFavorite, toggleFavorite } = useFavorites();

  if (!tool || !tool.link) return null;

  const slug = tool.link.split("/").pop();
  const favorited = isFavorite(slug);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(tool);
  };

  return (
    <button
      onClick={handleClick}
      type="button"
      className={`relative p-2.5 rounded-xl border transition-all duration-300 cursor-pointer flex items-center justify-center group/fav ${
        favorited
          ? "bg-amber-50 dark:bg-amber-500/20 border-amber-200 dark:border-amber-500/30 text-amber-500 hover:bg-amber-100 hover:border-amber-300"
          : "bg-white/80 dark:bg-white/20 border-gray-200 dark:border-gray-500 text-gray-400 hover:text-gray-600 hover:border-gray-300 hover:bg-white"
      } ${className}`}
      aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
    >
      <motion.div
        animate={
          favorited
            ? { scale: [1, 1.25, 1], rotate: [0, 15, -15, 0] }
            : { scale: 1 }
        }
        transition={{ duration: 0.4, ease: "easeInOut" }}
      >
        <Star
          className={`h-5 w-5 transition-colors duration-300 ${
            favorited
              ? "fill-amber-400 text-amber-500"
              : "text-gray-400 group-hover/fav:text-amber-500"
          }`}
        />
      </motion.div>
    </button>
  );
}
