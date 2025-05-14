import { Outfit } from "next/font/google";
import "./globals.css";
import Header from "./tools-compo/Header";
import { Toaster } from "sonner";
import Footer from "./tools-compo/Footer";

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const metadata = {
  title: "ToolsTrek — Your Online Utility Hub",
  description:
    "ToolsTrek – Your go-to destination for smart online utilities. Instantly shorten URLs, generate QR codes, calculate metrics, and streamline digital tasks with ease. Explore powerful tools designed for efficiency!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${outfit.className}`}>
        <Header />
        {children}

        <Toaster />
        <Footer></Footer>
      </body>
    </html>
  );
}
