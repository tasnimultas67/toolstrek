import EmailSignatureEditor from "@/app/(main)/tools-compo/tools/EmailSignatureEditor";
import React from "react";

export const metadata = {
  title: "Email Signature Editor | Professional Signature Generator | ToolsTrek",
  description:
    "Create stunning professional email signatures online for free. Customize fonts, colors, layouts, social icons, photos, logos, CTA buttons, disclaimers & more. Export to HTML for Gmail, Outlook, Apple Mail and more.",
  keywords: [
    "email signature editor",
    "email signature generator",
    "professional email signature",
    "html email signature",
    "gmail signature maker",
    "outlook signature generator",
    "custom email signature",
    "free email signature",
    "email signature template",
    "email signature with photo",
    "email signature with logo",
    "business email signature",
    "email signature design",
    "ToolsTrek",
  ],
  openGraph: {
    title: "Email Signature Editor | Professional Signature Generator | ToolsTrek",
    description:
      "Create stunning professional email signatures online for free. Customize fonts, colors, layouts, social icons, photos, logos, CTA buttons, disclaimers & more.",
    type: "website",
    url: "https://toolstrek.com/tools/email-signature-editor",
    siteName: "ToolsTrek",
  },
  twitter: {
    card: "summary_large_image",
    title: "Email Signature Editor | Professional Signature Generator | ToolsTrek",
    description:
      "Create stunning professional email signatures online for free. Customize fonts, colors, layouts, social icons, photos, logos, CTA buttons & more.",
  },
  alternates: {
    canonical: "https://toolstrek.com/tools/email-signature-editor",
  },
};

const page = () => {
  return (
    <div>
      {/* Structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Email Signature Editor",
            description:
              "A professional, fully customizable email signature editor. Create HTML email signatures with photos, logos, social icons, CTA buttons, disclaimers, and advanced design options for Gmail, Outlook, Apple Mail, and more.",
            url: "https://toolstrek.com/tools/email-signature-editor",
            applicationCategory: "ProductivityApplication",
            operatingSystem: "All",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            featureList: [
              "5 professional signature templates (Professional, Modern, Minimal, Creative, Corporate)",
              "Full name, job title, department, company, pronouns fields",
              "Email, phone, mobile, website, address contact fields",
              "6 social platform links (LinkedIn, Twitter, Facebook, Instagram, GitHub, YouTube)",
              "Profile photo upload or URL with circle/rounded/square shapes",
              "Company logo upload or URL with adjustable width",
              "Font family, size (min 14px desktop, 12px mobile), line height customization",
              "Primary, secondary, text, background color pickers",
              "Horizontal and vertical layout options",
              "Gradient divider line with style, color, and width controls",
              "Social icon styles: circle, square, plain",
              "Advanced: CTA button with custom text and URL",
              "Advanced: Scheduling link (Calendly/Cal.com)",
              "Advanced: Legal disclaimer section",
              "Advanced: Custom HTML injection",
              "Advanced: Eco-friendly green badge",
              "Live preview in desktop and mobile modes",
              "Email client mockup preview",
              "One-click copy signature (rich HTML for email clients)",
              "Copy raw HTML code",
              "Download as .html file",
              "Installation guides for Gmail, Outlook, Apple Mail, Thunderbird, Office 365, Yahoo Mail",
              "Best practices, pro tips, and comprehensive FAQ",
              "100% browser-based & client-side – no data stored",
            ],
            creator: {
              "@type": "Organization",
              name: "ToolsTrek",
            },
          }),
        }}
      />
      <EmailSignatureEditor />
    </div>
  );
};

export default page;
