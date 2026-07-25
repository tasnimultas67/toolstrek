"use client";

import React, { useMemo } from "react";
import { usePathname } from "next/navigation";
import toolsData from "@/lib/toolsData.json";
import ToolsCard from "@/app/(main)/tools-compo/ToolsCard";
import { Sparkles } from "lucide-react";
import { useRecentTools } from "@/hooks/useRecentTools";
import { formatRelativeTime } from "@/lib/utils";

export default function RelatedTools() {
  const pathname = usePathname();
  const { recentTools } = useRecentTools();

  const recentToolsMap = useMemo(() => {
    const map = {};
    if (Array.isArray(recentTools)) {
      recentTools.forEach((t) => {
        if (t.link) map[t.link] = t.lastUsedAt;
      });
    }
    return map;
  }, [recentTools]);
  if (!pathname) return null;

  const cleanPathname = pathname.replace(/\/$/, "");
  const isIndividualToolPage = cleanPathname.startsWith("/tools/") && cleanPathname !== "/tools";

  if (!isIndividualToolPage) return null;

  // Find the current tool
  const currentTool = toolsData.find(
    (t) => t.link.replace(/\/$/, "") === cleanPathname
  );
  if (!currentTool) return null;

  // Filter tools by category (supports array categories) and exclude current tool
  const currentCats = Array.isArray(currentTool.categories)
    ? currentTool.categories
    : [currentTool.category || 'General'];

  let related = toolsData.filter((t) => {
    const toolCats = Array.isArray(t.categories)
      ? t.categories
      : [t.category || 'General'];
    const sharesCategory = toolCats.some((c) => currentCats.includes(c));
    return sharesCategory && t.link.replace(/\/$/, '') !== cleanPathname;
  });

  // If we have fewer than 3 tools, add tools from other categories
  if (related.length < 4) {
    const fallbackTools = toolsData.filter(
      (t) =>
        t.link.replace(/\/$/, "") !== cleanPathname &&
        !related.some((r) => r.link === t.link)
    );
    related = [...related, ...fallbackTools.slice(0, 4 - related.length)];
  }

  // Limit to exactly 3 related tools
  const finalRelated = related.slice(0, 4);

  return (
    <section className="py-16 border-t border-gray-200 dark:border-gray-800 bg-gray-50/20 dark:bg-gray-900/10">
      <div className="w-11/12 mx-auto">
        <div className="flex flex-col items-start mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wider text-brandColor uppercase bg-brandColor/10 dark:bg-brandColor/20 mb-3 animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-brandColor dark:text-brandColor/90" />
            <span className="text-brandColor dark:text-brandColor/90">Discover More</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            Related Tools
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Explore other utilities in the <span className="font-semibold text-brandColor">{currentCats.join(' / ')}</span> category to boost your productivity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {finalRelated.map((tool, index) => (
            <ToolsCard key={tool.link} index={index} {...tool} lastUsed={formatRelativeTime(recentToolsMap[tool.link])} />
          ))}
        </div>
      </div>
    </section>
  );
}
