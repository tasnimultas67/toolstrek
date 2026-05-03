import { NextResponse } from "next/server";
import { lookup } from "whois";

export async function POST(request) {
  try {
    const body = await request.json();
    const { domain } = body;

    if (!domain || typeof domain !== "string") {
      return NextResponse.json(
        { error: "Domain name is required" },
        { status: 400 },
      );
    }

    // Basic domain validation
    const domainRegex =
      /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    if (!domainRegex.test(domain)) {
      return NextResponse.json(
        { error: "Please enter a valid domain name (e.g., example.com)" },
        { status: 400 },
      );
    }

    // Query WHOIS server
    const whoisData = await new Promise((resolve, reject) => {
      lookup(domain, { timeout: 10000 }, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });

    if (!whoisData) {
      return NextResponse.json(
        { error: "No WHOIS data found for this domain" },
        { status: 404 },
      );
    }

    // Parse the WHOIS data
    const parsed = parseWhoisData(whoisData, domain);

    return NextResponse.json({
      domain: domain,
      creationDate: parsed.creationDate,
      registrar: parsed.registrar,
    });
  } catch (error) {
    console.error("WHOIS lookup error:", error);

    return NextResponse.json(
      {
        error:
          "Unable to fetch domain age. The domain might not exist or WHOIS data is unavailable.",
      },
      { status: 500 },
    );
  }
}

function parseWhoisData(whoisText, domain) {
  const lines = whoisText.split("\n");
  let creationDate = null;
  let registrar = null;

  // Common date field names in WHOIS responses
  const datePatterns = [
    /Creation Date:\s*(.+)/i,
    /Created Date:\s*(.+)/i,
    /Registration Date:\s*(.+)/i,
    /Registered On:\s*(.+)/i,
    /created:\s*(.+)/i,
    /Date created:\s*(.+)/i,
  ];

  const registrarPatterns = [
    /Registrar:\s*(.+)/i,
    /Sponsoring Registrar:\s*(.+)/i,
  ];

  for (const line of lines) {
    // Extract creation date
    if (!creationDate) {
      for (const pattern of datePatterns) {
        const match = line.match(pattern);
        if (match) {
          creationDate = match[1].trim();
          break;
        }
      }
    }

    // Extract registrar
    if (!registrar) {
      for (const pattern of registrarPatterns) {
        const match = line.match(pattern);
        if (match) {
          registrar = match[1].trim();
          break;
        }
      }
    }

    if (creationDate && registrar) break;
  }

  if (!creationDate) {
    throw new Error("Could not extract creation date for this domain");
  }

  // Parse various date formats
  let parsedDate = new Date(creationDate);
  if (isNaN(parsedDate.getTime())) {
    // Try alternative formats (e.g., "YYYY-MM-DD")
    const altDate = new Date(
      creationDate.replace(/(\d{4})-(\d{2})-(\d{2})/, "$1-$2-$3"),
    );
    if (!isNaN(altDate.getTime())) {
      parsedDate = altDate;
    } else {
      throw new Error("Unable to parse domain creation date");
    }
  }

  return {
    creationDate: parsedDate.toISOString(),
    registrar: registrar || "Not available",
  };
}
