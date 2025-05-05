"use client";
import { Calendar } from "@/components/ui/calendar";
import React from "react";
import { TestCal } from "./TestCal";

const AgeCal = () => {
  return (
    <div className="flex flex-col items-center justify-center bg-gray-100">
      {/* <Calendar></Calendar> */}
      <TestCal></TestCal>
    </div>
  );
};

export default AgeCal;
