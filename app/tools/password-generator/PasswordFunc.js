"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CopyButton } from "@/components/ui/copy-button";
import StrengthIndicator from "./strength-indicator";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, RefreshCw, Lock, Zap, Info } from "lucide-react";

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

    if (!charSets) return;

    let result = "";
    const crypto = window.crypto || window.msCrypto;
    const values = new Uint32Array(length);
    crypto.getRandomValues(values);

    for (let i = 0; i < length; i++) {
      result += charSets[values[i] % charSets.length];
    }

    setPassword(result);
  };

  // Generate a password on initial mount
  useEffect(() => {
    generatePassword();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 px-2 pb-10 pt-20 flex flex-col items-center justify-center font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full md:w-11/12 mx-auto"
      >
        <Card className="bg-white dark:bg-gray-900 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border-gray-100 dark:border-gray-800 overflow-hidden">
          <CardHeader className="px-8 py-6 border-b border-gray-50 dark:border-gray-800 bg-white/50 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500 rounded-lg shadow-lg shadow-emerald-100">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-gray-800 dark:text-white">
                    Password <span className="text-emerald-500">Generator</span>
                  </CardTitle>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
                    Secure Client-Side Encryption
                  </p>
                </div>
              </div>
              <Lock className="text-gray-200 dark:text-gray-700 w-8 h-8" />
            </div>
          </CardHeader>

          <CardContent className="p-8 space-y-8">
            {/* Password Output Area */}
            <div className="space-y-4">
              <div className="relative flex items-center gap-2 group">
                <div className="relative w-full">
                  <Input
                    value={password}
                    readOnly
                    placeholder="Click Generate..."
                    className="h-16 px-6 text-xl md:text-2xl font-mono bg-slate-50 dark:bg-gray-800/50 border-none rounded-2xl text-gray-800 dark:text-gray-100 focus-visible:ring-4 focus-visible:ring-emerald-500/10 transition-all shadow-inner"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <Zap
                      className={`w-5 h-5 ${password ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                    />
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                  <CopyButton textToCopy={password} />
                </div>
              </div>

              <AnimatePresence>
                {password && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <StrengthIndicator password={password} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Controls */}
            <div className="space-y-8 bg-gray-50/50 dark:bg-gray-800/30 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-tight">
                    Password Length
                  </Label>
                  <span className="px-3 py-1 bg-emerald-500 text-white rounded-lg font-mono font-bold text-lg shadow-md shadow-emerald-100">
                    {length}
                  </span>
                </div>
                <Slider
                  defaultValue={[length]}
                  max={32}
                  min={8}
                  step={1}
                  onValueChange={(val) => setLength(val[0])}
                  className="py-4"
                />
              </div>

              {/* Toggles with unique colors */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    id: "uppercase",
                    label: "ABC",
                    color: "peer-checked:bg-indigo-500",
                  },
                  {
                    id: "lowercase",
                    label: "abc",
                    color: "peer-checked:bg-sky-500",
                  },
                  {
                    id: "numbers",
                    label: "123",
                    color: "peer-checked:bg-amber-500",
                  },
                  {
                    id: "symbols",
                    label: "#&*",
                    color: "peer-checked:bg-rose-500",
                  },
                ].map((opt) => (
                  <div
                    key={opt.id}
                    className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm"
                  >
                    <div className="flex flex-col">
                      <Label
                        htmlFor={opt.id}
                        className="text-xs font-black uppercase text-gray-400"
                      >
                        {opt.id}
                      </Label>
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
                        {opt.label}
                      </span>
                    </div>
                    <Switch
                      id={opt.id}
                      checked={options[opt.id]}
                      className={`${opt.color}`}
                      onCheckedChange={() =>
                        setOptions((prev) => ({
                          ...prev,
                          [opt.id]: !prev[opt.id],
                        }))
                      }
                    />
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={generatePassword}
              className="w-full h-14 bg-gray-900 dark:bg-emerald-600 hover:bg-black dark:hover:bg-emerald-700 text-white rounded-2xl font-bold text-lg shadow-xl transition-all active:scale-[0.98] flex gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              {password.length >= 2
                ? "Regenerate Password"
                : "Generate Password"}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Footer Tips Card */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mt-8 w-full max-w-2xl"
      >
        <Card className="bg-transparent border-dashed border-2 border-gray-200 dark:border-gray-800 shadow-none rounded-3xl">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Info className="w-4 h-4 text-gray-400" />
            <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-widest">
              Security Best Practices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-xs font-medium text-gray-500 dark:text-gray-400 list-none">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Minimum 12 characters recommended
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                Mix all character types
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Avoid common dictionary words
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                Use a unique password per account
              </li>
            </ul>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
