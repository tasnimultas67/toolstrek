"use client";
import React, { useState } from "react";

const CaseConverter = () => {
  const [text, setText] = useState("");

  const handleTransform = (type) => {
    switch (type) {
      case "upper":
        setText(text.toUpperCase());
        break;
      case "lower":
        setText(text.toLowerCase());
        break;
      case "sentence":
        setText(
          text
            .toLowerCase()
            .replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase()),
        );
        break;
      case "title":
        setText(text.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()));
        break;
      case "slug":
        setText(
          text
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, ""),
        );
        break;
      case "clear":
        setText("");
        break;
      default:
        break;
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
        Case Converter
      </h2>

      <textarea
        className="w-full h-64 p-4 mb-4 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
        placeholder="Paste or type your text here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => handleTransform("upper")}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          UPPERCASE
        </button>
        <button
          onClick={() => handleTransform("lower")}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          lowercase
        </button>
        <button
          onClick={() => handleTransform("sentence")}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Sentence case
        </button>
        <button
          onClick={() => handleTransform("title")}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Title Case
        </button>
        <button
          onClick={() => handleTransform("slug")}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
        >
          URL-slug
        </button>
      </div>

      <div className="flex justify-between border-t pt-4 border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Words: {text.trim() === "" ? 0 : text.trim().split(/\s+/).length} |
          Characters: {text.length}
        </div>
        <div className="flex gap-2">
          <button
            onClick={copyToClipboard}
            className="text-blue-500 hover:underline font-medium"
          >
            Copy Text
          </button>
          <button
            onClick={() => handleTransform("clear")}
            className="text-red-500 hover:underline font-medium"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};

export default CaseConverter;
