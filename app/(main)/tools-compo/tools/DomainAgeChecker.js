"use client";

import { useState } from "react";
import ToolPageShell from "../ToolPageShell";

export default function DomainAgeChecker() {
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const validateDomain = (input) => {
    const domainRegex =
      /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    return domainRegex.test(input);
  };

  const calculateAge = (creationDate) => {
    const created = new Date(creationDate);
    const now = new Date();
    let years = now.getFullYear() - created.getFullYear();
    let months = now.getMonth() - created.getMonth();
    let days = now.getDate() - created.getDate();

    if (days < 0) {
      months--;
      const lastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += lastMonth.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    return { years, months, days };
  };

  const getAgeInDays = (creationDate) => {
    const created = new Date(creationDate);
    const now = new Date();
    const diffTime = Math.abs(now - created);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);

    if (!domain.trim()) {
      setError("Please enter a domain name");
      setLoading(false);
      return;
    }

    if (!validateDomain(domain)) {
      setError("Please enter a valid domain (e.g., example.com)");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/check-domain-age", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ domain: domain.toLowerCase().trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to check domain age");
      }

      const age = calculateAge(data.creationDate);
      const ageInDays = getAgeInDays(data.creationDate);
      const createdDate = new Date(data.creationDate);

      setResult({
        domain: data.domain,
        creationDate: createdDate.toLocaleDateString(),
        fullCreationDate: createdDate.toLocaleString(),
        years: age.years,
        months: age.months,
        days: age.days,
        ageInDays: ageInDays,
        registrar: data.registrar,
        nameservers: data.nameservers || "Not available",
        status: data.status || "Registered",
        updatedDate: data.updatedDate || "Not available",
        expiryDate: data.expiryDate || "Not available",
        organization: data.organization || "Not available",
        country: data.country || "Not available",
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolPageShell widthClassName="max-w-7xl">
      <div>
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Domain Age Checker
          </h1>
          <p className="text-gray-600 mt-2">
            Get detailed information about any domain name
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Input Options */}
          <div className="space-y-6">
            {/* Search Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
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
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  Check Domain
                </h2>
              </div>
              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Domain Name
                    </label>
                    <input
                      type="text"
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      placeholder="example.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition outline-none text-lg"
                      disabled={loading}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter domain without http:// or www
                    </p>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
                      <svg
                        className="w-5 h-5 flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-sm">{error}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
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
                        Analyzing Domain...
                      </>
                    ) : (
                      <>
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
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Check Domain Age
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Information Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  About Domain Age
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-3 text-sm text-gray-600">
                  <p>Domain age is an important factor that indicates:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Domain trustworthiness and credibility</li>
                    <li>Website history and stability</li>
                    <li>SEO ranking potential</li>
                    <li>Business legitimacy indicator</li>
                  </ul>
                  <div className="bg-blue-50 rounded-lg p-3 mt-4">
                    <p className="text-xs text-blue-800">
                      <span className="font-semibold">💡 Tip:</span> Older
                      domains often have better SEO authority and trust signals.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-teal-600 px-6 py-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Domain Information
              </h2>
            </div>
            <div className="p-6">
              {!result && !loading && (
                <div className="text-center py-12">
                  <svg
                    className="w-20 h-20 mx-auto text-gray-300 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="text-gray-500">
                    Enter a domain name to see detailed information
                  </p>
                </div>
              )}

              {loading && (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                  <p className="text-gray-600 mt-4">
                    Fetching domain information...
                  </p>
                </div>
              )}

              {result && (
                <div className="space-y-4">
                  {/* Domain Name Header */}
                  <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
                    <p className="text-sm text-gray-600">Domain Name</p>
                    <p className="text-2xl font-bold text-gray-900 break-all">
                      {result.domain}
                    </p>
                  </div>

                  {/* Age Section */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                    <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">
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
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Domain Age
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-3xl font-bold text-blue-600">
                          {result.years > 0 && `${result.years}y `}
                          {result.months > 0 && `${result.months}m `}
                          {result.days > 0 && `${result.days}d`}
                          {result.years === 0 &&
                            result.months === 0 &&
                            result.days === 0 &&
                            "<1d"}
                        </p>
                        <p className="text-xs text-gray-500">Formatted Age</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-indigo-600">
                          {result.ageInDays.toLocaleString()} days
                        </p>
                        <p className="text-xs text-gray-500">
                          Total Age in Days
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Registration Details */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">
                        Registered On:
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {result.creationDate}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">
                        Full Date & Time:
                      </span>
                      <span className="text-sm text-gray-700">
                        {result.fullCreationDate}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Registrar:</span>
                      <span className="text-sm text-gray-700 break-all text-right max-w-[60%]">
                        {result.registrar}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Status:</span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {result.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">
                        Organization:
                      </span>
                      <span className="text-sm text-gray-700 break-all text-right max-w-[60%]">
                        {result.organization}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Country:</span>
                      <span className="text-sm text-gray-700">
                        {result.country}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">
                        Last Updated:
                      </span>
                      <span className="text-sm text-gray-700">
                        {result.updatedDate}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">
                        Expiry Date:
                      </span>
                      <span className="text-sm text-gray-700">
                        {result.expiryDate}
                      </span>
                    </div>
                    <div className="py-2">
                      <p className="text-sm text-gray-600 mb-1">Nameservers:</p>
                      <p className="text-sm text-gray-700 break-all">
                        {result.nameservers}
                      </p>
                    </div>
                  </div>

                  {/* SEO Note */}
                  <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-100 mt-4">
                    <p className="text-xs text-yellow-800 flex items-start gap-2">
                      <span className="font-bold">ℹ️</span>
                      Domain age is one of many factors that search engines
                      consider for ranking. Older domains may have an advantage,
                      but content quality matters most.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ToolPageShell>
  );
}
