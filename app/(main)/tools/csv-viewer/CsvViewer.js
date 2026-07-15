"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, Trash2, Edit3, Eye, FileSpreadsheet, Plus, HelpCircle,
  Download, FileJson, Table, Settings, ArrowUpDown, ChevronLeft,
  ChevronRight, BarChart2, RefreshCw, CheckCircle, Search, Filter,
  Layers, Check, X, AlertCircle, Info, Calendar, FileText, CheckSquare,
  Minus, Sparkles
} from "lucide-react";
import ToolPageShell from "@/app/(main)/tools-compo/ToolPageShell";

// Sample Datasets for users to explore the tool instantly
const SAMPLES = {
  sales: `Date,Product,Category,Units Sold,Revenue,Country
2026-01-01,Quantum Laptop,Electronics,120,144000,USA
2026-01-02,Nebula Phone,Electronics,85,59500,Canada
2026-01-03,Solar Charger,EcoTech,340,17000,Germany
2026-01-04,Aero Jacket,Apparel,210,31500,UK
2026-01-05,Gravity Boots,Apparel,45,13500,France
2026-01-06,Quantum Laptop,Electronics,140,168000,Germany
2026-01-07,Nebula Phone,Electronics,95,66500,USA
2026-01-08,Solar Charger,EcoTech,410,20500,Canada
2026-01-09,Aero Jacket,Apparel,180,27000,France
2026-01-10,Quantum Laptop,Electronics,110,132000,UK`,
  employees: `ID,Name,Department,Salary,Performance Rating,Join Date
1001,Elena Rostova,Engineering,115000,4.8,2023-04-15
1002,Marcus Vance,Marketing,82000,4.2,2024-01-10
1003,Aiko Tanaka,Product,98000,4.6,2022-11-01
1004,Devon Carter,Sales,75000,3.9,2025-06-01
1005,Liam O'Connor,Engineering,125000,4.9,2021-08-20
1006,Sophia Martinez,HR,68000,4.1,2024-09-15
1007,Rajesh Kumar,Engineering,108000,4.5,2023-10-05
1008,Zara El Amin,Marketing,87000,4.4,2023-02-28
1009,Oliver Dupont,Sales,78000,3.7,2024-11-12`
};

export default function CsvViewer() {
  // Parsing states
  const [inputText, setInputText] = useState("");
  const [fileName, setFileName] = useState("");
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [parsingTime, setParsingTime] = useState(0);

  // Advanced options configuration
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [delimiter, setDelimiter] = useState(",");
  const [customDelimiter, setCustomDelimiter] = useState("");
  const [quoteChar, setQuoteChar] = useState('"');
  const [hasHeaders, setHasHeaders] = useState(true);
  const [skipEmptyLines, setSkipEmptyLines] = useState(true);
  const [trimSpaces, setTrimSpaces] = useState(true);

  // Interactive controls states
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ columnIdx: null, direction: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [hiddenColumns, setHiddenColumns] = useState(new Set());
  const [activeTab, setActiveTab] = useState("table"); // table | profiler | chart
  const [editMode, setEditMode] = useState(false);
  const [theme, setTheme] = useState("indigo"); // indigo | emerald | violet | blue | slate

  // SVG Chart states
  const [xAxisCol, setXAxisCol] = useState(0);
  const [yAxisCol, setYAxisCol] = useState(1);
  const [chartType, setChartType] = useState("bar"); // bar | line | area
  const [chartGradient, setChartGradient] = useState(true);

  // Filters state
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [filters, setFilters] = useState([]); // Array of { colIdx, condition, value }
  const [filterOperator, setFilterOperator] = useState("and"); // and | or

  // Inline Cell Editing
  const [editingCell, setEditingCell] = useState(null); // { rowIdx, colIdx }
  const [editingValue, setEditingValue] = useState("");
  const editInputRef = useRef(null);

  // Parse CSV trigger
  const triggerParse = (textToParse = inputText, customName = "") => {
    const start = performance.now();
    const activeDelimiter = delimiter === "custom" ? customDelimiter : delimiter;
    
    try {
      const parsedRows = parseCSV(textToParse, {
        delimiter: activeDelimiter || ",",
        quoteChar: quoteChar || null,
        skipEmptyLines,
        trimSpaces
      });

      if (parsedRows.length === 0) {
        setHeaders([]);
        setRows([]);
        setParsingTime(0);
        return;
      }

      let parsedHeaders = [];
      let parsedDataRows = [];

      if (hasHeaders) {
        parsedHeaders = parsedRows[0];
        parsedDataRows = parsedRows.slice(1);
      } else {
        // Auto-generate header names
        const colCount = Math.max(...parsedRows.map(r => r.length), 0);
        parsedHeaders = Array.from({ length: colCount }, (_, i) => `Column ${i + 1}`);
        parsedDataRows = parsedRows;
      }

      setHeaders(parsedHeaders);
      setRows(parsedDataRows);
      if (customName) setFileName(customName);
      setParsingTime(Math.round(performance.now() - start));
      setCurrentPage(1);
      
      // Auto-set Y-axis to first numeric column if possible
      const firstNumCol = parsedHeaders.findIndex((_, colIdx) => {
        return parsedDataRows.some(row => !isNaN(parseFloat(row[colIdx])) && isFinite(row[colIdx]));
      });
      if (firstNumCol !== -1) {
        setYAxisCol(firstNumCol);
        // Find a non-numeric column for X-axis
        const firstTextCol = parsedHeaders.findIndex((_, colIdx) => colIdx !== firstNumCol);
        if (firstTextCol !== -1) setXAxisCol(firstTextCol);
      }
    } catch (err) {
      alert("Error parsing CSV: " + err.message);
    }
  };

  // CSV Parser algorithm logic
  function parseCSV(text, options) {
    const { delimiter, quoteChar, skipEmptyLines, trimSpaces } = options;
    const resultRows = [];
    let currentRow = [];
    let currentVal = "";
    let insideQuotes = false;
    
    let i = 0;
    while (i < text.length) {
      const char = text[i];
      
      // Handle quotation character
      if (quoteChar && char === quoteChar) {
        // Check for escaped quote inside quotes
        if (insideQuotes && text[i + 1] === quoteChar) {
          currentVal += quoteChar;
          i += 2;
          continue;
        }
        insideQuotes = !insideQuotes;
        i++;
        continue;
      }
      
      // Handle lines
      if (!insideQuotes && (char === "\r" || char === "\n")) {
        currentRow.push(trimSpaces ? currentVal.trim() : currentVal);
        currentVal = "";
        
        const isEmpty = currentRow.every(cell => cell === "");
        if (!skipEmptyLines || !isEmpty) {
          resultRows.push(currentRow);
        }
        currentRow = [];
        
        if (char === "\r" && text[i + 1] === "\n") {
          i += 2;
        } else {
          i++;
        }
        continue;
      }
      
      // Handle field separator
      if (!insideQuotes && char === delimiter) {
        currentRow.push(trimSpaces ? currentVal.trim() : currentVal);
        currentVal = "";
        i++;
        continue;
      }
      
      currentVal += char;
      i++;
    }
    
    // Catch residual characters
    if (currentVal || currentRow.length > 0 || insideQuotes) {
      currentRow.push(trimSpaces ? currentVal.trim() : currentVal);
      const isEmpty = currentRow.every(cell => cell === "");
      if (!skipEmptyLines || !isEmpty) {
        resultRows.push(currentRow);
      }
    }
    
    return resultRows;
  }

  // Load sample content helper
  const loadSample = (type) => {
    const data = SAMPLES[type];
    setInputText(data);
    triggerParse(data, `sample_${type}.csv`);
  };

  // Handle Drag & Drop uploading
  const handleFileDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  const processUploadedFile = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      setInputText(text);
      triggerParse(text, file.name);
    };
    reader.readAsText(file);
  };

  // Keyboard navigation & blur controls for inline cell editor
  useEffect(() => {
    if (editingCell && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingCell]);

  const saveCellEdit = () => {
    if (!editingCell) return;
    const { rowIdx, colIdx } = editingCell;
    const newRows = [...rows];
    newRows[rowIdx][colIdx] = editingValue;
    setRows(newRows);
    setEditingCell(null);
  };

  const handleCellKeyDown = (e) => {
    if (e.key === "Enter") {
      saveCellEdit();
    } else if (e.key === "Escape") {
      setEditingCell(null);
    }
  };

  // Dynamic Theme definition
  const themes = {
    indigo: {
      primary: "bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600",
      accent: "text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800",
      bgLight: "bg-indigo-50 dark:bg-indigo-950/30",
      badge: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300",
      tableHeader: "bg-indigo-500/10 text-indigo-900 dark:text-indigo-100",
      border: "border-indigo-100 dark:border-indigo-950",
      glow: "shadow-indigo-500/10 dark:shadow-indigo-500/5",
    },
    emerald: {
      primary: "bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600",
      accent: "text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
      bgLight: "bg-emerald-50 dark:bg-emerald-950/30",
      badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
      tableHeader: "bg-emerald-500/10 text-emerald-900 dark:text-emerald-100",
      border: "border-emerald-100 dark:border-emerald-950",
      glow: "shadow-emerald-500/10 dark:shadow-emerald-500/5",
    },
    violet: {
      primary: "bg-violet-600 hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-600",
      accent: "text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-800",
      bgLight: "bg-violet-50 dark:bg-violet-950/30",
      badge: "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300",
      tableHeader: "bg-violet-500/10 text-violet-900 dark:text-violet-100",
      border: "border-violet-100 dark:border-violet-950",
      glow: "shadow-violet-500/10 dark:shadow-violet-500/5",
    },
    blue: {
      primary: "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600",
      accent: "text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800",
      bgLight: "bg-blue-50 dark:bg-blue-950/30",
      badge: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
      tableHeader: "bg-blue-500/10 text-blue-900 dark:text-blue-100",
      border: "border-blue-100 dark:border-blue-950",
      glow: "shadow-blue-500/10 dark:shadow-blue-500/5",
    },
    slate: {
      primary: "bg-slate-700 hover:bg-slate-800 dark:bg-slate-600 dark:hover:bg-slate-700",
      accent: "text-slate-700 dark:text-slate-400 border-slate-300 dark:border-slate-700",
      bgLight: "bg-slate-100 dark:bg-slate-800/40",
      badge: "bg-slate-200 text-slate-800 dark:bg-slate-700/50 dark:text-slate-300",
      tableHeader: "bg-slate-500/10 text-slate-900 dark:text-slate-100",
      border: "border-slate-200 dark:border-slate-800",
      glow: "shadow-slate-500/5",
    }
  };

  const currentTheme = themes[theme] || themes.indigo;

  // Filter & Search & Sort engine pipeline
  const processedRows = useMemo(() => {
    let result = [...rows];

    // 1. Text Search Filter (matches any column value)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(row =>
        row.some(cell => String(cell).toLowerCase().includes(q))
      );
    }

    // 2. Advanced Condition Filters (SQL-like)
    if (filters.length > 0) {
      result = result.filter(row => {
        const checkRule = (rule) => {
          const val = String(row[rule.colIdx] || "");
          const valLower = val.toLowerCase();
          const target = String(rule.value || "");
          const targetLower = target.toLowerCase();
          const numVal = parseFloat(val);
          const numTarget = parseFloat(target);

          switch (rule.condition) {
            case "equals": return valLower === targetLower;
            case "not_equals": return valLower !== targetLower;
            case "contains": return valLower.includes(targetLower);
            case "not_contains": return !valLower.includes(targetLower);
            case "starts_with": return valLower.startsWith(targetLower);
            case "ends_with": return valLower.endsWith(targetLower);
            case "gt": return !isNaN(numVal) && !isNaN(numTarget) && numVal > numTarget;
            case "lt": return !isNaN(numVal) && !isNaN(numTarget) && numVal < numTarget;
            case "gte": return !isNaN(numVal) && !isNaN(numTarget) && numVal >= numTarget;
            case "lte": return !isNaN(numVal) && !isNaN(numTarget) && numVal <= numTarget;
            case "is_empty": return val.trim() === "";
            case "is_not_empty": return val.trim() !== "";
            default: return true;
          }
        };

        if (filterOperator === "and") {
          return filters.every(checkRule);
        } else {
          return filters.some(checkRule);
        }
      });
    }

    // 3. Sorting Engine
    if (sortConfig.columnIdx !== null && sortConfig.direction !== null) {
      const idx = sortConfig.columnIdx;
      const isAsc = sortConfig.direction === "asc";
      
      result.sort((a, b) => {
        const valA = a[idx] || "";
        const valB = b[idx] || "";
        
        // Numerical sort if numeric
        const numA = parseFloat(valA);
        const numB = parseFloat(valB);
        if (!isNaN(numA) && !isNaN(numB)) {
          return isAsc ? numA - numB : numB - numA;
        }
        
        // String locale sort
        return isAsc
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
    }

    return result;
  }, [rows, searchQuery, filters, filterOperator, sortConfig]);

  // Pagination bounds calculation
  const totalPages = Math.max(1, Math.ceil(processedRows.length / rowsPerPage));
  const paginatedRows = useMemo(() => {
    if (rowsPerPage === -1) return processedRows;
    const startIdx = (currentPage - 1) * rowsPerPage;
    return processedRows.slice(startIdx, startIdx + rowsPerPage);
  }, [processedRows, currentPage, rowsPerPage]);

  useEffect(() => {
    // Reset to page 1 if search filter shrinks rows count below bounds
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const handleSort = (colIdx) => {
    setSortConfig(prev => {
      if (prev.columnIdx === colIdx) {
        if (prev.direction === "asc") return { columnIdx: colIdx, direction: "desc" };
        return { columnIdx: null, direction: null };
      }
      return { columnIdx: colIdx, direction: "asc" };
    });
  };

  // Toggle column visibility
  const toggleColumnVisibility = (colIdx) => {
    const updated = new Set(hiddenColumns);
    if (updated.has(colIdx)) {
      updated.delete(colIdx);
    } else {
      updated.add(colIdx);
    }
    setHiddenColumns(updated);
  };

  // Add/Remove column helper
  const addColumn = () => {
    const newColName = prompt("Enter column header name:", `New Column ${headers.length + 1}`);
    if (newColName === null) return;
    setHeaders([...headers, newColName || `Column ${headers.length + 1}`]);
    setRows(rows.map(row => [...row, ""]));
  };

  const deleteColumn = (colIdx) => {
    if (!confirm(`Are you sure you want to delete column "${headers[colIdx]}"?`)) return;
    setHeaders(headers.filter((_, idx) => idx !== colIdx));
    setRows(rows.map(row => row.filter((_, idx) => idx !== colIdx)));
    // Reset chart axes if they pointed to deleted column
    if (xAxisCol === colIdx) setXAxisCol(0);
    if (yAxisCol === colIdx) setYAxisCol(Math.max(0, colIdx - 1));
  };

  // Row editor tools
  const addRow = () => {
    const newRow = Array(headers.length).fill("");
    setRows([...rows, newRow]);
    // Scroll to end of table
    setTimeout(() => {
      const maxPage = Math.ceil((rows.length + 1) / rowsPerPage);
      setCurrentPage(maxPage);
    }, 50);
  };

  const deleteRow = (rowIdx) => {
    const actualIdx = (currentPage - 1) * rowsPerPage + rowIdx;
    setRows(rows.filter((_, idx) => idx !== actualIdx));
  };

  // Data Cleaners
  const removeDuplicates = () => {
    const seen = new Set();
    const deduplicated = [];
    rows.forEach(row => {
      const key = row.join("||");
      if (!seen.has(key)) {
        seen.add(key);
        deduplicated.push(row);
      }
    });
    const removedCount = rows.length - deduplicated.length;
    setRows(deduplicated);
    alert(`Duplicates removed: ${removedCount} rows deleted.`);
  };

  const convertColumnCase = (colIdx, mode) => {
    const updated = rows.map(row => {
      const newRow = [...row];
      const val = newRow[colIdx] || "";
      if (mode === "upper") newRow[colIdx] = val.toUpperCase();
      else if (mode === "lower") newRow[colIdx] = val.toLowerCase();
      else if (mode === "title") {
        newRow[colIdx] = val.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
      }
      return newRow;
    });
    setRows(updated);
  };

  const trimWhitespace = () => {
    const updated = rows.map(row => row.map(cell => String(cell).trim()));
    setRows(updated);
    alert("Trimmed spaces from all fields.");
  };

  // Exporters formatting engines
  const generateExportData = (format) => {
    const visibleHeaders = headers.filter((_, idx) => !hiddenColumns.has(idx));
    const exportRows = processedRows.map(row =>
      row.filter((_, idx) => !hiddenColumns.has(idx))
    );

    if (format === "csv") {
      const activeDelimiter = delimiter === "custom" ? customDelimiter || "," : delimiter;
      const escape = (val) => {
        const s = String(val === undefined || val === null ? "" : val);
        const needsQuotes = s.includes(activeDelimiter) || s.includes("\n") || s.includes("\r") || (quoteChar && s.includes(quoteChar));
        if (needsQuotes && quoteChar) {
          return `${quoteChar}${s.split(quoteChar).join(quoteChar + quoteChar)}${quoteChar}`;
        }
        return s;
      };
      const lines = [];
      if (hasHeaders) {
        lines.push(visibleHeaders.map(escape).join(activeDelimiter));
      }
      exportRows.forEach(row => lines.push(row.map(escape).join(activeDelimiter)));
      return { content: lines.join("\n"), mime: "text/csv", filename: fileName || "data.csv" };
    }

    if (format === "json") {
      const objects = exportRows.map(row => {
        const obj = {};
        visibleHeaders.forEach((h, idx) => {
          obj[h] = row[idx];
        });
        return obj;
      });
      return { content: JSON.stringify(objects, null, 2), mime: "application/json", filename: (fileName ? fileName.replace(/\.[^/.]+$/, "") : "data") + ".json" };
    }

    if (format === "markdown") {
      const lines = [];
      // Headers
      lines.push("| " + visibleHeaders.join(" | ") + " |");
      // Align separator
      lines.push("| " + visibleHeaders.map(() => "---").join(" | ") + " |");
      // Rows
      exportRows.forEach(row => {
        lines.push("| " + row.map(c => String(c).replace(/\|/g, "\\|")).join(" | ") + " |");
      });
      return { content: lines.join("\n"), mime: "text/markdown", filename: "table.md" };
    }

    if (format === "html") {
      let html = `<table border="1">\n  <thead>\n    <tr>\n`;
      visibleHeaders.forEach(h => {
        html += `      <th>${h}</th>\n`;
      });
      html += `    </tr>\n  </thead>\n  <tbody>\n`;
      exportRows.forEach(row => {
        html += `    <tr>\n`;
        row.forEach(cell => {
          html += `      <td>${cell}</td>\n`;
        });
        html += `    </tr>\n`;
      });
      html += `  </tbody>\n</table>`;
      return { content: html, mime: "text/html", filename: "table.html" };
    }
  };

  const handleExport = (format) => {
    if (rows.length === 0) return;
    const { content, mime, filename } = generateExportData(format);
    const blob = new Blob([content], { type: `${mime};charset=utf-8;` });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Data Profiler Engine
  const columnProfiles = useMemo(() => {
    if (headers.length === 0 || rows.length === 0) return [];
    
    return headers.map((header, colIdx) => {
      const nonNullValues = rows
        .map(row => row[colIdx])
        .filter(val => val !== undefined && val !== null && String(val).trim() !== "");
      
      const totalCount = rows.length;
      const fillCount = nonNullValues.length;
      const emptyCount = totalCount - fillCount;

      // Type Inference checking
      let isNumeric = true;
      let isBoolean = true;
      let isDate = true;
      let isEmail = true;

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (fillCount === 0) {
        isNumeric = isBoolean = isDate = isEmail = false;
      } else {
        nonNullValues.forEach(val => {
          const stringVal = String(val).trim();
          
          // Numeric check
          if (isNaN(parseFloat(stringVal)) || !isFinite(stringVal)) {
            isNumeric = false;
          }
          
          // Boolean check
          const lowerVal = stringVal.toLowerCase();
          if (lowerVal !== "true" && lowerVal !== "false" && lowerVal !== "yes" && lowerVal !== "no" && lowerVal !== "1" && lowerVal !== "0") {
            isBoolean = false;
          }

          // Date check
          const timestamp = Date.parse(stringVal);
          if (isNaN(timestamp) || !/^\d{4}[-/.]\d{2}[-/.]\d{2}/.test(stringVal)) {
            isDate = false;
          }

          // Email check
          if (!emailRegex.test(stringVal)) {
            isEmail = false;
          }
        });
      }

      let inferredType = "Text";
      if (isNumeric) inferredType = "Numeric";
      else if (isBoolean) inferredType = "Boolean";
      else if (isDate) inferredType = "Date";
      else if (isEmail) inferredType = "Email";

      const uniqueValues = new Set(nonNullValues);
      
      const stats = {
        name: header,
        type: inferredType,
        fillRate: ((fillCount / totalCount) * 100).toFixed(1),
        emptyCount,
        uniqueCount: uniqueValues.size
      };

      if (inferredType === "Numeric") {
        const nums = nonNullValues.map(v => parseFloat(v));
        const sum = nums.reduce((acc, curr) => acc + curr, 0);
        stats.min = Math.min(...nums);
        stats.max = Math.max(...nums);
        stats.sum = sum.toFixed(2);
        stats.avg = (sum / fillCount).toFixed(2);
      } else if (inferredType === "Text") {
        const lengths = nonNullValues.map(v => String(v).length);
        stats.minLength = Math.min(...lengths);
        stats.maxLength = Math.max(...lengths);
      } else if (inferredType === "Date") {
        const timestamps = nonNullValues.map(v => Date.parse(v));
        stats.minDate = new Date(Math.min(...timestamps)).toISOString().split("T")[0];
        stats.maxDate = new Date(Math.max(...timestamps)).toISOString().split("T")[0];
      }

      return stats;
    });
  }, [headers, rows]);

  // Aggregated SVGs chart coordinates and paths calculations
  const chartData = useMemo(() => {
    if (rows.length === 0 || xAxisCol === null || yAxisCol === null) return [];
    
    // Group values by independent variable X
    const groupings = {};
    rows.forEach(row => {
      const xVal = String(row[xAxisCol] || "Empty").trim();
      const yVal = parseFloat(String(row[yAxisCol] || 0));
      const validY = isNaN(yVal) ? 0 : yVal;

      if (!groupings[xVal]) {
        groupings[xVal] = { sum: 0, count: 0 };
      }
      groupings[xVal].sum += validY;
      groupings[xVal].count += 1;
    });

    return Object.entries(groupings).map(([key, data]) => ({
      label: key,
      value: data.sum, // Aggregate values by sum
      avg: parseFloat((data.sum / data.count).toFixed(2))
    }));
  }, [rows, xAxisCol, yAxisCol]);

  // Visual SVG Chart configuration calculations
  const { chartSvgWidth, chartSvgHeight } = { chartSvgWidth: 650, chartSvgHeight: 350 };
  const chartPadding = 50;

  const chartScale = useMemo(() => {
    if (chartData.length === 0) return { maxVal: 0 };
    const maxVal = Math.max(...chartData.map(d => d.value), 1);
    return { maxVal };
  }, [chartData]);

  // SQL-like Filter Rule manager helpers
  const addFilterRule = () => {
    setFilters([...filters, { colIdx: 0, condition: "contains", value: "" }]);
    setShowFilterPanel(true);
  };

  const removeFilterRule = (idx) => {
    setFilters(filters.filter((_, i) => i !== idx));
  };

  const updateFilterRule = (idx, updatedRule) => {
    const copy = [...filters];
    copy[idx] = { ...copy[idx], ...updatedRule };
    setFilters(copy);
  };

  return (
    <ToolPageShell widthClassName="max-w-7xl">
      <div className="w-full space-y-6 pb-20">
        
        {/* Core Header Hero */}
        <div className="flex flex-col items-center text-center space-y-3 py-6">
          <div className="p-3 bg-brandColor/10 dark:bg-brandColor/20 text-brandColor rounded-2xl shadow-inner animate-pulse">
            <Table size={36} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white">
            CSV Viewer & Editor
          </h1>
          <p className="max-w-2xl text-gray-500 dark:text-gray-400 text-sm md:text-base font-medium">
            Analyze, clean, visualize and edit tabular data locally in your browser. Upload, paste or load sample data. Your files are never sent to a server.
          </p>
        </div>

        {/* Input & Dragzone Uploader Section */}
        {rows.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Drag & Drop File Zone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              className="lg:col-span-2 flex flex-col items-center justify-center p-12 bg-white dark:bg-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-800 rounded-3xl hover:border-brandColor dark:hover:border-brandColor transition-all duration-300 shadow-sm cursor-pointer group"
              onClick={() => document.getElementById("csv-file-picker").click()}
            >
              <input
                id="csv-file-picker"
                type="file"
                accept=".csv,.txt"
                className="hidden"
                onChange={handleFileSelect}
              />
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl text-gray-400 dark:text-gray-500 group-hover:scale-110 group-hover:bg-brandColor/10 group-hover:text-brandColor transition-all duration-300 mb-4">
                <Upload size={32} />
              </div>
              <p className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-1">
                Drag & Drop CSV File
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
                supports .csv or .txt extensions up to 20MB
              </p>
              <button className="px-5 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold text-xs rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                Browse Files
              </button>
            </div>

            {/* Paste Code Container & Samples */}
            <div className="flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                    <FileText size={16} className="text-brandColor" /> Paste Raw CSV Text
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => loadSample("sales")}
                      className="px-2 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xxs font-bold rounded-lg border border-indigo-100 dark:border-indigo-900 hover:bg-indigo-100 transition-colors"
                    >
                      Sample Sales
                    </button>
                    <button
                      onClick={() => loadSample("employees")}
                      className="px-2 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xxs font-bold rounded-lg border border-emerald-100 dark:border-emerald-900 hover:bg-emerald-100 transition-colors"
                    >
                      Sample Team
                    </button>
                  </div>
                </div>
                <textarea
                  className="w-full h-44 p-3 bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-200 font-mono text-xs rounded-2xl border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-1 focus:ring-brandColor placeholder-gray-400 dark:placeholder-gray-600 resize-none"
                  placeholder="Paste comma separated values here...&#10;e.g.&#10;Name,Age,Role&#10;Alice,28,Designer&#10;Bob,34,Engineer"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
              </div>
              
              <button
                disabled={!inputText.trim()}
                onClick={() => triggerParse(inputText, "pasted_data.csv")}
                className="w-full py-3 bg-brandColor hover:bg-brandColorHover disabled:opacity-50 text-white font-bold text-sm rounded-2xl shadow-md transition-all active:scale-95"
              >
                Parse CSV Text
              </button>
            </div>
          </motion.div>
        )}

        {/* Dynamic CSV Customizer Options (Visible on main screen or when data is loaded too) */}
        <div className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-4">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-500">
                <Settings size={16} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                  CSV Parsing Options
                </p>
                <p className="text-xxs text-gray-400 dark:text-gray-500">
                  Configure delimiter, quotes, whitespace cleanups, and header mapping.
                </p>
              </div>
            </div>
            <div className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-xl text-xs font-semibold">
              {showAdvanced ? "Hide Options" : "Show Options"}
            </div>
          </button>

          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden pt-4 border-t border-gray-100 dark:border-gray-800/80"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 text-xs">
                  {/* Delimiter */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-gray-700 dark:text-gray-400">Delimiter</label>
                    <select
                      className="w-full p-2.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none"
                      value={delimiter}
                      onChange={(e) => setDelimiter(e.target.value)}
                    >
                      <option value=",">Comma (,)</option>
                      <option value=";">Semicolon (;)</option>
                      <option value="&#9;">Tab (\t)</option>
                      <option value="|">Pipe (|)</option>
                      <option value="custom">Custom Character</option>
                    </select>
                    {delimiter === "custom" && (
                      <input
                        type="text"
                        maxLength={1}
                        placeholder="Custom delimiter character"
                        className="w-full p-2 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none mt-1 font-mono text-center"
                        value={customDelimiter}
                        onChange={(e) => setCustomDelimiter(e.target.value)}
                      />
                    )}
                  </div>

                  {/* Quote String */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-gray-700 dark:text-gray-400">Quote Character</label>
                    <select
                      className="w-full p-2.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none"
                      value={quoteChar}
                      onChange={(e) => setQuoteChar(e.target.value)}
                    >
                      <option value='"'>Double Quote (")</option>
                      <option value="'">Single Quote (')</option>
                      <option value="">None</option>
                    </select>
                  </div>

                  {/* Switches for Flags */}
                  <div className="flex flex-col justify-center space-y-3 font-medium text-gray-600 dark:text-gray-300">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={hasHeaders}
                        onChange={(e) => setHasHeaders(e.target.checked)}
                        className="rounded text-brandColor focus:ring-brandColor"
                      />
                      <span>First Row has headers</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={skipEmptyLines}
                        onChange={(e) => setSkipEmptyLines(e.target.checked)}
                        className="rounded text-brandColor focus:ring-brandColor"
                      />
                      <span>Skip empty lines</span>
                    </label>
                  </div>

                  <div className="flex flex-col justify-center space-y-3 font-medium text-gray-600 dark:text-gray-300">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={trimSpaces}
                        onChange={(e) => setTrimSpaces(e.target.checked)}
                        className="rounded text-brandColor focus:ring-brandColor"
                      />
                      <span>Trim cell whitespaces</span>
                    </label>
                    {rows.length > 0 && (
                      <button
                        onClick={() => triggerParse(inputText)}
                        className="flex items-center justify-center gap-1 py-2 px-4 bg-brandColor hover:bg-brandColorHover text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95"
                      >
                        <RefreshCw size={14} className="animate-spin-hover" /> Re-parse CSV
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Interactive Data Shell (Table, Profiler, Charts) */}
        {rows.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-lg overflow-hidden flex flex-col"
          >
            
            {/* Control Bar Actions */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-800/80 bg-gray-50/50 dark:bg-gray-900/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              {/* Tab Navigation */}
              <div className="flex items-center bg-gray-100/80 dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800 p-1.5 rounded-2xl self-start">
                <button
                  onClick={() => setActiveTab("table")}
                  className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                    activeTab === "table"
                      ? `${currentTheme.primary} text-white shadow-sm`
                      : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <Table size={14} /> Table Editor
                </button>
                <button
                  onClick={() => setActiveTab("profiler")}
                  className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                    activeTab === "profiler"
                      ? `${currentTheme.primary} text-white shadow-sm`
                      : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <Layers size={14} /> Data Profiler
                </button>
                <button
                  onClick={() => setActiveTab("chart")}
                  className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                    activeTab === "chart"
                      ? `${currentTheme.primary} text-white shadow-sm`
                      : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <BarChart2 size={14} /> Chart Builder
                </button>
              </div>

              {/* Theme Customizer & Actions */}
              <div className="flex flex-wrap items-center gap-2.5">
                
                {/* Theme selection circles */}
                <div className="flex items-center bg-gray-100 dark:bg-gray-900/50 px-2.5 py-1.5 rounded-2xl border border-gray-200/60 dark:border-gray-800">
                  <span className="text-xxs font-bold text-gray-400 dark:text-gray-500 mr-2.5">Header Theme</span>
                  <div className="flex items-center gap-1">
                    {Object.keys(themes).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTheme(t)}
                        className={`w-3.5 h-3.5 rounded-full relative transition-transform ${
                          t === "indigo" ? "bg-indigo-500"
                          : t === "emerald" ? "bg-emerald-500"
                          : t === "violet" ? "bg-violet-500"
                          : t === "blue" ? "bg-blue-500"
                          : "bg-slate-500"
                        } hover:scale-125 ${theme === t ? "ring-2 ring-offset-2 ring-gray-400 dark:ring-offset-gray-900" : ""}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Edit Mode Toggle Switch */}
                <button
                  onClick={() => setEditMode(!editMode)}
                  className={`flex items-center gap-1.5 px-3 py-2 border rounded-2xl text-xs font-bold transition-all ${
                    editMode
                      ? "bg-amber-50 dark:bg-amber-950/20 text-amber-600 border-amber-300 dark:border-amber-900"
                      : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  {editMode ? <CheckSquare size={14} /> : <Edit3 size={14} />}
                  {editMode ? "Disable Edit Mode" : "Spreadsheet Editor"}
                </button>

                {/* Multi-Format Export Dropdown */}
                <div className="relative group/export">
                  <button className="flex items-center gap-1.5 px-4.5 py-2 bg-brandColor hover:bg-brandColorHover text-white text-xs font-bold rounded-2xl shadow-md transition-all">
                    <Download size={14} /> Export File
                  </button>
                  <div className="absolute right-0 top-full mt-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 w-44 rounded-2xl shadow-xl overflow-hidden py-1.5 hidden group-hover/export:block z-50 transition-all">
                    <button
                      onClick={() => handleExport("csv")}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-xs font-medium text-gray-700 dark:text-gray-200 flex items-center gap-2"
                    >
                      <FileSpreadsheet size={13} className="text-emerald-500" /> Save as CSV
                    </button>
                    <button
                      onClick={() => handleExport("json")}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-xs font-medium text-gray-700 dark:text-gray-200 flex items-center gap-2"
                    >
                      <FileJson size={13} className="text-indigo-500" /> Export to JSON
                    </button>
                    <button
                      onClick={() => handleExport("markdown")}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-xs font-medium text-gray-700 dark:text-gray-200 flex items-center gap-2"
                    >
                      <FileText size={13} className="text-orange-500" /> Markdown Table
                    </button>
                    <button
                      onClick={() => handleExport("html")}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-xs font-medium text-gray-700 dark:text-gray-200 flex items-center gap-2"
                    >
                      <Table size={13} className="text-blue-500" /> HTML Web Table
                    </button>
                  </div>
                </div>

                {/* Reset Clear Trigger */}
                <button
                  onClick={() => {
                    if (confirm("Reset viewer and clear current loaded CSV?")) {
                      setInputText("");
                      setHeaders([]);
                      setRows([]);
                      setFileName("");
                      setFilters([]);
                    }
                  }}
                  className="p-2 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/20 dark:hover:bg-red-950/40 dark:text-red-400 border border-red-100 dark:border-red-900 rounded-2xl transition-colors"
                  title="Clear CSV Data"
                >
                  <Trash2 size={16} />
                </button>

              </div>
            </div>

            {/* TAB CONTENT 1: TABLE VIEW */}
            {activeTab === "table" && (
              <div className="flex flex-col flex-1">
                
                {/* Search, Filter Rules, Column Visibility Toggle Controls */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-800/80 bg-gray-50/20 dark:bg-gray-900/10 space-y-3">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    
                    {/* General Search Input */}
                    <div className="relative flex-1 max-w-md">
                      <Search size={16} className="absolute left-3 top-3 text-gray-400 dark:text-gray-500" />
                      <input
                        type="text"
                        placeholder="Search across all fields..."
                        className="w-full pl-9.5 pr-4 py-2.5 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl text-xs text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brandColor"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-white"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      
                      {/* Column Selector Checkbox Dropdown */}
                      <div className="relative group/cols">
                        <button className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white dark:bg-gray-950 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 rounded-2xl text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <Eye size={14} /> Columns ({headers.length - hiddenColumns.size}/{headers.length})
                        </button>
                        <div className="absolute right-0 top-full mt-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 w-56 max-h-60 overflow-y-auto rounded-2xl shadow-xl p-3 hidden group-hover/cols:block z-50 space-y-2">
                          <p className="text-xxs font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Show / Hide Columns</p>
                          {headers.map((h, idx) => (
                            <label key={idx} className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-200 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={!hiddenColumns.has(idx)}
                                onChange={() => toggleColumnVisibility(idx)}
                                className="rounded text-brandColor focus:ring-brandColor"
                              />
                              <span className="truncate">{h}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* SQL Filter Button toggle */}
                      <button
                        onClick={() => {
                          setShowFilterPanel(!showFilterPanel);
                          if (filters.length === 0 && !showFilterPanel) addFilterRule();
                        }}
                        className={`flex items-center gap-1.5 px-3.5 py-2.5 border rounded-2xl text-xs font-bold transition-all ${
                          filters.length > 0 || showFilterPanel
                            ? `${currentTheme.badge} ${currentTheme.accent}`
                            : "bg-white dark:bg-gray-950 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
                        }`}
                      >
                        <Filter size={14} /> Filters {filters.length > 0 ? `(${filters.length})` : ""}
                      </button>

                      {/* Spreadsheet actions (Only in editMode) */}
                      {editMode && (
                        <>
                          <button
                            onClick={addRow}
                            className="flex items-center gap-1 px-3 py-2 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 rounded-2xl text-xs font-bold hover:bg-emerald-100/60 dark:hover:bg-emerald-950/40"
                          >
                            <Plus size={14} /> Add Row
                          </button>
                          <button
                            onClick={addColumn}
                            className="flex items-center gap-1 px-3 py-2 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900 rounded-2xl text-xs font-bold hover:bg-indigo-100/60 dark:hover:bg-indigo-950/40"
                          >
                            <Plus size={14} /> Add Column
                          </button>
                        </>
                      )}

                    </div>
                  </div>

                  {/* Advanced Filters Panel */}
                  <AnimatePresence>
                    {showFilterPanel && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-gray-50 dark:bg-gray-950/80 border border-gray-200/60 dark:border-gray-800 rounded-2xl p-4 space-y-3.5 overflow-hidden"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-800 dark:text-gray-200">Filter Rules</span>
                            <div className="flex items-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-0.5 text-xxs font-bold">
                              <button
                                onClick={() => setFilterOperator("and")}
                                className={`px-2 py-1 rounded-lg ${filterOperator === "and" ? `${currentTheme.primary} text-white` : "text-gray-400"}`}
                              >
                                AND
                              </button>
                              <button
                                onClick={() => setFilterOperator("or")}
                                className={`px-2 py-1 rounded-lg ${filterOperator === "or" ? `${currentTheme.primary} text-white` : "text-gray-400"}`}
                              >
                                OR
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={addFilterRule}
                              className="text-xxs font-bold text-brandColor flex items-center gap-0.5"
                            >
                              <Plus size={12} /> Add Rule
                            </button>
                            <button
                              onClick={() => setFilters([])}
                              className="text-xxs font-bold text-red-500 flex items-center gap-0.5"
                            >
                              <X size={12} /> Clear Rules
                            </button>
                          </div>
                        </div>

                        {filters.length === 0 ? (
                          <p className="text-xxs text-gray-400 dark:text-gray-500 font-medium">No filter conditions set. Rows are not filtered.</p>
                        ) : (
                          <div className="space-y-2">
                            {filters.map((rule, idx) => (
                              <div key={idx} className="flex flex-wrap items-center gap-2 text-xs bg-white dark:bg-gray-900 p-2 rounded-xl border border-gray-200/50 dark:border-gray-850">
                                {/* Choose Column */}
                                <select
                                  value={rule.colIdx}
                                  onChange={(e) => updateFilterRule(idx, { colIdx: parseInt(e.target.value) })}
                                  className="p-1.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none"
                                >
                                  {headers.map((h, i) => (
                                    <option key={i} value={i}>{h}</option>
                                  ))}
                                </select>

                                {/* Choose Condition */}
                                <select
                                  value={rule.condition}
                                  onChange={(e) => updateFilterRule(idx, { condition: e.target.value })}
                                  className="p-1.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none"
                                >
                                  <option value="contains">contains</option>
                                  <option value="not_contains">does not contain</option>
                                  <option value="equals">equals</option>
                                  <option value="not_equals">does not equal</option>
                                  <option value="starts_with">starts with</option>
                                  <option value="ends_with">ends with</option>
                                  <option value="gt">greater than (&gt;)</option>
                                  <option value="lt">less than (&lt;)</option>
                                  <option value="gte">greater or equal (&gt;=)</option>
                                  <option value="lte">less or equal (&lt;=)</option>
                                  <option value="is_empty">is empty</option>
                                  <option value="is_not_empty">is not empty</option>
                                </select>

                                {/* Condition Value Input */}
                                {rule.condition !== "is_empty" && rule.condition !== "is_not_empty" && (
                                  <input
                                    type="text"
                                    placeholder="Enter value..."
                                    className="p-1.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none text-xs flex-1 min-w-[120px]"
                                    value={rule.value}
                                    onChange={(e) => updateFilterRule(idx, { value: e.target.value })}
                                  />
                                )}

                                {/* Remove Rule Trigger */}
                                <button
                                  onClick={() => removeFilterRule(idx)}
                                  className="p-1 bg-red-50 dark:bg-red-950/20 text-red-600 rounded-lg border border-red-100 dark:border-red-900"
                                >
                                  <Minus size={12} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Clean Data Action strip (Only in editMode) */}
                  {editMode && (
                    <div className="flex flex-wrap items-center gap-2 p-2 bg-amber-500/5 rounded-2xl border border-amber-500/10">
                      <span className="text-xxs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider px-2 flex items-center gap-1">
                        <Sparkles size={11} /> Clean Data:
                      </span>
                      <button
                        onClick={removeDuplicates}
                        className="px-2.5 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xxs font-bold text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50"
                      >
                        Remove Duplicates
                      </button>
                      <button
                        onClick={trimWhitespace}
                        className="px-2.5 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xxs font-bold text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50"
                      >
                        Trim Whitespaces
                      </button>
                      <div className="h-4 w-px bg-gray-200 dark:bg-gray-800 mx-1" />
                      {headers.map((h, idx) => {
                        if (hiddenColumns.has(idx)) return null;
                        return (
                          <div key={idx} className="relative group/cases select-none">
                            <button className="px-2.5 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xxs font-semibold text-gray-600 dark:text-gray-400 rounded-xl">
                              Case: {h}
                            </button>
                            <div className="absolute left-0 top-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg py-1 w-28 hidden group-hover/cases:block z-50">
                              <button
                                onClick={() => convertColumnCase(idx, "upper")}
                                className="w-full text-left px-3 py-1.5 text-xxs hover:bg-gray-50 dark:hover:bg-gray-850 font-bold"
                              >
                                UPPERCASE
                              </button>
                              <button
                                onClick={() => convertColumnCase(idx, "lower")}
                                className="w-full text-left px-3 py-1.5 text-xxs hover:bg-gray-50 dark:hover:bg-gray-850 font-bold"
                              >
                                lowercase
                              </button>
                              <button
                                onClick={() => convertColumnCase(idx, "title")}
                                className="w-full text-left px-3 py-1.5 text-xxs hover:bg-gray-50 dark:hover:bg-gray-850 font-bold"
                              >
                                Title Case
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                </div>

                {/* CSV Table Container */}
                <div className="w-full overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs text-gray-600 dark:text-gray-300">
                    <thead>
                      <tr className={`${currentTheme.tableHeader} border-b ${currentTheme.border}`}>
                        {/* Empty spacing for index / row selectors */}
                        <th className="p-3.5 w-12 font-bold text-center border-r border-gray-200/50 dark:border-gray-800/50">#</th>
                        
                        {headers.map((h, idx) => {
                          if (hiddenColumns.has(idx)) return null;
                          return (
                            <th
                              key={idx}
                              className={`p-3.5 font-bold group border-r border-gray-200/50 dark:border-gray-800/50 relative`}
                            >
                              <div className="flex items-center justify-between gap-1.5">
                                <span className="truncate pr-4">{h}</span>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleSort(idx)}
                                    className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white"
                                    title="Sort Column"
                                  >
                                    <ArrowUpDown size={11} className={sortConfig.columnIdx === idx ? "text-brandColor" : ""} />
                                  </button>
                                  {editMode && (
                                    <button
                                      onClick={() => deleteColumn(idx)}
                                      className="p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                                      title="Delete Column"
                                    >
                                      <Trash2 size={11} />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </th>
                          );
                        })}
                        {editMode && <th className="p-3.5 w-12 text-center">Delete</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800/80">
                      {paginatedRows.length === 0 ? (
                        <tr>
                          <td
                            colSpan={headers.length + (editMode ? 2 : 1) - hiddenColumns.size}
                            className="p-12 text-center text-gray-400 dark:text-gray-500 font-medium"
                          >
                            <AlertCircle size={24} className="mx-auto mb-2 opacity-50" />
                            No matching data records found. Try modifying filters or search query.
                          </td>
                        </tr>
                      ) : (
                        paginatedRows.map((row, rowIdx) => {
                          const displayIndex = (currentPage - 1) * rowsPerPage + rowIdx + 1;
                          return (
                            <tr key={rowIdx} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                              <td className="p-3 text-center border-r border-gray-100 dark:border-gray-800 text-gray-400 font-bold bg-gray-50/20 dark:bg-gray-900/10">
                                {displayIndex}
                              </td>

                              {row.map((cell, colIdx) => {
                                if (hiddenColumns.has(colIdx)) return null;

                                const isEditing = editingCell?.rowIdx === ((currentPage - 1) * rowsPerPage + rowIdx) && editingCell?.colIdx === colIdx;

                                return (
                                  <td
                                    key={colIdx}
                                    className="p-3 border-r border-gray-100 dark:border-gray-850 truncate max-w-[200px]"
                                    onDoubleClick={() => {
                                      if (editMode) {
                                        setEditingCell({ rowIdx: ((currentPage - 1) * rowsPerPage + rowIdx), colIdx });
                                        setEditingValue(cell);
                                      }
                                    }}
                                  >
                                    {isEditing ? (
                                      <input
                                        ref={editInputRef}
                                        type="text"
                                        className="w-full p-1 bg-white dark:bg-gray-950 border border-brandColor rounded focus:outline-none font-medium text-gray-800 dark:text-gray-250 focus:ring-1 focus:ring-brandColor"
                                        value={editingValue}
                                        onChange={(e) => setEditingValue(e.target.value)}
                                        onBlur={saveCellEdit}
                                        onKeyDown={handleCellKeyDown}
                                      />
                                    ) : (
                                      <span className={`${editMode ? "cursor-pointer hover:bg-gray-100/40 dark:hover:bg-gray-800/40 px-1 py-0.5 rounded border border-transparent hover:border-gray-200 dark:hover:border-gray-850" : ""}`}>
                                        {cell === "" ? <span className="text-gray-300 dark:text-gray-700 italic">null</span> : cell}
                                      </span>
                                    )}
                                  </td>
                                );
                              })}

                              {editMode && (
                                <td className="p-3 text-center">
                                  <button
                                    onClick={() => deleteRow(rowIdx)}
                                    className="p-1 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 rounded-lg"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </td>
                              )}
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Table Footer Stats & Pagination controls */}
                <div className="p-4 border-t border-gray-100 dark:border-gray-800/80 bg-gray-50/50 dark:bg-gray-900/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs font-semibold">
                  
                  {/* Performance stats summary */}
                  <div className="flex flex-wrap items-center gap-4 text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1 text-xxs bg-gray-100 dark:bg-gray-800 px-2.5 py-1.5 rounded-xl border border-gray-200/50 dark:border-gray-700">
                      Rows: <strong className="text-gray-850 dark:text-gray-200">{rows.length}</strong>
                    </span>
                    <span className="flex items-center gap-1 text-xxs bg-gray-100 dark:bg-gray-800 px-2.5 py-1.5 rounded-xl border border-gray-200/50 dark:border-gray-700">
                      Columns: <strong className="text-gray-850 dark:text-gray-200">{headers.length}</strong>
                    </span>
                    {parsingTime > 0 && (
                      <span className="flex items-center gap-1 text-xxs bg-gray-100 dark:bg-gray-800 px-2.5 py-1.5 rounded-xl border border-gray-200/50 dark:border-gray-700">
                        Parsed in: <strong className="text-gray-850 dark:text-gray-200">{parsingTime}ms</strong>
                      </span>
                    )}
                  </div>

                  {/* Pagination controller */}
                  <div className="flex items-center gap-3.5 self-end">
                    
                    {/* Rows per page selector */}
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <span>Rows per page:</span>
                      <select
                        className="p-1 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg text-xs"
                        value={rowsPerPage}
                        onChange={(e) => {
                          setRowsPerPage(parseInt(e.target.value));
                          setCurrentPage(1);
                        }}
                      >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                        <option value={-1}>All</option>
                      </select>
                    </div>

                    {/* Page buttons */}
                    {rowsPerPage !== -1 && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className="p-1.5 rounded-xl border border-gray-200 dark:border-gray-800 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <ChevronLeft size={14} />
                        </button>
                        <span className="text-gray-500 min-w-[70px] text-center">
                          Page {currentPage} of {totalPages}
                        </span>
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className="p-1.5 rounded-xl border border-gray-200 dark:border-gray-800 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    )}

                  </div>

                </div>

              </div>
            )}

            {/* TAB CONTENT 2: DATA PROFILER */}
            {activeTab === "profiler" && (
              <div className="p-6 space-y-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500 rounded-xl">
                    <Info size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">
                      Column-based Data Profiler
                    </h3>
                    <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                      Automatically inferred data types and basic statistics for each column in your dataset.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {columnProfiles.map((col, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800/80 rounded-2xl shadow-sm space-y-3.5 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="truncate pr-2">
                          <p className="text-xs text-gray-400 dark:text-gray-500 font-black uppercase tracking-wider">Column {idx + 1}</p>
                          <h4 className="text-sm font-black text-gray-850 dark:text-gray-200 truncate">{col.name}</h4>
                        </div>
                        <span className={`px-2.5 py-1 text-xxs font-bold rounded-lg ${
                          col.type === "Numeric" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                          : col.type === "Date" ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                          : col.type === "Email" ? "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300"
                          : col.type === "Boolean" ? "bg-violet-100 text-violet-800 dark:bg-violet-950/40 dark:text-violet-300"
                          : "bg-gray-200 text-gray-850 dark:bg-gray-800 dark:text-gray-300"
                        }`}>
                          {col.type}
                        </span>
                      </div>

                      {/* Stat Metrics List */}
                      <div className="space-y-2 border-t border-gray-200/50 dark:border-gray-800/50 pt-3 text-xs font-semibold">
                        <div className="flex justify-between">
                          <span className="text-gray-400 dark:text-gray-500">Fill Rate</span>
                          <span className="text-gray-700 dark:text-gray-300">{col.fillRate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400 dark:text-gray-500">Unique Values</span>
                          <span className="text-gray-700 dark:text-gray-300">{col.uniqueCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400 dark:text-gray-500">Empty Cells</span>
                          <span className="text-gray-750 dark:text-gray-300">{col.emptyCount}</span>
                        </div>

                        {/* Numeric specific aggregations */}
                        {col.type === "Numeric" && (
                          <div className="space-y-2 border-t border-gray-200/30 dark:border-gray-800/30 pt-2 bg-emerald-500/5 p-2 rounded-xl border border-emerald-500/10">
                            <div className="flex justify-between">
                              <span className="text-emerald-600/70 dark:text-emerald-400/60">Minimum</span>
                              <span className="text-emerald-700 dark:text-emerald-450">{col.min}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-emerald-600/70 dark:text-emerald-400/60">Maximum</span>
                              <span className="text-emerald-700 dark:text-emerald-450">{col.max}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-emerald-600/70 dark:text-emerald-400/60">Sum</span>
                              <span className="text-emerald-750 dark:text-emerald-300">{col.sum}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-emerald-600/70 dark:text-emerald-400/60">Average</span>
                              <span className="text-emerald-750 dark:text-emerald-350">{col.avg}</span>
                            </div>
                          </div>
                        )}

                        {/* Text specific aggregations */}
                        {col.type === "Text" && (
                          <div className="space-y-2 border-t border-gray-200/30 dark:border-gray-800/30 pt-2 text-gray-500/90">
                            <div className="flex justify-between">
                              <span>Min length</span>
                              <span className="text-gray-700 dark:text-gray-300">{col.minLength} chars</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Max length</span>
                              <span className="text-gray-700 dark:text-gray-300">{col.maxLength} chars</span>
                            </div>
                          </div>
                        )}

                        {/* Date specific aggregations */}
                        {col.type === "Date" && (
                          <div className="space-y-2 border-t border-gray-200/30 dark:border-gray-800/30 pt-2 text-amber-600 dark:text-amber-400">
                            <div className="flex justify-between">
                              <span>Start Date</span>
                              <span className="text-gray-700 dark:text-gray-300">{col.minDate}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>End Date</span>
                              <span className="text-gray-700 dark:text-gray-300">{col.maxDate}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT 3: VISUAL SVG CHART BUILDER */}
            {activeTab === "chart" && (
              <div className="p-6 space-y-6">
                
                {/* Axes Selectors Panel */}
                <div className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center gap-2">
                    <BarChart2 className="text-brandColor" size={18} />
                    <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">SVG Chart Customizer</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
                    
                    {/* X-axis */}
                    <div className="space-y-1">
                      <label className="font-bold text-gray-600 dark:text-gray-400">X-Axis Column (Label/Category)</label>
                      <select
                        className="w-full p-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none"
                        value={xAxisCol}
                        onChange={(e) => setXAxisCol(parseInt(e.target.value))}
                      >
                        {headers.map((h, i) => (
                          <option key={i} value={i}>{h}</option>
                        ))}
                      </select>
                    </div>

                    {/* Y-axis */}
                    <div className="space-y-1">
                      <label className="font-bold text-gray-600 dark:text-gray-400">Y-Axis Column (Numeric value to sum)</label>
                      <select
                        className="w-full p-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none"
                        value={yAxisCol}
                        onChange={(e) => setYAxisCol(parseInt(e.target.value))}
                      >
                        {headers.map((h, i) => (
                          <option key={i} value={i} disabled={columnProfiles[i]?.type !== "Numeric"}>
                            {h} {columnProfiles[i]?.type !== "Numeric" ? "(Non-numeric)" : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Chart Type */}
                    <div className="space-y-1">
                      <label className="font-bold text-gray-600 dark:text-gray-400">Visual Layout</label>
                      <div className="grid grid-cols-3 gap-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-0.5 rounded-xl">
                        <button
                          onClick={() => setChartType("bar")}
                          className={`py-1.5 rounded-lg text-xxs font-bold ${chartType === "bar" ? `${currentTheme.primary} text-white` : "text-gray-400"}`}
                        >
                          Bar
                        </button>
                        <button
                          onClick={() => setChartType("line")}
                          className={`py-1.5 rounded-lg text-xxs font-bold ${chartType === "line" ? `${currentTheme.primary} text-white` : "text-gray-400"}`}
                        >
                          Line
                        </button>
                        <button
                          onClick={() => setChartType("area")}
                          className={`py-1.5 rounded-lg text-xxs font-bold ${chartType === "area" ? `${currentTheme.primary} text-white` : "text-gray-400"}`}
                        >
                          Area
                        </button>
                      </div>
                    </div>

                    {/* Gradient Toggle */}
                    <div className="flex flex-col justify-center space-y-1.5">
                      <label className="flex items-center gap-2 cursor-pointer select-none font-bold text-gray-600 dark:text-gray-400">
                        <input
                          type="checkbox"
                          checked={chartGradient}
                          onChange={(e) => setChartGradient(e.target.checked)}
                          className="rounded text-brandColor focus:ring-brandColor"
                        />
                        <span>Enable Color Gradients</span>
                      </label>
                    </div>

                  </div>
                </div>

                {/* SVG Render Graphic */}
                {chartData.length === 0 ? (
                  <div className="p-20 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl text-gray-400">
                    <BarChart2 className="mx-auto mb-2 opacity-30" size={32} />
                    Invalid dataset coordinates. Select a Numeric Y-axis column to build charts.
                  </div>
                ) : (
                  <div className="w-full flex flex-col items-center space-y-4">
                    
                    <div className="w-full overflow-x-auto bg-gray-50 dark:bg-gray-950 rounded-3xl p-6 border border-gray-200 dark:border-gray-800 flex justify-center shadow-inner">
                      
                      {/* SVG Canvas Graphic */}
                      <svg width={chartSvgWidth} height={chartSvgHeight} className="overflow-visible select-none">
                        
                        {/* Define Gradients */}
                        <defs>
                          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={theme === "indigo" ? "#6366f1" : theme === "emerald" ? "#10b981" : theme === "violet" ? "#8b5cf6" : theme === "blue" ? "#3b82f6" : "#475569"} />
                            <stop offset="100%" stopColor={theme === "indigo" ? "#4f46e5" : theme === "emerald" ? "#059669" : theme === "violet" ? "#7c3aed" : theme === "blue" ? "#2563eb" : "#1e293b"} stopOpacity={0.4} />
                          </linearGradient>
                          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={theme === "indigo" ? "#6366f1" : theme === "emerald" ? "#10b981" : theme === "violet" ? "#8b5cf6" : theme === "blue" ? "#3b82f6" : "#475569"} stopOpacity={0.6} />
                            <stop offset="100%" stopColor={theme === "indigo" ? "#4f46e5" : theme === "emerald" ? "#059669" : theme === "violet" ? "#7c3aed" : theme === "blue" ? "#2563eb" : "#1e293b"} stopOpacity={0.0} />
                          </linearGradient>
                        </defs>

                        {/* Y-axis grid helper lines */}
                        {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                          const y = chartPadding + (chartSvgHeight - chartPadding * 2) * (1 - ratio);
                          const gridVal = (chartScale.maxVal * ratio).toFixed(0);
                          return (
                            <g key={idx}>
                              <line
                                x1={chartPadding}
                                y1={y}
                                x2={chartSvgWidth - chartPadding}
                                y2={y}
                                className="stroke-gray-200 dark:stroke-gray-800"
                                strokeWidth={1}
                                strokeDasharray="3 3"
                              />
                              <text
                                x={chartPadding - 10}
                                y={y + 4}
                                textAnchor="end"
                                className="fill-gray-400 dark:fill-gray-500 font-bold"
                                fontSize="9"
                              >
                                {gridVal}
                              </text>
                            </g>
                          );
                        })}

                        {/* Chart Render paths (Bars, Lines, Areas) */}
                        {chartData.map((d, idx) => {
                          const colWidth = (chartSvgWidth - chartPadding * 2) / chartData.length;
                          const x = chartPadding + colWidth * idx + colWidth / 2;
                          const heightRatio = d.value / chartScale.maxVal;
                          const yHeight = (chartSvgHeight - chartPadding * 2) * heightRatio;
                          const y = chartSvgHeight - chartPadding - yHeight;
                          const barWidth = Math.min(50, colWidth * 0.6);

                          return (
                            <g key={idx} className="group/item">
                              
                              {/* RENDER TYPE 1: BAR CHART */}
                              {chartType === "bar" && (
                                <rect
                                  x={x - barWidth / 2}
                                  y={y}
                                  width={barWidth}
                                  height={yHeight}
                                  rx={4}
                                  fill={chartGradient ? "url(#barGrad)" : "#6366f1"}
                                  className="transition-all duration-200 hover:opacity-85 hover:stroke-brandColor"
                                  strokeWidth={1}
                                />
                              )}

                              {/* RENDER TYPE 2: LINE CHART POINTS & CONNECTOR */}
                              {chartType === "line" && (
                                <>
                                  {idx < chartData.length - 1 && (() => {
                                    const nextRatio = chartData[idx + 1].value / chartScale.maxVal;
                                    const nextY = chartSvgHeight - chartPadding - (chartSvgHeight - chartPadding * 2) * nextRatio;
                                    const nextX = chartPadding + colWidth * (idx + 1) + colWidth / 2;
                                    return (
                                      <line
                                        x1={x}
                                        y1={y}
                                        x2={nextX}
                                        y2={nextY}
                                        className="stroke-indigo-500 dark:stroke-indigo-400"
                                        strokeWidth={3.5}
                                      />
                                    );
                                  })()}
                                  <circle
                                    cx={x}
                                    cy={y}
                                    r={5}
                                    className="fill-indigo-500 dark:fill-indigo-400 stroke-white dark:stroke-gray-900 shadow-md transition-transform duration-200 group-hover/item:scale-150 cursor-pointer"
                                    strokeWidth={2}
                                  />
                                </>
                              )}

                              {/* RENDER TYPE 3: AREA CHART GLOW */}
                              {chartType === "area" && (
                                <>
                                  {idx < chartData.length - 1 && (() => {
                                    const nextRatio = chartData[idx + 1].value / chartScale.maxVal;
                                    const nextY = chartSvgHeight - chartPadding - (chartSvgHeight - chartPadding * 2) * nextRatio;
                                    const nextX = chartPadding + colWidth * (idx + 1) + colWidth / 2;
                                    return (
                                      <g>
                                        <path
                                          d={`M ${x} ${y} L ${nextX} ${nextY} L ${nextX} ${chartSvgHeight - chartPadding} L ${x} ${chartSvgHeight - chartPadding} Z`}
                                          fill="url(#areaGrad)"
                                        />
                                        <line
                                          x1={x}
                                          y1={y}
                                          x2={nextX}
                                          y2={nextY}
                                          className="stroke-indigo-500 dark:stroke-indigo-400"
                                          strokeWidth={2.5}
                                        />
                                      </g>
                                    );
                                  })()}
                                  <circle
                                    cx={x}
                                    cy={y}
                                    r={4}
                                    className="fill-indigo-500 dark:fill-indigo-400 stroke-white dark:stroke-gray-900"
                                    strokeWidth={1.5}
                                  />
                                </>
                              )}

                              {/* Category X-Labels */}
                              <text
                                x={x}
                                y={chartSvgHeight - chartPadding + 18}
                                textAnchor="middle"
                                className="fill-gray-500 dark:fill-gray-400 font-bold"
                                fontSize="9.5"
                                transform={`rotate(-15, ${x}, ${chartSvgHeight - chartPadding + 18})`}
                              >
                                {d.label.length > 12 ? d.label.substring(0, 10) + ".." : d.label}
                              </text>

                              {/* Tooltip on Hover */}
                              <g className="opacity-0 group-hover/item:opacity-100 transition-opacity duration-200 pointer-events-none">
                                <rect
                                  x={x - 55}
                                  y={y - 35}
                                  width={110}
                                  height={26}
                                  rx={6}
                                  className="fill-gray-900 dark:fill-white text-white dark:text-gray-900"
                                />
                                <text
                                  x={x}
                                  y={y - 18}
                                  textAnchor="middle"
                                  className="fill-white dark:fill-gray-950 font-black"
                                  fontSize="9.5"
                                >
                                  {d.label}: {d.value}
                                </text>
                              </g>

                            </g>
                          );
                        })}

                        {/* Baseline X Axis */}
                        <line
                          x1={chartPadding}
                          y1={chartSvgHeight - chartPadding}
                          x2={chartSvgWidth - chartPadding}
                          y2={chartSvgHeight - chartPadding}
                          className="stroke-gray-300 dark:stroke-gray-700"
                          strokeWidth={2}
                        />

                      </svg>
                    </div>

                    {/* Expose SVG chart print download */}
                    <button
                      onClick={() => {
                        const svgElement = document.querySelector(".w-full svg");
                        if (!svgElement) return;
                        const svgString = new XMLSerializer().serializeToString(svgElement);
                        const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
                        const svgUrl = URL.createObjectURL(svgBlob);
                        const downloadLink = document.createElement("a");
                        downloadLink.href = svgUrl;
                        downloadLink.download = "chart_visual.svg";
                        document.body.appendChild(downloadLink);
                        downloadLink.click();
                        document.body.removeChild(downloadLink);
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 text-xs font-bold rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                    >
                      <Download size={14} /> Download SVG Chart
                    </button>

                  </div>
                )}
              </div>
            )}

          </motion.div>
        )}

      </div>
    </ToolPageShell>
  );
}
