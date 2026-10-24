import * as motion from "motion/react-client";
import React from "react";
import Link from "next/link";
import { ArrowRight, Check, FileText, Image, QrCode } from "lucide-react";

const RINGS = [320, 270, 220, 170, 120, 70];

const highlights = ["No sign-up", "Free forever", "Runs in your browser"];

const floatingTools = [
  {
    label: "QR Code",
    Icon: QrCode,
    className: "right-[34%] top-[16%]",
  },
  {
    label: "PDF",
    Icon: FileText,
    className: "right-[10%] top-[44%]",
  },
  {
    label: "Image",
    Icon: Image,
    className: "right-[38%] bottom-[14%]",
  },
];

const CTA = () => {
  return (
    <section className="relative px-4 py-16 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-white/10 bg-linear-to-br from-gray-950 via-gray-900 to-brandColorHover px-6 py-14 text-white shadow-2xl shadow-brandColor/20 sm:px-10 md:py-20 lg:px-16"
      >
        {/* Dotted texture */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.12)_1px,transparent_1px)] bg-size-[18px_18px] mask-[radial-gradient(ellipse_at_right,black_10%,transparent_70%)]"
        />

        {/* Brand glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brandColor/30 blur-3xl"
        />

        {/* Concentric rings */}
        <svg
          aria-hidden
          viewBox="0 0 700 700"
          fill="none"
          className="pointer-events-none absolute -bottom-72 -right-72 h-175 w-175 md:-bottom-60 md:-right-52"
        >
          {RINGS.map((r, i) => (
            <circle
              key={r}
              cx="350"
              cy="350"
              r={r}
              stroke="white"
              strokeOpacity={0.1 + (RINGS.length - i) * 0.02}
              strokeWidth="1.5"
            />
          ))}
          <circle cx="350" cy="350" r="6" fill="white" fillOpacity="0.6" />
        </svg>

        {/* Floating tool chips (desktop only) */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 hidden lg:block"
        >
          {floatingTools.map(({ label, Icon, className }) => (
            <div
              key={label}
              className={`absolute ${className} inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-black/20 backdrop-blur-md`}
            >
              <Icon size={16} />
              {label}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="relative max-w-2xl text-center md:text-left">
          <h2 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl md:text-5xl">
            Your digital toolbox for productivity and efficiency
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-white/75 sm:text-base md:mx-0">
            Discover precision-crafted tools designed to simplify your workflow.
            From QR code generation to smart utilities, ToolsTrek offers fast,
            free solutions that make everyday tasks easier.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row md:justify-start">
            <Link
              href="/tools"
              className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-gray-900 shadow-lg shadow-black/20 transition-all duration-200 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Browse all tools
              <ArrowRight
                size={16}
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </Link>
          </div>

          <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-white/80 md:justify-start">
            {highlights.map((h) => (
              <li key={h} className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/15">
                  <Check size={12} strokeWidth={3} />
                </span>
                {h}
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    </section>
  );
};

export default CTA;
