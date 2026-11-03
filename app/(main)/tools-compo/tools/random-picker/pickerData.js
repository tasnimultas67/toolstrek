export const PICKER_STORAGE_KEY = "toolstrek_random_picker_v1";

export const DEMO_ITEMS = [
  "Ava",
  "Ben",
  "Chloe",
  "Diego",
  "Emma",
  "Farhan",
  "Grace",
  "Hiro",
  "Isla",
  "Jonas",
  "Kira",
  "Liam",
];

export const DEFAULT_PICKER_SETTINGS = {
  mode: "single",
  pickCount: 3,
  teamsCount: 2,
  allowDuplicates: false,
  weighted: false,
  ignoreDuplicates: true,
  sortResults: false,
  sound: true,
  duration: 900,
  rangeMin: 1,
  rangeMax: 100,
  rangeCount: 1,
  rangeUnique: true,
};

export const PICKER_MODES = [
  { value: "single", label: "Pick one" },
  { value: "multiple", label: "Pick N" },
  { value: "shuffle", label: "Shuffle" },
  { value: "teams", label: "Teams" },
  { value: "numbers", label: "Numbers" },
];

export function parsePoolLines(text) {
  return String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [rawLabel, rawWeight] = line.split("|");
      const label = String(rawLabel || "").trim();
      const weight = Number(String(rawWeight || "").trim());
      return {
        label,
        weight: Number.isFinite(weight) && weight > 0 ? weight : 1,
      };
    })
    .filter((entry) => entry.label);
}

export function buildPool(entries, ignoreDuplicates = true) {
  const seen = new Set();
  return entries
    .filter((entry) => String(entry.label).trim())
    .filter((entry) => {
      if (!ignoreDuplicates) return true;
      const key = String(entry.label).trim().toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((entry) => ({
      ...entry,
      label: String(entry.label).trim(),
      weight: Math.max(0.01, Number(entry.weight) || 1),
    }));
}

export function makeTeams(items, count) {
  const safeCount = Math.max(1, Math.min(Number(count) || 1, items.length || 1));
  const groups = Array.from({ length: safeCount }, (_, index) => ({
    id: `team-${index + 1}`,
    name: `Team ${index + 1}`,
    items: [],
  }));
  items.forEach((item, index) => {
    const round = Math.floor(index / safeCount);
    const position = index % safeCount;
    const target = round % 2 === 0 ? position : safeCount - 1 - position;
    groups[target].items.push(item);
  });
  return groups;
}

export const PICKER_FAQS = [
  {
    question: "How is the Random Picker different from the Wheel Spinner?",
    answer:
      "Both use the same cryptographically secure random engine, but they are built for different jobs. The wheel is a visual, weighted raffle with a spinning animation and a single winner. Random Picker works with larger lists and adds pick-N sampling, full shuffles, balanced team generation, weighted draws and number ranges.",
  },
  {
    question: "Why is the item list empty at the start?",
    answer:
      "ToolsTrek never inserts sample names into your workspace. Add items individually, paste a bulk list, or press Load demo data to explore the tool. An empty list stays empty until you add something, and nothing is sent to a server.",
  },
  {
    question: "What does weighted mode change?",
    answer:
      "In weighted mode each item's chance is proportional to its weight. An item with weight 3 is three times as likely as an item with weight 1. In normal mode every item has an equal chance. Teams and shuffle always treat items equally.",
  },
  {
    question: "How are teams balanced?",
    answer:
      "The pool is securely shuffled, then distributed in a snake draft: Team 1, Team 2, Team 3, then Team 3, Team 2, Team 1. That keeps team sizes within one member of each other and avoids stacking the strongest picks into one team.",
  },
  {
    question: "Can I pick multiple winners without repeats?",
    answer:
      "Yes. Pick N samples without replacement by default, so the same item cannot win twice. Enable Allow repeats if you need independent draws, for example rolling the same name twice in a row. If you request more winners than items, the tool tells you before drawing.",
  },
  {
    question: "Where are my items and results stored?",
    answer:
      "Items, settings and result history are stored in this browser's localStorage only. You can export or import the pool as JSON, download results and history as CSV, and clear everything at any time.",
  },
];
