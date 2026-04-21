"use client";
import React, { useState } from "react";
import { PDFDocument, PDFName, PDFRawStream } from "pdf-lib";

export default function PDFCompressor() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | processing | completed
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [stats, setStats] = useState({ original: 0, compressed: 0 });

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
      setStats({
        original: (e.target.files[0].size / 1024 / 1024).toFixed(2),
        compressed: 0,
      });
      setStatus("idle");
      setDownloadUrl(null);
    }
  };

  // Helper: Aggressively shrink images via Canvas
  const shrinkImage = async (imageBytes) => {
    return new Promise((resolve) => {
      const img = new Image();
      const blob = new Blob([imageBytes]);
      img.src = URL.createObjectURL(blob);

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Strategy: Reduce dimensions by 50% (75% reduction in total pixels)
        const scaleFactor = 0.5;
        canvas.width = img.width * scaleFactor;
        canvas.height = img.height * scaleFactor;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Quality 0.3 is the "Sweet Spot" for heavy compression without total blurring
        canvas.toBlob(
          (resultBlob) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(new Uint8Array(reader.result));
            reader.readAsArrayBuffer(resultBlob);
          },
          "image/jpeg",
          0.3,
        );
      };
      img.onerror = () => resolve(imageBytes); // Fallback to original if corrupt
    });
  };

  const runEngine = async () => {
    if (!file) return;
    setStatus("processing");
    setProgress(10);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();

      // Map to keep track of already compressed image references
      // (Prevents the "Duplicate Resource" bug where file size grows)
      const processedImages = new Map();

      for (let i = 0; i < pages.length; i++) {
        setProgress(Math.round(10 + (i / pages.length) * 80));
        const page = pages[i];
        const resources = page.node.get(PDFName.of("Resources"));
        if (!resources) continue;

        const xObjects = resources.get(PDFName.of("XObject"));
        if (!xObjects) continue;

        const xObjectMap = xObjects.dict;
        for (const [name, ref] of xObjectMap) {
          const obj = pdfDoc.context.lookup(ref);

          if (
            obj instanceof PDFRawStream &&
            obj.dict.get(PDFName.of("Subtype")) === PDFName.of("Image")
          ) {
            // Check if we already handled this specific image object
            if (processedImages.has(ref)) {
              xObjectMap.set(name, processedImages.get(ref));
              continue;
            }

            const compressedBytes = await shrinkImage(obj.contents);
            const newImage = await pdfDoc.embedJpg(compressedBytes);

            // Update the map and the page resource
            processedImages.set(ref, newImage.ref);
            xObjectMap.set(name, newImage.ref);
          }
        }
      }

      // Final Save: useObjectStreams is CRITICAL for file size
      const pdfBytes = await pdfDoc.save({
        useObjectStreams: true,
      });

      const compressedBlob = new Blob([pdfBytes], { type: "application/pdf" });
      setStats((prev) => ({
        ...prev,
        compressed: (compressedBlob.size / 1024 / 1024).toFixed(2),
      }));
      setDownloadUrl(URL.createObjectURL(compressedBlob));
      setProgress(100);
      setTimeout(() => setStatus("completed"), 500);
    } catch (err) {
      console.error(err);
      alert("Engine Error: " + err.message);
      setStatus("idle");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md border border-gray-200">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Aggressive PDF Compressor
        </h1>

        {status === "idle" && (
          <div className="space-y-4">
            <div
              onClick={() => document.getElementById("input").click()}
              className="border-4 border-dashed border-gray-200 p-10 rounded-2xl text-center cursor-pointer hover:bg-gray-50 transition"
            >
              <input
                id="input"
                type="file"
                className="hidden"
                accept="application/pdf"
                onChange={handleFileChange}
              />
              <p className="text-gray-500 font-medium">
                {file ? file.name : "Upload PDF"}
              </p>
              {file && (
                <p className="text-xs text-blue-500 mt-2">
                  {stats.original} MB
                </p>
              )}
            </div>
            <button
              onClick={runEngine}
              disabled={!file}
              className="w-full bg-black text-white py-4 rounded-xl font-bold hover:opacity-80 disabled:opacity-30"
            >
              COMPRESS NOW
            </button>
          </div>
        )}

        {status === "processing" && (
          <div className="text-center py-10">
            <div className="w-full bg-gray-200 h-3 rounded-full mb-4">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="font-bold text-blue-600 animate-pulse">
              REDUCING DPI... {progress}%
            </p>
          </div>
        )}

        {status === "completed" && (
          <div className="text-center space-y-6">
            <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
              <p className="text-green-800 font-bold text-lg">Success!</p>
              <div className="flex justify-between mt-4 text-sm font-mono">
                <span className="text-gray-400 line-through">
                  {stats.original}MB
                </span>
                <span className="text-green-600 font-black">
                  {stats.compressed}MB
                </span>
              </div>
            </div>
            <a
              href={downloadUrl}
              download={`shrunk_${file.name}`}
              className="block w-full bg-green-600 text-white py-4 rounded-xl font-bold text-center"
            >
              DOWNLOAD
            </a>
            <button
              onClick={() => setStatus("idle")}
              className="text-gray-400 text-sm underline"
            >
              Try another file
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
