"use client";

import { useState, useEffect } from "react"; // Added useEffect
import { Staatliches } from "next/font/google";
import {
  Dialog,
  DialogPanel,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Popover,
  PopoverButton,
  PopoverGroup,
  PopoverPanel,
} from "@headlessui/react";
import {
  Bars3Icon,
  CalculatorIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  ChevronDownIcon,
  LinkIcon,
  QrCodeIcon,
} from "@heroicons/react/20/solid";
import Link from "next/link";
import {
  CalendarRange,
  Lock,
  ScanQrCode,
  SplinePointer,
  Star,
  Github,
} from "lucide-react"; // Added Star and Github icons

import { Button } from "@/components/ui/button";

const staatliches = Staatliches({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-staatliches",
});

const services = [
  {
    name: "Link Shortener",
    description: "Shorten your links for easy sharing",
    href: "/tools/link-shortner",
    icon: LinkIcon,
  },
  {
    name: "Wifi QR Code Generator",
    description: "Generate QR codes for your wifi network",
    href: "/tools/wifi-qr",
    icon: QrCodeIcon,
  },
  {
    name: "Age Calculator",
    description: "Calculate your age in years, months, and days",
    href: "/tools/age-calculate",
    icon: CalculatorIcon,
  },
  {
    name: "QR Code Scanner",
    description: "Scan QR codes using your device's camera",
    href: "/tools/qr-scanner",
    icon: ScanQrCode,
  },
  {
    name: "Days Tracker",
    description: "Calculate the end date based on start date",
    href: "/tools/days-tracker",
    icon: CalendarRange,
  },
  {
    name: "Password Generator",
    description:
      "A secure tool that creates strong, randomized passwords with customizable options",
    href: "/tools/password-generator",
    icon: Lock,
  },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [stars, setStars] = useState(0); // State for GitHub stars

  // Fetching GitHub Stars
  useEffect(() => {
    fetch("https://api.github.com/repos/tasnimultas67/toolstrek")
      .then((res) => res.json())
      .then((data) => {
        if (data.stargazers_count) setStars(data.stargazers_count);
      })
      .catch((err) => console.error("Error fetching stars:", err));
  }, []);

  return (
    <div className="border-b border-gray-900/10 sticky top-0 z-50">
      <div className="relative z-50 bg-white/80 backdrop-blur-2xl">
        <header className="w-full">
          <nav
            aria-label="Global"
            className="mx-auto flex items-center justify-between px-2 py-3 lg:px-2 w-11/12"
          >
            <div className="flex lg:flex-1">
              <Link href="/" className="flex items-center justify-start gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="25"
                  height="25"
                  className="size-6"
                >
                  <path
                    d="M 19 16 L 13 16 C 10.243 16 8 13.757 8 11 L 8 5 C 8 2.243 10.243 0 13 0 L 19 0 C 21.757 0 24 2.243 24 5 L 24 11 C 24 13.757 21.757 16 19 16 Z"
                    className="fill-brandColor"
                  />
                  <path
                    d="M 11 24 L 5 24 C 2.243 24 0 21.757 0 19 L 0 13 C 0 10.243 2.243 8 5 8 C 5.553 8 6 8.448 6 9 L 6 11 C 6 14.86 9.141 18 13 18 L 15 18 C 15.553 18 16 18.448 16 19 C 16 21.757 13.757 24 11 24 Z"
                    className="fill-brandColorHover"
                  />
                </svg>
                <h3 className={`text-3xl ${staatliches.className}`}>
                  Tools<span className="text-brandColor">Trek</span>
                </h3>
              </Link>
            </div>

            <div className="flex lg:hidden gap-4 items-center">
              {/* Mobile Star Link */}
              <Link
                href="https://github.com/tasnimultas67/toolstrek"
                target="_blank"
                className="flex items-center gap-1 text-gray-700"
              >
                <Star size={18} className="fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-bold">{stars}</span>
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
              >
                <Bars3Icon aria-hidden="true" className="size-6" />
              </button>
            </div>

            <div className="hidden md:flex justify-end items-center lg:gap-x-4">
              <PopoverGroup className="hidden lg:flex lg:gap-x-12 items-center">
                <Popover className="relative">
                  {({ open, close }) => (
                    <>
                      <PopoverButton className="flex items-center gap-x-1 text-sm/6 font-semibold text-gray-900 outline-none">
                        Services
                        <ChevronDownIcon
                          aria-hidden="true"
                          className={`size-5 transition-transform ${open ? "rotate-180" : ""}`}
                        />
                      </PopoverButton>
                      <PopoverPanel className="absolute top-full -left-8 z-10 mt-4.5 w-screen max-w-md overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-gray-900/5 transition">
                        <div className="p-4">
                          {services.map((item) => (
                            <div
                              key={item.name}
                              className="group relative flex items-center gap-x-6 rounded-lg p-3 text-sm/6 hover:bg-brandColor/5 transition"
                            >
                              <div className="flex size-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
                                <item.icon className="size-6 text-gray-600 group-hover:text-brandColor" />
                              </div>
                              <div className="flex-auto">
                                <Link
                                  href={item.href}
                                  className="block font-semibold text-gray-900"
                                  onClick={() => close()}
                                >
                                  {item.name}
                                  <span className="absolute inset-0" />
                                </Link>
                                <p className="text-gray-500 text-sm line-clamp-1">
                                  {item.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </PopoverPanel>
                    </>
                  )}
                </Popover>

                <Link
                  href="/about-us"
                  className="text-sm/6 font-semibold text-gray-900"
                >
                  Company
                </Link>
                <Link
                  href="/contact-us"
                  className="text-sm/6 font-semibold text-gray-900"
                >
                  Contact Us
                </Link>
              </PopoverGroup>

              <div className="hidden lg:flex lg:flex-1 lg:justify-end ml-8">
                <Link
                  href="https://forms.gle/BJXbXuQ3n2mwdHgx5"
                  target="_blank"
                >
                  <Button className="bg-brandColor hover:bg-brandColorHover !text-sm font-normal shadow-none flex items-center gap-2">
                    <SplinePointer className="size-4" /> Request a Tool
                  </Button>
                </Link>
              </div>
              {/* Desktop GitHub Star Button - Glass Style */}
              <Link
                href="https://github.com/tasnimultas67/toolstrek"
                target="_blank"
                className="group flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/5 hover:bg-black/10 border border-black/10 transition-all duration-300 backdrop-blur-md"
              >
                <Github
                  size={18}
                  className="group-hover:scale-110 transition-transform text-gray-900"
                />
                <div className="flex items-center gap-1.5 border-l border-black/10 pl-2">
                  <Star
                    size={14}
                    className="text-yellow-500 fill-yellow-500 group-hover:rotate-12 transition-transform"
                  />
                  <span className="text-sm font-bold text-gray-900">
                    {stars}
                  </span>
                </div>
              </Link>
            </div>
          </nav>
        </header>
      </div>

      {/* Mobile Menu Dialog */}
      <Dialog
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
        className="lg:hidden"
      >
        <DialogPanel className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white px-2 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-1">
              {/* Logo SVG truncated for brevity */}
              <h3 className={`text-3xl ${staatliches.className}`}>
                Tools<span className="text-brandColor">Trek</span>
              </h3>
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="-m-2.5 rounded-md p-2.5 text-gray-700"
            >
              <XMarkIcon className="size-6" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="space-y-2 py-6">
                <Disclosure as="div" className="-mx-3">
                  {({ close }) => (
                    <>
                      <DisclosureButton className="group flex w-full items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base font-semibold text-gray-900 hover:bg-gray-50">
                        Services
                        <ChevronDownIcon className="size-5 transition-transform group-data-open:rotate-180" />
                      </DisclosureButton>
                      <DisclosurePanel className="mt-2 space-y-2">
                        {services.map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            className="block rounded-lg py-2 pl-6 pr-3 text-sm font-semibold text-gray-900 hover:bg-gray-50"
                            onClick={() => {
                              close();
                              setMobileMenuOpen(false);
                            }}
                          >
                            {item.name}
                          </Link>
                        ))}
                      </DisclosurePanel>
                    </>
                  )}
                </Disclosure>
                <Link
                  href="/about-us"
                  className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold text-gray-900 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Company
                </Link>
                <Link
                  href="/contact-us"
                  className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold text-gray-900 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contact Us
                </Link>
              </div>
              <div className="py-6">
                <Link
                  href="https://forms.gle/BJXbXuQ3n2mwdHgx5"
                  target="_blank"
                >
                  <Button className="w-full bg-brandColor hover:bg-brandColorHover">
                    Request a Tool
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </div>
  );
}
