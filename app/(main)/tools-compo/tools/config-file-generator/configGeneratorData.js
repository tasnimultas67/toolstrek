/* -------------------------------------------------------------------------- */
/*  Config File Generator — .gitignore, robots.txt, meta tags and .htaccess.  */
/* -------------------------------------------------------------------------- */

export const CONFIG_STORAGE_KEY = "toolstrek_config_generator_v1";

export const CONFIG_TABS = [
  { value: "gitignore", label: ".gitignore", file: ".gitignore", language: "gitignore" },
  { value: "robots", label: "robots.txt", file: "robots.txt", language: "text" },
  { value: "meta", label: "Meta tags", file: "meta-tags.html", language: "html" },
  { value: "htaccess", label: ".htaccess", file: ".htaccess", language: "apache" },
];

export const GITIGNORE_GROUPS = [
  {
    id: "os",
    label: "Operating systems",
    description: "Thumbnail caches and system files that should never be committed.",
    options: [
      {
        id: "os-macos",
        label: "macOS",
        lines: [".DS_Store", ".AppleDouble", ".LSOverride", "Icon?", "._*", ".Spotlight-V100", ".Trashes"],
      },
      {
        id: "os-windows",
        label: "Windows",
        lines: ["Thumbs.db", "Thumbs.db:encryptable", "ehthumbs.db", "Desktop.ini", "$RECYCLE.BIN/", "*.lnk"],
      },
      {
        id: "os-linux",
        label: "Linux",
        lines: ["*~", ".fuse_hidden*", ".directory", ".Trash-*", ".nfs*"],
      },
    ],
  },
  {
    id: "editors",
    label: "Editors & IDEs",
    description: "Per-editor settings and workspace caches.",
    options: [
      {
        id: "editor-vscode",
        label: "VS Code",
        lines: [".vscode/*", "!.vscode/extensions.json", "!.vscode/settings.json", "!.vscode/tasks.json", "!.vscode/launch.json"],
      },
      {
        id: "editor-jetbrains",
        label: "JetBrains",
        lines: [".idea/", "*.iml", "*.iws", "*.ipr", "out/"],
      },
      {
        id: "editor-vim",
        label: "Vim / Neovim",
        lines: ["*.swp", "*.swo", "*.swn", ".nvim.lua"],
      },
      {
        id: "editor-sublime",
        label: "Sublime Text",
        lines: ["*.sublime-workspace", "*.sublime-project"],
      },
    ],
  },
  {
    id: "node",
    label: "Node.js",
    description: "Dependencies, logs, coverage and build output.",
    options: [
      {
        id: "node-deps",
        label: "Dependencies",
        lines: ["node_modules/", "jspm_packages/", "web_modules/", ".pnp.*", ".yarn/*", "!.yarn/patches", "!.yarn/plugins", "!.yarn/releases", "!.yarn/versions"],
      },
      {
        id: "node-logs",
        label: "Logs",
        lines: ["logs", "*.log", "npm-debug.log*", "yarn-debug.log*", "yarn-error.log*", "pnpm-debug.log*", "lerna-debug.log*"],
      },
      {
        id: "node-cache",
        label: "Caches & coverage",
        lines: [".npm", ".eslintcache", ".cache", ".parcel-cache", ".turbo", "coverage/", "*.tsbuildinfo", "next-env.d.ts"],
      },
      {
        id: "node-env",
        label: "Environment files",
        lines: [".env", ".env.local", ".env.*.local", ".env.development.local", ".env.test.local", ".env.production.local"],
      },
    ],
  },
  {
    id: "next",
    label: "Next.js & React",
    description: "Framework build folders and deployment metadata.",
    options: [
      {
        id: "next-build",
        label: "Next.js",
        lines: ["/.next/", "/out/", "/build", ".vercel", ".next/types/**/*.ts"],
      },
      {
        id: "react-build",
        label: "React / Vite / CRA",
        lines: ["dist/", "dist-ssr/", "*.local", ".vite/", "build/"],
      },
    ],
  },
  {
    id: "python",
    label: "Python",
    description: "Virtual environments, bytecode, test and framework artefacts.",
    options: [
      {
        id: "python-core",
        label: "Core",
        lines: ["__pycache__/", "*.py[cod]", "*$py.class", "*.so", ".Python", "build/", "develop-eggs/", "dist/", "downloads/", "eggs/", ".eggs/", "lib/", "lib64/", "parts/", "sdist/", "var/", "wheels/", "*.egg-info/", ".installed.cfg", "*.egg"],
      },
      {
        id: "python-venv",
        label: "Virtual environments",
        lines: [".venv/", "venv/", "ENV/", "env/", ".env/", ".venv.bak/"],
      },
      {
        id: "python-tools",
        label: "Testing & Django",
        lines: [".pytest_cache/", ".coverage", "htmlcov/", ".tox/", ".nox/", ".hypothesis/", "*.sqlite3", "db.sqlite3", "media/", "staticfiles/"],
      },
    ],
  },
  {
    id: "php",
    label: "PHP & Laravel",
    description: "Composer, framework storage and local configuration.",
    options: [
      {
        id: "php-composer",
        label: "PHP / Composer",
        lines: ["vendor/", "composer.phar", "phpunit.xml", ".phpunit.result.cache", "*.cache"],
      },
      {
        id: "php-laravel",
        label: "Laravel",
        lines: ["/storage/*.key", "/storage/logs/*", "/bootstrap/cache/*", "!/bootstrap/cache/.gitignore", "/public/storage", "/public/hot", ".env.backup"],
      },
      {
        id: "php-wordpress",
        label: "WordPress",
        lines: ["wp-config.php", "wp-content/uploads/", "wp-content/upgrade/", "*.sql", "*.tar.gz"],
      },
    ],
  },
  {
    id: "jvm",
    label: "Java, Kotlin & .NET",
    description: "Compiled output for JVM and Microsoft stacks.",
    options: [
      {
        id: "java",
        label: "Java / Gradle / Maven",
        lines: ["*.class", "*.jar", "*.war", "*.ear", "target/", ".gradle/", "build/", "!gradle/wrapper/gradle-wrapper.jar", ".mvn/timing.properties"],
      },
      {
        id: "dotnet",
        label: ".NET",
        lines: ["bin/", "obj/", "*.user", "*.suo", "*.userosscache", "*.sln.docstates", "packages/", "*.nupkg"],
      },
    ],
  },
  {
    id: "systems",
    label: "Go & Rust",
    description: "Compiled binaries and build caches.",
    options: [
      {
        id: "go",
        label: "Go",
        lines: ["*.exe", "*.exe~", "*.dll", "*.so", "*.dylib", "*.test", "*.out", "vendor/", "go.work.sum"],
      },
      {
        id: "rust",
        label: "Rust",
        lines: ["target/", "**/*.rs.bk", "*.pdb", "Cargo.lock"],
      },
    ],
  },
  {
    id: "secrets",
    label: "Secrets & credentials",
    description: "Keys, certificates and local overrides that must stay private.",
    options: [
      {
        id: "secrets-env",
        label: "Secret files",
        lines: ["*.pem", "*.key", "*.p12", "*.pfx", "*.jks", "*.keystore", "secrets.json", ".npmrc", ".pypirc", ".netrc"],
      },
      {
        id: "secrets-local",
        label: "Local overrides",
        lines: ["*.local", "config.local.*", "settings.local.*", "*.bak", "*.orig", "*.rej"],
      },
    ],
  },
  {
    id: "infra",
    label: "Docker & infrastructure",
    description: "Local volumes, Terraform state and deployment caches.",
    options: [
      {
        id: "docker",
        label: "Docker",
        lines: ["docker-compose.override.yml", ".docker/", "*.pid", "*.seed"],
      },
      {
        id: "terraform",
        label: "Terraform",
        lines: ["**/.terraform/*", "*.tfstate", "*.tfstate.*", "crash.log", "crash.*.log", "*.tfvars", "*.tfvars.json", "override.tf", "override.tf.json", ".terraformrc", "terraform.rc"],
      },
    ],
  },
  {
    id: "media",
    label: "Design & media",
    description: "Large source files and thumbnails.",
    options: [
      {
        id: "media-design",
        label: "Design sources",
        lines: ["*.psb", "*.ai", "*.indd", "*.sketch", "*.fig", "*.xd", "*.afdesign", "*.afphoto"],
      },
      {
        id: "media-exports",
        label: "Temporary exports",
        lines: ["*.mp4", "*.mov", "*.wav", "*.zip", "exports/", "renders/"],
      },
    ],
  },
];

export const ROBOTS_PRESETS = [
  { value: "allow", label: "Allow everything" },
  { value: "custom", label: "Custom rules" },
  { value: "block", label: "Block everything" },
];

export const META_GROUPS = [
  { value: "basic", label: "Basic SEO" },
  { value: "openGraph", label: "Open Graph" },
  { value: "twitter", label: "Twitter / X" },
  { value: "icons", label: "Icons & theme" },
  { value: "custom", label: "Custom tags" },
];

export const HTACCESS_OPTIONS = [
  {
    id: "https",
    label: "Force HTTPS",
    description: "Redirect every HTTP request to HTTPS with a 301.",
  },
  {
    id: "securityHeaders",
    label: "Security headers",
    description: "X-Content-Type-Options, X-Frame-Options, Referrer-Policy and Permissions-Policy.",
  },
  {
    id: "hsts",
    label: "HSTS",
    description: "Tell browsers to always use HTTPS for this domain. Only enable once HTTPS is stable.",
  },
  {
    id: "compression",
    label: "Gzip / Brotli compression",
    description: "Compress text-based assets before they leave the server.",
  },
  {
    id: "caching",
    label: "Browser caching",
    description: "Long cache lifetimes for images, fonts, CSS and JavaScript.",
  },
  {
    id: "blockSensitive",
    label: "Block sensitive files",
    description: "Deny access to .env, .git, composer files, backups and config files.",
  },
  {
    id: "noDirectoryListing",
    label: "Disable directory listing",
    description: "Stop Apache from showing an index when no file is requested.",
  },
  {
    id: "errorPages",
    label: "Custom error pages",
    description: "Point 404 and 500 errors at your own pages.",
  },
  {
    id: "hotlink",
    label: "Hotlink protection",
    description: "Only allow your own domain to embed images and media.",
  },
  {
    id: "maintenance",
    label: "Maintenance mode",
    description: "Return a 503 to everyone except your IP address.",
  },
];

export const CONFIG_FAQS = [
  {
    question: "What should a .gitignore file contain?",
    answer:
      "Everything generated, downloaded or private: dependency folders, build output, logs, caches, environment files, editor settings and operating-system clutter. Commit the .gitignore itself, and add language- or framework-specific rules on top of the operating-system basics.",
  },
  {
    question: "Does .gitignore remove files that are already committed?",
    answer:
      "No. Adding a path to .gitignore only stops untracked files from being added. To stop tracking a file that is already in the repository, run git rm --cached <file> and commit the removal. Rotate any secret that was committed, even after deleting it.",
  },
  {
    question: "What is the difference between Allow and Disallow in robots.txt?",
    answer:
      "Disallow tells a crawler not to fetch a path; Allow re-permits a more specific path inside a blocked directory. The longest matching rule wins. robots.txt is a request, not security — never use it to hide private data, and use authentication or noindex for that.",
  },
  {
    question: "Where does robots.txt go?",
    answer:
      "It must be served from the root of the domain, for example https://example.com/robots.txt. A file in a subdirectory is ignored. Reference your sitemap with an absolute URL, and remember that each subdomain needs its own robots.txt.",
  },
  {
    question: "Which meta tags still matter for SEO?",
    answer:
      "A unique title, a useful description, a canonical URL, a sensible robots directive and social sharing tags cover most needs. Keywords and author tags carry little weight. Keep titles under about 60 characters and descriptions under about 160 so they are not truncated.",
  },
  {
    question: "Do I need both Open Graph and Twitter tags?",
    answer:
      "Open Graph is used by Facebook, LinkedIn, Slack, WhatsApp and many others. X/Twitter falls back to Open Graph but its own card tags give you control over the card type and attribution. Adding both is cheap and avoids surprises.",
  },
  {
    question: "Does .htaccess work on every host?",
    answer:
      ".htaccess is an Apache feature and also works on LiteSpeed. Nginx does not read it — equivalent rules belong in the server block. Some managed hosts disable .htaccess overrides, so test after deploying and keep a backup.",
  },
  {
    question: "Is my configuration uploaded anywhere?",
    answer:
      "No. Every file is generated in your browser from the options you choose. Presets are stored in local storage, and the ZIP is assembled on your device with JSZip.",
  },
];

export function createEmptyConfigState() {
  return {
    tab: "gitignore",
    gitignore: {
      selected: [],
      header: "",
      custom: "",
    },
    robots: {
      preset: "custom",
      userAgent: "*",
      allow: "/",
      disallow: "",
      crawlDelay: "",
      sitemap: "",
      host: "",
      custom: "",
    },
    meta: {
      title: "",
      description: "",
      keywords: "",
      author: "",
      canonical: "",
      robots: "index, follow",
      themeColor: "#0f172a",
      ogType: "website",
      ogTitle: "",
      ogDescription: "",
      ogImage: "",
      ogSiteName: "",
      ogLocale: "",
      twitterCard: "summary_large_image",
      twitterSite: "",
      twitterCreator: "",
      favicon: "",
      appleIcon: "",
      manifest: "",
      custom: "",
      groups: { basic: true, openGraph: true, twitter: true, icons: true, custom: true },
    },
    htaccess: {
      canonical: "none",
      https: false,
      securityHeaders: true,
      hsts: false,
      compression: true,
      caching: true,
      blockSensitive: true,
      noDirectoryListing: true,
      errorPages: false,
      hotlink: false,
      maintenance: false,
      maintenanceIp: "",
      error404: "/404.html",
      error500: "/500.html",
      custom: "",
    },
    presets: [],
  };
}

export function createDemoConfigState() {
  const empty = createEmptyConfigState();
  return {
    ...empty,
    tab: "gitignore",
    gitignore: {
      selected: ["os-macos", "os-windows", "editor-vscode", "node-deps", "node-logs", "node-env", "next-build", "secrets-env"],
      header: "ToolsTrek — generated .gitignore",
      custom: "# Local uploads\n/uploads/\n# Generated reports\n/reports/*.pdf",
    },
    robots: {
      preset: "custom",
      userAgent: "*",
      allow: "/",
      disallow: "/admin/\n/api/\n/checkout/\n/preview/",
      crawlDelay: "5",
      sitemap: "https://toolstrek.vercel.app/sitemap.xml",
      host: "",
      custom: "# AI crawlers\nUser-agent: GPTBot\nDisallow: /",
    },
    meta: {
      ...empty.meta,
      title: "ToolsTrek — 148 free browser tools",
      description:
        "A private, fast collection of calculators, converters, PDF tools and design utilities that run in your browser.",
      keywords: "online tools, free calculators, pdf tools, developer tools",
      author: "ToolsTrek",
      canonical: "https://toolstrek.vercel.app/",
      robots: "index, follow, max-image-preview:large",
      themeColor: "#0f172a",
      ogType: "website",
      ogTitle: "ToolsTrek — 148 free browser tools",
      ogDescription: "Calculators, converters and design tools that never upload your files.",
      ogImage: "https://toolstrek.vercel.app/brand/toolstrek-social-card.png",
      ogSiteName: "ToolsTrek",
      ogLocale: "en_US",
      twitterCard: "summary_large_image",
      twitterSite: "@toolstrek",
      twitterCreator: "@toolstrek",
      favicon: "/favicon.ico",
      appleIcon: "/apple-touch-icon.png",
      manifest: "/site.webmanifest",
      custom: "application-name=ToolsTrek\nformat-detection=telephone=no",
    },
    htaccess: {
      ...empty.htaccess,
      canonical: "www",
      https: true,
      securityHeaders: true,
      hsts: false,
      compression: true,
      caching: true,
      blockSensitive: true,
      noDirectoryListing: true,
      errorPages: true,
      error404: "/404.html",
      error500: "/500.html",
      hotlink: true,
      maintenance: false,
      maintenanceIp: "203.0.113.10",
      custom: "# Block bad bots\nRewriteCond %{HTTP_USER_AGENT} (semrush|ahrefs|mj12bot) [NC]\nRewriteRule .* - [F,L]",
    },
  };
}

/* --------------------------------- Builders -------------------------------- */

const newline = "\n";

function section(title, body) {
  return `# ${title}${newline}${body}`;
}

export function buildGitignore(state) {
  const lines = [];
  if (state.header.trim()) {
    state.header
      .split(/\r?\n/)
      .forEach((line) => lines.push(line.startsWith("#") ? line : `# ${line}`));
    lines.push("");
  }
  GITIGNORE_GROUPS.forEach((group) => {
    const chosen = group.options.filter((option) => state.selected.includes(option.id));
    if (!chosen.length) return;
    lines.push(`# ${group.label}`);
    chosen.forEach((option) => {
      lines.push(`# ${option.label}`);
      option.lines.forEach((line) => lines.push(line));
    });
    lines.push("");
  });
  if (state.custom.trim()) {
    lines.push("# Custom rules");
    state.custom
      .split(/\r?\n/)
      .filter((line) => line.trim())
      .forEach((line) => lines.push(line));
  }
  if (!lines.length) return "";
  return `${lines.join(newline).trim()}${newline}`;
}

export function buildRobots(state) {
  const lines = [];
  if (state.preset === "allow") {
    lines.push("User-agent: *", "Allow: /");
  } else if (state.preset === "block") {
    lines.push("User-agent: *", "Disallow: /");
  } else {
    lines.push(`User-agent: ${state.userAgent.trim() || "*"}`);
    const allow = state.allow
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    const disallow = state.disallow
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    allow.forEach((path) => lines.push(`Allow: ${path}`));
    disallow.forEach((path) => lines.push(`Disallow: ${path}`));
    if (!allow.length && !disallow.length) lines.push("Disallow:");
    if (state.crawlDelay.trim()) lines.push(`Crawl-delay: ${state.crawlDelay.trim()}`);
  }
  if (state.sitemap.trim()) {
    lines.push("", `Sitemap: ${state.sitemap.trim()}`);
  }
  if (state.host.trim()) {
    lines.push(`Host: ${state.host.trim()}`);
  }
  if (state.custom.trim()) {
    lines.push("", state.custom.trim());
  }
  return `${lines.join(newline).trim()}${newline}`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function metaTag(key, value, attribute = "name") {
  if (!value.trim()) return null;
  return `<meta ${attribute}="${escapeHtml(key)}" content="${escapeHtml(value)}" />`;
}

export function buildMetaTags(state) {
  const lines = [];
  if (state.groups.basic) {
    lines.push('<meta charset="UTF-8" />');
    lines.push('<meta name="viewport" content="width=device-width, initial-scale=1" />');
    if (state.title.trim()) lines.push(`<title>${escapeHtml(state.title.trim())}</title>`);
    const basic = [
      metaTag("description", state.description),
      metaTag("keywords", state.keywords),
      metaTag("author", state.author),
      metaTag("robots", state.robots),
    ].filter(Boolean);
    lines.push(...basic);
    if (state.canonical.trim()) lines.push(`<link rel="canonical" href="${escapeHtml(state.canonical.trim())}" />`);
    lines.push("");
  }

  if (state.groups.openGraph) {
    const og = [
      metaTag("og:type", state.ogType, "property"),
      metaTag("og:title", state.ogTitle || state.title, "property"),
      metaTag("og:description", state.ogDescription || state.description, "property"),
      metaTag("og:url", state.canonical, "property"),
      metaTag("og:image", state.ogImage, "property"),
      metaTag("og:site_name", state.ogSiteName, "property"),
      metaTag("og:locale", state.ogLocale, "property"),
    ].filter(Boolean);
    if (og.length) {
      lines.push("<!-- Open Graph -->");
      lines.push(...og);
      lines.push("");
    }
  }

  if (state.groups.twitter) {
    const twitter = [
      metaTag("twitter:card", state.twitterCard),
      metaTag("twitter:title", state.ogTitle || state.title),
      metaTag("twitter:description", state.ogDescription || state.description),
      metaTag("twitter:image", state.ogImage),
      metaTag("twitter:site", state.twitterSite),
      metaTag("twitter:creator", state.twitterCreator),
    ].filter(Boolean);
    if (twitter.length) {
      lines.push("<!-- Twitter / X -->");
      lines.push(...twitter);
      lines.push("");
    }
  }

  if (state.groups.icons) {
    const icons = [];
    if (state.favicon.trim()) icons.push(`<link rel="icon" href="${escapeHtml(state.favicon.trim())}" />`);
    if (state.appleIcon.trim()) icons.push(`<link rel="apple-touch-icon" href="${escapeHtml(state.appleIcon.trim())}" />`);
    if (state.manifest.trim()) icons.push(`<link rel="manifest" href="${escapeHtml(state.manifest.trim())}" />`);
    if (state.themeColor.trim()) icons.push(metaTag("theme-color", state.themeColor));
    if (icons.length) {
      lines.push("<!-- Icons & theme -->");
      lines.push(...icons);
      lines.push("");
    }
  }

  if (state.groups.custom && state.custom.trim()) {
    lines.push("<!-- Custom meta -->");
    state.custom
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && line.includes("="))
      .forEach((line) => {
        const index = line.indexOf("=");
        const key = line.slice(0, index).trim();
        const value = line.slice(index + 1).trim();
        if (!key) return;
        if (key.startsWith("http-equiv:")) {
          lines.push(metaTag(key.replace("http-equiv:", "").trim(), value, "http-equiv"));
        } else if (key.startsWith("property:")) {
          lines.push(metaTag(key.replace("property:", "").trim(), value, "property"));
        } else {
          lines.push(metaTag(key, value));
        }
      });
    lines.push("");
  }

  return `${lines.join(newline).replace(/\n{3,}/g, "\n\n").trim()}${newline}`;
}

export function buildHtaccess(state) {
  const lines = ["# Generated with ToolsTrek", "Options -Indexes", ""];

  if (state.canonical === "www" || state.canonical === "non-www") {
    lines.push("# Canonical hostname");
    lines.push("<IfModule mod_rewrite.c>");
    lines.push("  RewriteEngine On");
    if (state.canonical === "www") {
      lines.push("  RewriteCond %{HTTP_HOST} !^www\\. [NC]");
      lines.push("  RewriteRule ^(.*)$ https://www.%{HTTP_HOST}/$1 [R=301,L]");
    } else {
      lines.push("  RewriteCond %{HTTP_HOST} ^www\\.(.+)$ [NC]");
      lines.push("  RewriteRule ^(.*)$ https://%1/$1 [R=301,L]");
    }
    lines.push("</IfModule>", "");
  }

  if (state.https) {
    lines.push("# Force HTTPS");
    lines.push("<IfModule mod_rewrite.c>");
    lines.push("  RewriteEngine On");
    lines.push("  RewriteCond %{HTTPS} !=on");
    lines.push("  RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [R=301,L]");
    lines.push("</IfModule>", "");
  }

  if (state.securityHeaders) {
    lines.push("# Security headers");
    lines.push("<IfModule mod_headers.c>");
    lines.push('  Header always set X-Content-Type-Options "nosniff"');
    lines.push('  Header always set X-Frame-Options "SAMEORIGIN"');
    lines.push('  Header always set Referrer-Policy "strict-origin-when-cross-origin"');
    lines.push('  Header always set Permissions-Policy "camera=(), microphone=(), geolocation=()"');
    if (state.hsts) {
      lines.push('  Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"');
    }
    lines.push("</IfModule>", "");
  }

  if (state.compression) {
    lines.push("# Compression");
    lines.push("<IfModule mod_deflate.c>");
    lines.push("  AddOutputFilterByType DEFLATE text/html text/plain text/css text/xml");
    lines.push("  AddOutputFilterByType DEFLATE application/javascript application/json application/xml");
    lines.push("  AddOutputFilterByType DEFLATE image/svg+xml font/woff2");
    lines.push("</IfModule>", "");
  }

  if (state.caching) {
    lines.push("# Browser caching");
    lines.push("<IfModule mod_expires.c>");
    lines.push("  ExpiresActive On");
    lines.push('  ExpiresByType image/jpeg "access plus 1 year"');
    lines.push('  ExpiresByType image/png "access plus 1 year"');
    lines.push('  ExpiresByType image/webp "access plus 1 year"');
    lines.push('  ExpiresByType image/svg+xml "access plus 1 year"');
    lines.push('  ExpiresByType font/woff2 "access plus 1 year"');
    lines.push('  ExpiresByType text/css "access plus 1 month"');
    lines.push('  ExpiresByType application/javascript "access plus 1 month"');
    lines.push('  ExpiresByType text/html "access plus 0 seconds"');
    lines.push("</IfModule>", "");
  }

  if (state.blockSensitive) {
    lines.push("# Block sensitive files");
    lines.push("<FilesMatch \"(^\\.|~$|\\.(env|log|sql|bak|ini|conf|config|dist)$)\">");
    lines.push("  Require all denied");
    lines.push("</FilesMatch>");
    lines.push("<FilesMatch \"^(composer\\.(json|lock)|package(-lock)?\\.json|yarn\\.lock|pnpm-lock\\.yaml)$\">");
    lines.push("  Require all denied");
    lines.push("</FilesMatch>");
    lines.push("RedirectMatch 404 /\\.git(/|$)");
    lines.push("RedirectMatch 404 /\\.env(/|$)");
    lines.push("");
  }

  if (state.noDirectoryListing) {
    lines.push("# Directory listing");
    lines.push("Options -Indexes", "");
  }

  if (state.errorPages) {
    lines.push("# Error pages");
    lines.push(`ErrorDocument 404 ${state.error404 || "/404.html"}`);
    lines.push(`ErrorDocument 500 ${state.error500 || "/500.html"}`, "");
  }

  if (state.hotlink) {
    lines.push("# Hotlink protection");
    lines.push("<IfModule mod_rewrite.c>");
    lines.push("  RewriteEngine On");
    lines.push("  RewriteCond %{HTTP_REFERER} !^$");
    lines.push("  RewriteCond %{HTTP_REFERER} !^https?://(www\\.)?yourdomain\\.com [NC]");
    lines.push("  RewriteRule \\.(jpe?g|png|gif|webp|svg|mp4)$ - [F,NC,L]");
    lines.push("</IfModule>", "");
  }

  if (state.maintenance) {
    lines.push("# Maintenance mode");
    lines.push("<IfModule mod_rewrite.c>");
    lines.push("  RewriteEngine On");
    if (state.maintenanceIp.trim()) {
      lines.push(`  RewriteCond %{REMOTE_ADDR} !^${state.maintenanceIp.trim().replace(/\./g, "\\.")}$`);
    }
    lines.push("  RewriteCond %{REQUEST_URI} !^/maintenance\\.html$");
    lines.push("  RewriteRule ^(.*)$ /maintenance.html [R=503,L]");
    lines.push("</IfModule>");
    lines.push("ErrorDocument 503 /maintenance.html", "");
  }

  if (state.custom.trim()) {
    lines.push("# Custom rules");
    lines.push(state.custom.trim(), "");
  }

  return `${lines.join(newline).replace(/\n{3,}/g, "\n\n").trim()}${newline}`;
}

export function buildAllFiles(state) {
  return {
    ".gitignore": buildGitignore(state.gitignore),
    "robots.txt": buildRobots(state.robots),
    "meta-tags.html": buildMetaTags(state.meta),
    ".htaccess": buildHtaccess(state.htaccess),
  };
}

export function buildOutput(tab, state) {
  if (tab === "gitignore") return buildGitignore(state.gitignore);
  if (tab === "robots") return buildRobots(state.robots);
  if (tab === "meta") return buildMetaTags(state.meta);
  return buildHtaccess(state.htaccess);
}

export function countLines(text) {
  if (!text || !text.trim()) return 0;
  return text.trim().split(/\r?\n/).length;
}
