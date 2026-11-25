import { resolve4, resolve6, resolveCaa, resolveCname, resolveMx, resolveNs, resolveTxt } from "node:dns/promises";
import { isIP } from "node:net";
import { domainToASCII } from "node:url";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 15;

function normalizeDomain(value) {
  if (typeof value !== "string") return null;
  let hostname;
  try {
    hostname = domainToASCII(value.trim().replace(/\.$/, "").toLowerCase());
  } catch {
    return null;
  }
  if (!hostname || hostname.length > 253 || !hostname.includes(".") || isIP(hostname)) return null;

  const labels = hostname.split(".");
  if (labels.some((label) => !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.test(label))) {
    return null;
  }
  if (!/^[a-z](?:[a-z0-9-]{0,61}[a-z0-9])$/i.test(labels.at(-1))) return null;

  return hostname;
}

async function resolveRecord(resolver) {
  let timeoutId;
  try {
    return await Promise.race([
      resolver(),
      new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error("DNS lookup timed out")), 7000);
      }),
    ]);
  } catch (error) {
    return { unavailable: true, reason: error.code || "LOOKUP_FAILED" };
  } finally {
    clearTimeout(timeoutId);
  }
}

function flattenTxt(records) {
  if (!Array.isArray(records)) return [];
  return records.map((record) => Array.isArray(record) ? record.join("") : String(record));
}

export async function POST(request) {
  let rawBody;
  try {
    rawBody = await request.text();
  } catch {
    return NextResponse.json({ error: "Could not read the request body." }, { status: 400 });
  }

  if (Buffer.byteLength(rawBody, "utf8") > 2048) {
    return NextResponse.json({ error: "Request body is too large." }, { status: 413 });
  }

  let body;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Send a valid JSON request body." }, { status: 400 });
  }

  const domain = normalizeDomain(body?.domain);
  if (!domain) {
    return NextResponse.json({ error: "Enter a valid public domain name, such as example.com." }, { status: 400 });
  }

  const selector = typeof body.selector === "string" ? body.selector.trim() : "";
  if (selector && !/^[a-z0-9](?:[a-z0-9_-]{0,61}[a-z0-9])?$/i.test(selector)) {
    return NextResponse.json({ error: "Use a valid DKIM selector (letters, numbers, hyphens or underscores)." }, { status: 400 });
  }

  const [a, aaaa, cname, mx, ns, caa, txt, dmarc, dkim] = await Promise.all([
    resolveRecord(() => resolve4(domain)),
    resolveRecord(() => resolve6(domain)),
    resolveRecord(() => resolveCname(domain)),
    resolveRecord(() => resolveMx(domain)),
    resolveRecord(() => resolveNs(domain)),
    resolveRecord(() => resolveCaa(domain)),
    resolveRecord(() => resolveTxt(domain)),
    resolveRecord(() => resolveTxt(`_dmarc.${domain}`)),
    selector
      ? resolveRecord(() => resolveTxt(`${selector}._domainkey.${domain}`))
      : Promise.resolve([]),
  ]);

  const txtRecords = flattenTxt(txt);
  const dmarcRecords = flattenTxt(dmarc);
  const dkimRecords = flattenTxt(dkim);
  const spf = txtRecords.find((record) => /^v=spf1\b/i.test(record)) || null;
  const dmarcPolicy = dmarcRecords.find((record) => /^v=dmarc1\b/i.test(record)) || null;

  return NextResponse.json(
    {
      domain,
      records: {
        A: a,
        AAAA: aaaa,
        CNAME: cname,
        MX: mx,
        NS: ns,
        CAA: caa,
        TXT: txtRecords,
      },
      emailAuthentication: {
        spf,
        dmarc: dmarcPolicy,
        dkim: { selector: selector || null, records: dkimRecords },
      },
    },
    { headers: { "Cache-Control": "public, max-age=60, s-maxage=300" } },
  );
}
