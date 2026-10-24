import React from "react";
import Link from "next/link";
import SectionInfo from "./SectionInfo";
import {
  ArrowRight,
  Bug,
  Check,
  FileText,
  GitPullRequest,
  Github,
  Lightbulb,
  Lock,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Content (based on ToolsTrek: PDF, image, QR, calculators, in-browser)     */
/* -------------------------------------------------------------------------- */

const features = [
  {
    id: "pdf",
    title: "Merge, split, convert and compress your PDFs",
    description:
      "Drop in a file, pick the job and download the result. No account to create and nothing to install, so you can get a PDF sorted in a few clicks.",
    bullets: [
      "Merge several PDFs into one file",
      "Split, compress and convert PDFs",
      "No sign-up and no watermark",
      "Works on desktop and mobile",
    ],
    cta: { label: "Browse PDF tools", href: "/tools?category=pdf" },
    caption:
      "PDF tools run right in your browser, with no software to install.",
    visual: "pdf",
  },
  {
    id: "privacy",
    title: "Your files stay on your device",
    description:
      "Most ToolsTrek tools run entirely in your browser, so the files and text you work with never have to be sent to a server.",
    bullets: [
      "Processing happens locally in your browser",
      "No account, so nothing is tied to you",
      "Safe for contracts, photos and private notes",
      "Fast, because nothing needs to upload",
    ],
    cta: { label: "See all tools", href: "/tools" },
    caption: "Local processing means your data does not leave your device.",
    visual: "privacy",
  },
  {
    id: "opensource",
    title: "Open source and built with the community",
    description:
      "ToolsTrek is open source, so you can see exactly how it works. Report a bug, suggest an idea or send a pull request and help shape what comes next.",
    bullets: [
      "Fully open code on GitHub",
      "Ideas and bug reports are welcome",
      "Shaped by real user feedback",
      "Free to use, now and later",
    ],
    cta: {
      label: "Star on GitHub",
      href: "https://github.com/tasnimultas67/toolstrek",
      external: true,
    },
    caption: "Every change is made in the open, and anyone can contribute.",
    visual: "opensource",
  },
];

/* -------------------------------------------------------------------------- */
/*  Section                                                                   */
/* -------------------------------------------------------------------------- */

const ToolboxShowcase = () => {
  return (
    <section className="relative isolate overflow-hidden py-16 sm:py-20">
      {/* Soft background glows */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-40 top-10 h-105 w-105 rounded-full bg-brandColor/10 blur-3xl" />
        <div className="absolute -right-32 bottom-10 h-105 w-105 rounded-full bg-brandColor/10 blur-3xl" />
      </div>

      <div className="mx-auto w-full md:w-11/12 px-2 sm:px-4 lg:px-5">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <SectionInfo
            title="Everything in one place"
            subtitle="One free toolbox for *everyday* jobs"
            description="PDFs, images, QR codes, calculators and text tools, all without installing anything."
          />
        </div>

        <div className="space-y-20 sm:space-y-28">
          {features.map((f, i) => (
            <FeatureRow key={f.id} feature={f} reverse={i % 2 === 1} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ToolboxShowcase;

/* -------------------------------------------------------------------------- */
/*  Row                                                                       */
/* -------------------------------------------------------------------------- */

const FeatureRow = ({ feature, reverse }) => {
  return (
    <div
      className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-16 ${
        reverse ? "lg:[&>*:first-child]:order-2" : ""
      }`}
    >
      {/* Visual card */}
      <figure className="rounded-[2rem] border border-gray-200/80 bg-white p-3 shadow-xl shadow-black/5 dark:border-white/10 dark:bg-gray-900 dark:shadow-black/30">
        <div className="relative overflow-hidden rounded-3xl bg-brandColor/10 px-4 py-10 sm:px-8 sm:py-12">
          {/* Dotted pattern */}
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(circle,currentColor_1px,transparent_1px)] bg-size-[14px_14px] text-brandColor/30"
          />
          <div className="relative">
            <Visual type={feature.visual} />
          </div>
        </div>
        <figcaption className="px-3 pb-2 pt-3 text-center text-xs text-gray-500 dark:text-gray-400">
          {feature.caption}
        </figcaption>
      </figure>

      {/* Text */}
      <div>
        <h3 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
          {feature.title}
        </h3>
        <p className="mt-4 max-w-xl leading-relaxed text-gray-600 dark:text-gray-400">
          {feature.description}
        </p>

        <ul className="mt-6 space-y-3">
          {feature.bullets.map((b) => (
            <li
              key={b}
              className="flex items-center gap-3 text-sm text-gray-800 dark:text-gray-200"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brandColor/15 text-brandColor">
                <Check size={12} strokeWidth={3} />
              </span>
              {b}
            </li>
          ))}
        </ul>

        <Link
          href={feature.cta.href}
          {...(feature.cta.external
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
          className="group mt-8 inline-flex items-center gap-2 rounded-full bg-brandColor px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brandColor/25 transition-all duration-200 hover:bg-brandColorHover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brandColor"
        >
          {feature.cta.external && <Github size={16} />}
          {feature.cta.label}
          <ArrowRight
            size={16}
            className="transition-transform duration-200 group-hover:translate-x-0.5"
          />
        </Link>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*  Shared mockup pieces                                                      */
/* -------------------------------------------------------------------------- */

const Window = ({ title, badge, children }) => (
  <div className="relative">
    {badge && (
      <span className="absolute -top-5 right-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-brandColor px-3.5 py-1.5 text-xs font-semibold text-white shadow-lg shadow-brandColor/30 sm:right-6">
        <Check size={12} strokeWidth={3} />
        {badge}
      </span>
    )}
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl shadow-black/10 dark:border-white/10 dark:bg-gray-900">
      <div className="flex items-center gap-1.5 border-b border-gray-100 px-4 py-3 dark:border-white/10">
        <span className="h-2 w-2 rounded-full bg-gray-300 dark:bg-gray-600" />
        <span className="h-2 w-2 rounded-full bg-gray-300 dark:bg-gray-600" />
        <span className="h-2 w-2 rounded-full bg-gray-300 dark:bg-gray-600" />
        <span className="ml-2 truncate text-xs font-medium text-gray-600 dark:text-gray-300">
          {title}
        </span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  </div>
);

const Chips = ({ items, active = 0 }) => (
  <div className="mb-3 flex flex-wrap gap-1.5">
    {items.map((c, i) => (
      <span
        key={c}
        className={`rounded-full px-3 py-1 text-xs font-medium ${
          i === active
            ? "bg-brandColor text-white"
            : "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300"
        }`}
      >
        {c}
      </span>
    ))}
  </div>
);

const Bar = ({ w = "100%" }) => (
  <div
    className="h-2 rounded-full bg-gray-200 dark:bg-white/10"
    style={{ width: w }}
  />
);

const Field = ({ label, value }) => (
  <div>
    <p className="text-[11px] text-gray-500 dark:text-gray-400">{label}</p>
    <p className="text-sm font-semibold text-gray-900 dark:text-white">
      {value}
    </p>
  </div>
);

/* -------------------------------------------------------------------------- */
/*  Visuals                                                                   */
/* -------------------------------------------------------------------------- */

const Visual = ({ type }) => {
  if (type === "pdf") return <PdfVisual />;
  if (type === "privacy") return <PrivacyVisual />;
  if (type === "opensource") return <OpenSourceVisual />;
  return null;
};

const PdfVisual = () => (
  <Window title="merge-pdf" badge="No watermark">
    <Chips items={["Merge", "Split", "Compress", "Convert"]} />
    <div className="grid grid-cols-[1fr_auto] gap-3">
      <div className="space-y-2 rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-white/10 dark:bg-white/5">
        {["report.pdf", "invoice.pdf", "notes.pdf"].map((f, i) => (
          <div
            key={f}
            className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs ${
              i === 1
                ? "border border-brandColor bg-brandColor/10 font-semibold text-brandColor"
                : "bg-white text-gray-700 dark:bg-gray-900 dark:text-gray-300"
            }`}
          >
            <FileText size={14} />
            {f}
          </div>
        ))}
        <Bar w="70%" />
      </div>
      <div className="w-24 space-y-3 rounded-xl border border-gray-200 p-3 dark:border-white/10 sm:w-28">
        <Field label="Output" value="merged.pdf" />
        <Field label="Order" value="Custom" />
        <Field label="Format" value="PDF" />
      </div>
    </div>
  </Window>
);

const PrivacyVisual = () => (
  <Window title="contract.pdf" badge="Private">
    <div className="mb-4 flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brandColor/10 text-brandColor">
        <Lock size={18} />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-900 dark:text-white">
          Processing in your browser
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          The file never leaves this device
        </p>
      </div>
    </div>
    <div className="space-y-2">
      <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 text-sm dark:bg-white/5">
        <span className="text-gray-600 dark:text-gray-400">
          Uploaded to a server
        </span>
        <span className="font-mono font-semibold text-brandColor">0 bytes</span>
      </div>
      <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 text-sm dark:bg-white/5">
        <span className="text-gray-600 dark:text-gray-400">Account needed</span>
        <span className="font-semibold text-gray-900 dark:text-white">No</span>
      </div>
    </div>
  </Window>
);

const OpenSourceVisual = () => (
  <Window title="github.com/tasnimultas67/toolstrek" badge="Open source">
    <div className="mb-4 flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brandColor/10 text-brandColor">
        <Github size={18} />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-900 dark:text-white">
          toolstrek
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Public repository
        </p>
      </div>
    </div>

    <Chips items={["Code", "Issues", "Pull requests"]} />

    <ul className="space-y-2">
      {[
        { label: "Report a bug", Icon: Bug },
        { label: "Suggest a new idea", Icon: Lightbulb },
        { label: "Open a pull request", Icon: GitPullRequest },
      ].map(({ label, Icon }, i) => (
        <li
          key={label}
          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm ${
            i === 2
              ? "border border-brandColor bg-brandColor/10 font-semibold text-brandColor"
              : "bg-gray-50 text-gray-700 dark:bg-white/5 dark:text-gray-300"
          }`}
        >
          <Icon size={15} />
          {label}
        </li>
      ))}
    </ul>
  </Window>
);
