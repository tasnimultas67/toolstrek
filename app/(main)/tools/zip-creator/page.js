import React from "react";
import ZipCreator from "@/app/(main)/tools-compo/tools/ZipCreator";

export const metadata = {
  title: "ZIP File Creator & Compressor - Bundle & Compress Files Online | ToolsTrek",
  description:
    "Create, compress, and bundle unlimited files and folders into downloadable ZIP archives online for free. Features recursive folder drag-and-drop, custom compression levels (Store, Deflate), inline file management, zip extraction, and 100% private in-browser processing.",
  keywords: [
    "zip creator",
    "zip maker",
    "compress files to zip",
    "create zip file",
    "zip compressor online",
    "folder to zip",
    "make zip folder",
    "archive files",
    "unzip files online",
    "zip extractor",
    "file compression tool",
    "free zip converter",
    "ToolsTrek"
  ],
  alternates: {
    canonical: "https://toolstrek.vercel.app/tools/zip-creator",
  },
  openGraph: {
    title: "ZIP File Creator & Compressor | ToolsTrek",
    description:
      "Bundle and compress any files or directories into high-performance downloadable ZIP archives directly in your browser. 100% client-side, zero server uploads, and completely private.",
    url: "https://toolstrek.vercel.app/tools/zip-creator",
    siteName: "ToolsTrek",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ZIP File Creator & Compressor | ToolsTrek",
    description:
      "Create and compress downloadable ZIP archives from your files and folders in seconds. Free, private, and works on all devices.",
  },
};

const page = () => {
  return <ZipCreator />;
};

export default page;
