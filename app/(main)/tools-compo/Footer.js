"use client";
import { CheckBadgeIcon } from "@heroicons/react/20/solid";
import { ArrowUpRight, Github, Mail } from "lucide-react";
import { Staatliches } from "next/font/google";
import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import InstallAppButton from "@/components/InstallAppButton";
import DarkLogo from "./DarkLogo";

const staatliches = Staatliches({
  subsets: ["latin"], // Ensures proper character support
  weight: "400", // Adjust weight as needed
  display: "swap", // Ensures text is visible during loading
});

const about = [
  { name: "About Us", url: "/about-us" },
  { name: "Request a Tool", url: "/contact-us" },
  { name: "Frequently Asked Questions", url: "/faq" },
  { name: "Privacy Policy", url: "/privacy-policy" },
];
const whyus = [
  { name: "Open Source" },
  { name: "Privacy First" },
  { name: "Accessible Everywhere" },
  { name: "Client-side processing" },
  { name: "User-Friendly Interface" },
  { name: "Fast and Efficient" },
  { name: "Secure and Private" },
  { name: "Free to Use" },
  { name: "No Registration Required" },
  { name: "Regular Updates" },
  { name: "Easy to Use" },
  { name: "Expertly Crafted" },
  { name: "Creative & Practical Solutions" },
];

const Footer = () => {
  const copyrightYear = new Date().getFullYear();
  const currentUrl = usePathname();
  return (
    <div className="pb-4">
      <div className="bg-linear-to-b from-slate-900 to-black w-[98%] m-auto rounded-2xl overflow-hidden">
        <div className=" space-y-7 md:space-y-8 pt-10 pb-5 px-4 md:px-8">
          {/* Menus */}
          <div className="flex items-start justify-between flex-wrap space-y-10 md:space-y-6 md:mb-16">
            {/* About Menus */}
            <div className="space-y-4 w-full ">
              <ul className="space-y-2 flex flex-wrap gap-x-4 gap-y-2">
                {about.map((company) => (
                  <li key={company.name} className="relative">
                    <Link
                      href={company.url}
                      suppressHydrationWarning
                      className={`text-sm flex items-center gap-1 w-fit line-clamp-1 transition-all relative
          before:absolute before:left-0 before:bottom-0 before:h-px before:transition-all before:duration-300 ${currentUrl === company.url ? "text-yellow-400 before:w-full before:bg-yellow-400" : "text-gray-200 before:w-0 before:bg-gray-400 hover:before:w-full"}`}
                    >
                      {company.name} <ArrowUpRight className="size-4" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            {/* whyus Menus */}
            <div className="space-y-4 w-full">
              <h3 className="text-base text-white font-semibold">Why Us</h3>
              <ul className="flex flex-wrap gap-x-2 gap-y-2">
                {whyus.map((benefit) => (
                  <li
                    key={benefit.name}
                    className="relative flex items-center gap-2 bg-white/10 px-2 py-1.5 rounded-md"
                  >
                    <CheckBadgeIcon className="size-4 fill-brandColor text-white" />
                    <p className="text-gray-200 text-sm ">{benefit.name}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {/* Divider */}
          <div className="w-full h-px bg-white/20" />
          {/* company information */}
          <div className="">
            {/* Logo */}
            <div className="space-y-4">
              <p className="text-sm md:text-base text-gray-200 font-light w-full leading-normal">
                In today’s fast-paced digital world, efficiency is everything.
                ToolsTrek is your go-to platform for seamless online utilities
                designed to simplify and optimize everyday digital tasks.
                Whether you need to instantly shorten URLs, generate custom QR
                codes, calculate essential metrics, or automate various
                processes, our powerful suite of tools ensures that you
                accomplish more with minimal effort.
              </p>
              {/* Social Icons */}
              <div className="flex flex-col flex-wrap md:flex-row items-start md:items-center justify-start gap-4">
                <Link
                  href="mailto:contact.toolstrek@gmail.com"
                  suppressHydrationWarning
                  className="text-gray-300 text-sm md:text-base flex items-center justify-start gap-2"
                >
                  <Mail className="size-4 text-gray-300" />{" "}
                  contact.toolstrek@gmail.com
                </Link>
                <Link
                  href="https://github.com/tasnimultas67/toolstrek"
                  target="_blank"
                  suppressHydrationWarning
                  className="text-gray-300 text-sm md:text-base flex items-center justify-start gap-2"
                >
                  <Github className="size-4 text-gray-300" /> Github Project
                  Repository
                </Link>
                <InstallAppButton />
              </div>
            </div>
          </div>
          <div>
            <p className="text-gray-300 text-sm md:text-base">
              Copyright {copyrightYear} Toolstrek. All Rights Reserved.
              Developed by{" "}
              <Link
                href="https://tasnimul.vercel.app/"
                target="_blank"
                suppressHydrationWarning
                className="text-yellow-300 mr-1"
              >
                Tasnimul Haque
              </Link>
              &
              <Link
                href="https://axioree.com/"
                target="_blank"
                suppressHydrationWarning
                className="text-yellow-300 ml-1"
              >
                Axioree
              </Link>
            </p>
          </div>
          {/* Divider */}
          <div className="w-full h-px bg-white/20 mb-10" />
        </div>
        {/* Bigger Logo */}
        <div className="relative top-0 px-3 md:px-10 pt-3">
          <DarkLogo />
          <div className="absolute bottom-0 inset-x-0 w-full h-[60px] md:h-[180px] bg-linear-to-b from-transparent to-black z-20" />
          <div className="absolute bottom-0 inset-x-0 w-full h-[60px] md:h-[180px] bg-linear-to-b from-transparent to-black z-20" />
          <div className="absolute bottom-0 inset-x-0 w-full h-[60px] md:h-[180px] bg-linear-to-b from-transparent to-black z-20" />
        </div>
      </div>
    </div>
  );
};

export default Footer;
