import Image from "next/image";
import Link from "next/link";
import * as motion from "motion/react-client";
import CTA from "../tools-compo/Home-Compo/CTA";

export const metadata = {
  title: "About Us — ToolsTrek",
  keywords: [
    "about",
    "tools",
    "tools trek",
    "Tasnimul Haque",
    "web development",
  ],
  description:
    "Discover the story behind ToolsTrek, a platform created by Md. Tasnimul Haque, a passionate web developer and branding expert.",
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

const Page = () => {
  return (
    <div className="overflow-hidden pb-10">
      <div className="w-11/12 mx-auto">
        {/* --- Hero Section --- */}
        <section className="py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <FadeIn>
                <h1 className="text-3xl md:text-6xl font-bold leading-tight tracking-tight">
                  Empowering Productivity, <br />
                  <span className="text-brandColor">One Tool at a Time</span>
                </h1>
              </FadeIn>
              <FadeIn delay={0.2}>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl">
                  At ToolsTrek, we believe in the power of simplicity. Our
                  mission is to provide intuitive, high-quality online tools
                  that streamline everyday tasks for developers and
                  professionals.
                </p>
              </FadeIn>
            </div>
            <FadeIn delay={0.3} x={20} y={0}>
              <div className="relative group">
                <div className="absolute -inset-1 bg-linear-to-r from-brandColor to-accent rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                <Image
                  src="https://images.unsplash.com/photo-1576961457745-955300ee1a71?q=80&w=2070&auto=format&fit=crop"
                  width={1400}
                  height={800}
                  alt="Productivity workspace"
                  className="relative object-cover aspect-video rounded-xl shadow-2xl"
                  priority
                />
              </div>
            </FadeIn>
          </div>
        </section>

        {/* --- Founder Section (The Story) --- */}
        <section className="py-16 bg-secondary/30 rounded-3xl px-6 md:px-12 border border-border/50">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <FadeIn className="shrink-0">
              <div className="relative">
                <div className="absolute inset-0 bg-brandColor rounded-full blur-2xl opacity-10 animate-pulse"></div>
                <Image
                  src="/Md-Tasnimul-Haque.jpg"
                  alt="Md. Tasnimul Haque"
                  className="relative object-cover size-48 md:size-64 border-4 border-background rounded-full shadow-xl"
                  width={300}
                  height={300}
                />
              </div>
            </FadeIn>

            <div className="flex-1 space-y-5">
              <FadeIn delay={0.1}>
                <h2 className="text-2xl md:text-3xl font-semibold">
                  The Mind Behind the Tools
                </h2>
              </FadeIn>
              <div className="space-y-4 text-muted-foreground text-sm md:text-base leading-relaxed">
                <FadeIn delay={0.2}>
                  <p>
                    Welcome to ToolsTrek, a platform designed and developed by{" "}
                    <strong>Md. Tasnimul Haque</strong>. With a strong
                    foundation in Next.js and user experience design, Tasnimul
                    has meticulously crafted this ecosystem to provide practical
                    solutions for complex digital workflows.
                  </p>
                </FadeIn>
                <FadeIn delay={0.3}>
                  <p>
                    Every aspect of ToolsTrek—from the minimalist UI to the
                    optimized sitemaps—reflects a methodical approach to web
                    architecture and a commitment to &ldquo;User-First&ldquo;
                    innovation.
                  </p>
                </FadeIn>
              </div>
              <FadeIn delay={0.4}>
                <Link
                  href="https://tasnimul.vercel.app/"
                  target="_blank"
                  className="inline-block mt-4 px-6 py-3 bg-brandColor text-white font-medium rounded-lg hover:scale-105 transition-transform duration-300"
                >
                  Visit Founder Portfolio
                </Link>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* --- Philosophy Section --- */}
        <section className="py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FadeIn x={-20} y={0}>
              <div className="p-8 border-l-4 border-brandColor bg-secondary/10 rounded-r-xl">
                <h3 className="text-xl font-bold mb-3">
                  Continuous Improvement
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  We don&apos;t just build tools; we refine them. Every update
                  is driven by user feedback and the pursuit of technical
                  excellence, ensuring a smooth, dark-mode-ready experience.
                </p>
              </div>
            </FadeIn>
            <FadeIn x={20} y={0} delay={0.2}>
              <div className="p-8 border-l-4 border-brandColor bg-secondary/10 rounded-r-xl">
                <h3 className="text-xl font-bold mb-3">Privacy & Speed</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  ToolsTrek is built to be lightweight and privacy-focused. We
                  prioritize browser-based processing to keep your data yours,
                  without compromising on performance.
                </p>
              </div>
            </FadeIn>
          </div>
        </section>
      </div>

      {/* --- Call to Action --- */}
      <CTA />
    </div>
  );
};

export default Page;
