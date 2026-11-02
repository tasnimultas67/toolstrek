"use client";

import React, { useState, useMemo } from "react";
import { HelpCircle, Search, X } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import * as motion from "motion/react-client";
import faqs from "../data/faqs.json";
import toolsData from "@/lib/toolsData.json";

// Helper function to format section title
const formatSectionTitle = (sectionKey) => {
  const titleMap = {
    general: "General Questions",
    privacyAndSecurity: "Privacy & Security",
    healthAndWellness: "Health & Wellness Tools",
    developerTools: "Developer & Code Tools",
    networkAndDomain: "Network & Domain Tools",
    pdfTools: "PDF Management Tools",
    imageAndMedia: "Images, Media & Design Tools",
    mediaFormatConverter: "Media Format Converter (In-Browser)",
    metadataTools: "Metadata & Privacy Tools (View, Edit & Remove)",
    zipAndArchives: "ZIP File Creator & Compression",
    textAndLanguage: "Text & Language Utilities",
    financeAndBudget: "Finance & Budget Calculators",
    productivityAndEducation: "Productivity & Education Tools",
    qrAndSecurity: "QR Codes & Security Tools",
    funAndAstrology: "Fun & Astrology Tools",
    cssShadowTools: "CSS Box Shadow Generator",
    pieChartTools: "Pie & Donut Chart Generator",
    barChartTools: "Bar & Column Chart Generator",
    lineChartTools: "Line & Area Chart Generator",
    radarChartTools: "Radar & Spider Chart Generator",
    funnelChartTools: "Funnel & Conversion Chart Generator",
    polarChartTools: "Polar & Rose Chart Generator",
    visitedCountriesMap: "Visited Countries Map",
    ageOnOtherPlanets: "Age on Other Planets (Space Calculator)",
    dogCatAgeCalculator: "Dog & Cat Age Calculator",
    imageWatermark: "Image Watermark",
    collageMaker: "Collage Maker",
    imageEditor: "Image Editor & Filters",
    flightDurationCalculator: "Flight Duration Calculator",
    passportPhotoMaker: "Passport / ID Photo Maker",
    meetingTimePlanner: "Meeting Time Planner",
    fuelCostCalculator: "Fuel Cost & Road Trip Calculator",
    uuidUlidGenerator: "UUID / ULID Generator",
    pregnancyDueDateCalculator: "Pregnancy Due Date Calculator",
    imageCropper: "Image Cropper",
    invoiceGenerator: "Invoice Generator",
    urlEncoderDecoder: "URL Encoder & Decoder",
  };

  return (
    titleMap[sectionKey] ||
    sectionKey
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (value) => value.toUpperCase())
      .trim()
  );
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 15, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

// Shared premium pill styles for category filters
const pillBase =
  "group relative inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium cursor-pointer select-none transition-all duration-300 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandColor/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-950";
const pillActive =
  "bg-brandColor text-white border border-brandColor shadow-[0_8px_24px_-8px] shadow-brandColor/60 ring-1 ring-inset ring-white/25";
const pillIdle =
  "bg-white/70 dark:bg-white/[0.04] backdrop-blur-md text-gray-700 dark:text-gray-300 border border-gray-200/80 dark:border-white/10 shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 hover:border-brandColor/40 hover:bg-white dark:hover:bg-white/[0.08] hover:text-gray-950 dark:hover:text-white hover:shadow-[0_8px_20px_-10px] hover:shadow-brandColor/40";

const PillCount = ({ active, children }) => (
  <span
    className={`relative inline-flex min-w-[20px] items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none tabular-nums transition-colors duration-300 ${
      active
        ? "bg-white/20 text-white"
        : "bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 group-hover:bg-brandColor/10 group-hover:text-brandColor"
    }`}
  >
    {children}
  </span>
);

const ActiveGloss = () => (
  <span
    aria-hidden="true"
    className="pointer-events-none absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent"
  />
);

const FAQCon = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Raw sections mapped
  const rawSections = useMemo(() => {
    return Object.entries(faqs).map(([key, value]) => ({
      id: key,
      title: formatSectionTitle(key),
      faqs: value,
    }));
  }, []);

  // Total questions count
  const totalQuestions = useMemo(() => {
    return rawSections.reduce((sum, sec) => sum + sec.faqs.length, 0);
  }, [rawSections]);

  // Filtered sections based on category and search query
  const filteredSections = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return rawSections
      .filter((sec) => {
        if (selectedCategory === "all") return true;
        return sec.id === selectedCategory;
      })
      .map((sec) => {
        if (!q) return sec;
        const matchingFaqs = sec.faqs.filter(
          (faq) =>
            faq.question.toLowerCase().includes(q) ||
            faq.answer.toLowerCase().includes(q),
        );
        return {
          ...sec,
          faqs: matchingFaqs,
        };
      })
      .filter((sec) => sec.faqs.length > 0);
  }, [rawSections, searchQuery, selectedCategory]);

  const matchingQuestionsCount = useMemo(() => {
    return filteredSections.reduce((sum, sec) => sum + sec.faqs.length, 0);
  }, [filteredSections]);

  return (
    <div className="relative isolate overflow-hidden">
      {/* ───────── Premium grid background ───────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        {/* Grid lines (light) */}
        <div
          className="absolute inset-0 opacity-100 dark:opacity-0
            bg-[linear-gradient(to_right,rgba(15,23,42,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.06)_1px,transparent_1px)]
            bg-[size:44px_44px]
            [mask-image:radial-gradient(ellipse_75%_60%_at_50%_0%,#000_55%,transparent_100%)]"
        />
        {/* Grid lines (dark) */}
        <div
          className="absolute inset-0 opacity-0 dark:opacity-100
            bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)]
            bg-[size:44px_44px]
            [mask-image:radial-gradient(ellipse_75%_60%_at_50%_0%,#000_55%,transparent_100%)]"
        />
        {/* Soft top glow */}
        <div className="absolute left-1/2 top-0 h-[360px] w-[720px] -translate-x-1/2 rounded-full bg-brandColor/10 dark:bg-brandColor/15 blur-[120px]" />
      </div>

      <motion.div
        className="container w-11/12 max-w-5xl pb-16 pt-34 px-2 sm:px-4 m-auto"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Header Section */}
        <motion.header className="text-center mb-10" variants={itemVariants}>
          <div className="inline-flex items-center gap-2 bg-brandColor/10 text-brandColor dark:text-emerald-400 px-4 py-1.5 rounded-full mb-4 text-xs font-semibold tracking-wide">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>
              {toolsData.length} Tools Supported • {totalQuestions} Detailed
              Guides
            </span>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl mb-4 tracking-tight">
            Frequently Asked{" "}
            <span
              className="bg-linear-to-r from-brandColor via-emerald-500 to-brandColorHover bg-size-[200%_auto] animate-gradient-x bg-clip-text text-transparent font-playfairDisplay"
              style={{ fontStyle: "italic" }}
            >
              Questions
            </span>
          </h1>

          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            Everything you need to know about ToolsTrek, client-side privacy,
            and our {toolsData.length} free online utilities.
          </p>

          {/* Live Search Bar */}
          <div className="mt-8 max-w-xl mx-auto relative">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Search questions by keyword (e.g., PDF, Checkup, Privacy, Regex, Calendar, Notepad, Greeting, Bra size)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-10 py-3 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brandColor/40 focus:border-brandColor transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full transition-colors"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Pill Filters */}
          <div
            role="tablist"
            aria-label="FAQ categories"
            className="mt-5 flex flex-wrap items-center justify-center gap-2"
          >
            <button
              role="tab"
              aria-selected={selectedCategory === "all"}
              onClick={() => setSelectedCategory("all")}
              className={`${pillBase} ${
                selectedCategory === "all" ? pillActive : pillIdle
              }`}
            >
              {selectedCategory === "all" && <ActiveGloss />}
              <span className="relative">All Topics</span>
              <PillCount active={selectedCategory === "all"}>
                {totalQuestions}
              </PillCount>
            </button>
            {rawSections.map((sec) => {
              const isSelected = selectedCategory === sec.id;
              return (
                <button
                  key={sec.id}
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setSelectedCategory(sec.id)}
                  className={`${pillBase} ${isSelected ? pillActive : pillIdle}`}
                >
                  {isSelected && <ActiveGloss />}
                  <span className="relative">
                    {sec.title.replace(" Tools", "").replace(" Utilities", "")}
                  </span>
                  <PillCount active={isSelected}>{sec.faqs.length}</PillCount>
                </button>
              );
            })}
          </div>
        </motion.header>

        {/* Matching Query Feedback */}
        {searchQuery && (
          <div className="mb-6 flex items-center justify-between text-xs text-muted-foreground px-2">
            <span>
              Found <strong>{matchingQuestionsCount}</strong>{" "}
              {matchingQuestionsCount === 1 ? "answer" : "answers"} for &ldquo;
              {searchQuery}&rdquo;
            </span>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="text-brandColor hover:underline font-medium cursor-pointer"
            >
              Reset filters
            </button>
          </div>
        )}

        {/* Empty State */}
        {filteredSections.length === 0 && (
          <div className="text-center py-16 px-4 bg-white/70 dark:bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-dashed border-gray-200 dark:border-white/10">
            <HelpCircle className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              No matching questions found
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              We couldn&apos;t find any FAQs matching &ldquo;{searchQuery}
              &rdquo;. Try another search term or browse all categories.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="group relative inline-flex items-center gap-2 rounded-full bg-brandColor px-5 py-2 text-xs font-medium text-white border border-brandColor ring-1 ring-inset ring-white/25 shadow-[0_8px_24px_-8px] shadow-brandColor/60 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-8px] hover:shadow-brandColor/70 active:scale-[0.97] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandColor/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-950"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent"
              />
              View All FAQs
            </button>
          </div>
        )}

        {/* FAQ Sections */}
        <motion.div className="space-y-10" variants={containerVariants}>
          {filteredSections.map((section) => (
            <motion.section
              key={section.id}
              variants={itemVariants}
              className="bg-white/40 dark:bg-gray-900/40 p-4 sm:p-6 rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-xs"
            >
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3 mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  {section.title}
                </h2>
                <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-brandColor/10 text-brandColor dark:text-emerald-400">
                  {section.faqs.length}{" "}
                  {section.faqs.length === 1 ? "guide" : "guides"}
                </span>
              </div>

              <div className="space-y-3">
                {section.faqs.map((faq, index) => (
                  <Accordion
                    key={index}
                    type="single"
                    collapsible
                    className="w-full"
                  >
                    <AccordionItem
                      value={`item-${section.id}-${index}`}
                      className="border border-gray-200 dark:border-gray-800/80 rounded-xl px-4 bg-white dark:bg-gray-900 hover:border-brandColor/40 dark:hover:border-brandColor/40 transition-all duration-200 shadow-xs"
                    >
                      <AccordionTrigger className="text-left text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 hover:text-brandColor dark:hover:text-brandColor transition-colors py-4 cursor-pointer">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-600 dark:text-gray-300 leading-relaxed pb-4 text-sm sm:text-[15px]">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                ))}
              </div>
            </motion.section>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default FAQCon;
