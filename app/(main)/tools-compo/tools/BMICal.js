"use client";
import React, { useState } from "react";
import ToolPageShell from "../ToolPageShell";

const BMICal = () => {
  const [weight, setWeight] = useState("");
  const [heightFeet, setHeightFeet] = useState("");
  const [heightInches, setHeightInches] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("female");
  const [unitSystem, setUnitSystem] = useState("metric");
  const [bmiResult, setBmiResult] = useState(null);
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [idealWeightRange, setIdealWeightRange] = useState({
    min: null,
    max: null,
  });
  const [showTips, setShowTips] = useState(true);

  const calculateBMI = () => {
    // Validate inputs
    if (!weight || parseFloat(weight) <= 0) {
      alert("Please enter a valid weight");
      return;
    }

    let heightInMeters = 0;
    let heightInInches = 0;

    if (unitSystem === "metric") {
      if (!heightCm || parseFloat(heightCm) <= 0) {
        alert("Please enter a valid height in centimeters");
        return;
      }
      heightInMeters = parseFloat(heightCm) / 100;
      heightInInches = parseFloat(heightCm) / 2.54;
    } else {
      if (!heightFeet && !heightInches) {
        alert("Please enter your height");
        return;
      }
      const feet = parseFloat(heightFeet) || 0;
      const inches = parseFloat(heightInches) || 0;
      if (feet === 0 && inches === 0) {
        alert("Please enter a valid height");
        return;
      }
      heightInInches = feet * 12 + inches;
      heightInMeters = heightInInches * 0.0254;
    }

    let bmiValue = 0;
    const weightNum = parseFloat(weight);

    if (unitSystem === "metric") {
      bmiValue = weightNum / (heightInMeters * heightInMeters);
    } else {
      bmiValue = (weightNum / (heightInInches * heightInInches)) * 703;
    }

    // Round to 1 decimal place
    bmiValue = Math.round(bmiValue * 10) / 10;
    setBmiResult(bmiValue);

    // Adjust categories based on age
    let adjustedLower = 18.5;
    let adjustedUpper = 24.9;
    const ageNum = parseInt(age);

    if (ageNum && ageNum >= 65) {
      adjustedLower = 23;
      adjustedUpper = 27;
    } else if (ageNum && ageNum <= 18 && ageNum > 0) {
      adjustedLower = 15;
      adjustedUpper = 24;
    }

    // Determine category
    let newCategory = "";
    let newMessage = "";

    if (bmiValue < adjustedLower) {
      newCategory = "Underweight";
      if (ageNum && ageNum >= 65) {
        newMessage =
          "Being underweight at your age may increase health risks. Consider consulting a nutritionist.";
      } else {
        newMessage =
          "You may need to gain some weight. Consider a balanced diet with nutrient-rich foods.";
      }
    } else if (bmiValue >= adjustedLower && bmiValue < adjustedUpper) {
      newCategory = "Healthy weight";
      if (ageNum && ageNum >= 65) {
        newMessage =
          "Excellent! Your BMI is in the ideal range for healthy aging. Keep up the good work!";
      } else {
        newMessage =
          "Great job! Keep maintaining a balanced diet and regular physical activity.";
      }
    } else if (bmiValue >= adjustedUpper && bmiValue < 29.9) {
      newCategory = "Overweight";
      if (ageNum && ageNum >= 65) {
        newMessage =
          "Your BMI is slightly above the ideal range for seniors. Small changes can make a big difference.";
      } else {
        newMessage =
          "Consider incorporating more exercise and a healthier diet to reach your goals.";
      }
    } else if (bmiValue >= 30 && bmiValue < 35) {
      newCategory = "Obesity Class I";
      newMessage =
        "Consulting with a healthcare provider for a personalized plan could be beneficial.";
    } else if (bmiValue >= 35 && bmiValue < 40) {
      newCategory = "Obesity Class II";
      newMessage =
        "It's recommended to seek medical advice for a sustainable health plan.";
    } else if (bmiValue >= 40) {
      newCategory = "Obesity Class III";
      newMessage =
        "Please consult a doctor or nutritionist for professional guidance.";
    }

    setCategory(newCategory);
    setMessage(newMessage);

    // Calculate ideal weight range
    calculateIdealWeightRange(heightInMeters, heightInInches);
  };

  const calculateIdealWeightRange = (heightInMeters, heightInInches) => {
    let minIdeal = 0;
    let maxIdeal = 0;

    if (unitSystem === "metric") {
      if (gender === "female") {
        minIdeal = 49 + 1.7 * (heightInMeters * 100 - 152.4);
        maxIdeal = 59 + 1.7 * (heightInMeters * 100 - 152.4);
      } else {
        minIdeal = 52 + 1.9 * (heightInMeters * 100 - 152.4);
        maxIdeal = 62 + 1.9 * (heightInMeters * 100 - 152.4);
      }

      const ageNum = parseInt(age);
      if (ageNum && ageNum >= 65) {
        minIdeal = minIdeal * 0.95;
        maxIdeal = maxIdeal * 1.05;
      }

      setIdealWeightRange({
        min: Math.round(minIdeal * 10) / 10,
        max: Math.round(maxIdeal * 10) / 10,
      });
    } else {
      if (gender === "female") {
        minIdeal = 108 + 3.7 * (heightInInches - 60);
        maxIdeal = 130 + 3.7 * (heightInInches - 60);
      } else {
        minIdeal = 115 + 4.2 * (heightInInches - 60);
        maxIdeal = 137 + 4.2 * (heightInInches - 60);
      }

      const ageNum = parseInt(age);
      if (ageNum && ageNum >= 65) {
        minIdeal = minIdeal * 0.95;
        maxIdeal = maxIdeal * 1.05;
      }

      setIdealWeightRange({
        min: Math.round(minIdeal * 10) / 10,
        max: Math.round(maxIdeal * 10) / 10,
      });
    }
  };

  const handleWeightChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setWeight(value);
    }
  };

  const handleHeightCmChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setHeightCm(value);
    }
  };

  const handleHeightFeetChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setHeightFeet(value);
    }
  };

  const handleHeightInchesChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setHeightInches(value);
    }
  };

  const handleAgeChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^\d*$/.test(value)) {
      setAge(value);
    }
  };

  const resetForm = () => {
    setWeight("");
    setHeightFeet("");
    setHeightInches("");
    setHeightCm("");
    setAge("");
    setGender("female");
    setBmiResult(null);
    setCategory("");
    setMessage("");
    setIdealWeightRange({ min: null, max: null });
  };

  const getHealthRiskLevel = () => {
    if (!bmiResult) return null;
    const ageNum = parseInt(age);

    if (bmiResult < 18.5)
      return {
        level: "Low",
        color: "text-amber-600",
        bg: "bg-amber-50",
        icon: "⚠️",
      };
    if (bmiResult >= 18.5 && bmiResult < 25) {
      if (ageNum && ageNum >= 65 && bmiResult < 23)
        return {
          level: "Moderate",
          color: "text-orange-600",
          bg: "bg-orange-50",
          icon: "📊",
        };
      return {
        level: "Low",
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        icon: "✅",
      };
    }
    if (bmiResult >= 25 && bmiResult < 30)
      return {
        level: "Moderate",
        color: "text-orange-600",
        bg: "bg-orange-50",
        icon: "⚠️",
      };
    return {
      level: "High",
      color: "text-rose-600",
      bg: "bg-rose-50",
      icon: "🔴",
    };
  };

  const getPersonalizedTips = () => {
    if (!bmiResult) return [];

    const tips = [];
    const ageNum = parseInt(age);

    if (category === "Underweight") {
      tips.push({
        title: "🥗 Nutrition Tips",
        items: [
          "Eat smaller, frequent meals throughout the day",
          "Include healthy fats like nuts, avocados, and olive oil",
          "Add protein-rich foods to every meal (eggs, fish, legumes)",
          "Try smoothies with protein powder and fruits",
        ],
      });
      tips.push({
        title: "💪 Exercise Suggestions",
        items: [
          "Focus on strength training to build muscle mass",
          "Light resistance exercises 2-3 times per week",
          "Yoga for overall body strength and flexibility",
        ],
      });
    } else if (category === "Healthy weight") {
      tips.push({
        title: "🌟 Maintenance Tips",
        items: [
          "Continue your balanced diet with variety",
          "Aim for 150 minutes of moderate exercise weekly",
          "Stay hydrated with 8+ glasses of water daily",
          "Get 7-9 hours of quality sleep",
        ],
      });
      tips.push({
        title: "🏃‍♂️ Activity Recommendations",
        items: [
          "Mix cardio and strength training",
          "Try new activities to stay motivated",
          "Take regular walking breaks if sedentary",
        ],
      });
    } else if (category === "Overweight") {
      tips.push({
        title: "🍎 Dietary Changes",
        items: [
          "Reduce processed foods and added sugars",
          "Increase fiber intake (vegetables, whole grains)",
          "Control portion sizes using smaller plates",
          "Limit sugary drinks and alcohol",
        ],
      });
      tips.push({
        title: "🏋️ Weight Loss Strategies",
        items: [
          "Start with 30-minute daily walks",
          "HIIT workouts for efficient calorie burning",
          "Track your food intake with an app",
          "Set realistic weekly weight loss goals (1-2 lbs)",
        ],
      });
    } else {
      tips.push({
        title: "🩺 Medical Guidance Needed",
        items: [
          "Schedule a check-up with your healthcare provider",
          "Ask about supervised weight management programs",
          "Consider working with a registered dietitian",
          "Discuss any underlying health conditions",
        ],
      });
      tips.push({
        title: "🏥 Initial Steps",
        items: [
          "Start with low-impact activities like swimming",
          "Focus on small, sustainable diet changes",
          "Join a support group for accountability",
          "Track your progress weekly",
        ],
      });
    }

    // Age-specific tips
    if (ageNum && ageNum >= 65) {
      tips.push({
        title: "👴 Senior Health Focus",
        items: [
          "Focus on bone density with calcium-rich foods",
          "Include balance exercises to prevent falls",
          "Monitor protein intake to prevent muscle loss",
          "Stay socially active for mental wellbeing",
        ],
      });
    } else if (ageNum && ageNum <= 18 && ageNum > 0) {
      tips.push({
        title: "🧒 Youth Health Guide",
        items: [
          "Focus on healthy habits, not strict dieting",
          "Stay active with sports you enjoy",
          "Eat balanced meals for growth and development",
          "Limit screen time and encourage outdoor play",
        ],
      });
    }

    return tips;
  };

  const healthRisk = getHealthRiskLevel();
  const personalizedTips = getPersonalizedTips();

  return (
    <ToolPageShell widthClassName="max-w-6xl">
      <div className="font-sans">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-500 to-blue-600 px-6 py-8 sm:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            BMI Calculator
          </h1>
          <p className="text-teal-100 mt-2 text-base sm:text-lg">
            Get personalized insights with age, gender, and health
            recommendations
          </p>
        </div>

        <div className="p-6 sm:p-8">
          {/* Unit Toggle */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <span className="text-gray-700 font-medium">
                Measurement System
              </span>
              <div className="flex bg-gray-100 rounded-xl p-1 w-full sm:w-auto">
                <button
                  onClick={() => {
                    setUnitSystem("metric");
                    setHeightFeet("");
                    setHeightInches("");
                  }}
                  className={`flex-1 px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                    unitSystem === "metric"
                      ? "bg-white text-teal-600 shadow-sm ring-1 ring-teal-200"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  Metric (kg, cm)
                </button>
                <button
                  onClick={() => {
                    setUnitSystem("imperial");
                    setHeightCm("");
                  }}
                  className={`flex-1 px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                    unitSystem === "imperial"
                      ? "bg-white text-teal-600 shadow-sm ring-1 ring-teal-200"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  Imperial (lbs, ft/in)
                </button>
              </div>
            </div>
          </div>

          {/* Personal Info Section */}
          <div className="mb-8">
            <h2 className="text-gray-800 font-semibold mb-4 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-teal-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Personal Information
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Gender
                </label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setGender("female")}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                      gender === "female"
                        ? "bg-teal-50 text-teal-700 border-2 border-teal-300"
                        : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
                    }`}
                  >
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
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Female
                  </button>
                  <button
                    onClick={() => setGender("male")}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                      gender === "male"
                        ? "bg-teal-50 text-teal-700 border-2 border-teal-300"
                        : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
                    }`}
                  >
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
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Male
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Age (years)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={age}
                  onChange={handleAgeChange}
                  placeholder="Enter your age"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-gray-800 placeholder-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Body Measurements */}
          <div className="mb-8">
            <h2 className="text-gray-800 font-semibold mb-4 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-teal-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                />
              </svg>
              Body Measurements
            </h2>

            {/* Weight Field */}
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                Weight {unitSystem === "metric" ? "(kg)" : "(lbs)"}
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="decimal"
                  value={weight}
                  onChange={handleWeightChange}
                  placeholder={`Enter your weight in ${unitSystem === "metric" ? "kilograms" : "pounds"}`}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-gray-800 placeholder-gray-400"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  {unitSystem === "metric" ? "kg" : "lbs"}
                </span>
              </div>
            </div>

            {/* Height Fields */}
            {unitSystem === "metric" ? (
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Height (cm)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={heightCm}
                    onChange={handleHeightCmChange}
                    placeholder="Enter your height in centimeters"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-gray-800 placeholder-gray-400"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                    cm
                  </span>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Height (feet & inches)
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={heightFeet}
                      onChange={handleHeightFeetChange}
                      placeholder="Feet"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-gray-800 placeholder-gray-400"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                      ft
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={heightInches}
                      onChange={handleHeightInchesChange}
                      placeholder="Inches"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-gray-800 placeholder-gray-400"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                      in
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={calculateBMI}
              className="flex-1 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Calculate BMI
            </button>
            <button
              onClick={resetForm}
              className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200"
            >
              Reset
            </button>
          </div>

          {/* Results Section */}
          {bmiResult !== null && (
            <div className="border-t border-gray-100 pt-8 animate-fadeIn">
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Left Column - BMI Score */}
                  <div className="text-center lg:text-left">
                    <span className="text-sm uppercase tracking-wider text-gray-500 font-medium">
                      Your BMI Score
                    </span>
                    <div className="text-6xl font-bold text-gray-800 mt-2">
                      {bmiResult}
                    </div>
                    <div className="mt-3 space-y-2">
                      <span
                        className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold ${
                          category === "Healthy weight"
                            ? "bg-emerald-100 text-emerald-700"
                            : category === "Underweight"
                              ? "bg-amber-100 text-amber-700"
                              : category === "Overweight"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {category}
                      </span>

                      {/* Health Risk Indicator */}
                      {healthRisk && (
                        <div
                          className={`inline-block ml-2 px-4 py-1.5 rounded-full text-sm font-semibold ${healthRisk.bg} ${healthRisk.color}`}
                        >
                          {healthRisk.icon} {healthRisk.level} Health Risk
                        </div>
                      )}
                    </div>

                    {/* Ideal Weight Range */}
                    {idealWeightRange.min && idealWeightRange.max && (
                      <div className="mt-4 p-3 bg-teal-50 rounded-lg">
                        <p className="text-sm text-teal-800 font-medium">
                          Ideal weight range for your profile:
                        </p>
                        <p className="text-lg font-semibold text-teal-900">
                          {idealWeightRange.min} - {idealWeightRange.max}{" "}
                          {unitSystem === "metric" ? "kg" : "lbs"}
                        </p>
                      </div>
                    )}

                    {/* Healthy BMI Range */}
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800 font-medium">
                        Healthy BMI Range:
                      </p>
                      <p className="text-base font-semibold text-blue-900">
                        18.5 - 24.9
                        {parseInt(age) >= 65 && (
                          <span className="text-sm font-normal text-blue-700 block mt-1">
                            (Adjusted for seniors: 23-27)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Right Column - Health Message */}
                  <div>
                    <div className="bg-blue-50 rounded-xl p-5 border border-blue-100 h-full">
                      <div className="flex gap-3">
                        <svg
                          className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5"
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
                        <div>
                          <p className="text-gray-700 leading-relaxed font-medium mb-1">
                            Health Insight
                          </p>
                          <p className="text-gray-600 leading-relaxed">
                            {message}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* BMI Scale Indicator */}
                <div className="mt-8">
                  <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="absolute h-full bg-gradient-to-r from-amber-400 via-emerald-400 to-rose-400"
                      style={{
                        width: `${Math.min(100, Math.max(0, (bmiResult / 45) * 100))}%`,
                      }}
                    ></div>
                    <div
                      className="absolute w-0.5 h-4 bg-gray-700 top-1/2 -translate-y-1/2"
                      style={{ left: `${(18.5 / 45) * 100}%` }}
                    ></div>
                    <div
                      className="absolute w-0.5 h-4 bg-gray-700 top-1/2 -translate-y-1/2"
                      style={{ left: `${(25 / 45) * 100}%` }}
                    ></div>
                    <div
                      className="absolute w-0.5 h-4 bg-gray-700 top-1/2 -translate-y-1/2"
                      style={{ left: `${(30 / 45) * 100}%` }}
                    ></div>
                    <div
                      className="absolute w-0.5 h-4 bg-gray-700 top-1/2 -translate-y-1/2"
                      style={{ left: `${(35 / 45) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-gray-500">
                    <span>Underweight</span>
                    <span>Healthy</span>
                    <span>Overweight</span>
                    <span>Obese I</span>
                    <span>Obese II+</span>
                  </div>
                </div>

                {/* Personalized Tips Section */}
                {personalizedTips.length > 0 && (
                  <div className="mt-8">
                    <button
                      onClick={() => setShowTips(!showTips)}
                      className="flex items-center justify-between w-full text-left mb-4"
                    >
                      <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <svg
                          className="w-5 h-5 text-teal-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                          />
                        </svg>
                        Personalized Health Tips & Recommendations
                        <span className="text-sm text-gray-500 ml-2">
                          {showTips ? "▼" : "▶"}
                        </span>
                      </h3>
                    </button>

                    {showTips && (
                      <div className="space-y-4 animate-fadeIn">
                        {personalizedTips.map((tipSection, index) => (
                          <div
                            key={index}
                            className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
                          >
                            <h4 className="font-semibold text-gray-800 mb-3">
                              {tipSection.title}
                            </h4>
                            <ul className="space-y-2">
                              {tipSection.items.map((item, itemIndex) => (
                                <li
                                  key={itemIndex}
                                  className="flex items-start gap-2 text-gray-600 text-sm"
                                >
                                  <span className="text-teal-500 mt-0.5">
                                    •
                                  </span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Age-specific Note */}
                {age && parseInt(age) >= 65 && (
                  <div className="mt-5 p-3 bg-amber-50 rounded-lg border border-amber-100">
                    <p className="text-xs text-amber-800">
                      ℹ️ For adults 65+, a slightly higher BMI (23-27) is often
                      associated with better health outcomes and longevity.
                    </p>
                  </div>
                )}

                {age && parseInt(age) <= 18 && parseInt(age) > 0 && (
                  <div className="mt-5 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-xs text-blue-800">
                      ℹ️ BMI for children and teens should be interpreted using
                      age and gender-specific percentiles. Consult your
                      pediatrician for accurate assessment.
                    </p>
                  </div>
                )}

                {/* Health Note */}
                <div className="mt-5 text-xs text-gray-400 text-center">
                  *BMI is a screening tool that should be considered alongside
                  other health factors. Always consult with a healthcare
                  professional.
                </div>
              </div>
            </div>
          )}

          {/* Always Visible Tips & Info Section */}
          <div className="mt-8 space-y-4">
            {/* BMI Categories Info */}
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-3">
                <svg
                  className="w-5 h-5 text-teal-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                Understanding BMI Categories
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                <div className="bg-amber-50 p-3 rounded-lg">
                  <span className="font-semibold text-amber-700">
                    Underweight
                  </span>
                  <p className="text-amber-600 text-xs mt-1">Below 18.5</p>
                </div>
                <div className="bg-emerald-50 p-3 rounded-lg">
                  <span className="font-semibold text-emerald-700">
                    Healthy Weight
                  </span>
                  <p className="text-emerald-600 text-xs mt-1">18.5 - 24.9</p>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg">
                  <span className="font-semibold text-orange-700">
                    Overweight
                  </span>
                  <p className="text-orange-600 text-xs mt-1">25 - 29.9</p>
                </div>
                <div className="bg-rose-50 p-3 rounded-lg">
                  <span className="font-semibold text-rose-700">Obese</span>
                  <p className="text-rose-600 text-xs mt-1">30 and above</p>
                </div>
              </div>
            </div>

            {/* Why Age & Gender Matter */}
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-3">
                <svg
                  className="w-5 h-5 text-teal-500"
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
                Why Age & Gender Matter
              </h3>
              <div className="text-gray-600 text-sm space-y-2">
                <p>
                  <span className="font-medium">Age:</span> Body composition
                  changes as we age. Older adults may have higher body fat
                  percentages at the same BMI, and a slightly higher BMI range
                  (23-27) is often associated with better health outcomes for
                  seniors.
                </p>
                <p>
                  <span className="font-medium">Gender:</span> Men and women
                  have different body fat distribution patterns and muscle mass
                  percentages. Women naturally have higher body fat percentages
                  than men at the same BMI.
                </p>
              </div>
            </div>

            {/* General Wellness Tips */}
            <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl p-5 border border-teal-100">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-3">
                <svg
                  className="w-5 h-5 text-teal-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                General Wellness Tips for Everyone
              </h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-teal-500">🥗</span>
                    <span className="text-gray-600">
                      Eat a variety of colorful fruits and vegetables daily
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-500">💧</span>
                    <span className="text-gray-600">
                      Stay hydrated with 8-10 glasses of water per day
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-500">😴</span>
                    <span className="text-gray-600">
                      Get 7-9 hours of quality sleep each night
                    </span>
                  </li>
                </ul>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-teal-500">🏃</span>
                    <span className="text-gray-600">
                      Aim for 150 minutes of moderate exercise weekly
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-500">🧘</span>
                    <span className="text-gray-600">
                      Practice stress management through meditation or yoga
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-500">👨‍⚕️</span>
                    <span className="text-gray-600">
                      Schedule regular health check-ups and screenings
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>
      </div>
    </ToolPageShell>
  );
};

export default BMICal;
