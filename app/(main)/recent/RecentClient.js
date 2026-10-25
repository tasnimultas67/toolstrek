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
import SectionInfo from "../tools-compo/SectionInfo";

export default function RecentClient() {
  const { recentTools, clearRecentTools } = useRecentTools();
  const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);

  const handleClearHistory = () => {
    setIsConfirmOpen(true);
  };

  return (
    <div className="relative isolate min-h-screen overflow-hidden pt-20 md:pt-24 pb-20 text-gray-900 dark:text-white transition-colors duration-300">
      {/* ───────── Premium grid background ───────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        {/* Grid lines (light) */}
        <div
          className="absolute inset-0 opacity-100 dark:opacity-0
            bg-[linear-gradient(to_right,rgba(15,23,42,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.06)_1px,transparent_1px)]
            bg-[size:44px_44px]
            [mask-image:radial-gradient(ellipse_75%_60%_at_50%_0%,#000_55%,transparent_100%)]"
        />
        {/* Grid lines (dark) */}
        <div
          className="absolute inset-0 opacity-0 dark:opacity-100
            bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)]
            bg-[size:44px_44px]
            [mask-image:radial-gradient(ellipse_75%_60%_at_50%_0%,#000_55%,transparent_100%)]"
        />
        {/* Soft top glow */}
        <div className="absolute left-1/2 top-0 h-[360px] w-[720px] -translate-x-1/2 rounded-full bg-brandColor/10 dark:bg-brandColor/15 blur-[120px]" />
      </div>

      <div className="w-11/12 mx-auto max-w-7xl">
        {/* Navigation Breadcrumb */}
        <div className="mb-8">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 rounded-full border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] backdrop-blur-md px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-x-0.5 hover:border-brandColor/40 hover:bg-white dark:hover:bg-white/[0.08] hover:text-gray-950 dark:hover:text-white hover:shadow-[0_8px_20px_-10px] hover:shadow-brandColor/40 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandColor/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-950"
          >
            <ArrowLeft className="size-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
            Back to Home
          </Link>
        </div>

        {/* Header */}
        <div className="mb-12 text-center lg:text-left flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="w-full lg:w-7/12 mx-auto">
            <SectionInfo
              title="Recent History"
              subtitle="Recently Used *Tools*."
              description="Track your most-visited digital utilities. We automatically save
              your latest 10 tools here for seamless resuming of tasks."
            />
          </div>
        </div>

        {/* Content Section */}
        {recentTools.length > 0 ? (
          <div>
            <div className="mb-6 flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-4">
              <span className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                Showing
                <span className="inline-flex min-w-[22px] items-center justify-center rounded-full bg-brandColor/10 px-1.5 py-0.5 text-[11px] font-semibold leading-none tabular-nums text-brandColor">
                  {recentTools.length}
                </span>
                recently used {recentTools.length === 1 ? "tool" : "tools"}
              </span>
              {recentTools.length > 0 && (
                <div className="flex justify-center shrink-0">
                  <Button
                    onClick={handleClearHistory}
                    variant="outline"
                    aria-label="Clear all recently used tools history"
                    className="group h-auto inline-flex items-center gap-2 rounded-full border border-red-200/80 dark:border-red-900/50 bg-white/70 dark:bg-white/[0.04] backdrop-blur-md px-5 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:border-red-300 dark:hover:border-red-800 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-700 dark:hover:text-red-300 hover:shadow-[0_8px_20px_-10px] hover:shadow-red-500/40 active:scale-[0.97] cursor-pointer focus-visible:ring-2 focus-visible:ring-red-500/50"
                  >
                    <Trash2 className="size-4" /> Clear History
                  </Button>
                </div>
              )}
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
            className="max-w-md mx-auto text-center py-16 px-6 bg-white/70 dark:bg-white/[0.04] backdrop-blur-xl border border-gray-200/80 dark:border-white/10 rounded-3xl shadow-xl mt-12 relative overflow-hidden"
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
                className="group relative inline-flex items-center gap-2 rounded-full bg-brandColor px-6 py-3 text-sm font-medium text-white border border-brandColor ring-1 ring-inset ring-white/25 shadow-[0_8px_24px_-8px] shadow-brandColor/60 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-8px] hover:shadow-brandColor/70 active:scale-[0.97] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandColor/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-950"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent"
                />
                <Compass className="size-4" /> Explore All Tools
              </Link>
            </div>
          </motion.div>
        )}
      </div>

      {/* Modern Confirmation Dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="sm:max-w-md border-gray-200/80 dark:border-white/10 rounded-3xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl p-6 shadow-2xl z-50">
          <DialogHeader className="space-y-3 flex flex-col items-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/50">
              <Trash2 className="size-6" />
            </div>
            <DialogTitle className="text-xl font-bold text-center text-gray-900 dark:text-white">
              Clear History?
            </DialogTitle>
            <DialogDescription className="text-center text-gray-500 dark:text-gray-400 leading-relaxed">
              Are you sure you want to clear your recently used tools history?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex flex-col-reverse sm:flex-row justify-end gap-2">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto h-auto rounded-full border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 transition-all duration-300 hover:-translate-y-0.5 hover:border-brandColor/40 hover:bg-white dark:hover:bg-white/[0.08] active:scale-[0.97] cursor-pointer"
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
              className="w-full sm:w-auto h-auto rounded-full bg-red-600 hover:bg-red-700 px-5 py-2.5 text-sm font-medium text-white border border-red-600 ring-1 ring-inset ring-white/20 shadow-[0_8px_24px_-8px] shadow-red-500/60 flex items-center justify-center gap-2 transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.97] cursor-pointer"
            >
              <Trash2 className="size-4" /> Clear History
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
