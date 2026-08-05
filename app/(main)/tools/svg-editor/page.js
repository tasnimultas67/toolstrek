import SVGEditor from "@/app/(main)/tools-compo/tools/SVGEditor";
import React from "react";

export const metadata = {
  title: "Advanced SVG Editor & Interactive Live Previewer | ToolsTrek",
  description:
    "Free online SVG editor, customizer, and optimizer. Edit SVG source code, adjust viewBox and dimensions, globally replace colors, prettify or minify markup, and export to SVG, React JSX, Base64, or raster formats (PNG, JPEG, WebP).",
  keywords: [
    "svg editor",
    "svg viewer",
    "live svg preview",
    "svg color changer",
    "change svg colors online",
    "svg optimizer",
    "svg formatter",
    "svg minifier",
    "svg to png converter",
    "svg code editor",
    "edit svg code",
    "developer tools",
    "ToolsTrek",
  ],
  openGraph: {
    title: "Advanced SVG Editor & Interactive Live Previewer | ToolsTrek",
    description:
      "Free online SVG editor, customizer, and optimizer. Edit SVG source code, adjust viewBox and dimensions, globally replace colors, prettify or minify markup, and export to SVG, React JSX, Base64, or raster formats (PNG, JPEG, WebP).",
    url: "https://toolstrek.vercel.app/tools/svg-editor",
    siteName: "ToolsTrek",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Advanced SVG Editor & Interactive Live Previewer | ToolsTrek",
    description:
      "Free online SVG editor, customizer, and optimizer. Edit SVG source code, adjust viewBox and dimensions, globally replace colors, prettify or minify markup, and export to SVG, React JSX, Base64, or raster formats (PNG, JPEG, WebP).",
  },
};

const page = () => {
  return (
    <div>
      <SVGEditor />
    </div>
  );
};

export default page;
