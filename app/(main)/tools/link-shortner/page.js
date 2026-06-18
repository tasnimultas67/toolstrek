import ShortenerForm from "@/app/(main)/tools-compo/ShortenerForm";
import React from "react";
export const metadata = {
  title: "Link Shortener — ToolsTrek",
  keywords: ["link", "shortener", "url", "shortener", "tools"],
  description: "Shorten your long URLs into short, manageable links",
};

const page = () => {
  return (
    <div className="">
      <div className="pt-20 pb-5">
        <ShortenerForm />
      </div>
    </div>
  );
};

export default page;
