import WifiQRGen from "@/app/(main)/tools-compo/WifiQRGen";
import React from "react";

export const metadata = {
  alternates: { canonical: "https://toolstrek.vercel.app/tools/wifi-qr" },
  title: "WiFi QR Code Generator",
  keywords: ["wifi", "qr", "code", "generator", "tools"],
  description: "Generate QR codes for WiFi access easily and quickly",
};

const page = () => {
  return (
    <div className="w-full mx-auto">
      <WifiQRGen></WifiQRGen>
    </div>
  );
};

export default page;
