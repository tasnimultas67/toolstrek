import Link from "next/link";
import * as motion from "motion/react-client";
import CTA from "../tools-compo/Home-Compo/CTA";
import SectionInfo from "../tools-compo/SectionInfo";

export const metadata = {
  title: "About Us — ToolsTrek",
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

// Reusable Animation Wrappers
const FadeIn = ({ children, delay = 0, x = 0, y = 20 }) => (
  <motion.div
    initial={{ opacity: 0, x, y }}
    whileInView={{ opacity: 1, x: 0, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.6, delay }}
  >
    {children}
  </motion.div>
);

// Reusable Value Card Component
const ValueCard = ({ icon, title, description, delay = 0 }) => (
  <FadeIn x={-20} y={0} delay={delay}>
    <div className="p-8 bg-white dark:bg-slate-900 rounded-xl border border-border hover:border-brandColor/50 transition-colors h-full">
      <div className="w-12 h-12 bg-brandColor/10 rounded-lg flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">
        {description}
      </p>
    </div>
  </FadeIn>
);

// Reusable Tech Stack Item Component
const TechItem = ({ name, icon, delay = 0 }) => (
  <FadeIn delay={delay}>
    <div className="px-6 py-3 bg-gray-100 dark:bg-slate-900 rounded-lg border border-border/50 flex items-center gap-2">
      <span className="text-xl">{icon}</span>
      <span className="font-medium">{name}</span>
    </div>
  </FadeIn>
);

const Page = () => {
  // Values data array
  const values = [
    {
      id: 1,
      title: "Privacy First",
      description:
        "All processing happens locally in your browser. We never store, track, or share your data. Your privacy is our priority.",
      icon: (
        <svg
          className="w-6 h-6 text-brandColor"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      ),
    },
    {
      id: 2,
      title: "Performance Optimized",
      description:
        "Built with Next.js and modern web standards, ToolsTrek delivers lightning-fast performance with seamless dark mode support.",
      icon: (
        <svg
          className="w-6 h-6 text-brandColor"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
    },
    {
      id: 3,
      title: "Community Driven",
      description:
        "Open-source and welcoming contributions. Every tool is shaped by user feedback and community collaboration.",
      icon: (
        <svg
          className="w-6 h-6 text-brandColor"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
    },
    {
      id: 4,
      title: "Open Source",
      description:
        "Transparent by nature. Our codebase is completely open for inspection, modification, and community contributions on GitHub.",
      icon: (
        <svg
          className="w-6 h-6 text-brandColor"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
          />
        </svg>
      ),
    },
    {
      id: 5,
      title: "Free Forever",
      description:
        "No paywalls, no hidden premium tiers, and no subscriptions. Enjoy full, unrestricted access to all our tools without spending a dime.",
      icon: (
        <svg
          className="w-6 h-6 text-brandColor"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      id: 6,
      title: "Accessible Everywhere",
      description:
        "Designed to work smoothly across all devices. Access your favorite web tools on mobile, tablet, or desktop with full responsiveness.",
      icon: (
        <svg
          className="w-6 h-6 text-brandColor"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9h18"
          />
        </svg>
      ),
    },
  ];

  // Tech stack data array
  const techStack = [
    { name: "Next.js", icon: "▲" },
    { name: "React", icon: "⚛️" },
    { name: "JavaScript", icon: "📘" },
    { name: "Tailwind CSS", icon: "🎨" },
    { name: "Motion", icon: "🎬" },
    { name: "Open Source", icon: "🔓" },
  ];

  return (
    <div className="overflow-hidden pb-10 pt-16">
      <div className="w-11/12 mx-auto">
        {/* --- Hero Section --- */}
        <section className="py-16 md:py-24">
          <div className=" items-center">
            <div className="space-y-6 text-center">
              <FadeIn>
                <h1 className="text-3xl md:text-6xl font-semibold leading-tight tracking-tight">
                  Empowering Developers, <br />
                  <span
                    className={`bg-linear-to-r from-brandColor via-emerald-600 to-brandColor bg-size-[200%_auto] animate-gradient-x bg-clip-text text-transparent font-playfairDisplay`}
                    style={{ fontStyle: "italic" }}
                  >
                    One Tool at a Time.
                  </span>
                </h1>
              </FadeIn>
              <FadeIn delay={0.2}>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed w-full lg:w-8/12 mx-auto">
                  ToolsTrek is a curated collection of open-source utilities
                  designed to simplify daily workflows for developers,
                  designers, and digital professionals worldwide.
                </p>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* --- Mission Section --- */}
        <section className="py-16 bg-white dark:bg-slate-900 rounded-3xl px-6 md:px-12 border border-border/50">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-5">
              <FadeIn delay={0.1}>
                <h2 className="text-2xl md:text-3xl font-semibold">
                  Built for the Community, Powered by Open Source
                </h2>
              </FadeIn>
              <div className="space-y-4 text-muted-foreground text-sm md:text-base leading-relaxed">
                <FadeIn delay={0.2}>
                  <p>
                    <strong>ToolsTrek</strong> is an open-source project
                    dedicated to providing free, accessible, and high-quality
                    digital tools. Our goal is to eliminate friction in everyday
                    tasks by offering lightweight, privacy-focused utilities
                    that work entirely in your browser.
                  </p>
                </FadeIn>
                <FadeIn delay={0.3}>
                  <p>
                    Whether you&apos;re a developer needing quick conversions, a
                    designer formatting text, or a professional streamlining
                    workflows — ToolsTrek is here to help. We believe great
                    tools should be free, fast, and available to everyone.
                  </p>
                </FadeIn>
              </div>
              <FadeIn delay={0.4}>
                <Link
                  href="https://github.com/Tasnimul-Haque/ToolsTrek"
                  target="_blank"
                  className="inline-block mt-4 px-6 py-3 bg-brandColor text-white font-medium rounded-lg hover:scale-105 transition-transform duration-300"
                >
                  ⭐ Star on GitHub
                </Link>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* --- Values Section --- */}
        <section className="pt-20 pb-10">
          <div className="text-center mb-12">
            <SectionInfo
              subtitle="Our Core *Values*"
              description="Principles that guide our development and community engagement."
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {values.map((value, index) => (
              <ValueCard
                key={value.id}
                icon={value.icon}
                title={value.title}
                description={value.description}
                delay={index * 0.1}
              />
            ))}
          </div>
        </section>

        {/* --- Tech Stack Section --- */}
        <section className="py-12 bg-white dark:bg-slate-950 rounded-3xl px-6 md:px-12 border border-border/50 mb-10">
          <div className="text-center">
            <FadeIn>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Built With Modern Technology
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
                ToolsTrek leverages cutting-edge web technologies to deliver a
                seamless user experience
              </p>
            </FadeIn>
            <div className="flex flex-wrap justify-center gap-6">
              {techStack.map((tech, index) => (
                <TechItem
                  key={tech.name}
                  name={tech.name}
                  icon={tech.icon}
                  delay={index * 0.05}
                />
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* --- Call to Action --- */}
      <CTA />
    </div>
  );
};

export default Page;
