import React from "react";
import DaysTracker from "../../tools-compo/DaysTracker";

export const metadata = {
  title: "Days Tracker — ToolsTrek",
  keywords: ["days", "tracker", "calculator"],
  description: "Calculate the end date based on start date and number of days",
};

const page = () => {
  return (
    <div>
      <DaysTracker></DaysTracker>
    </div>
  );
};

export default page;
