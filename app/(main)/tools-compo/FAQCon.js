import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import * as motion from "motion/react-client";

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

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const accordionItemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

const FAQCon = () => {
  return (
    <motion.div
      className="container w-11/12 pb-12 pt-26 px-2 sm:px-3 m-auto"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.header className="text-center mb-12" variants={itemVariants}>
        <h1 className="text-3xl font-bold text-primary sm:text-4xl mb-2">
          Frequently Asked Questions
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Find answers to common questions about ToolsTrek and our free online
          tools
        </p>
      </motion.header>

      <motion.div className="space-y-12" variants={containerVariants}>
        <FAQSection title="General Questions" faqs={faqs.general} />
        <FAQSection title="Link Shortener" faqs={faqs.linkShortener} />
        <FAQSection title="WiFi QR Code Maker" faqs={faqs.wifiQr} />
        <FAQSection title="Age Calculator" faqs={faqs.ageCalculator} />
      </motion.div>

      {/* Still have question */}
      <motion.div
        className="mt-16 text-center bg-card p-8 rounded-lg shadow-sm"
        variants={itemVariants}
        whileHover={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <h2 className="text-2xl font-semibold mb-2">Still have questions?</h2>
        <p className="text-muted-foreground mb-4">
          If you can't find the answer you're looking for, feel free to contact
          us directly.
        </p>
        <Button asChild>
          <Link href="/contact-us">Contact Us</Link>
        </Button>
      </motion.div>
    </motion.div>
  );
};
export default FAQCon;

function FAQSection({ title, faqs }) {
  return (
    <motion.section variants={itemVariants}>
      <motion.h2
        className="text-xl font-semibold border-b pb-2 mb-6 text-secondary-foreground"
        whileInView={{ x: 0, opacity: 1 }}
        initial={{ x: -20, opacity: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
      >
        {title}
      </motion.h2>
      <div className="space-y-2">
        {faqs.map((faq, index) => (
          <motion.div
            key={index}
            variants={accordionItemVariants}
            initial="hidden"
            animate="visible"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            <Accordion type="single" collapsible>
              <AccordionItem value={`item-${index}`} className="relative">
                <AccordionTrigger className="text-base data-[state=open]:text-brandColor hover:text-brandColor/80 transition-colors">
                  <motion.span layout transition={{ duration: 0.2 }}>
                    {faq.question}
                  </motion.span>
                </AccordionTrigger>
                <AccordionContent className="p-3 rounded-lg border-[0.5px] border-brandColor/20 bg-gray-50">
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    {faq.answer}
                  </motion.p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
