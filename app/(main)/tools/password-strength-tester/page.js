import React from "react";
import PasswordStrengthTester from "./PasswordStrengthTester";

export const metadata = {
  title: "Password Strength Tester — ToolsTrek",
  keywords: [
    "password strength tester",
    "password analyzer",
    "password security",
    "entropy calculator",
    "crack time estimator",
    "password checker",
  ],
  description:
    "Analyze your password strength with entropy calculation, crack time estimation, security checklist, and advanced character analysis — all locally in your browser.",
};

const page = () => {
  return (
    <div>
      <PasswordStrengthTester />
    </div>
  );
};

export default page;
