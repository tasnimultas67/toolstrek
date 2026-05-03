// app/error.jsx
"use client";

import Link from "next/link";
import {
  Home,
  RefreshCw,
  AlertTriangle,
  Wrench,
  Zap,
  Shield,
} from "lucide-react";
import { useEffect } from "react";

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4 pb-16 pt-26">
      <div className="max-w-2xl w-full text-center">
        {/* Animated Error Icon */}
        <div className="relative mb-8">
          <div className="relative inline-block">
            <div className="absolute inset-0 animate-ping">
              <AlertTriangle size={120} className="text-red-500 opacity-20" />
            </div>
            <AlertTriangle
              size={120}
              className="relative text-red-500 dark:text-red-400"
              strokeWidth={1.5}
            />
          </div>

          {/* Decorative Tools Icons */}
          <div className="absolute -top-4 -left-4 opacity-20 dark:opacity-10 animate-pulse">
            <Wrench size={64} strokeWidth={1.5} />
          </div>
          <div className="absolute -bottom-4 -right-4 opacity-20 dark:opacity-10 animate-pulse [animation-delay:1s]">
            <Zap size={64} strokeWidth={1.5} />
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10 dark:opacity-5 animate-[spin_20s_linear_infinite]">
            <Shield size={120} strokeWidth={1} />
          </div>
        </div>

        {/* Message */}
        <div className="relative z-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-4">
            Something Went Wrong!
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg mb-2">
            Our tools encountered an unexpected issue.
          </p>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Don&apos;t worry, we&apos;re on it! Please try again or return to
            the homepage.
          </p>

          {/* Error Details (Only in development) */}
          {process.env.NODE_ENV === "development" && error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-8 max-w-md mx-auto text-left">
              <p className="text-sm font-mono text-red-600 dark:text-red-400 break-all">
                {error.message || "Unknown error occurred"}
              </p>
              {error.stack && (
                <details className="mt-2">
                  <summary className="text-xs text-red-500 dark:text-red-400 cursor-pointer">
                    Stack trace
                  </summary>
                  <pre className="mt-2 text-xs text-red-600 dark:text-red-300 overflow-auto max-h-32">
                    {error.stack}
                  </pre>
                </details>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <RefreshCw size={18} />
              Try Again
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
            >
              <Home size={18} />
              Back to Home
            </Link>
          </div>

          {/* Helpful Tips */}
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Here are some things you can try:
            </p>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p>🔹 Refresh the page and try again</p>
              <p>🔹 Clear your browser cache</p>
              <p>🔹 Check your internet connection</p>
              <p>🔹 Contact support if the problem persists</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
