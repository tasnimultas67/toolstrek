// app/not-found.jsx
import Link from "next/link";
import { Home, Search, ArrowLeft, Wrench, Zap, Shield } from "lucide-react";

// Metadata for SEO
export const metadata = {
  title: "404 | Page Not Found - Toolstrek",
  description:
    "Oops! The page you're looking for doesn't exist or has been moved.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4 pb-16 pt-26">
      <div className="max-w-2xl w-full text-center">
        {/* Animated 404 Number */}
        <div className="relative mb-8">
          <h1 className="text-9xl md:text-[12rem] font-extrabold tracking-tighter">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              4
            </span>
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
              0
            </span>
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              4
            </span>
          </h1>

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
            Page Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg mb-2">
            Oops! The tool you&apos;re looking for seems to have rolled away.
          </p>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            The page might have been moved, deleted, or never existed in the
            first place.
          </p>

          {/* Search Suggestion */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-8 max-w-md mx-auto">
            <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
              <Search size={20} />
              <span className="text-sm">
                Try searching for &quot;image compressor&quot;, &quot;PDF
                editor&quot;, or &quot;color picker&quot;
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Home size={18} />
              Back to Home
            </Link>
            <Link
              href="javascript:history.back()"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
            >
              <ArrowLeft size={18} />
              Go Back
            </Link>
          </div>

          {/* Helpful Links */}
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Here are some popular tools you might find useful:
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              {[
                "Image Optimizer",
                "PDF Compressor",
                "Color Converter",
                "Text Diff Checker",
                "QR Generator",
              ].map((tool) => (
                <Link
                  key={tool}
                  href={`/tools/${tool.toLowerCase().replace(/\s+/g, "-")}`}
                  className="text-sm px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  {tool}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
