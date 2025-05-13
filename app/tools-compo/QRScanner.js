"use client";
import { useState, useRef, useCallback } from "react";
import { BrowserQRCodeReader } from "@zxing/library";
import Webcam from "react-webcam";
import { useDropzone } from "react-dropzone";
import { Camera, CameraIcon, Copy, Upload } from "lucide-react";
import { PhotoIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";

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

  // Function to copy the result to clipboard
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
    <div className="flex flex-col items-center p-6 min-h-screen bg-gray-100">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">QR Code Scanner</h2>

      {/* Toggle Scanner Mode */}
      <div className="flex gap-2">
        <button
          onClick={() => setMode("camera") & setResult("")}
          className={`px-6 py-3 rounded-md cursor-pointer transition flex items-center justify-center gap-2 text-sm ${
            mode === "camera"
              ? "bg-brandColor text-white"
              : "bg-brandColor text-white hover:bg-brandColorHover"
          }`}
        >
          <CameraIcon className="size-4"></CameraIcon>
          Use Camera
        </button>
        <button
          onClick={() => setMode("upload") & setResult("")}
          className={`px-6 py-3 rounded-md cursor-pointer transition flex items-center justify-center gap-2 text-sm ${
            mode === "upload"
              ? "bg-brandColor text-white"
              : "bg-brandColor text-white hover:bg-brandColorHover"
          }`}
        >
          <Upload className="size-4"></Upload>
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
            className="-mt-5 px-6 py-2 bg-brandColor text-white rounded-md text-sm transition hover:bg-brandColorHover cursor-pointer flex items-center justify-center gap-2"
          >
            <Camera className="size-4"></Camera>
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
        <div className="mt-6">
          <div className="flex items-center justify-center bg-white p-2 px-5 rounded-t-md w-fit m-auto">
            <h3 className="text-sm font-medium text-gray-800">
              Scanned Result:
            </h3>
          </div>
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg shadow-md">
            <p className="text-lg font-medium text-brandColor"> {result}</p>
            <button
              onClick={() => copyToClipboard(result)}
              className="p-2 bg-brandColor/20 text-gray-700 rounded-md transition hover:bg-brandColorHover/30 cursor-pointer"
            >
              <Copy className="size-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRScanner;
