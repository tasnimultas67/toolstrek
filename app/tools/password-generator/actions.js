"use server";

import { redirect } from "next/navigation";

const CHARACTER_SETS = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
};

export async function generatePassword(formData) {
  const length = Number(formData.get("length"));
  const options = {
    uppercase: formData.get("uppercase") === "on",
    lowercase: formData.get("lowercase") === "on",
    numbers: formData.get("numbers") === "on",
    symbols: formData.get("symbols") === "on",
  };

  if (!Object.values(options).some(Boolean)) {
    throw new Error("At least one character set must be selected");
  }

  let charPool = "";
  if (options.uppercase) charPool += CHARACTER_SETS.uppercase;
  if (options.lowercase) charPool += CHARACTER_SETS.lowercase;
  if (options.numbers) charPool += CHARACTER_SETS.numbers;
  if (options.symbols) charPool += CHARACTER_SETS.symbols;

  let password = "";
  const crypto = require("crypto");
  const randomValues = crypto.randomBytes(length);

  for (let i = 0; i < length; i++) {
    const randomIndex = randomValues[i] % charPool.length;
    password += charPool[randomIndex];
  }

  const newFormData = new FormData();
  newFormData.append("password", password);
  newFormData.append("length", length.toString());
  newFormData.append("uppercase", options.uppercase ? "on" : "off");
  newFormData.append("lowercase", options.lowercase ? "on" : "off");
  newFormData.append("numbers", options.numbers ? "on" : "off");
  newFormData.append("symbols", options.symbols ? "on" : "off");

  redirect(
    `/tools/password-generator?${new URLSearchParams(newFormData).toString()}`
  );
}
