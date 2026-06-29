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
  Plus,
  Trash,
  Settings,
  Languages,
  BookOpen,
  Layers,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { Hind_Siliguri } from "next/font/google";

const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const COPYRIGHT_NAME = "Tasnimul Haque";

const PRESETS = {
  standard: {
    id: "standard",
    name: "BUET / Standard Public University",
    nameBn: "বুয়েট / স্ট্যান্ডার্ড পাবলিক বিশ্ববিদ্যালয়",
    grades: [
      { grade: "A+", point: 4.00, range: "80% & above" },
      { grade: "A", point: 3.75, range: "75% to <80%" },
      { grade: "A-", point: 3.50, range: "70% to <75%" },
      { grade: "B+", point: 3.25, range: "65% to <70%" },
      { grade: "B", point: 3.00, range: "60% to <65%" },
      { grade: "B-", point: 2.75, range: "55% to <60%" },
      { grade: "C+", point: 2.50, range: "50% to <55%" },
      { grade: "C", point: 2.25, range: "45% to <50%" },
      { grade: "D", point: 2.00, range: "40% to <45%" },
      { grade: "F", point: 0.00, range: "Less than 40%" }
    ]
  },
  nsu: {
    id: "nsu",
    name: "North South Uni / BRAC / IUB",
    nameBn: "নর্থ সাউথ / ব্র্যাক / আইইউবি",
    grades: [
      { grade: "A", point: 4.00, range: "90% & above" },
      { grade: "A-", point: 3.70, range: "85% to <90%" },
      { grade: "B+", point: 3.30, range: "80% to <85%" },
      { grade: "B", point: 3.00, range: "75% to <80%" },
      { grade: "B-", point: 2.70, range: "70% to <75%" },
      { grade: "C+", point: 2.30, range: "65% to <70%" },
      { grade: "C", point: 2.00, range: "60% to <65%" },
      { grade: "C-", point: 1.70, range: "55% to <60%" },
      { grade: "D+", point: 1.30, range: "50% to <55%" },
      { grade: "D", point: 1.00, range: "45% to <50%" },
      { grade: "F", point: 0.00, range: "Less than 45%" }
    ]
  },
  uiu: {
    id: "uiu",
    name: "United International University (UIU)",
    nameBn: "ইউনাইটেড ইন্টারন্যাশনাল ইউনিভার্সিটি (UIU)",
    grades: [
      { grade: "A", point: 4.00, range: "90% & above" },
      { grade: "A-", point: 3.67, range: "86% to <90%" },
      { grade: "B+", point: 3.33, range: "82% to <86%" },
      { grade: "B", point: 3.00, range: "78% to <82%" },
      { grade: "B-", point: 2.67, range: "74% to <78%" },
      { grade: "C+", point: 2.33, range: "70% to <74%" },
      { grade: "C", point: 2.00, range: "66% to <70%" },
      { grade: "C-", point: 1.67, range: "62% to <66%" },
      { grade: "D+", point: 1.33, range: "58% to <62%" },
      { grade: "D", point: 1.00, range: "55% to <58%" },
      { grade: "F", point: 0.00, range: "Less than 55%" }
    ]
  },
  aiub: {
    id: "aiub",
    name: "AIUB",
    nameBn: "এআইইউবি (AIUB)",
    grades: [
      { grade: "A+", point: 4.00, range: "90% & above" },
      { grade: "A", point: 3.75, range: "85% to <90%" },
      { grade: "B+", point: 3.50, range: "80% to <85%" },
      { grade: "B", point: 3.25, range: "75% to <80%" },
      { grade: "C+", point: 3.00, range: "70% to <75%" },
      { grade: "C", point: 2.75, range: "65% to <70%" },
      { grade: "D+", point: 2.50, range: "60% to <65%" },
      { grade: "D", point: 2.25, range: "50% to <60%" },
      { grade: "F", point: 0.00, range: "Less than 50%" }
    ]
  },
  aust: {
    id: "aust",
    name: "AUST",
    nameBn: "অস্ট (AUST)",
    grades: [
      { grade: "A+", point: 4.00, range: "80% & above" },
      { grade: "A", point: 3.75, range: "75% to <80%" },
      { grade: "A-", point: 3.50, range: "70% to <75%" },
      { grade: "B+", point: 3.25, range: "65% to <70%" },
      { grade: "B", point: 3.00, range: "60% to <65%" },
      { grade: "B-", point: 2.75, range: "55% to <60%" },
      { grade: "C+", point: 2.50, range: "50% to <55%" },
      { grade: "C", point: 2.25, range: "45% to <50%" },
      { grade: "D", point: 2.00, range: "40% to <45%" },
      { grade: "F", point: 0.00, range: "Less than 40%" }
    ]
  },
  custom: {
    id: "custom",
    name: "Custom Scale",
    nameBn: "কাস্টম স্কেল",
    grades: []
  }
};

const TRANSLATIONS = {
  en: {
    title: "University CGPA Calculator",
    subtitle: "Calculate semester GPA, cumulative CGPA, and plan your targets for Private & Public Universities.",
    courseWise: "Course-wise GPA",
    semesterWise: "Semester-wise CGPA",
    targetPlanner: "Target CGPA Planner",
    studentName: "Student Name",
    enterName: "Enter student name",
    universityLabel: "University Name (Optional)",
    uniPlaceholder: "e.g., North South University",
    gradingSystem: "Grading System Profile",
    addCourse: "Add Course",
    clearAll: "Clear All",
    courseCode: "Course Code (Optional)",
    courseTitle: "Course Title / Name (Optional)",
    credits: "Credits",
    grade: "Grade",
    actions: "Actions",
    calculate: "Calculate GPA",
    calculateSemester: "Calculate Cumulative CGPA",
    calculateTarget: "Analyze Target",
    enterGpa: "Enter GPA",
    enterCredits: "Enter Credits",
    completedCredits: "Completed Credits",
    targetCgpa: "Target CGPA",
    currentCgpa: "Current CGPA",
    remainingCredits: "Remaining Credits to Complete",
    result: "Result Analysis",
    cgpaCircle: "CGPA Result",
    semesterLabel: "Semester Name / Label",
    addSemester: "Add Semester",
    errorFillAll: "Please select a grade for all entered courses.",
    errorSemesterFill: "Please enter both GPA and Credits for all semesters.",
    errorPositiveNumbers: "Credits and SGPAs must be positive numbers.",
    errorInvalidGpa: "GPA cannot exceed 4.00 or the max scale point.",
    errorFieldsRequired: "All fields are required.",
    errorCompletedRemaining: "Completed and remaining credits must be greater than 0.",
    imageDownloadBtn: "Download Result Card",
    downloading: "Generating Image...",
    close: "Close",
    targetRequiredHeader: "Required Future GPA",
    targetStatusHeader: "Feasibility Status",
    statusEasy: "Highly Achievable",
    statusMedium: "Achievable / Realistic",
    statusHard: "Difficult (Requires High Focus)",
    statusImpossible: "Mathematically Impossible (> 4.00)",
    statusEasyDesc: "You need a GPA of {gpa} in your remaining credits. This is very achievable!",
    statusMediumDesc: "You need a GPA of {gpa} in your remaining credits. This is standard and realistic.",
    statusHardDesc: "You need a GPA of {gpa} in your remaining credits. You must maintain near-perfect marks.",
    statusImpossibleDesc: "You need a GPA of {gpa} to reach your target, which is above the 4.00 limit.",
    congrats: "Congratulations on your outstanding performance!",
    customScaleTitle: "Customize Letter Grade Points",
    gradeLetter: "Grade",
    gradePoints: "Grade Point",
    resetScale: "Reset Scale",
    sgpa: "SGPA",
    gpaShort: "GPA",
    semesterPlaceholder: "e.g., Semester 1",
    scaleHeader: "Grading Scale Mapping",
  },
  bn: {
    title: "বিশ্ববিদ্যালয় CGPA ক্যালকুলেটর",
    subtitle: "প্রাইভেট এবং পাবলিক বিশ্ববিদ্যালয়ের সেমিস্টার জিপিএ, কিউমুলেটিভ সিজিপিএ হিসাব এবং লক্ষ্য নির্ধারণ করুন।",
    courseWise: "বিষয়-ভিত্তিক GPA",
    semesterWise: "সেমিস্টার-ভিত্তিক CGPA",
    targetPlanner: "টার্গেট CGPA প্ল্যানার",
    studentName: "শিক্ষার্থীর নাম",
    enterName: "আপনার নাম লিখুন",
    universityLabel: "বিশ্ববিদ্যালয়ের নাম (ঐচ্ছিক)",
    uniPlaceholder: "যেমন: নর্থ সাউথ ইউনিভার্সিটি",
    gradingSystem: "গ্রেডিং সিস্টেম প্রোফাইল",
    addCourse: "বিষয় যুক্ত করুন",
    clearAll: "সব মুছুন",
    courseCode: "কোর্স কোড (ঐচ্ছিক)",
    courseTitle: "কোর্সের নাম (ঐচ্ছিক)",
    credits: "ক্রেডিট",
    grade: "গ্রেড",
    actions: "অ্যাকশন",
    calculate: "GPA হিসাব করুন",
    calculateSemester: "CGPA হিসাব করুন",
    calculateTarget: "টার্গেট বিশ্লেষণ করুন",
    enterGpa: "GPA লিখুন",
    enterCredits: "ক্রেডিট লিখুন",
    completedCredits: "সম্পন্নকৃত ক্রেডিট",
    targetCgpa: "টার্গেট CGPA",
    currentCgpa: "বর্তমান CGPA",
    remainingCredits: "বাকি থাকা ক্রেডিট",
    result: "ফলাফল বিশ্লেষণ",
    cgpaCircle: "CGPA ফলাফল",
    semesterLabel: "সেমিস্টারের নাম / লেবেল",
    addSemester: "সেমিস্টার যুক্ত করুন",
    errorFillAll: "অনুগ্রহ করে সব বিষয়ের গ্রেড পূরণ করুন।",
    errorSemesterFill: "অনুগ্রহ করে সব সেমিস্টারের GPA এবং ক্রেডিট পূরণ করুন।",
    errorPositiveNumbers: "ক্রেডিট এবং SGPA অবশ্যই ধনাত্মক সংখ্যা হতে হবে।",
    errorInvalidGpa: "GPA সর্বোচ্চ স্কেল (৪.০০) অতিক্রম করতে পারবে না।",
    errorFieldsRequired: "সবগুলো তথ্য প্রদান করা আবশ্যক।",
    errorCompletedRemaining: "সম্পন্ন এবং বাকি ক্রেডিট অবশ্যই ০ থেকে বেশি হতে হবে।",
    imageDownloadBtn: "ফলাফল কার্ড ডাউনলোড",
    downloading: "ছবি তৈরি হচ্ছে...",
    close: "বন্ধ করুন",
    targetRequiredHeader: "প্রয়োজনীয় ভবিষ্যৎ GPA",
    targetStatusHeader: "অর্জনের সম্ভাব্যতা",
    statusEasy: "সহজেই অর্জনযোগ্য",
    statusMedium: "বাস্তবধর্মী / সম্ভব",
    statusHard: "কঠিন (উচ্চ মনোযোগ প্রয়োজন)",
    statusImpossible: "গাণিতিকভাবে অসম্ভব (> ৪.০০)",
    statusEasyDesc: "বাকি ক্রেডিটগুলোতে আপনার {gpa} GPA প্রয়োজন। এটি সহজেই অর্জনযোগ্য!",
    statusMediumDesc: "বাকি ক্রেডিটগুলোতে আপনার {gpa} GPA প্রয়োজন। এটি বাস্তবসম্মত এবং স্বাভাবিক পরিশ্রমেই সম্ভব।",
    statusHardDesc: "বাকি ক্রেডিটগুলোতে আপনার {gpa} GPA প্রয়োজন। আপনাকে প্রায় নিখুঁত জিপিএ ধরে রাখতে হবে।",
    statusImpossibleDesc: "আপনার টার্গেট স্পর্শ করতে {gpa} GPA প্রয়োজন, যা ৪.০০ সীমার উপরে এবং অসম্ভব।",
    congrats: "আপনার অসামান্য ফলাফলের জন্য অভিনন্দন!",
    customScaleTitle: "লেটার গ্রেড পয়েন্ট কাস্টমাইজ করুন",
    gradeLetter: "গ্রেড",
    gradePoints: "গ্রেড পয়েন্ট",
    resetScale: "রিসেট করুন",
    sgpa: "SGPA",
    gpaShort: "GPA",
    semesterPlaceholder: "যেমন: ১ম সেমিস্টার",
    scaleHeader: "গ্রেডিং স্কেলের তালিকা",
  }
};

// Portal-based grade selector to avoid table clipping issues
function GradeSelect({ value, grades, onChange, placeholder }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownStyle, setDropdownStyle] = useState({});
  const buttonRef = useRef(null);
  const inputRef = useRef(null);

  const filteredGrades = grades.filter((item) =>
    item.grade.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const selectedGrade = grades.find((item) => item.grade === value);

  useEffect(() => {
    if (!isOpen || !buttonRef.current) return;

    const updatePosition = () => {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;
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
      <div
        className="fixed inset-0"
        style={{ zIndex: 9998 }}
        onClick={() => {
          setIsOpen(false);
          setSearchTerm("");
        }}
      />
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
            placeholder="Search..."
            className="w-full rounded-md border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-2 py-1 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        <div className="py-1 max-h-48 overflow-y-auto">
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
              No results found
            </div>
          )}
        </div>
      </div>
    </>
  ) : null;

  return (
    <div className="relative inline-block w-full">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-11 w-full items-center justify-between rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 text-sm text-gray-900 dark:text-gray-100 transition-all duration-200 hover:border-indigo-400 focus:border-indigo-500"
      >
        <span className={selectedGrade ? "text-gray-900 dark:text-gray-100" : "text-gray-400 dark:text-gray-500"}>
          {selectedGrade ? `${selectedGrade.grade} (${selectedGrade.point.toFixed(2)})` : placeholder}
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {typeof document !== "undefined" && ReactDOM.createPortal(dropdown, document.body)}
    </div>
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

export default function UniCGPACalculator() {
  const [lang, setLang] = useState("en"); // Toggle 'en' and 'bn'
  const [tab, setTab] = useState("course"); // 'course' | 'semester' | 'target'
  const [studentName, setStudentName] = useState("");
  const [university, setUniversity] = useState("");
  const [presetKey, setPresetKey] = useState("standard");
  const [customGrades, setCustomGrades] = useState([]);
  const [isEditingScale, setIsEditingScale] = useState(false);

  // Course Mode State
  const [courses, setCourses] = useState([
    { id: 1, code: "", name: "", credit: "3.0", grade: "" },
    { id: 2, code: "", name: "", credit: "3.0", grade: "" },
    { id: 3, code: "", name: "", credit: "3.0", grade: "" },
    { id: 4, code: "", name: "", credit: "3.0", grade: "" },
    { id: 5, code: "", name: "", credit: "1.5", grade: "" },
  ]);

  // Semester Mode State
  const [semesters, setSemesters] = useState([
    { id: 1, label: "", gpa: "", credit: "" },
    { id: 2, label: "", gpa: "", credit: "" },
  ]);

  // Target Planner State
  const [targetParams, setTargetParams] = useState({
    target: "",
    completedCredits: "",
    currentCgpa: "",
    remainingCredits: "",
  });

  // Output States
  const [result, setResult] = useState(null); // Holds result object depending on mode
  const [error, setError] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);

  // Translation helper
  const t = (key) => TRANSLATIONS[lang][key] || key;

  // Initialize custom grades list when preset changes
  useEffect(() => {
    if (presetKey !== "custom") {
      setCustomGrades([...PRESETS[presetKey].grades]);
    } else if (customGrades.length === 0) {
      setCustomGrades([...PRESETS["standard"].grades]);
    }
  }, [presetKey]);

  // Active grades list
  const activeGrades = useMemo(() => {
    return presetKey === "custom" ? customGrades : PRESETS[presetKey].grades;
  }, [presetKey, customGrades]);

  // Find grade points mapping
  const getPointForGrade = (gradeLetter) => {
    return activeGrades.find((g) => g.grade === gradeLetter)?.point ?? 0;
  };

  // Switch tabs
  const handleTabChange = (newTab) => {
    setTab(newTab);
    setResult(null);
    setError("");
  };

  // Course actions
  const addCourse = () => {
    const nextId = courses.length ? Math.max(...courses.map((c) => c.id)) + 1 : 1;
    setCourses([...courses, { id: nextId, code: "", name: "", credit: "3.0", grade: "" }]);
    setResult(null);
  };

  const deleteCourse = (id) => {
    setCourses(courses.filter((c) => c.id !== id));
    setResult(null);
  };

  const updateCourse = (id, field, value) => {
    setCourses(courses.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
    setResult(null);
  };

  const clearCourses = () => {
    setCourses([
      { id: 1, code: "", name: "", credit: "3.0", grade: "" },
      { id: 2, code: "", name: "", credit: "3.0", grade: "" },
    ]);
    setResult(null);
    setError("");
  };

  // Custom scale editing
  const updateCustomGradePoint = (index, value) => {
    const newGrades = [...customGrades];
    const parsedVal = parseFloat(value);
    newGrades[index].point = isNaN(parsedVal) ? 0 : Math.min(4.00, Math.max(0, parsedVal));
    setCustomGrades(newGrades);
    setResult(null);
  };

  const resetCustomScale = () => {
    setCustomGrades([...PRESETS["standard"].grades]);
    setResult(null);
  };

  // Semester actions
  const addSemester = () => {
    const nextId = semesters.length ? Math.max(...semesters.map((s) => s.id)) + 1 : 1;
    setSemesters([...semesters, { id: nextId, label: "", gpa: "", credit: "" }]);
    setResult(null);
  };

  const deleteSemester = (id) => {
    setSemesters(semesters.filter((s) => s.id !== id));
    setResult(null);
  };

  const updateSemester = (id, field, value) => {
    setSemesters(semesters.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
    setResult(null);
  };

  const clearSemesters = () => {
    setSemesters([
      { id: 1, label: "", gpa: "", credit: "" },
      { id: 2, label: "", gpa: "", credit: "" },
    ]);
    setResult(null);
    setError("");
  };

  // Calculation logics
  const calculateCourseGpa = () => {
    setError("");
    setResult(null);

    const validCourses = courses.filter((c) => c.credit.trim() || c.grade);

    if (validCourses.length === 0) {
      setError(t("errorFillAll"));
      return;
    }

    const hasIncomplete = validCourses.some((c) => !c.grade || !c.credit.trim());
    if (hasIncomplete) {
      setError(t("errorFillAll"));
      return;
    }

    let totalCredits = 0;
    let weightedPoints = 0;

    for (let course of validCourses) {
      const creditNum = parseFloat(course.credit);
      const gradeVal = getPointForGrade(course.grade);

      if (isNaN(creditNum) || creditNum <= 0) {
        setError(t("errorPositiveNumbers"));
        return;
      }

      totalCredits += creditNum;
      weightedPoints += creditNum * gradeVal;
    }

    const gpa = totalCredits > 0 ? (weightedPoints / totalCredits).toFixed(2) : "0.00";

    setResult({
      type: "course",
      gpa,
      totalCredits,
      rows: validCourses.map((c) => ({
        code: c.code || "-",
        name: c.name || "-",
        credit: parseFloat(c.credit).toFixed(1),
        grade: c.grade,
        point: getPointForGrade(c.grade).toFixed(2),
      })),
    });
  };

  const calculateSemesterCgpa = () => {
    setError("");
    setResult(null);

    const validSems = semesters.filter((s) => s.gpa.trim() || s.credit.trim());

    if (validSems.length === 0) {
      setError(t("errorSemesterFill"));
      return;
    }

    const hasIncomplete = validSems.some((s) => !s.gpa.trim() || !s.credit.trim());
    if (hasIncomplete) {
      setError(t("errorSemesterFill"));
      return;
    }

    let totalCredits = 0;
    let weightedPoints = 0;

    for (let sem of validSems) {
      const gpaNum = parseFloat(sem.gpa);
      const creditNum = parseFloat(sem.credit);

      if (isNaN(gpaNum) || isNaN(creditNum) || gpaNum < 0 || creditNum <= 0) {
        setError(t("errorPositiveNumbers"));
        return;
      }

      if (gpaNum > 4.00) {
        setError(t("errorInvalidGpa"));
        return;
      }

      totalCredits += creditNum;
      weightedPoints += gpaNum * creditNum;
    }

    const cgpa = totalCredits > 0 ? (weightedPoints / totalCredits).toFixed(2) : "0.00";

    setResult({
      type: "semester",
      cgpa,
      totalCredits,
      rows: validSems.map((s, idx) => ({
        label: s.label.trim() || `${lang === "bn" ? "" : "Semester "}${idx + 1}`,
        gpa: parseFloat(s.gpa).toFixed(2),
        credit: parseFloat(s.credit).toFixed(1),
      })),
    });
  };

  const calculateTargetPlanner = () => {
    setError("");
    setResult(null);

    const { target, completedCredits, currentCgpa, remainingCredits } = targetParams;

    if (!target.trim() || !completedCredits.trim() || !currentCgpa.trim() || !remainingCredits.trim()) {
      setError(t("errorFieldsRequired"));
      return;
    }

    const targetVal = parseFloat(target);
    const completedVal = parseFloat(completedCredits);
    const currentVal = parseFloat(currentCgpa);
    const remainingVal = parseFloat(remainingCredits);

    if (
      isNaN(targetVal) ||
      isNaN(completedVal) ||
      isNaN(currentVal) ||
      isNaN(remainingVal) ||
      targetVal < 0 ||
      completedVal < 0 ||
      currentVal < 0 ||
      remainingVal < 0
    ) {
      setError(t("errorPositiveNumbers"));
      return;
    }

    if (targetVal > 4.00 || currentVal > 4.00) {
      setError(t("errorInvalidGpa"));
      return;
    }

    if (completedVal <= 0 || remainingVal <= 0) {
      setError(t("errorCompletedRemaining"));
      return;
    }

    // Math: Target CGPA = ((Current CGPA * Completed Credits) + (Required GPA * Remaining Credits)) / Total Credits
    // Required GPA * Remaining Credits = (Target CGPA * Total Credits) - (Current CGPA * Completed Credits)
    // Required GPA = ((Target CGPA * Total Credits) - (Current CGPA * Completed Credits)) / Remaining Credits
    const totalCredits = completedVal + remainingVal;
    const requiredGpa = ((targetVal * totalCredits) - (currentVal * completedVal)) / remainingVal;

    let status = "medium";
    let statusLabel = t("statusMedium");
    let descTemplate = t("statusMediumDesc");

    if (requiredGpa > 4.00) {
      status = "impossible";
      statusLabel = t("statusImpossible");
      descTemplate = t("statusImpossibleDesc");
    } else if (requiredGpa >= 3.60) {
      status = "hard";
      statusLabel = t("statusHard");
      descTemplate = t("statusHardDesc");
    } else if (requiredGpa < 2.50) {
      status = "easy";
      statusLabel = t("statusEasy");
      descTemplate = t("statusEasyDesc");
    }

    const finalRequired = requiredGpa < 0 ? "0.00" : requiredGpa.toFixed(2);
    const statusDescription = descTemplate.replace("{gpa}", finalRequired);

    setResult({
      type: "target",
      target: targetVal.toFixed(2),
      completed: completedVal.toFixed(1),
      current: currentVal.toFixed(2),
      remaining: remainingVal.toFixed(1),
      required: finalRequired,
      status,
      statusLabel,
      description: statusDescription,
    });
  };

  // Canvas result image exporter
  const downloadResultImage = async () => {
    if (!result) return;
    setIsDownloading(true);

    try {
      await document.fonts?.ready;
      const width = 1200;
      const rowHeight = 58;
      const presetName = presetKey === "custom" ? t("customScale") : PRESETS[presetKey].name;

      let tableHeight = 0;
      let resultRowsLength = 0;

      if (result.type === "course") {
        resultRowsLength = result.rows.length;
      } else if (result.type === "semester") {
        resultRowsLength = result.rows.length;
      } else {
        resultRowsLength = 4; // Target planner table length
      }

      tableHeight = 56 + resultRowsLength * rowHeight;
      const height = Math.max(760, 430 + tableHeight);

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      const canvasFont = "Arial, sans-serif";

      // 1. Solid White Background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);

      // 2. Artistic Background Soft Glow
      ctx.fillStyle = "rgba(79, 70, 229, 0.06)";
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, 180, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "rgba(16, 185, 129, 0.04)";
      ctx.beginPath();
      ctx.arc(width - 150, 150, 120, 0, Math.PI * 2);
      ctx.fill();

      // 3. Header Section
      ctx.textAlign = "center";
      ctx.fillStyle = "#111827";
      ctx.font = `700 46px ${canvasFont}`;
      ctx.fillText("ToolsTrek", width / 2, 78);

      ctx.font = `700 30px ${canvasFont}`;
      ctx.fillStyle = "#4b5563";
      ctx.fillText(t("title"), width / 2, 124);

      // Student/University Metadata Subtitles
      let metaY = 168;
      const details = [];
      if (studentName.trim()) details.push(`${t("studentName")}: ${studentName.trim()}`);
      if (university.trim()) details.push(`University: ${university.trim()}`);
      if (result.type === "course") details.push(`Scale: ${presetName}`);

      if (details.length > 0) {
        ctx.font = `600 20px ${canvasFont}`;
        ctx.fillStyle = "#1f2937";
        ctx.fillText(details.join("  |  "), width / 2, metaY);
        metaY += 34;
      }

      // 4. CGPA Center Badge
      const cgpaScore = result.type === "course" ? result.gpa : result.type === "semester" ? result.cgpa : result.target;
      const cgpaScoreNum = parseFloat(cgpaScore);
      const isExcellent = cgpaScoreNum >= 3.50;

      ctx.font = `800 56px ${canvasFont}`;
      ctx.fillStyle = isExcellent ? "#059669" : "#2563eb";
      
      let labelText = "CGPA";
      if (result.type === "course") labelText = "SGPA";
      if (result.type === "target") labelText = "Target CGPA";

      ctx.fillText(`${labelText}: ${cgpaScore}`, width / 2, metaY + 34);
      metaY += 66;

      // Draw horizontal dividing line
      ctx.strokeStyle = "#e5e7eb";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(100, metaY);
      ctx.lineTo(width - 100, metaY);
      ctx.stroke();

      metaY += 40;

      // 5. Render Tables depending on calculation type
      const startX = 100;
      const tableWidth = 1000;
      let currentY = metaY;

      if (result.type === "course") {
        const columns = [200, 380, 140, 140, 140];
        const headers = ["Course Code", "Course Title", "Credits", "Grade", "Point"];

        // Header bg
        ctx.fillStyle = "#f3f4f6";
        ctx.fillRect(startX, currentY, tableWidth, 56);
        ctx.strokeStyle = "#d1d5db";
        ctx.strokeRect(startX, currentY, tableWidth, 56);

        // Header texts
        ctx.textAlign = "left";
        ctx.fillStyle = "#111827";
        ctx.font = `700 18px ${canvasFont}`;
        let colX = startX;
        headers.forEach((h, idx) => {
          ctx.strokeRect(colX, currentY, columns[idx], 56);
          ctx.fillText(h, colX + 16, currentY + 35);
          colX += columns[idx];
        });
        currentY += 56;

        // Row values
        ctx.font = `400 16px ${canvasFont}`;
        result.rows.forEach((row) => {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(startX, currentY, tableWidth, rowHeight);

          let rowX = startX;
          columns.forEach((colWidth) => {
            ctx.strokeStyle = "#e5e7eb";
            ctx.strokeRect(rowX, currentY, colWidth, rowHeight);
            rowX += colWidth;
          });

          ctx.fillStyle = "#374151";
          ctx.fillText(row.code, startX + 16, currentY + 34);

          wrapCanvasText(ctx, row.name, startX + columns[0] + 16, currentY + 22, columns[1] - 32, 20);

          ctx.textAlign = "center";
          ctx.fillText(row.credit, startX + columns[0] + columns[1] + columns[2] / 2, currentY + 35);
          ctx.fillText(row.grade, startX + columns[0] + columns[1] + columns[2] + columns[3] / 2, currentY + 35);
          ctx.fillText(row.point, startX + columns[0] + columns[1] + columns[2] + columns[3] + columns[4] / 2, currentY + 35);
          ctx.textAlign = "left";

          currentY += rowHeight;
        });

        // Summary Line
        ctx.fillStyle = "#f9fafb";
        ctx.fillRect(startX, currentY, tableWidth, rowHeight);
        ctx.strokeStyle = "#d1d5db";
        ctx.strokeRect(startX, currentY, tableWidth, rowHeight);
        ctx.font = `700 18px ${canvasFont}`;
        ctx.fillStyle = "#111827";
        ctx.fillText(`Total Credits Completed: ${result.totalCredits.toFixed(1)}`, startX + 16, currentY + 35);
        ctx.textAlign = "right";
        ctx.fillText(`Calculated SGPA: ${result.gpa}`, startX + tableWidth - 16, currentY + 35);
        ctx.textAlign = "left";
        currentY += rowHeight;

      } else if (result.type === "semester") {
        const columns = [500, 250, 250];
        const headers = ["Semester Name", "SGPA", "Credits"];

        ctx.fillStyle = "#f3f4f6";
        ctx.fillRect(startX, currentY, tableWidth, 56);
        ctx.strokeStyle = "#d1d5db";
        ctx.strokeRect(startX, currentY, tableWidth, 56);

        ctx.textAlign = "left";
        ctx.fillStyle = "#111827";
        ctx.font = `700 18px ${canvasFont}`;
        let colX = startX;
        headers.forEach((h, idx) => {
          ctx.strokeRect(colX, currentY, columns[idx], 56);
          ctx.fillText(h, colX + 16, currentY + 35);
          colX += columns[idx];
        });
        currentY += 56;

        ctx.font = `400 16px ${canvasFont}`;
        result.rows.forEach((row) => {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(startX, currentY, tableWidth, rowHeight);

          let rowX = startX;
          columns.forEach((colWidth) => {
            ctx.strokeStyle = "#e5e7eb";
            ctx.strokeRect(rowX, currentY, colWidth, rowHeight);
            rowX += colWidth;
          });

          ctx.fillStyle = "#374151";
          ctx.fillText(row.label, startX + 16, currentY + 35);

          ctx.textAlign = "center";
          ctx.fillText(row.gpa, startX + columns[0] + columns[1] / 2, currentY + 35);
          ctx.fillText(row.credit, startX + columns[0] + columns[1] + columns[2] / 2, currentY + 35);
          ctx.textAlign = "left";

          currentY += rowHeight;
        });

        // Summary line
        ctx.fillStyle = "#f9fafb";
        ctx.fillRect(startX, currentY, tableWidth, rowHeight);
        ctx.strokeStyle = "#d1d5db";
        ctx.strokeRect(startX, currentY, tableWidth, rowHeight);
        ctx.font = `700 18px ${canvasFont}`;
        ctx.fillStyle = "#111827";
        ctx.fillText(`Total Credits: ${result.totalCredits.toFixed(1)}`, startX + 16, currentY + 35);
        ctx.textAlign = "right";
        ctx.fillText(`Cumulative CGPA: ${result.cgpa}`, startX + tableWidth - 16, currentY + 35);
        ctx.textAlign = "left";
        currentY += rowHeight;

      } else if (result.type === "target") {
        // Target Summary Table
        const params = [
          { label: "Target CGPA Goal", val: result.target },
          { label: "Completed Credits & Current CGPA", val: `${result.completed} Credits @ ${result.current}` },
          { label: "Remaining Credits to Complete", val: `${result.remaining} Credits` },
          { label: "Required Average Future GPA", val: result.required },
        ];

        const labelCol = 450;
        const valCol = 550;

        ctx.strokeStyle = "#d1d5db";
        ctx.fillStyle = "#ffffff";

        params.forEach((param, idx) => {
          // Alternative coloring
          ctx.fillStyle = idx % 2 === 0 ? "#f9fafb" : "#ffffff";
          ctx.fillRect(startX, currentY, tableWidth, rowHeight);

          ctx.strokeRect(startX, currentY, labelCol, rowHeight);
          ctx.strokeRect(startX + labelCol, currentY, valCol, rowHeight);

          ctx.fillStyle = "#111827";
          ctx.font = `700 16px ${canvasFont}`;
          ctx.fillText(param.label, startX + 16, currentY + 35);

          ctx.font = `400 16px ${canvasFont}`;
          ctx.fillStyle = idx === 3 ? (result.status === "impossible" ? "#dc2626" : "#059669") : "#374151";
          if (idx === 3) ctx.font = `700 18px ${canvasFont}`;
          ctx.fillText(param.val, startX + labelCol + 16, currentY + 35);

          currentY += rowHeight;
        });

        // Feasibility Description Banner
        currentY += 20;
        ctx.fillStyle = result.status === "impossible" ? "#fef2f2" : "#f0fdf4";
        ctx.fillRect(startX, currentY, tableWidth, 68);
        ctx.strokeStyle = result.status === "impossible" ? "#fecaca" : "#bbf7d0";
        ctx.strokeRect(startX, currentY, tableWidth, 68);

        ctx.fillStyle = result.status === "impossible" ? "#991b1b" : "#166534";
        ctx.font = `700 16px ${canvasFont}`;
        ctx.fillText(`Feasibility Status: ${result.statusLabel}`, startX + 20, currentY + 28);
        ctx.font = `400 15px ${canvasFont}`;
        ctx.fillText(result.description, startX + 20, currentY + 50);

        currentY += 88;
      }

      // 6. Outstanding result text
      if (cgpaScoreNum >= 3.50 && result.type !== "target") {
        ctx.textAlign = "center";
        ctx.fillStyle = "#059669";
        ctx.font = `700 20px ${canvasFont}`;
        ctx.fillText(`--- ${t("congrats")} ---`, width / 2, currentY + 25);
        currentY += 45;
      }

      // 7. Footer details
      const footerY = height - 120;
      ctx.strokeStyle = "#e5e7eb";
      ctx.beginPath();
      ctx.moveTo(100, footerY);
      ctx.lineTo(width - 100, footerY);
      ctx.stroke();

      ctx.textAlign = "center";
      ctx.fillStyle = "#4b5563";
      ctx.font = `500 16px ${canvasFont}`;
      ctx.fillText(
        `Result Calculated by ToolsTrek CGPA Calculator | ${new Date().toLocaleDateString()}`,
        width / 2,
        footerY + 34,
      );
      ctx.fillText(`Copyright © ${COPYRIGHT_NAME}`, width / 2, footerY + 62);

      // Trigger download
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      const safeName = studentName.trim()
        .replace(/[\\/:*?"<>|]+/g, "-")
        .replace(/\s+/g, "-")
        .replace(/^-|-$/g, "");
      link.download = `ToolsTrek-CGPA-${safeName || "Student"}-${cgpaScore}.png`;
      link.click();

    } catch (e) {
      console.error(e);
      setError("Failed to export image. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className={`${hindSiliguri.className} min-h-screen bg-[#f9fafb] dark:bg-gray-900 px-4 pb-12 pt-24 text-gray-900 dark:text-gray-100 transition-colors duration-200`}>
      <div className="mx-auto max-w-5xl">
        
        {/* Toggle Language & Back links */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="text-sm font-semibold tracking-wide text-gray-500 dark:text-gray-400">
              ToolsTrek CGPA Calculator
            </span>
          </div>

          <button
            type="button"
            onClick={() => setLang(lang === "en" ? "bn" : "en")}
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-1.5 text-xs font-semibold shadow-sm transition-all hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95"
          >
            <Languages className="h-3.5 w-3.5" />
            {lang === "en" ? "বাংলা সংস্করণ" : "English Version"}
          </button>
        </div>

        {/* Title */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            {t("title")}
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-base text-gray-500 dark:text-gray-400">
            {t("subtitle")}
          </p>
        </div>

        {/* Tabs navigation */}
        <div className="mb-8 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap -mb-px justify-center md:justify-start gap-2">
            <button
              onClick={() => handleTabChange("course")}
              className={`inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all ${
                tab === "course"
                  ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              <BookOpen className="h-4 w-4" />
              {t("courseWise")}
            </button>

            <button
              onClick={() => handleTabChange("semester")}
              className={`inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all ${
                tab === "semester"
                  ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              <Layers className="h-4 w-4" />
              {t("semesterWise")}
            </button>

            <button
              onClick={() => handleTabChange("target")}
              className={`inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all ${
                tab === "target"
                  ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              <Sparkles className="h-4 w-4" />
              {t("targetPlanner")}
            </button>
          </div>
        </div>

        {/* Core calculation shell */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Form Area */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Student metadata fields */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-5 shadow-sm space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold tracking-wide uppercase text-gray-500 dark:text-gray-400">
                    {t("studentName")}
                  </span>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder={t("enterName")}
                    className="h-11 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/40"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold tracking-wide uppercase text-gray-500 dark:text-gray-400">
                    {t("universityLabel")}
                  </span>
                  <input
                    type="text"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    placeholder={t("uniPlaceholder")}
                    className="h-11 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/40"
                  />
                </label>
              </div>

              {/* Grading system (only for Course-wise mode) */}
              {tab === "course" && (
                <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <label className="block flex-1">
                      <span className="mb-1.5 block text-xs font-semibold tracking-wide uppercase text-gray-500 dark:text-gray-400">
                        {t("gradingSystem")}
                      </span>
                      <div className="relative">
                        <select
                          value={presetKey}
                          onChange={(e) => {
                            setPresetKey(e.target.value);
                            setResult(null);
                          }}
                          className="h-11 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/40 appearance-none pr-10"
                        >
                          {Object.keys(PRESETS).map((key) => (
                            <option key={key} value={key}>
                              {lang === "bn" ? PRESETS[key].nameBn : PRESETS[key].name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-gray-400 pointer-events-none" />
                      </div>
                    </label>

                    <button
                      type="button"
                      onClick={() => setIsEditingScale(!isEditingScale)}
                      className="mt-6 md:mt-0 inline-flex h-11 items-center justify-center gap-2 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 px-4 text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-600 transition"
                    >
                      <Settings className="h-4 w-4" />
                      {t("customScaleTitle")}
                    </button>
                  </div>

                  {/* Expandable scale editor */}
                  {isEditingScale && (
                    <div className="mt-4 rounded-lg bg-gray-50 dark:bg-gray-900 p-4 border border-gray-100 dark:border-gray-800 animate-in slide-in-from-top-4 duration-200">
                      <div className="mb-3 flex items-center justify-between">
                        <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">
                          {t("customScaleTitle")}
                        </h4>
                        {presetKey !== "custom" && (
                          <span className="text-xs text-amber-600 dark:text-amber-400">
                            * Selected preset points are view-only. Change profile to "Custom Scale" to edit.
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {activeGrades.map((g, idx) => (
                          <div key={g.grade} className="flex items-center gap-2 bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700">
                            <span className="text-sm font-bold text-gray-700 dark:text-gray-300 w-8">{g.grade}</span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              max="4.00"
                              disabled={presetKey !== "custom"}
                              value={g.point}
                              onChange={(e) => updateCustomGradePoint(idx, e.target.value)}
                              className="w-full bg-transparent border-b border-gray-300 dark:border-gray-600 text-sm focus:outline-none focus:border-indigo-500 font-medium text-center"
                            />
                          </div>
                        ))}
                      </div>
                      {presetKey === "custom" && (
                        <div className="mt-3 flex justify-end">
                          <button
                            type="button"
                            onClick={resetCustomScale}
                            className="text-xs text-red-500 hover:text-red-700 font-semibold"
                          >
                            {t("resetScale")}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* TAB 1: Course Wise GPA Calculator */}
            {tab === "course" && (
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
                  <h3 className="text-md font-bold text-gray-800 dark:text-gray-200">
                    {t("courseWise")}
                  </h3>
                  <button
                    type="button"
                    onClick={clearCourses}
                    className="text-xs text-red-500 hover:text-red-700 font-semibold transition"
                  >
                    {t("clearAll")}
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px] text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700 text-left text-gray-500 dark:text-gray-400">
                        <th className="pb-3 w-1/4 font-semibold">{t("courseCode")}</th>
                        <th className="pb-3 w-1/3 font-semibold">{t("courseTitle")}</th>
                        <th className="pb-3 w-1/6 font-semibold">{t("credits")}</th>
                        <th className="pb-3 w-1/5 font-semibold text-center">{t("grade")}</th>
                        <th className="pb-3 w-12 text-center">{t("actions")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {courses.map((course) => (
                        <tr key={course.id} className="group">
                          <td className="py-2.5 pr-2">
                            <input
                              type="text"
                              value={course.code}
                              onChange={(e) => updateCourse(course.id, "code", e.target.value)}
                              placeholder="e.g. CSE-101"
                              className="h-10 w-full rounded border border-gray-200 dark:border-gray-700 bg-transparent px-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/20"
                            />
                          </td>
                          <td className="py-2.5 pr-2">
                            <input
                              type="text"
                              value={course.name}
                              onChange={(e) => updateCourse(course.id, "name", e.target.value)}
                              placeholder="e.g. Structured Programming"
                              className="h-10 w-full rounded border border-gray-200 dark:border-gray-700 bg-transparent px-2 text-sm focus:border-indigo-500 focus:outline-none"
                            />
                          </td>
                          <td className="py-2.5 pr-2">
                            <select
                              value={course.credit}
                              onChange={(e) => updateCourse(course.id, "credit", e.target.value)}
                              className="h-10 w-full rounded border border-gray-200 dark:border-gray-700 bg-transparent px-2 text-sm focus:border-indigo-500 focus:outline-none"
                            >
                              <option value="1.0">1.0</option>
                              <option value="1.5">1.5</option>
                              <option value="2.0">2.0</option>
                              <option value="3.0">3.0</option>
                              <option value="4.0">4.0</option>
                              <option value="0.0">0.0 (Non-credit)</option>
                            </select>
                          </td>
                          <td className="py-2.5 pr-2 text-center">
                            <GradeSelect
                              value={course.grade}
                              grades={activeGrades}
                              onChange={(val) => updateCourse(course.id, "grade", val)}
                              placeholder="Grade"
                            />
                          </td>
                          <td className="py-2.5 text-center">
                            <button
                              type="button"
                              onClick={() => deleteCourse(course.id)}
                              disabled={courses.length <= 1}
                              className="text-gray-400 hover:text-red-500 disabled:opacity-30 disabled:pointer-events-none p-1.5 rounded transition hover:bg-red-50 dark:hover:bg-red-950/20"
                            >
                              <Trash className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-4">
                  <button
                    type="button"
                    onClick={addCourse}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                  >
                    <Plus className="h-4 w-4" />
                    {t("addCourse")}
                  </button>

                  <button
                    type="button"
                    onClick={calculateCourseGpa}
                    className="inline-flex items-center gap-2 rounded-md bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition shadow-sm"
                  >
                    <Calculator className="h-4 w-4" />
                    {t("calculate")}
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: Semester Wise Cumulative Calculator */}
            {tab === "semester" && (
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
                  <h3 className="text-md font-bold text-gray-800 dark:text-gray-200">
                    {t("semesterWise")}
                  </h3>
                  <button
                    type="button"
                    onClick={clearSemesters}
                    className="text-xs text-red-500 hover:text-red-700 font-semibold transition"
                  >
                    {t("clearAll")}
                  </button>
                </div>

                <div className="space-y-3">
                  {semesters.map((sem, idx) => (
                    <div key={sem.id} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-center bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                      <div className="sm:col-span-2">
                        <label className="block">
                          <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                            {t("semesterLabel")}
                          </span>
                          <input
                            type="text"
                            value={sem.label}
                            onChange={(e) => updateSemester(sem.id, "label", e.target.value)}
                            placeholder={`${t("semesterPlaceholder")} ${idx + 1}`}
                            className="h-10 w-full rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-850 px-3 text-sm focus:border-indigo-500 focus:outline-none"
                          />
                        </label>
                      </div>

                      <div>
                        <label className="block">
                          <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                            {t("enterGpa")} (SGPA)
                          </span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="4.0"
                            value={sem.gpa}
                            onChange={(e) => updateSemester(sem.id, "gpa", e.target.value)}
                            placeholder="e.g. 3.75"
                            className="h-10 w-full rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-850 px-3 text-sm focus:border-indigo-500 focus:outline-none text-center"
                          />
                        </label>
                      </div>

                      <div className="flex items-end gap-2">
                        <div className="flex-1">
                          <label className="block">
                            <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                              {t("credits")}
                            </span>
                            <input
                              type="number"
                              step="0.5"
                              min="1"
                              value={sem.credit}
                              onChange={(e) => updateSemester(sem.id, "credit", e.target.value)}
                              placeholder="e.g. 15"
                              className="h-10 w-full rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-850 px-3 text-sm focus:border-indigo-500 focus:outline-none text-center"
                            />
                          </label>
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => deleteSemester(sem.id)}
                          disabled={semesters.length <= 1}
                          className="h-10 w-10 text-gray-400 hover:text-red-500 disabled:opacity-30 disabled:pointer-events-none rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-850 flex items-center justify-center transition"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-4">
                  <button
                    type="button"
                    onClick={addSemester}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                  >
                    <Plus className="h-4 w-4" />
                    {t("addSemester")}
                  </button>

                  <button
                    type="button"
                    onClick={calculateSemesterCgpa}
                    className="inline-flex items-center gap-2 rounded-md bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition shadow-sm"
                  >
                    <Calculator className="h-4 w-4" />
                    {t("calculateSemester")}
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: Target CGPA Goal Planner */}
            {tab === "target" && (
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-5 shadow-sm space-y-4">
                <h3 className="text-md font-bold text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-gray-700 pb-3">
                  {t("targetPlanner")}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold tracking-wide uppercase text-gray-500 dark:text-gray-400">
                      {t("targetCgpa")} Goal
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      max="4.00"
                      value={targetParams.target}
                      onChange={(e) => setTargetParams({ ...targetParams, target: e.target.value })}
                      placeholder="e.g. 3.50"
                      className="h-11 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/40"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold tracking-wide uppercase text-gray-500 dark:text-gray-400">
                      {t("currentCgpa")}
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      max="4.00"
                      value={targetParams.currentCgpa}
                      onChange={(e) => setTargetParams({ ...targetParams, currentCgpa: e.target.value })}
                      placeholder="e.g. 3.25"
                      className="h-11 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/40"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold tracking-wide uppercase text-gray-500 dark:text-gray-400">
                      {t("completedCredits")}
                    </span>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      value={targetParams.completedCredits}
                      onChange={(e) => setTargetParams({ ...targetParams, completedCredits: e.target.value })}
                      placeholder="e.g. 60"
                      className="h-11 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/40"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold tracking-wide uppercase text-gray-500 dark:text-gray-400">
                      {t("remainingCredits")}
                    </span>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      value={targetParams.remainingCredits}
                      onChange={(e) => setTargetParams({ ...targetParams, remainingCredits: e.target.value })}
                      placeholder="e.g. 45"
                      className="h-11 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/40"
                    />
                  </label>
                </div>

                <div className="mt-4 flex justify-end border-t border-gray-100 dark:border-gray-700 pt-4">
                  <button
                    type="button"
                    onClick={calculateTargetPlanner}
                    className="inline-flex items-center gap-2 rounded-md bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition shadow-sm"
                  >
                    <Calculator className="h-4 w-4" />
                    {t("calculateTarget")}
                  </button>
                </div>
              </div>
            )}

            {/* General Error Banner */}
            {error && (
              <div className="flex items-center gap-2.5 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900/50 p-4 text-sm font-medium text-red-800 dark:text-red-400 animate-pulse">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

          </div>

          {/* Results Summary Sidebar (Right column) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-5 shadow-sm space-y-6">
              
              <div className="border-b border-gray-100 dark:border-gray-700 pb-3">
                <h3 className="text-md font-bold text-gray-800 dark:text-gray-200">
                  {t("result")}
                </h3>
              </div>

              {!result ? (
                <div className="text-center py-12 text-gray-400 dark:text-gray-500">
                  <Calculator className="h-12 w-12 mx-auto mb-3 opacity-30 text-indigo-600" />
                  <p className="text-sm font-medium">
                    {lang === "bn" ? "তথ্য পূরণ করে ক্যালকুলেট করুন" : "Fill data and click calculate to view results"}
                  </p>
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in duration-300">
                  
                  {/* Gauge Graphic */}
                  <div className="flex flex-col items-center justify-center">
                    <div className="relative flex items-center justify-center h-40 w-40">
                      {/* SVG Gauge circle */}
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="80"
                          cy="80"
                          r="70"
                          className="stroke-gray-100 dark:stroke-gray-700"
                          strokeWidth="10"
                          fill="transparent"
                        />
                        <circle
                          cx="80"
                          cy="80"
                          r="70"
                          className="stroke-indigo-600 dark:stroke-indigo-400 transition-all duration-1000 ease-out"
                          strokeWidth="10"
                          fill="transparent"
                          strokeDasharray={440}
                          strokeDashoffset={
                            440 -
                            (440 *
                              Math.min(
                                4.0,
                                parseFloat(
                                  result.type === "course"
                                    ? result.gpa
                                    : result.type === "semester"
                                    ? result.cgpa
                                    : result.target
                                )
                              )) /
                              4.0
                          }
                          strokeLinecap="round"
                        />
                      </svg>
                      
                      {/* Inside Texts */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                          {result.type === "course"
                            ? result.gpa
                            : result.type === "semester"
                            ? result.cgpa
                            : result.target}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mt-1">
                          {result.type === "course"
                            ? "SGPA"
                            : result.type === "semester"
                            ? "CGPA"
                            : "TARGET"}
                        </span>
                      </div>
                    </div>

                    {result.type !== "target" && (
                      <p className="mt-3 text-xs font-semibold text-gray-500 dark:text-gray-400">
                        Total Credits:{" "}
                        <span className="font-bold text-gray-700 dark:text-gray-200">
                          {result.totalCredits.toFixed(1)}
                        </span>
                      </p>
                    )}
                  </div>

                  {/* Specific summaries depending on mode */}
                  {result.type === "target" && (
                    <div className="space-y-4">
                      <div className="rounded-lg bg-gray-50 dark:bg-gray-900 p-4 border border-gray-100 dark:border-gray-800">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">
                          {t("targetRequiredHeader")}
                        </div>
                        <div className={`text-2xl font-extrabold ${result.status === "impossible" ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                          {result.required}
                        </div>
                      </div>

                      <div className={`rounded-lg border p-4 ${
                        result.status === "impossible"
                          ? "bg-red-50/50 border-red-200 text-red-800 dark:bg-red-950/20 dark:border-red-900/50 dark:text-red-400"
                          : result.status === "hard"
                          ? "bg-amber-50/50 border-amber-200 text-amber-800 dark:bg-amber-950/20 dark:border-amber-900/50 dark:text-amber-400"
                          : "bg-emerald-50/50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-400"
                      }`}>
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle2 className="h-4 w-4 shrink-0" />
                          <span className="text-xs font-bold uppercase tracking-wider">
                            {t("targetStatusHeader")}
                          </span>
                        </div>
                        <p className="text-xs font-semibold mb-1">{result.statusLabel}</p>
                        <p className="text-xs leading-relaxed opacity-90">{result.description}</p>
                      </div>
                    </div>
                  )}

                  {result.type === "course" && parseFloat(result.gpa) >= 3.50 && (
                    <div className="rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 p-4 text-center">
                      <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-400">
                        {t("congrats")}
                      </p>
                    </div>
                  )}

                  {result.type === "semester" && parseFloat(result.cgpa) >= 3.50 && (
                    <div className="rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 p-4 text-center">
                      <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-400">
                        {t("congrats")}
                      </p>
                    </div>
                  )}

                  {/* Actions buttons */}
                  <div className="space-y-2 pt-2">
                    <button
                      type="button"
                      onClick={downloadResultImage}
                      disabled={isDownloading}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition shadow disabled:cursor-wait disabled:bg-emerald-400"
                    >
                      <Download className="h-4 w-4" />
                      {isDownloading ? t("downloading") : t("imageDownloadBtn")}
                    </button>

                    <button
                      type="button"
                      onClick={() => setResult(null)}
                      className="w-full inline-flex items-center justify-center rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                      {t("close")}
                    </button>
                  </div>

                </div>
              )}

            </div>
          </div>

        </div>

        {/* Dynamic Scale List Mapping Footer Details */}
        {tab === "course" && (
          <div className="mt-12 max-w-3xl mx-auto">
            <h3 className="text-lg font-bold text-center text-gray-800 dark:text-gray-200 mb-4">
              {t("scaleHeader")} - {presetKey === "custom" ? t("customScale") : PRESETS[presetKey].name}
            </h3>
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 shadow-sm text-sm">
              <table className="w-full text-center">
                <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="py-2.5 font-semibold text-gray-700 dark:text-gray-300">{t("gradeLetter")}</th>
                    <th className="py-2.5 font-semibold text-gray-700 dark:text-gray-300">{t("gradePoints")}</th>
                    <th className="py-2.5 font-semibold text-gray-700 dark:text-gray-300">Marks Range</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-850">
                  {activeGrades.map((item) => (
                    <tr key={item.grade}>
                      <td className="py-2 font-bold text-gray-800 dark:text-gray-200">{item.grade}</td>
                      <td className="py-2 text-gray-600 dark:text-gray-400">{item.point.toFixed(2)}</td>
                      <td className="py-2 text-xs text-gray-500 dark:text-gray-500">{item.range}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
