"use client";

import { useRef, useState } from "react";
import { AlertCircle, Clock3, LoaderCircle, Play, ShieldCheck, Square } from "lucide-react";
import ToolPageShell from "../ToolPageShell";

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"];
const MAX_RESPONSE_BYTES = 1_000_000;
const inputClass = "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white";

function parseHeaders(value) {
  let headers;
  try {
    headers = JSON.parse(value || "{}");
  } catch {
    throw new Error("Headers must be a valid JSON object.");
  }
  if (!headers || Array.isArray(headers) || typeof headers !== "object") {
    throw new Error("Headers must be a JSON object with header names and values.");
  }
  return Object.fromEntries(Object.entries(headers).map(([key, item]) => [key, String(item)]));
}

async function readLimitedResponse(response) {
  if (!response.body) return { text: "", truncated: false };
  const reader = response.body.getReader();
  const chunks = [];
  let byteLength = 0;
  let truncated = false;

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      const available = MAX_RESPONSE_BYTES - byteLength;
      if (value.byteLength > available) {
        chunks.push(value.slice(0, Math.max(0, available)));
        byteLength += Math.max(0, available);
        truncated = true;
        await reader.cancel();
        break;
      }
      chunks.push(value);
      byteLength += value.byteLength;
    }
  } finally {
    reader.releaseLock();
  }

  const combined = new Uint8Array(byteLength);
  let offset = 0;
  for (const chunk of chunks) {
    combined.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return { text: new TextDecoder().decode(combined), truncated };
}

export default function ApiRequestBuilder() {
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("");
  const [headersText, setHeadersText] = useState('{\n  "Accept": "application/json"\n}');
  const [body, setBody] = useState('{\n  \n}');
  const [loading, setLoading] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState("");
  const [responseData, setResponseData] = useState(null);
  const abortRef = useRef(null);

  async function sendRequest(event) {
    event.preventDefault();
    setError("");
    setResponseData(null);

    let target;
    let requestHeaders;
    try {
      target = new URL(url.trim());
      if (!/^https?:$/.test(target.protocol)) throw new Error("Only HTTP and HTTPS URLs are supported.");
      requestHeaders = parseHeaders(headersText);
    } catch (requestError) {
      setError(requestError.message || "Enter a valid HTTP or HTTPS URL.");
      return;
    }

    const hasBody = !["GET", "HEAD"].includes(method) && body.trim().length > 0;
    if (hasBody && /application\/json/i.test(requestHeaders["Content-Type"] || "application/json")) {
      try {
        JSON.parse(body);
      } catch {
        setError("The request body is not valid JSON.");
        return;
      }
      requestHeaders["Content-Type"] ||= "application/json";
    }

    const controller = new AbortController();
    abortRef.current = controller;
    const startedAt = performance.now();
    const timeoutId = window.setTimeout(() => controller.abort("timeout"), 30_000);
    setLoading(true);

    try {
      const response = await fetch(target, {
        method,
        headers: requestHeaders,
        body: hasBody ? body : undefined,
        signal: controller.signal,
      });
      const payload = await readLimitedResponse(response);
      const contentType = response.headers.get("content-type") || "";
      let preview = payload.text;
      if (/json/i.test(contentType) && payload.text) {
        try {
          preview = JSON.stringify(JSON.parse(payload.text), null, 2);
        } catch {
          // Preserve the response body if the server labels invalid JSON as JSON.
        }
      }
      setResponseData({
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        contentType,
        headers: Object.fromEntries(response.headers.entries()),
        body: preview,
        truncated: payload.truncated,
      });
      setElapsed(Math.round(performance.now() - startedAt));
    } catch {
      const timedOut = controller.signal.aborted && controller.signal.reason === "timeout";
      const cancelled = controller.signal.aborted && controller.signal.reason === "user";
      setError(cancelled
        ? "The request was cancelled."
        : timedOut
          ? "The request timed out after 30 seconds."
          : "The request could not be completed. The browser may have blocked it because the server does not allow cross-origin (CORS) requests.");
    } finally {
      window.clearTimeout(timeoutId);
      if (abortRef.current === controller) abortRef.current = null;
      setLoading(false);
    }
  }

  return (
    <ToolPageShell className="px-4 py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-7">
        <header className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">Developer utility</div>
          <h1 className="text-3xl font-black tracking-tight text-gray-950 dark:text-white md:text-5xl">API Request Builder</h1>
          <p className="max-w-3xl text-sm leading-6 text-gray-600 dark:text-gray-400 md:text-base">Send HTTP requests from your browser and inspect response headers, status, timing, and formatted text or JSON.</p>
        </header>

        <form onSubmit={sendRequest} className="space-y-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 md:p-7">
          <div className="grid gap-3 sm:grid-cols-[150px_1fr_auto]">
            <label className="space-y-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Method<select value={method} onChange={(event) => setMethod(event.target.value)} className={inputClass}>{METHODS.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label className="space-y-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Request URL<input required type="url" value={url} onChange={(event) => setUrl(event.target.value)} className={inputClass} placeholder="https://api.example.com/v1/items" autoComplete="url" spellCheck={false} /></label>
            <div className="flex items-end gap-2">
              <button type="submit" disabled={loading} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">{loading ? <LoaderCircle size={16} className="animate-spin" /> : <Play size={15} />}{loading ? "Sending…" : "Send"}</button>
              {loading && <button type="button" onClick={() => abortRef.current?.abort("user")} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-gray-200 px-3 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200"><Square size={15} /><span className="sr-only">Cancel request</span></button>}
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <label className="space-y-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Headers <span className="font-normal text-gray-500">(JSON object)</span><textarea rows={7} value={headersText} onChange={(event) => setHeadersText(event.target.value)} className={`${inputClass} min-h-40 font-mono text-xs`} spellCheck={false} /></label>
            <label className="space-y-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Request body <span className="font-normal text-gray-500">(JSON for POST/PUT/PATCH)</span><textarea rows={7} value={body} onChange={(event) => setBody(event.target.value)} disabled={["GET", "HEAD"].includes(method)} className={`${inputClass} min-h-40 font-mono text-xs disabled:opacity-50`} spellCheck={false} /></label>
          </div>

          <p className="flex items-start gap-2 text-xs leading-5 text-gray-500 dark:text-gray-400"><ShieldCheck size={15} className="mt-0.5 shrink-0" />Requests are sent directly from your browser. URLs, headers, credentials, and bodies are not sent through a ToolsTrek proxy or saved by this tool. Cross-origin APIs must allow browser requests with CORS. Response previews are capped at 1 MB.</p>
        </form>

        {error && <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"><AlertCircle size={16} className="mt-0.5 shrink-0" />{error}</div>}

        {responseData && <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-wrap items-center gap-4 border-b border-gray-200 px-5 py-4 dark:border-gray-800">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Response</h2>
            <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${responseData.ok ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"}`}>{responseData.status} {responseData.statusText}</span>
            <span className="inline-flex items-center gap-1.5 text-xs text-gray-500"><Clock3 size={13} />{elapsed} ms</span>
            <span className="text-xs text-gray-500">{responseData.contentType || "Unknown content type"}</span>
          </div>
          {responseData.truncated && <p className="border-b border-amber-200 bg-amber-50 px-5 py-2 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">Response preview was capped at 1 MB.</p>}
          <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,2fr)_minmax(220px,1fr)]">
            <div><h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">Body</h3><pre className="max-h-[36rem] min-h-32 overflow-auto whitespace-pre-wrap break-all rounded-xl bg-gray-50 p-4 text-xs leading-5 text-gray-800 dark:bg-gray-950 dark:text-gray-200">{responseData.body || "(empty response)"}</pre></div>
            <div><h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">Response headers</h3><pre className="max-h-[36rem] overflow-auto whitespace-pre-wrap break-all rounded-xl bg-gray-50 p-4 text-xs leading-5 text-gray-700 dark:bg-gray-950 dark:text-gray-300">{JSON.stringify(responseData.headers, null, 2)}</pre></div>
          </div>
        </section>}
      </div>
    </ToolPageShell>
  );
}
