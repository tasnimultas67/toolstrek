// components/Header.jsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Staatliches } from "next/font/google";
import {
  Dialog,
  DialogPanel,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import Link from "next/link";
import {
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { SplinePointer, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getIcon } from "./dynamicIcon";
import toolsData from "../../../lib/toolsData.json";

const staatliches = Staatliches({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-staatliches",
});

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [megaMenuAnimation, setMegaMenuAnimation] = useState(false);
  const megaMenuRef = useRef(null);
  const megaMenuButtonRef = useRef(null);
  const [megaMenuPosition, setMegaMenuPosition] = useState({
    top: 54,
    left: 0,
    width: 0,
  });

  // Search state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const searchRef = useRef(null);
  const searchButtonRef = useRef(null);
  const searchInputRef = useRef(null);

  // GitHub stars state
  const [starCount, setStarCount] = useState(null);
  const [isLoadingStars, setIsLoadingStars] = useState(true);

  // Show only first 8 tools in mega menu
  const displayedTools = toolsData.toReversed().slice(0, 8);

  // Update mega menu position on scroll or resize
  useEffect(() => {
    const updateMegaMenuPosition = () => {
      if (megaMenuButtonRef.current) {
        const rect = megaMenuButtonRef.current.getBoundingClientRect();
        setMegaMenuPosition({
          top: rect.bottom + 8, // 8px gap below button
          left: rect.left,
          width: rect.width,
        });
      }
    };

    updateMegaMenuPosition();
    window.addEventListener("resize", updateMegaMenuPosition);
    window.addEventListener("scroll", updateMegaMenuPosition);

    return () => {
      window.removeEventListener("resize", updateMegaMenuPosition);
      window.removeEventListener("scroll", updateMegaMenuPosition);
    };
  }, []);

  // Fetch GitHub stars
  useEffect(() => {
    const fetchGitHubStars = async () => {
      try {
        const response = await fetch(
          "https://api.github.com/repos/tasnimultas67/toolstrek",
        );
        if (response.ok) {
          const data = await response.json();
          setStarCount(data.stargazers_count);
        } else {
          console.error("Failed to fetch GitHub stars");
        }
      } catch (error) {
        console.error("Error fetching GitHub stars:", error);
      } finally {
        setIsLoadingStars(false);
      }
    };

    fetchGitHubStars();
  }, []);

  // Handle click outside for mega menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside the mega menu and outside the button that opens it
      if (
        isMegaMenuOpen &&
        megaMenuRef.current &&
        !megaMenuRef.current.contains(event.target) &&
        megaMenuButtonRef.current &&
        !megaMenuButtonRef.current.contains(event.target)
      ) {
        closeMegaMenu();
      }
    };

    // Add event listener when mega menu is open
    if (isMegaMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // Cleanup
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMegaMenuOpen]);

  // Handle click outside for search popover
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Only close if clicking outside both search popover and search button
      if (
        isSearchOpen &&
        searchRef.current &&
        !searchRef.current.contains(event.target) &&
        searchButtonRef.current &&
        !searchButtonRef.current.contains(event.target)
      ) {
        closeSearch();
      }
    };

    if (isSearchOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSearchOpen]);

  // Handle escape key for search
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape" && isSearchOpen) {
        closeSearch();
      }
    };

    if (isSearchOpen) {
      document.addEventListener("keydown", handleEscKey);
      // Focus input when search opens
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 50);
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isSearchOpen]);

  // Handle escape key to close mega menu
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape" && isMegaMenuOpen) {
        closeMegaMenu();
      }
    };

    if (isMegaMenuOpen) {
      document.addEventListener("keydown", handleEscKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isMegaMenuOpen]);

  // Search function
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const results = toolsData.filter((tool) => {
      return (
        tool.title.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query) ||
        (tool.category && tool.category.toLowerCase().includes(query))
      );
    });

    setSearchResults(results);
  }, [searchQuery]);

  const openMegaMenu = () => {
    setIsMegaMenuOpen(true);
    // Trigger animation after a tiny delay to ensure DOM is ready
    setTimeout(() => setMegaMenuAnimation(true), 10);
  };

  const closeMegaMenu = () => {
    setMegaMenuAnimation(false);
    // Wait for animation to complete before removing from DOM
    setTimeout(() => setIsMegaMenuOpen(false), 200);
  };

  const toggleMegaMenu = () => {
    if (isMegaMenuOpen) {
      closeMegaMenu();
    } else {
      openMegaMenu();
    }
  };

  const toggleSearch = () => {
    if (isSearchOpen) {
      closeSearch();
    } else {
      openSearch();
    }
  };

  const openSearch = () => {
    setIsSearchOpen(true);
    setSearchQuery("");
    setSearchResults([]);
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  // Format star count (e.g., 1000 -> 1k)
  const formatStarCount = (count) => {
    if (count === null) return null;
    if (count >= 1000000) return (count / 1000000).toFixed(1) + "M";
    if (count >= 1000) return (count / 1000).toFixed(1) + "k";
    return count.toString();
  };

  return (
    <div className="sticky top-2 z-50 w-full">
      {/* Container: 'relative' makes this the anchor for the Mega Menu width */}
      <div className="absolute top-0 left-0 right-0 border border-gray-900/10 bg-white/80 backdrop-blur-xl rounded-lg w-11/12 mx-auto px-2 py-2 shadow-md">
        <header className="w-full">
          <nav
            aria-label="Global"
            className="mx-auto flex items-center justify-between"
          >
            <div className="flex lg:flex-1">
              <Link href="/" className="flex items-center justify-start gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="25"
                  height="25"
                  className="size-6"
                >
                  <path
                    d="M 19 16 L 13 16 C 10.243 16 8 13.757 8 11 L 8 5 C 8 2.243 10.243 0 13 0 L 19 0 C 21.757 0 24 2.243 24 5 L 24 11 C 24 13.757 21.757 16 19 16 Z"
                    className="fill-brandColor"
                  />
                  <path
                    d="M 11 24 L 5 24 C 2.243 24 0 21.757 0 19 L 0 13 C 0 10.243 2.243 8 5 8 C 5.553 8 6 8.448 6 9 L 6 11 C 6 14.86 9.141 18 13 18 L 15 18 C 15.553 18 16 18.448 16 19 C 16 21.757 13.757 24 11 24 Z"
                    className="fill-brandColorHover"
                  />
                </svg>
                <h3 className={`text-3xl ${staatliches.className}`}>
                  Tools<span className="text-brandColor">Trek</span>
                </h3>
              </Link>
            </div>

            {/* Mobile Hamburger */}
            <div className="flex lg:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
              >
                <Bars3Icon aria-hidden="true" className="size-6" />
              </button>
            </div>

            {/* Desktop UI */}
            <div className="hidden lg:flex lg:flex-2 lg:justify-end items-center gap-x-8">
              <div className="flex gap-x-8 items-center">
                <div className="relative">
                  <button
                    ref={megaMenuButtonRef}
                    onClick={toggleMegaMenu}
                    className="flex items-center gap-x-1 text-sm/6 font-semibold text-gray-900 outline-none"
                  >
                    <SplinePointer className="size-5" /> Digital Solutions
                    <ChevronDownIcon
                      aria-hidden="true"
                      className={`size-5 transition-transform duration-200 ${isMegaMenuOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {/* Mega Menu - With Animations */}
                  {isMegaMenuOpen && (
                    <div
                      ref={megaMenuRef}
                      className="fixed left-0 right-0 z-20"
                      style={{ top: `${megaMenuPosition.top}px` }}
                    >
                      <div className="w-full mx-auto overflow-hidden">
                        <div
                          className={`bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-200 ease-out transform origin-top
                            ${
                              megaMenuAnimation
                                ? "opacity-100 scale-100 translate-y-0"
                                : "opacity-0 scale-95 -translate-y-2"
                            }`}
                        >
                          {/* Animated grid items */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {displayedTools.map((item, index) => {
                              const IconComponent = getIcon(item.icon);
                              return (
                                <Link
                                  key={item.title}
                                  href={item.link}
                                  onClick={() => closeMegaMenu()}
                                  className={`group relative flex items-start gap-x-4 p-6 transition-all hover:bg-brandColor/5 border-b border-r border-gray-100
                                    ${
                                      megaMenuAnimation
                                        ? "opacity-100 translate-x-0"
                                        : "opacity-0 -translate-x-4"
                                    }`}
                                  style={{
                                    transitionDelay: megaMenuAnimation
                                      ? `${index * 30}ms`
                                      : "0ms",
                                    transitionProperty: "opacity, transform",
                                    transitionDuration: "200ms",
                                  }}
                                >
                                  <div className="flex size-10 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white shadow-sm transition-all duration-200 group-hover:scale-110">
                                    <IconComponent className="size-5 text-gray-600 group-hover:text-brandColor transition-colors duration-200" />
                                  </div>
                                  <div>
                                    <div className="text-sm font-semibold text-gray-900 line-clamp-1">
                                      {item.title}
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                                      {item.description}
                                    </p>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>

                          {/* See All Tools Button */}
                          <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                            <Link
                              href="/tools"
                              onClick={() => closeMegaMenu()}
                              className={`group flex items-center justify-between rounded-lg px-4 py-3 transition-all duration-200 hover:bg-brandColor/10
                                ${
                                  megaMenuAnimation
                                    ? "opacity-100 translate-y-0"
                                    : "opacity-0 translate-y-2"
                                }`}
                              style={{
                                transitionDelay: megaMenuAnimation
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
                                  <div className="text-base font-semibold text-gray-900 group-hover:text-brandColor transition-colors duration-200">
                                    See All Tools
                                  </div>
                                  <p className="text-xs text-gray-500">
                                    View all {toolsData.length}+ available tools
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

                <Link
                  href="/about-us"
                  className="text-sm font-semibold text-gray-900"
                >
                  About
                </Link>
                <Link
                  href="/contact-us"
                  className="text-sm font-semibold text-gray-900"
                >
                  Contact Us
                </Link>
              </div>

              <div className="flex items-center gap-4 border-l border-gray-200 pl-8">
                {/* Search Icon */}
                <div className="relative">
                  <button
                    ref={searchButtonRef}
                    onClick={toggleSearch}
                    className={`p-2 transition-colors duration-200 rounded-full hover:bg-gray-100 ${
                      isSearchOpen
                        ? "text-brandColor bg-brandColor/10"
                        : "text-gray-600 hover:text-brandColor"
                    }`}
                    aria-label="Search tools"
                  >
                    <MagnifyingGlassIcon className="size-5" />
                  </button>

                  {/* Search Popover */}
                  {isSearchOpen && (
                    <div
                      ref={searchRef}
                      className="absolute right-0 mt-2.5 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-30 animate-in fade-in zoom-in-95 duration-200"
                    >
                      <div className="p-4">
                        <div className="relative">
                          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                          <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Search tools..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brandColor/20 focus:border-brandColor transition-all duration-200"
                          />
                          {searchQuery && (
                            <button
                              onClick={() => setSearchQuery("")}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              <XMarkIcon className="size-4" />
                            </button>
                          )}
                        </div>

                        {/* Search Results */}
                        <div className="mt-4 max-h-80 overflow-y-auto">
                          {searchQuery.trim() === "" ? (
                            <div className="text-center py-8">
                              <MagnifyingGlassIcon className="size-8 text-gray-300 mx-auto mb-2" />
                              <p className="text-sm text-gray-500">
                                Type to search for tools
                              </p>
                            </div>
                          ) : searchResults.length === 0 ? (
                            <div className="text-center py-8">
                              <p className="text-sm text-gray-500">
                                No tools found for &ldquo;{searchQuery}&rdquo;
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {searchResults.map((tool, index) => {
                                const IconComponent = getIcon(tool.icon);
                                return (
                                  <Link
                                    key={tool.title}
                                    href={tool.link}
                                    onClick={closeSearch}
                                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-all duration-200 group"
                                  >
                                    <div className="flex size-10 flex-none items-center justify-center rounded-lg bg-gray-100 group-hover:bg-brandColor/10 transition-colors duration-200">
                                      <IconComponent className="size-5 text-gray-600 group-hover:text-brandColor transition-colors duration-200" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="text-sm font-semibold text-gray-900 truncate">
                                        {tool.title}
                                      </div>
                                      <p className="text-xs text-gray-500 truncate">
                                        {tool.description}
                                      </p>
                                    </div>
                                  </Link>
                                );
                              })}
                              {searchResults.length > 0 && (
                                <div className="border-t border-gray-100 pt-2 mt-2">
                                  <Link
                                    href={`/tools?search=${encodeURIComponent(searchQuery)}`}
                                    onClick={closeSearch}
                                    className="block text-center text-sm text-brandColor hover:text-brandColorHover py-2 transition-colors duration-200"
                                  >
                                    View all {searchResults.length} results →
                                  </Link>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* GitHub Stars Button */}
                <a
                  href="https://github.com/tasnimultas67/toolstrek"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-50 rounded-full border border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition-all duration-200 hover:scale-105"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="size-4 text-gray-800"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Star</span>
                  {!isLoadingStars && starCount !== null && (
                    <span className="flex items-center gap-1">
                      <span className="text-gray-400">•</span>
                      <span className="font-mono text-xs font-semibold text-gray-700">
                        {formatStarCount(starCount)}
                      </span>
                    </span>
                  )}
                  {isLoadingStars && (
                    <div className="h-4 w-8 animate-pulse bg-gray-200 rounded"></div>
                  )}
                </a>

                <Link
                  href="https://forms.gle/BJXbXuQ3n2mwdHgx5"
                  target="_blank"
                >
                  <Button className="bg-brandColor hover:bg-brandColorHover text-sm! font-normal shadow-none flex items-center gap-2 transition-all duration-200 hover:scale-105 cursor-pointer">
                    <Star className="size-4" /> Request a Tool
                  </Button>
                </Link>
              </div>
            </div>
          </nav>
        </header>

        {/* Mobile Menu */}
        <Dialog
          open={mobileMenuOpen}
          onClose={setMobileMenuOpen}
          className="lg:hidden"
        >
          <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm transition-opacity duration-300" />
          <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm transform transition-transform duration-300 ease-out">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-1">
                <h3 className={`text-3xl ${staatliches.className}`}>
                  Tools<span className="text-brandColor">Trek</span>
                </h3>
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="-m-2.5 rounded-md p-2.5 text-gray-700 transition-colors duration-200 hover:bg-gray-100"
              >
                <XMarkIcon className="size-6" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-gray-500/10">
                <div className="space-y-2 py-6">
                  {/* Mobile Search */}
                  <div className="relative mb-4">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search tools..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brandColor/20 focus:border-brandColor text-sm"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <XMarkIcon className="size-4" />
                      </button>
                    )}
                  </div>

                  {/* Mobile Search Results */}
                  {searchQuery.trim() !== "" && (
                    <div className="mb-4 max-h-64 overflow-y-auto border border-gray-100 rounded-lg">
                      {searchResults.length === 0 ? (
                        <div className="text-center py-4">
                          <p className="text-sm text-gray-500">
                            No tools found
                          </p>
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-100">
                          {searchResults.slice(0, 5).map((tool) => {
                            const IconComponent = getIcon(tool.icon);
                            return (
                              <Link
                                key={tool.title}
                                href={tool.link}
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors duration-200"
                              >
                                <div className="flex size-8 flex-none items-center justify-center rounded-lg bg-gray-100">
                                  <IconComponent className="size-4 text-gray-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-semibold text-gray-900 truncate">
                                    {tool.title}
                                  </div>
                                </div>
                              </Link>
                            );
                          })}
                          {searchResults.length > 5 && (
                            <Link
                              href={`/tools?search=${encodeURIComponent(searchQuery)}`}
                              onClick={() => setMobileMenuOpen(false)}
                              className="block text-center text-sm text-brandColor py-2 hover:bg-gray-50"
                            >
                              +{searchResults.length - 5} more results →
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Mobile GitHub Stars Button */}
                  <a
                    href="https://github.com/tasnimultas67/toolstrek"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full mb-4 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-all duration-200"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="size-4 text-gray-800"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Star on GitHub</span>
                    {!isLoadingStars && starCount !== null && (
                      <span className="ml-1 text-xs font-semibold text-gray-600">
                        ({formatStarCount(starCount)})
                      </span>
                    )}
                  </a>

                  <Disclosure as="div" className="-mx-3">
                    {({ close, open }) => (
                      <>
                        <DisclosureButton className="group flex w-full items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base font-semibold text-gray-900 hover:bg-gray-50 transition-colors duration-200">
                          Digital Solutions
                          <ChevronDownIcon
                            className={`size-5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                          />
                        </DisclosureButton>
                        <DisclosurePanel className="mt-2 space-y-2 transition-all duration-200">
                          {toolsData
                            .slice(0, 6)
                            .reverse()
                            .map((item, index) => (
                              <Link
                                key={item.title}
                                href={item.link}
                                className="block rounded-lg py-2 pl-6 pr-3 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-all duration-200 hover:pl-8"
                                onClick={() => {
                                  close();
                                  setMobileMenuOpen(false);
                                }}
                              >
                                {item.title}
                              </Link>
                            ))}
                          {/* See All Tools link in mobile menu */}
                          <Link
                            href="/tools"
                            className="block rounded-lg py-2 pl-6 pr-3 text-sm font-semibold text-brandColor hover:bg-brandColor/10 transition-all duration-200 hover:pl-8"
                            onClick={() => {
                              close();
                              setMobileMenuOpen(false);
                            }}
                          >
                            See All Tools →
                          </Link>
                        </DisclosurePanel>
                      </>
                    )}
                  </Disclosure>
                  <Link
                    href="/about-us"
                    className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold text-gray-900 hover:bg-gray-50 transition-colors duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    About
                  </Link>
                  <Link
                    href="/contact-us"
                    className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold text-gray-900 hover:bg-gray-50 transition-colors duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Contact Us
                  </Link>
                </div>
                <div className="py-6">
                  <Link
                    href="https://forms.gle/BJXbXuQ3n2mwdHgx5"
                    target="_blank"
                  >
                    <Button className="w-full bg-brandColor hover:bg-brandColorHover transition-all duration-200 hover:scale-105 cursor-pointer">
                      Request a Tool
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </DialogPanel>
        </Dialog>
      </div>
    </div>
  );
}
