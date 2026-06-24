"use client";
import React, { useState, useEffect, useRef } from "react";
import ReactCountryFlag from "react-country-flag";

export const COUNTRIES = [
  { name: "Bangladesh", code: "BD", rate: 15 },
  { name: "India", code: "IN", rate: 18 },
  { name: "United Kingdom", code: "GB", rate: 20 },
  { name: "Germany", code: "DE", rate: 19 },
  { name: "France", code: "FR", rate: 20 },
  { name: "Italy", code: "IT", rate: 22 },
  { name: "Canada", code: "CA", rate: 5 },
  { name: "Australia", code: "AU", rate: 10 },
  { name: "New Zealand", code: "NZ", rate: 15 },
  { name: "UAE", code: "AE", rate: 5 },
  { name: "Saudi Arabia", code: "SA", rate: 15 },
  { name: "Singapore", code: "SG", rate: 9 },
  { name: "South Africa", code: "ZA", rate: 15 },
  { name: "Japan", code: "JP", rate: 10 },
  { name: "Pakistan", code: "PK", rate: 18 },
  { name: "United States", code: "US", rate: 0 },
];

export default function CountrySelector({ selectedCountryCode, onSelectCountry }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);

  const selected = COUNTRIES.find((c) => c.code === selectedCountryCode) || COUNTRIES[0];

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCountries = COUNTRIES.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative w-full sm:w-72" ref={dropdownRef}>
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
        Country Preset
      </label>
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          setSearchQuery("");
        }}
        className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 bg-white dark:bg-gray-700 text-sm text-gray-800 dark:text-gray-200 shadow-sm transition-all duration-200 outline-none hover:border-gray-300 dark:hover:border-gray-500 text-left"
      >
        <span className="flex items-center gap-2.5 min-w-0">
          <span className="w-6 h-6 flex items-center justify-center rounded-md bg-gray-100 dark:bg-gray-800 overflow-hidden flex-shrink-0">
            <ReactCountryFlag
              countryCode={selected.code}
              svg
              style={{ width: "1.25rem", height: "1.25rem", objectFit: "cover" }}
              title={selected.name}
            />
          </span>
          <span className="font-medium text-gray-700 dark:text-gray-200 truncate">
            {selected.name} ({selected.rate}%)
          </span>
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform duration-200 flex-shrink-0 ${
            isOpen ? "rotate-180 text-violet-500" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-30 mt-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl dark:shadow-gray-900/40 overflow-hidden animate-fadeIn flex flex-col max-h-72">
          {/* Search Box */}
          <div className="p-2 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-850">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search country..."
                className="w-full pl-8 pr-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 focus:border-transparent text-xs text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-500"
                autoFocus
              />
              <svg
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400"
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
          </div>

          {/* List items */}
          <div className="overflow-y-auto py-1 flex-1">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((c) => {
                const isSelected = c.code === selectedCountryCode;
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => {
                      onSelectCountry(c);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors text-left ${
                      isSelected
                        ? "bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 font-semibold"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    }`}
                  >
                    <span className="flex items-center gap-2.5 min-w-0">
                      <span className="w-5 h-5 flex items-center justify-center rounded overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                        <ReactCountryFlag
                          countryCode={c.code}
                          svg
                          style={{ width: "1rem", height: "1rem", objectFit: "cover" }}
                        />
                      </span>
                      <span className="truncate">{c.name}</span>
                    </span>
                    <span className={`text-xs ${isSelected ? "text-violet-500 font-bold" : "text-gray-400"}`}>
                      {c.rate}%
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-3 text-xs text-gray-400 text-center">
                No countries found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
