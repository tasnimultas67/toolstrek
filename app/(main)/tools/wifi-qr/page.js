import WifiQRGen from "@/app/(main)/tools-compo/WifiQRGen";
import React from "react";

export const metadata = {
  title: "WiFi QR Code Generator — ToolsTrek",
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
