import OnlineNotepad from "@/app/(main)/tools-compo/tools/OnlineNotepad";
import React from "react";

export const metadata = {
  title: "Online Notepad & Scratchpad Studio — ToolsTrek",
  description:
    "Free, private, in-browser Online Notepad & Scratchpad Studio. Features multi-tab note management, live Markdown preview, typewriter sound effects, voice dictation, text-to-speech, client-side PIN encryption, live word statistics, and multi-format exports (TXT, MD, PDF, HTML, JSON).",
  keywords: [
    "online notepad",
    "notepad online",
    "free online notepad",
    "scratchpad",
    "in-browser notepad",
    "markdown notepad",
    "private notepad",
    "notepad with tabs",
    "typewriter notepad",
    "speech to text notepad",
    "voice typing notepad",
    "text to speech reader",
    "word counter notepad",
    "encrypted notepad",
    "export notepad to pdf",
    "ToolsTrek"
  ],
  openGraph: {
    title: "Online Notepad & Scratchpad Studio — ToolsTrek",
    description:
      "Modern, distraction-free Online Notepad with multi-tab notes, live Markdown preview, typewriter acoustics, voice typing, TTS, encryption, and instant PDF/MD/HTML export.",
    url: "https://toolstrek.vercel.app/tools/online-notepad",
    siteName: "ToolsTrek",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Online Notepad & Scratchpad Studio — ToolsTrek",
    description:
      "Private in-browser notepad with multi-tab workspace, live Markdown preview, typewriter audio, voice dictation, password lock, and PDF export.",
  },
};

export default function OnlineNotepadPage() {
  return (
    <div>
      <OnlineNotepad />
    </div>
  );
}
