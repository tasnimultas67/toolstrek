"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
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

const CustomCalendar = ({ selected, onSelect }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

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
    { length: 20 },
    (_, i) => new Date().getFullYear() - 10 + i
  );

  const handleMonthChange = (monthIndex) => {
    setCurrentMonth(monthIndex);
  };

  const handleYearChange = (year) => {
    setCurrentYear(year);
  };

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
    <div className="space-y-4">
      <div className="flex items-center justify-between px-4 pt-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={goToPreviousMonth}
          className="h-7 w-7 p-0 opacity-70 hover:opacity-100"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex gap-2">
          <Select
            value={currentMonth.toString()}
            onValueChange={(value) => handleMonthChange(parseInt(value))}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month, index) => (
                <SelectItem key={month} value={index.toString()}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={currentYear.toString()}
            onValueChange={(value) => handleYearChange(parseInt(value))}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={goToNextMonth}
          className="h-7 w-7 p-0 opacity-70 hover:opacity-100"
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
        className="rounded-md border"
      />
    </div>
  );
};

export default function DaysTracker() {
  const [startDate, setStartDate] = useState(null);
  const [days, setDays] = useState("");
  const [endDate, setEndDate] = useState(null);

  const calculateEndDate = () => {
    if (!startDate || !days) return;
    const start = new Date(startDate);
    start.setDate(start.getDate() + parseInt(days));
    setEndDate(start);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Days Tracker</h1>
            <p className="text-gray-500 mt-2">
              Calculate future dates by adding days
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left h-12 px-4 py-3",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Select a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CustomCalendar
                    selected={startDate}
                    onSelect={setStartDate}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Days to Add
              </label>
              <Input
                type="number"
                value={days}
                onChange={(e) => setDays(e.target.value)}
                placeholder="Enter number of days"
                className="h-12"
              />
            </div>

            <Button
              onClick={calculateEndDate}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white"
              disabled={!startDate || !days}
            >
              Calculate End Date
            </Button>

            {endDate && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h3 className="font-semibold text-lg text-gray-800 mb-2">
                  Result
                </h3>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">End Date:</span>
                  <span className="font-medium text-gray-800">
                    {format(endDate, "PPP")}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
