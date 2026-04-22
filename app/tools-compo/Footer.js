import { CheckBadgeIcon } from "@heroicons/react/20/solid";
import { Github, Mail, MapPin } from "lucide-react";
import { Staatliches } from "next/font/google";
import Link from "next/link";
import React from "react";
import toolsData from "../../lib/toolsData.json";

const staatliches = Staatliches({
  subsets: ["latin"], // Ensures proper character support
  weight: "400", // Adjust weight as needed
  display: "swap", // Ensures text is visible during loading
});

const companies = [
  { name: "About Company", url: "/about-us" },
  { name: "Contact Us", url: "/contact-us" },
  { name: "Request a Tool", url: "/contact-us" },
  { name: "Frequently Asked Questions", url: "/faq" },
  { name: "Privacy Policy", url: "/privacy-policy" },
];
const whyus = [
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
  return (
    <div className="bg-linear-to-b from-black to-neutral-950 pt-20 pb-5 px-2">
      <div className="w-11/12 m-auto space-y-7 md:space-y-8 ">
        {/* Menus */}
        <div className="flex items-start justify-between flex-wrap space-y-10 md:space-y-0 md:mb-16 ">
          {/* service Menus */}
          <div className="space-y-4 w-1/2 md:w-2/4">
            <h3 className="text-base text-white font-semibold">Tools</h3>
            <ul className="space-y-2 grid grid-cols-1 md:grid-cols-2 gap-2">
              {toolsData.map((tool) => (
                <li key={tool.title} className="relative">
                  <Link
                    href={tool.link}
                    className="text-gray-200 text-sm relative before:absolute before:left-0 before:bottom-0 before:w-0 before:h-px before:bg-gray-400 before:transition-all before:duration-300 hover:before:w-full"
                  >
                    {tool.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {/* Company Menus */}
          <div className="space-y-4 w-1/2 md:w-1/4">
            <h3 className="text-base text-white font-semibold">Company</h3>
            <ul className="space-y-2">
              {companies.map((company) => (
                <li key={company.name} className="relative">
                  <Link
                    href={company.url}
                    className="text-gray-200 text-sm relative before:absolute before:left-0 before:bottom-0 before:w-0 before:h-px before:bg-gray-400 before:transition-all before:duration-300 hover:before:w-full"
                  >
                    {company.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {/* whyus Menus */}
          <div className="space-y-4 w-2/2 md:w-1/4">
            <h3 className="text-base text-white font-semibold">Why Us</h3>
            <ul className="space-y-2 grid grid-cols-1">
              {whyus.map((benefit) => (
                <li
                  key={benefit.name}
                  className="relative flex items-center gap-2"
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
        <div className="space-y-5">
          {/* Logo */}
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
          <p className="text-sm text-gray-200 font-light w-full md:w-10/12">
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
        {/* Divider */}
        <div className="w-full h-px bg-white/20" />
        <div>
          <p className="text-gray-300 text-sm">
            copyright {copyrightYear} Toolstrek. All Rights Reserved. Developed
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
