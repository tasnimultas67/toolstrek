import React from "react";
import CsvViewer from "./CsvViewer";

export const metadata = {
  title: "CSV Viewer & Editor — View, Analyze & Edit CSV Files Online",
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
  openGraph: {
    title: "CSV Viewer & Editor | ToolsTrek",
    description: "View, edit and analyze CSV files online. Dynamic tables, charts, and multi-format exports. Free & private.",
    url: "https://toolstrek.vercel.app/tools/csv-viewer",
    type: "website",
    siteName: "ToolsTrek",
    images: [{ url: "https://toolstrek.vercel.app/toolstrek-logo.png", width: 1200, height: 630, alt: "CSV Viewer & Editor" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "CSV Viewer & Editor | ToolsTrek",
    description: "Interactive CSV viewer with charts, pagination, and exports. Free & browser-based.",
    images: ["https://toolstrek.vercel.app/toolstrek-logo.png"],
    site: "@toolstrek",
  },
  alternates: { canonical: "https://toolstrek.vercel.app/tools/csv-viewer" },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
};

const page = () => {
  return (
    <div>
      <CsvViewer />
    </div>
  );
};

export default page;
