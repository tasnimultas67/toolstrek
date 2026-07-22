import MonitorHzTest from "@/app/(main)/tools-compo/tools/MonitorHzTest";
import React from "react";

export const metadata = {
  title: "Monitor Hz Test | Check Display Refresh Rate Online | ToolsTrek",
  description:
    "Free online monitor Hz test. Detect your display refresh rate using interactive flicker and motion tests. Supports 60Hz, 120Hz, 144Hz, 240Hz and custom frequencies. 100% private, runs entirely in your browser.",
  keywords: [
    "monitor hz test",
    "refresh rate test",
    "display hz test",
    "check monitor refresh rate",
    "120hz test",
    "144hz test",
    "60hz test",
    "240hz test",
    "monitor frequency",
    "display refresh rate checker",
    "ToolsTrek",
  ],
  openGraph: {
    title: "Monitor Hz Test | Check Display Refresh Rate Online | ToolsTrek",
    description:
      "Detect your display refresh rate using interactive flicker and motion tests. Supports 60Hz, 120Hz, 144Hz, 240Hz and custom frequencies.",
    type: "website",
    url: "https://toolstrek.com/tools/monitor-hz-test",
    siteName: "ToolsTrek",
  },
  twitter: {
    card: "summary_large_image",
    title: "Monitor Hz Test | Check Display Refresh Rate Online | ToolsTrek",
    description:
      "Detect your display refresh rate using interactive flicker and motion tests. Supports 60Hz, 120Hz, 144Hz, 240Hz and custom frequencies.",
  },
  alternates: {
    canonical: "https://toolstrek.com/tools/monitor-hz-test",
  },
};

const page = () => {
  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Monitor Hz Test",
            description:
              "Detect your display refresh rate using interactive flicker and motion tests. Supports 60Hz, 120Hz, 144Hz, 240Hz and custom frequencies.",
            url: "https://toolstrek.com/tools/monitor-hz-test",
            applicationCategory: "Utility",
            operatingSystem: "All",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            featureList: [
              "Interactive flicker test with adjustable refresh frequencies",
              "Motion aliasing test with oscillating bar animation",
              "Auto-scan mode to detect likely refresh rate",
              "Preset buttons for 30Hz, 60Hz, 75Hz, 120Hz, 144Hz, 240Hz",
              "Custom Hz slider for fine-tuned detection",
              "100% client-side, no data leaves your browser",
            ],
            creator: {
              "@type": "Organization",
              name: "ToolsTrek",
            },
          }),
        }}
      />
      <MonitorHzTest />
    </div>
  );
};

export default page;
