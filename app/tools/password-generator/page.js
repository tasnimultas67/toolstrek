"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { CopyButton } from "@/components/ui/copy-button";
import StrengthIndicator from "./strength-indicator";
import { motion } from "framer-motion";
import { generatePassword } from "./actions";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function PasswordGenerator() {
  const searchParams = useSearchParams();
  const [params, setParams] = useState({
    password: "",
    length: "12",
    uppercase: "on",
    lowercase: "on",
    numbers: "on",
    symbols: "off",
  });

  useEffect(() => {
    // Update state when searchParams change
    setParams({
      password: searchParams.get("password") || "",
      length: searchParams.get("length") || "12",
      uppercase: searchParams.get("uppercase") || "on",
      lowercase: searchParams.get("lowercase") || "on",
      numbers: searchParams.get("numbers") || "on",
      symbols: searchParams.get("symbols") || "off",
    });
  }, [searchParams]);

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
              Create strong, secure passwords instantly
            </p>
          </CardHeader>
          <CardContent>
            <form action={generatePassword} className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  <Input
                    id="password"
                    name="password"
                    value={params.password}
                    placeholder="Your secure password"
                    readOnly
                    className="text-lg font-mono"
                  />
                  <CopyButton
                    textToCopy={params.password}
                    copyTrigger="password"
                  />
                </div>
                {params.password && <StrengthIndicator />}
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="length" className="mb-2">
                    Length: <span id="length-value">{params.length}</span>
                  </Label>
                  <Slider
                    id="length"
                    name="length"
                    defaultValue={[Number(params.length)]}
                    max={32}
                    min={8}
                    step={1}
                    onValueChange={(value) => {
                      document.getElementById("length-value").textContent =
                        value[0].toString();
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="uppercase"
                      name="uppercase"
                      defaultChecked={params.uppercase === "on"}
                    />
                    <Label htmlFor="uppercase">Uppercase Letters (A-Z)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="lowercase"
                      name="lowercase"
                      defaultChecked={params.lowercase === "on"}
                    />
                    <Label htmlFor="lowercase">Lowercase Letters (a-z)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="numbers"
                      name="numbers"
                      defaultChecked={params.numbers === "on"}
                    />
                    <Label htmlFor="numbers">Numbers (0-9)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="symbols"
                      name="symbols"
                      defaultChecked={params.symbols === "on"}
                    />
                    <Label htmlFor="symbols">Symbols (!@#$%)</Label>
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full hover:bg-brandColorHover">
                Generate Password
              </Button>
            </form>
          </CardContent>
        </Card>

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
      </motion.div>
    </div>
  );
}
