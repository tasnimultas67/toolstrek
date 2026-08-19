import React from "react";
import * as motion from "motion/react-client";

// Helper function to render text with highlighted font-palatino words inside *asterisks*
const renderFormattedText = (text) => {
  if (typeof text !== "string") return text;

  const parts = text.split(/(\*[^*]+\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <span
          key={index}
          className="bg-linear-to-r from-brandColor via-emerald-600 to-brandColor bg-size-[200%_auto] animate-gradient-x bg-clip-text text-transparent font-playfairDisplay italic font-semibold capitalize"
        >
          {part.slice(1, -1)}{" "}
        </span>
      );
    }
    return part;
  });
};

const SectionInfo = ({ title, description, subtitle, level = "h2" }) => {
  const HeadingTag = motion[level] || motion.h2;

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

  return (
    <motion.div
      initial="hidden"
      viewport={{ once: true }}
      whileInView="visible"
      variants={containerVariants}
      className="space-y-3 text-center flex flex-col items-center justify-center"
    >
      {title && (
        <motion.p
          variants={itemVariants}
          className="text-brandColor dark:text-brandColorHover rounded-full bg-brandColor/10 dark:bg-brandColorHover/10 w-fit px-3 py-1 text-xs xl:text-sm 2xl:text-base flex items-center gap-2"
        >
          {renderFormattedText(title)}
        </motion.p>
      )}

      {subtitle && (
        <HeadingTag
          variants={itemVariants}
          className="text-3xl lg:text-5xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-4xl font-googleSansFlex"
        >
          {renderFormattedText(subtitle)}
        </HeadingTag>
      )}
      {description && (
        <motion.p
          variants={itemVariants}
          className="text-lg text-gray-600 dark:text-gray-400"
        >
          {renderFormattedText(description)}
        </motion.p>
      )}
    </motion.div>
  );
};

export default SectionInfo;
