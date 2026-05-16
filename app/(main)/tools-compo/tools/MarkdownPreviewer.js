"use client";

import React, { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import "highlight.js/styles/github-dark.css";
import { Copy, Eye, Check, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ToolPageShell from "../ToolPageShell";

export default function MarkdownPreviewer() {
  const [markdown, setMarkdown] = useState(
    "# Welcome to ToolsTrek\n\nPaste your GitHub README here to see it render perfectly.\n\n<center>\n  <h3>This supports HTML tags too!</h3>\n</center>\n\n```javascript\nconsole.log('Syntax highlighting works!');\n```",
  );
  const [copied, setCopied] = useState(false);
  const [view, setView] = useState("split"); // 'split' | 'edit' | 'preview'
  const previewRef = useRef(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadFile = () => {
    const element = document.createElement("a");
    const file = new Blob([markdown], { type: "text/markdown" });
    element.href = URL.createObjectURL(file);
    element.download = "README.md";
    document.body.appendChild(element);
    element.click();
  };

  return (
    <ToolPageShell widthClassName="max-w-7xl">
      <div className="flex h-[calc(100vh-60px)] flex-col font-sans">
      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between bg-white border border-gray-200 p-2 mb-4 rounded-xl shadow-sm gap-2">
        <div className="flex items-center gap-2 px-2">
          <div className="hidden sm:flex bg-gray-100 p-1 rounded-lg mr-2">
            <button
              onClick={() => setView("edit")}
              className={`px-3 py-1 text-xs font-bold rounded-md transition ${view === "edit" ? "bg-white shadow-sm text-brandColor" : "text-gray-500"}`}
            >
              Editor
            </button>
            <button
              onClick={() => setView("split")}
              className={`px-3 py-1 text-xs font-bold rounded-md transition ${view === "split" ? "bg-white shadow-sm text-brandColor" : "text-gray-500"}`}
            >
              Split
            </button>
            <button
              onClick={() => setView("preview")}
              className={`px-3 py-1 text-xs font-bold rounded-md transition ${view === "preview" ? "bg-white shadow-sm text-brandColor" : "text-gray-500"}`}
            >
              Preview
            </button>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-brandColor bg-brandColor/10 px-2 py-1 rounded">
            Live GFM Engine
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMarkdown("")}
            title="Clear All"
          >
            <Trash2
              size={16}
              className="text-gray-400 hover:text-red-500 transition-colors"
            />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={downloadFile}
            className="hidden md:flex items-center gap-2"
          >
            <Download size={14} /> Export .md
          </Button>
          <Button
            onClick={handleCopy}
            className="bg-brandColor hover:bg-brandColorHover text-white flex items-center gap-2 shadow-sm"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex flex-col lg:flex-row gap-0 overflow-hidden rounded-2xl border border-gray-200 shadow-2xl bg-white grow">
        {/* Editor Area */}
        {(view === "edit" || view === "split") && (
          <div
            className={`flex flex-col border-r border-gray-100 ${view === "split" ? "w-full lg:w-1/2" : "w-full"}`}
          >
            <textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              placeholder="Paste your markdown code here..."
              className="w-full h-full p-6 outline-none font-mono text-sm leading-relaxed resize-none bg-gray-50/20 text-gray-800 selection:bg-brandColor/20"
              spellCheck="false"
            />
          </div>
        )}

        {/* Preview Area */}
        {(view === "preview" || view === "split") && (
          <div
            ref={previewRef}
            className={`h-full overflow-y-auto bg-white scroll-smooth ${view === "split" ? "w-full lg:w-1/2" : "w-full"}`}
          >
            <div
              className="p-8 prose prose-slate max-w-none 
              whitespace-pre-wrap break-words
              prose-headings:font-bold prose-headings:text-slate-900
              prose-a:text-brandColor prose-a:no-underline hover:prose-a:underline
              prose-blockquote:border-l-4 prose-blockquote:border-brandColor prose-blockquote:bg-brandColor/5 prose-blockquote:py-1 prose-blockquote:px-4
              prose-code:text-brandColor prose-code:bg-brandColor/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
              prose-pre:bg-[#0d1117] prose-pre:p-4 prose-pre:rounded-xl prose-pre:shadow-lg
              prose-img:rounded-xl prose-img:shadow-md
              prose-table:border prose-table:rounded-lg
            "
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkBreaks]}
                rehypePlugins={[rehypeHighlight, rehypeRaw]}
              >
                {markdown}
              </ReactMarkdown>

              {markdown.length === 0 && (
                <div className="flex flex-col items-center justify-center h-64 text-gray-300">
                  <Eye
                    size={40}
                    strokeWidth={1.5}
                    className="mb-2 opacity-20"
                  />
                  <p className="text-sm font-medium opacity-50 italic">
                    Live preview is empty
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      </div>
    </ToolPageShell>
  );
}
