"use client";
import React from "react";
import {
  LinkIcon,
  QrCodeIcon,
  CalculatorIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { motion } from "framer-motion";

const toolCards = [
  {
    title: "Link Shortener",
    link: "/tools/link-shortner",
    description: "Transform long URLs into clean, manageable links.",
    icon: LinkIcon,
  },
  {
    title: "Wi-Fi QR Code",
    link: "/tools/wifi-qr",
    description: "Let guests scan to join your network instantly.",
    icon: QrCodeIcon,
  },
  {
    title: "Age Calculator",
    link: "/tools/age-calculate",
    description: "Precise breakdown of your age down to the day.",
    icon: CalculatorIcon,
  },
  {
    title: "QR Scanner",
    link: "/tools/qr-scanner",
    description: "Instant detection via camera or local files.",
    icon: QrCodeIcon,
  },
];

const HServices = () => {
  return (
    <section className="bg-white pb-20 px-2">
      <div className="w-11/12 mx-auto">
        {/* Optional Header Section */}
        <div className="mb-16 text-center lg:text-left">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Powerful simple tools
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Everything you need to stay productive, all in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {toolCards.map((card, index) => (
            <Link key={index} href={card.link} className="group relative">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="h-full relative overflow-hidden rounded-3xl border border-gray-100 bg-gray-50 p-8 transition-all duration-300 group-hover:bg-white group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] group-hover:-translate-y-1"
              >
                {/* Abstract decorative shape in the background */}
                <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gray-100/50 transition-all duration-500 group-hover:scale-[3] group-hover:bg-indigo-50/50" />

                <div className="relative z-10 flex flex-col h-full">
                  <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm border border-gray-100 text-gray-700 transition-colors group-hover:text-indigo-600">
                    <card.icon className="h-6 w-6" />
                  </div>

                  <div className="flex flex-col flex-grow">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {card.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-gray-500">
                      {card.description}
                    </p>
                  </div>

                  <div className="mt-8 flex items-center text-sm font-medium text-gray-400 transition-colors group-hover:text-indigo-600">
                    Get started
                    <ArrowRightIcon className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HServices;
