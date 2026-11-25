import { Outfit } from "next/font/google";
import "../globals.css";

import Header from "./tools-compo/Header";
import { Toaster } from "@/components/ui/sonner";
import Footer from "./tools-compo/Footer";
import GlobalSearchModal from "@/components/ui/GlobalSearchModal";
import RecentToolsTracker from "@/components/RecentToolsTracker";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import { SITE_NAME, SITE_URL, TOOL_COUNT } from "@/lib/siteConfig";

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

// NOTE: `title` (default + `%s | ToolsTrek` template) is inherited from the root
// layout in app/layout.js. Declaring it here as well would apply the template to
// this segment's default title, producing a duplicated brand name
// (e.g. "ToolsTrek — Your Online Utility Hub | ToolsTrek") on routes such as
// the homepage that don't set their own title.
export const metadata = {
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
  twitter: {
    card: "summary_large_image",
    site: "@toolstrek",
    creator: "@toolstrek",
    title: `${SITE_NAME} — ${TOOL_COUNT} Free Online Tools`,
    description: `${TOOL_COUNT} free browser-first tools for files, text, calculations, design, and developer workflows. No account required.`,
    images: [`${SITE_URL}/brand/toolstrek-social-card.png`],
  },
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
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
};

export default function MainLayout({ children }) {
  return (
    <>
      <div className={`${outfit.className}`} suppressHydrationWarning>
        <Header />
        <RecentToolsTracker />
        {children}
        <GlobalSearchModal />
        <Toaster />
        <Footer></Footer>
        <ScrollToTopButton />
      </div>
    </>
  );
}
