// app/faq/page.tsx
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = {
  general: [
    {
      question: "What is ToolsTrek?",
      answer:
        "ToolsTrek is a collection of free online tools designed to make your digital life easier. We offer various utilities including a Link Shortener, WiFi QR Code Maker, Age Calculator, and more - all available for free with no registration required.",
    },
    {
      question: "Is ToolsTrek completely free to use?",
      answer:
        "Yes! All tools on ToolsTrek are completely free to use with no hidden charges. We may offer premium features in the future, but all current functionality will remain free.",
    },
    {
      question: "Do I need to create an account to use the tools?",
      answer:
        "No, you can use all of our tools without creating an account or logging in. Some features like saving your history might require an account in the future, but the core functionality is available to everyone immediately.",
    },
  ],
  linkShortener: [
    {
      question: "How does the Link Shortener work?",
      answer:
        "Our Link Shortener takes your long URL and creates a shortened version that redirects to your original link. Simply paste your URL into the input field, click 'Shorten,' and you'll get a compact link you can share anywhere.",
    },
    {
      question: "Are the shortened links permanent?",
      answer:
        "Currently, our shortened links don't expire, but we can't guarantee permanent availability. For critical links, we recommend using a dedicated URL shortener service.",
    },
    {
      question: "Can I customize the shortened URLs?",
      answer:
        "Currently, we don't offer custom slugs for shortened URLs. All our shortened links use randomly generated characters for uniqueness.",
    },
  ],
  wifiQr: [
    {
      question: "How do I use the WiFi QR Code Maker?",
      answer:
        "Enter your WiFi network name (SSID), select the security type (WPA, WEP, or none), and enter your password. Click 'Generate QR Code' and we'll create a QR code that you can print or display. Guests can scan it to automatically connect to your WiFi.",
    },
    {
      question: "Is my WiFi password safe when generating the QR code?",
      answer:
        "Yes! The QR code generation happens entirely in your browser - we never send your WiFi credentials to our servers. Your password remains private and secure on your device.",
    },
    {
      question: "Can I customize the appearance of the QR code?",
      answer:
        "Currently, we offer standard black-and-white QR codes. While you can't customize colors or add logos, the codes we generate are highly reliable and easy to scan.",
    },
  ],
  ageCalculator: [
    {
      question: "How accurate is the Age Calculator?",
      answer:
        "Our Age Calculator is extremely accurate, accounting for leap years and different month lengths. It calculates your exact age down to the day based on your birth date and the current date.",
    },
    {
      question: "Can I calculate age at a future or past date?",
      answer:
        "Yes! You can enter any target date (past, present, or future) to calculate what the age was or will be on that specific date.",
    },
  ],
};

const FAQCon = () => {
  return (
    <div className="container max-w-4xl py-12 px-4 sm:px-6 m-auto">
      <header className="text-center mb-12">
        <h1 className="text-3xl font-bold text-primary sm:text-4xl mb-2">
          Frequently Asked Questions
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Find answers to common questions about ToolsTrek and our free online
          tools
        </p>
      </header>

      <div className="space-y-12">
        <FAQSection title="General Questions" faqs={faqs.general} />
        <FAQSection title="Link Shortener" faqs={faqs.linkShortener} />
        <FAQSection title="WiFi QR Code Maker" faqs={faqs.wifiQr} />
        <FAQSection title="Age Calculator" faqs={faqs.ageCalculator} />
      </div>

      {/* Still have question */}
      <div className="mt-16 text-center bg-card p-8 rounded-lg shadow-sm">
        <h2 className="text-2xl font-semibold mb-2">Still have questions?</h2>
        <p className="text-muted-foreground mb-4">
          If you can't find the answer you're looking for, feel free to contact
          us directly.
        </p>
        <Button asChild>
          <Link href="/contact-us">Contact Us</Link>
        </Button>
      </div>
    </div>
  );
};
export default FAQCon;

function FAQSection({ title, faqs }) {
  return (
    <section>
      <h2 className="text-xl font-semibold border-b pb-2 mb-6 text-secondary-foreground">
        {title}
      </h2>
      <div className="">
        {faqs.map((faq, index) => (
          <Accordion key={index} type="single" collapsible>
            <AccordionItem value="item-1" className="relative">
              <AccordionTrigger className="text-base data-[state=open]:text-brandColor ">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="p-3 rounded-lg border-[0.5px] border-brandColor/20 bg-gray-50">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ))}
      </div>
    </section>
  );
}
