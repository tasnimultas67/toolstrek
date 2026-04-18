import Image from "next/image";
import Link from "next/link";
import * as motion from "motion/react-client";

const Hero = () => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
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

  const floatingVariants = {
    float: {
      y: [-10, 10, -10],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const shapeVariants = {
    hidden: { opacity: 0, rotate: 0 },
    visible: {
      opacity: 0.3,
      rotate: 30,
      transition: {
        duration: 1.5,
        ease: "easeOut",
      },
    },
  };

  // Original Content
  return (
    <div className="bg-white h-dvh overflow-hidden">
      <div className="relative isolate px-6 lg:px-8">
        {/* Animated Shape */}
        <motion.div
          aria-hidden="true"
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          initial="hidden"
          animate="visible"
          variants={shapeVariants}
        >
          <div
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
            className="relative left-[calc(50%-11rem)] aspect-1155/678 w-144.5 -translate-x-1/2 bg-linear-to-tr from-brandColor/40 to-brandColorHover/40 sm:left-[calc(50%-30rem)] sm:w-288.75"
          />
        </motion.div>

        {/* Information */}
        <motion.div
          className="mx-auto max-w-2xl relative top-0 py-24 md:py-32"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <div className="text-center">
            <motion.h1
              className="text-5xl font-semibold tracking-tight text-balance text-gray-900 sm:text-7xl"
              variants={itemVariants}
            >
              Your Digital{" "}
              <span className="bg-linear-to-r from-brandColor to-emerald-900 bg-clip-text text-transparent">
                Toolbox
              </span>{" "}
              for Everyday Tasks
            </motion.h1>

            <motion.p
              className="mt-8 text-base text-pretty text-gray-500"
              variants={itemVariants}
            >
              Your all-in-one toolkit for effortless online tasks. From URL
              shorteners to QR code generators and age calculators—ToolsTrek
              simplifies digital solutions with speed, precision, and ease.
              Start your journey with powerful utilities designed to enhance
              productivity!
            </motion.p>

            {/* Floating Icons */}
            <motion.div
              className="absolute top-10 left-0 w-7 md:w-12.5 md:top-20 md:-left-28 -rotate-12 drop-shadow-2xl drop-shadow-blue-300"
              variants={floatingVariants}
              animate="float"
            >
              <Image
                src="/Age-Calculator-icon.svg"
                width={50}
                height={50}
                alt="Age Calculator Icon"
                priority
              />
            </motion.div>

            <motion.div
              className="absolute top-10 right-0 w-7 md:w-12.5 md:top-20 md:-right-28 rotate-12 drop-shadow-2xl drop-shadow-blue-300"
              variants={floatingVariants}
              animate="float"
            >
              <Image
                src="/QR-Generator.svg"
                width={60}
                height={60}
                alt="QR Generator Icon"
                priority
              />
            </motion.div>

            <motion.div
              className="mt-10 flex items-center justify-center gap-x-6"
              variants={itemVariants}
            >
              <Link
                href="#tools"
                className="rounded-md bg-brandColor hover:bg-brandColorHover px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors duration-300 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-brandColor"
              >
                Get started
              </Link>
              <Link
                href="/about-us"
                className="text-sm font-semibold leading-6 text-gray-900 hover:text-brandColor transition-colors duration-300"
              >
                Learn more <span aria-hidden="true">→</span>
              </Link>
            </motion.div>

            <motion.div
              className="absolute bottom-10 left-0 w-7 md:w-10 md:bottom-40 md:-left-28 rotate-12 drop-shadow-2xl drop-shadow-blue-300"
              variants={floatingVariants}
              animate="float"
            >
              <Image
                src="/Link-shortener.svg"
                width={40}
                height={40}
                alt="Link Shortener Icon"
                priority
              />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;
