import MetadataViewer from "@/app/(main)/tools-compo/tools/MetadataViewer";
import ToolPageShell from "@/app/(main)/tools-compo/ToolPageShell";
import React from "react";

export const metadata = {
  title: "File Metadata Viewer | ToolsTrek",
  description:
    "Instantly reveal every hidden metadata detail inside any file — images (EXIF, GPS, camera info), PDFs, audio, video, documents, and more. 100% private, runs entirely in your browser.",
  keywords: [
    "view metadata",
    "file metadata viewer",
    "exif viewer",
    "image metadata reader",
    "pdf metadata extractor",
    "audio metadata",
    "video metadata",
    "file inspector",
    "exif reader online",
    "hex viewer",
    "sha256 file hash",
    "developer tools",
  ],
  openGraph: {
    title: "File Metadata Viewer — View Every Hidden Detail | ToolsTrek",
    description:
      "Drop any file — images, PDFs, audio, video — and instantly see all metadata: EXIF data, GPS coordinates, hash values, entropy, and a live hex preview.",
    url: "https://toolstrek.vercel.app/tools/view-metadata",
    type: "website",
  },
};

const page = () => {
  return (
    <ToolPageShell>
      <MetadataViewer />
    </ToolPageShell>
  );
};

export default page;
