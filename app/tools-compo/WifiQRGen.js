"use client";

import { useState } from "react";
import QRCode from "qrcode";
import { jsPDF } from "jspdf";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Copy, Download, Eye, EyeOff, QrCode, Palette } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import Image from "next/image";
import { motion } from "framer-motion";
import { HexColorPicker } from "react-colorful";

const WifiQRGen = () => {
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [encryption, setEncryption] = useState("WPA");
  const [qrCode, setQrCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passChecked, setPassUnChecked] = useState(true);
  const [qrColor, setQrColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [showQrColorPicker, setShowQrColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);

  // Helper function to escape special characters
  const escapeSpecialChars = (str) => {
    return str
      .replace(/\\/g, "\\\\") // escape backslashes first
      .replace(/;/g, "\\;") // escape semicolons
      .replace(/"/g, '\\"') // escape quotes
      .replace(/,/g, "\\,") // escape commas
      .replace(/:/g, "\\:"); // escape colons
  };

  // Generate the QR code
  const generateQRCode = async () => {
    if (!ssid.trim()) {
      alert("Please enter a WiFi name (SSID)");
      return;
    }

    let formattedEncryption = encryption;
    let finalPassword = password;

    if (encryption === "nopass") {
      formattedEncryption = "nopass";
      finalPassword = "";
    }

    const wifiDetails = `WIFI:T:${formattedEncryption};S:${escapeSpecialChars(
      ssid,
    )}${finalPassword ? `;P:${escapeSpecialChars(finalPassword)}` : ""};`;

    try {
      const qr = await QRCode.toDataURL(wifiDetails, {
        width: 500,
        margin: 1,
        errorCorrectionLevel: "H",
        type: "image/png",
        color: {
          dark: qrColor,
          light: bgColor,
        },
      });
      setQrCode(qr);
    } catch (error) {
      console.error("Error generating QR code", error);
      alert("Error generating QR code. Please try again.");
    }
  };

  // Download the QR code image
  const downloadQRCode = () => {
    if (!qrCode) return;
    const link = document.createElement("a");
    link.href = qrCode;
    link.download = `${ssid || "wifi"}_qr_code.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate the PDF template
  const generatePDF = () => {
    if (!qrCode || !ssid) return;

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const wifiIcon = "/WIFI-ICON.png";

    doc.addImage(wifiIcon, "PNG", (pageWidth - 40) / 2, 50, 40, 40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(38);
    doc.text("Connect to WiFi", pageWidth / 2, 100, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Network Name: ${ssid}`, pageWidth / 2, 113, { align: "center" });

    if (passChecked && password) {
      doc.text(`Network Password: ${password}`, pageWidth / 2, 120, {
        align: "center",
      });
    }

    doc.addImage(qrCode, "PNG", (pageWidth - 75) / 2, 125, 75, 75);
    doc.setFontSize(14);
    doc.text("Scan to connect!", pageWidth / 2, 205, { align: "center" });

    const dateYear = new Date().getFullYear();
    doc.setFontSize(8);
    doc.text(
      `© ${dateYear} | Generated at TinyWaveQR, Developed by Tasnimul Haque`,
      pageWidth / 2,
      290,
      {
        align: "center",
      },
    );

    doc.save(`${ssid || "wifi"}_qr_template.pdf`);
  };

  return (
    <div className="w-full mx-auto">
      <div className="flex flex-col lg:flex-row justify-between mx-auto p-5 bg-gray-50 rounded-lg mt-20 mb-10 border border-gray-200">
        <div className="w-full lg:w-2/3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              generateQRCode();
            }}
            className="space-y-4 w-full lg:w-2/3"
          >
            {/* SSID Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                WiFi Name/SSID <span className="text-red-700">*</span>
              </label>
              <input
                className="p-2 border border-gray-300 rounded-md text-sm w-full bg-white mt-1.5"
                type="text"
                value={ssid}
                placeholder="Enter your WiFi name"
                onChange={(e) => setSsid(e.target.value)}
                required
              />
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">
                  WiFi Password{" "}
                  {encryption !== "nopass" && (
                    <span className="text-red-700">*</span>
                  )}
                </label>
                {encryption !== "nopass" && (
                  <button
                    type="button"
                    className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                    {showPassword ? "Hide" : "Show"}
                  </button>
                )}
              </div>
              <input
                className="p-2 border border-gray-300 rounded-md text-sm w-full bg-white mt-1.5"
                type={showPassword ? "text" : "password"}
                value={password}
                placeholder={
                  encryption === "nopass"
                    ? "No password needed"
                    : "Enter your WiFi password"
                }
                onChange={(e) => setPassword(e.target.value)}
                disabled={encryption === "nopass"}
                required={encryption !== "nopass"}
              />
            </div>

            {/* Encryption Type Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Encryption Type:</label>
              <Select
                value={encryption}
                onValueChange={(value) => {
                  setEncryption(value);
                  if (value === "nopass") {
                    setPassword("");
                  }
                }}
              >
                <SelectTrigger className="w-[180px] bg-white">
                  <SelectValue placeholder="Select encryption" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WPA">WPA/WPA2</SelectItem>
                  <SelectItem value="WEP">WEP</SelectItem>
                  <SelectItem value="nopass">No Password</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* QR Code Color Picker */}
            <div className="space-y-2">
              <label className="text-sm font-medium">QR Code Colors:</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <button
                    type="button"
                    className="flex items-center gap-2 p-2 border border-gray-300 rounded-md text-xs w-full bg-white"
                    onClick={() => {
                      setShowQrColorPicker(!showQrColorPicker);
                      setShowBgColorPicker(false);
                    }}
                  >
                    <Palette className="size-4" />
                    <span>QR Color</span>
                    <div
                      className="w-4 h-4 rounded-full border border-gray-300"
                      style={{ backgroundColor: qrColor }}
                    />
                  </button>
                  {showQrColorPicker && (
                    <div className="absolute z-10 mt-1 w-full md:w-96">
                      <HexColorPicker
                        color={qrColor}
                        onChange={setQrColor}
                        className="!w-full"
                      />
                      <div className="flex items-center gap-2 p-2 bg-white border border-t-0 border-gray-300 rounded-b-md">
                        <input
                          type="text"
                          value={qrColor}
                          onChange={(e) => setQrColor(e.target.value)}
                          className="text-xs p-1 border border-gray-300 rounded w-full"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <button
                    type="button"
                    className="flex items-center gap-2 p-2 border border-gray-300 rounded-md text-xs w-full bg-white"
                    onClick={() => {
                      setShowBgColorPicker(!showBgColorPicker);
                      setShowQrColorPicker(false);
                    }}
                  >
                    <Palette className="size-4" />
                    <span>Background</span>
                    <div
                      className="w-4 h-4 rounded-full border border-gray-300"
                      style={{ backgroundColor: bgColor }}
                    />
                  </button>
                  {showBgColorPicker && (
                    <div className="absolute z-10 mt-1 w-full md:w-96">
                      <HexColorPicker
                        color={bgColor}
                        onChange={setBgColor}
                        className="!w-full"
                      />
                      <div className="flex items-center gap-2 p-2 bg-white border border-t-0 border-gray-300 rounded-b-md">
                        <input
                          type="text"
                          value={bgColor}
                          onChange={(e) => setBgColor(e.target.value)}
                          className="text-xs p-1 border border-gray-300 rounded w-full"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Generate QR Code Button */}
            <button
              className={`bg-brandColor text-white px-3 py-1.5 rounded-md text-sm flex items-center justify-center gap-2 hover:bg-brandColorHover cursor-pointer transition-all ${
                (!password && encryption !== "nopass") || !ssid
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              type="submit"
              disabled={(!password && encryption !== "nopass") || !ssid}
            >
              <QrCode className="size-4" />
              Generate QR Code
            </button>
          </form>
        </div>

        {/* QR Code Preview & Buttons */}
        <div className="w-full lg:w-1/3 flex flex-col items-center lg:items-end justify-center mt-6 lg:mt-0">
          {!qrCode ? (
            <div className="w-full max-w-[250px] h-[300px] flex items-center justify-center border border-dashed border-gray-300 rounded-xl bg-gray-50">
              <p className="text-sm text-gray-500 text-center">
                Your WiFi QR Code will appear here after generation
              </p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-[250px]"
            >
              <div
                className="p-4 flex flex-col items-center justify-start border border-gray-300 rounded-xl"
                style={{ backgroundColor: bgColor }}
              >
                <img
                  src={qrCode}
                  alt="WiFi QR Code"
                  className="m-2 w-[200px] h-[200px]"
                />
                <button
                  className="flex items-center justify-center gap-2 text-xs bg-brandColor hover:bg-brandColorHover transition-all text-white px-4 py-2 rounded-md w-full cursor-pointer mt-2"
                  onClick={downloadQRCode}
                >
                  <Download className="size-4" />
                  Download QR Code
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* PDF Template Download section */}
      {qrCode && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="w-11/12 lg:w-10/12 mx-auto p-3 bg-gray-50 rounded-lg mt-5 border border-gray-200 flex flex-col lg:flex-row items-center justify-between"
        >
          <div className="w-full lg:w-1/2 flex items-center gap-4 mb-4 lg:mb-0">
            <Image
              src="/wifi_qr_template.jpg"
              alt="WiFi QR Template Demo"
              width={50}
              height={50}
              className="border border-gray-300 rounded-sm -rotate-6"
            />
            <h3 className="text-base text-left font-semibold md:text-xl bg-linear-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
              Download the PDF template to print or share your WiFi QR code.
            </h3>
          </div>

          <div className="w-full lg:w-1/2 flex flex-col lg:flex-row items-center justify-end gap-3">
            {password && (
              <div className="flex items-center space-x-2 text-xs w-full lg:w-auto justify-between lg:justify-start">
                <label htmlFor="show-password">Show password on PDF:</label>
                <Switch
                  id="show-password"
                  checked={passChecked}
                  onCheckedChange={() => setPassUnChecked(!passChecked)}
                />
              </div>
            )}

            <button
              className="flex items-center justify-center gap-2 text-xs bg-brandColor hover:bg-brandColorHover transition-all text-white px-4 py-2 rounded-md w-full lg:w-auto cursor-pointer"
              onClick={generatePDF}
            >
              <Copy className="size-4" />
              Download PDF Template
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default WifiQRGen;
