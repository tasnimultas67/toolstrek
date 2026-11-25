import "./globals.css";
import ThemeProvider from "./theme-context.jsx";
import { Analytics } from "@vercel/analytics/next";
import { Google_Sans_Flex, Playfair_Display } from "next/font/google";
import { SITE_NAME, SITE_URL, TOOL_COUNT } from "../lib/siteConfig";

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
  metadataBase: new URL(SITE_URL),

  title: {
    default: "ToolsTrek — Your Online Utility Hub",
    template: "%s | ToolsTrek",
  },
  description: `${TOOL_COUNT} free browser-first tools for developers, students, and everyday tasks. Most file, text, and calculator processing stays in your browser; live checks contact relevant services. No account required.`,
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
    "BMI calculator",
    "unit converter",
  ],

  authors: [{ name: "Tasnimul Haque", url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "technology",

  /* -- Open Graph ---------------------------------------------------- */
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${TOOL_COUNT} Free Online Tools`,
    description: `${TOOL_COUNT} free browser-first tools for files, text, calculations, design, and developer workflows. No account required.`,
    images: [
      {
        url: `${SITE_URL}/brand/toolstrek-social-card.png`,
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
    title: `${SITE_NAME} — ${TOOL_COUNT} Free Online Tools`,
    description: `${TOOL_COUNT} free browser-first tools for files, text, calculations, design, and developer workflows. No account required.`,
    images: [`${SITE_URL}/brand/toolstrek-social-card.png`],
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
  url: SITE_URL,
  description: `${TOOL_COUNT} free online tools for developers, students, and everyday tasks.`,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/tools?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "ToolsTrek",
  url: SITE_URL,
  logo: {
    "@type": "ImageObject",
    url: `${SITE_URL}/brand/toolstrek-logo-primary.svg`,
    width: 2400,
    height: 490,
  },
  sameAs: [
    "https://github.com/tasnimultas67/toolstrek",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    url: `${SITE_URL}/faq`,
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
