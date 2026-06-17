"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, History, Trash2, Compass } from "lucide-react";
import { useRecentTools } from "@/hooks/useRecentTools";
import { formatRelativeTime } from "@/lib/utils";
import ToolsCard from "../tools-compo/ToolsCard";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function RecentClient() {
  const { recentTools, clearRecentTools } = useRecentTools();
  const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);

  const handleClearHistory = () => {
    setIsConfirmOpen(true);
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 dark:from-gray-950 to-white dark:to-gray-900 pt-28 md:pt-32 pb-20 relative overflow-hidden">
      {/* Background Blurs for Premium Aesthetics */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-30 pointer-events-none">
        <div className="absolute top-24 left-10 w-72 h-72 bg-indigo-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-24 right-10 w-72 h-72 bg-brandColor/10 rounded-full blur-3xl" />
      </div>

      <div className="w-11/12 mx-auto max-w-7xl">
        {/* Navigation Breadcrumb */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-brandColor dark:hover:text-brandColor transition-colors duration-200"
          >
            <ArrowLeft className="size-4" />
            Back to Home
          </Link>
        </div>

        {/* Header */}
        <div className="mb-12 text-center lg:text-left flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 mb-4 text-xs font-semibold tracking-wider text-indigo-600 dark:text-indigo-400 uppercase bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/50 rounded-full">
              <History className="size-3.5" /> Recent History
            </span>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
              Recently Used Tools
            </h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
              Track your most-visited digital utilities. We automatically save
              your latest 10 tools here for seamless resuming of tasks.
            </p>
          </div>

          {recentTools.length > 0 && (
            <div className="flex justify-center shrink-0">
              <Button
                onClick={handleClearHistory}
                variant="outline"
                aria-label="Clear all recently used tools history"
                className="border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-700 dark:hover:text-red-350 hover:border-red-300 dark:hover:border-red-800 transition-all duration-200 flex items-center gap-2 cursor-pointer shadow-sm rounded-xl px-5 py-6"
              >
                <Trash2 className="size-4" /> Clear History
              </Button>
            </div>
          )}
        </div>

        {/* Content Section */}
        {recentTools.length > 0 ? (
          <div>
            <div className="mb-6 flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Showing {recentTools.length} recently used{" "}
                {recentTools.length === 1 ? "tool" : "tools"}
              </span>
            </div>

            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              <AnimatePresence mode="popLayout">
                {recentTools.map((tool, index) => (
                  <motion.div
                    key={tool.link}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="h-full"
                  >
                    <ToolsCard
                      index={index}
                      {...tool}
                      lastUsed={formatRelativeTime(tool.lastUsedAt)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </div>
        ) : (
          /* Premium Empty State */
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md mx-auto text-center py-16 px-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-gray-100 dark:border-gray-800 rounded-3xl shadow-xl mt-12 relative overflow-hidden"
          >
            {/* Background glows inside empty state card */}
            <div className="absolute -top-12 -left-12 w-36 h-36 bg-indigo-50 dark:bg-indigo-950/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-36 h-36 bg-brandColor/5 rounded-full blur-2xl pointer-events-none" />
 
            <div className="relative z-10 flex flex-col items-center">
              <div className="mb-6 inline-flex items-center justify-center size-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 text-indigo-500 dark:text-indigo-450 shadow-sm">
                <History className="size-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                No recently used tools yet.
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-8">
                Your history will appear here once you start using tools. Browse
                our full catalog of digital utilities to get started.
              </p>
              <Link
                href="/tools"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-brandColor hover:bg-brandColorHover rounded-xl shadow-md transition-all duration-200 hover:scale-105 cursor-pointer"
              >
                <Compass className="size-4" /> Explore All Tools
              </Link>
            </div>
          </motion.div>
        )}
      </div>

      {/* Modern Confirmation Dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="sm:max-w-md border-gray-100 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-xl z-50">
          <DialogHeader className="space-y-3 flex flex-col items-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/50">
              <Trash2 className="size-6" />
            </div>
            <DialogTitle className="text-xl font-bold text-center text-gray-900 dark:text-white">
              Clear History?
            </DialogTitle>
            <DialogDescription className="text-center text-gray-500 dark:text-gray-400 leading-relaxed">
              Are you sure you want to clear your recently used tools history? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex flex-col-reverse sm:flex-row justify-end gap-2">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 cursor-pointer rounded-xl px-5 py-2.5"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              onClick={() => {
                clearRecentTools();
                setIsConfirmOpen(false);
                toast.success("Recent tools history cleared");
              }}
              type="button"
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white rounded-xl px-5 py-2.5 flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-red-200"
            >
              <Trash2 className="size-4" /> Clear History
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
