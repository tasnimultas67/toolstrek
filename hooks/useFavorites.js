"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

export function useFavorites() {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    // Initial fetch from localStorage (safe for SSR since it runs on client mount)
    const loadFavorites = () => {
      if (typeof window !== "undefined") {
        try {
          const stored = localStorage.getItem("toolstrek-favorites");
          setFavorites(stored ? JSON.parse(stored) : []);
        } catch (e) {
          console.error("Failed to parse favorites from localStorage", e);
        }
      }
    };

    loadFavorites();

    // Event listener for tab syncing (cross-tab)
    const handleStorage = (event) => {
      if (event.key === "toolstrek-favorites") {
        try {
          setFavorites(event.newValue ? JSON.parse(event.newValue) : []);
        } catch (e) {
          console.error("Failed to parse synced favorites", e);
        }
      }
    };

    // Event listener for same-page state syncing (same-tab, different hook instances)
    const handleCustomSync = () => {
      loadFavorites();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("toolstrek-favorites-updated", handleCustomSync);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("toolstrek-favorites-updated", handleCustomSync);
    };
  }, []);

  const isFavorite = useCallback((slug) => {
    return favorites.some((tool) => {
      if (!tool || !tool.link) return false;
      const toolSlug = tool.link.split("/").pop();
      return toolSlug === slug || tool.link === slug || tool.title === slug;
    });
  }, [favorites]);

  const toggleFavorite = useCallback((tool) => {
    if (!tool || !tool.link) return;

    const toolSlug = tool.link.split("/").pop();
    let currentFavorites = [];

    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("toolstrek-favorites");
        currentFavorites = stored ? JSON.parse(stored) : [];
      } catch (e) {
        console.error("Failed to read favorites before toggle", e);
      }
    }

    const exists = currentFavorites.some((t) => {
      if (!t || !t.link) return false;
      const ts = t.link.split("/").pop();
      return ts === toolSlug || t.link === tool.link;
    });

    let updated;
    if (exists) {
      updated = currentFavorites.filter((t) => {
        if (!t || !t.link) return false;
        const ts = t.link.split("/").pop();
        return ts !== toolSlug && t.link !== tool.link;
      });
      toast("Removed from favorites");
    } else {
      updated = [...currentFavorites, tool];
      toast.success("Added to favorites");
    }

    setFavorites(updated);

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("toolstrek-favorites", JSON.stringify(updated));
        // Notify other hook instances in the same tab
        window.dispatchEvent(new Event("toolstrek-favorites-updated"));
      } catch (e) {
        console.error("Failed to save favorites to localStorage", e);
      }
    }
  }, []);

  return {
    favorites,
    isFavorite,
    toggleFavorite,
  };
}
