import React from "react";
import { LinkIcon, QrCodeIcon } from "@heroicons/react/20/solid";
import { CalculatorIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

const HServices = () => {
  return (
    <div className="bg-white py-24 sm:py-32 border-t border-gray-900/10">
      {/* Services/Tools */}
      <div className="max-w-[1280px] mx-auto px-2 lg:px-4">
        <div className="flex max-w-7xl items-center justify-center px-6 lg:px-8 gap-5 ">
          {/* Link Shortner */}
          <Link
            href="/tools/link-shortner"
            className="p-8 bg-white rounded-xl border border-gray-300 text-center flex flex-col items-center justify-center gap-1 w-[32%]"
          >
            <div className="border border-gray-300 rounded-xl p-3 mb-4">
              <LinkIcon className="size-5 text-gray-900" />
            </div>
            <h3 className="font-semibold">Link Shortner</h3>
            <p className="text-sm text-gray-500">
              Shorten your links for easy sharing
            </p>
          </Link>
          {/* Wi-Fi QR Code */}
          <Link
            href="/tools/wifi-qr"
            className="p-8 bg-white rounded-xl border border-gray-300 text-center flex flex-col items-center justify-center gap-1 w-[32%]"
          >
            <div className="border border-gray-300 rounded-xl p-3 mb-4">
              <QrCodeIcon className="size-5 text-gray-900" />
            </div>
            <h3 className="font-semibold">Wi-Fi QR Code</h3>
            <p className="text-sm text-gray-500">
              Generate QR codes for your Wi-Fi network
            </p>
          </Link>
          {/* Age Calculator */}
          <Link
            href="/tools/age-calculate"
            className="p-8 bg-white rounded-xl border border-gray-300 text-center flex flex-col items-center justify-center gap-1 w-[32%]"
          >
            <div className="border border-gray-300 rounded-xl p-3 mb-4">
              <CalculatorIcon className="size-5 text-gray-900" />
            </div>
            <h3 className="font-semibold">Age Calculator</h3>
            <p className="text-sm text-gray-500">
              Calculate your age in years, months, and days
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HServices;
