import Image from "next/image";
import Link from "next/link";
import * as motion from "motion/react-client";
import { Button } from "@/components/ui/button";
import { Playfair_Display } from "next/font/google";

const playfairDisplay = Playfair_Display({
  display: "swap",
  preload: true,
  weight: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

const Hero = () => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1], // Custom cubic-bezier for a "slicker" feel
      },
    },
  };

  const floatingVariants = (delay = 0) => ({
    float: {
      y: [-12, 12, -12],
      rotate: [-5, 5, -5],
      transition: {
        duration: 5,
        repeat: Infinity,
        ease: "easeInOut",
        delay: delay,
      },
    },
  });

  return (
    <div className="relative bg-slate-50 dark:bg-gray-950 h-dvh overflow-hidden flex items-center justify-center">
      {/* Background Grid Pattern */}
      <div
        className="absolute inset-0 z-0 opacity-[0.03] [mask-image:radial-gradient(ellipse_at_center,white,transparent)]"
        style={{
          backgroundImage:
            'url(\'data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M0 0h40v40H0V0zm1 1h38v38H1V1z" fill="%23000" fill-rule="evenodd"/%3E%3C/svg%3E\')',
        }}
      />

      <div className="relative isolate px-6 lg:px-0 z-10 w-full">
        {/* Modernized Gradient Blob */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.4, scale: 1 }}
          transition={{ duration: 2 }}
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80 flex justify-center"
        >
          <div
            className="relative aspect-1155/678 w-[70rem] bg-linear-to-tr from-brandColor via-emerald-400 to-brandColorHover opacity-30"
            style={{
              clipPath: "circle(50% at 50% 50%)",
            }}
          />
        </motion.div>

        <motion.div
          className="mx-auto max-w-5xl text-center"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Badge */}
          <motion.div
            variants={itemVariants}
            className="mb-5 flex justify-center"
          >
            <span className="rounded-full bg-brandColor/10 px-3 py-1 text-sm font-medium leading-6 text-brandColor ring-1 ring-inset ring-brandColor/20">
              New tools added monthly
            </span>
          </motion.div>

          <motion.h1
            className="text-5xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-6xl lg:text-7xl"
            variants={itemVariants}
          >
            Your Free Everyday
            <br />
            <span
              className={`bg-linear-to-r from-brandColor via-emerald-600 to-brandColor bg-size-[200%_auto] animate-gradient-x bg-clip-text text-transparent ${playfairDisplay.className}`}
              style={{ fontStyle: "italic" }}
            >
              Digital Toolbox.
            </span>
          </motion.h1>

          <motion.p
            className="mt-8 text-lg leading-8 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
            variants={itemVariants}
          >
            Instantly shorten URLs, generate QR codes, calculate metrics, and
            streamline digital tasks with ease. Explore powerful tools designed
            for efficiency!
          </motion.p>

          {/* Call to Actions */}
          <motion.div
            className="mt-10 flex items-center justify-center gap-x-6"
            variants={itemVariants}
          >
            <Link href="#tools">
              <Button className="w-full bg-brandColor dark:text-white hover:bg-brandColorHover transition-all duration-200 cursor-pointer">
                Get started free
              </Button>
            </Link>
            <Link
              href="/about-us"
              className="group text-sm font-semibold leading-6 text-gray-900 dark:text-gray-200 flex items-center"
            >
              Learn more
              <span
                className="ml-2 inline-block transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              >
                →
              </span>
            </Link>
          </motion.div>

          {/* Floating Icons with specific delays and enhanced shadows */}
          <motion.div
            className="absolute top-12 left-12 md:top-20 md:left-32 p-4 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-slate-100 dark:border-gray-800 hidden sm:block"
            variants={floatingVariants(0)}
            animate="float"
          >
            <Image
              src="/Age-Calculator-icon.svg"
              width={48}
              height={48}
              alt="Icon"
              priority
            />
          </motion.div>

          <motion.div
            className="absolute top-0 right-12 md:top-10 md:right-32 p-4 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-slate-100 dark:border-gray-800 hidden sm:block"
            variants={floatingVariants(0.5)}
            animate="float"
          >
            <Image
              src="/QR-Generator.svg"
              width={48}
              height={48}
              alt="Icon"
              priority
            />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;
