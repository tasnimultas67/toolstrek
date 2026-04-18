"use client";
import React from "react";
import {
  LinkIcon,
  QrCodeIcon,
  CalculatorIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import { LockClosedIcon } from "@heroicons/react/20/solid";
import ToolsCard from "./ToolsCard";

const toolCards = [
  {
    title: "Link Shortener",
    link: "/tools/link-shortner",
    description: "Shorten your links for easy sharing",
    icon: LinkIcon,
  },
  {
    title: "Wifi QR Code Generator",
    link: "/tools/wifi-qr",
    description: "Generate QR codes for your wifi network",
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
    description: "Scan QR codes using your device's camera",
    icon: QrCodeIcon,
  },
  {
    title: "Days Tracker",
    link: "/tools/days-tracker",
    description: "Calculate the end date based on start date",
    icon: CalendarIcon,
  },
  {
    title: "Password Generator",
    link: "/tools/password-gen",
    description: "A secure tool that creates strong, randomized passwords",
    icon: LockClosedIcon,
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
          {toolCards.map((tool, index) => (
            <ToolsCard key={index} {...tool} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HServices;
