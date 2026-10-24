// components/MegaMenu.jsx
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { SplinePointer } from "lucide-react";
import { getIcon } from "./dynamicIcon";
import toolsData from "../../../lib/toolsData.json";

// Show only the 12 newest tools in the mega menu
const displayedTools = toolsData.toReversed().slice(0, 16);

export default function MegaMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false); // drives enter/exit animation
  const [position, setPosition] = useState({ top: 54, left: 0, width: 0 });

  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  /* ------------------------------ open / close ----------------------------- */

  const openMenu = () => {
    setIsOpen(true);
    setTimeout(() => setIsVisible(true), 10);
  };

  const closeMenu = () => {
    setIsVisible(false);
    setTimeout(() => setIsOpen(false), 200);
  };

  const toggleMenu = () => {
    if (isOpen) closeMenu();
    else openMenu();
  };

  /* ------------------------ keep position in sync -------------------------- */

  useEffect(() => {
    const updatePosition = () => {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setPosition({
          top: rect.bottom + 8,
          left: rect.left,
          width: rect.width,
        });
      }
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
    };
  }, []);

  /* ----------------------------- click outside ----------------------------- */

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        closeMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  /* ------------------------------- Escape key ------------------------------ */

  useEffect(() => {
    if (!isOpen) return;

    const handleEscKey = (event) => {
      if (event.key === "Escape") closeMenu();
    };

    document.addEventListener("keydown", handleEscKey);
    return () => document.removeEventListener("keydown", handleEscKey);
  }, [isOpen]);

  /* --------------------------------- render -------------------------------- */

  return (
    <div className="relative" suppressHydrationWarning>
      <button
        ref={buttonRef}
        onClick={toggleMenu}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="flex items-center gap-x-1 text-sm/6 font-semibold text-gray-900 dark:text-gray-100 outline-none hover:text-brandColor dark:hover:text-brandColor"
      >
        <SplinePointer className="size-5" /> All Tools
        <ChevronDownIcon
          aria-hidden="true"
          className={`size-5 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className="fixed left-0 right-0 z-20"
          style={{ top: `${position.top}px` }}
        >
          <div className="w-full mx-auto overflow-hidden">
            <div
              className={`bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden transition-all duration-200 ease-out transform origin-top p-3
                ${
                  isVisible
                    ? "opacity-100 scale-100 translate-y-0"
                    : "opacity-0 scale-95 -translate-y-2"
                }`}
            >
              {/* Tool grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ">
                {displayedTools.map((item, index) => {
                  const IconComponent = getIcon(item.icon);
                  return (
                    <Link
                      key={item.title}
                      href={item.link}
                      onClick={closeMenu}
                      className={`group relative flex items-start gap-x-4 p-3 transition-all hover:bg-brandColor/5 dark:hover:bg-brandColor/10 
                        ${
                          isVisible
                            ? "opacity-100 translate-x-0"
                            : "opacity-0 -translate-x-4"
                        }`}
                      style={{
                        transitionDelay: isVisible ? `${index * 30}ms` : "0ms",
                        transitionProperty: "opacity, transform",
                        transitionDuration: "200ms",
                      }}
                    >
                      <div className="flex size-10 flex-none items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-800 group-hover:bg-white dark:group-hover:bg-gray-700 shadow-sm transition-all duration-200 group-hover:scale-110">
                        <IconComponent className="size-5 text-gray-600 dark:text-gray-300 group-hover:text-brandColor transition-colors duration-200" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">
                          {item.title}
                        </div>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                          {item.description}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Footer: see all tools */}
              <div className="border-t border-gray-200 dark:border-gray-900 bg-white dark:bg-gray-950 px-6 py-4">
                <Link
                  href="/tools"
                  onClick={closeMenu}
                  className={`group flex items-center justify-between rounded-lg px-4 py-3 transition-all duration-200 hover:bg-brandColor/10
                    ${
                      isVisible
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-2"
                    }`}
                  style={{
                    transitionDelay: isVisible
                      ? `${displayedTools.length * 30}ms`
                      : "0ms",
                    transitionProperty: "opacity, transform",
                    transitionDuration: "200ms",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-brandColor/10 text-brandColor group-hover:bg-brandColor group-hover:text-white transition-all duration-200">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="size-5"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.25 2A2.25 2.25 0 0 0 2 4.25v11.5A2.25 2.25 0 0 0 4.25 18h11.5A2.25 2.25 0 0 0 18 15.75V4.25A2.25 2.25 0 0 0 15.75 2H4.25Zm9.47 4.72a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0l-2.5-2.5a.75.75 0 1 1 1.06-1.06l1.97 1.97 3.72-3.72a.75.75 0 0 1 1.06 0Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-brandColor transition-colors duration-200">
                        See All Tools
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        View all {toolsData.length - 1}+ available tools
                      </p>
                    </div>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="size-5 text-gray-400 group-hover:text-brandColor group-hover:translate-x-1 transition-all duration-200"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
