// components/StatsBar.jsx
// Requires: Tailwind CSS + `npm i lucide-react`
// Works as a Server Component (no "use client" needed).
// Dark mode uses Tailwind's `dark:` variant.

import { Sparkles, Zap, ShieldCheck, GitFork } from "lucide-react";
import toolsData from "../../../lib/toolsData.json";

const stats = [
  { icon: Sparkles, title: toolsData.length, subtitle: "free tools" },
  { icon: Zap, title: "Unlimited", subtitle: "use, no sign-up" },
  {
    icon: ShieldCheck,
    title: "In-browser",
    subtitle: "files stay on your device",
  },
  { icon: GitFork, title: "Open Source", subtitle: "community-driven" },
];

export default function StatsBar() {
  return (
    <section
      aria-label="Highlights"
      className="mx-auto w-full md:w-11/12 -mt-16 md:-mt-10 px-4 md:px-0"
    >
      {/* Gradient hairline border */}
      <div className="rounded-2xl bg-gradient-to-br from-emerald-200/80 via-white to-sky-200/80 p-px shadow-[0_1px_2px_rgba(15,60,45,0.06),0_12px_40px_-12px_rgba(15,60,45,0.18)] dark:from-emerald-400/30 dark:via-white/5 dark:to-sky-400/25 dark:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_12px_40px_-12px_rgba(0,0,0,0.7)]">
        {/* Glass surface */}
        <div className="relative overflow-hidden rounded-[15px] bg-white/85 px-6 py-5 backdrop-blur-xl sm:px-8 dark:bg-neutral-900/85">
          {/* Soft top highlight */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/60 to-transparent dark:via-emerald-400/40"
          />

          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
            {stats.map(({ icon: Icon, title, subtitle }) => (
              <li
                key={subtitle}
                className="group flex items-center gap-3.5 lg:border-l lg:border-neutral-200/70 lg:px-6 lg:first:border-l-0 lg:first:pl-0 lg:last:pr-0 dark:lg:border-white/10"
              >
                <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/70 text-emerald-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_1px_2px_rgba(15,60,45,0.08)] ring-1 ring-emerald-200/70 transition-transform duration-300 motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:scale-105 dark:from-emerald-400/15 dark:to-emerald-500/5 dark:text-emerald-300 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_1px_2px_rgba(0,0,0,0.4)] dark:ring-emerald-400/20">
                  <Icon
                    className="h-5 w-5"
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                </span>

                <div className="min-w-0 leading-tight">
                  <p className="bg-gradient-to-b from-neutral-900 to-neutral-700 bg-clip-text text-[17px] font-semibold tracking-tight text-transparent tabular-nums dark:from-white dark:to-neutral-300">
                    {title}
                  </p>
                  <p className="mt-1 text-[13px] text-neutral-500 dark:text-neutral-400">
                    {subtitle}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
