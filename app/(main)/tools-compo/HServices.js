"use client";
import React from "react";
import ToolsCard from "./ToolsCard";
import toolsData from "../../../lib/toolsData.json";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const HServices = () => {
  return (
    <section className="bg-white dark:bg-gray-950 py-20 px-2" id="tools">
      <div className="w-11/12 mx-auto">
        <div className="mb-16 text-center">
          <h2 className="text-3xl lg:text-5xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Powerful simple tools
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Everything you need to stay productive, all in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {[...toolsData]
            .slice(0, 4)
            .slice()
            .reverse()
            .map((tool, index) => (
              <ToolsCard key={tool.id || index} index={index} {...tool} />
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
