// app/layout.js
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const targetAttrs = ['bis_skin_checked'];
                const clean = (node) => {
                  if (node.nodeType !== 1) return;
                  for (const attr of targetAttrs) {
                    if (node.hasAttribute(attr)) {
                      node.removeAttribute(attr);
                    }
                  }
                  node.querySelectorAll('*').forEach(el => {
                    for (const attr of targetAttrs) {
                      if (el.hasAttribute(attr)) {
                        el.removeAttribute(attr);
                      }
                    }
                  });
                };
                const observer = new MutationObserver((mutations) => {
                  for (const mutation of mutations) {
                    if (mutation.type === 'attributes' && mutation.target.nodeType === 1) {
                      for (const attr of targetAttrs) {
                        if (mutation.target.hasAttribute(attr)) {
                          mutation.target.removeAttribute(attr);
                        }
                      }
                    } else if (mutation.type === 'childList') {
                      mutation.addedNodes.forEach(clean);
                    }
                  }
                });
                observer.observe(document.documentElement, {
                  attributes: true,
                  childList: true,
                  subtree: true,
                  attributeFilter: targetAttrs
                });
              })();
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
