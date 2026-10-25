"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Heart,
  Coffee,
  ExternalLink,
  Sparkles,
  CreditCard,
  Wallet,
} from "lucide-react";

const options = [
  {
    id: "bmc",
    href: "https://buymeacoffee.com/tasnimulhaque",
    title: "Buy Me a Coffee",
    note: "Card, PayPal & International",
    Icon: Coffee,
    NoteIcon: CreditCard,
    noteIconClass: "text-brandColor",
  },
  {
    id: "kori",
    href: "https://www.supportkori.com/tasnimulhaque",
    title: "Support Kori",
    note: "bKash, Nagad, Rocket & Cards",
    Icon: Wallet,
    NoteIcon: Heart,
    noteIconClass: "text-brandColor fill-brandColor",
  },
];

export default function SupportModal({ isOpen, onClose }) {
  const reduceMotion = useReducedMotion();

  // Smooth staggered entrance (disabled when the user prefers reduced motion)
  const container = {
    hidden: {},
    visible: {
      transition: reduceMotion
        ? {}
        : { staggerChildren: 0.09, delayChildren: 0.08 },
    },
  };
  const item = {
    hidden: reduceMotion ? { opacity: 1 } : { opacity: 0, y: 14 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border border-gray-200/80 dark:border-white/10 bg-white/90 dark:bg-gray-950/90 backdrop-blur-2xl shadow-2xl rounded-3xl p-6 overflow-hidden sm:rounded-3xl font-googleSansFlex">
        {/* ───────── Premium grid background ───────── */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        >
          {/* Grid lines (light) */}
          <div
            className="absolute inset-0 opacity-100 dark:opacity-0
              bg-[linear-gradient(to_right,rgba(15,23,42,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.06)_1px,transparent_1px)]
              bg-[size:32px_32px]
              [mask-image:radial-gradient(ellipse_80%_55%_at_50%_0%,#000_50%,transparent_100%)]"
          />
          {/* Grid lines (dark) */}
          <div
            className="absolute inset-0 opacity-0 dark:opacity-100
              bg-[linear-gradient(to_right,rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.07)_1px,transparent_1px)]
              bg-[size:32px_32px]
              [mask-image:radial-gradient(ellipse_80%_55%_at_50%_0%,#000_50%,transparent_100%)]"
          />
          {/* Brand glows */}
          <div className="absolute -top-20 -left-20 w-44 h-44 bg-brandColor/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-44 h-44 bg-brandColor/10 rounded-full blur-3xl" />
        </div>

        <motion.div
          className="relative z-10"
          variants={container}
          initial="hidden"
          animate={isOpen ? "visible" : "hidden"}
        >
          <DialogHeader className="text-center sm:text-center space-y-2">
            <motion.div
              variants={item}
              className="relative mx-auto mb-1 flex h-14 w-14 items-center justify-center rounded-2xl bg-brandColor text-white ring-1 ring-inset ring-white/25"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent"
              />
              {/* Gentle heartbeat */}
              <motion.span
                className="flex"
                animate={reduceMotion ? undefined : { scale: [1, 1.12, 1] }}
                transition={{
                  duration: 1.8,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatDelay: 0.6,
                }}
              >
                <Heart className="size-7 fill-white/30" />
              </motion.span>
            </motion.div>

            <motion.div variants={item}>
              <DialogTitle className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center justify-center gap-2 font-googleSansFlex">
                Support ToolsTrek{" "}
                <Sparkles className="size-5 text-brandColor fill-brandColor/20" />
              </DialogTitle>
            </motion.div>

            <motion.div variants={item}>
              <DialogDescription className="text-sm text-gray-600 dark:text-gray-400 max-w-xs mx-auto">
                Your support keeps ToolsTrek free, open-source, and constantly
                improving. Choose how you&apos;d like to support:
              </DialogDescription>
            </motion.div>
          </DialogHeader>

          <div className="mt-6 space-y-3">
            {options.map(
              ({ id, href, title, note, Icon, NoteIcon, noteIconClass }) => (
                <motion.a
                  key={id}
                  variants={item}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex items-center justify-between gap-3 p-4 rounded-2xl border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] backdrop-blur-md transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-brandColor/50 hover:bg-white dark:hover:bg-white/[0.08] hover:shadow-[0_12px_28px_-12px] hover:shadow-brandColor/40 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandColor/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-950"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-brandColor text-white ring-1 ring-inset ring-white/25 transition-transform duration-300 ease-out group-hover:scale-110 group-hover:-rotate-3">
                      <Icon className="size-5" />
                    </div>
                    <div className="text-left">
                      <div className="text-base font-semibold text-gray-900 dark:text-white transition-colors duration-300 group-hover:text-brandColor">
                        {title}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-0.5">
                        <NoteIcon className={`size-3.5 ${noteIconClass}`} />
                        <span>{note}</span>
                      </div>
                    </div>
                  </div>
                  <div className="size-8 rounded-full border border-brandColor/20 bg-brandColor/10 flex items-center justify-center text-brandColor transition-all duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:bg-brandColor group-hover:text-white group-hover:border-brandColor shrink-0">
                    <ExternalLink className="size-4" />
                  </div>
                </motion.a>
              ),
            )}
          </div>

          <motion.div
            variants={item}
            className="mt-6 text-center text-xs text-gray-400 dark:text-gray-500 border-t border-gray-100 dark:border-white/10 pt-4"
          >
            Thank you for supporting independent open-source tools! ❤️
          </motion.div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
