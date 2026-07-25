"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  Braces,
  Settings2,
  Play,
  CheckCircle2,
  AlertCircle,
  Copy,
  Download,
  Trash2,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash,
  GitCompare,
  FileCode,
  ArrowRightLeft,
  Search,
  Check,
  RefreshCw,
  FolderOpen,
  Info,
  PlusCircle,
  Minimize2,
  Maximize2,
  Table,
  Sliders,
  Sparkles,
  BookOpen,
  HelpCircle,
  Upload,
  FileText
} from "lucide-react";
import ToolPageShell from "../ToolPageShell";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

/* ─── NATIVE CONVERTERS & HELPERS ──────────────────────────────── */

// 1. JSON to YAML converter
function jsonToYaml(val, indent = 0) {
  const spaces = " ".repeat(indent);
  if (val === null) return "null";
  if (typeof val === "boolean") return val ? "true" : "false";
  if (typeof val === "number") return String(val);
  if (typeof val === "string") {
    if (val.includes("\n")) {
      return "| \n" + val.split("\n").map(line => spaces + "  " + line).join("\n");
    }
    if (/[:#{}[\],&*#?|\-<>=!%@`]/.test(val) || val.trim() !== val) {
      return JSON.stringify(val);
    }
    return val || '""';
  }
  if (Array.isArray(val)) {
    if (val.length === 0) return "[]";
    return val.map(item => {
      const itemStr = jsonToYaml(item, indent + 2);
      if (typeof item === "object" && item !== null && !Array.isArray(item)) {
        const lines = itemStr.split("\n");
        const firstLine = lines[0];
        const restLines = lines.slice(1).map(l => "  " + l).join("\n");
        return spaces + "- " + firstLine.trimStart() + (restLines ? "\n" + restLines : "");
      }
      return spaces + "- " + itemStr.trimStart();
    }).join("\n");
  }
  if (typeof val === "object") {
    const keys = Object.keys(val);
    if (keys.length === 0) return "{}";
    return keys.map(k => {
      const v = val[k];
      const itemStr = jsonToYaml(v, indent + 2);
      if (typeof v === "object" && v !== null) {
        return `${spaces}${k}:\n${itemStr}`;
      } else {
        return `${spaces}${k}: ${itemStr}`;
      }
    }).join("\n");
  }
  return "";
}

// 2. JSON to XML converter
function jsonToXml(val, rootName = "root", indent = 0) {
  const spaces = " ".repeat(indent);
  if (val === null) return `${spaces}<${rootName} nil="true" />`;
  if (typeof val === "boolean" || typeof val === "number" || typeof val === "string") {
    const escaped = String(val)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
    return `${spaces}<${rootName}>${escaped}</${rootName}>`;
  }
  if (Array.isArray(val)) {
    return val.map(item => jsonToXml(item, rootName, indent)).join("\n");
  }
  if (typeof val === "object") {
    const keys = Object.keys(val);
    if (keys.length === 0) return `${spaces}<${rootName} />`;
    const children = keys.map(k => jsonToXml(val[k], k, indent + 2)).join("\n");
    return `${spaces}<${rootName}>\n${children}\n${spaces}</${rootName}>`;
  }
  return "";
}

// 3. JSON to CSV converter
function jsonToCsv(val) {
  let array = [];
  if (Array.isArray(val)) {
    array = val;
  } else if (typeof val === "object" && val !== null) {
    array = [val];
  } else {
    return "Error: Input must be an Array or Object to convert to CSV";
  }

  function flattenObject(obj, prefix = "") {
    const result = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const propName = prefix ? `${prefix}.${key}` : key;
        if (typeof obj[key] === "object" && obj[key] !== null && !Array.isArray(obj[key])) {
          Object.assign(result, flattenObject(obj[key], propName));
        } else {
          result[propName] = obj[key];
        }
      }
    }
    return result;
  }

  const flattenedArray = array.map(item => flattenObject(item));
  const keysSet = new Set();
  flattenedArray.forEach(item => {
    Object.keys(item).forEach(k => keysSet.add(k));
  });
  const headers = Array.from(keysSet);
  if (headers.length === 0) return "No CSV headers found.";

  const csvRows = [];
  csvRows.push(headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(","));

  flattenedArray.forEach(item => {
    const values = headers.map(h => {
      const v = item[h];
      const valStr = v === undefined || v === null ? "" : String(v);
      return `"${valStr.replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(","));
  });

  return csvRows.join("\n");
}

// Loose JSON parsing (strip comments and trailing commas)
function cleanLooseJson(str) {
  let cleaned = str
    .replace(/\/\*[\s\S]*?\*\//g, "") // remove block comments
    .replace(/\/\/.*/g, ""); // remove single line comments

  // Remove trailing commas before closing braces/brackets
  cleaned = cleaned.replace(/,\s*([\]}])/g, "$1");
  return cleaned;
}

// Deep sorting JSON keys
function sortJsonKeys(obj, order = "asc", recursive = true) {
  if (obj === null || typeof obj !== "object") return obj;

  if (Array.isArray(obj)) {
    return recursive ? obj.map(item => sortJsonKeys(item, order, recursive)) : obj;
  }

  const keys = Object.keys(obj);
  keys.sort((a, b) => {
    if (order === "asc") return a.localeCompare(b);
    if (order === "desc") return b.localeCompare(a);
    if (order === "len-asc") return a.length - b.length;
    if (order === "len-desc") return b.length - a.length;
    return 0;
  });

  const sortedObj = {};
  for (const key of keys) {
    sortedObj[key] = recursive ? sortJsonKeys(obj[key], order, recursive) : obj[key];
  }
  return sortedObj;
}

// Case conversion
function transformStringCase(str, targetCase) {
  if (targetCase === "none") return str;
  const words = str
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_\-\s]+/g, " ")
    .trim()
    .split(" ");

  if (targetCase === "lowercase") return str.toLowerCase();
  if (targetCase === "uppercase") return str.toUpperCase();
  if (targetCase === "camelcase") {
    return words
      .map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join("");
  }
  if (targetCase === "snakecase") return words.map(w => w.toLowerCase()).join("_");
  if (targetCase === "pascalcase") {
    return words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join("");
  }
  return str;
}

function convertKeysCase(obj, targetCase) {
  if (obj === null || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(item => convertKeysCase(item, targetCase));

  const result = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const newKey = transformStringCase(key, targetCase);
      result[newKey] = convertKeysCase(obj[key], targetCase);
    }
  }
  return result;
}

// Flattening JSON
function flattenJson(obj, prefix = "", res = {}) {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const propName = prefix ? `${prefix}.${key}` : key;
      if (typeof obj[key] === "object" && obj[key] !== null) {
        flattenJson(obj[key], propName, res);
      } else {
        res[propName] = obj[key];
      }
    }
  }
  return res;
}

// Unflattening JSON
function unflattenJson(obj) {
  const result = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const parts = key.split(".");
      let current = result;
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (i === parts.length - 1) {
          current[part] = obj[key];
        } else {
          if (current[part] === undefined) {
            current[part] = {};
          }
          current = current[part];
        }
      }
    }
  }
  return result;
}

// JSON Structural Diff function
function diffJsonObjects(obj1, obj2, path = "") {
  const diffs = [];
  const type1 = getJsonType(obj1);
  const type2 = getJsonType(obj2);

  if (type1 !== type2) {
    diffs.push({
      type: "TYPE_CHANGED",
      path: path || "root",
      oldVal: obj1,
      newVal: obj2,
      oldType: type1,
      newType: type2
    });
    return diffs;
  }

  if (type1 === "array") {
    const len = Math.max(obj1.length, obj2.length);
    for (let i = 0; i < len; i++) {
      const itemPath = `${path}[${i}]`;
      if (i >= obj1.length) {
        diffs.push({ type: "ADDED", path: itemPath, newVal: obj2[i] });
      } else if (i >= obj2.length) {
        diffs.push({ type: "DELETED", path: itemPath, oldVal: obj1[i] });
      } else {
        diffs.push(...diffJsonObjects(obj1[i], obj2[i], itemPath));
      }
    }
  } else if (type1 === "object") {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    const allKeys = Array.from(new Set([...keys1, ...keys2]));

    for (const key of allKeys) {
      const itemPath = path ? `${path}.${key}` : key;
      if (!keys1.includes(key)) {
        diffs.push({ type: "ADDED", path: itemPath, newVal: obj2[key] });
      } else if (!keys2.includes(key)) {
        diffs.push({ type: "DELETED", path: itemPath, oldVal: obj1[key] });
      } else {
        diffs.push(...diffJsonObjects(obj1[key], obj2[key], itemPath));
      }
    }
  } else {
    if (obj1 !== obj2) {
      diffs.push({
        type: "MODIFIED",
        path: path || "root",
        oldVal: obj1,
        newVal: obj2
      });
    }
  }
  return diffs;
}

function getJsonType(val) {
  if (val === null) return "null";
  if (Array.isArray(val)) return "array";
  return typeof val;
}

// JSON Schema Validator function
function validateJsonAgainstSchema(json, schema, path = "") {
  const errors = [];
  if (!schema || typeof schema !== "object") return errors;

  const jsonType = getJsonType(json);

  if (schema.type) {
    const allowedTypes = Array.isArray(schema.type) ? schema.type : [schema.type];
    let matched = false;
    for (const t of allowedTypes) {
      if (t === "integer" && jsonType === "number" && Number.isInteger(json)) {
        matched = true;
        break;
      }
      if (t === jsonType) {
        matched = true;
        break;
      }
    }

    if (!matched) {
      errors.push({
        path: path || "root",
        message: `Expected type "${allowedTypes.join(" or ")}", but got "${jsonType}"`
      });
      return errors;
    }
  }

  if (jsonType === "object") {
    if (Array.isArray(schema.required)) {
      for (const reqKey of schema.required) {
        if (json[reqKey] === undefined) {
          errors.push({
            path: path ? `${path}.${reqKey}` : reqKey,
            message: `Missing required property "${reqKey}"`
          });
        }
      }
    }

    if (schema.properties) {
      for (const key in schema.properties) {
        if (json[key] !== undefined) {
          const itemPath = path ? `${path}.${key}` : key;
          errors.push(...validateJsonAgainstSchema(json[key], schema.properties[key], itemPath));
        }
      }
    }
  }

  if (jsonType === "array") {
    if (schema.items) {
      for (let i = 0; i < json.length; i++) {
        const itemPath = `${path}[${i}]`;
        errors.push(...validateJsonAgainstSchema(json[i], schema.items, itemPath));
      }
    }
    if (typeof schema.minItems === "number" && json.length < schema.minItems) {
      errors.push({
        path: path || "root",
        message: `Array has too few items (${json.length}), minimum is ${schema.minItems}`
      });
    }
    if (typeof schema.maxItems === "number" && json.length > schema.maxItems) {
      errors.push({
        path: path || "root",
        message: `Array has too many items (${json.length}), maximum is ${schema.maxItems}`
      });
    }
  }

  if (jsonType === "string") {
    if (typeof schema.minLength === "number" && json.length < schema.minLength) {
      errors.push({
        path: path || "root",
        message: `String is too short (${json.length} chars), minimum is ${schema.minLength}`
      });
    }
    if (typeof schema.maxLength === "number" && json.length > schema.maxLength) {
      errors.push({
        path: path || "root",
        message: `String is too long (${json.length} chars), maximum is ${schema.maxLength}`
      });
    }
    if (schema.pattern) {
      try {
        const re = new RegExp(schema.pattern);
        if (!re.test(json)) {
          errors.push({
            path: path || "root",
            message: `String does not match pattern: ${schema.pattern}`
          });
        }
      } catch {
        // invalid pattern
      }
    }
  }

  if (jsonType === "number") {
    if (typeof schema.minimum === "number" && json < schema.minimum) {
      errors.push({
        path: path || "root",
        message: `Value is ${json}, which is less than minimum: ${schema.minimum}`
      });
    }
    if (typeof schema.maximum === "number" && json > schema.maximum) {
      errors.push({
        path: path || "root",
        message: `Value is ${json}, which is greater than maximum: ${schema.maximum}`
      });
    }
  }

  return errors;
}

// Helper to modify JSON recursively based on Tree path action
function modifyJsonAtPath(root, path, action, args) {
  const newRoot = JSON.parse(JSON.stringify(root));

  if (path.length === 0) {
    if (action === "set") return args.value;
    return newRoot;
  }

  let parent = newRoot;
  for (let i = 0; i < path.length - 1; i++) {
    parent = parent[path[i]];
  }

  const lastKey = path[path.length - 1];

  if (action === "set") {
    parent[lastKey] = args.value;
  } else if (action === "rename_key") {
    const { oldKey, newKey } = args;
    if (oldKey === newKey) return newRoot;

    const temp = {};
    for (const k of Object.keys(parent)) {
      if (k === oldKey) {
        temp[newKey] = parent[oldKey];
      } else {
        temp[k] = parent[k];
      }
    }
    for (const k of Object.keys(parent)) {
      delete parent[k];
    }
    Object.assign(parent, temp);
  } else if (action === "delete") {
    if (Array.isArray(parent)) {
      parent.splice(Number(lastKey), 1);
    } else {
      delete parent[lastKey];
    }
  } else if (action === "add_child") {
    const target = parent[lastKey];
    if (Array.isArray(target)) {
      target.push(args.value);
    } else if (target && typeof target === "object") {
      let key = args.key || "newKey";
      let idx = 1;
      while (target[key] !== undefined) {
        key = `${args.key || "newKey"}_${idx++}`;
      }
      target[key] = args.value;
    }
  } else if (action === "duplicate") {
    if (Array.isArray(parent)) {
      const idx = Number(lastKey);
      const clone = JSON.parse(JSON.stringify(parent[idx]));
      parent.splice(idx + 1, 0, clone);
    } else {
      const originalKey = lastKey;
      let newKey = `${originalKey}_copy`;
      let idx = 1;
      while (parent[newKey] !== undefined) {
        newKey = `${originalKey}_copy_${idx++}`;
      }
      const temp = {};
      for (const k of Object.keys(parent)) {
        temp[k] = parent[k];
        if (k === originalKey) {
          temp[newKey] = JSON.parse(JSON.stringify(parent[originalKey]));
        }
      }
      for (const k of Object.keys(parent)) {
        delete parent[k];
      }
      Object.assign(parent, temp);
    }
  }

  return newRoot;
}

// Deep analytics analyzer
function getJsonStats(obj) {
  const stats = {
    depth: 0,
    keysCount: 0,
    objectsCount: 0,
    arraysCount: 0,
    stringsCount: 0,
    numbersCount: 0,
    booleansCount: 0,
    nullsCount: 0
  };

  if (obj === null || obj === undefined) return stats;

  function traverse(node, currentDepth) {
    stats.depth = Math.max(stats.depth, currentDepth);

    if (node === null) {
      stats.nullsCount++;
      return;
    }

    if (Array.isArray(node)) {
      stats.arraysCount++;
      for (const item of node) {
        traverse(item, currentDepth + 1);
      }
    } else if (typeof node === "object") {
      stats.objectsCount++;
      const keys = Object.keys(node);
      stats.keysCount += keys.length;
      for (const key of keys) {
        traverse(node[key], currentDepth + 1);
      }
    } else if (typeof node === "string") {
      stats.stringsCount++;
    } else if (typeof node === "number") {
      stats.numbersCount++;
    } else if (typeof node === "boolean") {
      stats.booleansCount++;
    }
  }

  traverse(obj, 1);
  return stats;
}

// Sample JSON data
const defaultSample = {
  appName: "ToolsTrek JSON Suite",
  version: 2.1,
  active: true,
  theme: "modern-dark",
  features: ["Tree View Editor", "JSON Schema validation", "XML/YAML converters", "JSON Diff Compare"],
  stats: {
    users: 14200,
    rating: 4.85,
    status: {
      online: true,
      lastChecked: "2026-07-25T12:00:00Z"
    }
  },
  maintainers: [
    { name: "John Doe", role: "Lead Dev", email: "john@toolstrek.io" },
    { name: "Jane Smith", role: "UX Architect", email: "jane@toolstrek.io" }
  ]
};

// Document example strings
const exampleObjectStr = `{
  "firstName": "Alex",
  "lastName": "Parker",
  "age": 31,
  "isActive": true
}`;

const exampleArrayStr = `[
  { "id": 101, "item": "Standard Keyboard", "price": 45.00 },
  { "id": 102, "item": "Ergonomic Mouse", "price": 32.50 }
]`;

const exampleNestedStr = `{
  "orgName": "DevHQ",
  "servers": {
    "primary": {
      "ip": "10.0.0.1",
      "status": "online"
    },
    "backup": {
      "ip": "10.0.0.2",
      "status": "offline"
    }
  }
}`;

// Templates library
const templatesList = {
  profile: {
    id: "usr_sarah_connor",
    username: "sconnor",
    fullName: "Sarah Connor",
    active: true,
    roles: ["soldier", "mother"],
    metadata: {
      birthDate: "1965-11-10",
      location: "Los Angeles, CA",
      status: "classified"
    }
  },
  apiConfig: {
    server: {
      host: "127.0.0.1",
      port: 5000,
      debug: false,
      database: {
        engine: "postgresql",
        url: "postgresql://db_user:password@localhost:5432/production_db",
        poolSize: 10
      },
      cors: {
        allowOrigins: ["*", "https://toolstrek.app"],
        allowMethods: ["GET", "POST", "PUT", "DELETE"]
      }
    }
  },
  inventory: [
    { sku: "SKU-992-A", name: "Premium RGB Keyboard", qty: 25, price: 119.99 },
    { sku: "SKU-312-B", name: "Ergonomic Wireless Mouse", qty: 48, price: 54.50 },
    { sku: "SKU-805-C", name: "4K IPS Monitor 27-inch", qty: 7, price: 299.99 }
  ],
  ecommerceOrder: {
    orderNo: "ORD-7756-12",
    date: "2026-07-25T00:00:00Z",
    customer: {
      name: "Bruce Wayne",
      email: "bwayne@waynecorp.com"
    },
    items: [
      { productId: 409, title: "Graphite Composite Cape", quantity: 2, price: 650.00 },
      { productId: 991, title: "Reinforced Tactical Helmet", quantity: 1, price: 1200.00 }
    ],
    billing: {
      subtotal: 2500.00,
      vat: 200.00,
      totalAmount: 2700.00
    },
    paymentConfirmed: true
  }
};

/* ─── TREE COMPONENT (RECURSIVE) ───────────────────────────────── */
function TreeNode({ name, value, path, onAction, expandedState, setExpandedState }) {
  const type = getJsonType(value);
  const pathStr = path.join(".");
  const isExpanded = expandedState[pathStr] !== false;

  const toggleExpand = () => {
    setExpandedState(prev => ({
      ...prev,
      [pathStr]: !isExpanded
    }));
  };

  const handleValueChange = (e) => {
    let val = e.target.value;
    if (type === "number") {
      val = val === "" ? "" : Number(val);
    } else if (type === "boolean") {
      val = val === "true";
    } else if (type === "null") {
      val = null;
    }
    onAction(path, "set", { value: val });
  };

  const handleKeyRename = (e) => {
    const newKey = e.target.value;
    if (newKey && newKey !== name) {
      onAction(path, "rename_key", { oldKey: name, newKey });
    }
  };

  const handleAddChild = (childType) => {
    let defaultValue = "";
    if (childType === "object") defaultValue = {};
    else if (childType === "array") defaultValue = [];
    else if (childType === "number") defaultValue = 0;
    else if (childType === "boolean") defaultValue = true;
    else if (childType === "null") defaultValue = null;

    onAction(path, "add_child", { key: "newKey", value: defaultValue });
    setExpandedState(prev => ({ ...prev, [pathStr]: true }));
  };

  const renderRowControls = () => (
    <div className="inline-flex items-center gap-1.5 opacity-0 group-hover:opacity-100 ml-3 transition-opacity">
      {(type === "object" || type === "array") && (
        <div className="relative group/add">
          <button
            title="Add Child Node"
            className="p-1 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-slate-700/50 rounded transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <div className="absolute left-0 bottom-full mb-1 hidden group-hover/add:flex flex-col gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 shadow-lg z-20 text-[10px] w-24">
            <button onClick={() => handleAddChild("string")} className="text-left px-2 py-0.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300">String</button>
            <button onClick={() => handleAddChild("number")} className="text-left px-2 py-0.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300">Number</button>
            <button onClick={() => handleAddChild("boolean")} className="text-left px-2 py-0.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300">Boolean</button>
            <button onClick={() => handleAddChild("object")} className="text-left px-2 py-0.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300">Object</button>
            <button onClick={() => handleAddChild("array")} className="text-left px-2 py-0.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300">Array</button>
            <button onClick={() => handleAddChild("null")} className="text-left px-2 py-0.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300">Null</button>
          </div>
        </div>
      )}
      <button
        title="Duplicate Row"
        onClick={() => onAction(path, "duplicate")}
        className="p-1 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-slate-700/50 rounded transition-all"
      >
        <Copy className="w-3.5 h-3.5" />
      </button>
      <button
        title="Delete Item"
        onClick={() => onAction(path, "delete")}
        className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-700/50 rounded transition-all"
      >
        <Trash className="w-3.5 h-3.5" />
      </button>
    </div>
  );

  const renderKey = () => {
    if (name === undefined) return null;
    const isNumericKey = !isNaN(name);
    if (isNumericKey) {
      return (
        <span className="text-sm font-mono font-bold text-slate-400 bg-slate-100 dark:bg-slate-700/50 dark:text-slate-500 px-1 py-0.5 rounded mr-1">
          {name}
        </span>
      );
    }
    return (
      <input
        type="text"
        defaultValue={name}
        onBlur={handleKeyRename}
        className="text-sm font-mono font-semibold text-violet-600 dark:text-violet-400 bg-transparent border-b border-transparent hover:border-violet-300 focus:border-violet-500 outline-none w-32 shrink-0 mr-1.5 focus:bg-white dark:focus:bg-slate-900 px-1 py-0.5 rounded"
      />
    );
  };

  const renderValue = () => {
    if (type === "object") {
      const keysCount = Object.keys(value).length;
      return (
        <span className="text-sm text-slate-450 italic font-mono select-none">
          {`{ Object: ${keysCount} keys }`}
        </span>
      );
    }
    if (type === "array") {
      return (
        <span className="text-sm text-slate-455 italic font-mono select-none">
          {`[ Array: ${value.length} items ]`}
        </span>
      );
    }
    if (type === "boolean") {
      return (
        <select
          value={String(value)}
          onChange={handleValueChange}
          className="text-sm font-mono font-semibold text-amber-600 dark:text-amber-400 bg-transparent border border-transparent rounded hover:border-slate-350 dark:hover:border-slate-600 px-1 py-0.5 outline-none cursor-pointer"
        >
          <option value="true">true</option>
          <option value="false">false</option>
        </select>
      );
    }
    if (type === "null") {
      return (
        <span className="text-sm font-mono font-bold text-gray-400 bg-gray-100 dark:bg-gray-800 dark:text-gray-500 px-1 py-0.5 rounded select-none">
          null
        </span>
      );
    }
    if (type === "number") {
      return (
        <input
          type="number"
          value={value}
          onChange={handleValueChange}
          className="text-sm font-mono font-semibold text-emerald-600 dark:text-emerald-400 bg-transparent border border-transparent hover:border-slate-350 dark:hover:border-slate-650 px-1 py-0.5 rounded outline-none w-36 focus:bg-white dark:focus:bg-slate-900"
        />
      );
    }
    return (
      <input
        type="text"
        value={value}
        onChange={handleValueChange}
        className="text-sm font-mono text-slate-700 dark:text-slate-300 bg-transparent border border-transparent hover:border-slate-350 dark:hover:border-slate-650 px-1 py-0.5 rounded outline-none min-w-[14rem] md:min-w-[20rem] max-w-md focus:bg-white dark:focus:bg-slate-900"
      />
    );
  };

  const hasChildren = type === "object" || type === "array";

  return (
    <div className="pl-4 border-l border-slate-100 dark:border-slate-800/80 my-1 font-mono">
      <div className="flex items-center py-0.5 group">
        {hasChildren ? (
          <button
            onClick={toggleExpand}
            className="p-0.5 mr-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-400 dark:text-slate-500 transition-colors"
          >
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? "transform rotate-0" : "transform -rotate-90"
                }`}
            />
          </button>
        ) : (
          <span className="w-[18px] inline-block" />
        )}

        <div className="flex items-center select-none">
          {renderKey()}
          <span className="text-slate-400 dark:text-slate-500 mr-2">:</span>
          {renderValue()}
        </div>

        {renderRowControls()}
      </div>

      {hasChildren && isExpanded && (
        <div className="mt-0.5">
          {type === "object"
            ? Object.keys(value).map(k => (
              <TreeNode
                key={k}
                name={k}
                value={value[k]}
                path={[...path, k]}
                onAction={onAction}
                expandedState={expandedState}
                setExpandedState={setExpandedState}
              />
            ))
            : value.map((item, idx) => (
              <TreeNode
                key={idx}
                name={String(idx)}
                value={item}
                path={[...path, idx]}
                onAction={onAction}
                expandedState={expandedState}
                setExpandedState={setExpandedState}
              />
            ))}
        </div>
      )}
    </div>
  );
}

/* ─── NATIVE TABLE GRID VIEW COMPONENT ────────────────────────── */
function JsonTableView({ data }) {
  if (!data) return <p className="text-slate-400 dark:text-slate-505 italic text-center py-6">No JSON loaded.</p>;

  let items = [];
  let isArrayOfObjects = false;

  if (Array.isArray(data)) {
    isArrayOfObjects = data.every(item => item !== null && typeof item === "object" && !Array.isArray(item));
    items = data;
  } else if (typeof data === "object" && data !== null) {
    items = [data];
    isArrayOfObjects = true;
  }

  if (isArrayOfObjects && items.length > 0) {
    const cols = new Set();
    items.forEach(item => {
      Object.keys(item).forEach(k => cols.add(k));
    });
    const headers = Array.from(cols);

    return (
      <div className="h-full flex flex-col">
        <div className="mb-2 text-xs font-semibold text-slate-550 dark:text-slate-400">
          Tabular Grid ({items.length} records found)
        </div>
        <div className="grow overflow-auto border border-slate-200 dark:border-slate-700/60 rounded-2xl bg-white dark:bg-slate-900/30 shadow-inner">
          <table className="w-full text-xs text-left text-slate-650 dark:text-slate-300">
            <thead className="text-[10px] text-slate-700 uppercase bg-slate-50 dark:bg-slate-800 dark:text-slate-355 sticky top-0 border-b border-slate-200 dark:border-slate-700 z-10">
              <tr>
                <th className="px-4 py-2.5 border-r border-slate-200 dark:border-slate-700 w-12 text-center bg-slate-100 dark:bg-slate-850">#</th>
                {headers.map(h => (
                  <th key={h} className="px-4 py-2.5 border-r border-slate-200 dark:border-slate-700 font-bold font-mono">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
              {items.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-2 border-r border-slate-150 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-[10px] text-slate-450 font-bold text-center select-none">
                    {idx + 1}
                  </td>
                  {headers.map(h => {
                    const val = row[h];
                    let displayVal = "";
                    let valColor = "text-slate-700 dark:text-slate-300";

                    if (val === null) {
                      displayVal = "null";
                      valColor = "text-slate-400 font-bold";
                    } else if (typeof val === "boolean") {
                      displayVal = val ? "true" : "false";
                      valColor = "text-amber-500 dark:text-amber-400 font-semibold";
                    } else if (typeof val === "number") {
                      displayVal = String(val);
                      valColor = "text-emerald-500 dark:text-emerald-400";
                    } else if (typeof val === "object") {
                      displayVal = JSON.stringify(val);
                      valColor = "text-slate-400 dark:text-slate-500 italic";
                    } else {
                      displayVal = String(val);
                    }

                    return (
                      <td key={h} className={`px-4 py-2 border-r border-slate-150 dark:border-slate-700 truncate max-w-xs ${valColor}`} title={displayVal}>
                        {displayVal}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  const rows = typeof data === "object" ? Object.entries(data) : [];
  if (rows.length > 0) {
    return (
      <div className="grow overflow-auto border border-slate-200 dark:border-slate-700/60 rounded-2xl bg-white dark:bg-slate-900/30">
        <table className="w-full text-xs text-left text-slate-655 dark:text-slate-300">
          <thead className="text-[10px] text-slate-750 uppercase bg-slate-50 dark:bg-slate-800 dark:text-slate-350 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-4 py-2.5 font-bold">Property Key</th>
              <th className="px-4 py-2.5 font-bold">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
            {rows.map(([k, v]) => {
              let displayVal = "";
              let valColor = "text-slate-700 dark:text-slate-300";

              if (v === null) {
                displayVal = "null";
                valColor = "text-slate-450 font-bold";
              } else if (typeof v === "boolean") {
                displayVal = v ? "true" : "false";
                valColor = "text-amber-500 dark:text-amber-400 font-semibold";
              } else if (typeof v === "number") {
                displayVal = String(v);
                valColor = "text-emerald-500 dark:text-emerald-400";
              } else if (typeof v === "object") {
                displayVal = JSON.stringify(v);
                valColor = "text-slate-450 dark:text-slate-550 italic";
              } else {
                displayVal = String(v);
              }

              return (
                <tr key={k} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-2 font-semibold text-violet-600 dark:text-violet-400 border-r border-slate-150 dark:border-slate-750 w-1/3">{k}</td>
                  <td className={`px-4 py-2 truncate max-w-md ${valColor}`}>{displayVal}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  return <p className="text-slate-400 dark:text-slate-500 italic text-center py-6">This level cannot be displayed as a Table Grid.</p>;
}

/* ─── MAIN COMPONENT ───────────────────────────────────────────── */
export default function JSONEditor() {
  const [inputText, setInputText] = useState("");
  const [validationError, setValidationError] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeTab, setActiveTab] = useState("tree");

  // Synced line numbers states
  const [lineNumbers, setLineNumbers] = useState([1]);
  const textareaRef = useRef(null);
  const lineNumbersRef = useRef(null);

  // File import ref
  const fileInputRef = useRef(null);

  // JSON settings states
  const [indentSize, setIndentSize] = useState("2");
  const [looseMode, setLooseMode] = useState(false);
  const [recursiveSort, setRecursiveSort] = useState(true);
  const [keyCase, setKeyCase] = useState("none");

  // Query Filter state
  const [queryText, setQueryText] = useState("");
  const [queryResult, setQueryResult] = useState("");
  const [queryError, setQueryError] = useState(null);

  // Schema validation states
  const [schemaText, setSchemaText] = useState(
    JSON.stringify(
      {
        type: "object",
        properties: {
          appName: { type: "string", minLength: 3 },
          version: { type: "number", minimum: 1.0 },
          active: { type: "boolean" },
          features: { type: "array", minItems: 1 }
        },
        required: ["appName", "version"]
      },
      null,
      2
    )
  );
  const [schemaValidationResult, setSchemaValidationResult] = useState([]);
  const [schemaParseError, setSchemaParseError] = useState(null);

  // Diff comparison states
  const [comparisonText, setComparisonText] = useState("");
  const [diffResults, setDiffResults] = useState([]);
  const [comparisonParseError, setComparisonParseError] = useState(null);

  // Visual Tree expanded cache
  const [treeExpanded, setTreeExpanded] = useState({});

  // Feedback notifications
  const [toastMessage, setToastMessage] = useState(null);

  // Structural analytics state
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Templates dropdown state
  const [showTemplates, setShowTemplates] = useState(false);
  const templatesRef = useRef(null);

  // Click outside templates dropdown helper
  useEffect(() => {
    function handleClickOutside(event) {
      if (templatesRef.current && !templatesRef.current.contains(event.target)) {
        setShowTemplates(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Helper trigger custom toast
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Convert tab conversion state
  const [convertedText, setConvertedText] = useState("");
  const [convertFormat, setConvertFormat] = useState("yaml");
  const [importFormat, setImportFormat] = useState("yaml");
  const [importText, setImportText] = useState("");

  // Sync scroll of textarea and line numbers
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  // Calculate lines on text change
  useEffect(() => {
    const lines = inputText.split("\n");
    const newNumbers = Array.from({ length: Math.max(1, lines.length) }, (_, i) => i + 1);
    setLineNumbers(newNumbers);
  }, [inputText]);

  // Load sample json
  const handleLoadSample = () => {
    const indent = indentSize === "tab" ? "\t" : " ".repeat(Number(indentSize));
    setInputText(JSON.stringify(defaultSample, null, indent));
    setValidationError(null);
    triggerToast("Sample JSON loaded successfully!");
  };

  // Format / Beautify
  const handleFormat = () => {
    if (!inputText.trim()) return;
    try {
      let parsed;
      if (looseMode) {
        parsed = JSON.parse(cleanLooseJson(inputText));
      } else {
        parsed = JSON.parse(inputText);
      }
      const indent = indentSize === "tab" ? "\t" : " ".repeat(Number(indentSize));
      setInputText(JSON.stringify(parsed, null, indent));
      setValidationError(null);
      triggerToast("JSON beautified and formatted.");
    } catch (e) {
      setValidationError(e.message);
    }
  };

  // Minify / Compress
  const handleMinify = () => {
    if (!inputText.trim()) return;
    try {
      let parsed;
      if (looseMode) {
        parsed = JSON.parse(cleanLooseJson(inputText));
      } else {
        parsed = JSON.parse(inputText);
      }
      setInputText(JSON.stringify(parsed));
      setValidationError(null);
      triggerToast("JSON minified/compressed.");
    } catch (e) {
      setValidationError(e.message);
    }
  };

  // Clean / Clear
  const handleClear = () => {
    setInputText("");
    setValidationError(null);
    triggerToast("Workspace cleared.");
  };

  // Safe parsing helper
  const parsedJson = useMemo(() => {
    if (!inputText.trim()) return null;
    try {
      let cleaned = inputText;
      if (looseMode) {
        cleaned = cleanLooseJson(inputText);
      }
      const parsed = JSON.parse(cleaned);
      if (validationError) setValidationError(null);
      return parsed;
    } catch (e) {
      if (!validationError) {
        setValidationError(e.message);
      }
      return null;
    }
  }, [inputText, looseMode, validationError]);

  // JSON analytics breakdown
  const stats = useMemo(() => getJsonStats(parsedJson), [parsedJson]);

  // Handle visual Tree action updates
  const handleTreeAction = useCallback((path, action, args) => {
    if (!parsedJson) return;
    try {
      const updated = modifyJsonAtPath(parsedJson, path, action, args);
      const indent = indentSize === "tab" ? "\t" : " ".repeat(Number(indentSize));
      setInputText(JSON.stringify(updated, null, indent));
      setValidationError(null);
    } catch (e) {
      triggerToast(`Visual Edit Failed: ${e.message}`);
    }
  }, [parsedJson, indentSize]);

  // Deep Sort Keys
  const handleSortKeys = (order) => {
    if (!parsedJson) return;
    const sorted = sortJsonKeys(parsedJson, order, recursiveSort);
    const indent = indentSize === "tab" ? "\t" : " ".repeat(Number(indentSize));
    setInputText(JSON.stringify(sorted, null, indent));
    triggerToast(`Object keys sorted ${order}.`);
  };

  // Keys transform trigger
  const handleKeyTransform = () => {
    if (!parsedJson || keyCase === "none") return;
    const converted = convertKeysCase(parsedJson, keyCase);
    const indent = indentSize === "tab" ? "\t" : " ".repeat(Number(indentSize));
    setInputText(JSON.stringify(converted, null, indent));
    triggerToast(`Keys transformed to ${keyCase}.`);
  };

  // Flatten
  const handleFlatten = () => {
    if (!parsedJson) return;
    const flattened = flattenJson(parsedJson);
    const indent = indentSize === "tab" ? "\t" : " ".repeat(Number(indentSize));
    setInputText(JSON.stringify(flattened, null, indent));
    triggerToast("JSON structures flattened to single-level keys.");
  };

  // Unflatten
  const handleUnflatten = () => {
    if (!parsedJson) return;
    const unflattened = unflattenJson(parsedJson);
    const indent = indentSize === "tab" ? "\t" : " ".repeat(Number(indentSize));
    setInputText(JSON.stringify(unflattened, null, indent));
    triggerToast("JSON restored from flattened keys.");
  };

  // Evaluate JSONPath / JS expression
  const handleEvaluateQuery = () => {
    if (!parsedJson || !queryText.trim()) {
      setQueryResult("");
      setQueryError(null);
      return;
    }
    try {
      let result;
      if (!queryText.startsWith("data") && !queryText.startsWith("$")) {
        const fn = new Function("data", `return data.${queryText}`);
        result = fn(parsedJson);
      } else if (queryText.startsWith("data")) {
        const fn = new Function("data", `return ${queryText}`);
        result = fn(parsedJson);
      } else {
        const path = queryText.replace(/^\$/, "").replace(/^\[['"]|['"]\]/g, ".").replace(/\[(\d+)\]/g, ".").replace(/\[/g, ".").replace(/\]/g, "");
        const parts = path.split(".").filter(Boolean);
        let curr = parsedJson;
        for (const p of parts) {
          if (curr === undefined || curr === null) break;
          curr = curr[p];
        }
        result = curr;
      }

      const indent = indentSize === "tab" ? "\t" : " ".repeat(Number(indentSize));
      setQueryResult(JSON.stringify(result, null, indent));
      setQueryError(null);
    } catch (e) {
      setQueryError(e.message);
      setQueryResult("");
    }
  };

  // XML / YAML / CSV outputs live builder
  useEffect(() => {
    if (!parsedJson) {
      setConvertedText("");
      return;
    }

    if (convertFormat === "yaml") {
      setConvertedText(jsonToYaml(parsedJson));
    } else if (convertFormat === "xml") {
      setConvertedText(jsonToXml(parsedJson));
    } else if (convertFormat === "csv") {
      setConvertedText(jsonToCsv(parsedJson));
    }
  }, [parsedJson, convertFormat]);

  // Import XML/YAML/CSV to JSON converter
  const handleImportToJSON = () => {
    if (!importText.trim()) return;
    try {
      if (importFormat === "yaml") {
        const lines = importText.split("\n");
        const result = {};
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith("#")) continue;

          if (trimmed.includes(":")) {
            const parts = trimmed.split(":");
            const k = parts[0].trim();
            let v = parts.slice(1).join(":").trim();
            if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
            else if (v.startsWith("'") && v.endsWith("'")) v = v.slice(1, -1);
            else if (v === "true") v = true;
            else if (v === "false") v = false;
            else if (v === "null") v = null;
            else if (!isNaN(v)) v = Number(v);

            result[k] = v;
          }
        }
        const indent = indentSize === "tab" ? "\t" : " ".repeat(Number(indentSize));
        setInputText(JSON.stringify(result, null, indent));
        setValidationError(null);
        triggerToast("YAML imported to JSON workspace.");
      } else if (importFormat === "xml") {
        const matches = importText.matchAll(/<([^/>]+)>([^<]*)<\/([^>]+)>/g);
        const result = {};
        for (const m of matches) {
          const k = m[1];
          let v = m[2].trim();
          if (v === "true") v = true;
          else if (v === "false") v = false;
          else if (v === "null") v = null;
          else if (!isNaN(v) && v !== "") v = Number(v);
          result[k] = v;
        }
        const indent = indentSize === "tab" ? "\t" : " ".repeat(Number(indentSize));
        setInputText(JSON.stringify(result, null, indent));
        setValidationError(null);
        triggerToast("XML parsed into JSON workspace.");
      } else if (importFormat === "csv") {
        const lines = importText.split("\n").map(l => l.trim()).filter(Boolean);
        if (lines.length > 0) {
          const headers = lines[0].split(",").map(h => h.replace(/^["']|["']$/g, "").trim());
          const rows = [];
          for (let i = 1; i < lines.length; i++) {
            const cells = lines[i].split(",").map(c => c.replace(/^["']|["']$/g, "").trim());
            const row = {};
            headers.forEach((h, idx) => {
              let v = cells[idx] || "";
              if (v === "true") v = true;
              else if (v === "false") v = false;
              else if (!isNaN(v) && v !== "") v = Number(v);
              row[h] = v;
            });
            rows.push(row);
          }
          const indent = indentSize === "tab" ? "\t" : " ".repeat(Number(indentSize));
          setInputText(JSON.stringify(rows, null, indent));
          setValidationError(null);
          triggerToast("CSV table loaded as list JSON.");
        }
      }
    } catch (e) {
      triggerToast(`Import Error: ${e.message}`);
    }
  };

  // Schema Validation trigger
  useEffect(() => {
    if (!parsedJson) {
      setSchemaValidationResult([]);
      return;
    }
    try {
      const schemaObj = JSON.parse(schemaText);
      setSchemaParseError(null);
      const errors = validateJsonAgainstSchema(parsedJson, schemaObj);
      setSchemaValidationResult(errors);
    } catch (e) {
      setSchemaParseError(e.message);
      setSchemaValidationResult([]);
    }
  }, [parsedJson, schemaText]);

  // Diff structural check trigger
  useEffect(() => {
    if (!comparisonText.trim() || !parsedJson) {
      setDiffResults([]);
      setComparisonParseError(null);
      return;
    }
    try {
      const cleanComp = looseMode ? cleanLooseJson(comparisonText) : comparisonText;
      const compObj = JSON.parse(cleanComp);
      setComparisonParseError(null);
      const diffs = diffJsonObjects(parsedJson, compObj);
      setDiffResults(diffs);
    } catch (e) {
      setComparisonParseError(e.message);
      setDiffResults([]);
    }
  }, [parsedJson, comparisonText, looseMode]);

  // Copy helper
  const handleCopyText = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    triggerToast("Copied to clipboard!");
  };

  // Download helper
  const handleDownloadFile = (text, name) => {
    if (!text) return;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
    triggerToast(`Downloaded ${name}`);
  };

  // Paste helper
  const handlePasteInput = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInputText(text);
      setValidationError(null);
      triggerToast("Text pasted from clipboard!");
    } catch {
      triggerToast("Clipboard access denied. Please paste manually.");
    }
  };

  // Text Find and Replace
  const [findStr, setFindStr] = useState("");
  const [replaceStr, setReplaceStr] = useState("");
  const handleFindReplace = () => {
    if (!findStr || !inputText) return;
    try {
      let re;
      if (findStr.startsWith("/") && findStr.endsWith("/")) {
        re = new RegExp(findStr.slice(1, -1), "g");
      } else {
        re = new RegExp(findStr.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"), "g");
      }
      const updated = inputText.replace(re, replaceStr);
      setInputText(updated);
      triggerToast("Find and replace completed.");
    } catch (e) {
      triggerToast(`Error parsing pattern: ${e.message}`);
    }
  };

  // File import picker trigger
  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      setInputText(evt.target.result);
      setValidationError(null);
      triggerToast(`Loaded JSON from ${file.name}`);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Load specific string to workspace from documentation
  const handleLoadDocExample = (exampleStr) => {
    const indent = indentSize === "tab" ? "\t" : " ".repeat(Number(indentSize));
    try {
      const parsed = JSON.parse(exampleStr);
      setInputText(JSON.stringify(parsed, null, indent));
      setValidationError(null);
      triggerToast("Template loaded into editor workspace!");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      triggerToast("Failed to parse template example.");
    }
  };

  return (
    <ToolPageShell widthClassName="max-w-7xl px-2 pt-20 pb-10">
      <div className="dark:text-slate-100 font-sans">
        {/* Toast alert banner */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-700/30 text-sm animate-bounce font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* ── Header ────────────────────────────────────────────── */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl mb-4 shadow-lg shadow-violet-200 dark:shadow-violet-900/30">
            <Braces className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent mb-3 dark:from-violet-400 dark:to-indigo-400">
            Advanced JSON Editor
          </h1>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto dark:text-slate-400">
            A premium developer workstation to format, validate, compare, query, edit, and convert JSON structures seamlessly.
          </p>
        </div>

        {/* ── Action toolbar ────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/50 p-3 mb-6 rounded-xl shadow-xl">
          <div className="flex flex-wrap gap-2 items-center">
            {/* Templates Selector Dropdown */}
            <div className="relative" ref={templatesRef}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTemplates(!showTemplates)}
                className="flex items-center gap-1.5 text-sm font-semibold hover:bg-slate-100 rounded-lg bg-white dark:bg-slate-800"
              >
                <FileText className="w-4 h-4 text-indigo-500" />
                Templates
                <ChevronDown className="w-3.5 h-3.5" />
              </Button>
              {showTemplates && (
                <div className="absolute left-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xl p-2 z-50 flex flex-col gap-1 font-sans animate-in fade-in slide-in-from-top-1 duration-200">
                  <button
                    onClick={() => { handleLoadDocExample(JSON.stringify(defaultSample)); setShowTemplates(false); }}
                    className="text-left px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-700 dark:text-slate-200 transition-colors"
                  >
                    Default Demo Sample
                  </button>
                  <button
                    onClick={() => { handleLoadDocExample(JSON.stringify(templatesList.profile)); setShowTemplates(false); }}
                    className="text-left px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-700 dark:text-slate-200 transition-colors"
                  >
                    User Profile Template
                  </button>
                  <button
                    onClick={() => { handleLoadDocExample(JSON.stringify(templatesList.apiConfig)); setShowTemplates(false); }}
                    className="text-left px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-700 dark:text-slate-200 transition-colors"
                  >
                    Server API Config
                  </button>
                  <button
                    onClick={() => { handleLoadDocExample(JSON.stringify(templatesList.inventory)); setShowTemplates(false); }}
                    className="text-left px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-700 dark:text-slate-200 transition-colors"
                  >
                    Product Inventory List
                  </button>
                  <button
                    onClick={() => { handleLoadDocExample(JSON.stringify(templatesList.ecommerceOrder)); setShowTemplates(false); }}
                    className="text-left px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-700 dark:text-slate-200 transition-colors"
                  >
                    E-Commerce Order Form
                  </button>
                </div>
              )}
            </div>

            {/* Import Button */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportFile}
              accept=".json,application/json"
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 text-sm font-semibold hover:bg-slate-100 rounded-lg"
            >
              <Upload className="w-4 h-4 text-indigo-500" />
              Import JSON
            </Button>

            {/* Export Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownloadFile(inputText, "document.json")}
              disabled={!inputText.trim()}
              className="flex items-center gap-1.5 text-sm font-semibold hover:bg-slate-100 rounded-lg"
            >
              <Download className="w-4 h-4 text-indigo-500" />
              Export JSON
            </Button>

            <span className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:inline" />

            {/* Format JSON */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleFormat}
              className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-750 rounded-lg"
            >
              <Play className="w-4 h-4 fill-current" />
              Format
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleMinify}
              className="flex items-center gap-1.5 text-sm font-semibold rounded-lg"
            >
              <Minimize2 className="w-4 h-4" />
              Minify
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              className="flex items-center gap-1.5 text-sm font-semibold hover:bg-rose-50 dark:hover:bg-rose-900/30 text-rose-500 border-rose-200 dark:border-rose-900/50 rounded-lg"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={showAdvanced ? "default" : "outline"}
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`flex items-center gap-1.5 text-sm font-semibold transition-all rounded-lg ${showAdvanced
                  ? "bg-violet-600 text-white hover:bg-violet-750 shadow-md shadow-violet-200 dark:shadow-none"
                  : ""
                }`}
            >
              <Settings2 className="w-4 h-4" />
              Advanced Options
              {showAdvanced ? (
                <ChevronUp className="w-3.5 h-3.5 ml-1" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 ml-1" />
              )}
            </Button>
          </div>
        </div>

        {/* ── Advanced Options Panel ───────────────────────────── */}
        {showAdvanced && (
          <div className="mb-6 p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/50 shadow-lg animate-in slide-in-from-top duration-300">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-violet-500" />
              Advanced Configuration & Operations
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Parse & Indent Settings */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-505 dark:text-slate-400 mb-1.5">
                    Indentation Style
                  </label>
                  <select
                    value={indentSize}
                    onChange={(e) => setIndentSize(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-700 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-violet-500 text-slate-700 dark:text-slate-300 font-medium"
                  >
                    <option value="2">2 Spaces (Standard)</option>
                    <option value="4">4 Spaces</option>
                    <option value="8">8 Spaces</option>
                    <option value="tab">1 Tab</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Loose Parser</span>
                    <span className="text-[10px] text-slate-400">Ignore comments & trailing commas</span>
                  </div>
                  <Switch checked={looseMode} onCheckedChange={setLooseMode} />
                </div>
              </div>

              {/* Sorting & Keys Transforms */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-550 dark:text-slate-400 mb-1.5 flex items-center justify-between">
                    <span>Sort Object Keys</span>
                    <label className="inline-flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={recursiveSort}
                        onChange={(e) => setRecursiveSort(e.target.checked)}
                        className="rounded border-slate-300 dark:border-slate-600 text-violet-600 focus:ring-violet-500 w-3 h-3"
                      />
                      <span className="text-[10px] font-normal text-slate-400">Recursive</span>
                    </label>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSortKeys("asc")}
                      className="text-xs py-1"
                    >
                      A → Z Sort
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSortKeys("desc")}
                      className="text-xs py-1"
                    >
                      Z → A Sort
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-555 dark:text-slate-400 mb-1.5">
                    Case Key Transform
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={keyCase}
                      onChange={(e) => setKeyCase(e.target.value)}
                      className="grow text-xs bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-700 rounded-lg p-2 outline-none focus:ring-2 focus:ring-violet-500 text-slate-700 dark:text-slate-300 font-mono"
                    >
                      <option value="none">None</option>
                      <option value="camelcase">camelCase</option>
                      <option value="snakecase">snake_case</option>
                      <option value="pascalcase">PascalCase</option>
                      <option value="uppercase">UPPERCASE</option>
                      <option value="lowercase">lowercase</option>
                    </select>
                    <Button
                      onClick={handleKeyTransform}
                      disabled={keyCase === "none"}
                      className="bg-violet-600 hover:bg-violet-750 text-white shrink-0 text-xs px-3 shadow"
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              </div>

              {/* Text replacement & Structural Flatten */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-555 dark:text-slate-400 mb-1">
                    Find and Replace Text
                  </label>
                  <div className="flex gap-1.5 mb-1.5">
                    <input
                      type="text"
                      placeholder="Find (text /regex/)"
                      value={findStr}
                      onChange={(e) => setFindStr(e.target.value)}
                      className="w-1/2 text-xs bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-700 rounded-lg p-2 outline-none focus:ring-2 focus:ring-violet-500 text-slate-700 dark:text-slate-300 font-mono"
                    />
                    <input
                      type="text"
                      placeholder="Replace"
                      value={replaceStr}
                      onChange={(e) => setReplaceStr(e.target.value)}
                      className="w-1/2 text-xs bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-700 rounded-lg p-2 outline-none focus:ring-2 focus:ring-violet-500 text-slate-700 dark:text-slate-300 font-mono"
                    />
                  </div>
                  <Button
                    onClick={handleFindReplace}
                    size="sm"
                    className="w-full bg-slate-800 text-white hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-650 text-xs"
                  >
                    Replace All Matches
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Button variant="outline" size="sm" onClick={handleFlatten} className="text-xs font-semibold">
                    Flatten Structure
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleUnflatten} className="text-xs font-semibold">
                    Unflatten Keys
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Main Workspace layout ────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* LEFT SIDE: Code / Text Editor */}
          <div className="flex flex-col bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-2xl h-[38rem] focus-within:border-violet-500/80 focus-within:ring-2 focus-within:ring-violet-500/10 transition-all duration-300">
            {/* Editor title panel */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-violet-500" />
                <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">
                  JSON Source Code
                </span>
                {inputText.trim() && (
                  <span className="text-xs bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 font-extrabold px-2 py-0.5 rounded-md">
                    {inputText.split("\n").length} Lines
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handlePasteInput}
                  title="Paste clipboard content"
                  className="p-1.5 text-slate-450 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:text-indigo-400 dark:hover:bg-slate-700 rounded-md transition-colors"
                >
                  <FolderOpen className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleCopyText(inputText)}
                  disabled={!inputText}
                  title="Copy JSON text"
                  className="p-1.5 text-slate-450 hover:text-violet-600 hover:bg-violet-50 dark:hover:text-violet-400 dark:hover:bg-slate-700 rounded-md transition-colors disabled:opacity-40"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDownloadFile(inputText, "document.json")}
                  disabled={!inputText}
                  title="Download JSON file"
                  className="p-1.5 text-slate-450 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:text-emerald-400 dark:hover:bg-slate-700 rounded-md transition-colors disabled:opacity-40"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Custom synced code editor */}
            <div className="grow flex overflow-hidden relative">
              <div
                ref={lineNumbersRef}
                className="w-12 bg-slate-50/50 dark:bg-slate-900/10 text-right pr-2.5 font-mono text-sm text-slate-400 dark:text-slate-650 select-none py-3 overflow-hidden border-r border-slate-100 dark:border-slate-700/50 leading-[22px]"
              >
                {lineNumbers.map(n => (
                  <div key={n}>{n}</div>
                ))}
              </div>

              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onScroll={handleScroll}
                placeholder={`Paste your JSON content here...\nExample:\n{\n  "id": 101,\n  "name": "Widget",\n  "tags": ["new", "sale"]\n}`}
                className="grow font-mono text-sm leading-[22px] p-3 outline-none resize-none bg-transparent text-slate-700 dark:text-slate-200 placeholder-slate-350 dark:placeholder-slate-650 overflow-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700"
                spellCheck="false"
              />
            </div>

            {/* Verification Status bar */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-700/60 text-xs">
              {validationError ? (
                <div className="flex items-start gap-2 text-rose-500 font-medium bg-rose-50/50 dark:bg-rose-955/20 border border-rose-200/50 dark:border-rose-950/40 p-2.5 rounded-xl">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 animate-pulse" />
                  <div>
                    <span className="font-bold block mb-0.5">Parsing Exception Details</span>
                    <span className="font-mono text-[10px] break-all">{validationError}</span>
                  </div>
                </div>
              ) : inputText.trim() ? (
                <div>
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50/40 dark:bg-emerald-955/15 border border-emerald-250/30 dark:border-emerald-900/30 p-2.5 rounded-xl">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Strict JSON Validation Passed (Bytes: {new Blob([inputText]).size} B)</span>
                  </div>

                  {/* Structural analytics expansion */}
                  <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                    <button
                      onClick={() => setShowAnalytics(!showAnalytics)}
                      className="flex items-center gap-1 text-[11px] text-violet-600 dark:text-violet-400 font-bold hover:underline hover:text-violet-700"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      {showAnalytics ? "Hide Data Analytics Breakdown" : "Analyze JSON Key Metrics & Breakdown"}
                    </button>

                    {showAnalytics && (
                      <div className="grid grid-cols-4 gap-2 mt-2.5 animate-in fade-in slide-in-from-top-1.5 duration-200">
                        {[
                          { label: "Total Keys", val: stats.keysCount, color: "bg-violet-50/60 text-violet-600 dark:bg-violet-955/25 dark:text-violet-400 border-violet-100 dark:border-violet-900/30" },
                          { label: "Max Depth", val: stats.depth, color: "bg-indigo-50/60 text-indigo-600 dark:bg-indigo-950/25 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/30" },
                          { label: "Objects", val: stats.objectsCount, color: "bg-blue-50/60 text-blue-600 dark:bg-blue-955/25 dark:text-blue-400 border-blue-100 dark:border-blue-900/30" },
                          { label: "Arrays", val: stats.arraysCount, color: "bg-sky-50/60 text-sky-655 dark:bg-sky-955/25 dark:text-sky-400 border-sky-100 dark:border-sky-900/30" },
                          { label: "Strings", val: stats.stringsCount, color: "bg-emerald-50/60 text-emerald-600 dark:bg-emerald-955/25 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30" },
                          { label: "Numbers", val: stats.numbersCount, color: "bg-amber-50/60 text-amber-600 dark:bg-amber-955/25 dark:text-amber-400 border-amber-100 dark:border-amber-900/30" },
                          { label: "Booleans", val: stats.booleansCount, color: "bg-rose-50/60 text-rose-655 dark:bg-rose-955/25 dark:text-rose-400 border-rose-100 dark:border-rose-900/30" },
                          { label: "Nulls", val: stats.nullsCount, color: "bg-slate-100 text-slate-655 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700/60" }
                        ].map(item => (
                          <div key={item.label} className={`p-1.5 rounded-xl border flex flex-col items-center justify-center text-center ${item.color}`}>
                            <span className="font-mono text-sm font-extrabold">{item.val}</span>
                            <span className="text-[8px] font-bold uppercase tracking-wider mt-0.5">{item.label}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <span className="text-slate-400 dark:text-slate-500 italic block py-0.5">Workspace is empty. Paste data to begin.</span>
              )}
            </div>
          </div>

          {/* RIGHT SIDE: Interactive Visualizer & Utilities */}
          <div className="flex flex-col bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-2xl h-[38rem] focus-within:border-indigo-500/40 transition-all duration-300">
            {/* Tabs selector */}
            <div className="flex border-b border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/50 p-1.5 shrink-0 overflow-x-auto gap-1">
              {[
                { id: "tree", label: "Tree Editor", icon: Braces },
                { id: "table", label: "Table Grid", icon: Table },
                { id: "diff", label: "JSON Diff", icon: GitCompare },
                { id: "schema", label: "Schema Validator", icon: CheckCircle2 },
                { id: "convert", label: "Converters", icon: ArrowRightLeft },
                { id: "query", label: "Query Console", icon: Search }
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-205 ${activeTab === tab.id
                        ? "bg-violet-600 text-white shadow-md shadow-violet-200 dark:shadow-none"
                        : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50"
                      }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tabs Content panel */}
            <div className="grow overflow-auto p-7 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
              {/* TAB 1: Visual Tree Editor */}
              {activeTab === "tree" && (
                <div className="h-full flex flex-col">
                  {!parsedJson ? (
                    <div className="grow flex flex-col items-center justify-center text-slate-300 dark:text-slate-600">
                      <Braces className="w-12 h-12 opacity-20 mb-3" />
                      <p className="text-sm font-medium italic text-slate-400">
                        {validationError
                          ? "Resolve errors on the left to compile tree structure"
                          : "Input JSON on the left to populate tree nodes"}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700/50 pb-2">
                        <span className="font-semibold flex items-center gap-1.5">
                          <Info className="w-3.5 h-3.5 text-violet-500 animate-pulse" /> Hover node items to add child, copy, or delete
                        </span>
                        <button
                          onClick={() => setTreeExpanded({})}
                          className="text-violet-500 hover:underline hover:text-violet-650 font-bold"
                        >
                          Collapse All
                        </button>
                      </div>

                      <div className="bg-slate-50/50 dark:bg-slate-900/10 border border-slate-200/30 dark:border-slate-700/30 rounded-2xl p-4 overflow-x-auto shadow-inner">
                        <TreeNode
                          name="root"
                          value={parsedJson}
                          path={[]}
                          onAction={handleTreeAction}
                          expandedState={treeExpanded}
                          setExpandedState={setTreeExpanded}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: Table Grid View */}
              {activeTab === "table" && (
                <div className="h-full flex flex-col">
                  {!parsedJson ? (
                    <div className="grow flex flex-col items-center justify-center text-slate-300 dark:text-slate-600">
                      <Table className="w-12 h-12 opacity-20 mb-3" />
                      <p className="text-sm font-medium italic text-slate-400">
                        Load valid JSON on the left to display tabular view.
                      </p>
                    </div>
                  ) : (
                    <JsonTableView data={parsedJson} />
                  )}
                </div>
              )}

              {/* TAB 3: JSON Diff comparison */}
              {activeTab === "diff" && (
                <div className="space-y-4 h-full flex flex-col">
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-550 dark:text-slate-400 mb-1.5">
                        Compare Workspace with this Base JSON
                      </label>
                      <textarea
                        value={comparisonText}
                        onChange={(e) => setComparisonText(e.target.value)}
                        placeholder='{"appName": "ToolsTrek JSON Suite", "version": 1.0}'
                        className="w-full font-mono text-xs p-3 bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-violet-500 text-slate-800 dark:text-slate-200 h-24 resize-none"
                      />
                      {comparisonParseError && (
                        <p className="text-[10px] text-rose-500 font-semibold mt-1">
                          Parser exception: {comparisonParseError}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grow flex flex-col border border-slate-200 dark:border-slate-700/60 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-900/10 shadow-inner">
                    <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700 bg-slate-100/60 dark:bg-slate-800/60 text-xs font-bold text-slate-700 dark:text-slate-350">
                      Discrepancies & Modifications
                    </div>

                    <div className="grow p-3 overflow-y-auto space-y-2 text-xs">
                      {!parsedJson || !comparisonText.trim() ? (
                        <p className="text-slate-400 dark:text-slate-550 italic text-center py-6">
                          Input base comparison text to run difference comparator.
                        </p>
                      ) : diffResults.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-emerald-500 gap-1.5 font-semibold">
                          <CheckCircle2 className="w-8 h-8" />
                          <span>No structural differences! Objects are identical.</span>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          {diffResults.map((diff, index) => (
                            <div
                              key={index}
                              className={`p-2.5 rounded-xl border flex flex-col gap-1.5 font-mono text-[11px] ${diff.type === "ADDED"
                                  ? "bg-emerald-50 border-emerald-250 dark:bg-emerald-950/20 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400"
                                  : diff.type === "DELETED"
                                    ? "bg-rose-50 border-rose-250 dark:bg-rose-955/20 dark:border-rose-900/40 text-rose-600 dark:text-rose-400"
                                    : "bg-amber-50 border-amber-250 dark:bg-amber-955/20 dark:border-amber-900/40 text-amber-600 dark:text-amber-400"
                                }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-extrabold uppercase tracking-wider text-[9px] px-1.5 py-0.5 rounded bg-white dark:bg-slate-850">
                                  {diff.type.replace("_", " ")}
                                </span>
                                <span className="font-bold break-all">{diff.path}</span>
                              </div>

                              <div className="pl-1.5 border-l-2 border-current/40">
                                {diff.type === "ADDED" && (
                                  <div>Added: <span className="font-bold">{JSON.stringify(diff.newVal)}</span></div>
                                )}
                                {diff.type === "DELETED" && (
                                  <div>Removed: <span className="font-bold">{JSON.stringify(diff.oldVal)}</span></div>
                                )}
                                {diff.type === "MODIFIED" && (
                                  <div>
                                    Changed from: <span className="line-through opacity-70">{JSON.stringify(diff.oldVal)}</span>
                                    <span className="mx-1">→</span>
                                    <span className="font-bold">{JSON.stringify(diff.newVal)}</span>
                                  </div>
                                )}
                                {diff.type === "TYPE_CHANGED" && (
                                  <div>
                                    Type changed from <span className="font-bold">{diff.oldType}</span> to <span className="font-bold">{diff.newType}</span>
                                    <div className="mt-0.5">Value: {JSON.stringify(diff.oldVal)} → {JSON.stringify(diff.newVal)}</div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: Schema Validation */}
              {activeTab === "schema" && (
                <div className="space-y-4 h-full flex flex-col">
                  <div>
                    <label className="block text-xs font-semibold text-slate-550 dark:text-slate-400 mb-1.5">
                      JSON Schema Compliance (Draft-07 Structure)
                    </label>
                    <textarea
                      value={schemaText}
                      onChange={(e) => setSchemaText(e.target.value)}
                      className="w-full font-mono text-xs p-3 bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-violet-500 text-slate-800 dark:text-slate-200 h-28 resize-none"
                    />
                    {schemaParseError && (
                      <p className="text-[10px] text-rose-500 font-semibold mt-1">
                        Schema JSON Error: {schemaParseError}
                      </p>
                    )}
                  </div>

                  <div className="grow flex flex-col border border-slate-200 dark:border-slate-700/60 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-900/10 shadow-inner">
                    <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700 bg-slate-100/60 dark:bg-slate-800/60 text-xs font-bold text-slate-700 dark:text-slate-350">
                      Compliance & Validation Warnings
                    </div>

                    <div className="grow p-3 overflow-y-auto space-y-2 text-xs">
                      {!parsedJson ? (
                        <p className="text-slate-400 dark:text-slate-555 italic text-center py-6">
                          Input valid JSON on the left to run validation tests.
                        </p>
                      ) : schemaValidationResult.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-emerald-500 gap-1.5 font-semibold">
                          <CheckCircle2 className="w-8 h-8 font-semibold" />
                          <span>Schema compliant! All constraint checks passed.</span>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          {schemaValidationResult.map((err, index) => (
                            <div
                              key={index}
                              className="p-2.5 bg-rose-50 border border-rose-200 dark:bg-rose-955/20 dark:border-rose-900/40 rounded-xl text-rose-600 dark:text-rose-400 font-mono text-[11px] flex gap-2 items-start"
                            >
                              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-extrabold block text-[9px] text-rose-800 dark:text-rose-300 uppercase tracking-wider">
                                  Constraint Violated at: {err.path || "root"}
                                </span>
                                <span>{err.message}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: Converters */}
              {activeTab === "convert" && (
                <div className="space-y-5">
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/10 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        Export JSON as Format:
                      </span>
                      <div className="flex border border-slate-205 dark:border-slate-700 rounded-lg overflow-hidden shrink-0 shadow">
                        {["yaml", "xml", "csv"].map(format => (
                          <button
                            key={format}
                            onClick={() => setConvertFormat(format)}
                            className={`px-3 py-1 text-[11px] font-bold uppercase transition ${convertFormat === format
                                ? "bg-violet-600 text-white shadow-sm"
                                : "bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                              }`}
                          >
                            {format}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="relative group">
                      <textarea
                        readOnly
                        value={convertedText}
                        className="w-full font-mono text-[11px] p-3 bg-slate-100/60 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-700/50 rounded-xl text-slate-700 dark:text-slate-350 h-28 resize-none outline-none select-all"
                      />
                      <div className="absolute right-2.5 bottom-2.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleCopyText(convertedText)}
                          title="Copy text"
                          className="p-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 rounded-lg shadow-sm"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDownloadFile(convertedText, `document.${convertFormat}`)}
                          title="Download file"
                          className="p-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 rounded-lg shadow-sm"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-900/10 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        Import Data into Editor:
                      </span>
                      <div className="flex border border-slate-205 dark:border-slate-700 rounded-lg overflow-hidden shrink-0 shadow">
                        {["yaml", "xml", "csv"].map(format => (
                          <button
                            key={format}
                            onClick={() => setImportFormat(format)}
                            className={`px-3 py-1 text-[11px] font-bold uppercase transition ${importFormat === format
                                ? "bg-indigo-650 text-white shadow-sm"
                                : "bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                              }`}
                          >
                            {format}
                          </button>
                        ))}
                      </div>
                    </div>

                    <textarea
                      placeholder={`Paste standard ${importFormat.toUpperCase()} here to load it as JSON...`}
                      value={importText}
                      onChange={(e) => setImportText(e.target.value)}
                      className="w-full font-mono text-[11px] p-3 bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 h-28 resize-none outline-none focus:ring-2 focus:ring-indigo-500"
                    />

                    <Button
                      onClick={handleImportToJSON}
                      disabled={!importText.trim()}
                      className="w-full bg-indigo-655 hover:bg-indigo-700 text-white text-xs mt-2.5 font-bold shadow"
                    >
                      Parse and Load into Workspace
                    </Button>
                  </div>
                </div>
              )}

              {/* TAB 6: Query Console */}
              {activeTab === "query" && (
                <div className="space-y-4 h-full flex flex-col">
                  <div>
                    <label className="block text-xs font-semibold text-slate-555 dark:text-slate-400 mb-1.5 flex items-center justify-between">
                      <span>Query Filter Engine</span>
                      <span className="text-[10px] text-slate-450 italic">e.g. stats.users or features[0]</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. stats.status.online or maintainers[0].name"
                        value={queryText}
                        onChange={(e) => setQueryText(e.target.value)}
                        className="grow text-xs bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-700 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-violet-500 text-slate-700 dark:text-slate-300 font-mono"
                      />
                      <Button
                        onClick={handleEvaluateQuery}
                        className="bg-violet-600 hover:bg-violet-755 text-white text-xs px-4 shadow"
                      >
                        Run Filter
                      </Button>
                    </div>
                    {queryError && (
                      <p className="text-[10px] text-rose-500 font-semibold mt-1">
                        Evaluation Error: {queryError}
                      </p>
                    )}
                  </div>

                  <div className="grow flex flex-col border border-slate-200 dark:border-slate-700/60 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-900/10 shadow-inner">
                    <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700 bg-slate-100/60 dark:bg-slate-800/60 text-xs font-bold text-slate-700 dark:text-slate-350 flex items-center justify-between">
                      <span>Filtered Results Output</span>
                      {queryResult && (
                        <button
                          onClick={() => handleCopyText(queryResult)}
                          title="Copy output"
                          className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grow p-3 overflow-y-auto text-xs">
                      {queryResult ? (
                        <pre className="font-mono text-[11px] text-slate-700 dark:text-slate-350 leading-relaxed whitespace-pre-wrap">
                          {queryResult}
                        </pre>
                      ) : (
                        <p className="text-slate-400 dark:text-slate-550 italic text-center py-6">
                          Enter valid query key paths to display filtered matches.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── INFO & DOCUMENTATION SECTIONS (Added beneath Editor) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-16 pt-10 border-t border-slate-200 dark:border-slate-700/60">

          {/* Column 1 & 2: JSON Concept & Practical Examples */}
          <div className="lg:col-span-2 space-y-8">

            {/* What is JSON Section */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-bold text-slate-850 dark:text-slate-100 mb-3.5 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-violet-500" />
                What is JSON?
              </h2>
              <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
                <p>
                  <strong>JSON</strong> stands for <strong>JavaScript Object Notation</strong>. It is a lightweight, text-based, language-independent data interchange format widely used for APIs, web configurations, and local application states.
                </p>
                <p>
                  Built on a collection of key-value pairs (Objects) and ordered lists (Arrays), JSON mimics universal structures shared by almost all programming environments (Python dicts/lists, Java Maps, C# Dictionaries, PHP associative arrays, etc.). This compatibility makes transmitting database records to clients instant and uniform.
                </p>
              </div>
            </div>

            {/* JSON Code Examples Section */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-bold text-slate-850 dark:text-slate-100 mb-2">
                JSON Structure & Format Examples
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                Click any of the code examples below to load them directly into your text editor.
              </p>

              <div className="space-y-6">
                {/* Example 1: Simple Object */}
                <div className="border border-slate-250 dark:border-slate-750 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900">
                  <div className="px-4 py-2.5 border-b border-slate-250 dark:border-slate-750 flex justify-between items-center bg-slate-100 dark:bg-slate-800/80">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300 font-mono">1. Simple Flat Object</span>
                    <button
                      onClick={() => handleLoadDocExample(exampleObjectStr)}
                      className="text-xs bg-violet-600 hover:bg-violet-750 text-white font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      Load Example
                    </button>
                  </div>
                  <pre className="p-4 text-sm font-mono text-slate-800 dark:text-slate-200 overflow-x-auto leading-relaxed select-all bg-white dark:bg-slate-950">
                    {exampleObjectStr}
                  </pre>
                </div>

                {/* Example 2: Nested Object */}
                <div className="border border-slate-250 dark:border-slate-750 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900">
                  <div className="px-4 py-2.5 border-b border-slate-250 dark:border-slate-750 flex justify-between items-center bg-slate-100 dark:bg-slate-800/80">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300 font-mono">2. Deeply Nested Structures</span>
                    <button
                      onClick={() => handleLoadDocExample(exampleNestedStr)}
                      className="text-xs bg-violet-600 hover:bg-violet-750 text-white font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      Load Example
                    </button>
                  </div>
                  <pre className="p-4 text-sm font-mono text-slate-800 dark:text-slate-200 overflow-x-auto leading-relaxed select-all bg-white dark:bg-slate-950">
                    {exampleNestedStr}
                  </pre>
                </div>

                {/* Example 3: Array List Matrix */}
                <div className="border border-slate-250 dark:border-slate-750 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900">
                  <div className="px-4 py-2.5 border-b border-slate-250 dark:border-slate-750 flex justify-between items-center bg-slate-100 dark:bg-slate-800/80">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300 font-mono">3. Array Matrix (CSV Tabular Data)</span>
                    <button
                      onClick={() => handleLoadDocExample(exampleArrayStr)}
                      className="text-xs bg-violet-600 hover:bg-violet-750 text-white font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      Load Example
                    </button>
                  </div>
                  <pre className="p-4 text-sm font-mono text-slate-800 dark:text-slate-200 overflow-x-auto leading-relaxed select-all bg-white dark:bg-slate-950">
                    {exampleArrayStr}
                  </pre>
                </div>
              </div>
            </div>
          </div>

          {/* Column 3: Syntax Checklist & FAQs */}
          <div className="space-y-6">

            {/* Syntax Checklist */}
            <div className="bg-gradient-to-br from-violet-50/50 to-indigo-50/30 dark:from-violet-950/10 dark:to-indigo-950/5 border border-violet-100 dark:border-violet-900/30 rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400 mb-3 flex items-center gap-1.5">
                <Info className="w-4 h-4 shrink-0" />
                Strict JSON Syntax Checklist
              </h3>
              <ul className="space-y-2.5 text-sm text-slate-650 dark:text-slate-400 leading-relaxed list-disc list-inside">
                <li>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Double Quotes Only:</span> All property keys and string values MUST use double quotes (`"key"`), not single quotes (`'key'`).
                </li>
                <li>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">No Trailing Commas:</span> Extra commas before closing brackets/braces are invalid. (Turn on <span className="font-bold text-violet-650 dark:text-violet-400">Loose Parser</span> to auto-clean them).
                </li>
                <li>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Supported Values:</span> strings, numbers, booleans (`true`/`false`), objects (`{ }`), arrays (`[]`), and `null`.
                </li>
                <li>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">No Comments:</span> Standard JSON doesn&apos;t support comments like `//` or `/* */` (Toggle Loose Parser to strip them).
                </li>
              </ul>
            </div>

            {/* FAQs */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 shrink-0 text-slate-400" />
                Frequently Asked Questions
              </h3>

              <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-750">
                <div className="pt-0">
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-250 mb-1.5">
                    Is my pasted data secure?
                  </h4>
                  <p className="text-sm text-slate-550 dark:text-slate-400 leading-relaxed">
                    Yes! All JSON parsing, visual tree interactions, diff logic, conversions, and filters run entirely offline inside your local browser. No data ever leaves your device.
                  </p>
                </div>

                <div className="pt-3">
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-250 mb-1.5">
                    What is a JSON Schema?
                  </h4>
                  <p className="text-sm text-slate-550 dark:text-slate-400 leading-relaxed">
                    It is a draft constraint model to validate matching values and properties recursively. Paste your schema rules in the validation tab to see structural warnings immediately.
                  </p>
                </div>

                <div className="pt-3">
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-250 mb-1.5">
                    How do I query deep arrays?
                  </h4>
                  <p className="text-sm text-slate-555 dark:text-slate-400 leading-relaxed">
                    Switch to the Query Console, type an evaluation string (e.g. <code>maintainers.map(m =&gt; m.name)</code>), and press &quot;Run Filter&quot; to print filtered nodes.
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </ToolPageShell>
  );
}
