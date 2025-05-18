"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CopyButton } from "@/components/ui/copy-button";
import StrengthIndicator from "./strength-indicator";
import { motion } from "framer-motion";

export default function PasswordFunc() {
  const [password, setPassword] = useState("");
  const [length, setLength] = useState(12);
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: false,
  });

  const generatePassword = () => {
    const charSets = [
      options.uppercase && "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      options.lowercase && "abcdefghijklmnopqrstuvwxyz",
      options.numbers && "0123456789",
      options.symbols && "!@#$%^&*()_+-=[]{}|;:,.<>?",
    ]
      .filter(Boolean)
      .join("");

    let result = "";
    const crypto = window.crypto || window.msCrypto;
    const values = new Uint32Array(length);
    crypto.getRandomValues(values);

    for (let i = 0; i < length; i++) {
      result += charSets[values[i] % charSets.length];
    }

    setPassword(result);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Password Generator
            </CardTitle>
            <p className="text-sm text-center text-muted-foreground">
              Secure, client-side password generation
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-5">
                <Input
                  value={password}
                  readOnly
                  placeholder="Your secure password"
                  className="text-lg font-mono"
                />
                <CopyButton textToCopy={password} />
              </div>
              {password && <StrengthIndicator password={password} />}
            </div>

            <div className="space-y-6">
              <div className="">
                <Label className="mb-2">Length: {length}</Label>
                <Slider
                  defaultValue={[length]}
                  max={32}
                  min={8}
                  step={1}
                  onValueChange={(val) => setLength(val[0])}
                />
              </div>

              <div className="flex items-center gap-4">
                {Object.entries(options).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Switch
                      id={key}
                      checked={value}
                      onCheckedChange={() =>
                        setOptions((prev) => ({
                          ...prev,
                          [key]: !prev[key],
                        }))
                      }
                    />
                    <Label htmlFor={key}>
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={generatePassword}
              className="w-full bg-brandColor hover:bg-brandColorHover"
            >
              {password.length >= 2
                ? "Regenerate Password"
                : "Generate Password"}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mt-8 max-w-2xl mx-auto"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Password Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 list-disc pl-5 text-sm text-muted-foreground">
              <li>Use at least 12 characters</li>
              <li>
                Include a mix of uppercase, lowercase, numbers, and symbols
              </li>
              <li>Avoid common words or personal information</li>
              <li>Use a unique password for each account</li>
              <li>Consider using a password manager</li>
            </ul>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
