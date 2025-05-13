"use client";
import { useState, useRef, useCallback } from "react";
import { BrowserQRCodeReader } from "@zxing/library";
import Webcam from "react-webcam";
import { Copy, ImageUp, ImageUpIcon } from "lucide-react";

const QRScanner = () => {
  const [mode, setMode] = useState("upload"); // Mode toggle: "camera" or "upload"
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const [result, setResult] = useState("");

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
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const imgUrl = URL.createObjectURL(file);
      const codeReader = new BrowserQRCodeReader();

      try {
        const result = await codeReader.decodeFromImageUrl(imgUrl);
        setResult(result.getText());
      } catch (err) {
        setResult("QR Code not found.");
      }
    }
  };

  // Copy Result to Clipboard
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
          className={`px-6 py-3 font-medium rounded-lg shadow-lg transition 
            ${
              mode === "camera"
                ? "bg-blue-600 text-white"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
        >
          Use Camera
        </button>
        <button
          onClick={() => setMode("upload")}
          className={`px-6 py-3 font-medium rounded-lg shadow-lg transition 
            ${
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
          <div className="mt-6 w-80 h-80 border-2 border-gray-400 rounded-lg overflow-hidden">
            <Webcam
              ref={videoRef}
              screenshotFormat="image/png"
              className="w-full h-full"
            />
          </div>
          <button
            onClick={captureImage}
            className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-lg transition hover:bg-blue-700"
          >
            Capture & Scan
          </button>
        </>
      )}

      {/* Upload Mode */}
      {mode === "upload" && (
        <div className="mt-6">
          <label
            htmlFor="file-upload"
            className="cursor-pointer flex items-center gap-3 px-6 py-3 bg-gray-300 text-gray-700 rounded-lg shadow-lg transition hover:bg-gray-400"
          >
            <ImageUpIcon className="text-xl size-4" /> Upload QR Image
          </label>
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
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
            <Copy className="text-xl size-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default QRScanner;
