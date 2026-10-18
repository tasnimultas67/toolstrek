"use client";
import {
  createContext,
  useContext,
  useEffect,
  useSyncExternalStore,
} from "react";

const ThemeContext = createContext({
  theme: "light",
  toggleTheme: () => {},
});

const THEME_STORAGE_KEY = "theme";
const THEME_CHANGE_EVENT = "toolstrek:theme-change";

// Subscribe to both cross-tab (storage) and same-tab (custom event) changes
function subscribe(callback) {
  window.addEventListener("storage", callback);
  window.addEventListener(THEME_CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(THEME_CHANGE_EVENT, callback);
  };
}

// Read the persisted theme from localStorage as an external store source
function getSnapshot() {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  return stored === "dark" || stored === "light" ? stored : "light";
}

function getServerSnapshot() {
  return "light";
}

export default function ThemeProvider({ children }) {
  // Initialize theme from localStorage (default to light) without
  // setState-in-effect, using an external store backed by localStorage.
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Apply theme to the html element.
  // NOTE: do not write to localStorage here — this effect first runs with the
  // server snapshot ("light") during hydration, and writing that back would
  // clobber the persisted value before the external store reads it. Persisting
  // is handled by persistTheme() on explicit changes only.
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.dataset.theme = theme;
      document.documentElement.classList.toggle("dark", theme === "dark");
    }
  }, [theme]);

  // Keep write path centralized so the external store notifies subscribers
  function persistTheme(next) {
    localStorage.setItem(THEME_STORAGE_KEY, next);
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  }

  const toggleTheme = () => {
    persistTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
