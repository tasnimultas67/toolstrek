"use client";

import {
  Copy,
  Download,
  Link2,
  Sparkles,
  QrCode,
  CheckCircle2,
  ExternalLink,
  ArrowRight,
  Globe,
  Clock,
  Shield,
} from "lucide-react";
import React, { useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ToolPageShell from "./ToolPageShell";

const ShortenerForm = () => {
  const [url, setUrl] = useState("");
  const [shortenedUrl, setShortenedUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const qrCodeRef = useRef(null);

  async function shortURL(e) {
    e.preventDefault();

    if (!url.trim()) {
      toast.error("Please enter a URL", {
        description: "We need a link to shorten",
      });
      return;
    }

    if (!url.match(/^https?:\/\//i)) {
      toast.error("Invalid URL format", {
        description: "Please include http:// or https://",
      });
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
        toast.success("✨ URL shortened successfully!", {
          description: "Your short link is ready to share",
        });
      } else {
        throw new Error("Failed to shorten URL");
      }
    } catch (error) {
      console.error("Error shortening URL:", error);
      toast.error("Something went wrong", {
        description: "Please try again in a moment",
      });
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

    const gradient = context.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2,
    );
    gradient.addColorStop(0, "#ffffff");
    gradient.addColorStop(1, "#f8fafc");
    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);

    context.drawImage(qrCanvas, padding, padding, qrSize, qrSize);

    const filename =
      shortenedUrl.replace(/^https?:\/\//, "").replace(/\//g, "-") + ".png";
    const downloadUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename;
    link.click();

    toast.success("QR Code downloaded!");
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    toast.success("Copied to clipboard!", {
      description: "Link is ready to share",
    });
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      shortURL(e);
    }
  };

  return (
    <ToolPageShell widthClassName="max-w-5xl">
      <div className="space-y-10 font-sans">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider"
          >
            <Sparkles size={14} className="animate-pulse" />
            <span>Fast & Secure</span>
            <span className="w-1 h-1 bg-blue-300 rounded-full" />
            <span>Free</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tight leading-tight"
          >
            Shorten Your
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Long URLs
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-500 dark:text-gray-400 font-medium max-w-2xl mx-auto"
          >
            Transform long links into powerful, shareable URLs with custom QR
            codes
          </motion.p>
        </div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card
            className={`p-2 bg-white dark:bg-gray-900 rounded-[3rem] border-2 transition-all duration-300 shadow-2xl shadow-blue-500/5 hover:shadow-blue-500/10 ${
              isFocused
                ? "border-blue-500 dark:border-blue-400 shadow-blue-500/20"
                : "border-gray-100 dark:border-gray-800"
            }`}
          >
            <form
              onSubmit={shortURL}
              className="flex flex-col md:flex-row gap-2"
            >
              <div className="flex-grow relative">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                  <Globe
                    className={`h-5 w-5 transition-colors duration-300 ${
                      isFocused ? "text-blue-500" : "text-gray-400"
                    }`}
                  />
                </div>
                <input
                  className={`w-full h-16 pl-14 pr-4 bg-transparent border-none focus:ring-0 text-gray-700 dark:text-gray-200 font-medium placeholder:text-gray-400 placeholder:font-normal text-lg outline-none transition-all duration-300 ${
                    isFocused ? "text-blue-600 dark:text-blue-400" : ""
                  }`}
                  type="url"
                  placeholder="Paste your long link here..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  required
                  autoFocus
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading || !url.trim()}
                className="h-14 md:h-12 md:mt-1 md:mr-1 px-8 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold transition-all duration-300 active:scale-95 shadow-lg shadow-blue-500/30 dark:shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>Shorten Now</span>
                    <ArrowRight
                      size={18}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </div>
                )}
              </Button>
            </form>
          </Card>
        </motion.div>

        {/* Features Bar */}
        {!shortenedUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-6 md:gap-10 pt-2"
          >
            {[
              { icon: Clock, label: "Instant Results" },
              { icon: QrCode, label: "QR Codes" },
              { icon: Shield, label: "Permanent Links" },
              { icon: Link2, label: "Easy Sharing" },
            ].map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="flex items-center gap-2 text-gray-500 dark:text-gray-400 font-medium"
              >
                <div className="p-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20">
                  <item.icon
                    size={16}
                    className="text-blue-600 dark:text-blue-400"
                  />
                </div>
                <span className="text-sm">{item.label}</span>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Results Section */}
        <AnimatePresence mode="wait">
          {shortenedUrl && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-5 gap-6"
            >
              {/* Short Link Card */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="md:col-span-3"
              >
                <Card className="bg-white dark:bg-gray-900 rounded-[2.5rem] border-2 border-gray-100 dark:border-gray-800 shadow-2xl shadow-blue-500/5 p-8 h-full flex flex-col relative overflow-hidden">
                  {/* Decorative background */}
                  <div className="absolute top-0 right-0 p-8 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
                    <CheckCircle2 size={200} />
                  </div>

                  <div className="relative z-10 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-xs font-black uppercase text-green-600 dark:text-green-400 tracking-widest">
                          Success!
                        </span>
                      </div>
                      <div className="h-4 w-px bg-gray-200 dark:bg-gray-700" />
                      <span className="text-xs font-medium text-gray-400">
                        Your link is ready
                      </span>
                    </div>

                    <div className="space-y-4 flex-1">
                      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-lg font-bold text-gray-800 dark:text-white break-all">
                            {shortenedUrl}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => window.open(shortenedUrl, "_blank")}
                            className="rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 shrink-0"
                          >
                            <ExternalLink size={20} />
                          </Button>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button
                          onClick={() => copyToClipboard(shortenedUrl)}
                          className="flex-1 h-14 rounded-2xl bg-gray-900 dark:bg-blue-600 hover:bg-gray-800 dark:hover:bg-blue-700 text-white font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                        >
                          {isCopied ? (
                            <>
                              <CheckCircle2 size={18} />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy size={18} />
                              Copy Link
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setShortenedUrl("")}
                          className="h-14 px-6 rounded-2xl border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium"
                        >
                          New Link
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* QR Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="md:col-span-2"
              >
                <Card className="bg-white dark:bg-gray-900 rounded-[2.5rem] border-2 border-gray-100 dark:border-gray-800 shadow-2xl shadow-blue-500/5 p-8 h-full flex flex-col items-center">
                  <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest mb-4 flex items-center gap-2">
                    <QrCode size={14} className="text-blue-600" />
                    QR Code
                  </h3>

                  <div
                    ref={qrCodeRef}
                    className="p-4 bg-white rounded-2xl border-2 border-gray-100 dark:border-gray-800 shadow-lg mb-4"
                  >
                    <QRCodeCanvas
                      value={shortenedUrl}
                      size={180}
                      level="H"
                      includeMargin={false}
                      fgColor="#0f172a"
                    />
                  </div>

                  <p className="text-xs text-gray-400 text-center mb-4">
                    Scan to visit your shortened URL
                  </p>

                  <Button
                    onClick={handleDownload}
                    variant="outline"
                    className="w-full h-12 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 font-bold text-gray-600 dark:text-gray-300 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                  >
                    <Download size={16} />
                    Download PNG
                  </Button>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center pt-4"
        >
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Free • No registration required • Unlimited usage
          </p>
        </motion.div>
      </div>
    </ToolPageShell>
  );
};

export default ShortenerForm;
