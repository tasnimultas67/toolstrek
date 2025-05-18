"use client";

import { useState } from "react";
import { Button } from "./button";
import { Check, Copy } from "lucide-react";

export function CopyButton({ textToCopy, copyTrigger }) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    if (!textToCopy) {
      // If textToCopy is not provided, try to get it from the element with copyTrigger ID
      const element = document.getElementById(copyTrigger);
      if (element) {
        textToCopy = element.value;
      }
    }

    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={handleCopy}
      className="size-9"
    >
      {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      <span className="sr-only">Copy to clipboard</span>
    </Button>
  );
}
