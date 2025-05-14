import { AgeCal } from "@/app/tools-compo/AgeCal";
import React from "react";

const page = () => {
  return (
    <div className="bg-[#f3f4f6]">
      <div className="md:max-w-[1200px] md:w-[1160px] mx-auto px-1 py-3 ">
        <AgeCal></AgeCal>
      </div>
    </div>
  );
};

export default page;
