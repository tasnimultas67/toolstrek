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
      className={`relative p-2 rounded-xl border transition-all duration-300 cursor-pointer flex items-center justify-center group/fav ${
        favorited ? " text-amber-500" : "text-gray-400 hover:text-gray-600"
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
          className={`size-4 md:size-4.5 transition-colors duration-300 ${
            favorited
              ? "fill-amber-400 text-amber-500"
              : "text-gray-400 group-hover/fav:text-amber-500"
          }`}
        />
      </motion.div>
    </button>
  );
}
