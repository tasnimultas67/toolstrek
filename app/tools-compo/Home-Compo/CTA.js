import * as motion from "motion/react-client";

import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const CTA = () => {
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

  const circleVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 0.2,
      transition: {
        duration: 1.5,
        ease: "circOut",
      },
    },
  };

  return (
    <section className="relative">
      <motion.div
        className="w-full md:w-[1000px] mx-auto text-left bg-gradient-to-r from-black to-brandColor rounded-3xl text-white py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden pb-52 md:pb-10"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
      >
        {/* Left Content */}
        <motion.div
          className="text-center md:text-left"
          variants={containerVariants}
        >
          <motion.h2
            className="text-3xl font-semibold mb-4 leading-normal"
            variants={itemVariants}
          >
            Your Digital Toolbox for Productivity & Efficiency!
          </motion.h2>
          <motion.p
            className="text-sm mb-5 opacity-90 w-full md:w-[70%]"
            variants={itemVariants}
          >
            Discover the power of precision-crafted tools designed to simplify
            your workflow. From QR code generation to smart utilities, ToolsTrek
            offers innovative solutions that enhance efficiency and convenience.
            Try them today and optimize your digital experience!
          </motion.p>
          <motion.div variants={itemVariants}>
            <Button asChild variant="secondary" className="">
              <Link href="#" className="text-xs">
                Browse All Tools
              </Link>
            </Button>
          </motion.div>
        </motion.div>

        {/* Right Background - Abstract Geometric Circles */}
        <motion.div
          className="absolute right-0 top-0 bottom-0 w-[100%] md:w-[60%]"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <motion.svg
            className="absolute right-0 md:right-[-400px] bottom-[-300px] md:bottom-0 md:top-[-130px] w-[480px] md:w-[800px] h-[600px]  fill-white "
            viewBox="0 0 600 600"
            fill="none"
            variants={circleVariants}
          >
            <motion.circle
              cx="300"
              cy="300"
              r="320"
              stroke="white"
              strokeWidth="1.5"
              variants={circleVariants}
            />
            <motion.circle
              cx="300"
              cy="300"
              r="280"
              stroke="white"
              strokeWidth="1.5"
              variants={circleVariants}
            />
            <motion.circle
              cx="300"
              cy="300"
              r="240"
              stroke="white"
              strokeWidth="1.5"
              variants={circleVariants}
            />
            <motion.circle
              cx="300"
              cy="300"
              r="200"
              stroke="white"
              strokeWidth="1.5"
              variants={circleVariants}
            />
            <motion.circle
              cx="300"
              cy="300"
              r="160"
              stroke="white"
              strokeWidth="1.5"
              variants={circleVariants}
            />
            <motion.circle
              cx="300"
              cy="300"
              r="120"
              stroke="white"
              strokeWidth="1.5"
              variants={circleVariants}
            />
            <motion.circle
              cx="300"
              cy="300"
              r="80"
              stroke="white"
              strokeWidth="1.5"
              variants={circleVariants}
            />
            <motion.circle
              cx="300"
              cy="300"
              r="40"
              stroke="white"
              strokeWidth="1.5"
              variants={circleVariants}
            />
            <motion.circle
              cx="300"
              cy="300"
              r="20"
              stroke="white"
              strokeWidth="1.5"
              variants={circleVariants}
            />
          </motion.svg>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default CTA;
