import { AgeCal } from "@/app/tools-compo/AgeCal";
import React from "react";

const page = () => {
  return (
    <div className="bg-[#f3f4f6]">
      <div className="max-w-[1200px] w-[1160px] mx-auto px-1 py-3 ">
        <AgeCal></AgeCal>
      </div>
    </div>
  );
};

export default page;
