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
    metadataTools: "Metadata Tools (View & Edit)",
    zipAndArchives: "ZIP File Creator & Compression",
    textAndLanguage: "Text & Language Utilities",
    financeAndBudget: "Finance & Budget Calculators",
    productivityAndEducation: "Productivity & Education Tools",
    qrAndSecurity: "QR Codes & Security Tools",
    funAndAstrology: "Fun & Astrology Tools",
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
            faq.answer.toLowerCase().includes(q)
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
          <span>92 Tools Supported • 68 Detailed Guides</span>
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
          Everything you need to know about ToolsTrek, client-side privacy, and our 92 free online utilities.
        </p>

        {/* Live Search Bar */}
        <div className="mt-8 max-w-xl mx-auto relative">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search questions by keyword (e.g., PDF, Checkup, Privacy, Regex, Bra size)..."
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
        <div className="mt-5 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedCategory === "all"
              ? "bg-brandColor text-white shadow-sm"
              : "bg-gray-100 dark:bg-gray-800/80 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
          >
            All Topics ({totalQuestions})
          </button>
          {rawSections.map((sec) => (
            <button
              key={sec.id}
              onClick={() => setSelectedCategory(sec.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedCategory === sec.id
                ? "bg-brandColor text-white shadow-sm"
                : "bg-gray-100 dark:bg-gray-800/80 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
            >
              {sec.title.replace(" Tools", "").replace(" Utilities", "")} ({sec.faqs.length})
            </button>
          ))}
        </div>
      </motion.header>

      {/* Matching Query Feedback */}
      {searchQuery && (
        <div className="mb-6 flex items-center justify-between text-xs text-muted-foreground px-2">
          <span>
            Found <strong>{matchingQuestionsCount}</strong> {matchingQuestionsCount === 1 ? "answer" : "answers"} for &ldquo;{searchQuery}&rdquo;
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
        <div className="text-center py-16 px-4 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
          <HelpCircle className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            No matching questions found
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            We couldn&apos;t find any FAQs matching &ldquo;{searchQuery}&rdquo;. Try another search term or browse all categories.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
            }}
            className="px-4 py-2 bg-brandColor text-white text-xs font-medium rounded-lg hover:bg-brandColorHover transition-colors"
          >
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
                {section.faqs.length} {section.faqs.length === 1 ? "guide" : "guides"}
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
  );
};

export default FAQCon;
