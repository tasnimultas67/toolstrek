"use client"

import { Toaster as Sonner } from "sonner";
import { useTheme } from "@/app/theme-context";

const Toaster = ({
  ...props
}) => {
  const { theme } = useTheme()

  return (
    (<Sonner
      theme={theme}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)"
        }
      }
      {...props} />)
  );
}

export { Toaster }
