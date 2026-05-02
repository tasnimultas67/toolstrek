"use client";

import React, { useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";

const QRCodeGenerator = () => {
  const [inputValue, setInputValue] = useState("");
  const [qrValue, setQrValue] = useState("");
  const [format, setFormat] = useState("SVG");
  const [destination, setDestination] = useState("URL");
  const [customText, setCustomText] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [qrColor, setQrColor] = useState("#000000");
  const [qrBgColor, setQrBgColor] = useState("#ffffff");
  const [margin, setMargin] = useState(4);
  const [errorLevel, setErrorLevel] = useState("H");
  const [qrSize, setQrSize] = useState(250);
  const [downloadSize, setDownloadSize] = useState(800);
  const [vCardData, setVCardData] = useState({
    name: "",
    phone: "",
    email: "",
    company: "",
    title: "",
    website: "",
    address: "",
  });
  const [geoData, setGeoData] = useState({
    latitude: "",
    longitude: "",
    altitude: "",
  });
  const [wifiData, setWifiData] = useState({
    ssid: "",
    password: "",
    encryption: "WPA",
  });
  const [eventData, setEventData] = useState({
    title: "",
    startDate: "",
    endDate: "",
    location: "",
    description: "",
  });
  const displaySvgRef = useRef(null);

  // Destination options
  const destinationOptions = [
    {
      id: "URL",
      name: "URL",
      icon: "🌐",
      description: "Website link",
      placeholder: "https://example.com",
    },
    {
      id: "Text",
      name: "Text",
      icon: "📝",
      description: "Plain text",
      placeholder: "Enter your text here...",
    },
    {
      id: "Email",
      name: "Email",
      icon: "📧",
      description: "Email address",
      placeholder: "user@example.com",
    },
    {
      id: "Phone",
      name: "Phone",
      icon: "📱",
      description: "Call number",
      placeholder: "+1234567890",
    },
    {
      id: "SMS",
      name: "SMS",
      icon: "💬",
      description: "Text message",
      placeholder: "+1234567890",
    },
    {
      id: "WhatsApp",
      name: "WhatsApp",
      icon: "💚",
      description: "Chat on WhatsApp",
      placeholder: "+1234567890",
    },
    {
      id: "vCard",
      name: "vCard",
      icon: "👤",
      description: "Save contact",
      placeholder: "",
    },
    {
      id: "Geo",
      name: "Location",
      icon: "📍",
      description: "Share location",
      placeholder: "",
    },
    {
      id: "WiFi",
      name: "WiFi",
      icon: "📶",
      description: "Network login",
      placeholder: "",
    },
    {
      id: "Event",
      name: "Event",
      icon: "📅",
      description: "Calendar event",
      placeholder: "",
    },
  ];

  // Generate vCard string
  const generateVCard = () => {
    let vcard = "BEGIN:VCARD\nVERSION:3.0\n";
    if (vCardData.name) vcard += `FN:${vCardData.name}\n`;
    if (vCardData.name) vcard += `N:${vCardData.name};;;\n`;
    if (vCardData.phone) vcard += `TEL:${vCardData.phone}\n`;
    if (vCardData.email) vcard += `EMAIL:${vCardData.email}\n`;
    if (vCardData.company) vcard += `ORG:${vCardData.company}\n`;
    if (vCardData.title) vcard += `TITLE:${vCardData.title}\n`;
    if (vCardData.website) vcard += `URL:${vCardData.website}\n`;
    if (vCardData.address) vcard += `ADR:;;${vCardData.address};;;\n`;
    vcard += "END:VCARD";
    return vcard;
  };

  // Generate Geo URI
  const generateGeoURI = () => {
    if (geoData.latitude && geoData.longitude) {
      return `geo:${geoData.latitude},${geoData.longitude}${geoData.altitude ? `,${geoData.altitude}` : ""}`;
    }
    return "";
  };

  // Generate WiFi string
  const generateWiFiString = () => {
    if (wifiData.ssid) {
      return `WIFI:T:${wifiData.encryption};S:${wifiData.ssid};P:${wifiData.password};;`;
    }
    return "";
  };

  // Generate Event string
  const generateEventString = () => {
    if (eventData.title && eventData.startDate) {
      return `BEGIN:VEVENT\nSUMMARY:${eventData.title}\nDTSTART:${eventData.startDate.replace(/-/g, "")}T000000\n${eventData.endDate ? `DTEND:${eventData.endDate.replace(/-/g, "")}T000000\n` : ""}${eventData.location ? `LOCATION:${eventData.location}\n` : ""}${eventData.description ? `DESCRIPTION:${eventData.description}\n` : ""}END:VEVENT`;
    }
    return "";
  };

  // Handle QR code generation
  const generateQRCode = () => {
    let finalValue = "";

    switch (destination) {
      case "URL":
        finalValue = inputValue;
        break;
      case "Text":
        finalValue = customText || inputValue;
        break;
      case "Email":
        finalValue = `mailto:${inputValue}`;
        break;
      case "Phone":
        finalValue = `tel:${inputValue}`;
        break;
      case "SMS":
        finalValue = `sms:${inputValue}${customText ? `?body=${encodeURIComponent(customText)}` : ""}`;
        break;
      case "WhatsApp":
        finalValue = `https://wa.me/${inputValue.replace(/\D/g, "")}`;
        break;
      case "vCard":
        finalValue = generateVCard();
        break;
      case "Geo":
        finalValue = generateGeoURI();
        break;
      case "WiFi":
        finalValue = generateWiFiString();
        break;
      case "Event":
        finalValue = generateEventString();
        break;
      default:
        finalValue = inputValue;
    }

    if (finalValue) {
      setQrValue(finalValue);
    } else {
      alert("Please fill in the required fields");
    }
  };

  // Generate high-quality QR code for download
  const generateHighResQRCode = async (formatType, size = downloadSize) => {
    const tempDiv = document.createElement("div");
    tempDiv.style.position = "absolute";
    tempDiv.style.left = "-9999px";
    document.body.appendChild(tempDiv);

    const ReactDOM = await import("react-dom/client");
    const { QRCodeSVG } = await import("qrcode.react");

    const qrElement = React.createElement(QRCodeSVG, {
      value: qrValue,
      size: size,
      bgColor: qrBgColor,
      fgColor: qrColor,
      level: errorLevel,
      includeMargin: true,
      marginSize: margin,
    });

    const root = ReactDOM.createRoot(tempDiv);
    root.render(qrElement);

    await new Promise((resolve) => setTimeout(resolve, 200));

    const svgElement = tempDiv.querySelector("svg");
    if (!svgElement) return null;

    const serializer = new XMLSerializer();
    let svgString = serializer.serializeToString(svgElement);

    root.unmount();
    document.body.removeChild(tempDiv);

    if (formatType === "SVG") {
      return svgString;
    }

    return new Promise((resolve) => {
      const img = new Image();
      const svgBlob = new Blob([svgString], {
        type: "image/svg+xml;charset=utf-8",
      });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");

        if (formatType === "JPG") {
          ctx.fillStyle = qrBgColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.drawImage(img, 0, 0, size, size);
        URL.revokeObjectURL(url);

        const dataURL =
          formatType === "PNG"
            ? canvas.toDataURL("image/png")
            : canvas.toDataURL("image/jpeg", 1.0);

        resolve(dataURL);
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(null);
      };

      img.src = url;
    });
  };

  // Download QR code
  const downloadQRCode = async () => {
    if (!qrValue) {
      alert("Please generate a QR code first");
      return;
    }

    try {
      if (format === "SVG") {
        const svgString = await generateHighResQRCode("SVG", downloadSize);
        if (svgString) {
          const blob = new Blob([svgString], { type: "image/svg+xml" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.download = `qrcode.svg`;
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);
        } else {
          alert("Error generating SVG");
        }
      } else {
        const dataURL = await generateHighResQRCode(format, downloadSize);
        if (dataURL) {
          const link = document.createElement("a");
          link.download = `qrcode.${format.toLowerCase()}`;
          link.href = dataURL;
          link.click();
        } else {
          alert("Error generating image. Please try again.");
        }
      }
    } catch (error) {
      console.error("Download error:", error);
      alert("Error generating QR code. Please try again.");
    }
  };

  // Render dynamic input fields
  const renderDynamicFields = () => {
    switch (destination) {
      case "URL":
      case "Email":
      case "Phone":
      case "WhatsApp":
        return (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {destination === "URL" && "Enter URL"}
              {destination === "Email" && "Enter Email Address"}
              {destination === "Phone" && "Enter Phone Number"}
              {destination === "WhatsApp" && "Enter WhatsApp Number"}
            </label>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={
                destinationOptions.find((opt) => opt.id === destination)
                  ?.placeholder
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
          </div>
        );

      case "Text":
      case "SMS":
        return (
          <>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {destination === "Text" ? "Enter Text" : "Enter Phone Number"}
              </label>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={
                  destinationOptions.find((opt) => opt.id === destination)
                    ?.placeholder
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
            </div>
            {destination === "SMS" && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Message Content (Optional)
                </label>
                <textarea
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Enter your message..."
                  rows="2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
              </div>
            )}
          </>
        );

      case "vCard":
        return (
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Full Name *"
              value={vCardData.name}
              onChange={(e) =>
                setVCardData({ ...vCardData, name: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-sm"
            />
            <input
              type="tel"
              placeholder="Phone Number"
              value={vCardData.phone}
              onChange={(e) =>
                setVCardData({ ...vCardData, phone: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-sm"
            />
            <input
              type="email"
              placeholder="Email Address"
              value={vCardData.email}
              onChange={(e) =>
                setVCardData({ ...vCardData, email: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-sm"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Company"
                value={vCardData.company}
                onChange={(e) =>
                  setVCardData({ ...vCardData, company: e.target.value })
                }
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-sm"
              />
              <input
                type="text"
                placeholder="Job Title"
                value={vCardData.title}
                onChange={(e) =>
                  setVCardData({ ...vCardData, title: e.target.value })
                }
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-sm"
              />
            </div>
            <input
              type="url"
              placeholder="Website"
              value={vCardData.website}
              onChange={(e) =>
                setVCardData({ ...vCardData, website: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-sm"
            />
            <input
              type="text"
              placeholder="Address"
              value={vCardData.address}
              onChange={(e) =>
                setVCardData({ ...vCardData, address: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-sm"
            />
          </div>
        );

      case "Geo":
        return (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Latitude *"
                value={geoData.latitude}
                onChange={(e) =>
                  setGeoData({ ...geoData, latitude: e.target.value })
                }
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-sm"
              />
              <input
                type="text"
                placeholder="Longitude *"
                value={geoData.longitude}
                onChange={(e) =>
                  setGeoData({ ...geoData, longitude: e.target.value })
                }
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-sm"
              />
            </div>
            <input
              type="text"
              placeholder="Altitude (optional)"
              value={geoData.altitude}
              onChange={(e) =>
                setGeoData({ ...geoData, altitude: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-sm"
            />
          </div>
        );

      case "WiFi":
        return (
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Network Name (SSID) *"
              value={wifiData.ssid}
              onChange={(e) =>
                setWifiData({ ...wifiData, ssid: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-sm"
            />
            <input
              type="text"
              placeholder="Password"
              value={wifiData.password}
              onChange={(e) =>
                setWifiData({ ...wifiData, password: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-sm"
            />
            <select
              value={wifiData.encryption}
              onChange={(e) =>
                setWifiData({ ...wifiData, encryption: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-sm"
            >
              <option value="WPA">WPA/WPA2</option>
              <option value="WEP">WEP</option>
              <option value="nopass">No Password</option>
            </select>
          </div>
        );

      case "Event":
        return (
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Event Title *"
              value={eventData.title}
              onChange={(e) =>
                setEventData({ ...eventData, title: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-sm"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                placeholder="Start Date *"
                value={eventData.startDate}
                onChange={(e) =>
                  setEventData({ ...eventData, startDate: e.target.value })
                }
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-sm"
              />
              <input
                type="date"
                placeholder="End Date"
                value={eventData.endDate}
                onChange={(e) =>
                  setEventData({ ...eventData, endDate: e.target.value })
                }
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-sm"
              />
            </div>
            <input
              type="text"
              placeholder="Location"
              value={eventData.location}
              onChange={(e) =>
                setEventData({ ...eventData, location: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-sm"
            />
            <textarea
              placeholder="Description"
              value={eventData.description}
              onChange={(e) =>
                setEventData({ ...eventData, description: e.target.value })
              }
              rows="2"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-sm"
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pb-10 pt-26 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            QR Code Generator
          </h1>
          <p className="text-gray-600">
            Create custom QR codes with advanced styling options
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-6 p-6">
            {/* Left Panel - Input Section */}
            <div className="space-y-5">
              {/* Destination Cards */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Destination Type
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {destinationOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => {
                        setDestination(option.id);
                        setInputValue("");
                        setCustomText("");
                      }}
                      className={`p-2 rounded-lg border-2 transition-all text-center ${
                        destination === option.id
                          ? "border-indigo-600 bg-indigo-50 shadow-sm"
                          : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="text-xl">{option.icon}</div>
                      <div
                        className={`text-xs font-medium ${
                          destination === option.id
                            ? "text-indigo-700"
                            : "text-gray-700"
                        }`}
                      >
                        {option.name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Input Fields */}
              {renderDynamicFields()}

              {/* Advanced Options */}
              <div className="border-t border-gray-200 pt-4">
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full flex items-center justify-between px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition"
                >
                  <span className="font-semibold text-gray-700 flex items-center gap-2">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    Advanced Options
                  </span>
                  <svg
                    className={`w-5 h-5 transition-transform ${showAdvanced ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {showAdvanced && (
                  <div className="mt-3 space-y-4 p-4 bg-gray-50 rounded-lg">
                    {/* Colors */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          QR Color
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={qrColor}
                            onChange={(e) => setQrColor(e.target.value)}
                            className="w-10 h-8 rounded border cursor-pointer"
                          />
                          <input
                            type="text"
                            value={qrColor}
                            onChange={(e) => setQrColor(e.target.value)}
                            className="flex-1 px-2 py-1 border rounded text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Background Color
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={qrBgColor}
                            onChange={(e) => setQrBgColor(e.target.value)}
                            className="w-10 h-8 rounded border cursor-pointer"
                          />
                          <input
                            type="text"
                            value={qrBgColor}
                            onChange={(e) => setQrBgColor(e.target.value)}
                            className="flex-1 px-2 py-1 border rounded text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Margin & Error Correction */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Margin: {margin}
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="10"
                          value={margin}
                          onChange={(e) => setMargin(Number(e.target.value))}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Error Correction
                        </label>
                        <select
                          value={errorLevel}
                          onChange={(e) => setErrorLevel(e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                        >
                          <option value="L">L - 7% (Smallest)</option>
                          <option value="M">M - 15% (Medium)</option>
                          <option value="Q">Q - 25% (Quality)</option>
                          <option value="H">H - 30% (Highest)</option>
                        </select>
                      </div>
                    </div>

                    {/* Size Settings */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Preview Size: {qrSize}px
                        </label>
                        <input
                          type="range"
                          min="150"
                          max="400"
                          step="10"
                          value={qrSize}
                          onChange={(e) => setQrSize(Number(e.target.value))}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Download Size: {downloadSize}px
                        </label>
                        <input
                          type="range"
                          min="400"
                          max="1200"
                          step="50"
                          value={downloadSize}
                          onChange={(e) =>
                            setDownloadSize(Number(e.target.value))
                          }
                          className="w-full"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Higher = Better quality
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Generate Button */}
              <button
                onClick={generateQRCode}
                className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-2.5 rounded-lg font-semibold hover:from-indigo-700 hover:to-blue-700 transition transform hover:scale-[1.02]"
              >
                Generate QR Code
              </button>
            </div>

            {/* Right Panel - QR Code Display */}
            <div className="flex flex-col items-center justify-center space-y-5">
              <div className="bg-gray-50 rounded-xl p-6 border-2 border-dashed border-gray-200">
                {qrValue ? (
                  <div className="flex flex-col items-center">
                    <QRCodeSVG
                      ref={displaySvgRef}
                      value={qrValue}
                      size={qrSize}
                      bgColor={qrBgColor}
                      fgColor={qrColor}
                      level={errorLevel}
                      includeMargin={true}
                      marginSize={margin}
                    />
                  </div>
                ) : (
                  <div
                    className="flex items-center justify-center text-gray-400"
                    style={{ width: qrSize, height: qrSize }}
                  >
                    <svg
                      className="w-24 h-24"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {/* Format Selection */}
              <div className="w-full">
                <label className="block text-sm font-semibold text-gray-700 mb-2 text-center">
                  Download Format
                </label>
                <div className="flex gap-2 justify-center">
                  {["SVG", "PNG", "JPG"].map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setFormat(fmt)}
                      className={`px-4 py-1.5 rounded-lg font-medium transition text-sm ${
                        format === fmt
                          ? "bg-indigo-600 text-white shadow-md"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Download Button */}
              <button
                onClick={downloadQRCode}
                disabled={!qrValue}
                className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Download as {format}
              </button>

              {qrValue && (
                <div className="text-xs text-gray-500 text-center space-y-1">
                  <p className="font-mono text-indigo-600 break-all max-w-md">
                    {qrValue.length > 80
                      ? `${qrValue.substring(0, 80)}...`
                      : qrValue}
                  </p>
                  <p className="text-green-600">
                    ✓ {downloadSize}x{downloadSize}px high-resolution {format}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-white rounded-lg p-3 text-center shadow text-sm hover:shadow-md transition">
            <div className="text-xl mb-1">🎯</div>
            <h3 className="font-semibold text-xs">10 Destinations</h3>
            <p className="text-xs text-gray-500">URL, vCard, WiFi & more</p>
          </div>
          <div className="bg-white rounded-lg p-3 text-center shadow text-sm hover:shadow-md transition">
            <div className="text-xl mb-1">📥</div>
            <h3 className="font-semibold text-xs">3 Formats</h3>
            <p className="text-xs text-gray-500">SVG, PNG, JPG</p>
          </div>
          <div className="bg-white rounded-lg p-3 text-center shadow text-sm hover:shadow-md transition">
            <div className="text-xl mb-1">🎨</div>
            <h3 className="font-semibold text-xs">Custom Colors</h3>
            <p className="text-xs text-gray-500">Any color combination</p>
          </div>
          <div className="bg-white rounded-lg p-3 text-center shadow text-sm hover:shadow-md transition">
            <div className="text-xl mb-1">📏</div>
            <h3 className="font-semibold text-xs">Margin Control</h3>
            <p className="text-xs text-gray-500">Adjust spacing</p>
          </div>
          <div className="bg-white rounded-lg p-3 text-center shadow text-sm hover:shadow-md transition">
            <div className="text-xl mb-1">⚡</div>
            <h3 className="font-semibold text-xs">Error Correction</h3>
            <p className="text-xs text-gray-500">Up to 30% recovery</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeGenerator;
