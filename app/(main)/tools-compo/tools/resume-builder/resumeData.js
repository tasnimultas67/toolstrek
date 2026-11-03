export const RESUME_STORAGE_KEY = "toolstrek_resume_builder_v1";

export const RESUME_TEMPLATES = [
  {
    value: "modern",
    label: "Modern",
    blurb: "Colour header · clean rules",
    description: "A confident accent header with crisp section rules. Great for product, tech and design roles.",
  },
  {
    value: "classic",
    label: "Classic",
    blurb: "Centred · timeless",
    description: "Centred contact details and serif-friendly spacing for finance, law and academic applications.",
  },
  {
    value: "minimal",
    label: "Minimal",
    blurb: "Quiet · ATS-first",
    description: "No decoration, generous whitespace and plain headings that parse cleanly in applicant tracking systems.",
  },
  {
    value: "executive",
    label: "Executive",
    blurb: "Dark band · senior roles",
    description: "A deep colour band and strong hierarchy for leadership, consulting and board-level profiles.",
  },
];

export const RESUME_ACCENTS = [
  { value: "#0f766e", label: "Teal" },
  { value: "#2563eb", label: "Blue" },
  { value: "#7c3aed", label: "Violet" },
  { value: "#be123c", label: "Rose" },
  { value: "#b45309", label: "Amber" },
  { value: "#334155", label: "Slate" },
  { value: "#166534", label: "Forest" },
  { value: "#9d174d", label: "Plum" },
];

export const RESUME_FONTS = [
  { value: "sans", label: "Sans", stack: "'Segoe UI', Inter, Arial, Helvetica, sans-serif" },
  { value: "serif", label: "Serif", stack: "Georgia, 'Times New Roman', Cambria, serif" },
  { value: "humanist", label: "Humanist", stack: "'Trebuchet MS', 'Segoe UI', Tahoma, sans-serif" },
];

export const SECTION_DEFS = [
  { key: "summary", label: "Professional summary", hint: "Two or three lines that frame your experience." },
  { key: "experience", label: "Experience", hint: "Roles, companies and measurable achievements." },
  { key: "education", label: "Education", hint: "Degrees, schools and graduation dates." },
  { key: "skills", label: "Skills", hint: "Group tools and strengths by category." },
  { key: "projects", label: "Projects", hint: "Selected work with links and outcomes." },
  { key: "certifications", label: "Certifications", hint: "Credentials, issuers and dates." },
  { key: "languages", label: "Languages", hint: "Spoken languages and proficiency." },
  { key: "awards", label: "Awards", hint: "Recognition, honours and competitions." },
  { key: "volunteer", label: "Volunteer work", hint: "Community and pro-bono experience." },
  { key: "interests", label: "Interests", hint: "A short, human line about what you enjoy." },
  { key: "references", label: "References", hint: "Contacts available on request or listed in full." },
  { key: "custom", label: "Custom sections", hint: "Publications, speaking, patents or anything else." },
];

export const DEFAULT_RESUME_SETTINGS = {
  template: "modern",
  accent: "#0f766e",
  font: "sans",
  fontScale: 1,
  spacing: 1,
  pageSize: "a4",
  margins: 48,
  showPhoto: true,
  photoShape: "circle",
  sectionOrder: SECTION_DEFS.map((section) => section.key),
  hiddenSections: [],
};

export const PAGE_SIZES = {
  a4: { label: "A4", width: 794, height: 1123, css: "A4" },
  letter: { label: "US Letter", width: 816, height: 1056, css: "Letter" },
};

export const makeResumeId = () => `item-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

export function createEmptyResume() {
  return {
    personal: {
      fullName: "",
      title: "",
      email: "",
      phone: "",
      location: "",
      website: "",
      linkedin: "",
      github: "",
      photo: "",
    },
    summary: "",
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    languages: [],
    awards: [],
    volunteer: [],
    interests: "",
    references: [],
    custom: [],
  };
}

export function createDemoResume() {
  return {
    personal: {
      fullName: "Avery Morgan",
      title: "Senior Product Designer",
      email: "avery.morgan@example.com",
      phone: "+1 (415) 555-0142",
      location: "San Francisco, CA",
      website: "averymorgan.design",
      linkedin: "linkedin.com/in/averymorgan",
      github: "github.com/averymorgan",
      photo: "",
    },
    summary:
      "Product designer with eight years of experience turning complex workflows into clear, accessible interfaces. Led design for a B2B analytics platform from early prototype to 40,000 monthly users, pairing research with pragmatic systems thinking.",
    experience: [
      {
        id: makeResumeId(),
        role: "Senior Product Designer",
        company: "Northstar Analytics",
        location: "San Francisco, CA",
        start: "2021",
        end: "Present",
        bullets:
          "Led a four-person design team through a full dashboard redesign that lifted weekly active use by 27%.\nBuilt a 60-component design system adopted by three product squads and cut design-to-dev handoff time by 35%.\nRan quarterly research programmes with 80+ customers to prioritise the roadmap and validate new reporting flows.",
      },
      {
        id: makeResumeId(),
        role: "Product Designer",
        company: "Kite Health",
        location: "Remote",
        start: "2018",
        end: "2021",
        bullets:
          "Designed patient onboarding and scheduling flows for a telehealth app serving 120,000 people.\nPartnered with engineering to ship WCAG 2.1 AA improvements across the core booking journey.\nIntroduced usability testing cadence that reduced critical post-release defects by 40%.",
      },
    ],
    education: [
      {
        id: makeResumeId(),
        degree: "BFA, Interaction Design",
        school: "California College of the Arts",
        location: "San Francisco, CA",
        start: "2012",
        end: "2016",
        details: "Graduated with honours. Thesis on accessible data visualisation.",
      },
    ],
    skills: [
      { id: makeResumeId(), category: "Design", items: "Product strategy, Interaction design, Design systems, Prototyping, Accessibility" },
      { id: makeResumeId(), category: "Research", items: "Usability testing, Interviews, Surveys, Journey mapping, Analytics" },
      { id: makeResumeId(), category: "Tools", items: "Figma, FigJam, Framer, Maze, Amplitude, Jira" },
    ],
    projects: [
      {
        id: makeResumeId(),
        name: "Atlas Design System",
        link: "atlas.example.com",
        description:
          "Open-source component library and documentation site used by four product teams. Reduced new-screen build time from days to hours.",
      },
      {
        id: makeResumeId(),
        name: "Contrast Checker",
        link: "github.com/averymorgan/contrast",
        description: "A small browser tool for testing interface colour pairs against WCAG thresholds. 12,000+ downloads.",
      },
    ],
    certifications: [
      { id: makeResumeId(), name: "IAAP Certified Professional in Accessibility Core Competencies", issuer: "IAAP", date: "2023" },
      { id: makeResumeId(), name: "Human-Centered Design", issuer: "IDEO U", date: "2020" },
    ],
    languages: [
      { id: makeResumeId(), name: "English", level: "Native" },
      { id: makeResumeId(), name: "Spanish", level: "Professional working proficiency" },
    ],
    awards: [
      { id: makeResumeId(), title: "Best Enterprise Product", issuer: "Design Awards", date: "2023" },
    ],
    volunteer: [
      {
        id: makeResumeId(),
        role: "Mentor",
        organization: "Design Access Collective",
        start: "2022",
        end: "Present",
        description: "Mentor early-career designers from underrepresented groups through portfolio reviews and mock interviews.",
      },
    ],
    interests: "Trail running, letterpress printing and cooking elaborate Sunday meals for friends.",
    references: [],
    custom: [],
  };
}

export const RESUME_FAQS = [
  {
    question: "How does the Resume Builder work?",
    answer:
      "Fill in the form on the left and watch the A4 or US Letter preview update instantly. Add, remove and reorder experience, education, skills and other sections, choose a template and accent colour, then print or save a vector PDF from your browser. Everything is stored in local storage and can be exported as a JSON project.",
  },
  {
    question: "Is my personal data uploaded anywhere?",
    answer:
      "No. Your name, contact details, photo and work history stay in this browser tab and in local storage on your device. The page makes no upload request and does not require an account. Export a JSON backup or print a PDF to keep a copy.",
  },
  {
    question: "Is the resume ATS-friendly?",
    answer:
      "The Minimal template is intentionally plain: one column, real text, no tables, icons or graphics in the body. All templates use selectable text rather than images, so applicant tracking systems can read names, roles, dates and bullet points. Always check the final PDF in the job board preview.",
  },
  {
    question: "Why is everything blank at the start?",
    answer:
      "No sample candidate is pre-filled for you. The editor opens empty; use the Load demo data button to explore a complete example, then clear it and replace every field with your own details.",
  },
  {
    question: "How do I save a PDF?",
    answer:
      "Press Print / Save PDF. The tool opens a clean print window with only the resume, sets the correct page size and removes the editor chrome. In the browser print dialog choose Save as PDF, keep margins at none and enable background graphics for accent colours.",
  },
  {
    question: "What is the job description match panel?",
    answer:
      "Paste a job advert into the match panel and the tool compares its keywords with the text already in your resume. It highlights terms you already cover and suggests important words that are missing, helping you tailor the document without inventing experience.",
  },
];

export function resumeHasContent(data) {
  if (!data) return false;
  const personal = data.personal || {};
  if (Object.values(personal).some((value) => typeof value === "string" && value.trim())) return true;
  if ((data.summary || "").trim()) return true;
  if ((data.interests || "").trim()) return true;
  return SECTION_DEFS.some((section) => {
    const value = data[section.key];
    if (Array.isArray(value)) return value.some((item) => Object.values(item || {}).some((entry) => typeof entry === "string" && entry.trim()));
    return typeof value === "string" && value.trim();
  });
}

export function resumePlainText(data) {
  const personal = data.personal || {};
  const parts = [
    personal.fullName,
    personal.title,
    personal.email,
    personal.phone,
    personal.location,
    personal.website,
    personal.linkedin,
    personal.github,
    data.summary,
    data.interests,
  ];
  SECTION_DEFS.forEach((section) => {
    const value = data[section.key];
    if (Array.isArray(value)) {
      value.forEach((item) => {
        Object.entries(item || {}).forEach(([key, entry]) => {
          if (key !== "id" && typeof entry === "string") parts.push(entry);
        });
      });
    } else if (typeof value === "string") {
      parts.push(value);
    }
  });
  return parts.filter(Boolean).join(" \n ");
}

export function completenessScore(data) {
  const personal = data.personal || {};
  let score = 0;
  if (personal.fullName?.trim()) score += 12;
  if (personal.title?.trim()) score += 8;
  if (personal.email?.trim()) score += 7;
  if (personal.phone?.trim()) score += 6;
  if (personal.location?.trim()) score += 4;
  if (data.summary?.trim() && data.summary.trim().length > 60) score += 14;
  if (data.experience?.length) score += 20;
  if (data.experience?.some((item) => item.bullets?.trim().length > 40)) score += 7;
  if (data.education?.length) score += 8;
  if (data.skills?.some((item) => item.items?.trim())) score += 8;
  if (data.projects?.length || data.certifications?.length) score += 6;
  return Math.min(100, score);
}

export function keywordMatch(resumeText, jobText) {
  const stopWords = new Set(
    "about above after again against all also and any are because been before being below between both but can could did does doing down during each few for from further had has have having here how into itself just more most other over own same should some such than that the their them then there these they this those through under until very was were what when where which while who whom why will with would you your our ours able across among around bring build built create drive ensure help including lead leading manage new plus role team teams work working years year experience skills ability strong excellent good great use using used within without well".split(
      " ",
    ),
  );
  const tokenize = (text) =>
    (text || "")
      .toLowerCase()
      .replace(/[^a-z0-9+#.\s-]/g, " ")
      .split(/\s+/)
      .map((token) => token.replace(/^[.-]+|[.-]+$/g, ""))
      .filter((token) => token.length > 2 && !stopWords.has(token));

  const resumeSet = new Set(tokenize(resumeText));
  const counts = new Map();
  tokenize(jobText).forEach((token) => counts.set(token, (counts.get(token) || 0) + 1));
  const ordered = [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([token]) => token);
  return {
    matched: ordered.filter((token) => resumeSet.has(token)),
    missing: ordered.filter((token) => !resumeSet.has(token)),
  };
}
