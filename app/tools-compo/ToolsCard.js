// components/ToolsCard.jsx
"use client";
import Link from "next/link";
import React from "react";
import { motion } from "framer-motion";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { getIcon } from "../tools-compo/dynamicIcon";

const ToolsCard = ({ title, link, description, icon, index }) => {
  const IconComponent = getIcon(icon);

  return (
    <Link href={link} className="group relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.1 }}
        className="h-full relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 p-6 transition-all duration-300 group-hover:bg-white group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] group-hover:-translate-y-1"
      >
        <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gray-100/50 transition-all duration-500 group-hover:scale-[3] group-hover:bg-indigo-50" />

        <div className="relative z-10 flex flex-col h-full">
          <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm border border-gray-100 text-gray-700 transition-colors group-hover:text-indigo-600">
            {IconComponent && <IconComponent className="h-6 w-6" />}
          </div>

          <div className="flex flex-col grow">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {title}
            </h3>
            <p className="text-sm leading-relaxed text-gray-500">
              {description}
            </p>
          </div>

          <div className="mt-8 flex items-center text-sm font-medium text-gray-600 transition-colors group-hover:text-indigo-600">
            Get started
            <ArrowRightIcon className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default ToolsCard;
