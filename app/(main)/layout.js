import { Outfit, Google_Sans } from "next/font/google";
import "../globals.css";

import Header from "./tools-compo/Header";
import { Toaster } from "sonner";
import Footer from "./tools-compo/Footer";
import GlobalSearchModal from "@/components/ui/GlobalSearchModal";
import RecentToolsTracker from "@/components/RecentToolsTracker";

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  preload: true,
});
const google_sans = Google_Sans({
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const metadata = {
  title: "ToolsTrek — Your Online Utility Hub",
  description:
    "ToolsTrek – Your go-to destination for smart online utilities. Instantly shorten URLs, generate QR codes, calculate metrics, and streamline digital tasks with ease. Explore powerful tools designed for efficiency!",
};

export default function MainLayout({ children }) {
  return (
    <>
      <div className={`${google_sans.className}`} suppressHydrationWarning>
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
