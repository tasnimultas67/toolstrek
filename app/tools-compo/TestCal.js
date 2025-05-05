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

const CustomCalendar = ({ selected, onSelect, disabled, defaultMonth }) => {
  const [currentMonth, setCurrentMonth] = useState(
    defaultMonth?.getMonth() || new Date().getMonth()
  );
  const [currentYear, setCurrentYear] = useState(
    defaultMonth?.getFullYear() || new Date().getFullYear()
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
          className="h-7 w-7 p-0"
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
          className="h-7 w-7 p-0"
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
        initialFocus
      />
    </div>
  );
};

export function TestCal() {
  const [result, setResult] = useState(null);
  const currentDate = new Date();

  const form = useForm({
    defaultValues: {
      birthDate: null,
      ageAtDate: currentDate,
    },
  });

  const calculateAge = (data) => {
    if (!data.birthDate) {
      setResult(null);
      return;
    }

    const birthDate = new Date(data.birthDate);
    const ageAtDate = new Date(data.ageAtDate || currentDate);

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
    <div className="min-h-[90dvh] py-12 px-4 sm:px-6 lg:px-8 grid items-center grid-cols-1 gap-y-6 md:grid-cols-2 md:gap-x-6 md:gap-y-0">
      <div className="w-[400px] bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6">
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
                    <FormLabel className="text-lg font-medium text-gray-700">
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
                    <FormLabel className="text-lg font-medium text-gray-700">
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
                className="font-normal w-full h-12 text-base bg-blue-600 hover:bg-blue-700 cursor-pointer"
                disabled={!form.watch("birthDate")}
              >
                Calculate Age
              </Button>
            </form>
          </Form>
        </div>
      </div>

      {/* Result of Age */}
      {result && (
        <div className="rounded-lg p-6">
          <h2 className="text-xl font-semibold text-center text-gray-800 mb-4">
            Age Calculation
          </h2>
          <div className="grid grid-cols-3 gap-4 text-center mb-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-3xl font-bold text-blue-600">
                {result.years}
              </div>
              <div className="text-gray-600">Years</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-3xl font-bold text-blue-600">
                {result.months}
              </div>
              <div className="text-gray-600">Months</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-3xl font-bold text-blue-600">
                {result.days}
              </div>
              <div className="text-gray-600">Days</div>
            </div>
          </div>
          <div className="text-center text-gray-600 space-y-1 text-sm">
            <p className="font-normal">Born on: {result.birthDate}</p>
            <p className="font-normal">Age on: {result.ageAtDate}</p>
          </div>
        </div>
      )}
    </div>
  );
}
