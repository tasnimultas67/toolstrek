import "./globals.css";
import ThemeProvider from "./theme-context.jsx";
import Script from 'next/script';
import { Analytics } from "@vercel/analytics/next";

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var t = localStorage.getItem('theme');
                  if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.dataset.theme = 'dark';
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.dataset.theme = 'light';
                  }
                } catch (e) {}

                try {
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
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}

