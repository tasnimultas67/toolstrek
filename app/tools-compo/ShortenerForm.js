"use client";
import { Copy, Download, Link2 } from "lucide-react";
import React, { useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import Link from "next/link";
import { toast } from "sonner";
import * as motion from "motion/react-client";

const ShortenerForm = () => {
  const [url, setUrl] = useState("");
  const [shortenedUrl, setShortenedUrl] = useState("");
  const qrCodeRef = useRef(null);

  async function shortURL(e) {
    e.preventDefault();
    const response = await fetch(
      `https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`
    );
    if (response.ok) {
      const data = await response.text();
      setShortenedUrl(data);
    } else {
      alert("Error shortening URL");
    }
  }

  const handleDownload = () => {
    const padding = 10; // Padding size in pixels
    const qrCanvas = qrCodeRef.current.querySelector("canvas");
    const qrSize = qrCanvas.width;
    const size = qrSize + padding * 2; // Total size including padding

    // Create a new canvas for the download with padding
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext("2d");

    // Fill the background with white (optional)
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, size, size);

    // Draw the QR code with padding
    context.drawImage(qrCanvas, padding, padding, qrSize, qrSize);

    // Generate the image data URL
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    link.download = `${shortenedUrl.replace(/https?:\/\//, "")}.png`; // Set file name to shortened URL without protocol
    link.click();
  };

  return (
    <div className="w-full space-y-5 p-5 bg-gray-50 rounded-md">
      {/* Form */}
      <form
        onSubmit={shortURL}
        className="flex justify-center items-center w-full flex-col md:flex-row gap-2"
      >
        <input
          className="p-2 border border-gray-300 rounded-md text-sm w-full bg-white"
          type="text"
          placeholder="Enter URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button
          className="bg-blue-500 hover:bg-blue-800 text-white px-4 py-2 rounded-md ml-2 flex items-center justify-center gap-1 text-sm"
          type="submit"
        >
          Shorten <Link2 className="size-4" />
        </button>
      </form>
      {shortenedUrl && (
        <div className="bg-gray-50 mt-4 rounded-md w-full flex items-start justify-start justify-self-stretch gap-4">
          <div className=" space-y-3 w-full">
            {/* Original URL */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut", delay: 0.2 }}
              className="bg-white p-3 rounded-md shadow-xl text-sm space-y-2 w-full"
            >
              <p className="font-semibold">Original URL:</p>
              <div>
                <Link
                  href={url}
                  target="_blank"
                  className="text-blue-600 break-all"
                >
                  {url}
                </Link>
              </div>
            </motion.div>
            {/* Shorten URL */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeInOut", delay: 0.2 }}
              className="bg-white p-3 rounded-md shadow-xl space-y-2 text-sm"
            >
              <p className="font-semibold">Shortened URL:</p>
              <div className="flex items-center justify-start gap-2 p-1 bg-blue-100 rounded-lg">
                <button
                  title="Copy to clipboard"
                  className="bg-blue-500 hover:bg-blue-800 text-white p-2 rounded-md shadow cursor-pointer"
                  onClick={() => {
                    navigator.clipboard.writeText(shortenedUrl);
                    // alert("Copied to clipboard");
                    toast("Copied to clipboad", {
                      description:
                        "Success! Your content has been copied to the clipboard",
                      action: {
                        label: "Undo",
                        onClick: () => console.log("Undo"),
                      },
                    });
                  }}
                >
                  <Copy className="size-3 text-white"></Copy>
                </button>
                <div>
                  <Link
                    href={shortenedUrl}
                    target="_blank"
                    className="text-blue-600"
                  >
                    {shortenedUrl}
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
          {/* QR Code */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut", delay: 0.2 }}
            className="space-y-2 p-3 bg-white rounded-lg shadow-xl w-fit ml-auto mr-0 "
          >
            <div
              title="Shortened URL QR Code"
              ref={qrCodeRef}
              className="bg-white p-2 rounded border border-gray-300"
            >
              <QRCodeCanvas value={shortenedUrl} size={200} level="H" />{" "}
              {/* Display size */}
            </div>
            <button
              className="flex items-center justify-center gap-2 text-xs bg-blue-500 hover:bg-blue-800 transition-all text-white px-4 py-2 rounded-md w-full"
              onClick={handleDownload}
            >
              <Download className="size-4"></Download> QR Code
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ShortenerForm;
