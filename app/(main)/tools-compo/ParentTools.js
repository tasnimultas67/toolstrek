"use client";
import React, { useState, useMemo } from "react";
import toolsData from "../../../lib/toolsData.json";
import ToolsCard from "./ToolsCard";

const ParentTools = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

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

  // Get category counts
  const getCategoryCount = (category) => {
    if (category === "all") return toolsData.length;
    return toolsData.filter((tool) => (tool.category || "General") === category)
      .length;
  };

  return (
    <div className="bg-white dark:bg-gray-950 py-26 px-2 text-gray-900 dark:text-white transition-colors duration-300" id="tools">
      <div className="w-11/12 mx-auto">
        <div className="mb-16 text-center lg:text-left">
          <h2 className="text-3xl lg:text-5xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Powerful simple tools
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Everything you need to stay productive, all in one place.
          </p>
        </div>

        {/* Filter Section */}
        <div className="mb-10 space-y-6">
          {/* Search Bar */}
          <div className="relative max-w-md mx-auto lg:mx-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search tools by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-800 rounded-lg leading-5 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-450 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-brandColor focus:border-brandColor sm:text-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg
                  className="h-5 w-5 text-gray-400 hover:text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
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

          {/* Results Count */}
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing {filteredTools.length} of {toolsData.length} tools
            {(searchTerm || selectedCategory !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                }}
                className="ml-3 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Tools Grid */}
        {filteredTools.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {filteredTools.map((tool, index) => (
              <ToolsCard key={tool.id || index} index={index} {...tool} />
            ))}
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
