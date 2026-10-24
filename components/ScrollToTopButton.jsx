"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

const SCROLL_THRESHOLD = 300;

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > SCROLL_THRESHOLD);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) return null;

  const scrollToTop = () => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Scroll back to top"
      title="Back to top"
      className="animate-fadeIn fixed right-3 bottom-4 z-40 flex size-11 items-center justify-center rounded-full bg-brandColor text-white shadow-lg shadow-brandColor/30 transition-all duration-200 hover:-translate-y-0.5 hover:bg-brandColorHover hover:shadow-xl focus-visible:ring-2 focus-visible:ring-brandColor focus-visible:ring-offset-2 focus-visible:outline-none print:hidden sm:right-5 sm:bottom-5"
    >
      <ArrowUp className="size-5" aria-hidden="true" />
    </button>
  );
}
