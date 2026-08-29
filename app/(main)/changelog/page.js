import React from "react";
import Link from "next/link";
import ChangelogFeed from "./ChangelogFeed";
import CTA from "../tools-compo/Home-Compo/CTA";
import { Sparkles, Shield, Zap, Wrench } from "lucide-react";
import { changelogData } from "@/lib/changelogData";

export const metadata = {
  title: "Changelog & Product Updates — ToolsTrek",
  keywords: [
    "changelog",
    "release notes",
    "product updates",
    "toolstrek changelog",
    "new web tools",
    "open source updates",
    "developer tools releases",
    "privacy tools updates",
  ],
  description:
    "Explore the latest tools, feature upgrades, security enhancements, and performance optimizations shipped across the ToolsTrek open-source utility platform.",
  openGraph: {
    title: "ToolsTrek Changelog — What's New & Release Notes",
    description:
      "Stay up to date with new tools, feature releases, performance boosts, and client-side privacy improvements.",
    type: "website",
  },
};

export default function ChangelogPage() {
  const latestRelease = changelogData[0];
  const totalReleases = changelogData.length;

  return (
    <div className="pb-12 pt-16">
      <div className="w-11/12 mx-auto">
        {/* --- Hero Header Section --- */}
        <section className="py-14 md:py-20 text-center">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brandColor/10 border border-brandColor/20 text-brandColor text-xs font-semibold">
              <Sparkles className="size-3.5" />
              <span>Continuous Innovation • Version {latestRelease.version}</span>
            </div>

            {/* Main Title */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-semibold leading-tight tracking-tight text-foreground">
              What’s New in{" "}
              <span
                className="bg-linear-to-r from-brandColor via-emerald-600 to-brandColor bg-size-[200%_auto] animate-gradient-x bg-clip-text text-transparent font-playfairDisplay"
                style={{ fontStyle: "italic" }}
              >
                ToolsTrek
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Follow our changelog to explore the latest tools, feature enhancements,
              privacy protections, and performance boosts across our 100% client-side
              utility hub.
            </p>

            {/* Quick Stat Highlights */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-border rounded-2xl shadow-xs">
                <Wrench className="size-4 text-brandColor" />
                <span className="text-xs font-medium text-foreground">
                  <strong>{totalReleases}</strong> Documented Releases
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-border rounded-2xl shadow-xs">
                <Shield className="size-4 text-emerald-500" />
                <span className="text-xs font-medium text-foreground">
                  <strong>100%</strong> In-Browser Privacy
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-border rounded-2xl shadow-xs">
                <Zap className="size-4 text-amber-500" />
                <span className="text-xs font-medium text-foreground">
                  <strong>Next.js 16</strong> Turbopack Engine
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* --- Interactive Changelog Feed --- */}
        <section className="mb-20">
          <ChangelogFeed />
        </section>
      </div>

      {/* --- Call to Action Banner --- */}
      <CTA />
    </div>
  );
}
