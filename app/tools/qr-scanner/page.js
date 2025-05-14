import QRScanner from "@/app/tools-compo/QRScanner";
import React from "react";
export const metadata = {
  title: "QR Scanner — ToolsTrek",
  keywords: ["qr", "scanner", "tools"],
  description: "Scan QR codes easily and quickly",
};

const page = () => {
  return (
    <div>
      <QRScanner></QRScanner>
    </div>
  );
};

export default page;
