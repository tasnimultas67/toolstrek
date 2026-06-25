"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Clock,
  Search,
  Plus,
  Trash2,
  Pin,
  PinOff,
  Globe,
  Calendar,
  Share2,
  Volume2,
  VolumeX,
  Moon,
  Sun,
  Sliders,
  Bell,
  X,
  Check,
  MapPin,
  RefreshCw,
  Info,
  CalendarDays
} from "lucide-react";
import ReactCountryFlag from "react-country-flag";
import ToolPageShell from "../ToolPageShell";

// Comprehensive database of 60 major global cities spanning all timezones
const ALL_CITIES = [
  { name: "Dhaka", country: "Bangladesh", code: "BD", timezone: "Asia/Dhaka" },
  { name: "Chittagong", country: "Bangladesh", code: "BD", timezone: "Asia/Dhaka" },
  { name: "Kolkata", country: "India", code: "IN", timezone: "Asia/Kolkata" },
  { name: "Mumbai", country: "India", code: "IN", timezone: "Asia/Kolkata" },
  { name: "New Delhi", country: "India", code: "IN", timezone: "Asia/Kolkata" },
  { name: "London", country: "United Kingdom", code: "GB", timezone: "Europe/London" },
  { name: "New York", country: "United States", code: "US", timezone: "America/New_York" },
  { name: "Tokyo", country: "Japan", code: "JP", timezone: "Asia/Tokyo" },
  { name: "Dubai", country: "United Arab Emirates", code: "AE", timezone: "Asia/Dubai" },
  { name: "Sydney", country: "Australia", code: "AU", timezone: "Australia/Sydney" },
  { name: "Singapore", country: "Singapore", code: "SG", timezone: "Asia/Singapore" },
  { name: "Berlin", country: "Germany", code: "DE", timezone: "Europe/Berlin" },
  { name: "Paris", country: "France", code: "FR", timezone: "Europe/Paris" },
  { name: "Moscow", country: "Russia", code: "RU", timezone: "Europe/Moscow" },
  { name: "São Paulo", country: "Brazil", code: "BR", timezone: "America/Sao_Paulo" },
  { name: "Cairo", country: "Egypt", code: "EG", timezone: "Africa/Cairo" },
  { name: "Beijing", country: "China", code: "CN", timezone: "Asia/Shanghai" },
  { name: "Mexico City", country: "Mexico", code: "MX", timezone: "America/Mexico_City" },
  { name: "Toronto", country: "Canada", code: "CA", timezone: "America/Toronto" },
  { name: "Auckland", country: "New Zealand", code: "NZ", timezone: "Pacific/Auckland" },
  { name: "Jakarta", country: "Indonesia", code: "ID", timezone: "Asia/Jakarta" },
  { name: "Istanbul", country: "Turkey", code: "TR", timezone: "Europe/Istanbul" },
  { name: "Nairobi", country: "Kenya", code: "KE", timezone: "Africa/Nairobi" },
  { name: "Los Angeles", country: "United States", code: "US", timezone: "America/Los_Angeles" },
  { name: "Chicago", country: "United States", code: "US", timezone: "America/Chicago" },
  { name: "Houston", country: "United States", code: "US", timezone: "America/Chicago" },
  { name: "San Francisco", country: "United States", code: "US", timezone: "America/Los_Angeles" },
  { name: "Miami", country: "United States", code: "US", timezone: "America/New_York" },
  { name: "Vancouver", country: "Canada", code: "CA", timezone: "America/Vancouver" },
  { name: "Buenos Aires", country: "Argentina", code: "AR", timezone: "America/Argentina/Buenos_Aires" },
  { name: "Santiago", country: "Chile", code: "CL", timezone: "America/Santiago" },
  { name: "Bogota", country: "Colombia", code: "CO", timezone: "America/Bogota" },
  { name: "Lima", country: "Peru", code: "PE", timezone: "America/Lima" },
  { name: "Lagos", country: "Nigeria", code: "NG", timezone: "Africa/Lagos" },
  { name: "Johannesburg", country: "South Africa", code: "ZA", timezone: "Africa/Johannesburg" },
  { name: "Cape Town", country: "South Africa", code: "ZA", timezone: "Africa/Johannesburg" },
  { name: "Madrid", country: "Spain", code: "ES", timezone: "Europe/Madrid" },
  { name: "Rome", country: "Italy", code: "IT", timezone: "Europe/Rome" },
  { name: "Amsterdam", country: "Netherlands", code: "NL", timezone: "Europe/Amsterdam" },
  { name: "Brussels", country: "Belgium", code: "BE", timezone: "Europe/Brussels" },
  { name: "Geneva", country: "Switzerland", code: "CH", timezone: "Europe/Zurich" },
  { name: "Athens", country: "Greece", code: "GR", timezone: "Europe/Athens" },
  { name: "Kyiv", country: "Ukraine", code: "UA", timezone: "Europe/Kyiv" },
  { name: "Bangkok", country: "Thailand", code: "TH", timezone: "Asia/Bangkok" },
  { name: "Kuala Lumpur", country: "Malaysia", code: "MY", timezone: "Asia/Kuala_Lumpur" },
  { name: "Manila", country: "Philippines", code: "PH", timezone: "Asia/Manila" },
  { name: "Seoul", country: "South Korea", code: "KR", timezone: "Asia/Seoul" },
  { name: "Hong Kong", country: "Hong Kong", code: "HK", timezone: "Asia/Hong_Kong" },
  { name: "Taipei", country: "Taiwan", code: "TW", timezone: "Asia/Taipei" },
  { name: "Riyadh", country: "Saudi Arabia", code: "SA", timezone: "Asia/Riyadh" },
  { name: "Tel Aviv", country: "Israel", code: "IL", timezone: "Asia/Jerusalem" },
  { name: "Tehran", country: "Iran", code: "IR", timezone: "Asia/Tehran" },
  { name: "Melbourne", country: "Australia", code: "AU", timezone: "Australia/Melbourne" },
  { name: "Brisbane", country: "Australia", code: "AU", timezone: "Australia/Brisbane" },
  { name: "Perth", country: "Australia", code: "AU", timezone: "Australia/Perth" },
  { name: "Honolulu", country: "United States", code: "US", timezone: "Pacific/Honolulu" },
  { name: "Casablanca", country: "Morocco", code: "MA", timezone: "Africa/Casablanca" },
  { name: "Stockholm", country: "Sweden", code: "SE", timezone: "Europe/Stockholm" },
  { name: "Anchorage", country: "United States", code: "US", timezone: "America/Anchorage" },
  { name: "Reykjavik", country: "Iceland", code: "IS", timezone: "Atlantic/Reykjavik" }
];

// Helper to get formatted timezone offset string (e.g. UTC +06:00)
const getUTCOffset = (timeZone, date) => {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "longOffset",
    });
    const parts = formatter.formatToParts(date);
    const offsetPart = parts.find((p) => p.type === "timeZoneName");
    if (!offsetPart) return "UTC+00:00";

    const val = offsetPart.value;
    if (val === "GMT") return "UTC+00:00";
    return val.replace("GMT", "UTC");
  } catch (e) {
    return "UTC+00:00";
  }
};

// Helper to calculate timezone differences in hours relative to a base timezone
const getTimeDifference = (targetTz, baseTz, date) => {
  try {
    // Format the date to local string in target and base zones
    const targetStr = date.toLocaleString("en-US", { timeZone: targetTz, hour12: false });
    const baseStr = date.toLocaleString("en-US", { timeZone: baseTz, hour12: false });

    const targetDate = new Date(targetStr);
    const baseDate = new Date(baseStr);

    const diffMs = targetDate.getTime() - baseDate.getTime();
    const diffHrs = diffMs / (1000 * 60 * 60);
    return diffHrs;
  } catch (e) {
    return 0;
  }
};

// Get hours, minutes, seconds, date info for timezone
const getTzValues = (date, timeZone) => {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      day: "numeric",
      month: "short",
      year: "numeric",
      weekday: "long",
      hour12: false,
    });
    const parts = formatter.formatToParts(date);

    const val = (type) => parts.find((p) => p.type === type)?.value;

    const hour = parseInt(val("hour") || 0);
    const minute = parseInt(val("minute") || 0);
    const second = parseInt(val("second") || 0);
    const day = val("day");
    const month = val("month");
    const year = val("year");
    const weekday = val("weekday");

    return { hour, minute, second, day, month, year, weekday };
  } catch (e) {
    return {
      hour: date.getHours(),
      minute: date.getMinutes(),
      second: date.getSeconds(),
      day: String(date.getDate()),
      month: "Jan",
      year: String(date.getFullYear()),
      weekday: "Monday",
    };
  }
};

// Simple synthesized sound for alarms using Web Audio API
const playAlarmChime = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const playTone = (freq, startTime, duration) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.2, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    // Play double beep chime
    playTone(587.33, ctx.currentTime, 0.35); // D5
    playTone(783.99, ctx.currentTime + 0.15, 0.5); // G5
  } catch (err) {
    console.error("Web Audio API Chime failed", err);
  }
};

export default function TimezoneClock() {
  const [liveTime, setLiveTime] = useState(null); // Date object (client-only initialized)
  const [timeTravelOffset, setTimeTravelOffset] = useState(0); // in minutes
  const [isTimeTraveling, setIsTimeTraveling] = useState(false);
  const [timeFormat, setTimeFormat] = useState("12h"); // 12h or 24h

  // Cities settings
  const [selectedCities, setSelectedCities] = useState([]);
  const [pinnedCities, setPinnedCities] = useState([]);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Local Timezone
  const [localTz, setLocalTz] = useState("UTC");

  // Alarms
  const [alarms, setAlarms] = useState([]);
  const [alarmCity, setAlarmCity] = useState("");
  const [alarmTime, setAlarmTime] = useState("12:00");
  const [alarmLabel, setAlarmLabel] = useState("");
  const [triggeredAlarm, setTriggeredAlarm] = useState(null);
  const lastTriggeredAlarmTime = useRef({}); // Tracks alarmId -> last triggered time in ms to avoid double-triggering

  // Meeting Planner Base City selection
  const [plannerBaseCity, setPlannerBaseCity] = useState("");

  // UI state feedback
  const [copiedLink, setCopiedLink] = useState(false);
  const searchRef = useRef(null);

  // Initialize and Sync on mount
  useEffect(() => {
    // 1. Detect local timezone
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Dhaka";
    setLocalTz(tz);

    // 2. Fetch or generate default selected cities
    const storedCities = localStorage.getItem("toolstrek_tz_cities");
    const storedPins = localStorage.getItem("toolstrek_tz_pinned");
    const storedFormat = localStorage.getItem("toolstrek_tz_format");
    const storedAlarms = localStorage.getItem("toolstrek_tz_alarms");

    if (storedFormat) setTimeFormat(storedFormat);
    if (storedAlarms) {
      try {
        setAlarms(JSON.parse(storedAlarms));
      } catch (e) {
        console.error(e);
      }
    }

    let citiesToLoad = [];
    let pinsToLoad = [];

    // Parse URL query parameter 'cities'
    const params = new URLSearchParams(window.location.search);
    const urlCities = params.get("cities");

    if (urlCities) {
      const names = urlCities.split(",").map(name => name.trim().toLowerCase());
      citiesToLoad = ALL_CITIES.filter(c => names.includes(c.name.toLowerCase()));
      // If we parsed successfully from URL, merge pins as empty
    } else if (storedCities) {
      try {
        const parsed = JSON.parse(storedCities);
        // Ensure valid cities from ALL_CITIES
        citiesToLoad = ALL_CITIES.filter(c => parsed.some(p => p.name === c.name));
      } catch (e) {
        console.error(e);
      }
    }

    // Default cities if none found
    if (citiesToLoad.length === 0) {
      const defaultNames = ["Dhaka", "London", "New York", "Tokyo", "Dubai", "Sydney"];
      citiesToLoad = ALL_CITIES.filter(c => defaultNames.includes(c.name));

      // Auto-add local timezone as local city if not present
      const localMatchedCity = ALL_CITIES.find(c => c.timezone === tz);
      if (localMatchedCity && !citiesToLoad.some(c => c.name === localMatchedCity.name)) {
        citiesToLoad.unshift(localMatchedCity);
      } else if (!localMatchedCity) {
        // Add custom local timezone node
        const customLocal = {
          name: "My Location",
          country: "Detected Timezone",
          code: "",
          timezone: tz
        };
        citiesToLoad.unshift(customLocal);
      }
    }

    if (storedPins) {
      try {
        const parsed = JSON.parse(storedPins);
        pinsToLoad = parsed.filter(name => citiesToLoad.some(c => c.name === name));
      } catch (e) {
        console.error(e);
      }
    }

    setSelectedCities(citiesToLoad);
    setPinnedCities(pinsToLoad);
    setLiveTime(new Date());

    // Setup base planner city to be the first city
    if (citiesToLoad.length > 0) {
      setPlannerBaseCity(citiesToLoad[0].name);
    }
  }, []);

  // Update live clock every second
  useEffect(() => {
    if (!liveTime) return;
    const interval = setInterval(() => {
      setLiveTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, [liveTime]);

  // Sync state changes to LocalStorage and URL query parameters
  const updateCitiesAndURL = useCallback((updatedCities, updatedPins) => {
    localStorage.setItem("toolstrek_tz_cities", JSON.stringify(updatedCities));
    localStorage.setItem("toolstrek_tz_pinned", JSON.stringify(updatedPins));

    // Sync to URL
    const names = updatedCities.map(c => c.name).join(",");
    const params = new URLSearchParams(window.location.search);
    if (names) {
      params.set("cities", names);
      window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`);
    } else {
      params.delete("cities");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  // Sync format changes
  const toggleTimeFormat = () => {
    const nextFormat = timeFormat === "12h" ? "24h" : "12h";
    setTimeFormat(nextFormat);
    localStorage.setItem("toolstrek_tz_format", nextFormat);
  };

  // Pinned/unpinned toggler
  const handleTogglePin = (cityName) => {
    let nextPins;
    if (pinnedCities.includes(cityName)) {
      nextPins = pinnedCities.filter(name => name !== cityName);
    } else {
      nextPins = [...pinnedCities, cityName];
    }
    setPinnedCities(nextPins);
    updateCitiesAndURL(selectedCities, nextPins);
  };

  // Remove city clock
  const handleRemoveCity = (cityName) => {
    const nextCities = selectedCities.filter(c => c.name !== cityName);
    const nextPins = pinnedCities.filter(name => name !== cityName);
    setSelectedCities(nextCities);
    setPinnedCities(nextPins);
    updateCitiesAndURL(nextCities, nextPins);

    // Adjust planner base city if removed
    if (plannerBaseCity === cityName && nextCities.length > 0) {
      setPlannerBaseCity(nextCities[0].name);
    }
  };

  // Add custom city clock
  const handleAddCity = (city) => {
    if (selectedCities.some(c => c.name.toLowerCase() === city.name.toLowerCase())) {
      setSearchQuery("");
      setShowSearchResults(false);
      return;
    }
    const nextCities = [...selectedCities, city];
    setSelectedCities(nextCities);
    updateCitiesAndURL(nextCities, pinnedCities);

    if (selectedCities.length === 0) {
      setPlannerBaseCity(city.name);
    }

    setSearchQuery("");
    setShowSearchResults(false);
  };

  // Share Dashboard
  const handleShareDashboard = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url)
      .then(() => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      })
      .catch((err) => console.error("Could not copy URL to clipboard", err));
  };

  // Check and trigger alarms
  useEffect(() => {
    if (!liveTime || alarms.length === 0) return;

    const nowMs = liveTime.getTime();
    alarms.forEach(alarm => {
      if (!alarm.active) return;

      const city = selectedCities.find(c => c.timezone === alarm.timezone);
      if (!city) return;

      const tzInfo = getTzValues(liveTime, alarm.timezone);
      const currentHourStr = String(tzInfo.hour).padStart(2, "0");
      const currentMinStr = String(tzInfo.minute).padStart(2, "0");
      const currentTzTime = `${currentHourStr}:${currentMinStr}`; // e.g. "14:30"

      if (currentTzTime === alarm.time) {
        const lastTriggered = lastTriggeredAlarmTime.current[alarm.id];
        // Only trigger if not triggered in the last 60 seconds (to avoid spamming within the same minute)
        if (!lastTriggered || (nowMs - lastTriggered) > 60000) {
          lastTriggeredAlarmTime.current[alarm.id] = nowMs;
          playAlarmChime();
          setTriggeredAlarm({
            ...alarm,
            cityName: city.name,
            actualTime: currentTzTime
          });
        }
      }
    });
  }, [liveTime, alarms, selectedCities]);

  // Add new alarm
  const handleAddAlarm = (e) => {
    e.preventDefault();
    if (!alarmCity) return;

    const cityObj = selectedCities.find(c => c.name === alarmCity);
    if (!cityObj) return;

    const newAlarm = {
      id: Math.random().toString(36).substring(2, 9),
      timezone: cityObj.timezone,
      time: alarmTime,
      label: alarmLabel.trim() || "Reminder",
      active: true
    };

    const nextAlarms = [...alarms, newAlarm];
    setAlarms(nextAlarms);
    localStorage.setItem("toolstrek_tz_alarms", JSON.stringify(nextAlarms));
    setAlarmLabel("");
  };

  // Remove alarm
  const handleRemoveAlarm = (alarmId) => {
    const nextAlarms = alarms.filter(a => a.id !== alarmId);
    setAlarms(nextAlarms);
    localStorage.setItem("toolstrek_tz_alarms", JSON.stringify(nextAlarms));
  };

  // Toggle alarm state
  const handleToggleAlarmActive = (alarmId) => {
    const nextAlarms = alarms.map(a => a.id === alarmId ? { ...a, active: !a.active } : a);
    setAlarms(nextAlarms);
    localStorage.setItem("toolstrek_tz_alarms", JSON.stringify(nextAlarms));
  };

  // Click outside to close search results
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtered search cities list
  const filteredCities = searchQuery.trim() === ""
    ? []
    : ALL_CITIES.filter(city =>
      city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      city.country.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 8);

  // Compute Active Time (incorporates time travel offset if enabled)
  const getActiveTime = () => {
    if (!liveTime) return new Date();
    if (timeTravelOffset === 0) return liveTime;
    return new Date(liveTime.getTime() + timeTravelOffset * 60000);
  };

  const activeTime = getActiveTime();

  // Quick preset adder
  const handleAddPreset = (name) => {
    const city = ALL_CITIES.find(c => c.name === name);
    if (city) handleAddCity(city);
  };

  // Sort cities: Pinned first, then standard order
  const sortedCities = [...selectedCities].sort((a, b) => {
    const aPinned = pinnedCities.includes(a.name);
    const bPinned = pinnedCities.includes(b.name);
    if (aPinned && !bPinned) return -1;
    if (!aPinned && bPinned) return 1;
    return 0;
  });

  return (
    <ToolPageShell widthClassName="max-w-7xl px-4 pt-20 pb-16">
      <div className="dark:text-slate-100 font-sans">

        {/* Header Title Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-500/10 text-violet-600 dark:text-violet-400 rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
            <Globe className="w-3.5 h-3.5 animate-spin-slow" />
            Global Time Sync
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-slate-900 via-violet-800 to-indigo-900 bg-clip-text text-transparent dark:from-white dark:via-violet-200 dark:to-indigo-300 tracking-tight mb-3">
            Timezone Clock & Converter
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto">
            Synchronized world clocks, advanced timeline meeting planner, visual daylight themes, and custom alarms. Built entirely client-side for maximum speed and privacy.
          </p>
        </div>

        {/* Alarm overlay notification */}
        {triggeredAlarm && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border-2 border-red-500 dark:border-red-400 rounded-2xl shadow-2xl p-6 max-w-md w-full animate-bounce-in">
              <div className="flex items-center gap-3 text-red-500 mb-4">
                <Bell className="w-8 h-8 animate-wiggle" />
                <h3 className="text-2xl font-bold">Alarm Ringing!</h3>
              </div>
              <p className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-1">
                {triggeredAlarm.label}
              </p>
              <p className="text-slate-600 dark:text-slate-400 mb-5">
                Target time reached in <span className="font-semibold text-violet-600 dark:text-violet-400">{triggeredAlarm.cityName}</span> at {triggeredAlarm.actualTime} ({triggeredAlarm.timezone}).
              </p>
              <button
                onClick={() => setTriggeredAlarm(null)}
                className="w-full py-3 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-red-500/20 outline-none flex items-center justify-center gap-2"
              >
                <VolumeX className="w-5 h-5" /> Dismiss Alarm
              </button>
            </div>
          </div>
        )}

        {/* Global Controls Panel */}
        <div className="relative z-30 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 p-6 mb-8 transition-all">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">

            {/* Search and Add Cities */}
            <div className="relative z-30" ref={searchRef}>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search city or country (e.g. London, Paris...)"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-slate-800 dark:text-slate-100 transition-all shadow-inner placeholder:text-slate-400 dark:placeholder:text-slate-600"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchResults(true);
                  }}
                  onFocus={() => setShowSearchResults(true)}
                />
              </div>

              {/* Search Dropdown */}
              {showSearchResults && filteredCities.length > 0 && (
                <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden animate-slide-down">
                  {filteredCities.map((city, idx) => {
                    const isAlreadySelected = selectedCities.some(c => c.name === city.name);
                    return (
                      <button
                        key={idx}
                        onClick={() => handleAddCity(city)}
                        disabled={isAlreadySelected}
                        className={`w-full flex items-center justify-between px-4 py-3 hover:bg-violet-50 dark:hover:bg-slate-800/50 text-left transition-all ${isAlreadySelected ? "opacity-45 cursor-not-allowed" : ""
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 flex items-center justify-center rounded-md overflow-hidden bg-slate-100 dark:bg-slate-800">
                            {city.code && (
                              <ReactCountryFlag
                                countryCode={city.code}
                                svg
                                style={{ width: "1.25rem", height: "1.25rem", objectFit: "cover" }}
                              />
                            )}
                          </span>
                          <div>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{city.name}</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">{city.country}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-slate-400 dark:text-slate-500 uppercase">{city.timezone.split("/")[0]}</span>
                          {isAlreadySelected ? (
                            <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" /> Added
                            </span>
                          ) : (
                            <Plus className="w-4 h-4 text-violet-500" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
              {showSearchResults && searchQuery.trim() !== "" && filteredCities.length === 0 && (
                <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-4 text-center text-slate-500 dark:text-slate-400">
                  No matching cities found in registry.
                </div>
              )}
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-2 items-center justify-center lg:justify-start">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Presets:</span>
              {["New York", "London", "Tokyo", "Sydney", "Dubai"].map(name => {
                const isSelected = selectedCities.some(c => c.name === name);
                return (
                  <button
                    key={name}
                    onClick={() => handleAddPreset(name)}
                    disabled={isSelected}
                    className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-all ${isSelected
                      ? "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600"
                      : "bg-white hover:bg-violet-50 dark:bg-slate-900 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-violet-300 dark:hover:border-violet-800"
                      }`}
                  >
                    + {name}
                  </button>
                );
              })}
            </div>

            {/* Global Settings & Share */}
            <div className="flex gap-3 justify-center lg:justify-end">
              <button
                onClick={toggleTimeFormat}
                className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-sm transition-all flex items-center gap-2"
                title="Toggle 12/24 hour display format"
              >
                <Clock className="w-4 h-4 text-violet-500" />
                Format: {timeFormat.toUpperCase()}
              </button>

              <button
                onClick={handleShareDashboard}
                className={`px-4 py-2.5 font-semibold rounded-xl text-sm transition-all flex items-center gap-2 border shadow-sm ${copiedLink
                  ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400"
                  : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-800 text-slate-700 dark:text-slate-300"
                  }`}
                title="Copy URL with current selected cities config to share"
              >
                {copiedLink ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4 text-violet-500" />}
                {copiedLink ? "Link Copied!" : "Share Clocks"}
              </button>
            </div>
          </div>
        </div>

        {/* Time Travel / Offset Slider Panel */}
        <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  Time Travel / Future Converter
                  {timeTravelOffset !== 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500 text-white uppercase rounded-md animate-pulse">
                      Mode Active
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Drag the slider to adjust hour offset dynamically and preview converted time across all cities.
                </p>
              </div>
            </div>
            {timeTravelOffset !== 0 && (
              <button
                onClick={() => {
                  setTimeTravelOffset(0);
                  setIsTimeTraveling(false);
                }}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg text-xs transition-all flex items-center gap-1.5 self-start md:self-auto shadow-md"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reset to Live
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold text-slate-400 font-mono">-24 Hours</span>
              <input
                type="range"
                min="-1440"
                max="1440"
                step="15" // increments of 15 mins
                value={timeTravelOffset}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setTimeTravelOffset(val);
                  setIsTimeTraveling(val !== 0);
                }}
                className="w-full h-2 bg-slate-100 dark:bg-slate-900 rounded-lg appearance-none cursor-pointer accent-violet-600 dark:accent-violet-500"
              />
              <span className="text-xs font-semibold text-slate-400 font-mono">+24 Hours</span>
            </div>

            <div className="flex justify-between items-center text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Offset Value:</span>
                <span className="font-mono bg-slate-200/60 dark:bg-slate-800 px-2 py-0.5 rounded text-violet-600 dark:text-violet-400 font-bold">
                  {timeTravelOffset === 0
                    ? "Live Time (0m)"
                    : `${timeTravelOffset > 0 ? "+" : ""}${Math.floor(timeTravelOffset / 60)}h ${Math.abs(timeTravelOffset % 60)}m`}
                </span>
              </div>
              <div className="hidden sm:block text-slate-400">
                Live updates suspended while browsing different offsets.
              </div>
            </div>
          </div>
        </div>

        {/* Selected Clocks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {sortedCities.map((city, idx) => {
            const isPinned = pinnedCities.includes(city.name);
            const tzInfo = getTzValues(activeTime, city.timezone);
            const offsetStr = getUTCOffset(city.timezone, activeTime);

            // Time relative difference calculations
            const relativeDiff = getTimeDifference(city.timezone, localTz, activeTime);
            const relativeDiffStr = relativeDiff === 0
              ? "Same as local"
              : `${Math.abs(relativeDiff)}h ${relativeDiff > 0 ? "ahead" : "behind"}`;

            // Day / Night Theme (day between 6 AM and 6 PM)
            const isDay = tzInfo.hour >= 6 && tzInfo.hour < 18;

            // Formatted Digital Time
            let formattedTime = "";
            let period = "";
            if (timeFormat === "12h") {
              const displayHour = tzInfo.hour % 12 === 0 ? 12 : tzInfo.hour % 12;
              period = tzInfo.hour >= 12 ? "PM" : "AM";
              formattedTime = `${String(displayHour).padStart(2, "0")}:${String(tzInfo.minute).padStart(2, "0")}:${String(tzInfo.second).padStart(2, "0")}`;
            } else {
              formattedTime = `${String(tzInfo.hour).padStart(2, "0")}:${String(tzInfo.minute).padStart(2, "0")}:${String(tzInfo.second).padStart(2, "0")}`;
            }

            // Analog Clock Angles
            const hrAngle = ((tzInfo.hour % 12) * 30) + (tzInfo.minute * 0.5);
            const minAngle = (tzInfo.minute * 6) + (tzInfo.second * 0.1);
            const secAngle = tzInfo.second * 6;

            return (
              <div
                key={city.name}
                className={`relative overflow-hidden rounded-3xl shadow-xl border transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${isDay
                  ? "bg-gradient-to-br from-amber-50/40 via-white to-violet-50/20 border-white/40 dark:from-slate-800 dark:via-slate-800 dark:to-slate-700/50 dark:border-slate-700/50"
                  : "bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950/80 border-indigo-950 dark:from-slate-900 dark:via-slate-950 dark:to-indigo-950/80 dark:border-indigo-900/50 text-white"
                  }`}
              >
                {/* Visual Accent Glow */}
                <div className={`pointer-events-none absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 -mr-10 -mt-10 ${isDay ? "bg-amber-400" : "bg-violet-600"
                  }`} />

                {/* Card Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-100/50 dark:border-slate-700/30">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 flex items-center justify-center rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 flex-shrink-0">
                      {city.code ? (
                        <ReactCountryFlag
                          countryCode={city.code}
                          svg
                          style={{ width: "1.5rem", height: "1.5rem", objectFit: "cover" }}
                        />
                      ) : (
                        <MapPin className="w-4 h-4 text-violet-500" />
                      )}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-extrabold text-lg tracking-tight truncate max-w-[130px] lg:max-w-[160px] dark:text-white">
                          {city.name}
                        </h4>
                        {city.name === "My Location" && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-violet-600 text-white rounded font-semibold uppercase">Me</span>
                        )}
                      </div>
                      <p className={`text-xs ${isDay ? "text-slate-500 dark:text-slate-400" : "text-slate-400"}`}>
                        {city.country}
                      </p>
                    </div>
                  </div>

                  {/* Actions (Pin, Delete) */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleTogglePin(city.name)}
                      className={`p-1.5 rounded-lg transition-all ${isPinned
                        ? "text-violet-600 bg-violet-100/60 dark:text-violet-400 dark:bg-violet-950/40"
                        : `hover:bg-slate-100 dark:hover:bg-slate-800 ${isDay ? "text-slate-400" : "text-slate-500"}`
                        }`}
                      title={isPinned ? "Unpin Favorite" : "Pin Favorite"}
                    >
                      {isPinned ? <Pin className="w-4 h-4 fill-violet-600 dark:fill-violet-400" /> : <PinOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleRemoveCity(city.name)}
                      className={`p-1.5 rounded-lg hover:bg-red-500/10 hover:text-red-500 transition-all ${isDay ? "text-slate-400" : "text-slate-500"
                        }`}
                      title="Remove clock"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 flex flex-col items-center">

                  {/* Visual Analog Clock */}
                  <div className="mb-6 relative">
                    <svg width="100" height="100" className="drop-shadow-md">
                      {/* Dial Face */}
                      <circle
                        cx="50"
                        cy="50"
                        r="47"
                        className={`${isDay
                          ? "fill-slate-50/60 stroke-slate-200 dark:fill-slate-900/60 dark:stroke-slate-700"
                          : "fill-slate-950/60 stroke-slate-800"
                          }`}
                        strokeWidth="2.5"
                      />

                      {/* Day Night Indicator Graphic inside clock */}
                      <circle
                        cx="50"
                        cy="28"
                        r="6"
                        className={`${isDay ? "fill-amber-400" : "fill-indigo-500 opacity-60"}`}
                      />
                      {/* Hour ticks */}
                      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                        <line
                          key={deg}
                          x1="50"
                          y1="6"
                          x2="50"
                          y2="9"
                          transform={`rotate(${deg} 50 50)`}
                          className={`${isDay ? "stroke-slate-300 dark:stroke-slate-700" : "stroke-slate-700"}`}
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      ))}

                      {/* Hour Hand */}
                      <line
                        x1="50"
                        y1="50"
                        x2="50"
                        y2="28"
                        transform={`rotate(${hrAngle} 50 50)`}
                        className={`${isDay ? "stroke-slate-800 dark:stroke-slate-100" : "stroke-slate-100"}`}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />

                      {/* Minute Hand */}
                      <line
                        x1="50"
                        y1="50"
                        x2="50"
                        y2="18"
                        transform={`rotate(${minAngle} 50 50)`}
                        className={`${isDay ? "stroke-slate-600 dark:stroke-slate-300" : "stroke-slate-300"}`}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />

                      {/* Second Hand */}
                      <line
                        x1="50"
                        y1="50"
                        x2="50"
                        y2="14"
                        transform={`rotate(${secAngle} 50 50)`}
                        stroke="#f43f5e"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                      />

                      {/* Pin Center */}
                      <circle cx="50" cy="50" r="3" fill="#f43f5e" />
                    </svg>
                  </div>

                  {/* Day Night text badge */}
                  <div className="mb-2">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${isDay
                      ? "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400"
                      : "bg-indigo-500/20 text-indigo-300"
                      }`}>
                      {isDay ? <Sun className="w-3.5 h-3.5 animate-spin-slow" /> : <Moon className="w-3.5 h-3.5 text-indigo-400" />}
                      {isDay ? "Daytime" : "Night"}
                    </span>
                  </div>

                  {/* Digital Clock */}
                  <div className="text-3xl font-extrabold font-mono tracking-wider mb-1 text-center select-all select-none">
                    {formattedTime}
                    {period && <span className="text-base font-bold ml-1 text-violet-500">{period}</span>}
                  </div>

                  {/* Date Display */}
                  <div className={`text-sm text-center mb-4 ${isDay ? "text-slate-600 dark:text-slate-400" : "text-slate-300"
                    }`}>
                    {tzInfo.weekday}, {tzInfo.month} {tzInfo.day}, {tzInfo.year}
                  </div>

                  {/* UTC & Difference Badges */}
                  <div className="w-full flex justify-center gap-2">
                    <span className={`text-[10px] px-2 py-1 font-mono rounded font-semibold ${isDay ? "bg-slate-100 text-slate-600 dark:bg-slate-900/60 dark:text-slate-400" : "bg-slate-900 text-slate-400"
                      }`}>
                      {offsetStr}
                    </span>
                    <span className={`text-[10px] px-2 py-1 font-mono rounded font-semibold ${relativeDiff === 0
                      ? "bg-teal-500/10 text-teal-600 dark:text-teal-400"
                      : relativeDiff > 0
                        ? "bg-violet-500/15 text-violet-600 dark:text-violet-400"
                        : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                      }`}>
                      {relativeDiffStr}
                    </span>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {/* Meeting Planner Section (Advanced Option) */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg">
                <CalendarDays className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200">
                  Meeting Planner & Hours Matrix
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select a base city to view hourly overlap with all other cities. Color index: Green (Working Hours), Yellow (Personal), Purple (Sleep).
                </p>
              </div>
            </div>

            {/* Base City Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 uppercase">Base City:</span>
              <select
                value={plannerBaseCity}
                onChange={(e) => setPlannerBaseCity(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-lg text-xs transition-all outline-none"
              >
                {selectedCities.map(c => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {selectedCities.length === 0 ? (
            <div className="text-center p-8 text-slate-500 dark:text-slate-400 text-sm">
              Please add at least one city clock above to unlock the planner matrix.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[800px] space-y-3 pb-3">
                {/* Hour Header */}
                <div className="flex items-center text-[10px] font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <div className="w-[180px] flex-shrink-0 pl-2">City (Timezone)</div>
                  <div className="flex-1 grid grid-cols-24 gap-1 text-center font-mono">
                    {Array.from({ length: 24 }).map((_, h) => (
                      <span key={h} className="block">{String(h).padStart(2, "0")}</span>
                    ))}
                  </div>
                </div>

                {/* Cities Matrix Rows */}
                {selectedCities.map(city => {
                  const baseCityObj = selectedCities.find(c => c.name === plannerBaseCity) || selectedCities[0];

                  // Compute difference offset in hours
                  const diffHours = getTimeDifference(city.timezone, baseCityObj.timezone, activeTime);

                  return (
                    <div key={city.name} className="flex items-center hover:bg-slate-50/50 dark:hover:bg-slate-700/20 py-2 rounded-lg transition-all">
                      {/* Name */}
                      <div className="w-[180px] flex-shrink-0 flex items-center gap-2 pl-2">
                        <span className="w-5 h-5 flex items-center justify-center rounded overflow-hidden flex-shrink-0 bg-slate-100 dark:bg-slate-800">
                          {city.code && (
                            <ReactCountryFlag
                              countryCode={city.code}
                              svg
                              style={{ width: "1rem", height: "1rem", objectFit: "cover" }}
                            />
                          )}
                        </span>
                        <div className="truncate">
                          <span className="font-semibold text-xs text-slate-700 dark:text-slate-300">{city.name}</span>
                          <span className="block text-[9px] text-slate-400 font-mono">
                            {diffHours === 0 ? "Base" : `${diffHours > 0 ? "+" : ""}${diffHours}h`}
                          </span>
                        </div>
                      </div>

                      {/* Hour Grid */}
                      <div className="flex-1 grid grid-cols-24 gap-1">
                        {Array.from({ length: 24 }).map((_, baseHour) => {
                          // Calculate hour in this target city corresponding to baseHour in plannerBaseCity
                          // targetHour = baseHour + diffHours
                          let targetHour = (baseHour + diffHours) % 24;
                          if (targetHour < 0) targetHour += 24;
                          targetHour = Math.floor(targetHour);

                          // Color logic:
                          // Working: 9:00 - 17:00 (9 to 17) -> green
                          // Personal: 6:00 - 9:00, 17:00 - 22:00 -> yellow
                          // Sleeping: 22:00 - 6:00 -> purple
                          let bgClass = "";
                          let tooltip = "";
                          if (targetHour >= 9 && targetHour <= 17) {
                            bgClass = "bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20";
                            tooltip = "Working hours";
                          } else if ((targetHour >= 6 && targetHour < 9) || (targetHour > 17 && targetHour <= 22)) {
                            bgClass = "bg-amber-500/20 hover:bg-amber-500/40 text-amber-600 dark:text-amber-400 border border-amber-500/20";
                            tooltip = "Personal hours";
                          } else {
                            bgClass = "bg-violet-500/10 hover:bg-violet-500/25 text-violet-400 dark:text-violet-500 border border-violet-500/10";
                            tooltip = "Sleeping / Night";
                          }

                          return (
                            <button
                              key={baseHour}
                              onClick={() => {
                                // Set time travel offset based on the diff in hours
                                // Current active time is liveTime
                                if (liveTime) {
                                  // Base hour local time target minus current base hour local time
                                  const tzInfo = getTzValues(liveTime, baseCityObj.timezone);
                                  const diffMins = (baseHour - tzInfo.hour) * 60 - tzInfo.minute;
                                  setTimeTravelOffset(diffMins);
                                  setIsTimeTraveling(true);
                                }
                              }}
                              className={`py-1 rounded text-[10px] font-mono text-center font-bold transition-all relative group ${bgClass}`}
                              title={`${city.name}: ${String(targetHour).padStart(2, "0")}:00 (${tooltip})`}
                            >
                              {targetHour}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Alarms and Reminders Section (Advanced Option) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Add Alarm Form */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 p-6 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-violet-500/10 text-violet-500 rounded-lg">
                <Bell className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200">Set Timezone Alarm</h3>
            </div>

            <form onSubmit={handleAddAlarm} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                  Target City
                </label>
                <select
                  value={alarmCity}
                  onChange={(e) => setAlarmCity(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-100 transition-all outline-none"
                >
                  <option value="">Select City</option>
                  {selectedCities.map(c => (
                    <option key={c.name} value={c.name}>{c.name} ({getUTCOffset(c.timezone, activeTime)})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                  Local Time (HH:MM)
                </label>
                <input
                  type="time"
                  value={alarmTime}
                  onChange={(e) => setAlarmTime(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-100 transition-all outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                  Reminder Label
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sync Standup"
                  value={alarmLabel}
                  onChange={(e) => setAlarmLabel(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-100 transition-all outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={selectedCities.length === 0}
                className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
              >
                + Add Alert
              </button>
            </form>
          </div>

          {/* Active Alarms List */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-500/10 text-indigo-500 rounded-lg">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200">Active Reminders</h3>
              </div>
              <span className="text-xs font-semibold text-slate-400 px-2 py-0.5 bg-slate-100 dark:bg-slate-950 rounded">
                Total: {alarms.length}
              </span>
            </div>

            {alarms.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-slate-400 dark:text-slate-500 text-sm text-center">
                <Volume2 className="w-8 h-8 opacity-20 mb-2" />
                No custom timezone alerts configured.
                <span className="text-[11px] block mt-1 text-slate-400 dark:text-slate-600">Alarms trigger an in-app ring chime when the city local time hits the target.</span>
              </div>
            ) : (
              <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
                {alarms.map(alarm => {
                  const targetCity = ALL_CITIES.find(c => c.timezone === alarm.timezone);
                  const isCurrentCitySelected = selectedCities.some(c => c.timezone === alarm.timezone);

                  return (
                    <div
                      key={alarm.id}
                      className={`flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900 border rounded-xl transition-all ${alarm.active ? "border-slate-200 dark:border-slate-800" : "border-slate-200/55 dark:border-slate-900/50 opacity-55"
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={alarm.active}
                          onChange={() => handleToggleAlarmActive(alarm.id)}
                          className="mt-1 rounded border-slate-300 text-violet-600 focus:ring-violet-500 cursor-pointer w-4 h-4"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-extrabold text-slate-800 dark:text-slate-100">
                              {alarm.time}
                            </span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 bg-violet-100/60 dark:bg-slate-800 text-violet-600 dark:text-violet-400 rounded">
                              {targetCity?.name || "World"}
                            </span>
                            {!isCurrentCitySelected && (
                              <span className="text-[9px] text-amber-500 font-semibold" title="City clock is currently not active in dashboard">
                                (inactive)
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            {alarm.label}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveAlarm(alarm.id)}
                        className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                        title="Delete Alert"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Privacy Note Footer */}
        <div className="mt-10 flex items-center justify-center gap-2 text-xs text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-900/20 py-3 rounded-xl border border-slate-100 dark:border-slate-800/40">
          <Info className="w-4 h-4 text-violet-400 flex-shrink-0" />
          <span>Privacy First: All configs, favorites, and alarm states are stored 100% locally in your browser. No data ever leaves your device.</span>
        </div>

      </div>
    </ToolPageShell>
  );
}
