import React from "react";
import * as motion from "motion/react-client";

export const metadata = {
  title: "Privacy Policy — ToolsTrek",
  keywords: [
    "privacy policy",
    "GDPR compliant",
    "no upload",
    "client-side processing",
  ],
  description:
    "At ToolsTrek, your privacy is our top priority. Our tools are designed to protect your data by processing everything locally in your browser.",
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
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen text-gray-900 dark:text-white transition-colors duration-300">
      <motion.div
        className="max-w-5xl mx-auto px-4 pb-12 pt-20"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-4 md:p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div variants={itemVariants} className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Privacy Policy
            </h1>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Your privacy is our top priority. <strong>ToolsTrek</strong> is
              designed from the ground up to protect your data. All file
              processing happens locally in your browser.
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12"
          >
            {[
              {
                title: "No Server Uploads",
                desc: "Your files are never uploaded to any server. All processing happens locally in your browser.",
                icon: "M12 2v20m-5-5l5 5 5-5",
              },
              {
                title: "Local Processing",
                desc: "Operations are performed using JavaScript directly on your device.",
                icon: "M9 12l2 2 4-4",
              },
              {
                title: "Automatic Cleanup",
                desc: "All file data is cleared when you close the browser tab or navigate away.",
                icon: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
              },
              {
                title: "No Tracking",
                desc: "We don't track your file contents. Your documents remain private at all times.",
                icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/50"
              >
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
                  <span className="text-emerald-500">✓</span> {feature.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-snug">
                  {feature.desc}
                </p>
              </div>
            ))}
          </motion.div>

          {[
            {
              title: "1. Introduction",
              content: (
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  <strong>ToolsTrek</strong> ("we", "our", or "us") is committed
                  to protecting your privacy. This Privacy Policy explains how
                  we handle your information when you use our digital utilities.
                </p>
              ),
            },
            {
              title: "2. How Our Service Works",
              content: (
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mb-4 space-y-2">
                  <li>All processing happens directly in your web browser.</li>
                  <li>
                    Your files are never uploaded to our servers or any
                    third-party servers.
                  </li>
                  <li>We cannot see, access, or store your documents.</li>
                  <li>Your files remain on your device at all times.</li>
                </ul>
              ),
            },
            {
              title: "3. Information We Collect",
              content: (
                <>
                  <h3 className="font-bold text-gray-850 dark:text-gray-200 mt-4 mb-2">
                    3.1 Your Files
                  </h3>
                  <p className="text-gray-600 dark:text-gray-405 mb-4 font-semibold text-emerald-600 dark:text-emerald-400">
                    We do not collect your files.
                  </p>
                  <h3 className="font-bold text-gray-850 dark:text-gray-200 mt-4 mb-2">
                    3.2 Usage Data
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    We may collect anonymous usage statistics to improve our
                    service, such as which tools are most popular, browser type,
                    and device type. This data is aggregated and anonymized.
                  </p>
                </>
              ),
            },
            {
              title: "4. Cookies & Local Storage",
              content: (
                <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                  We use minimal cookies for essential functionality, such as
                  remembering your language preference or dark mode settings. We
                  do not use tracking or advertising cookies.
                </p>
              ),
            },
            {
              title: "5. Third-Party Services",
              content: (
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  ToolsTrek does not share your data with third parties. We do
                  not use third-party analytics that track individual users,
                  advertising networks, or social media tracking pixels.
                </p>
              ),
            },
            {
              title: "6. Your Rights",
              content: (
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Since we do not collect personal data, there is no personal
                  data to access, correct, or delete. You can clear your
                  browser's local storage at any time to remove any preferences
                  stored by ToolsTrek.
                </p>
              ),
            },
            {
              title: "7. Contact Us",
              content: (
                <div className="bg-gray-100 dark:bg-gray-950 rounded-xl p-6">
                  <p className="text-gray-700 dark:text-gray-300 mb-2 font-medium">
                    Questions about this Privacy Policy?
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    📧 <strong>contact.toolstrek@gmail.com</strong>
                  </p>
                  <a
                    href="/contact-us"
                    className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                  >
                    Contact Us Page →
                  </a>
                </div>
              ),
            },
          ].map((section, index) => (
            <motion.div
              key={index}
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              className="mb-10"
              viewport={{ once: true, margin: "-50px" }}
            >
              <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2">
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

          <motion.p
            className="text-gray-400 dark:text-gray-500 text-xs mt-12 border-t border-gray-100 dark:border-gray-800 pt-6"
            variants={itemVariants}
          >
            Last updated:{" "}
            {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
            })}
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default PrivacyPolicy;
