"use client";

import React, { useState } from "react";
import { format, addDays } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  PlusCircle,
  ArrowRightCircle,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Custom Calendar with enhanced navigation
 */
const CustomCalendar = ({ selected, onSelect }) => {
  const [currentMonth, setCurrentMonth] = useState(
    selected?.getMonth() || new Date().getMonth(),
  );
  const [currentYear, setCurrentYear] = useState(
    selected?.getFullYear() || new Date().getFullYear(),
  );

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Extended year range for tracking
  const years = Array.from(
    { length: 100 },
    (_, i) => new Date().getFullYear() - 50 + i,
  );

  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  return (
    <div className="space-y-4 p-3 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl">
      <div className="flex items-center justify-between px-2 pt-2">
        <Button
          variant="outline"
          size="icon"
          onClick={goToPreviousMonth}
          className="h-8 w-8 rounded-full"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex gap-1">
          <Select
            value={currentMonth.toString()}
            onValueChange={(v) => setCurrentMonth(parseInt(v))}
          >
            <SelectTrigger className="w-27.5 h-8 text-xs font-bold border-none bg-gray-50 dark:bg-gray-800 rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((m, i) => (
                <SelectItem key={m} value={i.toString()}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={currentYear.toString()}
            onValueChange={(v) => setCurrentYear(parseInt(v))}
          >
            <SelectTrigger className="w-21.25 h-8 text-xs font-bold border-none bg-gray-50 dark:bg-gray-800 rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-50">
              {years.map((y) => (
                <SelectItem key={y} value={y.toString()}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={goToNextMonth}
          className="h-8 w-8 rounded-full"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <Calendar
        mode="single"
        selected={selected}
        onSelect={onSelect}
        month={new Date(currentYear, currentMonth)}
        onMonthChange={(date) => {
          setCurrentMonth(date.getMonth());
          setCurrentYear(date.getFullYear());
        }}
        className="rounded-xl border-none"
        classNames={{
          day_selected:
            "bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-md shadow-blue-100",
          day_today:
            "bg-gray-100 dark:bg-gray-800 text-blue-600 font-bold rounded-lg",
        }}
      />
    </div>
  );
};

export default function DaysTracker() {
  const [startDate, setStartDate] = useState(null);
  const [days, setDays] = useState("");
  const [endDate, setEndDate] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const calculateEndDate = () => {
    if (!startDate || !days) return;
    const result = addDays(new Date(startDate), parseInt(days));
    setEndDate(result);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 py-12 px-4 flex items-center justify-center font-sans">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Input Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card className="bg-white dark:bg-gray-900 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border-none overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-50 dark:border-gray-800 bg-white/50 backdrop-blur-md flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-100">
                <History className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-800 dark:text-white">
                Days <span className="text-blue-600">Tracker</span>
              </h1>
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-gray-400 tracking-widest mb-2 block">
                  Starting Point
                </label>
                <Popover open={isOpen} onOpenChange={setIsOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full h-14 rounded-2xl border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 text-left font-bold text-gray-700 dark:text-gray-200",
                        !startDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-blue-500" />
                      {startDate
                        ? format(startDate, "PPP")
                        : "Select start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0 border-none bg-transparent shadow-none"
                    align="start"
                  >
                    <CustomCalendar
                      selected={startDate}
                      onSelect={(date) => {
                        setStartDate(date);
                        setIsOpen(false); // Auto-close fix
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-gray-400 tracking-widest mb-2 block">
                  Time to Add (Days)
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    value={days}
                    onChange={(e) => setDays(e.target.value)}
                    placeholder="e.g. 30"
                    className="h-14 rounded-2xl border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 pl-11 font-bold"
                  />
                  <PlusCircle className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                </div>
              </div>

              <Button
                onClick={calculateEndDate}
                className="w-full h-14 text-lg font-bold bg-gray-900 dark:bg-blue-600 hover:bg-black dark:hover:bg-blue-700 text-white rounded-2xl shadow-xl transition-all active:scale-95"
                disabled={!startDate || !days}
              >
                Find Target Date
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Result Section */}
        <div className="relative">
          <AnimatePresence mode="wait">
            {endDate ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <Card className="bg-white dark:bg-gray-900 rounded-3xl border-none shadow-2xl p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    <ArrowRightCircle size={120} />
                  </div>

                  <h2 className="text-sm font-black uppercase text-gray-400 tracking-widest mb-8">
                    Generated Result
                  </h2>

                  <div className="p-8 bg-blue-50 dark:bg-blue-900/20 rounded-3xl border border-blue-100 dark:border-blue-800 text-center mb-6">
                    <p className="text-xs font-bold text-blue-400 uppercase mb-2 tracking-widest">
                      Target Date
                    </p>
                    <p className="text-3xl sm:text-4xl font-black text-blue-600 dark:text-blue-400">
                      {format(endDate, "PPPP")}
                    </p>
                  </div>

                  <div className="space-y-4 pt-6 border-t border-gray-100 dark:border-gray-800 text-sm font-bold">
                    <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl">
                      <span className="text-gray-500">From</span>
                      <span className="text-gray-800 dark:text-gray-100">
                        {format(startDate, "PP")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl">
                      <span className="text-gray-500">Duration Added</span>
                      <span className="text-emerald-600">+{days} Days</span>
                    </div>
                  </div>
                </Card>

                <div className="bg-linear-to-br from-indigo-600 to-blue-700 rounded-3xl p-6 text-white shadow-xl flex items-center gap-4">
                  <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                    <ArrowRightCircle size={20} />
                  </div>
                  <p className="text-sm font-bold tracking-tight">
                    Successfully calculated. This date falls on a{" "}
                    <span className="underline decoration-white/30">
                      {format(endDate, "EEEE")}
                    </span>
                    .
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full min-h-100 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl"
              >
                <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mb-4">
                  <ArrowRightCircle className="text-gray-300" size={32} />
                </div>
                <h3 className="text-lg font-bold text-gray-400">
                  Waiting for input
                </h3>
                <p className="text-sm text-gray-400 max-w-50">
                  Select a date and amount of days to see the magic.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
