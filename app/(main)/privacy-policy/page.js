import React from "react";
import * as motion from "motion/react-client";

export const metadata = {
  title: "Privacy Policy",
  keywords: [
    "privacy policy",
    "GDPR compliant",
    "no upload",
    "client-side processing",
  ],
  description:
    "At ToolsTrek, your privacy is our top priority. Our tools are designed to protect your data by processing everything locally in your browser.",
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut",
    },
  },
};

// Shared glass surface used by cards
const glassCard =
  "rounded-2xl border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] backdrop-blur-xl shadow-[0_1px_2px_rgba(0,0,0,0.04)]";

const Check = () => (
  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-brandColor/10 text-brandColor ring-1 ring-inset ring-brandColor/20">
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-3"
    >
      <path d="M5 12l5 5L20 7" />
    </svg>
  </span>
);

const features = [
  {
    title: "No Server Uploads",
    desc: "Your files are never uploaded to any server. All processing happens locally in your browser.",
    icon: "M12 2v20m-5-5l5 5 5-5",
  },
  {
    title: "Local Processing",
    desc: "Operations are performed using JavaScript directly on your device.",
    icon: "M9 12l2 2 4-4",
  },
  {
    title: "Automatic Cleanup",
    desc: "All file data is cleared when you close the browser tab or navigate away.",
    icon: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
  },
  {
    title: "No Tracking",
    desc: "We don't track your file contents. Your documents remain private at all times.",
    icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
  },
];

const sections = [
  {
    title: "1. Introduction",
    content: (
      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
        <strong className="text-gray-900 dark:text-white">ToolsTrek</strong>{" "}
        (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to
        protecting your privacy. This Privacy Policy explains how we handle your
        information when you use our digital utilities.
      </p>
    ),
  },
  {
    title: "2. How Our Service Works",
    content: (
      <ul className="space-y-3 text-gray-600 dark:text-gray-400">
        {[
          "All processing happens directly in your web browser.",
          "Your files are never uploaded to our servers or any third-party servers.",
          "We cannot see, access, or store your documents.",
          "Your files remain on your device at all times.",
        ].map((item) => (
          <li key={item} className="flex items-start gap-3 leading-relaxed">
            <Check />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    ),
  },
  {
    title: "3. Information We Collect",
    content: (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-gray-200/80 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] p-5">
          <h3 className="mb-2 text-sm font-bold text-gray-900 dark:text-white">
            3.1 Your Files
          </h3>
          <p className="inline-flex items-center gap-2 rounded-full bg-brandColor/10 px-3 py-1 text-sm font-semibold text-brandColor ring-1 ring-inset ring-brandColor/20">
            We do not collect your files.
          </p>
        </div>
        <div className="rounded-xl border border-gray-200/80 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] p-5">
          <h3 className="mb-2 text-sm font-bold text-gray-900 dark:text-white">
            3.2 Usage Data
          </h3>
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            We may collect anonymous usage statistics to improve our service,
            such as which tools are most popular, browser type, and device type.
            This data is aggregated and anonymized.
          </p>
        </div>
      </div>
    ),
  },
  {
    title: "4. Cookies & Local Storage",
    content: (
      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
        We use minimal cookies for essential functionality, such as remembering
        your language preference or dark mode settings. We do not use tracking
        or advertising cookies.
      </p>
    ),
  },
  {
    title: "5. Third-Party Services",
    content: (
      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
        ToolsTrek does not share your data with third parties. We do not use
        third-party analytics that track individual users, advertising networks,
        or social media tracking pixels.
      </p>
    ),
  },
  {
    title: "6. Your Rights",
    content: (
      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
        Since we do not collect personal data, there is no personal data to
        access, correct, or delete. You can clear your browser&apos;s local
        storage at any time to remove any preferences stored by ToolsTrek.
      </p>
    ),
  },
  {
    title: "7. Contact Us",
    content: (
      <div className="relative overflow-hidden rounded-xl border border-brandColor/20 bg-brandColor/[0.04] p-6">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 -top-10 size-36 rounded-full bg-brandColor/10 blur-2xl"
        />
        <div className="relative">
          <p className="mb-2 font-medium text-gray-900 dark:text-white">
            Questions about this Privacy Policy?
          </p>
          <p className="mb-5 text-gray-600 dark:text-gray-400">
            📧 <strong>contact.toolstrek@gmail.com</strong>
          </p>
          <a
            href="/contact-us"
            className="group relative inline-flex items-center gap-2 rounded-full bg-brandColor px-5 py-2.5 text-sm font-medium text-white border border-brandColor ring-1 ring-inset ring-white/25 shadow-[0_8px_24px_-8px] shadow-brandColor/60 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-8px] hover:shadow-brandColor/70 active:scale-[0.97] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandColor/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-950"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent"
            />
            Contact Us Page
            <span
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:translate-x-0.5"
            >
              →
            </span>
          </a>
        </div>
      </div>
    ),
  },
];

const PrivacyPolicy = () => {
  return (
    <div className="relative isolate overflow-hidden bg-gray-50 dark:bg-gray-950 min-h-screen text-gray-900 dark:text-white transition-colors duration-300">
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

      <motion.div
        className="max-w-5xl mx-auto px-4 pb-16 pt-24 md:pt-28"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-10 text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] backdrop-blur-md px-4 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-brandColor/60" />
              <span className="relative inline-flex size-2 rounded-full bg-brandColor" />
            </span>
            Last updated:{" "}
            {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
            })}
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 dark:text-white md:text-5xl">
            Privacy Policy
          </h1>
          <p className="mx-auto max-w-2xl leading-relaxed text-gray-600 dark:text-gray-400 md:text-lg">
            Your privacy is our top priority. <strong>ToolsTrek</strong> is
            designed from the ground up to protect your data. All file
            processing happens locally in your browser.
          </p>
        </motion.div>

        {/* Feature cards */}
        <motion.div
          variants={itemVariants}
          className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {features.map((feature) => (
            <div
              key={feature.title}
              className={`${glassCard} group p-5 transition-all duration-300 hover:-translate-y-1 hover:border-brandColor/40 hover:shadow-[0_12px_28px_-12px] hover:shadow-brandColor/40`}
            >
              <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-brandColor/10 text-brandColor ring-1 ring-inset ring-brandColor/20 transition-colors duration-300 group-hover:bg-brandColor group-hover:text-white">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-5"
                >
                  <path d={feature.icon} />
                </svg>
              </div>
              <h3 className="mb-1.5 font-semibold text-gray-900 dark:text-white">
                {feature.title}
              </h3>
              <p className="text-sm leading-snug text-gray-600 dark:text-gray-400">
                {feature.desc}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Policy sections */}
        <div className="space-y-5">
          {sections.map((section, index) => {
            const number = section.title.match(/^\d+/)?.[0];
            const title = section.title.replace(/^\d+\.\s*/, "");
            return (
              <motion.section
                key={index}
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                className={`${glassCard} p-5 md:p-8`}
              >
                <div className="mb-5 flex items-center gap-4 border-b border-gray-100 dark:border-white/10 pb-4">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brandColor text-sm font-semibold text-white ring-1 ring-inset ring-white/25 shadow-[0_6px_16px_-6px] shadow-brandColor/60">
                    {number}
                  </span>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white md:text-2xl">
                    {title}
                  </h2>
                </div>
                {section.content}
              </motion.section>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default PrivacyPolicy;
