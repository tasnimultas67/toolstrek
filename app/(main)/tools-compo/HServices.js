"use client";
import React from "react";
import { useState, useEffect, useMemo } from "react";
import ToolsCard from "./ToolsCard";
import toolsData from "../../../lib/toolsData.json";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRecentTools } from "@/hooks/useRecentTools";
import { formatRelativeTime } from "@/lib/utils";

const HServices = () => {
  const [cardsToShow, setCardsToShow] = useState(4);
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

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        // lg breakpoint
        setCardsToShow(8);
      } else {
        setCardsToShow(4);
      }
    };

    handleResize(); // Set initial value
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return (
    <section
      className="border-b border-gray-100 dark:border-gray-800 py-20 px-2"
      id="tools"
    >
      <div className="w-11/12 mx-auto">
        <div className="mb-16 text-center">
          <span className="inline-block px-4 py-1.5 mb-4 text-sm font-semibold tracking-wider text-brandColor uppercase bg-brandColor/10 rounded-full">
            Browse by Tools
          </span>
          <h2 className="text-3xl lg:text-5xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Powerful simple tools
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Everything you need to stay productive, all in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {[...toolsData]
            .slice(0, cardsToShow)
            .reverse()
            .map((tool, index) => (
              <ToolsCard
                key={tool.id || index}
                index={index}
                {...tool}
                lastUsed={formatRelativeTime(recentToolsMap[tool.link])}
              />
            ))}
        </div>
        <div className="mt-10 flex items-center justify-center">
          <Link href="/tools">
            <Button className="w-full bg-brandColor dark:text-white hover:bg-brandColorHover transition-all duration-200 hover:scale-105 cursor-pointer">
              See All Tools
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HServices;
