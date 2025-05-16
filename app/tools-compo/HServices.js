"use client";
import React from "react";
import { LinkIcon, QrCodeIcon } from "@heroicons/react/20/solid";
import { CalculatorIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { motion } from "framer-motion";

const toolCards = [
  {
    title: "Link Shortner",
    link: "/tools/link-shortner",
    description: "Shorten your links for easy sharing",
    icon: LinkIcon,
  },
  {
    title: "Wi-Fi QR Code",
    link: "/tools/wifi-qr",
    description: "Generate QR codes for your Wi-Fi network",
    icon: QrCodeIcon,
  },
  {
    title: "Age Calculator",
    link: "/tools/age-calculate",
    description: "Calculate your age in years, months, and days",
    icon: CalculatorIcon,
  },
  {
    title: "QR Code Scanner",
    link: "/tools/qr-scanner",
    description: "Scan QR codes with your device's camera or upload an image",
    icon: QrCodeIcon,
  },
];

const HServices = () => {
  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        when: "beforeChildren",
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const hoverEffect = {
    scale: 1.05,
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  };

  const tapEffect = {
    scale: 0.98,
  };

  return (
    <div className="bg-white py-24 sm:py-32 border-t border-gray-900/10">
      {/* Services/Tools */}
      <div className="max-w-[1280px] mx-auto px-2 lg:px-4">
        <motion.div
          className="flex flex-col md:flex-row max-w-7xl items-center justify-center px-6 lg:px-8 gap-5"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={container}
        >
          {toolCards.map((card) => (
            <motion.div
              key={card.title}
              variants={item}
              whileHover={hoverEffect}
              whileTap={tapEffect}
              className="w-full md:w-[24%] flex-1 bg-white rounded-xl border border-gray-300"
            >
              <Link
                href={card.link}
                className="p-8  text-center flex flex-col items-center justify-center gap-1 h-full"
              >
                <motion.div
                  className="border border-gray-300 rounded-xl p-3 mb-4"
                  whileHover={{ rotate: card.title.includes("QR") ? -10 : 10 }}
                >
                  <card.icon className="size-5 text-gray-900" />
                </motion.div>
                <h3 className="font-semibold">{card.title}</h3>
                <p className="text-sm text-gray-500">{card.description}</p>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default HServices;
