import Link from "next/link";
import * as motion from "motion/react-client";
import {
  ArrowRight,
  Check,
  CircleDollarSign,
  Code2,
  Github,
  Globe,
  Lock,
  Users,
  Zap,
} from "lucide-react";
import CTA from "../tools-compo/Home-Compo/CTA";
import SectionInfo from "../tools-compo/SectionInfo";

export const metadata = {
  title: "About Us",
  keywords: [
    "about",
    "tools",
    "tools trek",
    "open source",
    "web tools",
    "developer tools",
    "productivity tools",
  ],
  description:
    "ToolsTrek is an open-source collection of productivity tools built for developers and professionals. Explore our mission, values, and community-driven development.",
};

/* -------------------------------------------------------------------------- */
/*  Data                                                                      */
/* -------------------------------------------------------------------------- */

const GITHUB_URL = "https://github.com/tasnimultas67/toolstrek";

const values = [
  {
    id: 1,
    title: "Privacy First",
    description:
      "All processing happens locally in your browser. We never store, track, or share your data. Your privacy is our priority.",
    Icon: Lock,
  },
  {
    id: 2,
    title: "Performance Optimized",
    description:
      "Built with Next.js and modern web standards, ToolsTrek delivers lightning-fast performance with seamless dark mode support.",
    Icon: Zap,
  },
  {
    id: 3,
    title: "Community Driven",
    description:
      "Open-source and welcoming contributions. Every tool is shaped by user feedback and community collaboration.",
    Icon: Users,
  },
  {
    id: 4,
    title: "Open Source",
    description:
      "Transparent by nature. Our codebase is completely open for inspection, modification, and community contributions on GitHub.",
    Icon: Code2,
  },
  {
    id: 5,
    title: "Free Forever",
    description:
      "No paywalls, no hidden premium tiers, and no subscriptions. Enjoy full, unrestricted access to all our tools without spending a dime.",
    Icon: CircleDollarSign,
  },
  {
    id: 6,
    title: "Accessible Everywhere",
    description:
      "Designed to work smoothly across all devices. Access your favorite web tools on mobile, tablet, or desktop with full responsiveness.",
    Icon: Globe,
  },
];

const techStack = [
  "Next.js",
  "React",
  "JavaScript",
  "Tailwind CSS",
  "Motion",
  "Open Source",
];

const principles = [
  "Free, with no sign-up",
  "Runs in your browser",
  "Open source on GitHub",
  "Built for any device",
];

/* -------------------------------------------------------------------------- */
/*  Shared pieces                                                             */
/* -------------------------------------------------------------------------- */

// One orchestrated entrance for the hero only
const Reveal = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay }}
  >
    {children}
  </motion.div>
);

const Pill = ({ children }) => (
  <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/70 px-3.5 py-1.5 text-sm text-gray-700 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-gray-300">
    <span className="h-1.5 w-1.5 rounded-full bg-brandColor" />
    {children}
  </span>
);

const GlowBackground = () => (
  <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
    <div className="absolute left-1/2 top-0 h-130 w-215 -translate-x-1/2 rounded-full bg-brandColor/10 blur-3xl" />
    <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(100,116,139,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(100,116,139,0.08)_1px,transparent_1px)] bg-size-[44px_44px] mask-[radial-gradient(ellipse_at_top,black_30%,transparent_75%)]" />
  </div>
);

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

const Page = () => {
  return (
    <div className="overflow-hidden pb-10">
      {/* ------------------------------ Hero ------------------------------ */}
      <section className="relative isolate pb-20 pt-32 sm:pb-24 sm:pt-40">
        <GlowBackground />

        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <Reveal>
            <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight text-gray-900 dark:text-white md:text-6xl">
              Empowering Developers,
              <br />
              <span
                className="bg-linear-to-r from-brandColor via-brandColor/60 to-brandColor bg-size-[200%_auto] animate-gradient-x bg-clip-text font-playfairDisplay text-transparent"
                style={{ fontStyle: "italic" }}
              >
                One Tool at a Time.
              </span>
            </h1>
          </Reveal>

          <Reveal delay={0.15}>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-gray-600 dark:text-gray-400 md:text-lg">
              ToolsTrek is a curated collection of open-source utilities
              designed to simplify daily workflows for developers, designers,
              and digital professionals worldwide.
            </p>
          </Reveal>

          <Reveal delay={0.3}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/tools"
                className="group inline-flex items-center gap-2 rounded-full bg-brandColor px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brandColor/25 transition-all duration-200 hover:bg-brandColorHover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brandColor"
              >
                Browse all tools
                <ArrowRight
                  size={16}
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </Link>
              <Link
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/70 px-6 py-3 text-sm font-semibold text-gray-900 backdrop-blur transition-colors duration-200 hover:border-brandColor/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brandColor dark:border-white/10 dark:bg-white/5 dark:text-white"
              >
                <Github size={16} />
                Star on GitHub
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              <Pill>100+ free tools</Pill>
              <Pill>No sign-up</Pill>
              <Pill>Runs in your browser</Pill>
            </div>
          </Reveal>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ----------------------------- Mission ---------------------------- */}
        <section className="relative overflow-hidden rounded-[2rem] border border-gray-200/80 bg-white/80 p-3 shadow-xl shadow-black/5 backdrop-blur dark:border-white/10 dark:bg-gray-900/70 dark:shadow-black/30">
          <div className="grid items-center gap-10 rounded-3xl p-5 sm:p-8 lg:grid-cols-2 lg:gap-14 lg:p-12">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white md:text-3xl">
                Built for the Community, Powered by Open Source
              </h2>

              <div className="mt-5 space-y-4 text-sm leading-relaxed text-gray-600 dark:text-gray-400 md:text-base">
                <p>
                  <strong className="font-semibold text-gray-900 dark:text-white">
                    ToolsTrek
                  </strong>{" "}
                  is an open-source project dedicated to providing free,
                  accessible, and high-quality digital tools. Our goal is to
                  eliminate friction in everyday tasks by offering lightweight,
                  privacy-focused utilities that work entirely in your browser.
                </p>
                <p>
                  Whether you&apos;re a developer needing quick conversions, a
                  designer formatting text, or a professional streamlining
                  workflows, ToolsTrek is here to help. We believe great tools
                  should be free, fast, and available to everyone.
                </p>
              </div>

              <Link
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-8 inline-flex items-center gap-2 rounded-full bg-brandColor px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brandColor/25 transition-all duration-200 hover:bg-brandColorHover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brandColor"
              >
                <Github size={16} />
                Star on GitHub
                <ArrowRight
                  size={16}
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </Link>
            </div>

            {/* Visual: principles window */}
            <div className="relative overflow-hidden rounded-3xl bg-brandColor/10 px-4 py-10 sm:px-8 sm:py-12">
              <div
                aria-hidden
                className="absolute inset-0 bg-[radial-gradient(circle,currentColor_1px,transparent_1px)] bg-size-[14px_14px] text-brandColor/30"
              />
              <div className="relative">
                <span className="absolute -top-5 right-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-brandColor px-3.5 py-1.5 text-xs font-semibold text-white shadow-lg shadow-brandColor/30 sm:right-6">
                  <Check size={12} strokeWidth={3} />
                  Open source
                </span>

                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl shadow-black/10 dark:border-white/10 dark:bg-gray-900">
                  <div className="flex items-center gap-1.5 border-b border-gray-100 px-4 py-3 dark:border-white/10">
                    <span className="h-2 w-2 rounded-full bg-gray-300 dark:bg-gray-600" />
                    <span className="h-2 w-2 rounded-full bg-gray-300 dark:bg-gray-600" />
                    <span className="h-2 w-2 rounded-full bg-gray-300 dark:bg-gray-600" />
                    <span className="ml-2 text-xs font-medium text-gray-600 dark:text-gray-300">
                      toolstrek
                    </span>
                  </div>
                  <ul className="space-y-2 p-4">
                    {principles.map((p) => (
                      <li
                        key={p}
                        className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-800 dark:bg-white/5 dark:text-gray-200"
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brandColor/15 text-brandColor">
                          <Check size={12} strokeWidth={3} />
                        </span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ----------------------------- Values ----------------------------- */}
        <section className="pb-6 pt-24 sm:pt-28">
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <SectionInfo
              subtitle="Our Core *Values*"
              description="Principles that guide our development and community engagement."
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {values.map(({ id, title, description, Icon }) => (
              <article
                key={id}
                className="group relative flex flex-col overflow-hidden rounded-3xl border border-gray-200/80 bg-white/80 p-7 backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-brandColor/40 hover:shadow-xl hover:shadow-brandColor/15 dark:border-white/10 dark:bg-gray-900/70 sm:p-8"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-brandColor/10 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
                />
                <div className="relative">
                  <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brandColor/10 text-brandColor ring-1 ring-inset ring-brandColor/20 transition-transform duration-300 group-hover:scale-105">
                    <Icon size={22} strokeWidth={2} />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
                    {title}
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    {description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ---------------------------- Tech stack --------------------------- */}
        <section className="mb-10 mt-20 rounded-[2rem] border border-gray-200/80 bg-white/80 px-6 py-14 text-center backdrop-blur dark:border-white/10 dark:bg-gray-900/70 md:px-12">
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white md:text-3xl">
            Built With Modern Technology
          </h2>
          <p className="mx-auto mb-8 mt-3 max-w-2xl text-gray-600 dark:text-gray-400">
            ToolsTrek leverages cutting-edge web technologies to deliver a
            seamless user experience.
          </p>

          <ul className="flex flex-wrap justify-center gap-3">
            {techStack.map((name) => (
              <li
                key={name}
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-5 py-2.5 text-sm font-medium text-gray-800 transition-colors duration-200 hover:border-brandColor/40 hover:text-brandColor dark:border-white/10 dark:bg-white/5 dark:text-gray-200"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-brandColor" />
                {name}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* ---------------------------- Call to action ---------------------------- */}
      <CTA />
    </div>
  );
};

export default Page;
