"use client";
import { useState, useRef, useCallback } from "react";
import { BrowserQRCodeReader } from "@zxing/library";
import jsQR from "jsqr";
import Webcam from "react-webcam";
import { useDropzone } from "react-dropzone";
import { Camera, CameraIcon, Copy, Upload } from "lucide-react";
import { PhotoIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";

const QRScanner = () => {
  const [mode, setMode] = useState("upload"); // "camera" or "upload"
  const videoRef = useRef(null);
  const [result, setResult] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  // Try both decoders (ZXing and jsQR)
  const tryBothDecoders = async (canvas) => {
    setIsScanning(true);
    setResult("");

    // First try @zxing
    try {
      const codeReader = new BrowserQRCodeReader();
      const result = await codeReader.decodeFromCanvas(canvas);
      setIsScanning(false);
      return result.getText();
    } catch (err) {
      console.log("ZXing failed, trying jsQR...");
    }

    // Then try jsQR
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

  // Capture from camera
  const captureImage = useCallback(async () => {
    if (!videoRef.current) return;

    const imageSrc = videoRef.current.getScreenshot();
    const img = new Image();
    img.src = imageSrc;

    img.onload = async () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      const decodedText = await tryBothDecoders(canvas);
      setResult(decodedText || "No QR Code detected.");
    };
  }, []);

  // Handle file upload
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
    };
  };

  // Drag & drop functionality
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/*": [".png", ".jpg", ".jpeg"],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        handleFileUpload(acceptedFiles[0]);
      }
    },
    onDropRejected: () => {
      toast.error("File rejected", {
        description: "Please upload an image (PNG/JPG) under 5MB",
      });
    },
  });

  // Copy result to clipboard
  const copyToClipboard = (text) => {
    if (!text) return;

    navigator.clipboard.writeText(text);
    toast("Copied to clipboard", {
      description: "The QR code content is ready to be pasted",
      action: {
        label: "Open URL",
        onClick: () => {
          try {
            new URL(text); // Validate if it's a URL
            window.open(text, "_blank");
          } catch {
            toast.info("This is not a valid URL");
          }
        },
      },
    });
  };

  return (
    <div className="flex flex-col items-center p-6 min-h-screen bg-gray-100">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">QR Code Scanner</h2>

      {/* Mode Toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => {
            setMode("camera");
            setResult("");
            setUploadedFile(null);
          }}
          className={`px-6 py-3 rounded-md cursor-pointer transition flex items-center justify-center gap-2 text-sm ${
            mode === "camera"
              ? "bg-blue-600 text-white"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          <CameraIcon className="size-4" />
          Use Camera
        </button>
        <button
          onClick={() => {
            setMode("upload");
            setResult("");
          }}
          className={`px-6 py-3 rounded-md cursor-pointer transition flex items-center justify-center gap-2 text-sm ${
            mode === "upload"
              ? "bg-blue-600 text-white"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          <Upload className="size-4" />
          Upload Image
        </button>
      </div>

      {/* Camera Mode */}
      {mode === "camera" && (
        <div className="flex flex-col items-center">
          <Webcam
            ref={videoRef}
            screenshotFormat="image/png"
            className="w-full max-w-md border-2 border-gray-300 rounded-lg"
            videoConstraints={{
              facingMode: "environment",
              width: 1280,
              height: 720,
            }}
          />
          <button
            onClick={captureImage}
            disabled={isScanning}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md text-sm transition hover:bg-blue-700 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Camera className="size-4" />
            {isScanning ? "Scanning..." : "Capture & Scan"}
          </button>
        </div>
      )}

      {/* Upload Mode */}
      {mode === "upload" && (
        <div className="w-full max-w-md">
          <div
            {...getRootProps()}
            className="cursor-pointer flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white p-8 transition hover:border-gray-400"
          >
            <input {...getInputProps()} />
            <PhotoIcon className="size-12 text-gray-400 mb-3" />
            <p className="text-sm text-gray-600 text-center">
              Drag & drop an image here, or click to select
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Supports: PNG, JPG (max 5MB)
            </p>
          </div>

          {uploadedFile && (
            <div className="mt-4 flex justify-center">
              <img
                src={uploadedFile}
                alt="Uploaded QR Code"
                className="max-h-64 border rounded-lg"
              />
            </div>
          )}
        </div>
      )}

      {/* Scan Results */}
      {(result || isScanning) && (
        <div className="mt-8 w-full max-w-md">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              {isScanning ? "Scanning..." : "Scan Result"}
            </h3>

            {result ? (
              <div className="flex items-center gap-2">
                <div className="flex-1 truncate text-blue-600 font-medium">
                  {result}
                </div>
                <button
                  onClick={() => copyToClipboard(result)}
                  className="p-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition"
                  title="Copy to clipboard"
                >
                  <Copy className="size-4" />
                </button>
              </div>
            ) : isScanning ? (
              <div className="text-gray-500">Processing image...</div>
            ) : (
              <div className="text-gray-500">No QR code found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QRScanner;
