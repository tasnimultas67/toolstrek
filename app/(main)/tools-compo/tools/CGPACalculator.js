"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import {
  AlertCircle,
  Calculator,
  Download,
  GraduationCap,
  X,
  ChevronDown,
} from "lucide-react";
import { Hind_Siliguri } from "next/font/google";
import subjectData from "./cgpaSubjectData.json";

const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const GRADES = [
  { grade: "A+", point: 4, markRange: "80% and above" },
  { grade: "A", point: 3.75, markRange: "75% to less than 80%" },
  { grade: "A-", point: 3.5, markRange: "70% to less than 75%" },
  { grade: "B+", point: 3.25, markRange: "65% to less than 70%" },
  { grade: "B", point: 3, markRange: "60% to less than 65%" },
  { grade: "B-", point: 2.75, markRange: "55% to less than 60%" },
  { grade: "C+", point: 2.5, markRange: "50% to less than 55%" },
  { grade: "C", point: 2.25, markRange: "45% to less than 50%" },
  { grade: "D", point: 2, markRange: "40% to less than 45%" },
  { grade: "F", point: 0, markRange: "Less than 40%" },
];

const COPYRIGHT_NAME = "Tasnimul Haque";

function getGradePoint(grade) {
  return GRADES.find((item) => item.grade === grade)?.point ?? null;
}

function getOptions(source) {
  return Object.keys(source || {});
}

function ResultTable({ rows, compact = false }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-155 border-collapse border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm">
        <thead className="bg-gray-100 dark:bg-gray-700">
          <tr>
            <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left font-semibold text-gray-900 dark:text-gray-100">
              বিষয়
            </th>
            <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-center font-semibold text-gray-900 dark:text-gray-100">
              গ্রেড
            </th>
            <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-center font-semibold text-gray-900 dark:text-gray-100">
              প্রাপ্ত পয়েন্ট
            </th>
            <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-center font-semibold text-gray-900 dark:text-gray-100">
              মোট পয়েন্ট
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key}>
              <td
                className={`border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-800 dark:text-gray-200 ${
                  compact ? "text-xs" : ""
                }`}
              >
                {row.name} ({row.code})
              </td>
              <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-center text-gray-900 dark:text-gray-100">
                {row.grade}
              </td>
              <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-center text-gray-900 dark:text-gray-100">
                {row.point}
              </td>
              <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-center text-gray-900 dark:text-gray-100">
                {row.credit}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Modern GradeSelect with portal-based dropdown to escape table overflow clipping
function GradeSelect({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownStyle, setDropdownStyle] = useState({});
  const buttonRef = useRef(null);
  const inputRef = useRef(null);

  const filteredGrades = GRADES.filter((item) =>
    item.grade.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const selectedGrade = GRADES.find((item) => item.grade === value);

  // Recalculate dropdown position whenever it opens or on scroll/resize
  useEffect(() => {
    if (!isOpen || !buttonRef.current) return;

    const updatePosition = () => {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;
      // Estimate full height: search box (~44px) + each item (~36px) + padding (~8px)
      const estimatedHeight = 44 + filteredGrades.length * 36 + 8;
      const spaceBelow = window.innerHeight - rect.bottom;
      const showAbove = spaceBelow < estimatedHeight && rect.top > estimatedHeight;

      setDropdownStyle({
        position: "fixed",
        left: rect.left,
        width: Math.max(rect.width, 160),
        zIndex: 9999,
        ...(showAbove
          ? { bottom: window.innerHeight - rect.top + 4 }
          : { top: rect.bottom + 4 }),
      });
    };

    updatePosition();
    // Focus search input without scrolling the page
    inputRef.current?.focus({ preventScroll: true });

    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen, filteredGrades.length]);

  const dropdown = isOpen ? (
    <>
      {/* Backdrop to close on outside click */}
      <div
        className="fixed inset-0"
        style={{ zIndex: 9998 }}
        onClick={() => {
          setIsOpen(false);
          setSearchTerm("");
        }}
      />
      {/* Dropdown: no max-height so all items show without a scrollbar */}
      <div
        style={dropdownStyle}
        className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl overflow-hidden"
      >
        <div className="bg-white dark:bg-gray-800 p-2 border-b border-gray-100 dark:border-gray-700">
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search grade..."
            className="w-full rounded-md border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-2 py-1 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        <div className="py-1">
          {filteredGrades.map((item) => (
            <button
              key={item.grade}
              onClick={() => {
                onChange(item.grade);
                setIsOpen(false);
                setSearchTerm("");
              }}
              className={`w-full px-3 py-2 text-left text-sm transition-colors duration-150 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 ${
                value === item.grade
                  ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400"
                  : "text-gray-700 dark:text-gray-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{item.grade}</span>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {item.point.toFixed(2)}
                </span>
              </div>
            </button>
          ))}
          {filteredGrades.length === 0 && (
            <div className="px-3 py-2 text-sm text-gray-400 dark:text-gray-500">
              No grades found
            </div>
          )}
        </div>
      </div>
    </>
  ) : null;

  return (
    <div className="relative inline-block w-24">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-9 w-full items-center justify-between rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 text-sm text-gray-900 dark:text-gray-100 transition-all duration-200 hover:border-indigo-400 dark:hover:border-indigo-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900"
      >
        <span
          className={
            selectedGrade
              ? "text-gray-900 dark:text-gray-100"
              : "text-gray-400 dark:text-gray-500"
          }
        >
          {selectedGrade ? selectedGrade.grade : "গ্রেড"}
        </span>
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {/* Portal: renders outside the table DOM to avoid overflow clipping */}
      {typeof document !== "undefined" &&
        ReactDOM.createPortal(dropdown, document.body)}
    </div>
  );
}

// Modern FieldSelect with custom dropdown
function FieldSelect({
  label,
  value,
  onChange,
  disabled,
  options,
  placeholder,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </span>
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`flex h-11 w-full items-center justify-between rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 text-sm text-gray-900 dark:text-gray-100 transition-all duration-200 hover:border-indigo-400 dark:hover:border-indigo-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 ${
            disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
          }`}
        >
          <span
            className={
              value
                ? "text-gray-900 dark:text-gray-100"
                : "text-gray-400 dark:text-gray-500"
            }
          >
            {value || placeholder}
          </span>
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {isOpen && !disabled && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg shadow-black/5 animate-in slide-in-from-top-2 duration-200">
              <div className="sticky top-0 bg-white dark:bg-gray-800 p-2 border-b border-gray-100 dark:border-gray-700">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={`Search ${label.toLowerCase()}...`}
                  className="w-full rounded-md border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-2 py-1 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div className="py-1">
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        onChange(option);
                        setIsOpen(false);
                        setSearchTerm("");
                      }}
                      className={`w-full px-3 py-2 text-left text-sm transition-colors duration-150 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 ${
                        value === option
                          ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400"
                          : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {option}
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-2 text-sm text-gray-400 dark:text-gray-500">
                    No results found
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </label>
  );
}

function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = String(text).split(" ");
  const lines = [];
  let line = "";

  words.forEach((word) => {
    const testLine = line ? `${line} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = testLine;
    }
  });

  if (line) lines.push(line);
  lines.forEach((lineText, index) =>
    ctx.fillText(lineText, x, y + index * lineHeight),
  );
  return lines.length * lineHeight;
}

export default function CGPACalculator() {
  const [studentName, setStudentName] = useState("");
  const [program, setProgram] = useState("");
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("");
  const [coreGrades, setCoreGrades] = useState([]);
  const [optionalGrades, setOptionalGrades] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);

  const departmentOptions = useMemo(
    () => getOptions(subjectData[program]),
    [program],
  );

  const yearOptions = useMemo(
    () => getOptions(subjectData[program]?.[department]),
    [program, department],
  );

  const selectedData = subjectData[program]?.[department]?.[year] || {
    core: [],
    optional: [],
    optionalLimit: 0,
  };

  const coreSubjects = selectedData.core || [];
  const optionalSubjects = selectedData.optional || [];
  const optionalLimit = selectedData.optionalLimit || 0;

  const resultRows = useMemo(() => {
    const coreRows = coreSubjects.map((subject, index) => {
      const grade = coreGrades[index] || "-";
      const point = getGradePoint(grade);

      return {
        key: `core-${subject.code}-${index}`,
        name: subject.name,
        code: subject.code,
        grade,
        point: point === null ? "-" : point.toFixed(2),
        credit: subject.credit,
      };
    });

    const optionalRows = optionalSubjects
      .map((subject, index) => {
        const grade = optionalGrades[index];
        if (!grade) return null;
        const point = getGradePoint(grade);

        return {
          key: `optional-${subject.code}-${index}`,
          name: subject.name,
          code: subject.code,
          grade,
          point: point === null ? "-" : point.toFixed(2),
          credit: subject.credit,
        };
      })
      .filter(Boolean);

    return [...coreRows, ...optionalRows];
  }, [coreGrades, coreSubjects, optionalGrades, optionalSubjects]);

  const resetAfterProgram = (nextProgram) => {
    setProgram(nextProgram);
    setDepartment("");
    setYear("");
    setCoreGrades([]);
    setOptionalGrades([]);
    setResult(null);
    setError("");
  };

  const resetAfterDepartment = (nextDepartment) => {
    setDepartment(nextDepartment);
    setYear("");
    setCoreGrades([]);
    setOptionalGrades([]);
    setResult(null);
    setError("");
  };

  const resetAfterYear = (nextYear) => {
    setYear(nextYear);
    setCoreGrades([]);
    setOptionalGrades([]);
    setResult(null);
    setError("");
  };

  const updateCoreGrade = (index, grade) => {
    setCoreGrades((current) => {
      const next = [...current];
      next[index] = grade;
      return next;
    });
  };

  const updateOptionalGrade = (index, grade) => {
    setOptionalGrades((current) => {
      const next = [...current];
      next[index] = grade;
      return next;
    });
  };

  const calculateCgpa = () => {
    setResult(null);
    setError("");

    if (!studentName.trim()) {
      setError("আপনার নাম লিখুন।");
      return;
    }

    if (!program || !department || !year) {
      setError("প্রোগ্রাম, বিভাগ এবং ইয়ার নির্বাচন করুন।");
      return;
    }

    const coreComplete = coreSubjects.every((_, index) => coreGrades[index]);
    const selectedOptionalGrades = optionalGrades.filter(Boolean);

    if (!coreComplete) {
      setError("সব Core বিষয়ের গ্রেড পূরণ করুন।");
      return;
    }

    if (selectedOptionalGrades.length !== optionalLimit) {
      setError(`অপশনাল বিষয়ের মধ্যে ${optionalLimit} টি গ্রেড দিতে হবে।`);
      return;
    }

    let weightedPoints = 0;
    let totalCredits = 0;

    coreSubjects.forEach((subject, index) => {
      const point = getGradePoint(coreGrades[index]);
      if (point !== null) {
        weightedPoints += point * subject.credit;
        totalCredits += subject.credit;
      }
    });

    optionalSubjects.forEach((subject, index) => {
      const grade = optionalGrades[index];
      const point = getGradePoint(grade);
      if (grade && point !== null) {
        weightedPoints += point * subject.credit;
        totalCredits += subject.credit;
      }
    });

    if (!totalCredits) {
      setError("CGPA হিসাব করার জন্য অন্তত একটি গ্রেড প্রয়োজন।");
      return;
    }

    setResult((weightedPoints / totalCredits).toFixed(2));
  };

  const downloadResult = async () => {
    if (!result) return;

    setIsDownloading(true);

    try {
      await document.fonts?.ready;
      const width = 1200;
      const tableWidth = 1040;
      const rowHeight = 58;
      const tableHeight = 56 + resultRows.length * rowHeight;
      const height = Math.max(760, 430 + tableHeight);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      const calculatorShell = document.querySelector(".cgpa-calculator-shell");
      const canvasFont =
        calculatorShell && window.getComputedStyle(calculatorShell).fontFamily
          ? window.getComputedStyle(calculatorShell).fontFamily
          : "Arial, sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = "rgba(124, 0, 254, 0.08)";
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, 150, 0, Math.PI * 2);
      ctx.fill();

      ctx.textAlign = "center";
      ctx.fillStyle = "#111827";
      ctx.font = `700 44px ${canvasFont}`;
      ctx.fillText("ToolsTrek", width / 2, 78);
      ctx.font = `700 34px ${canvasFont}`;
      ctx.fillText("Your Result", width / 2, 128);

      ctx.font = `500 24px ${canvasFont}`;
      ctx.fillStyle = "#4b5563";
      ctx.fillText(`${program} - ${department} (${year})`, width / 2, 168);

      ctx.font = `700 24px ${canvasFont}`;
      ctx.fillStyle = "#111827";
      ctx.fillText(`Name: ${studentName.trim()}`, width / 2, 202);

      ctx.font = `700 34px ${canvasFont}`;
      ctx.fillStyle = parseFloat(result) > 3 ? "#059669" : "#2563eb";
      ctx.fillText(`CGPA: ${result}`, width / 2, 248);

      const startX = (width - tableWidth) / 2;
      let currentY = 300;
      const columns = [500, 150, 200, 190];
      const headers = ["বিষয়", "গ্রেড", "প্রাপ্ত পয়েন্ট", "মোট পয়েন্ট"];

      ctx.textAlign = "left";
      ctx.strokeStyle = "#d1d5db";
      ctx.lineWidth = 1;
      ctx.fillStyle = "#f3f4f6";
      ctx.fillRect(startX, currentY, tableWidth, 56);
      ctx.strokeRect(startX, currentY, tableWidth, 56);

      let x = startX;
      ctx.fillStyle = "#111827";
      ctx.font = `700 20px ${canvasFont}`;
      headers.forEach((header, index) => {
        ctx.strokeRect(x, currentY, columns[index], 56);
        ctx.fillText(header, x + 18, currentY + 36);
        x += columns[index];
      });
      currentY += 56;

      ctx.font = `400 18px ${canvasFont}`;
      resultRows.forEach((row) => {
        x = startX;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(startX, currentY, tableWidth, rowHeight);
        ctx.strokeStyle = "#d1d5db";
        columns.forEach((colWidth) => {
          ctx.strokeRect(x, currentY, colWidth, rowHeight);
          x += colWidth;
        });

        ctx.fillStyle = "#1f2937";
        wrapCanvasText(
          ctx,
          `${row.name} (${row.code})`,
          startX + 18,
          currentY + 24,
          columns[0] - 34,
          20,
        );

        ctx.textAlign = "center";
        ctx.fillText(
          row.grade,
          startX + columns[0] + columns[1] / 2,
          currentY + 36,
        );
        ctx.fillText(
          row.point,
          startX + columns[0] + columns[1] + columns[2] / 2,
          currentY + 36,
        );
        ctx.fillText(
          String(row.credit),
          startX + columns[0] + columns[1] + columns[2] + columns[3] / 2,
          currentY + 36,
        );
        ctx.textAlign = "left";
        currentY += rowHeight;
      });

      if (parseFloat(result) > 3) {
        ctx.textAlign = "center";
        ctx.fillStyle = "#059669";
        ctx.font = `700 22px ${canvasFont}`;
        ctx.fillText(
          "--- Congratulations on your Outstanding Result! ---",
          width / 2,
          currentY + 44,
        );
      }

      const footerY = height - 130;
      ctx.textAlign = "center";
      ctx.fillStyle = "#2563eb";
      ctx.font = `500 18px ${canvasFont}`;
      ctx.fillText(
        `Result Calculated by ToolsTrek CGPA Calculator | ${new Date().toLocaleDateString()}`,
        width / 2,
        footerY + 14,
      );
      ctx.fillText(`Copyright © ${COPYRIGHT_NAME}`, width / 2, footerY + 44);

      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      const safeName = studentName
        .trim()
        .replace(/[\\/:*?"<>|]+/g, "-")
        .replace(/\s+/g, "-")
        .replace(/^-|-$/g, "");
      link.download = `CGPA-Result-${safeName || "Student"}-${result}.png`;
      link.click();
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div
      className={`${hindSiliguri.className} cgpa-calculator-shell min-h-screen bg-[#f9fafb] dark:bg-gray-900 px-2 pb-10 pt-20 text-gray-900 dark:text-gray-100`}
    >
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 text-center">
          <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-md bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400">
            <GraduationCap className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 sm:text-3xl">
            জাতীয় বিশ্ববিদ্যালয় CGPA ক্যালকুলেটর
          </h1>
        </div>

        <section className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/90 p-4 shadow-sm sm:p-6">
          <label className="mb-4 block">
            <span className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              নাম
            </span>
            <input
              type="text"
              value={studentName}
              onChange={(event) => {
                setStudentName(event.target.value);
                setResult(null);
                setError("");
              }}
              placeholder="আপনার নাম লিখুন"
              className="h-11 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 text-sm text-gray-900 dark:text-gray-100 outline-none transition placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900"
            />
          </label>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <FieldSelect
              label="প্রোগ্রাম"
              value={program}
              onChange={resetAfterProgram}
              options={getOptions(subjectData)}
              placeholder="প্রোগ্রাম নির্বাচন করুন"
            />
            <FieldSelect
              label="বিভাগ"
              value={department}
              onChange={resetAfterDepartment}
              disabled={!program}
              options={departmentOptions}
              placeholder="বিভাগ নির্বাচন করুন"
            />
            <FieldSelect
              label="ইয়ার"
              value={year}
              onChange={resetAfterYear}
              disabled={!department}
              options={yearOptions}
              placeholder="ইয়ার নির্বাচন করুন"
            />
          </div>

          {(coreSubjects.length > 0 || optionalSubjects.length > 0) && (
            <div className="mt-6 overflow-x-auto text-sm">
              <table className="w-full min-w-180 border-collapse border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-gray-900 dark:text-gray-100">
                      বিষয়
                    </th>
                    <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center text-gray-900 dark:text-gray-100">
                      গ্রেড
                    </th>
                    <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center text-gray-900 dark:text-gray-100">
                      প্রাপ্ত পয়েন্ট
                    </th>
                    <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center text-gray-900 dark:text-gray-100">
                      মোট পয়েন্ট
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {coreSubjects.map((subject, index) => {
                    const point = getGradePoint(coreGrades[index]);

                    return (
                      <tr key={`core-${subject.code}-${index}`}>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-800 dark:text-gray-200">
                          {subject.name} ({subject.code})
                        </td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center">
                          <GradeSelect
                            value={coreGrades[index] || ""}
                            onChange={(grade) => updateCoreGrade(index, grade)}
                          />
                        </td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center text-gray-900 dark:text-gray-100">
                          {point === null ? "" : point.toFixed(2)}
                        </td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center text-gray-900 dark:text-gray-100">
                          {subject.credit}
                        </td>
                      </tr>
                    );
                  })}

                  {optionalSubjects.length > 0 && (
                    <tr>
                      <td
                        colSpan="4"
                        className="bg-gray-200 dark:bg-gray-700 px-4 py-2 text-center font-semibold text-gray-900 dark:text-gray-100"
                      >
                        Optional Subjects (যেকোনো {optionalLimit} টি)
                      </td>
                    </tr>
                  )}

                  {optionalSubjects.map((subject, index) => {
                    const point = getGradePoint(optionalGrades[index]);

                    return (
                      <tr key={`optional-${subject.code}-${index}`}>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-800 dark:text-gray-200">
                          {subject.name} ({subject.code})
                        </td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center">
                          <GradeSelect
                            value={optionalGrades[index] || ""}
                            onChange={(grade) =>
                              updateOptionalGrade(index, grade)
                            }
                          />
                        </td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center text-gray-900 dark:text-gray-100">
                          {point === null ? "" : point.toFixed(2)}
                        </td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center text-gray-900 dark:text-gray-100">
                          {subject.credit}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {/* Error */}
          {error && (
            <div className="mt-5 flex items-center justify-center gap-2 rounded-md bg-red-50 dark:bg-red-900/20 px-4 py-3 text-center text-sm font-medium text-red-700 dark:text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {/* Calculate Button */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={calculateCgpa}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-indigo-600 dark:bg-indigo-500 px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-indigo-700 dark:hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-200/50 dark:hover:shadow-indigo-900/30 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Calculator className="h-4 w-4" />
              CGPA ক্যালকুলেট করুন
            </button>
          </div>
        </section>

        <section className="mx-auto mt-10 max-w-2xl">
          <h2 className="mb-4 text-center text-xl font-semibold text-gray-900 dark:text-gray-100">
            National University Bangladesh Grading System
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-130 border-collapse border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-center text-gray-900 dark:text-gray-100">
                    Grade
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-center text-gray-900 dark:text-gray-100">
                    Grade Point
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-center text-gray-900 dark:text-gray-100">
                    Marks Range
                  </th>
                </tr>
              </thead>
              <tbody>
                {GRADES.map((item) => (
                  <tr key={item.grade} className="relative">
                    <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-center font-medium text-gray-900 dark:text-gray-100">
                      {item.grade}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-center text-gray-900 dark:text-gray-100">
                      {item.point.toFixed(2)}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-center text-gray-900 dark:text-gray-100">
                      {item.markRange}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 px-3 py-6 animate-in fade-in duration-200">
          <div className="max-h-full w-full max-w-4xl overflow-y-auto rounded-lg bg-white dark:bg-gray-800 p-4 shadow-2xl sm:p-6 animate-in slide-in-from-bottom-4 duration-300">
            <div className="mb-4 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setResult(null)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-110 active:scale-90"
                aria-label="Close result"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="relative text-center">
              <div className="pointer-events-none absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brandColor/10 dark:bg-brandColor/5" />
              <div className="relative">
                <h2 className="text-2xl font-bold leading-tight text-gray-900 dark:text-gray-100">
                  ToolsTrek
                </h2>
                <h3 className="mt-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Your Result
                </h3>
                <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">
                  {program} - {department} ({year})
                </p>
                <p className="mt-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Name: {studentName.trim()}
                </p>
                <p
                  className={`mt-2 text-2xl font-bold ${
                    parseFloat(result) > 3
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-blue-600 dark:text-blue-400"
                  }`}
                >
                  CGPA: {result}
                </p>

                <div className="mt-5">
                  <ResultTable rows={resultRows} compact />
                </div>

                {parseFloat(result) > 3 && (
                  <p className="mt-4 text-base font-semibold text-emerald-600 dark:text-emerald-400">
                    --- Congratulations on your Outstanding Result! ---
                  </p>
                )}

                <div className="mt-6 flex items-center justify-center">
                  <div className="text-center text-sm text-blue-600 dark:text-blue-400">
                    <p>
                      Result Calculated by ToolsTrek CGPA Calculator |{" "}
                      {new Date().toLocaleDateString()}
                    </p>
                    <p>Copyright © {COPYRIGHT_NAME}</p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    onClick={downloadResult}
                    disabled={isDownloading}
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-600 dark:bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-emerald-700 dark:hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-200/50 dark:hover:shadow-emerald-900/30 disabled:cursor-wait disabled:bg-emerald-300 dark:disabled:bg-emerald-700 transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Download className="h-4 w-4" />
                    {isDownloading ? "Generating..." : "Download Result"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setResult(null)}
                    className="rounded-md bg-gray-600 dark:bg-gray-500 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-gray-700 dark:hover:bg-gray-600 hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-gray-900/30 transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
