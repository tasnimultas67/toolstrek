// app/tools/error.jsx
"use client";

import Link from "next/link";
import { Home, RefreshCw, Wrench } from "lucide-react";

export default function ToolsError({ error, reset }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 pb-20 pt-30">
      <div className="max-w-lg w-full text-center">
        <div className="mb-6">
          <Wrench
            size={80}
            className="text-orange-500 mx-auto"
            strokeWidth={1.5}
          />
        </div>

        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
          Tool Unavailable
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          This tool is currently experiencing issues. Our team has been
          notified.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            <RefreshCw size={16} />
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <Home size={16} />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
