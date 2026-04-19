"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  Upload,
  Download,
  Loader2,
  Trash2,
  CheckCircle2,
  Archive,
  Sparkles,
} from "lucide-react";
import JSZip from "jszip";

const PdfToImage = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pdfjs, setPdfjs] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const initPdf = async () => {
      try {
        const pdfjsLib = await import("pdfjs-dist/build/pdf.min.mjs");
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
        setPdfjs(pdfjsLib);
      } catch (error) {
        console.error("Initialization error:", error);
      }
    };
    initPdf();
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !pdfjs) return;

    setLoading(true);
    setImages([]);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjs.getDocument({
        data: new Uint8Array(arrayBuffer),
      });
      const pdf = await loadingTask.promise;
      const imgUrls = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);

        // QUALITY FIX: Scale 3.5 provides "Retina" level clarity
        const scale = 3.5;
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        // Ensuring high-quality rendering
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = "high";

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport }).promise;
        imgUrls.push(canvas.toDataURL("image/png", 1.0));
      }

      setImages(imgUrls);
    } catch (error) {
      alert("Error processing PDF. Please try a different file.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (images.length === 1) {
      const link = document.createElement("a");
      link.href = images[0];
      link.download = `ToolsTrek_Image.png`;
      link.click();
    } else {
      const zip = new JSZip();
      const folder = zip.folder("ToolsTrek_Converted_Images");

      images.forEach((url, index) => {
        const base64Data = url.split(",")[1];
        folder.file(`page-${index + 1}.png`, base64Data, { base64: true });
      });

      const content = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = "ToolsTrek_All_Pages.zip";
      link.click();
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden transition-all">
        {/* EYE-CATCHING HEADER */}
        <div className="p-10 text-center border-b border-gray-50 dark:border-gray-800 bg-gradient-to-b from-brandColor/5 to-transparent">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brandColor/10 text-brandColor text-sm font-bold mb-4">
            <Sparkles size={16} />
            <span>Magic Conversion</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
            Turn PDFs into{" "}
            <span className="text-brandColor">Crystal Clear</span> Images
          </h2>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Stop dealing with blurry screenshots. Convert any PDF to
            high-definition 4K images instantly. No uploads, no servers—just
            pure privacy.
          </p>
        </div>

        <div className="p-8 md:p-12">
          {!images.length ? (
            <div
              onClick={() => fileInputRef.current.click()}
              className="group cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-[2rem] py-24 px-6 transition-all hover:border-brandColor hover:bg-brandColor/[0.02] dark:hover:bg-brandColor/[0.05]"
            >
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="hidden"
                ref={fileInputRef}
              />
              <div className="w-24 h-24 bg-brandColor text-white rounded-3xl flex items-center justify-center mb-6 rotate-3 group-hover:rotate-0 group-hover:scale-110 transition-all duration-500 shadow-xl shadow-brandColor/30">
                {loading ? (
                  <Loader2 className="animate-spin" size={40} />
                ) : (
                  <Upload size={40} />
                )}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {loading ? "Magic in progress..." : "Drop your PDF here"}
              </h3>
              <p className="text-gray-400 font-medium">
                Click to browse your files
              </p>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-12 p-6 bg-brandColor/[0.03] dark:bg-brandColor/[0.08] rounded-[2rem] border border-brandColor/10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/20">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-lg leading-none">
                    Conversion Complete!
                  </h4>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                    {images.length} High-Res pages ready.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setImages([])}
                  className="flex-1 sm:flex-none p-4 text-gray-400 hover:text-red-500 transition-colors"
                  title="Remove all"
                >
                  <Trash2 size={24} />
                </button>
                <button
                  onClick={handleDownload}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-3 bg-brandColor text-white px-8 py-4 rounded-2xl font-bold shadow-2xl shadow-brandColor/30 hover:translate-y-[-2px] active:translate-y-[0px] transition-all"
                >
                  {images.length > 1 ? (
                    <Archive size={20} />
                  ) : (
                    <Download size={20} />
                  )}
                  <span>
                    {images.length > 1
                      ? "Download Everything (ZIP)"
                      : "Save High-Res Image"}
                  </span>
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {images.map((url, index) => (
              <div key={index} className="group flex flex-col">
                <div className="relative aspect-[3/4] overflow-hidden rounded-[1.5rem] bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm group-hover:shadow-2xl transition-all duration-500">
                  <img
                    src={url}
                    alt={`Page ${index + 1}`}
                    className="w-full h-full object-contain"
                  />

                  {/* Single Download Action */}
                  <div className="absolute inset-0 bg-gray-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                    <button
                      onClick={() => {
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `Page-${index + 1}.png`;
                        a.click();
                      }}
                      className="bg-white text-gray-900 px-6 py-3 rounded-xl font-bold shadow-2xl hover:scale-105 transition-transform"
                    >
                      Download Page
                    </button>
                  </div>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-[10px] font-black tracking-[0.2em] text-gray-400">
                    P. {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="h-[1px] flex-1 bg-gray-100 dark:bg-gray-800 mx-4" />
                  <span className="text-[10px] font-bold text-brandColor">
                    4K UHD
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfToImage;
