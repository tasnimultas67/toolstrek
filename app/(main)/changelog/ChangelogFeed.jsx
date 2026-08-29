"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Search,
  Tag,
  Link2,
  Check,
  Calendar,
  ExternalLink,
  ShieldCheck,
  Wrench,
  Bug,
  PlusCircle,
  Zap,
  Filter,
  Layers,
  ArrowUpRight,
  GitBranch,
  ChevronDown,
  ChevronsUpDown,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { toast } from "sonner";
import { changelogData } from "@/lib/changelogData";

const CATEGORIES = [
  "All",
  "New Tools",
  "Features",
  "Improvements",
  "Security",
  "Fixes",
];

export default function ChangelogFeed() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [copiedVersion, setCopiedVersion] = useState(null);
  const [activeVersion, setActiveVersion] = useState(changelogData[0]?.version || "");

  // Collapsed / Expanded state per version: default latest version expanded, rest collapsed
  const [expandedVersions, setExpandedVersions] = useState(() => {
    const initialState = {};
    changelogData.forEach((r, idx) => {
      // By default expand the first/latest release, collapse earlier releases
      initialState[r.version] = idx === 0;
    });
    return initialState;
  });

  const toggleVersion = (version) => {
    setExpandedVersions((prev) => ({
      ...prev,
      [version]: !prev[version],
    }));
  };

  const expandAll = () => {
    const allExpanded = {};
    changelogData.forEach((r) => {
      allExpanded[r.version] = true;
    });
    setExpandedVersions(allExpanded);
  };

  const collapseAll = () => {
    const allCollapsed = {};
    changelogData.forEach((r) => {
      allCollapsed[r.version] = false;
    });
    setExpandedVersions(allCollapsed);
  };

  // Filter releases by category and search query
  const filteredReleases = useMemo(() => {
    return changelogData.filter((release) => {
      const matchesCategory =
        selectedCategory === "All" ||
        release.categories.includes(selectedCategory);

      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      const inTitle = release.title.toLowerCase().includes(q);
      const inVersion = release.version.toLowerCase().includes(q);
      const inSummary = release.summary.toLowerCase().includes(q);
      const inHighlights = release.highlights?.some(
        (h) =>
          h.title.toLowerCase().includes(q) ||
          h.description.toLowerCase().includes(q) ||
          h.tag.toLowerCase().includes(q)
      );
      const inChanges = release.changes?.some((group) =>
        group.items.some((item) => item.toLowerCase().includes(q))
      );

      return inTitle || inVersion || inSummary || inHighlights || inChanges;
    });
  }, [searchQuery, selectedCategory]);

  // If user searches, auto-expand matching releases
  useEffect(() => {
    if (searchQuery.trim()) {
      const searchExpanded = {};
      filteredReleases.forEach((r) => {
        searchExpanded[r.version] = true;
      });
      setExpandedVersions((prev) => ({ ...prev, ...searchExpanded }));
    }
  }, [searchQuery, filteredReleases]);

  // Track active version in viewport for TOC
  useEffect(() => {
    const handleScroll = () => {
      const sections = changelogData.map((r) =>
        document.getElementById(`release-${r.version}`)
      );
      const scrollPosition = window.scrollY + 220;

      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        if (section) {
          const top = section.offsetTop;
          const height = section.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveVersion(changelogData[i].version);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCopyLink = (version) => {
    const url = `${window.location.origin}/changelog#release-${version}`;
    navigator.clipboard.writeText(url);
    setCopiedVersion(version);
    toast.success(`Copied link to ${version}`, {
      description: "Direct anchor link copied to your clipboard.",
    });
    setTimeout(() => setCopiedVersion(null), 2000);
  };

  const getChangeTypeIcon = (type) => {
    switch (type.toLowerCase()) {
      case "added":
        return <PlusCircle className="size-4 text-emerald-500 shrink-0" />;
      case "improved":
        return <Zap className="size-4 text-amber-500 shrink-0" />;
      case "security":
        return <ShieldCheck className="size-4 text-indigo-500 shrink-0" />;
      case "fixed":
        return <Bug className="size-4 text-rose-500 shrink-0" />;
      default:
        return <Wrench className="size-4 text-brandColor shrink-0" />;
    }
  };

  const getChangeTypeBadge = (type) => {
    switch (type.toLowerCase()) {
      case "added":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "improved":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      case "security":
        return "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20";
      case "fixed":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
      default:
        return "bg-brandColor/10 text-brandColor border-brandColor/20";
    }
  };

  const isAllExpanded = Object.values(expandedVersions).every(Boolean);

  return (
    <div className="relative">
      {/* --- Filter & Search Controls Bar --- */}
      <div className="z-30 mb-10 bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-border/80 p-3 sm:p-4 rounded-2xl shadow-lg shadow-black/5 dark:shadow-black/20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search features, tools, fixes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-slate-950 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brandColor/50 focus:border-brandColor transition-all text-foreground placeholder:text-muted-foreground"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${selectedCategory === cat
                  ? "bg-brandColor text-white shadow-md shadow-brandColor/25"
                  : "bg-gray-100 dark:bg-slate-800 text-muted-foreground hover:text-foreground hover:bg-gray-200 dark:hover:bg-slate-700"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results & Global Collapse/Expand Toggle */}
        <div className="mt-3 pt-3 border-t border-border/50 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span>
              Showing{" "}
              <strong className="text-foreground font-semibold">
                {filteredReleases.length}
              </strong>{" "}
              {filteredReleases.length === 1 ? "release" : "releases"}
              {selectedCategory !== "All" && ` in ${selectedCategory}`}
            </span>
            {(searchQuery || selectedCategory !== "All") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                }}
                className="text-brandColor hover:underline font-medium cursor-pointer"
              >
                Reset filters
              </button>
            )}
          </div>

          {/* Expand / Collapse All Toggle Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={isAllExpanded ? collapseAll : expandAll}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-foreground text-xs font-medium transition-colors cursor-pointer"
            >
              {isAllExpanded ? (
                <>
                  <Minimize2 className="size-3 text-muted-foreground" />
                  <span>Collapse All</span>
                </>
              ) : (
                <>
                  <Maximize2 className="size-3 text-muted-foreground" />
                  <span>Expand All</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* --- Main Content Grid: Timeline + Desktop Sticky TOC --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left / Main Timeline (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          {filteredReleases.length === 0 ? (
            <div className="text-center py-20 px-6 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-border">
              <Layers className="size-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-1">No matching updates found</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">
                We couldn&apos;t find any releases matching &quot;{searchQuery}&quot; in{" "}
                {selectedCategory}.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                }}
                className="px-4 py-2 bg-brandColor text-white text-xs font-semibold rounded-xl hover:bg-brandColorHover transition-colors cursor-pointer"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            filteredReleases.map((release, releaseIdx) => {
              const isLatest = release.badge === "Latest Release" || releaseIdx === 0;
              const isExpanded = !!expandedVersions[release.version];

              // Count total items
              const totalHighlights = release.highlights?.length || 0;
              const totalChanges = release.changes?.reduce(
                (sum, grp) => sum + grp.items.length,
                0
              ) || 0;

              return (
                <motion.article
                  key={release.version}
                  id={`release-${release.version}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.4, delay: releaseIdx * 0.04 }}
                  className="relative group scroll-mt-36"
                >
                  {/* Timeline connecting line (desktop) */}
                  <div className="absolute left-4 top-14 bottom-0 w-px bg-linear-to-b from-brandColor/40 via-border to-transparent hidden md:block" />

                  {/* Card Container */}
                  <div className="bg-white dark:bg-slate-900 border border-border hover:border-brandColor/40 rounded-3xl p-6 sm:p-8 shadow-sm transition-all duration-300 relative overflow-hidden">
                    {/* Glowing highlight ribbon for Latest */}
                    {isLatest && (
                      <div className="absolute top-0 right-0 left-0 h-1 bg-linear-to-r from-brandColor via-purple-500 to-indigo-500" />
                    )}

                    {/* Top Header Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                      {/* Version & Badges */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-lg sm:text-xl font-bold text-foreground">
                            {release.version}
                          </span>
                          {release.badge && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              <Sparkles className="size-3" />
                              {release.badge}
                            </span>
                          )}
                          <span
                            className={`text-[11px] font-medium uppercase px-2 py-0.5 rounded-md border ${release.type === "major"
                              ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
                              : "bg-gray-100 dark:bg-slate-800 text-muted-foreground border-border"
                              }`}
                          >
                            {release.type}
                          </span>
                        </div>
                      </div>

                      {/* Date & Copy Link */}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="size-3.5" />
                          <time dateTime={release.isoDate}>{release.date}</time>
                        </div>
                        <button
                          onClick={() => handleCopyLink(release.version)}
                          aria-label={`Copy link to ${release.version}`}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Copy anchor link"
                        >
                          {copiedVersion === release.version ? (
                            <Check className="size-4 text-emerald-500" />
                          ) : (
                            <Link2 className="size-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Release Headline Title */}
                    <h2
                      onClick={() => toggleVersion(release.version)}
                      className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mb-3 leading-snug cursor-pointer hover:text-brandColor transition-colors flex items-start justify-between gap-3"
                    >
                      <span>{release.title}</span>
                    </h2>

                    {/* Executive Summary */}
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-5">
                      {release.summary}
                    </p>

                    {/* Category Tags & Collapsible Action Header */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 pb-1">
                      <div className="flex flex-wrap gap-1.5">
                        {release.categories.map((cat) => (
                          <span
                            key={cat}
                            className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-slate-800 text-muted-foreground"
                          >
                            <Tag className="size-2.5" />
                            {cat}
                          </span>
                        ))}
                      </div>

                      {/* Expand / Collapse Button */}
                      <button
                        onClick={() => toggleVersion(release.version)}
                        className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${isExpanded
                          ? "bg-brandColor/10 text-brandColor hover:bg-brandColor/20"
                          : "bg-gray-100 dark:bg-slate-800 text-foreground hover:bg-brandColor hover:text-white"
                          }`}
                      >
                        <span>
                          {isExpanded
                            ? "Hide details"
                            : `Show details (${totalHighlights} highlights, ${totalChanges} changes)`}
                        </span>
                        <ChevronDown
                          className={`size-3.5 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""
                            }`}
                        />
                      </button>
                    </div>

                    {/* Collapsible Content Section */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          key={`content-${release.version}`}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.35, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="pt-6 border-t border-border/60 mt-4 space-y-6">
                            {/* Feature Highlights Grid */}
                            {release.highlights && release.highlights.length > 0 && (
                              <div>
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                                  <Sparkles className="size-3.5 text-brandColor" /> Major Highlights
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {release.highlights.map((highlight) => (
                                    <Link
                                      key={highlight.title}
                                      href={highlight.link}
                                      className="group/item p-4 rounded-2xl bg-gray-50 dark:bg-slate-950 border border-border hover:border-brandColor/40 transition-all duration-200 flex flex-col justify-between"
                                    >
                                      <div>
                                        <div className="flex items-center justify-between mb-1.5">
                                          <span className="text-xs font-semibold text-brandColor">
                                            {highlight.tag}
                                          </span>
                                          <ArrowUpRight className="size-3.5 text-muted-foreground group-hover/item:text-brandColor group-hover/item:translate-x-0.5 group-hover/item:-translate-y-0.5 transition-all" />
                                        </div>
                                        <h5 className="text-sm font-semibold text-foreground group-hover/item:text-brandColor transition-colors">
                                          {highlight.title}
                                        </h5>
                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-3 leading-relaxed">
                                          {highlight.description}
                                        </p>
                                      </div>
                                      <span className="text-[11px] font-medium text-brandColor mt-3 inline-flex items-center gap-1">
                                        Launch tool <ArrowUpRight className="size-3" />
                                      </span>
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Detailed Change Log Items */}
                            {release.changes && release.changes.length > 0 && (
                              <div className="space-y-4 pt-2">
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                  <Wrench className="size-3.5 text-brandColor" /> What Changed
                                </h4>
                                {release.changes.map((group) => (
                                  <div key={group.type} className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      <span
                                        className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getChangeTypeBadge(
                                          group.type
                                        )}`}
                                      >
                                        {group.type}
                                      </span>
                                    </div>
                                    <ul className="space-y-1.5 pl-1">
                                      {group.items.map((item, idx) => (
                                        <li
                                          key={idx}
                                          className="text-xs sm:text-sm text-muted-foreground flex items-start gap-2 leading-relaxed"
                                        >
                                          <span className="mt-1">
                                            {getChangeTypeIcon(group.type)}
                                          </span>
                                          <span>{item}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.article>
              );
            })
          )}
        </div>

        {/* Right / Sticky Desktop Sidebar (Only on large screens: lg:block, sticky, self-start) */}
        <aside className="hidden lg:block lg:col-span-4 lg:sticky lg:top-24 self-start space-y-6 ">
          {/* Table of Contents Card */}
          <div className="bg-white dark:bg-slate-900 border border-border rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <GitBranch className="size-4 text-brandColor" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                  Release History
                </h3>
              </div>
              <span className="text-[11px] font-mono text-muted-foreground">
                {changelogData.length} releases
              </span>
            </div>
            <nav className="space-y-1">
              {changelogData.map((item) => {
                const isActive = activeVersion === item.version;
                return (
                  <a
                    key={item.version}
                    href={`#release-${item.version}`}
                    onClick={() => {
                      // Automatically expand target version when clicked from sidebar
                      setExpandedVersions((prev) => ({
                        ...prev,
                        [item.version]: true,
                      }));
                    }}
                    className={`flex items-center justify-between p-2.5 rounded-xl text-xs transition-all ${isActive
                      ? "bg-brandColor/10 text-brandColor font-semibold border-l-2 border-brandColor pl-3"
                      : "text-muted-foreground hover:text-foreground hover:bg-gray-50 dark:hover:bg-slate-800"
                      }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-mono font-semibold">{item.version}</span>
                      <span className="truncate text-muted-foreground font-normal">
                        {item.title.split(",")[0]}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                      {item.date.split(" ")[0]}
                    </span>
                  </a>
                );
              })}
            </nav>
          </div>

          {/* Quick Subscribe & GitHub Card */}
          <div className="bg-linear-to-br from-brandColor/10 via-purple-500/5 to-transparent border border-brandColor/20 rounded-3xl p-6">
            <h4 className="text-sm font-bold text-foreground mb-1">
              Stay in the Loop
            </h4>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
              We ship new tools, privacy upgrades, and performance enhancements
              regularly. Follow our open-source journey.
            </p>
            <div className="space-y-2.5">
              <Link
                href="https://github.com/tasnimultas67/toolstrek"
                target="_blank"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-foreground text-background text-xs font-semibold hover:opacity-90 transition-opacity"
              >
                ⭐ Star ToolsTrek on GitHub
              </Link>
              <Link
                href="mailto:contact.toolstrek@gmail.com?subject=Feature%20Request%20for%20ToolsTrek"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white dark:bg-slate-800 border border-border text-foreground text-xs font-semibold hover:border-brandColor transition-colors"
              >
                💡 Submit a Feature Request
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
