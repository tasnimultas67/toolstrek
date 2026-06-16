"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useRecentTools } from "@/hooks/useRecentTools";
import toolsData from "@/lib/toolsData.json";

export default function RecentToolsTracker() {
  const pathname = usePathname();
  const { addRecentTool } = useRecentTools();

  useEffect(() => {
    if (pathname && pathname.startsWith("/tools/")) {
      // Find the tool corresponding to the active path
      const tool = toolsData.find((t) => t.link === pathname);
      if (tool) {
        addRecentTool(tool);
      }
    }
  }, [pathname, addRecentTool]);

  return null;
}
