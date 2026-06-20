"use client";
import React, { useState, useMemo } from "react";
import toolsData from "../../../lib/toolsData.json";
import ToolsCard from "./ToolsCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ParentTools = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  // Extract unique categories from tools data
  const categories = useMemo(() => {
    const cats = new Set(toolsData.map((tool) => tool.category || "General"));
    return ["all", ...Array.from(cats).sort()];
  }, []);

  // Filter tools based on search term and category
  const filteredTools = useMemo(() => {
    let filtered = [...toolsData];

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (tool) => (tool.category || "General") === selectedCategory,
      );
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (tool) =>
          tool.title.toLowerCase().includes(term) ||
          tool.description.toLowerCase().includes(term),
      );
    }

    return filtered;
  }, [searchTerm, selectedCategory]);

  const totalPages = Math.ceil(filteredTools.length / ITEMS_PER_PAGE);
  const activePage = Math.min(currentPage, totalPages || 1);

  const paginatedTools = useMemo(() => {
    const startIndex = (activePage - 1) * ITEMS_PER_PAGE;
    return filteredTools.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredTools, activePage]);

  const startIndex = (activePage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredTools.length);

  // Generate page numbers with ellipses for modern feel
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always include 1
      pages.push(1);

      const start = Math.max(2, activePage - 1);
      const end = Math.min(totalPages - 1, activePage + 1);

      if (start > 2) {
        pages.push("...");
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push("...");
      }

      // Always include last page
      pages.push(totalPages);
    }
    return pages;
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Get category counts
  const getCategoryCount = (category) => {
    if (category === "all") return toolsData.length;
    return toolsData.filter((tool) => (tool.category || "General") === category)
      .length;
  };

  return (
    <div
      className="bg-white dark:bg-gray-950 py-26 px-2 text-gray-900 dark:text-white transition-colors duration-300"
      id="tools"
    >
      <div className="w-11/12 mx-auto relative">
        <div className="mb-10 md:mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Powerful simple tools
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Everything you need to stay productive, all in one place.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap w-fit gap-2 md:sticky top-18 z-30 p-2 bg-white/20 dark:bg-white/10 backdrop-blur-xl rounded-md mt-4 mb-6 border border-gray-200 dark:border-white/10">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => {
                setSelectedCategory(category);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 border cursor-pointer ${
                selectedCategory === category
                  ? "bg-brandColor text-white border-brandColor"
                  : "bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 border-gray-300 dark:border-gray-800"
              }`}
            >
              {category === "all" ? "All Tools" : category}
              <span
                className={`ml-2 text-xs ${
                  selectedCategory === category
                    ? "text-blue-200 dark:text-blue-300"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                ({getCategoryCount(category)})
              </span>
            </button>
          ))}
        </div>
        {/* Tools Grid */}
        {filteredTools.length > 0 ? (
          <div className="flex flex-col gap-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {paginatedTools.map((tool, index) => (
                <ToolsCard key={tool.id || index} index={index} {...tool} />
              ))}
            </div>
            {/* Results Count & Pagination */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-2 border-t border-gray-100 dark:border-gray-950 pt-6">
              <div className="text-sm text-gray-500 dark:text-gray-400 order-2 md:order-1">
                Showing{" "}
                <span className="font-semibold text-gray-950 dark:text-white">
                  {filteredTools.length > 0 ? startIndex + 1 : 0}
                </span>{" "}
                to{" "}
                <span className="font-semibold text-gray-950 dark:text-white">
                  {endIndex}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-950 dark:text-white">
                  {filteredTools.length}
                </span>{" "}
                tools
                {(searchTerm || selectedCategory !== "all") && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory("all");
                      setCurrentPage(1);
                    }}
                    className="ml-3 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline cursor-pointer"
                  >
                    Clear filters
                  </button>
                )}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1.5 order-1 md:order-2">
                  {/* Previous Button */}
                  <button
                    onClick={() =>
                      handlePageChange(Math.max(activePage - 1, 1))
                    }
                    disabled={activePage === 1}
                    className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/55 hover:border-brandColor/50 transition-all duration-200 disabled:opacity-40 disabled:hover:bg-white disabled:hover:bg-gray-900 disabled:hover:border-gray-200 disabled:hover:border-gray-800 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Previous</span>
                  </button>

                  {/* Page Numbers */}
                  {getPageNumbers().map((page, index) => {
                    if (page === "...") {
                      return (
                        <span
                          key={`ellipsis-${index}`}
                          className="w-9 h-9 flex items-center justify-center text-gray-400 dark:text-gray-500 font-medium"
                        >
                          ...
                        </span>
                      );
                    }

                    const isActive = page === activePage;
                    return (
                      <button
                        key={`page-${page}`}
                        onClick={() => handlePageChange(page)}
                        className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                          isActive
                            ? "bg-brandColor text-white shadow-sm ring-1 ring-brandColor/50"
                            : "border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/55 hover:border-brandColor/50"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}

                  {/* Next Button */}
                  <button
                    onClick={() =>
                      handlePageChange(Math.min(activePage + 1, totalPages))
                    }
                    disabled={activePage === totalPages}
                    className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/55 hover:border-brandColor/50 transition-all duration-200 disabled:opacity-40 disabled:hover:bg-white disabled:hover:bg-gray-900 disabled:hover:border-gray-200 disabled:hover:border-gray-800 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              No tools found
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentTools;
