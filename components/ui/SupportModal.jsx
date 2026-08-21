"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Heart, Coffee, ExternalLink, Sparkles, CreditCard, Wallet } from "lucide-react";

export default function SupportModal({ isOpen, onClose }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border border-gray-200/80 dark:border-gray-800/80 bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl shadow-2xl rounded-2xl p-6 overflow-hidden sm:rounded-2xl font-googleSansFlex">
        {/* Ambient background glow effects */}
        <div className="absolute -top-20 -left-20 w-44 h-44 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-44 h-44 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <DialogHeader className="text-center sm:text-center space-y-2 relative z-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-500 text-white mb-1">
            <Heart className="size-7 fill-white/30 animate-pulse" />
          </div>
          <DialogTitle className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center justify-center gap-2 font-googleSansFlex">
            Support ToolsTrek <Sparkles className="size-5 text-amber-500 fill-amber-500/20" />
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600 dark:text-gray-400 max-w-xs mx-auto">
            Your support keeps ToolsTrek free, open-source, and constantly improving. Choose how you&apos;d like to support:
          </DialogDescription>
        </DialogHeader>

        <div className="mt-5 space-y-3 relative z-10">
          {/* Button 1: Buy Me a Coffee */}
          <a
            href="https://buymeacoffee.com/tasnimulhaque"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-center justify-between p-4 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent hover:from-amber-500/20 hover:border-amber-400 dark:hover:border-amber-500/60 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex size-11 items-center justify-center rounded-xl bg-amber-500 text-white shadow-md shadow-amber-500/30 group-hover:scale-110 transition-transform duration-300">
                <Coffee className="size-5" />
              </div>
              <div className="text-left">
                <div className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  Buy Me a Coffee
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-0.5">
                  <CreditCard className="size-3.5 text-amber-500" />
                  <span>Card, PayPal & International</span>
                </div>
              </div>
            </div>
            <div className="size-8 rounded-full bg-amber-100 dark:bg-amber-950/80 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300 shrink-0">
              <ExternalLink className="size-4" />
            </div>
          </a>

          {/* Button 2: Support Kori */}
          <a
            href="https://www.supportkori.com/tasnimulhaque"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-center justify-between p-4 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-transparent hover:from-rose-500/20 hover:border-rose-400 dark:hover:border-rose-500/60 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-tr from-rose-500 to-pink-600 text-white shadow-md shadow-rose-500/30 group-hover:scale-110 transition-transform duration-300">
                <Wallet className="size-5" />
              </div>
              <div className="text-left">
                <div className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                  Support Kori
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-0.5">
                  <Heart className="size-3.5 text-rose-500 fill-rose-500" />
                  <span>bKash, Nagad, Rocket & Cards</span>
                </div>
              </div>
            </div>
            <div className="size-8 rounded-full bg-rose-100 dark:bg-rose-950/80 flex items-center justify-center text-rose-600 dark:text-rose-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300 shrink-0">
              <ExternalLink className="size-4" />
            </div>
          </a>
        </div>

        <div className="mt-5 text-center text-xs text-gray-400 dark:text-gray-500 border-t border-gray-100 dark:border-gray-900/80 pt-4">
          Thank you for supporting independent open-source tools! ❤️
        </div>
      </DialogContent>
    </Dialog>
  );
}
