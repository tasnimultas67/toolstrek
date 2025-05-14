"use client";

import { Copy, Download, Link2 } from "lucide-react";
import React, { useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import Link from "next/link";
import { toast } from "sonner";
import * as motion from "motion/react-client";

const ShortenerForm = () => {
  // State management
  const [url, setUrl] = useState("");
  const [shortenedUrl, setShortenedUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const qrCodeRef = useRef(null);

  async function shortURL(e) {
    e.preventDefault();

    // Validate URL input
    if (!url.trim()) {
      toast.error("Please enter a URL");
      return;
    }

    // Basic URL format validation
    if (!url.match(/^https?:\/\//i)) {
      toast.error("Please include http:// or https://");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`
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

  /**
   * Downloads the QR code as PNG with 10px white padding
   */
  const handleDownload = () => {
    if (!qrCodeRef.current) return;

    const padding = 10; // Exactly 10px padding as requested
    const qrCanvas = qrCodeRef.current.querySelector("canvas");
    const qrSize = qrCanvas.width;
    const size = qrSize + padding * 2;

    // Create download canvas
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext("2d");

    // White background with 10px padding
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, size, size);
    context.drawImage(qrCanvas, padding, padding, qrSize, qrSize);

    // Generate filename from shortened URL
    const filename =
      shortenedUrl.replace(/^https?:\/\//, "").replace(/\//g, "-") + ".png";

    // Trigger download
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
  };

  /**
   * Copies text to clipboard and shows feedback
   * @param {string} text - Text to copy
   */
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast("Copied to clipboard", {
      description: "The URL is ready to be pasted",
      action: {
        label: "Open URL",
        onClick: () => window.open(text, "_blank"),
      },
    });
  };

  return (
    <div className="w-full md:max-w-4xl mx-auto space-y-6 p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* URL Shortening Form */}
      <form
        onSubmit={shortURL}
        className="flex flex-col md:flex-row gap-3 w-full"
      >
        <div className="flex-grow relative">
          <input
            className="p-3 border border-gray-300 rounded-lg text-base w-full bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            type="url"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            pattern="https?://.+"
            title="Include http:// or https://"
          />
          <span className="absolute right-3 top-3 text-gray-400 text-sm">
            {isLoading ? "Shortening..." : ""}
          </span>
        </div>
        <button
          className="bg-brandColor hover:bg-brandColorHover text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed min-w-[130px] cursor-pointer"
          type="submit"
          disabled={isLoading || !url.trim()}
        >
          {isLoading ? (
            <span className="animate-pulse">Processing...</span>
          ) : (
            <>
              Shorten <Link2 className="size-4" />
            </>
          )}
        </button>
      </form>

      {/* Results Section */}
      {shortenedUrl && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-gray-50 rounded-lg p-4 border border-gray-200"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Shortened URL Card */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-gray-700 mb-2">
                <span className="text-green-600">Shortened URL</span>
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(shortenedUrl)}
                  className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-colors"
                  aria-label="Copy shortened URL"
                >
                  <Copy className="size-4" />
                </button>
                <Link
                  href={shortenedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-800 break-all underline"
                >
                  {shortenedUrl}
                </Link>
              </div>
            </div>

            {/* QR Code Card with 10px Padding */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-col items-center">
              <div
                ref={qrCodeRef}
                className="mb-3 bg-white rounded-md"
                style={{
                  padding: "10px",
                  display: "inline-block",
                }}
              >
                <QRCodeCanvas
                  value={shortenedUrl}
                  size={250}
                  level="H"
                  includeMargin={false}
                  fgColor="#000000"
                />
              </div>
              <button
                onClick={handleDownload}
                className="w-full bg-brandColor hover:bg-brandColorHover text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
              >
                <Download className="size-4" />
                Download QR Code
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Help Text */}
      <div className="text-sm text-gray-500 text-center">
        <p>Shorten any valid URL and generate a QR code for easy sharing</p>
      </div>
    </div>
  );
};

export default ShortenerForm;
