"use client";

import React from "react";
import { ArrowLeft } from "lucide-react";

export default function BackButton({ className }) {
  const handleBack = (e) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      window.history.back();
    }
  };

  return (
    <button
      onClick={handleBack}
      className={className}
      type="button"
    >
      <ArrowLeft size={18} />
      Go Back
    </button>
  );
}
