"use client";

import {
  format,
  differenceInYears,
  differenceInMonths,
  differenceInDays,
} from "date-fns";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { useForm } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useState } from "react";

/**
 * CustomCalendar component with enhanced month/year navigation
 * @param {Object} props - Component props
 * @param {Date} props.selected - Currently selected date
 * @param {Function} props.onSelect - Date selection handler
 * @param {Function} props.disabled - Function to determine disabled dates
 * @param {Date} props.defaultMonth - Default month to display
 */
const CustomCalendar = ({ selected, onSelect, disabled, defaultMonth }) => {
  const [currentMonth, setCurrentMonth] = useState(
    defaultMonth?.getMonth() || new Date().getMonth()
  );
  const [currentYear, setCurrentYear] = useState(
    defaultMonth?.getFullYear() || new Date().getFullYear()
  );

  // Month names for the dropdown
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

  // Generate years from current year to 150 years back
  const years = Array.from(
    { length: 150 },
    (_, i) => new Date().getFullYear() - i
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
          className="h-7 w-7 p-0 opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex gap-2">
          {/* Month Selector */}
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

          {/* Year Selector */}
          <Select
            value={currentYear.toString()}
            onValueChange={(value) => handleYearChange(parseInt(value))}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px] overflow-y-auto">
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
          className="h-7 w-7 p-0 opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Next month"
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
        className="rounded-md border"
        classNames={{
          day_selected: "bg-blue-600 text-white hover:bg-blue-700",
          day_today: "border border-blue-500",
        }}
        initialFocus
      />
    </div>
  );
};

/**
 * Main Age Calculator component
 */
export function AgeCal() {
  const [result, setResult] = useState(null);
  const currentDate = new Date();

  // Form initialization with react-hook-form
  const form = useForm({
    defaultValues: {
      birthDate: null,
      ageAtDate: currentDate,
    },
  });

  /**
   * Calculates age based on birth date and target date
   * @param {Object} data - Form data containing birthDate and ageAtDate
   */
  const calculateAge = (data) => {
    if (!data.birthDate) {
      setResult(null);
      return;
    }

    const birthDate = new Date(data.birthDate);
    const ageAtDate = new Date(data.ageAtDate || currentDate);

    // Calculate differences
    const years = differenceInYears(ageAtDate, birthDate);
    const months = differenceInMonths(ageAtDate, birthDate) % 12;
    const days = differenceInDays(
      ageAtDate,
      new Date(
        ageAtDate.getFullYear(),
        ageAtDate.getMonth(),
        birthDate.getDate()
      )
    );

    setResult({
      years,
      months,
      days,
      birthDate: format(birthDate, "PPPP"),
      ageAtDate: format(ageAtDate, "PPPP"),
    });
  };

  return (
    <div className="min-h-[90dvh] py-12 px-4 sm:px-6 lg:px-8 grid items-center grid-cols-1 gap-y-8 md:grid-cols-2 md:gap-x-12">
      {/* Input Card */}
      <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <div className="p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Age Calculator
          </h1>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(calculateAge)}
              className="space-y-6"
            >
              {/* Birth Date Input */}
              <FormField
                control={form.control}
                name="birthDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-base font-medium text-gray-700 mb-2">
                      Date of Birth
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal h-12",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Select birth date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CustomCalendar
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Age At Date Input */}
              <FormField
                control={form.control}
                name="ageAtDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-base font-medium text-gray-700 mb-2">
                      Age at Date
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal h-12",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Select date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CustomCalendar
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            form.getValues("birthDate")
                              ? date < new Date(form.getValues("birthDate"))
                              : date < new Date("1900-01-01")
                          }
                          defaultMonth={currentDate}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-12 text-base bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-md transition-all duration-200"
                disabled={!form.watch("birthDate")}
              >
                Calculate Age
              </Button>
            </form>
          </Form>
        </div>
      </div>

      {/* Result Section */}
      {result && (
        <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Your Age
            </h2>

            {/* Age Breakdown */}
            <div className="grid grid-cols-3 gap-4 text-center mb-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <div className="text-3xl font-bold text-blue-600">
                  {result.years}
                </div>
                <div className="text-gray-600 text-sm font-medium">Years</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <div className="text-3xl font-bold text-blue-600">
                  {result.months}
                </div>
                <div className="text-gray-600 text-sm font-medium">Months</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <div className="text-3xl font-bold text-blue-600">
                  {result.days}
                </div>
                <div className="text-gray-600 text-sm font-medium">Days</div>
              </div>
            </div>

            {/* Date Information */}
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="font-medium">Born on:</span>
                <span>{result.birthDate}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-medium">Age on:</span>
                <span>{result.ageAtDate}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
