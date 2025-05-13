"use client";
import { useState, useRef, useCallback } from "react";
import { BrowserQRCodeReader } from "@zxing/library";
import Webcam from "react-webcam";
import { useDropzone } from "react-dropzone";
import { Copy } from "lucide-react";
import { PhotoIcon } from "@heroicons/react/24/outline";

const QRScanner = () => {
  const [mode, setMode] = useState("upload"); // Toggle mode between "camera" and "upload"
  const videoRef = useRef(null);
  const [result, setResult] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);

  // Function to capture from Camera
  const captureImage = useCallback(async () => {
    if (videoRef.current) {
      const imageSrc = videoRef.current.getScreenshot();
      const codeReader = new BrowserQRCodeReader();

      try {
        const decodedResult = await codeReader.decodeFromImageUrl(imageSrc);
        setResult(decodedResult.getText());
      } catch (err) {
        setResult("No QR Code detected.");
      }
    }
  }, []);

  // Function to process Uploaded QR Image
  const handleFileUpload = async (file) => {
    const imgUrl = URL.createObjectURL(file);
    setUploadedFile(imgUrl);
    const codeReader = new BrowserQRCodeReader();

    try {
      const result = await codeReader.decodeFromImageUrl(imgUrl);
      setResult(result.getText());
    } catch (err) {
      setResult("QR Code not found.");
    }
  };

  // Drag & Drop functionality with react-dropzone
  const { getRootProps, getInputProps } = useDropzone({
    accept: "image/*",
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        handleFileUpload(acceptedFiles[0]);
      }
    },
  });

  // Copy scanned result to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    alert("Copied to clipboard!");
  };

  return (
    <div className="flex flex-col items-center p-6 min-h-screen bg-gray-100">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">QR Code Scanner</h2>

      {/* Toggle Scanner Mode */}
      <div className="flex gap-4">
        <button
          onClick={() => setMode("camera")}
          className={`px-6 py-3 rounded-lg shadow-lg transition ${
            mode === "camera"
              ? "bg-blue-600 text-white"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          Use Camera
        </button>
        <button
          onClick={() => setMode("upload")}
          className={`px-6 py-3 rounded-lg shadow-lg transition ${
            mode === "upload"
              ? "bg-green-600 text-white"
              : "bg-green-500 text-white hover:bg-green-600"
          }`}
        >
          Upload Image
        </button>
      </div>

      {/* Camera Mode */}
      {mode === "camera" && (
        <>
          <Webcam
            ref={videoRef}
            screenshotFormat="image/png"
            className="mt-6 w-80 h-80 border-2 border-gray-400 rounded-lg"
          />
          <button
            onClick={captureImage}
            className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-lg transition hover:bg-blue-700"
          >
            Capture & Scan
          </button>
        </>
      )}

      {/* Upload Mode with Drag & Drop */}
      {mode === "upload" && (
        <div className="mt-6 w-full md:w-[500px]">
          <div
            {...getRootProps()}
            className="cursor-pointer flex flex-col items-center justify-center rounded-lg border-1 border-dashed border-gray-400 bg-white p-6  transition hover:border-gray-600"
          >
            <input {...getInputProps()} />
            <PhotoIcon className="size-12 text-gray-400" />
            <p className="mt-3 text-sm text-gray-600">
              Drag & drop an image here or click to upload
            </p>
            <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
          </div>
        </div>
      )}

      {/* Display Result with Copy Button */}
      {result && (
        <div className="mt-6 flex items-center gap-3 bg-white px-4 py-2 rounded-lg shadow-md">
          <p className="text-lg font-semibold text-gray-700">📌 {result}</p>
          <button
            onClick={copyToClipboard}
            className="p-2 bg-gray-300 text-gray-700 rounded-lg transition hover:bg-gray-400"
          >
            <Copy className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default QRScanner;
