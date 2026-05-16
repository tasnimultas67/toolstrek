"use client";

import {
  Copy,
  Download,
  Link2,
  Sparkles,
  QrCode,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import React, { useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import Link from "next/link";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ToolPageShell from "./ToolPageShell";

const ShortenerForm = () => {
  const [url, setUrl] = useState("");
  const [shortenedUrl, setShortenedUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const qrCodeRef = useRef(null);

  async function shortURL(e) {
    e.preventDefault();

    if (!url.trim()) {
      toast.error("Please enter a URL");
      return;
    }

    if (!url.match(/^https?:\/\//i)) {
      toast.error("Please include http:// or https://");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`,
      );

      if (response.ok) {
        const data = await response.text();
        setShortenedUrl(data);
        toast.success("URL shortened successfully!");
      } else {
        throw new Error("Failed to shorten URL");
      }
    } catch (error) {
      console.error("Error shortening URL:", error);
      toast.error("Failed to shorten URL. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleDownload = () => {
    if (!qrCodeRef.current) return;

    const padding = 10;
    const qrCanvas = qrCodeRef.current.querySelector("canvas");
    const qrSize = qrCanvas.width;
    const size = qrSize + padding * 2;

    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext("2d");

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, size, size);
    context.drawImage(qrCanvas, padding, padding, qrSize, qrSize);

    const filename =
      shortenedUrl.replace(/^https?:\/\//, "").replace(/\//g, "-") + ".png";
    const downloadUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename;
    link.click();
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!", {
      description: "Link is ready to share.",
    });
  };

  return (
    <ToolPageShell widthClassName="max-w-4xl">
      <div className="space-y-8 font-sans">
        {/* Header Section */}
        <div className="text-center space-y-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-2"
          >
            <Sparkles size={14} />
            <span>Fast & Secure</span>
          </motion.div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
            URL <span className="text-blue-600">Shortener</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Transform long links into powerful, shareable URLs and QR codes
          </p>
        </div>

        {/* Form Card */}
        <Card className="p-2 bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border-none">
          <form onSubmit={shortURL} className="flex flex-col md:flex-row gap-2">
            <div className="flex-grow relative">
              <input
                className="w-full h-16 pl-6 pr-4 bg-transparent border-none focus:ring-0 text-gray-700 dark:text-gray-200 font-bold placeholder:text-gray-400 placeholder:font-medium"
                type="url"
                placeholder="Paste your long link here..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading || !url.trim()}
              className="h-14 md:h-12 md:mt-2 md:mr-2 px-8 rounded-3xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all active:scale-95 shadow-lg shadow-blue-200 dark:shadow-none"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>Shorten Now</span>
                  <Link2 size={18} />
                </div>
              )}
            </Button>
          </form>
        </Card>

        {/* Results Section */}
        <AnimatePresence>
          {shortenedUrl && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="grid grid-cols-1 md:grid-cols-5 gap-6"
            >
              {/* Short Link Card */}
              <Card className="md:col-span-3 bg-white dark:bg-gray-900 rounded-[2rem] border-none shadow-xl p-8 flex flex-col justify-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
                  <CheckCircle2 size={160} />
                </div>

                <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest mb-6 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Success! Your Link is Ready
                </h3>

                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-between group">
                    <span className="text-lg font-bold text-gray-800 dark:text-white break-all">
                      {shortenedUrl}
                    </span>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => window.open(shortenedUrl, "_blank")}
                        className="rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600"
                      >
                        <ExternalLink size={18} />
                      </Button>
                    </div>
                  </div>

                  <Button
                    onClick={() => copyToClipboard(shortenedUrl)}
                    className="w-full h-14 rounded-2xl bg-gray-900 dark:bg-blue-600 hover:bg-black dark:hover:bg-blue-700 text-white font-bold flex items-center gap-2"
                  >
                    <Copy size={18} />
                    Copy Short Link
                  </Button>
                </div>
              </Card>

              {/* QR Card */}
              <Card className="md:col-span-2 bg-white dark:bg-gray-900 rounded-[2rem] border-none shadow-xl p-6 flex flex-col items-center">
                <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest mb-4 flex items-center gap-2">
                  <QrCode size={14} />
                  Visual QR Code
                </h3>

                <div
                  ref={qrCodeRef}
                  className="p-3 bg-white rounded-2xl border-4 border-gray-50 mb-4"
                >
                  <QRCodeCanvas
                    value={shortenedUrl}
                    size={160}
                    level="H"
                    includeMargin={false}
                    fgColor="#0f172a"
                  />
                </div>

                <Button
                  onClick={handleDownload}
                  variant="outline"
                  className="w-full h-12 rounded-xl border-gray-100 dark:border-gray-800 font-bold text-gray-600 dark:text-gray-300 flex items-center gap-2"
                >
                  <Download size={16} />
                  Download PNG
                </Button>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Meta */}
        {!shortenedUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-wrap justify-center gap-8 pt-4 opacity-50 grayscale"
          >
            <div className="flex items-center gap-2 font-bold text-gray-500">
              <CheckCircle2 size={16} /> <span>Instant Results</span>
            </div>
            <div className="flex items-center gap-2 font-bold text-gray-500">
              <QrCode size={16} /> <span>HQ QR Codes</span>
            </div>
            <div className="flex items-center gap-2 font-bold text-gray-500">
              <Link2 size={16} /> <span>Permanent Links</span>
            </div>
          </motion.div>
        )}
      </div>
    </ToolPageShell>
  );
};

export default ShortenerForm;
