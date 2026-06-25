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

    let rdapData = null;
    let whoisData = null;

    // 1. Try RDAP lookup first
    try {
      rdapData = await queryRdap(domain);
    } catch (rdapError) {
      console.error("RDAP lookup failed for", domain, ":", rdapError.message);
    }

    // 2. Try standard WHOIS lookup (as fallback or for extra details)
    try {
      const rawWhoisText = await queryWhois(domain);
      if (rawWhoisText) {
        whoisData = parseWhoisData(rawWhoisText);
      }
    } catch (whoisError) {
      console.error("WHOIS lookup failed for", domain, ":", whoisError.message);
    }

    // 3. Merge data
    if (!rdapData && !whoisData) {
      return NextResponse.json(
        {
          error:
            "Unable to fetch domain age. The domain might not exist or WHOIS data is unavailable.",
        },
        { status: 500 },
      );
    }

    const merged = {
      domain: domain,
      creationDate: (rdapData && rdapData.creationDate) || (whoisData && whoisData.creationDate),
      updatedDate: (rdapData && rdapData.updatedDate) || (whoisData && whoisData.updatedDate) || "Not available",
      expiryDate: (rdapData && rdapData.expiryDate) || (whoisData && whoisData.expiryDate) || "Not available",
      registrar: (rdapData && rdapData.registrar) || (whoisData && whoisData.registrar) || "Not available",
      nameservers: (rdapData && rdapData.nameservers && rdapData.nameservers.length > 0)
        ? rdapData.nameservers.join(", ")
        : (whoisData && whoisData.nameservers && whoisData.nameservers.length > 0)
          ? whoisData.nameservers.join(", ")
          : "Not available",
      status: (rdapData && rdapData.status && rdapData.status.length > 0)
        ? rdapData.status.join(", ")
        : (whoisData && whoisData.status && whoisData.status.length > 0)
          ? whoisData.status.join(", ")
          : "Registered",
      organization: (whoisData && whoisData.organization) || (rdapData && rdapData.organization) || "Not available",
      country: (whoisData && whoisData.country) || (rdapData && rdapData.country) || "Not available"
    };

    if (!merged.creationDate) {
      return NextResponse.json(
        { error: "Could not extract creation date for this domain" },
        { status: 500 },
      );
    }

    return NextResponse.json(merged);
  } catch (error) {
    console.error("General domain check error:", error);

    return NextResponse.json(
      {
        error:
          "Unable to fetch domain age. The domain might not exist or WHOIS data is unavailable.",
      },
      { status: 500 },
    );
  }
}

async function queryRdap(domain) {
  const res = await fetch(`https://rdap.org/domain/${domain}`, {
    headers: {
      'Accept': 'application/rdap+json, application/json'
    }
  });
  if (!res.ok) {
    throw new Error(`RDAP HTTP error! status: ${res.status}`);
  }
  const json = await res.json();
  return parseRdapData(json);
}

async function queryWhois(domain) {
  return new Promise((resolve, reject) => {
    lookup(domain, { timeout: 10000 }, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

function parseRdapData(rdapJson) {
  const result = {
    creationDate: null,
    updatedDate: null,
    expiryDate: null,
    registrar: null,
    nameservers: [],
    status: [],
    organization: null,
    country: null
  };

  if (Array.isArray(rdapJson.events)) {
    for (const event of rdapJson.events) {
      if (event.eventAction === 'registration' && event.eventDate) {
        result.creationDate = new Date(event.eventDate).toISOString();
      } else if (event.eventAction === 'last changed' && event.eventDate) {
        result.updatedDate = new Date(event.eventDate).toISOString();
      } else if (event.eventAction === 'expiration' && event.eventDate) {
        result.expiryDate = new Date(event.eventDate).toISOString();
      }
    }
  }

  if (Array.isArray(rdapJson.entities)) {
    for (const entity of rdapJson.entities) {
      if (entity.roles && entity.roles.includes('registrar')) {
        if (entity.vcardArray && entity.vcardArray[1]) {
          const fn = entity.vcardArray[1].find(item => item[0] === 'fn');
          if (fn && fn[3]) {
            result.registrar = fn[3];
          }
        }
      }
      
      if (entity.roles && entity.roles.includes('registrant')) {
        if (entity.vcardArray && entity.vcardArray[1]) {
          const fn = entity.vcardArray[1].find(item => item[0] === 'fn');
          if (fn && fn[3]) {
            result.organization = fn[3];
          }
          
          const org = entity.vcardArray[1].find(item => item[0] === 'org');
          if (org && org[3]) {
            result.organization = org[3];
          }

          const adr = entity.vcardArray[1].find(item => item[0] === 'adr');
          if (adr && adr[3] && Array.isArray(adr[3])) {
            const countryVal = adr[3][adr[3].length - 1];
            if (countryVal) {
              result.country = countryVal.toUpperCase();
            }
          }
        }
      }
    }
  }

  if (Array.isArray(rdapJson.nameservers)) {
    result.nameservers = rdapJson.nameservers
      .map(ns => ns.ldhName)
      .filter(Boolean);
  }

  if (Array.isArray(rdapJson.status)) {
    result.status = rdapJson.status;
  }

  return result;
}

function cleanDate(dateStr) {
  if (!dateStr) return null;
  let clean = dateStr.trim();
  clean = clean.replace(/\s*\(.*\)\s*$/, '');
  
  let d = new Date(clean);
  if (!isNaN(d.getTime())) {
    return d.toISOString();
  }

  const dmYMatch = clean.match(/^(\d{1,2})[-./](\d{1,2})[-./](\d{4})/);
  if (dmYMatch) {
    const attempt = new Date(`${dmYMatch[3]}-${dmYMatch[2]}-${dmYMatch[1]}`);
    if (!isNaN(attempt.getTime())) return attempt.toISOString();
  }

  clean = clean.replace(/\./g, '-');
  d = new Date(clean);
  if (!isNaN(d.getTime())) {
    return d.toISOString();
  }

  return null;
}

function parseWhoisData(whoisText) {
  const lines = whoisText.split('\n');
  const result = {
    creationDate: null,
    updatedDate: null,
    expiryDate: null,
    registrar: null,
    nameservers: [],
    status: [],
    organization: null,
    country: null
  };

  const creationDatePatterns = [
    /Creation Date:\s*(.+)/i,
    /Created Date:\s*(.+)/i,
    /Registration Date:\s*(.+)/i,
    /Registered On:\s*(.+)/i,
    /created:\s*(.+)/i,
    /Date created:\s*(.+)/i,
    /Registered Date:\s*(.+)/i,
    /Domain Name Commencement Date:\s*(.+)/i,
    /Record created on:\s*(.+)/i,
    /Activation:\s*(.+)/i
  ];

  const updatedDatePatterns = [
    /Updated Date:\s*(.+)/i,
    /Last Updated:\s*(.+)/i,
    /Modified:\s*(.+)/i,
    /last-update:\s*(.+)/i,
    /Updated:\s*(.+)/i,
    /changed:\s*(.+)/i,
    /Record last updated on:\s*(.+)/i
  ];

  const expiryDatePatterns = [
    /Registry Expiration Date:\s*(.+)/i,
    /Registrar Registration Expiration Date:\s*(.+)/i,
    /Expiration Date:\s*(.+)/i,
    /Expiration Time:\s*(.+)/i,
    /Expiry Date:\s*(.+)/i,
    /expires:\s*(.+)/i,
    /Expires on:\s*(.+)/i,
    /Renewal Date:\s*(.+)/i,
    /Registry Expiry Date:\s*(.+)/i,
    /Paid-To-Date:\s*(.+)/i
  ];

  const registrarPatterns = [
    /Registrar:\s*(.+)/i,
    /Sponsoring Registrar:\s*(.+)/i,
    /Registrar Name:\s*(.+)/i,
    /registrar-name:\s*(.+)/i,
    /Authorized Agency:\s*(.+)/i
  ];

  const nameserverPatterns = [
    /Name Server:\s*(.+)/i,
    /nameserver:\s*(.+)/i,
    /Nserver:\s*(.+)/i,
    /NS:\s*(.+)/i
  ];

  const statusPatterns = [
    /Domain Status:\s*([a-zA-Z\s\-]+)/i,
    /Status:\s*([a-zA-Z\s\-]+)/i,
    /State:\s*([a-zA-Z\s\-]+)/i
  ];

  const organizationPatterns = [
    /Registrant Organization:\s*(.+)/i,
    /Registrant Org:\s*(.+)/i,
    /Registrant:\s*(.+)/i,
    /Registrant Name:\s*(.+)/i,
    /OrgName:\s*(.+)/i
  ];

  const countryPatterns = [
    /Registrant Country:\s*(.+)/i,
    /Registrant Country\/Economy:\s*(.+)/i,
    /country:\s*(.+)/i,
    /Registrant State\/Province:\s*(.+)/i
  ];

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    if (!result.creationDate) {
      for (const pattern of creationDatePatterns) {
        const match = line.match(pattern);
        if (match) {
          const date = cleanDate(match[1]);
          if (date) {
            result.creationDate = date;
            break;
          }
        }
      }
    }

    if (!result.updatedDate) {
      for (const pattern of updatedDatePatterns) {
        const match = line.match(pattern);
        if (match) {
          const date = cleanDate(match[1]);
          if (date) {
            result.updatedDate = date;
            break;
          }
        }
      }
    }

    if (!result.expiryDate) {
      for (const pattern of expiryDatePatterns) {
        const match = line.match(pattern);
        if (match) {
          const date = cleanDate(match[1]);
          if (date) {
            result.expiryDate = date;
            break;
          }
        }
      }
    }

    if (!result.registrar) {
      for (const pattern of registrarPatterns) {
        const match = line.match(pattern);
        if (match) {
          result.registrar = match[1].trim();
          break;
        }
      }
    }

    for (const pattern of nameserverPatterns) {
      const match = line.match(pattern);
      if (match) {
        const ns = match[1].trim().toLowerCase();
        if (ns && !result.nameservers.includes(ns)) {
          result.nameservers.push(ns);
        }
      }
    }

    for (const pattern of statusPatterns) {
      const match = line.match(pattern);
      if (match) {
        const status = match[1].trim();
        if (status && !result.status.includes(status)) {
          result.status.push(status);
        }
      }
    }

    if (!result.organization) {
      for (const pattern of organizationPatterns) {
        const match = line.match(pattern);
        if (match) {
          result.organization = match[1].trim();
          break;
        }
      }
    }

    if (!result.country) {
      for (const pattern of countryPatterns) {
        const match = line.match(pattern);
        if (match) {
          result.country = match[1].trim().toUpperCase();
          break;
        }
      }
    }
  }

  return result;
}
