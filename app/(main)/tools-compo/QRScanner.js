"use client";
import { useState, useRef, useCallback } from "react";
import { BrowserQRCodeReader } from "@zxing/library";
import jsQR from "jsqr";
import Webcam from "react-webcam";
import { useDropzone } from "react-dropzone";
import {
  Camera,
  CameraIcon,
  Copy,
  Upload,
  QrCode,
  Scan,
  XCircle,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { PhotoIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ToolPageShell from "./ToolPageShell";
import { cn } from "@/lib/utils";

const QRScanner = () => {
  const [mode, setMode] = useState("camera"); // Default to camera for better UX
  const videoRef = useRef(null);
  const [result, setResult] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  const tryBothDecoders = async (canvas) => {
    setIsScanning(true);
    setResult("");

    try {
      const codeReader = new BrowserQRCodeReader();
      const result = await codeReader.decodeFromCanvas(canvas);
      setIsScanning(false);
      return result.getText();
    } catch (err) {
      console.log("ZXing failed, trying jsQR...");
    }

    try {
      const imageData = canvas
        .getContext("2d")
        .getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      setIsScanning(false);
      return code ? code.data : null;
    } catch (err) {
      setIsScanning(false);
      return null;
    }
  };

  const captureImage = useCallback(async () => {
    if (!videoRef.current) return;

    const imageSrc = videoRef.current.getScreenshot();
    if (!imageSrc) return;

    const img = new Image();
    img.src = imageSrc;

    img.onload = async () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      const decodedText = await tryBothDecoders(canvas);
      if (decodedText) {
        setResult(decodedText);
        toast.success("QR Code detected!");
      } else {
        setResult("No QR Code detected.");
        toast.error("Scan failed", {
          description: "Try a clearer angle or better lighting.",
        });
      }
    };
  }, []);

  const handleFileUpload = async (file) => {
    const imgUrl = URL.createObjectURL(file);
    setUploadedFile(imgUrl);

    const img = new Image();
    img.src = imgUrl;

    img.onload = async () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      const decodedText = await tryBothDecoders(canvas);
      setResult(decodedText || "QR Code not found.");
      if (decodedText) toast.success("File scanned successfully!");
    };
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [".png", ".jpg", ".jpeg"] },
    maxSize: 5 * 1024 * 1024,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) handleFileUpload(acceptedFiles[0]);
    },
  });

  const copyToClipboard = (text) => {
    if (!text || text.includes("not found") || text.includes("detected"))
      return;
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const isUrl = (text) => {
    try {
      new URL(text);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <ToolPageShell widthClassName="max-w-4xl">
      <div className="space-y-8 font-sans">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
            QR Code <span className="text-blue-600">Scanner</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Instantly decode any QR code using your camera or an image file
          </p>
        </div>

        {/* Mode Toggle Buttons */}
        <div className="flex justify-center gap-4 p-1.5 bg-gray-200/50 dark:bg-gray-900 w-fit mx-auto rounded-2xl backdrop-blur-sm">
          <Button
            onClick={() => {
              setMode("camera");
              setResult("");
              setUploadedFile(null);
            }}
            className={cn(
              "rounded-xl px-6 font-bold transition-all",
              mode === "camera"
                ? "bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-sm"
                : "bg-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300",
            )}
            variant={mode === "camera" ? "default" : "ghost"}
          >
            <CameraIcon className="mr-2 size-4" /> Camera
          </Button>
          <Button
            onClick={() => {
              setMode("upload");
              setResult("");
            }}
            className={cn(
              "rounded-xl px-6 font-bold transition-all",
              mode === "upload"
                ? "bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-sm"
                : "bg-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300",
            )}
            variant={mode === "upload" ? "default" : "ghost"}
          >
            <Upload className="mr-2 size-4" /> Upload
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Main Interaction Area */}
          <Card className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border-none overflow-hidden">
            <div className="p-8">
              {mode === "camera" ? (
                <div className="space-y-6">
                  <div className="relative aspect-video rounded-3xl overflow-hidden border-4 border-gray-50 dark:border-gray-800 bg-black">
                    <Webcam
                      ref={videoRef}
                      screenshotFormat="image/png"
                      className="w-full h-full object-cover"
                      videoConstraints={{ facingMode: "environment" }}
                    />
                    {/* Scanning Animation Overlay */}
                    <div className="absolute inset-0 pointer-events-none border-40 border-black/20">
                      <motion.div
                        animate={{ top: ["10%", "90%", "10%"] }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="absolute left-0 right-0 h-1 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)] z-10"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={captureImage}
                    disabled={isScanning}
                    className="w-full h-14 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-xl shadow-blue-100 dark:shadow-none transition-all active:scale-95"
                  >
                    {isScanning ? (
                      <span className="animate-pulse">Analyzing...</span>
                    ) : (
                      "Scan QR Code"
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div
                    {...getRootProps()}
                    className={cn(
                      "cursor-pointer flex flex-col items-center justify-center rounded-3xl border-2 border-dashed p-12 transition-all min-h-62.5",
                      isDragActive
                        ? "border-blue-500 bg-blue-50/50"
                        : "border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30",
                    )}
                  >
                    <input {...getInputProps()} />
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm mb-4">
                      <PhotoIcon className="size-8 text-blue-500" />
                    </div>
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
                      {isDragActive
                        ? "Drop the image here"
                        : "Click or drag QR image"}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      PNG, JPG up to 5MB
                    </p>
                  </div>

                  {uploadedFile && (
                    <div className="relative group rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
                      <img
                        src={uploadedFile}
                        alt="Preview"
                        className="w-full max-h-48 object-contain bg-white dark:bg-black"
                      />
                      <button
                        onClick={() => setUploadedFile(null)}
                        className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black"
                      >
                        <XCircle size={20} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Results Side */}
          <div className="space-y-6">
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Card className="bg-white dark:bg-gray-900 rounded-3xl border-none shadow-2xl p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                      <QrCode size={120} />
                    </div>

                    <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest mb-6">
                      Scan Result
                    </h3>

                    <div
                      className={cn(
                        "p-6 rounded-2xl mb-6 break-all font-bold text-lg",
                        result.includes("not")
                          ? "bg-red-50 text-red-500 border border-red-100"
                          : "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-800",
                      )}
                    >
                      {result}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        variant="outline"
                        onClick={() => copyToClipboard(result)}
                        className="h-12 rounded-xl border-gray-100 dark:border-gray-800 font-bold"
                        disabled={result.includes("not")}
                      >
                        <Copy className="mr-2 size-4" /> Copy
                      </Button>
                      {isUrl(result) && (
                        <Button
                          onClick={() => window.open(result, "_blank")}
                          className="h-12 rounded-xl bg-gray-900 dark:bg-blue-600 hover:bg-black text-white font-bold"
                        >
                          <ExternalLink className="mr-2 size-4" /> Open Link
                        </Button>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full min-h-75 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-[2.5rem]"
                >
                  <div className="w-16 h-16 bg-gray-50 dark:bg-gray-900 rounded-2xl flex items-center justify-center mb-4 text-gray-300">
                    <Scan size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-400">
                    Ready to Scan
                  </h3>
                  <p className="text-sm text-gray-400 max-w-50 mt-1">
                    Information will appear here once a code is detected.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quick Tips */}
            <Card className="p-6 bg-linear-to-br from-indigo-600 to-blue-700 rounded-3xl border-none text-white shadow-xl">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Pro Tip</h4>
                  <p className="text-xs text-white/80 mt-1 leading-relaxed">
                    For best results, ensure the QR code is well-lit and fits
                    within the camera frame.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </ToolPageShell>
  );
};

export default QRScanner;
