import { AgeCal } from "@/app/(main)/tools-compo/AgeCal";
import React from "react";

export const metadata = {
  title: "Age Calculator — ToolsTrek",
  keywords: ["age", "calculator", "age calculator"],
  description: "Calculate your age in years, months, and days",
};

const page = () => {
  return (
    <div className="pt-24 pb-10">
      <div className=" px-1 py-3 ">
        <AgeCal></AgeCal>
      </div>
    </div>
  );
};

export default page;
