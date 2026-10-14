import "./globals.css";
import ThemeProvider from "./theme-context.jsx";
import { Analytics } from "@vercel/analytics/next";
import { Google_Sans_Flex, Playfair_Display } from "next/font/google";

const BASE_URL = "https://toolstrek.vercel.app";

const playfairDisplay = Playfair_Display({
  display: "swap",
  preload: true,
  weight: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-playfairDisplay",
});

const googleSansFlex = Google_Sans_Flex({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  style: ["normal"],
  fallback: ["system-ui", "sans-serif"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-googleSansFlex",
});

/* ------------------------------------------------------------------ */
/*  Root-level metadata — inherited by every page unless overridden    */
/* ------------------------------------------------------------------ */
export const metadata = {
  metadataBase: new URL(BASE_URL),

  title: {
    default: "ToolsTrek — Your Online Utility Hub",
    template: "%s | ToolsTrek",
  },
  description:
    "100+ free online tools for developers, students & professionals — QR codes, PDF utilities, image converters, calculators, text tools and more. No sign-up required, 100% in-browser privacy.",
  keywords: [
    "free online tools",
    "web utilities",
    "QR code generator",
    "PDF tools",
    "image converter",
    "online calculator",
    "text tools",
    "developer tools",
    "ToolsTrek",
    "no signup tools",
    "client-side tools",
    "privacy-friendly tools",
    "URL shortener",
    "BMI calculator",
    "unit converter",
  ],

  authors: [{ name: "Tasnimul Haque", url: BASE_URL }],
  creator: "ToolsTrek",
  publisher: "ToolsTrek",
  category: "technology",

  /* -- Open Graph ---------------------------------------------------- */
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "ToolsTrek",
    title: "ToolsTrek — 100+ Free Online Utility Tools",
    description:
      "Explore 100+ free, privacy-first online tools. QR codes, PDF tools, image converters, calculators, and more — no sign-up, runs entirely in your browser.",
    images: [
      {
        url: `${BASE_URL}/toolstrek-logo.png`,
        width: 1200,
        height: 630,
        alt: "ToolsTrek — Your Online Utility Hub",
      },
    ],
  },

  /* -- Twitter / X Card ---------------------------------------------- */
  twitter: {
    card: "summary_large_image",
    site: "@toolstrek",
    creator: "@toolstrek",
    title: "ToolsTrek — 100+ Free Online Utility Tools",
    description:
      "Explore 100+ free, privacy-first online tools. QR codes, PDF tools, image converters, calculators, and more — no sign-up, runs entirely in your browser.",
    images: [`${BASE_URL}/toolstrek-logo.png`],
  },

  /* -- Robots -------------------------------------------------------- */
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  /* -- Canonical / Alternates ---------------------------------------- */
  alternates: {
    canonical: BASE_URL,
    languages: {
      "en-US": BASE_URL,
    },
  },

  /* -- Icons --------------------------------------------------------- */
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/toolstrek-logo.svg", type: "image/svg+xml" },
    ],
    apple: "/toolstrek-logo.png",
    shortcut: "/favicon.ico",
  },

  /* -- Manifest ------------------------------------------------------ */
  manifest: `${BASE_URL}/manifest.webmanifest`,

  /* -- Format detection ---------------------------------------------- */
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
};

/* ------------------------------------------------------------------ */
/*  JSON-LD structured data (WebSite + Organization)                   */
/* ------------------------------------------------------------------ */
const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "ToolsTrek",
  alternateName: "Tools Trek",
  url: BASE_URL,
  description:
    "100+ free online tools — QR codes, PDF utilities, calculators, converters, text tools, and more.",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${BASE_URL}/tools?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "ToolsTrek",
  url: BASE_URL,
  logo: {
    "@type": "ImageObject",
    url: `${BASE_URL}/toolstrek-logo.png`,
    width: 512,
    height: 512,
  },
  sameAs: [
    "https://github.com/tasnimultas67/toolstrek",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    url: `${BASE_URL}/faq`,
    availableLanguage: "English",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${playfairDisplay.variable} ${googleSansFlex.variable}`}
    >
      <head>
        {/* Theme initialisation — runs before first paint to prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var t = localStorage.getItem('theme');
                  if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.dataset.theme = 'dark';
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.dataset.theme = 'light';
                  }
                } catch (e) {}

                try {
                  const targetAttrs = ['bis_skin_checked'];
                  const clean = (node) => {
                    if (node.nodeType !== 1) return;
                    for (const attr of targetAttrs) {
                      if (node.hasAttribute(attr)) {
                        node.removeAttribute(attr);
                      }
                    }
                    node.querySelectorAll('*').forEach(el => {
                      for (const attr of targetAttrs) {
                        if (el.hasAttribute(attr)) {
                          el.removeAttribute(attr);
                        }
                      }
                    });
                  };
                  const observer = new MutationObserver((mutations) => {
                    for (const mutation of mutations) {
                      if (mutation.type === 'attributes' && mutation.target.nodeType === 1) {
                        for (const attr of targetAttrs) {
                          if (mutation.target.hasAttribute(attr)) {
                            mutation.target.removeAttribute(attr);
                          }
                        }
                      } else if (mutation.type === 'childList') {
                        mutation.addedNodes.forEach(clean);
                      }
                    }
                  });
                  observer.observe(document.documentElement, {
                    attributes: true,
                    childList: true,
                    subtree: true,
                    attributeFilter: targetAttrs
                  });
                } catch (e) {}
              })();
            `,
          }}
        />

        {/* WebSite structured data — enables Google Sitelinks Searchbox */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />

        {/* Organization structured data — brand knowledge panel */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider>{children}</ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
