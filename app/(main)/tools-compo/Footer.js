"use client";
import { CheckBadgeIcon } from "@heroicons/react/20/solid";
import { ArrowUpRight, Github, Mail, SplinePointer } from "lucide-react";
import { Staatliches } from "next/font/google";
import Link from "next/link";
import React from "react";
import toolsData from "../../../lib/toolsData.json";
import { usePathname } from "next/navigation";
import Image from "next/image";

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
    <div className="bg-linear-to-b from-black to-neutral-950 pt-20 pb-5 px-2">
      <div className="w-11/12 m-auto space-y-7 md:space-y-8 ">
        {/* Menus */}
        <div className="flex items-start justify-between flex-wrap space-y-10 md:space-y-6 md:mb-16">
          {/* About Menus */}
          <div className="space-y-4 w-full ">
            <ul className="space-y-2 flex flex-wrap gap-x-4 gap-y-2">
              {about.map((company) => (
                <li key={company.name} className="relative">
                  <Link
                    href={company.url}
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
                  <CheckBadgeIcon className="size-4 fill-blue-600 text-white" />
                  <p className="text-gray-200 text-sm ">{benefit.name}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
        {/* Divider */}
        <div className="w-full h-px bg-white/20" />
        {/* company information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-center justify-between">
          {/* Logo */}
          <div className="col-span-2 space-y-4">
            <div>
              <Link href="/" className=" flex items-center justify-start gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  id="Layer_1"
                  data-name="Layer 1"
                  viewBox="0 0 24 24"
                  width="50"
                  height="50"
                  className="size-6 fill-white"
                >
                  <path d="m19,16h-6c-2.757,0-5-2.243-5-5v-6c0-2.757,2.243-5,5-5h6c2.757,0,5,2.243,5,5v6c0,2.757-2.243,5-5,5Zm-8,8h-6c-2.757,0-5-2.243-5-5v-6c0-2.757,2.243-5,5-5,.553,0,1,.448,1,1v2c0,3.86,3.141,7,7,7h2c.553,0,1,.448,1,1,0,2.757-2.243,5-5,5Z" />
                </svg>

                <h3 className={`text-3xl text-white ${staatliches.className} `}>
                  Tools<span className="text-white">Trek</span>
                </h3>
              </Link>
            </div>
            <p className="text-sm text-gray-200 font-light w-full leading-normal">
              In today’s fast-paced digital world, efficiency is everything.
              ToolsTrek is your go-to platform for seamless online utilities
              designed to simplify and optimize everyday digital tasks. Whether
              you need to instantly shorten URLs, generate custom QR codes,
              calculate essential metrics, or automate various processes, our
              powerful suite of tools ensures that you accomplish more with
              minimal effort.
            </p>
            {/* Social Icons */}
            <div className="space-y-2 flex flex-col md:flex-row items-start md:items-center justify-start gap-4">
              <Link
                href="mailto:contact.toolstrek@gmail.com"
                className="text-gray-300 text-sm flex items-center justify-start gap-2"
              >
                <Mail className="size-4 text-gray-300" />{" "}
                contact.toolstrek@gmail.com
              </Link>
              <Link
                href="https://github.com/tasnimultas67/toolstrek"
                target="_blank"
                className="text-gray-300 text-sm flex items-center justify-start gap-2"
              >
                <Github className="size-4 text-gray-300" /> Github Project
                Repository
              </Link>
            </div>
          </div>
          {/* GDPR Compliance */}
          <div className="flex justify-start sm:justify-end">
            <Image
              src="/gdpr_ready_white.svg"
              alt="GDPR Compliant"
              width={100}
              height={100}
            />
          </div>
        </div>
        {/* Divider */}
        <div className="w-full h-px bg-white/20" />
        <div>
          <p className="text-gray-300 text-sm">
            Copyright {copyrightYear} Toolstrek. All Rights Reserved. Developed
            by{" "}
            <Link
              href="https://tasnimul.vercel.app/"
              target="_blank"
              className="text-yellow-300 mr-1"
            >
              Tasnimul Haque
            </Link>
            &
            <Link
              href="https://oraclebyte.com/"
              target="_blank"
              className="text-yellow-300 ml-1"
            >
              Oracle Byte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Footer;
