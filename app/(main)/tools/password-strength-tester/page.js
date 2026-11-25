import React from "react";
import PasswordStrengthTester from "./PasswordStrengthTester";

export const metadata = {
  alternates: { canonical: "https://toolstrek.vercel.app/tools/password-strength-tester" },
  title: "Password Strength Tester",
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
