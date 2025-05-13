"use client";
import { useState, useRef, useCallback } from "react";
import { BrowserQRCodeReader } from "@zxing/library";
import Webcam from "react-webcam";

const QRScanner = () => {
  const [mode, setMode] = useState("camera"); // Mode toggle: "camera" or "upload"
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

  return (
    <div className="flex flex-col items-center p-4">
      <h2 className="text-2xl font-bold">QR Code Scanner</h2>

      {/* Toggle Scanner Mode */}
      <div className="flex gap-4 mt-4">
        <button
          onClick={() => setMode("camera")}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Use Camera
        </button>
        <button
          onClick={() => setMode("upload")}
          className="px-4 py-2 bg-green-500 text-white rounded"
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
            className="w-80 h-80 border border-gray-500 mt-4"
          />
          <button
            onClick={captureImage}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
          >
            Capture & Scan
          </button>
        </>
      )}

      {/* Upload Mode */}
      {mode === "upload" && (
        <>
          <input
            type="file"
            accept="image/*"
            className="mt-4 border p-2"
            onChange={handleFileUpload}
          />
        </>
      )}

      {/* Display Result */}
      <p className="mt-4 text-lg font-bold">Result: {result}</p>
    </div>
  );
};

export default QRScanner;
