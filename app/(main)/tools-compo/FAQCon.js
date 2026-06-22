import { ChevronDown, HelpCircle, MessageCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import * as motion from "motion/react-client";
import faqs from "../data/faqs.json";

// Helper function to format section title
const formatSectionTitle = (sectionKey) => {
  const titleMap = {
    general: "General Questions",
    privacyAndSecurity: "Privacy & Security",
    pdfTools: "PDF Tools",
    qrAndSharing: "QR Codes & Sharing",
    imagesAndText: "Images & Text",
    productivityAndCalculators: "Productivity & Calculators",
  };

  return (
    titleMap[sectionKey] ||
    sectionKey
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (value) => value.toUpperCase())
      .trim()
  );
};

// Animation variants (subtle and professional)
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

const FAQCon = () => {
  const faqSections = Object.entries(faqs).map(([key, value]) => ({
    id: key,
    title: formatSectionTitle(key),
    faqs: value,
  }));

  return (
    <motion.div
      className="container w-11/12 pb-12 pt-20 px-2 sm:px-3 m-auto"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header Section */}
      <motion.header className="text-center mb-16" variants={itemVariants}>
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
          <HelpCircle className="w-4 h-4" />
          <span className="text-sm font-medium">FAQ</span>
        </div>

        <h1 className="text-4xl font-bold text-primary sm:text-5xl mb-4">
          Frequently Asked Questions
        </h1>

        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Find answers to common questions about ToolsTrek and our free online
          tools
        </p>
      </motion.header>

      {/* FAQ Sections */}
      <motion.div className="space-y-12" variants={containerVariants}>
        {faqSections.map((section) => (
          <motion.section key={section.id} variants={itemVariants}>
            <h2 className="text-2xl font-semibold border-b-2 border-primary/20 pb-3 mb-6 text-foreground">
              {section.title}
            </h2>
            <div className="space-y-3">
              {section.faqs.map((faq, index) => (
                <Accordion
                  key={index}
                  type="single"
                  collapsible
                  className="w-full"
                >
                  <AccordionItem
                    value={`item-${section.id}-${index}`}
                    className="border rounded-lg px-2 hover:border-primary/30 transition-all duration-200 bg-white dark:bg-neutral-900 "
                  >
                    <AccordionTrigger className="text-base font-medium hover:text-primary transition-colors py-4 cursor-pointer">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed pb-4 text-base">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              ))}
            </div>
          </motion.section>
        ))}
      </motion.div>

      {/* CTA Section */}
      <motion.div
        className="mt-16 text-center bg-muted/30 rounded-lg p-8 border border-border"
        variants={itemVariants}
      >
        <h2 className="text-2xl font-semibold mb-2 text-foreground">
          Still have questions?
        </h2>
        <p className="text-muted-foreground mb-6">
          If you can't find the answer you're looking for, feel free to contact
          us directly.
        </p>
        <Button asChild size="lg">
          <Link href="/contact-us" className="inline-flex items-center gap-2">
            Contact Us
            <MessageCircle className="w-4 h-4" />
          </Link>
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default FAQCon;
