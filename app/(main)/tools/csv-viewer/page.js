import React from "react";
import CsvViewer from "./CsvViewer";

export const metadata = {
  title: "CSV Viewer & Editor — ToolsTrek",
  keywords: [
    "csv viewer",
    "csv editor",
    "csv reader",
    "comma separated values",
    "visualize csv",
    "excel to csv",
    "data analysis",
    "developer",
    "spreadsheet",
  ],
  description:
    "An advanced, interactive CSV viewer and editor. Upload or paste CSV data to explore dynamically with table pagination, cell editing, column visibility toggles, descriptive column data profiling, custom SVG chart generation, and multi-format exports.",
};

const page = () => {
  return (
    <div>
      <CsvViewer />
    </div>
  );
};

export default page;
