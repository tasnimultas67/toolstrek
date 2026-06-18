"use client";

import React, { useState } from "react";
import {
  format,
  differenceInYears,
  differenceInMonths,
  differenceInDays,
  addYears,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Timer,
  Cake,
  Calendar as CalIcon,
  Info,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import ToolPageShell from "./ToolPageShell";
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
 * CustomCalendar with Month/Year dropdowns
 */
const CustomCalendar = ({ selected, onSelect, disabled, defaultMonth }) => {
  const [currentMonth, setCurrentMonth] = useState(
    selected?.getMonth() || defaultMonth?.getMonth() || new Date().getMonth(),
  );
  const [currentYear, setCurrentYear] = useState(
    selected?.getFullYear() ||
      defaultMonth?.getFullYear() ||
      new Date().getFullYear(),
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

  const years = Array.from(
    { length: 150 },
    (_, i) => new Date().getFullYear() - i,
  );

  const handleMonthChange = (monthIndex) => setCurrentMonth(monthIndex);
  const handleYearChange = (year) => setCurrentYear(year);

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
            onValueChange={(v) => handleMonthChange(parseInt(v))}
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
            onValueChange={(v) => handleYearChange(parseInt(v))}
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
        disabled={disabled}
        month={new Date(currentYear, currentMonth)}
        onMonthChange={(date) => {
          setCurrentMonth(date.getMonth());
          setCurrentYear(date.getFullYear());
        }}
        className="rounded-xl border-none"
        classNames={{
          day_selected:
            "bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-md",
          day_today:
            "bg-gray-100 dark:bg-gray-800 text-blue-600 font-bold rounded-lg",
        }}
      />
    </div>
  );
};

/**
 * Main Age Calculator Component
 */
export function AgeCal() {
  const [result, setResult] = useState(null);
  const [isBirthDateOpen, setIsBirthDateOpen] = useState(false);
  const [isAgeAtDateOpen, setIsAgeAtDateOpen] = useState(false);

  const currentDate = new Date();

  const form = useForm({
    defaultValues: {
      birthDate: null,
      ageAtDate: currentDate,
    },
  });

  const calculateAge = (data) => {
    if (!data.birthDate) return;

    const birthDate = new Date(data.birthDate);
    const ageAtDate = new Date(data.ageAtDate || currentDate);

    const years = differenceInYears(ageAtDate, birthDate);
    const months = differenceInMonths(ageAtDate, birthDate) % 12;

    // Accurate day calculation
    const lastAnniversary = addYears(birthDate, years);
    const days = Math.max(0, differenceInDays(ageAtDate, lastAnniversary) % 30);

    setResult({
      years,
      months,
      days,
      birthDate: format(birthDate, "PPPP"),
      ageAtDate: format(ageAtDate, "PPPP"),
      nextBirthday: format(
        new Date(
          ageAtDate.getFullYear() +
            (ageAtDate.getMonth() > birthDate.getMonth() ? 1 : 0),
          birthDate.getMonth(),
          birthDate.getDate(),
        ),
        "PPP",
      ),
    });
  };

  return (
    <ToolPageShell widthClassName="max-w-5xl">
      <div className="grid grid-cols-1 gap-8 items-start font-sans lg:grid-cols-2">
        {/* Left Side: Input Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card className="bg-white dark:bg-gray-900 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border-none overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-50 dark:border-gray-800 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-100 dark:shadow-blue-900/20">
                <Timer className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-800 dark:text-white">
                Age <span className="text-blue-600">Calculator</span>
              </h1>
            </div>

            <div className="p-8">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(calculateAge)}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 gap-6">
                    {/* Birth Date Field */}
                    <FormField
                      control={form.control}
                      name="birthDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="text-xs font-black uppercase text-gray-400 tracking-widest mb-2">
                            Date of Birth
                          </FormLabel>
                          <Popover
                            open={isBirthDateOpen}
                            onOpenChange={setIsBirthDateOpen}
                          >
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "h-14 rounded-2xl border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 text-left font-bold text-gray-700 dark:text-gray-200",
                                    !field.value && "text-muted-foreground",
                                  )}
                                >
                                  <Cake className="mr-2 h-4 w-4 text-blue-500" />
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>When were you born?</span>
                                  )}
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0 border-none bg-transparent shadow-none"
                              align="start"
                            >
                              <CustomCalendar
                                selected={field.value}
                                onSelect={(date) => {
                                  field.onChange(date);
                                  setIsBirthDateOpen(false); // Auto-close on select
                                }}
                                disabled={(date) => date > new Date()}
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Age At Date Field */}
                    <FormField
                      control={form.control}
                      name="ageAtDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="text-xs font-black uppercase text-gray-400 tracking-widest mb-2">
                            Age at the Date of
                          </FormLabel>
                          <Popover
                            open={isAgeAtDateOpen}
                            onOpenChange={setIsAgeAtDateOpen}
                          >
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "h-14 rounded-2xl border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 text-left font-bold text-gray-700 dark:text-gray-200",
                                    !field.value && "text-muted-foreground",
                                  )}
                                >
                                  <CalIcon className="mr-2 h-4 w-4 text-emerald-500" />
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Select target date</span>
                                  )}
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0 border-none bg-transparent shadow-none"
                              align="start"
                            >
                              <CustomCalendar
                                selected={field.value}
                                onSelect={(date) => {
                                  field.onChange(date);
                                  setIsAgeAtDateOpen(false); // Auto-close on select
                                }}
                                defaultMonth={currentDate}
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-14 text-lg font-bold bg-gray-900 dark:bg-blue-600 hover:bg-black dark:hover:bg-blue-700 text-white rounded-2xl shadow-xl transition-all active:scale-95"
                    disabled={!form.watch("birthDate")}
                  >
                    Calculate My Age
                  </Button>
                </form>
              </Form>
            </div>
          </Card>
        </motion.div>

        {/* Right Side: Result Display */}
        <div className="relative">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <Card className="bg-white dark:bg-gray-900 rounded-3xl border-none shadow-2xl p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Timer size={120} />
                  </div>

                  <h2 className="text-sm font-black uppercase text-gray-400 tracking-widest mb-8">
                    Calculated Results
                  </h2>

                  <div className="grid grid-cols-3 gap-4 mb-10">
                    <div className="flex flex-col items-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-3xl border border-blue-100 dark:border-blue-800 shadow-sm">
                      <span className="text-4xl font-black text-blue-600 dark:text-blue-400">
                        {result.years}
                      </span>
                      <span className="text-[10px] font-bold text-blue-400 uppercase mt-1">
                        Years
                      </span>
                    </div>
                    <div className="flex flex-col items-center p-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-3xl border border-emerald-100 dark:border-emerald-800 shadow-sm">
                      <span className="text-4xl font-black text-emerald-600 dark:text-emerald-400">
                        {result.months}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-400 uppercase mt-1">
                        Months
                      </span>
                    </div>
                    <div className="flex flex-col items-center p-6 bg-amber-50 dark:bg-amber-900/20 rounded-3xl border border-amber-100 dark:border-amber-800 shadow-sm">
                      <span className="text-4xl font-black text-amber-600 dark:text-amber-400">
                        {result.days}
                      </span>
                      <span className="text-[10px] font-bold text-amber-400 uppercase mt-1">
                        Days
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4 pt-6 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <Cake size={16} className="text-pink-500" />
                        <span className="text-xs font-bold text-gray-500">
                          Born on
                        </span>
                      </div>
                      <span className="text-sm font-bold text-gray-800 dark:text-gray-100">
                        {result.birthDate}
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <CalIcon size={16} className="text-blue-500" />
                        <span className="text-xs font-bold text-gray-500">
                          Age on date
                        </span>
                      </div>
                      <span className="text-sm font-bold text-gray-800 dark:text-gray-100">
                        {result.ageAtDate}
                      </span>
                    </div>
                  </div>
                </Card>

                <Card className="bg-linear-to-br from-indigo-600 to-blue-700 rounded-3xl p-6 text-white border-none shadow-xl">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                      <Info size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">
                        Next Celebration
                      </p>
                      <p className="text-sm font-bold">{result.nextBirthday}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full min-h-100 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl"
              >
                <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mb-4">
                  <Timer className="text-gray-300" size={32} />
                </div>
                <h3 className="text-lg font-bold text-gray-400">
                  Ready to calculate
                </h3>
                <p className="text-sm text-gray-400 max-w-50">
                  Enter your birth date to see your age breakdown.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </ToolPageShell>
  );
}
