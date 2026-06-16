"use client";

import { useState, useEffect, useCallback } from "react";

export function useRecentTools() {
  const [recentTools, setRecentTools] = useState([]);

  useEffect(() => {
    // Initial fetch from localStorage (safe for SSR since it runs on client mount)
    const loadRecent = () => {
      if (typeof window !== "undefined") {
        try {
          const stored = localStorage.getItem("toolstrek_recent_tools");
          setRecentTools(stored ? JSON.parse(stored) : []);
        } catch (e) {
          console.error("Failed to parse recent tools from localStorage", e);
        }
      }
    };

    loadRecent();

    // Event listener for tab syncing (cross-tab)
    const handleStorage = (event) => {
      if (event.key === "toolstrek_recent_tools") {
        try {
          setRecentTools(event.newValue ? JSON.parse(event.newValue) : []);
        } catch (e) {
          console.error("Failed to parse synced recent tools", e);
        }
      }
    };

    // Event listener for same-page state syncing (same-tab, different hook instances)
    const handleCustomSync = () => {
      loadRecent();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("toolstrek-recent-updated", handleCustomSync);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("toolstrek-recent-updated", handleCustomSync);
    };
  }, []);

  const addRecentTool = useCallback((tool) => {
    if (!tool || !tool.link) return;

    let currentRecent = [];
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("toolstrek_recent_tools");
        currentRecent = stored ? JSON.parse(stored) : [];
      } catch (e) {
        console.error("Failed to read recent tools before adding", e);
      }
    }

    // Filter out if the tool already exists (to prevent duplicates and move to top)
    const filtered = currentRecent.filter((t) => t.link !== tool.link);

    // Create the updated tool object with the current timestamp
    const updatedTool = {
      ...tool,
      lastUsedAt: Date.now(),
    };

    // Prepend the new tool and limit to 10
    const updatedList = [updatedTool, ...filtered].slice(0, 10);

    setRecentTools(updatedList);

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("toolstrek_recent_tools", JSON.stringify(updatedList));
        // Notify other hook instances in the same tab
        window.dispatchEvent(new Event("toolstrek-recent-updated"));
      } catch (e) {
        console.error("Failed to save recent tools to localStorage", e);
      }
    }
  }, []);

  const clearRecentTools = useCallback(() => {
    setRecentTools([]);
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("toolstrek_recent_tools");
        // Notify other hook instances in the same tab
        window.dispatchEvent(new Event("toolstrek-recent-updated"));
      } catch (e) {
        console.error("Failed to clear recent tools from localStorage", e);
      }
    }
  }, []);

  return {
    recentTools,
    addRecentTool,
    clearRecentTools,
  };
}
