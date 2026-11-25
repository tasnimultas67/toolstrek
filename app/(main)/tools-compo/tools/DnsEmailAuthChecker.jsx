"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Globe2, LoaderCircle, Search } from "lucide-react";
import ToolPageShell from "../ToolPageShell";
import { apiFetch } from "@/lib/apiClient";

const inputClass = "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white";

function RecordValue({ value }) {
  if (value?.unavailable) return <span className="text-sm text-gray-500">No answer ({value.reason})</span>;
  if (!value?.length) return <span className="text-sm text-gray-500">No records returned</span>;
  return <pre className="max-h-56 overflow-auto whitespace-pre-wrap break-all rounded-lg bg-gray-50 p-3 text-xs leading-5 text-gray-800 dark:bg-gray-950 dark:text-gray-200">{JSON.stringify(value, null, 2)}</pre>;
}

export default function DnsEmailAuthChecker() {
  const [domain, setDomain] = useState("");
  const [selector, setSelector] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function lookup(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const payload = await apiFetch("/api/dns-lookup", {
        body: { domain, selector },
        timeoutMs: 12_000,
      });
      setResult(payload);
    } catch (lookupError) {
      setError(lookupError.message || "The DNS lookup failed. Check the domain and try again.");
    } finally {
      setLoading(false);
    }
  }

  const auth = result?.emailAuthentication;

  return (
    <ToolPageShell className="px-4 py-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-7">
        <header className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-sky-700 dark:bg-sky-950/50 dark:text-sky-300"><Globe2 size={14} /> Domain utility</div>
          <h1 className="text-3xl font-black tracking-tight text-gray-950 dark:text-white md:text-5xl">DNS &amp; Email Authentication Checker</h1>
          <p className="max-w-3xl text-sm leading-6 text-gray-600 dark:text-gray-400 md:text-base">Inspect public DNS records and check whether a domain publishes SPF, DMARC, and a selected DKIM record.</p>
        </header>

        <form onSubmit={lookup} className="grid gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 md:grid-cols-[1fr_1fr_auto] md:items-end md:p-7">
          <div>
            <label htmlFor="dns-domain" className="mb-2 block text-sm font-semibold text-gray-800 dark:text-gray-200">Domain</label>
            <input id="dns-domain" required value={domain} onChange={(event) => setDomain(event.target.value)} className={inputClass} placeholder="example.com" autoComplete="off" spellCheck={false} />
          </div>
          <div>
            <label htmlFor="dkim-selector" className="mb-2 block text-sm font-semibold text-gray-800 dark:text-gray-200">DKIM selector <span className="font-normal text-gray-500">(optional)</span></label>
            <input id="dkim-selector" value={selector} onChange={(event) => setSelector(event.target.value)} className={inputClass} placeholder="selector1" autoComplete="off" spellCheck={false} />
          </div>
          <button disabled={loading} type="submit" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-wait disabled:opacity-60">{loading ? <LoaderCircle size={16} className="animate-spin" /> : <Search size={16} />}{loading ? "Looking up…" : "Check DNS"}</button>
          <p className="text-xs leading-5 text-gray-500 dark:text-gray-400 md:col-span-3">The domain name and optional selector are sent to ToolsTrek&apos;s DNS lookup endpoint. Only public DNS records are queried; email content and passwords are never requested.</p>
        </form>

        {error && <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"><AlertCircle size={16} className="mt-0.5 shrink-0" />{error}</div>}

        {result && (
          <div className="space-y-5">
            <section className="grid gap-3 sm:grid-cols-3">
              {[
                { label: "SPF", value: auth.spf, detail: "TXT record at the root domain" },
                { label: "DMARC", value: auth.dmarc, detail: "TXT record at _dmarc" },
                { label: "DKIM", value: auth.dkim.records[0], detail: auth.dkim.selector ? `Selector: ${auth.dkim.selector}` : "Enter a selector to look it up" },
              ].map((item) => <article key={item.label} className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"><div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">{item.value ? <CheckCircle2 size={16} className="text-emerald-600" /> : <AlertCircle size={16} className="text-amber-600" />}{item.label}{item.value ? " record found" : " not found"}</div><p className="mt-2 break-all font-mono text-xs leading-5 text-gray-600 dark:text-gray-400">{item.value || item.detail}</p></article>)}
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
              <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">DNS records for {result.domain}</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {Object.entries(result.records).map(([type, value]) => <article key={type} className="space-y-2"><h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">{type}</h3><RecordValue value={value} /></article>)}
              </div>
              <p className="mt-5 text-xs leading-5 text-gray-500 dark:text-gray-400">This is a record lookup, not a deliverability guarantee. DKIM selectors are chosen by each mail provider; an unknown selector can return no record even when DKIM is configured.</p>
            </section>
          </div>
        )}
      </div>
    </ToolPageShell>
  );
}
