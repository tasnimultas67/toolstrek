import React from "react";
import SectionInfo from "./SectionInfo";
import {
  Zap,
  CloudOff,
  Clock,
  ShieldCheck,
  CircleDollarSign,
  MonitorSmartphone,
  Check,
  FileText,
  Lock,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Data                                                                      */
/* -------------------------------------------------------------------------- */

const whychoose = [
  {
    title: "Privacy First",
    description:
      "Your data stays yours. Most of our tools process information locally in your browser, meaning your sensitive data never even touches our servers.",
    icon: ShieldCheck,
    span: "lg:col-span-4",
    visual: "privacy",
  },
  {
    title: "Easy to Use",
    description:
      "No complicated setup, no confusion. ToolsTrek is designed for effortless navigation, ensuring anyone can use it without hassle.",
    icon: Zap,
    span: "lg:col-span-2",
    visual: "steps",
  },
  {
    title: "No Installation",
    description:
      "Instant access, no downloads. Our tools run completely online, letting you work from any device without storage or update worries.",
    icon: CloudOff,
    span: "lg:col-span-2",
    visual: "browser",
  },
  {
    title: "Save Time",
    description:
      "Efficiency is key. Our tools streamline your tasks, cutting out unnecessary steps so you can get things done in seconds.",
    icon: Clock,
    span: "lg:col-span-2",
    visual: "progress",
  },
  {
    title: "Always Free",
    description:
      "No subscriptions, no hidden fees, and no 'pro' versions. Access every single tool in our library completely free of charge, forever.",
    icon: CircleDollarSign,
    span: "lg:col-span-2",
    visual: "price",
  },
  {
    title: "Cross-Platform",
    description:
      "Whether you're on a high-end PC, a tablet, or a smartphone, ToolsTrek adapts to your screen size for a seamless experience everywhere.",
    icon: MonitorSmartphone,
    span: "lg:col-span-6",
    visual: "devices",
    wide: true,
  },
];

/* -------------------------------------------------------------------------- */
/*  Section                                                                   */
/* -------------------------------------------------------------------------- */

const WhyChooseUs = () => {
  return (
    <section className="relative isolate overflow-hidden py-16 sm:py-20">
      {/* Soft background glow + faint grid */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-130 w-215 -translate-x-1/2 rounded-full bg-brandColor/10 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(100,116,139,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(100,116,139,0.08)_1px,transparent_1px)] bg-size-[44px_44px] mask-[radial-gradient(ellipse_at_top,black_30%,transparent_75%)]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <SectionInfo
            title="Why ToolsTrek?"
            subtitle="Why Our Tools *Work Best* for You?"
            description="We focus on speed, accessibility, and simplicity so you can focus on your work."
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6">
          {whychoose.map((item) => (
            <WhyChooseUsCard key={item.title} item={item} />
          ))}
        </div>

        <TrustStrip />
      </div>
    </section>
  );
};

export default WhyChooseUs;

/* -------------------------------------------------------------------------- */
/*  Card                                                                      */
/* -------------------------------------------------------------------------- */

const WhyChooseUsCard = ({ item }) => {
  const Icon = item.icon;

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-3xl border border-gray-200/80 bg-white/80 p-7 backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-brandColor/40 hover:shadow-xl hover:shadow-brandColor/15 dark:border-white/10 dark:bg-gray-900/70 sm:p-8 ${
        item.span
      } ${item.wide ? "md:col-span-2" : ""} ${
        item.span === "lg:col-span-4" ? "md:col-span-2" : ""
      }`}
    >
      {/* Hover spotlight */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-brandColor/10 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
      />

      <div
        className={`relative flex h-full gap-8 ${
          item.wide
            ? "flex-col md:flex-row md:items-center md:justify-between"
            : "flex-col"
        }`}
      >
        <div className={item.wide ? "md:max-w-md" : ""}>
          <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brandColor/10 text-brandColor ring-1 ring-inset ring-brandColor/20 transition-transform duration-300 group-hover:scale-105">
            <Icon size={22} strokeWidth={2} />
          </div>

          <h3 className="mb-2 text-xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-2xl">
            {item.title}
          </h3>
          <p className="leading-relaxed text-gray-600 dark:text-gray-400">
            {item.description}
          </p>
        </div>

        <div className={item.wide ? "md:w-[48%]" : "mt-auto"}>
          <Visual type={item.visual} />
        </div>
      </div>
    </article>
  );
};

/* -------------------------------------------------------------------------- */
/*  Mini visuals (pure CSS / SVG, no extra dependencies)                      */
/* -------------------------------------------------------------------------- */

const panel =
  "rounded-2xl border border-gray-200 bg-gray-50/80 dark:border-white/10 dark:bg-white/3";

const Visual = ({ type }) => {
  switch (type) {
    case "privacy":
      return (
        <div className={`${panel} p-4`}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-gray-500 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:ring-white/10">
              <FileText size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                contract.pdf
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Processing on your device
              </p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-brandColor/10 px-2.5 py-1 text-xs font-medium text-brandColor">
              <Lock size={12} /> Private
            </span>
          </div>

          <div className="mt-4 flex items-center justify-between rounded-xl bg-white px-4 py-3 ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-white/10">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Uploaded to a server
            </span>
            <span className="font-mono text-sm font-semibold text-brandColor">
              0 bytes
            </span>
          </div>
        </div>
      );

    case "steps":
      return (
        <ol className={`${panel} space-y-2 p-3`}>
          {["Choose your file", "Make your change", "Download"].map((s, i) => (
            <li
              key={s}
              className="flex items-center gap-3 rounded-xl bg-white px-3 py-2 text-sm text-gray-700 ring-1 ring-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:ring-white/10"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brandColor/15 text-xs font-semibold text-brandColor">
                {i + 1}
              </span>
              {s}
            </li>
          ))}
        </ol>
      );

    case "browser":
      return (
        <div className={`${panel} overflow-hidden`}>
          <div className="flex items-center gap-1.5 border-b border-gray-200 px-3 py-2 dark:border-white/10">
            <span className="h-2 w-2 rounded-full bg-gray-300 dark:bg-gray-600" />
            <span className="h-2 w-2 rounded-full bg-gray-300 dark:bg-gray-600" />
            <span className="h-2 w-2 rounded-full bg-gray-300 dark:bg-gray-600" />
            <span className="ml-2 flex-1 truncate rounded-md bg-white px-2 py-0.5 text-xs text-gray-500 ring-1 ring-gray-200 dark:bg-gray-900 dark:text-gray-400 dark:ring-white/10">
              toolstrek.vercel.app
            </span>
          </div>
          <div className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
            <Check size={16} className="text-brandColor" />
            Ready. Nothing to install.
          </div>
        </div>
      );

    case "progress":
      return (
        <div className={`${panel} p-4`}>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Working…</span>
            <span className="font-medium text-brandColor">Done in seconds</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-white/10">
            <div className="h-full w-full rounded-full bg-linear-to-r from-brandColor to-brandColor/60" />
          </div>
        </div>
      );

    case "price":
      return (
        <div className={`${panel} flex items-end justify-between p-4`}>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Every tool
            </p>
            <p className="text-4xl font-semibold tracking-tight text-gray-900 dark:text-white">
              $0
            </p>
          </div>
          <span className="rounded-full bg-brandColor/10 px-2.5 py-1 text-xs font-medium text-brandColor">
            No sign-up
          </span>
        </div>
      );

    case "devices":
      return (
        <div className={`${panel} p-4`}>
          <div className="flex flex-wrap gap-2">
            {["Windows", "macOS", "Linux", "Android", "iOS", "Tablet"].map(
              (d) => (
                <span
                  key={d}
                  className="rounded-full bg-white px-3 py-1.5 text-sm text-gray-700 ring-1 ring-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:ring-white/10"
                >
                  {d}
                </span>
              ),
            )}
          </div>
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            Same tools, same experience, any screen size.
          </p>
        </div>
      );

    default:
      return null;
  }
};

/* -------------------------------------------------------------------------- */
/*  Trust strip                                                               */
/* -------------------------------------------------------------------------- */

const TrustStrip = () => (
  <ul className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-3 text-sm text-gray-600 dark:text-gray-400 sm:grid-cols-3">
    {["No sign-up required", "No watermarks", "Works in your browser"].map(
      (t) => (
        <li key={t} className="flex items-center justify-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brandColor/15 text-brandColor">
            <Check size={12} strokeWidth={3} />
          </span>
          {t}
        </li>
      ),
    )}
  </ul>
);
