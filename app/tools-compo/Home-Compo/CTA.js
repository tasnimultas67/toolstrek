import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const CTA = () => {
  return (
    <section className="relative">
      <div className="w-full md:w-[1000px] mx-auto text-left bg-gradient-to-r from-black to-brandColor rounded-3xl text-white py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden pb-52 md:pb-10">
        {/* Left Content */}
        <div className="text-center md:text-left">
          <h2 className="text-3xl font-semibold mb-4 leading-normal">
            Your Digital Toolbox for Productivity & Efficiency!
          </h2>
          <p className="text-sm mb-5 opacity-90 w-full md:w-[70%]">
            Discover the power of precision-crafted tools designed to simplify
            your workflow. From QR code generation to smart utilities, ToolsTrek
            offers innovative solutions that enhance efficiency and convenience.
            Try them today and optimize your digital experience!
          </p>
          <Button asChild variant="secondary" className="">
            <Link href="#" className="text-xs">
              Browse All Tools
            </Link>
          </Button>
        </div>

        {/* Right Background - Abstract Geometric Circles */}
        <div className="absolute right-0 top-0 bottom-0 w-[100%] md:w-[60%] ">
          <svg
            className="absolute  right-0 md:right-[-400px] bottom-[-300px] md:bottom-0 md:top-[-130px] w-[480px] md:w-[800px] h-[600px] opacity-20"
            viewBox="0 0 600 600"
            fill="none"
          >
            <circle
              cx="300"
              cy="300"
              r="320"
              stroke="white"
              strokeWidth="1.5"
            />
            <circle
              cx="300"
              cy="300"
              r="280"
              stroke="white"
              strokeWidth="1.5"
            />
            <circle
              cx="300"
              cy="300"
              r="240"
              stroke="white"
              strokeWidth="1.5"
            />
            <circle
              cx="300"
              cy="300"
              r="200"
              stroke="white"
              strokeWidth="1.5"
            />
            <circle
              cx="300"
              cy="300"
              r="160"
              stroke="white"
              strokeWidth="1.5"
            />
            <circle
              cx="300"
              cy="300"
              r="120"
              stroke="white"
              strokeWidth="1.5"
            />
            <circle cx="300" cy="300" r="80" stroke="white" strokeWidth="1.5" />
            <circle cx="300" cy="300" r="40" stroke="white" strokeWidth="1.5" />
            <circle cx="300" cy="300" r="20" stroke="white" strokeWidth="1.5" />
          </svg>
        </div>
      </div>
    </section>
  );
};

export default CTA;
