"use client";

import React from "react";
import ToolsCard from "./ToolsCard";
import { useRecentTools } from "@/hooks/useRecentTools";
import { formatRelativeTime } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { History } from "lucide-react";

const RecentToolsHome = () => {
  const { recentTools } = useRecentTools();

  if (recentTools.length === 0) return null;

  // Render up to 4 recently used tools
  const displayedRecent = recentTools.slice(0, 4);

  return (
    <section
      className="bg-slate-50/50 py-16 px-2 border-b border-gray-100"
      id="recent-tools"
    >
      <div className="w-11/12 mx-auto">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 mb-3 text-xs font-semibold tracking-wider text-indigo-600 uppercase bg-indigo-50 border border-indigo-100 rounded-full">
              <History className="size-3.5" /> Jump Back In
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-gray-900">
              Recently Used Tools
            </h2>
            <p className="mt-2 text-md text-gray-600">
              Quick access to your recently visited online utilities.
            </p>
          </div>

          <div className="flex justify-center md:justify-end shrink-0">
            <Link href="/recent">
              <Button
                variant="outline"
                className="border-gray-300 hover:bg-gray-100 hover:border-gray-400 transition-all duration-200 cursor-pointer"
              >
                View Full History
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {displayedRecent.map((tool, index) => (
            <ToolsCard
              key={tool.link}
              index={index}
              {...tool}
              lastUsed={formatRelativeTime(tool.lastUsedAt)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecentToolsHome;
