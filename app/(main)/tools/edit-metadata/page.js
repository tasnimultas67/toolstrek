import MetadataEditor from "@/app/(main)/tools-compo/tools/MetadataEditor";
import ToolPageShell from "@/app/(main)/tools-compo/ToolPageShell";
import React from "react";

export const metadata = {
  title: "File Metadata Editor | ToolsTrek",
  description:
    "Modify, spoof GPS coordinates, clear camera EXIF details, or strip metadata entirely from images, PDFs, and files. 100% private, client-side, zero uploads.",
  keywords: [
    "edit metadata",
    "exif editor",
    "strip metadata",
    "privacy shield metadata",
    "modify image tags",
    "change camera settings image",
    "gps spoofer photos",
    "pdf author editor",
    "remove gps location image",
    "developer tools",
  ],
  openGraph: {
    title: "File Metadata Editor — Edit or Strip Details | ToolsTrek",
    description:
      "Spoof GPS coordinates, edit EXIF details, remove author metadata, or strip all metadata from your images and PDFs securely in your browser.",
    url: "https://toolstrek.vercel.app/tools/edit-metadata",
    type: "website",
  },
};

const page = () => {
  return (
    <ToolPageShell>
      <MetadataEditor />
    </ToolPageShell>
  );
};

export default page;
