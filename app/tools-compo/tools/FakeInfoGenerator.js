"use client";
import React, { useState, useCallback } from "react";

const FakeInfoGenerator = () => {
  const [selectedCountry, setSelectedCountry] = useState("us");
  const [selectedGender, setSelectedGender] = useState("all");
  const [quantity, setQuantity] = useState(1);
  const [generatedData, setGeneratedData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  // Country code mapping for API
  const countryCodes = {
    us: { code: "US", name: "United States", flag: "🇺🇸", apiName: "US" },
    gb: { code: "GB", name: "United Kingdom", flag: "🇬🇧", apiName: "GB" },
    ca: { code: "CA", name: "Canada", flag: "🇨🇦", apiName: "CA" },
    au: { code: "AU", name: "Australia", flag: "🇦🇺", apiName: "AU" },
    de: { code: "DE", name: "Germany", flag: "🇩🇪", apiName: "DE" },
    fr: { code: "FR", name: "France", flag: "🇫🇷", apiName: "FR" },
    es: { code: "ES", name: "Spain", flag: "🇪🇸", apiName: "ES" },
    it: { code: "IT", name: "Italy", flag: "🇮🇹", apiName: "IT" },
    nl: { code: "NL", name: "Netherlands", flag: "🇳🇱", apiName: "NL" },
    br: { code: "BR", name: "Brazil", flag: "🇧🇷", apiName: "BR" },
    bd: { code: "BD", name: "Bangladesh", flag: "🇧🇩", apiName: "BD" },
  };

  // Gender options for dropdown
  const genderOptions = [
    { value: "all", label: "All Genders", icon: "👥" },
    { value: "male", label: "Male", icon: "👨" },
    { value: "female", label: "Female", icon: "👩" },
  ];

  // Show toast notification
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 3000);
  };

  // Format address from API response
  const formatAddress = (location) => {
    if (!location) return "N/A";
    const { street, city, state, postcode, country } = location;
    const streetStr =
      typeof street === "object" ? `${street.number} ${street.name}` : street;
    return `${streetStr}, ${city}, ${state} ${postcode}, ${country}`;
  };

  // Format date to readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Fetch random user data from API with gender filter
  const generateRandomInfo = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const countryCode = countryCodes[selectedCountry]?.apiName || "US";
      const results = quantity;

      // Build API URL with gender filter if not 'all'
      let url = `https://randomuser.me/api/?results=${results}&nat=${countryCode}`;
      if (selectedGender !== "all") {
        url += `&gender=${selectedGender}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      // Transform API response into our format
      const transformedData = data.results.map((user, index) => ({
        id: `${Date.now()}-${index}-${Math.random()}`,
        fullName: `${user.name.first} ${user.name.last}`,
        firstName: user.name.first,
        lastName: user.name.last,
        email: user.email,
        phoneNumber: user.phone,
        address: formatAddress(user.location),
        country: user.location.country,
        avatar: user.picture.large,
        thumbnail: user.picture.thumbnail,
        gender: user.gender,
        age: user.dob.age,
        birthDate: {
          raw: user.dob.date,
          formatted: formatDate(user.dob.date),
          year: new Date(user.dob.date).getFullYear(),
          date: new Date(user.dob.date).getDate(),
          month: new Date(user.dob.date).toLocaleString("default", {
            month: "long",
          }),
        },
        zodiac: getZodiacSign(new Date(user.dob.date)),
        nationality: user.nat,
        username: user.login.username,
      }));

      setGeneratedData(transformedData);
      showToast(
        `✨ Successfully generated ${transformedData.length} new user${transformedData.length !== 1 ? "s" : ""}!`,
        "success",
      );
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError("Failed to generate information. Please try again.");
      showToast("❌ Failed to generate users. Please try again!", "error");
      setGeneratedData([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCountry, quantity, selectedGender]);

  // Get zodiac sign from birth date
  const getZodiacSign = (date) => {
    const day = date.getDate();
    const month = date.getMonth() + 1;

    if ((month === 1 && day >= 20) || (month === 2 && day <= 18))
      return "♒ Aquarius";
    if ((month === 2 && day >= 19) || (month === 3 && day <= 20))
      return "♓ Pisces";
    if ((month === 3 && day >= 21) || (month === 4 && day <= 19))
      return "♈ Aries";
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20))
      return "♉ Taurus";
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20))
      return "♊ Gemini";
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22))
      return "♋ Cancer";
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22))
      return "♌ Leo";
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22))
      return "♍ Virgo";
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22))
      return "♎ Libra";
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21))
      return "♏ Scorpio";
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21))
      return "♐ Sagittarius";
    return "♑ Capricorn";
  };

  // Copy single card as JSON
  const copySingleAsJSON = (person) => {
    const jsonStr = JSON.stringify(person, null, 2);
    navigator.clipboard.writeText(jsonStr);
    showToast(
      `📋 JSON data for ${person.fullName} copied to clipboard!`,
      "success",
    );
  };

  // Copy single card as Text
  const copySingleAsText = (person) => {
    const textStr = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 USER PROFILE: ${person.fullName}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 PERSONAL INFORMATION
├─ Full Name: ${person.fullName}
├─ Gender: ${person.gender === "male" ? "Male (👨)" : "Female (👩)"}
├─ Age: ${person.age} years
├─ Birth Date: ${person.birthDate.formatted}
├─ Zodiac Sign: ${person.zodiac}
└─ Username: @${person.username}

📞 CONTACT INFORMATION
├─ Email: ${person.email}
├─ Phone: ${person.phoneNumber}
└─ Address: ${person.address}

🌍 LOCATION
└─ Country: ${person.country}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
    navigator.clipboard.writeText(textStr);
    showToast(
      `📄 Text data for ${person.fullName} copied to clipboard!`,
      "success",
    );
  };

  // Copy all data as JSON
  const copyAllAsJSON = () => {
    if (generatedData.length === 0) {
      showToast("⚠️ No data to copy! Generate some data first.", "error");
      return;
    }
    const jsonStr = JSON.stringify(generatedData, null, 2);
    navigator.clipboard.writeText(jsonStr);
    showToast(
      `📋 All ${generatedData.length} records copied as JSON!`,
      "success",
    );
  };

  // Copy all data as Text (formatted)
  const copyAllAsText = () => {
    if (generatedData.length === 0) {
      showToast("⚠️ No data to copy! Generate some data first.", "error");
      return;
    }

    let textStr =
      "╔════════════════════════════════════════════════════════════════════╗\n";
    textStr +=
      "║                    📊 GENERATED USER DATA REPORT                      ║\n";
    textStr +=
      "╚════════════════════════════════════════════════════════════════════╝\n\n";
    textStr += `📈 REPORT SUMMARY\n`;
    textStr += `├─ Total Records: ${generatedData.length}\n`;
    textStr += `├─ Country: ${countryCodes[selectedCountry]?.name || "Unknown"}\n`;
    textStr += `├─ Gender Filter: ${selectedGender === "all" ? "All Genders" : selectedGender === "male" ? "Male Only" : "Female Only"}\n`;
    textStr += `└─ Generated: ${new Date().toLocaleString()}\n\n`;
    textStr += "━".repeat(70) + "\n\n";

    generatedData.forEach((person, idx) => {
      textStr += `📌 RECORD #${idx + 1}\n`;
      textStr += `├─ 👤 Name: ${person.fullName}\n`;
      textStr += `├─ 🚻 Gender: ${person.gender === "male" ? "Male" : "Female"}\n`;
      textStr += `├─ 🎂 Age: ${person.age} years\n`;
      textStr += `├─ 📅 Birth Date: ${person.birthDate.formatted}\n`;
      textStr += `├─ ⭐ Zodiac: ${person.zodiac}\n`;
      textStr += `├─ 📧 Email: ${person.email}\n`;
      textStr += `├─ 📞 Phone: ${person.phoneNumber}\n`;
      textStr += `├─ 🏠 Address: ${person.address}\n`;
      textStr += `├─ 🌍 Country: ${person.country}\n`;
      textStr += `└─ 🔖 Username: @${person.username}\n`;
      textStr += "\n" + "─".repeat(50) + "\n\n";
    });

    textStr +=
      "╔════════════════════════════════════════════════════════════════════╗\n";
    textStr +=
      "║         📝 End of Report - All data is fictional and random        ║\n";
    textStr +=
      "╚════════════════════════════════════════════════════════════════════╝";

    navigator.clipboard.writeText(textStr);
    showToast(
      `📄 All ${generatedData.length} records copied as formatted text!`,
      "success",
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-10 pt-20 px-2 relative">
      {/* Toast Notification */}
      {toast.show && (
        <div
          className={`fixed top-5 right-5 z-50 animate-slide-in-right max-w-md w-full shadow-lg rounded-lg overflow-hidden transition-all duration-300 ${
            toast.type === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          <div className="px-4 py-3 flex items-center gap-3">
            <div className="flex-shrink-0">
              {toast.type === "success" ? (
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-medium">{toast.message}</p>
            </div>
            <button
              onClick={() => setToast({ show: false, message: "", type: "" })}
              className="flex-shrink-0 text-white hover:text-gray-200"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            🌍 Random User Generator
          </h1>
          <p className="text-slate-500">
            Real random data from the internet - No storage, completely fresh
            each time
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Powered by randomuser.me API | Live data from global user database
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* LEFT SIDE - Input Controls */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-20">
              <h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
                <span className="text-2xl">⚙️</span> Configuration Panel
              </h2>

              <div className="space-y-5">
                {/* Country Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    🌎 Select Country
                  </label>
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg py-2.5 px-4 text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white cursor-pointer"
                  >
                    {Object.entries(countryCodes).map(
                      ([key, { flag, name }]) => (
                        <option key={key} value={key}>
                          {flag} {name}
                        </option>
                      ),
                    )}
                  </select>
                  <p className="text-xs text-slate-400 mt-1">
                    Data will match this country's real format
                  </p>
                </div>

                {/* Gender Selection - Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    🚻 Select Gender
                  </label>
                  <select
                    value={selectedGender}
                    onChange={(e) => setSelectedGender(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg py-2.5 px-4 text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white cursor-pointer"
                  >
                    {genderOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.icon} {option.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-400 mt-1">
                    Filter results by gender preference
                  </p>
                </div>

                {/* Quantity Selection - Select Field Only */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    📊 Number of Records
                  </label>
                  <select
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg py-2.5 px-4 text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-400 mt-1">
                    Generate {quantity} random profile
                    {quantity !== 1 ? "s" : ""}
                  </p>
                </div>

                {/* Generate Button - Only way to fetch data */}
                <button
                  onClick={generateRandomInfo}
                  disabled={isLoading}
                  className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 ${
                    isLoading
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg transform hover:scale-[1.02]"
                  }`}
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Fetching Live Data...
                    </>
                  ) : (
                    <>
                      <span>🎲</span> Generate Random Users
                    </>
                  )}
                </button>

                {/* Success Message */}
                {!isLoading && generatedData.length > 0 && !error && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-700 text-sm flex items-center justify-center gap-1">
                      <span>✅</span> Generated {generatedData.length} record
                      {generatedData.length !== 1 ? "s" : ""} from live API!
                    </p>
                    <p className="text-xs text-green-600 mt-1 text-center">
                      Click "Generate Random Users" again for fresh data
                    </p>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm flex items-center gap-1">
                      <span>⚠️</span> {error}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT SIDE - Results Cards */}
          <div className="lg:w-2/3">
            {/* Copy All Buttons - Right side top of the section */}
            {generatedData.length > 0 && !isLoading && (
              <div className="mb-4 flex justify-end gap-3">
                <button
                  onClick={copyAllAsJSON}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg text-sm font-medium transition-all flex items-center gap-2 shadow-sm"
                >
                  <span>📋</span> Copy All as JSON
                </button>
                <button
                  onClick={copyAllAsText}
                  className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg text-sm font-medium transition-all flex items-center gap-2 shadow-sm"
                >
                  <span>📄</span> Copy All as Text
                </button>
              </div>
            )}

            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-96 bg-white rounded-xl shadow-md">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-slate-500 font-medium">
                  Fetching fresh data from the internet...
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  📡 Connecting to randomuser.me API
                </p>
                <p className="text-xs text-slate-400">
                  ⏱️ This takes just a moment
                </p>
              </div>
            ) : generatedData.length === 0 && !error ? (
              <div className="flex flex-col items-center justify-center h-96 bg-white rounded-xl shadow-md">
                <div className="text-6xl mb-4">🌍</div>
                <p className="text-slate-400 text-lg">No users generated yet</p>
                <p className="text-slate-400 text-sm mt-2">
                  Click "Generate Random Users" to start
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Result count header */}
                <div className="bg-white rounded-lg p-3 shadow-sm border border-slate-200">
                  <p className="text-sm text-slate-600">
                    Showing{" "}
                    <span className="font-bold text-blue-600">
                      {generatedData.length}
                    </span>{" "}
                    random user{generatedData.length !== 1 ? "s" : ""} from{" "}
                    <span className="font-bold">
                      {countryCodes[selectedCountry]?.name}
                    </span>
                    {selectedGender !== "all" &&
                      ` • ${selectedGender === "male" ? "👨 Male only" : "👩 Female only"}`}
                  </p>
                </div>

                {generatedData.map((person, idx) => (
                  <div
                    key={person.id}
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-200 border border-slate-100"
                  >
                    {/* Card Header with Gender Badge */}
                    <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-5 py-3 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-semibold">
                          User #{idx + 1}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            person.gender === "male"
                              ? "bg-blue-400/30 text-blue-100"
                              : "bg-pink-400/30 text-pink-100"
                          }`}
                        >
                          {person.gender === "male" ? "👨 Male" : "👩 Female"}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {/* Single card copy buttons - JSON and Text only */}
                        <button
                          onClick={() => copySingleAsJSON(person)}
                          className="text-xs bg-white/20 hover:bg-white/30 text-white px-2 py-1 rounded transition flex items-center gap-1"
                          title="Copy as JSON"
                        >
                          📋 JSON
                        </button>
                        <button
                          onClick={() => copySingleAsText(person)}
                          className="text-xs bg-white/20 hover:bg-white/30 text-white px-2 py-1 rounded transition flex items-center gap-1"
                          title="Copy as Text"
                        >
                          📄 Text
                        </button>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-5">
                      <div className="flex gap-4">
                        {/* Avatar */}
                        <img
                          src={person.avatar}
                          alt={person.fullName}
                          className="w-20 h-20 rounded-full border-2 border-indigo-200 object-cover"
                        />

                        {/* User Details */}
                        <div className="flex-1 space-y-2">
                          <div>
                            <p className="text-xs text-slate-400 uppercase tracking-wide">
                              Full Name
                            </p>
                            <p className="text-lg font-semibold text-slate-800">
                              {person.fullName}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-xs text-slate-400">Email</p>
                              <p className="text-slate-700 break-all">
                                {person.email}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-400">Phone</p>
                              <p className="text-slate-700">
                                {person.phoneNumber}
                              </p>
                            </div>
                            <div className="col-span-2">
                              <p className="text-xs text-slate-400">Address</p>
                              <p className="text-slate-700 text-sm">
                                {person.address}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-400">Age</p>
                              <p className="text-slate-700">
                                {person.age} years
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-400">Username</p>
                              <p className="text-slate-700">
                                @{person.username}
                              </p>
                            </div>
                            <div className="col-span-2">
                              <p className="text-xs text-slate-400">
                                Birth Information
                              </p>
                              <p className="text-slate-700 text-sm">
                                🎂 {person.birthDate.formatted} • ⭐{" "}
                                {person.zodiac}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Disclaimer */}
        <div className="mt-10 text-center text-sm text-slate-400 border-t border-slate-200 pt-6">
          <p>
            ⚠️ All data is fetched in real-time from randomuser.me API - No data
            is stored or cached
          </p>
          <p className="text-xs mt-1">
            Each request generates completely new, fresh data from the internet
            | Bangladesh 🇧🇩 support included
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in-right {
          animation: slideInRight 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default FakeInfoGenerator;
