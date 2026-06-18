"use client";
import { Moon, SunDim } from "lucide-react";
import { useRef } from "react";
import { flushSync } from "react-dom";
import { cn } from "@/lib/utils";
import { useTheme } from "@/app/theme-context";

export const AnimatedThemeToggler = ({ className }) => {
  const { theme, toggleTheme } = useTheme();
  const buttonRef = useRef(null);
  const isDarkMode = theme === "dark";

  const changeTheme = async () => {
    if (!buttonRef.current) return;

    const newTheme = isDarkMode ? "light" : "dark";

    // Capture button position BEFORE anything changes
    const { top, left, width, height } =
      buttonRef.current.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    const right = window.innerWidth - left;
    const bottom = window.innerHeight - top;
    const maxRad = Math.hypot(Math.max(left, right), Math.max(top, bottom));

    // Fallback: no View Transitions API support
    if (!document.startViewTransition) {
      toggleTheme();
      return;
    }

    const transition = document.startViewTransition(() => {
      // Disable CSS transitions temporarily during snapshot capture
      document.documentElement.classList.add("no-transitions");

      // Apply class SYNCHRONOUSLY inside the transition callback so the
      // browser captures the correct "new" state before animating.
      document.documentElement.classList.toggle("dark", newTheme === "dark");
      document.documentElement.dataset.theme = newTheme;
      localStorage.setItem("theme", newTheme);

      // Keep React state in sync (triggers re-render for icon update)
      flushSync(() => {
        toggleTheme();
      });
    });

    try {
      // Wait for both pseudo-elements to be created
      await transition.ready;

      // Animate the new view expanding from the button position
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${maxRad}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 600,
          easing: "ease-in-out",
          pseudoElement: "::view-transition-new(root)",
        }
      );

      // Wait for the transition to finish before enabling CSS transitions again
      await transition.finished;
    } catch (err) {
      console.error("View transition animation failed:", err);
    } finally {
      // Always clean up and re-enable CSS transitions
      document.documentElement.classList.remove("no-transitions");
    }
  };

  return (
    <button
      ref={buttonRef}
      onClick={changeTheme}
      className={cn(className)}
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      suppressHydrationWarning
    >
      {isDarkMode ? (
        <SunDim
          key="sun"
          className="size-[1.2rem] xl:size-[1.3rem] animate-theme-icon"
        />
      ) : (
        <Moon
          key="moon"
          className="size-[1.2rem] xl:size-[1.3rem] animate-theme-icon"
        />
      )}
    </button>
  );
};
