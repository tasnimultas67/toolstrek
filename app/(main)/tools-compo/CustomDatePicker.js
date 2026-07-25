"use client";

import React, { useState, useEffect } from "react";
import { format, subYears, addYears, subDays, addDays, parse, isValid } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function CustomDatePicker({
  selected,
  onSelect,
  disabled,
  label,
  placeholder = "Select Date",
  presetsType = "any", // 'birthDate' | 'futureDate' | 'any'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isValidDate, setIsValidDate] = useState(null); // null, true, false
  const [viewMode, setViewMode] = useState("calendar"); // 'calendar' | 'months' | 'years'
  
  // Navigation states for Custom Calendar Header
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [yearGridStart, setYearGridStart] = useState(new Date().getFullYear() - 8);

  // Sync inputs on selection changes
  useEffect(() => {
    if (selected && isValid(selected)) {
      setInputValue(format(selected, "yyyy-MM-dd"));
      setCurrentMonth(selected.getMonth());
      setCurrentYear(selected.getFullYear());
      setYearGridStart(selected.getFullYear() - 8);
      setIsValidDate(true);
    } else {
      setInputValue("");
      setIsValidDate(null);
    }
  }, [selected]);

  // Handle typing inside text input
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);

    // Accept YYYY-MM-DD, MM/DD/YYYY, or DD-MM-YYYY formats
    const parsedDate = parseInputDate(value);
    
    if (parsedDate) {
      // Check if disabled
      if (disabled && disabled(parsedDate)) {
        setIsValidDate(false);
      } else {
        setIsValidDate(true);
        onSelect(parsedDate);
      }
    } else {
      setIsValidDate(value === "" ? null : false);
    }
  };

  const parseInputDate = (str) => {
    const formats = ["yyyy-MM-dd", "MM/dd/yyyy", "dd-MM-yyyy"];
    for (const f of formats) {
      const parsed = parse(str, f, new Date());
      if (isValid(parsed) && parsed.getFullYear() > 1850 && parsed.getFullYear() < 2150) {
        return parsed;
      }
    }
    return null;
  };

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const handleMonthSelect = (monthIdx) => {
    setCurrentMonth(monthIdx);
    setViewMode("calendar");
  };

  const handleYearSelect = (year) => {
    setCurrentYear(year);
    setViewMode("calendar");
  };

  const pageYears = (direction) => {
    setYearGridStart((prev) => prev + direction * 16);
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Generate Presets
  const getPresets = () => {
    const today = new Date();
    if (presetsType === "birthDate") {
      return [
        { label: "Today", value: today },
        { label: "10 Years Ago", value: subYears(today, 10) },
        { label: "20 Years Ago", value: subYears(today, 20) },
        { label: "30 Years Ago", value: subYears(today, 30) },
        { label: "40 Years Ago", value: subYears(today, 40) },
        { label: "50 Years Ago", value: subYears(today, 50) },
        { label: "60 Years Ago", value: subYears(today, 60) },
      ];
    }
    if (presetsType === "futureDate") {
      return [
        { label: "Today", value: today },
        { label: "Tomorrow", value: addDays(today, 1) },
        { label: "+7 Days", value: addDays(today, 7) },
        { label: "+14 Days", value: addDays(today, 14) },
        { label: "+30 Days", value: addDays(today, 30) },
        { label: "+90 Days", value: addDays(today, 90) },
        { label: "+180 Days", value: addDays(today, 180) },
        { label: "+365 Days", value: addDays(today, 365) },
      ];
    }
    // Default any
    return [
      { label: "Today", value: today },
      { label: "Yesterday", value: subDays(today, 1) },
      { label: "Tomorrow", value: addDays(today, 1) },
      { label: "30 Days Ago", value: subDays(today, 30) },
      { label: "+30 Days", value: addDays(today, 30) },
    ];
  };

  const presets = getPresets();

  return (
    <div className="flex flex-col w-full gap-2">
      {label && (
        <span className="text-sm font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest mb-0.5">
          {label}
        </span>
      )}

      {/* Styled Input Container */}
      <div className="relative flex items-center w-full group">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={cn(
            "w-full h-15 pl-13 pr-26 rounded-2xl border text-base font-bold transition-all outline-none",
            "bg-gray-50/50 dark:bg-gray-800/40 border-gray-100 dark:border-gray-800/80 text-gray-800 dark:text-gray-100",
            "focus:bg-white dark:focus:bg-gray-900 focus:border-blue-500/80 dark:focus:border-blue-600/80 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/10",
            isValidDate === true && "border-emerald-500/60 dark:border-emerald-500/40 focus:border-emerald-500",
            isValidDate === false && "border-rose-500/60 dark:border-rose-500/40 focus:border-rose-500"
          )}
        />
        
        {/* Calendar Icon on Left */}
        <div className="absolute left-4.5 p-1 text-gray-400 group-focus-within:text-blue-500 transition-colors">
          <CalendarIcon className="w-5.5 h-5.5" />
        </div>

        {/* Validation indicator / Date format hint */}
        <div className="absolute right-15 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-400">
          {isValidDate === true && (
            <span className="text-emerald-500 dark:text-emerald-400 font-extrabold">✓ Valid</span>
          )}
          {isValidDate === false && (
            <span className="text-rose-500 dark:text-rose-400 font-extrabold">✕ Invalid</span>
          )}
          {isValidDate === null && (
            <span className="opacity-40 group-focus-within:opacity-85 transition-opacity">YYYY-MM-DD</span>
          )}
        </div>

        {/* Trigger Button inside Input */}
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "absolute right-2 h-11 w-11 rounded-xl bg-gray-200/50 hover:bg-gray-200 dark:bg-gray-700/40 dark:hover:bg-gray-700/70 text-gray-500 dark:text-gray-300 transition-all",
                isOpen && "bg-blue-600 dark:bg-blue-600 text-white hover:bg-blue-700 dark:hover:bg-blue-700"
              )}
            >
              <Sparkles className="w-4.5 h-4.5" />
            </Button>
          </PopoverTrigger>

          <PopoverContent
            align="start"
            side="bottom"
            className="w-auto p-0 border-none bg-transparent shadow-none focus:outline-none z-50"
          >
            {/* Popover Card */}
            <div className="flex flex-col md:flex-row bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-2xl rounded-3xl overflow-hidden max-w-full">
              {/* Presets Sidebar */}
              <div className="w-full md:w-40 bg-gray-50/50 dark:bg-gray-800/20 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800/80 p-4.5 flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible scrollbar-none whitespace-nowrap md:whitespace-normal">
                <span className="hidden md:block text-xs font-black uppercase text-gray-400 tracking-wider mb-2.5">
                  Quick Presets
                </span>
                {presets.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      onSelect(preset.value);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "px-3.5 py-2.5 text-left text-sm font-bold rounded-xl transition-all border border-transparent cursor-pointer",
                      "bg-gray-100/60 dark:bg-gray-800/60 text-gray-600 dark:text-gray-300",
                      "hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 dark:hover:bg-blue-950/30 dark:hover:text-blue-400 dark:hover:border-blue-900/50",
                      selected && format(selected, "yyyyMMdd") === format(preset.value, "yyyyMMdd") && 
                      "bg-blue-600 text-white dark:bg-blue-600 dark:text-white border-blue-600"
                    )}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Main Calendar Panel */}
              <div className="p-5 space-y-4">
                {/* Custom Month/Year Header */}
                <div className="flex items-center justify-between px-2">
                  <Button
                    variant="outline"
                    type="button"
                    size="icon"
                    onClick={
                      viewMode === "years"
                        ? () => pageYears(-1)
                        : handlePrevMonth
                    }
                    className="h-9 w-9 rounded-full border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <ChevronLeft className="h-4.5 h-4.5" />
                  </Button>

                  <div className="flex gap-1.5 items-center">
                    <Button
                      variant="ghost"
                      type="button"
                      size="sm"
                      onClick={() => setViewMode(viewMode === "months" ? "calendar" : "months")}
                      className={cn(
                        "text-sm font-black uppercase tracking-wider rounded-lg h-9 px-3",
                        viewMode === "months" ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" : "hover:bg-gray-100 dark:hover:bg-gray-800"
                      )}
                    >
                      {format(new Date(currentYear, currentMonth), "MMMM")}
                    </Button>

                    <Button
                      variant="ghost"
                      type="button"
                      size="sm"
                      onClick={() => setViewMode(viewMode === "years" ? "calendar" : "years")}
                      className={cn(
                        "text-sm font-black uppercase tracking-wider rounded-lg h-9 px-3",
                        viewMode === "years" ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" : "hover:bg-gray-100 dark:hover:bg-gray-800"
                      )}
                    >
                      {currentYear}
                    </Button>
                  </div>

                  <Button
                    variant="outline"
                    type="button"
                    size="icon"
                    onClick={
                      viewMode === "years"
                        ? () => pageYears(1)
                        : handleNextMonth
                    }
                    className="h-9 w-9 rounded-full border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <ChevronRight className="h-4.5 w-4.5" />
                  </Button>
                </div>

                {/* Calendar views with animations */}
                <div className="relative w-[308px] min-h-[270px] overflow-hidden">
                  <AnimatePresence mode="wait">
                    {viewMode === "calendar" && (
                      <motion.div
                        key="calendar"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                      >
                        <Calendar
                          mode="single"
                          selected={selected}
                          onSelect={(date) => {
                            if (date) {
                              onSelect(date);
                              setIsOpen(false);
                            }
                          }}
                          disabled={disabled}
                          month={new Date(currentYear, currentMonth)}
                          onMonthChange={(date) => {
                            setCurrentMonth(date.getMonth());
                            setCurrentYear(date.getFullYear());
                          }}
                          className="p-0"
                          classNames={{
                            months: "flex flex-col space-y-0",
                            month: "space-y-4",
                            caption: "hidden", // Hide native header
                            head_row: "flex justify-between w-full border-none",
                            head_cell: "text-gray-400 dark:text-gray-500 rounded-md w-10 font-bold text-xs uppercase tracking-wider text-center",
                            row: "flex justify-between w-full mt-2",
                            cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
                            day: cn(
                              "h-10 w-10 p-0 font-bold transition-all text-sm border border-transparent rounded-xl cursor-pointer",
                              "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-105",
                            ),
                            day_selected:
                              "bg-blue-600 text-white font-extrabold shadow-md shadow-blue-100 dark:shadow-blue-900/10 hover:bg-blue-700 hover:text-white rounded-xl focus:bg-blue-600 focus:text-white",
                            day_today:
                              "border-blue-500/40 text-blue-600 dark:text-blue-400 font-extrabold rounded-xl bg-blue-50/50 dark:bg-blue-950/20",
                            day_outside:
                              "text-gray-300 dark:text-gray-700 opacity-60 hover:bg-transparent hover:scale-100 pointer-events-none",
                            day_disabled: "text-gray-200 dark:text-gray-800 opacity-30 cursor-not-allowed hover:bg-transparent hover:scale-100",
                          }}
                        />
                      </motion.div>
                    )}

                    {viewMode === "months" && (
                      <motion.div
                        key="months"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="grid grid-cols-3 gap-2.5 pt-2"
                      >
                        {months.map((m, i) => (
                          <Button
                            key={m}
                            variant="ghost"
                            type="button"
                            onClick={() => handleMonthSelect(i)}
                            className={cn(
                              "h-14 font-extrabold text-sm rounded-2xl border border-transparent transition-all cursor-pointer",
                              "hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/30 dark:hover:text-blue-400",
                              i === currentMonth && "bg-blue-600 text-white hover:bg-blue-700 hover:text-white dark:bg-blue-600 dark:text-white"
                            )}
                          >
                            {m}
                          </Button>
                        ))}
                      </motion.div>
                    )}

                    {viewMode === "years" && (
                      <motion.div
                        key="years"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="grid grid-cols-4 gap-2.5 pt-2"
                      >
                        {Array.from({ length: 16 }, (_, i) => yearGridStart + i).map((y) => (
                          <Button
                            key={y}
                            variant="ghost"
                            type="button"
                            onClick={() => handleYearSelect(y)}
                            className={cn(
                              "h-12 font-extrabold text-sm rounded-xl border border-transparent transition-all cursor-pointer",
                              "hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/30 dark:hover:text-blue-400",
                              y === currentYear && "bg-blue-600 text-white hover:bg-blue-700 hover:text-white dark:bg-blue-600 dark:text-white"
                            )}
                          >
                            {y}
                          </Button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
