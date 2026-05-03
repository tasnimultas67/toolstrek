import React from "react";
import * as motion from "motion/react-client";

export const metadata = {
  title: "Privacy Policy — ToolsTrek",
  keywords: ["privacy policy", "privacy", "tools", "security"],
  description:
    "Welcome to ToolsTrek! Your privacy is our priority. This policy outlines how we collect, use, and protect your personal information when you visit our website",
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
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut",
    },
  },
};

const PrivacyPolicy = () => {
  return (
    <div className="bg-gray-50">
      <motion.div
        className="max-w-4xl mx-auto px-2 pb-12 pt-26 "
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div
          className="bg-white rounded-lg p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1
            className="text-3xl font-bold mb-6 text-gray-900"
            variants={itemVariants}
          >
            Privacy Policy
          </motion.h1>

          <motion.p className="text-gray-700 mb-4" variants={itemVariants}>
            **Effective Date:**{" "}
            {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </motion.p>

          {[
            {
              title: "1. Introduction",
              content: (
                <p className="text-gray-600 mb-4">
                  Welcome to <strong>ToolsTrek</strong>! Your privacy is our
                  priority. This policy outlines how we collect, use, and
                  protect your personal information when you visit our website (
                  <strong>https://toolstrek.vercel.app/</strong>).
                </p>
              ),
            },
            {
              title: "2. Information We Collect",
              content: (
                <ul className="list-disc list-inside text-gray-600 mb-4 space-y-1">
                  <li>
                    Personal Information (if applicable): Name, email, or
                    contact details.
                  </li>
                  <li>
                    Usage Data: IP address, browser type, and interaction
                    history.
                  </li>
                  <li>
                    Cookies & Tracking: To enhance performance and personalize
                    content.
                  </li>
                </ul>
              ),
            },
            {
              title: "3. How We Use Your Information",
              content: (
                <>
                  <p className="text-gray-600 mb-2">
                    We use collected data for:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 mb-4 space-y-1">
                    <li>
                      Improving website functionality and user experience.
                    </li>
                    <li>Ensuring security and fraud prevention.</li>
                    <li>Responding to user inquiries and feedback.</li>
                  </ul>
                </>
              ),
            },
            {
              title: "4. Data Protection & Security",
              content: (
                <p className="text-gray-600 mb-4">
                  We implement industry-standard security measures to protect
                  your data from unauthorized access, alteration, or disclosure.
                </p>
              ),
            },
            {
              title: "5. Third-Party Services",
              content: (
                <p className="text-gray-600 mb-4">
                  ToolsTrek may use third-party tools (e.g., Google Analytics,
                  payment gateways) that follow their own privacy practices.
                </p>
              ),
            },
            {
              title: "6. Your Privacy Choices",
              content: (
                <>
                  <p className="text-gray-600 mb-2">You have the right to:</p>
                  <ul className="list-disc list-inside text-gray-600 mb-4 space-y-1">
                    <li>Opt-out of cookies via browser settings.</li>
                    <li>Request data deletion (if applicable).</li>
                  </ul>
                </>
              ),
            },
            {
              title: "7. Contact Us",
              content: (
                <p className="text-gray-600 mb-4">
                  For privacy-related concerns, contact us at: 📧{" "}
                  <strong>contact.toolstrek@gmail.com</strong> 🌐{" "}
                  <a
                    href="/contact-us"
                    className="text-brandColor hover:underline"
                  >
                    Contact Page
                  </a>
                </p>
              ),
            },
          ].map((section, index) => (
            <motion.div
              key={index}
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
            >
              <h2 className="text-2xl font-semibold mt-8 text-gray-800">
                {section.title}
              </h2>
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                {section.content}
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default PrivacyPolicy;
