import WifiQRGen from "@/app/tools-compo/WifiQRGen";
import React from "react";

export const metadata = {
  title: "WiFi QR Code Generator — ToolsTrek",
  keywords: ["wifi", "qr", "code", "generator", "tools"],
  description: "Generate QR codes for WiFi access easily and quickly",
};

const page = () => {
  return (
    <div className="md:max-w-[1200px] md:w-[1160px] mx-auto px-1 py-3">
      <WifiQRGen></WifiQRGen>
    </div>
  );
};

export default page;
