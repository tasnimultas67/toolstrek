import { Mail } from "lucide-react";
import { Staatliches } from "next/font/google";
import Link from "next/link";
import React from "react";

const staatliches = Staatliches({
  subsets: ["latin"], // Ensures proper character support
  weight: "400", // Adjust weight as needed
  display: "swap", // Ensures text is visible during loading
});

const platforms = [
  { name: "Automated document creation", url: "#" },
  { name: "Automated template management", url: "#" },
  { name: "Email signature management", url: "#" },
  { name: "Brand content distribution", url: "#" },
  { name: "Productivity tools", url: "#" },
  { name: "AI and doc gen", url: "#" },
  { name: "Privacy at Templafy", url: "#" },
  { name: "Security at Templafy", url: "#" },
];

const Footer = () => {
  const copyrightYear = new Date().getFullYear();
  return (
    <div className="bg-gradient-to-b from-black to-neutral-950 pt-20 pb-5 px-3 mt-10 ">
      <div className="md:w-[1180px] m-auto space-y-14">
        <div className="flex items-start justify-between">
          {/* Platform Menus */}
          <div className="space-y-4">
            <h3 className="text-base text-white font-semibold">Platform</h3>
            <ul className="space-y-2">
              {platforms.map((platform) => (
                <li key={platform.name} className="relative">
                  <Link
                    href={platform.url}
                    className="text-gray-200 text-sm relative before:absolute before:left-0 before:bottom-0 before:w-0 before:h-[1px] before:bg-gray-400 before:transition-all before:duration-300 hover:before:w-full"
                  >
                    {platform.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {/* Solutions Menus */}
          <div className="space-y-4">
            <h3 className="text-base text-white font-semibold">Solutions</h3>
            <ul className="space-y-2">
              {platforms.map((platform) => (
                <li key={platform.name} className="relative">
                  <Link
                    href={platform.url}
                    className="text-gray-200 text-sm relative before:absolute before:left-0 before:bottom-0 before:w-0 before:h-[1px] before:bg-gray-400 before:transition-all before:duration-300 hover:before:w-full"
                  >
                    {platform.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {/* Resources Menus */}
          <div className="space-y-4">
            <h3 className="text-base text-white font-semibold">Resources</h3>
            <ul className="space-y-2">
              {platforms.map((platform) => (
                <li key={platform.name} className="relative">
                  <Link
                    href={platform.url}
                    className="text-gray-200 text-sm relative before:absolute before:left-0 before:bottom-0 before:w-0 before:h-[1px] before:bg-gray-400 before:transition-all before:duration-300 hover:before:w-full"
                  >
                    {platform.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {/* Company Menus */}
          <div className="space-y-4">
            <h3 className="text-base text-white font-semibold">Company</h3>
            <ul className="space-y-2">
              {platforms.map((platform) => (
                <li key={platform.name} className="relative">
                  <Link
                    href={platform.url}
                    className="text-gray-200 text-sm relative before:absolute before:left-0 before:bottom-0 before:w-0 before:h-[1px] before:bg-gray-400 before:transition-all before:duration-300 hover:before:w-full"
                  >
                    {platform.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        {/* Divider */}
        <div className="w-full h-[1px] bg-white/20" />
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
          <div>
            <Link
              href="mailto:contact.toolstrek@gmail.com"
              className="text-gray-300 text-sm flex items-center justify-start gap-2"
            >
              <Mail className="size-4 text-gray-300" />{" "}
              contact.toolstrek@gmail.com
            </Link>
          </div>
        </div>
        {/* Divider */}
        <div className="w-full h-[1px] bg-white/20" />
        <div>
          <p className="text-gray-300 text-sm">
            copyright {copyrightYear} Toolstrek. All Rights Reserved. Developed
            by{" "}
            <Link
              href="https://tasnimul.vercel.app/"
              target="_blank"
              className="text-yellow-300"
            >
              Tasnimul Haque
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Footer;
