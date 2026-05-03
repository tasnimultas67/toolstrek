// app/global-error.jsx
"use client";

import Link from "next/link";
import { Home, AlertTriangle } from "lucide-react";

export default function GlobalError({ error, reset }) {
  return (
    <html>
      <body>
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
          <div className="max-w-2xl w-full text-center">
            <div className="mb-8">
              <AlertTriangle
                size={120}
                className="text-red-500 mx-auto"
                strokeWidth={1.5}
              />
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-4">
              Critical Error
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Something went seriously wrong. Please try reloading the page.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={reset}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                Try again
              </button>
              <Link
                href="/"
                className="px-6 py-3 bg-white dark:bg-gray-800 border border-gray-300 rounded-lg"
              >
                Go home
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
