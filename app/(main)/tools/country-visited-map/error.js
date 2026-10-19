"use client";

import React from "react";

export default function VisitedCountriesMapError({
  error,
  reset,
}) {
  return (
    <div
      className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 text-gray-900 dark:text-slate-100"
    >
      <div className="rounded-2xl border border-border bg-card dark:bg-input p-8 shadow-lg max-w-md w-full">
        <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
          <span className="text-red-600 dark:text-red-400 text-2xl">⚠️</span>
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">
          Something went wrong loading the map
        </h2>
        <p className="text-muted-foreground text-sm mb-6">
          {error?.message ||
            "We encountered an unexpected error while loading the Visited Countries Map."}
        </p>
        <button
          onClick={() => reset()}
          className="w-full py-2.5 rounded-xl border border-brandColor bg-brandColor text-brandColorForeground font-medium hover:bg-brandColorHover transition shadow-sm"
        >
          Try again
        </button>
        <button
          onClick={() => {
            window.location.reload();
          }}
          className="w-full mt-3 py-2 rounded-xl border border-border bg-background dark:bg-input text-sm font-medium text-foreground hover:bg-accent dark:hover:bg-accent/50 transition"
        >
          Refresh page
        </button>
      </div>
    </div>
  );
}
