import { Outfit } from "next/font/google";
import "../globals.css";

import Header from "./tools-compo/Header";
import { Toaster } from "@/components/ui/sonner";
import Footer from "./tools-compo/Footer";
import GlobalSearchModal from "@/components/ui/GlobalSearchModal";
import RecentToolsTracker from "@/components/RecentToolsTracker";

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
  authors: [{ name: "Tasnimul Haque", url: "https://toolstrek.vercel.app" }],
  creator: "ToolsTrek",
  publisher: "ToolsTrek",
  category: "technology",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://toolstrek.vercel.app",
    siteName: "ToolsTrek",
    title: "ToolsTrek — 100+ Free Online Utility Tools",
    description:
      "Explore 100+ free, privacy-first online tools. QR codes, PDF tools, image converters, calculators, and more — no sign-up, runs entirely in your browser.",
    images: [
      {
        url: "https://toolstrek.vercel.app/toolstrek-logo.png",
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
    title: "ToolsTrek — 100+ Free Online Utility Tools",
    description:
      "Explore 100+ free, privacy-first online tools. QR codes, PDF tools, image converters, calculators, and more — no sign-up, runs entirely in your browser.",
    images: ["https://toolstrek.vercel.app/toolstrek-logo.png"],
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
  alternates: {
    canonical: "https://toolstrek.vercel.app",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/toolstrek-logo.svg", type: "image/svg+xml" },
    ],
    apple: "/toolstrek-logo.png",
    shortcut: "/favicon.ico",
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
      </div>
    </>
  );
}
