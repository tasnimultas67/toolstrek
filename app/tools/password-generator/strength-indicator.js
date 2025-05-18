"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function StrengthIndicator({ password = "" }) {
  const [strength, setStrength] = useState(0);

  useEffect(() => {
    if (!password) {
      setStrength(0);
      return;
    }

    let score = 0;
    // Length
    if (password.length >= 12) score += 2;
    if (password.length >= 16) score += 1;
    // Complexity
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 2;

    setStrength(Math.min(score, 5));
  }, [password]);

  const strengthLevels = [
    { text: "Very Weak", color: "bg-red-500", min: 0 },
    { text: "Weak", color: "bg-orange-500", min: 1 },
    { text: "Medium", color: "bg-yellow-500", min: 2 },
    { text: "Strong", color: "bg-green-400", min: 4 },
    { text: "Very Strong", color: "bg-green-600", min: 5 },
  ];

  const currentLevel =
    strengthLevels.findLast((level) => strength >= level.min) ||
    strengthLevels[0];

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span>Password Strength:</span>
        <span className="font-medium">{currentLevel.text}</span>
      </div>
      <div className="flex gap-1 h-1.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <motion.div
            key={i}
            initial={{ width: 0 }}
            animate={{ width: strength >= i ? "100%" : "0%" }}
            transition={{ duration: 0.3 }}
            className={`h-full rounded-full ${
              strength >= i ? currentLevel.color : "bg-gray-200"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
