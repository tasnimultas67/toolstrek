"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function StrengthIndicator() {
  const [strength, setStrength] = useState(0);

  useEffect(() => {
    const checkPasswordStrength = () => {
      const passwordInput = document.getElementById("password");
      if (!passwordInput) return;

      const password = passwordInput.value;
      if (!password) {
        setStrength(0);
        return;
      }

      let score = 0;
      if (password.length >= 12) score += 2;
      if (password.length >= 16) score += 1;
      if (/[A-Z]/.test(password)) score += 1;
      if (/[a-z]/.test(password)) score += 1;
      if (/[0-9]/.test(password)) score += 1;
      if (/[^A-Za-z0-9]/.test(password)) score += 2;

      setStrength(Math.min(score, 5));
    };

    const passwordInput = document.getElementById("password");
    passwordInput?.addEventListener("input", checkPasswordStrength);

    return () => {
      passwordInput?.removeEventListener("input", checkPasswordStrength);
    };
  }, []);

  const getStrengthColor = () => {
    if (strength <= 1) return "bg-red-500";
    if (strength <= 3) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStrengthText = () => {
    if (strength === 0) return "Very Weak";
    if (strength <= 1) return "Weak";
    if (strength <= 3) return "Medium";
    if (strength <= 4) return "Strong";
    return "Very Strong";
  };

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span>Password Strength:</span>
        <span className="font-medium">{getStrengthText()}</span>
      </div>
      <div className="flex gap-1 h-1.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <motion.div
            key={i}
            initial={{ width: 0 }}
            animate={{ width: strength >= i ? "100%" : "0%" }}
            transition={{ duration: 0.3 }}
            className={`h-full rounded-full ${
              strength >= i ? getStrengthColor() : "bg-gray-200"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
