import ShortenerForm from "@/app/tools-compo/ShortenerForm";
import React from "react";

const page = () => {
  return (
    <div className="md:w-[1000px] mx-auto">
      <div className="p-5">
        <ShortenerForm></ShortenerForm>
      </div>
    </div>
  );
};

export default page;
