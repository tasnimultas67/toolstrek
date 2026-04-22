"use client";
import React from "react";
import ToolsCard from "./ToolsCard";
import toolsData from "../../lib/toolsData.json";

const HServices = () => {
  return (
    <section className="bg-white pb-20 px-2" id="tools">
      <div className="w-11/12 mx-auto">
        <div className="mb-16 text-center lg:text-left">
          <h2 className="text-3xl lg:text-5xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Powerful simple tools
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Everything you need to stay productive, all in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...toolsData].reverse().map((tool, index) => (
            <ToolsCard key={tool.id || index} index={index} {...tool} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HServices;
