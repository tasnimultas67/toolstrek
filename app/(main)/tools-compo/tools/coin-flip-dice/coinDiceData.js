export const COIN_STORAGE_KEY = "toolstrek_coin_dice_v1";

export const DEFAULT_COIN_FACES = [
  { id: "heads", label: "Heads", weight: 1, color: "#f59e0b" },
  { id: "tails", label: "Tails", weight: 1, color: "#6366f1" },
];

export const DICE_PRESETS = [
  { id: "d4", label: "d4", sides: 4, blurb: "Pyramid" },
  { id: "d6", label: "d6", sides: 6, blurb: "Classic cube" },
  { id: "d8", label: "d8", sides: 8, blurb: "Octahedron" },
  { id: "d10", label: "d10", sides: 10, blurb: "Pentagonal" },
  { id: "d12", label: "d12", sides: 12, blurb: "Dodecahedron" },
  { id: "d20", label: "d20", sides: 20, blurb: "D20 check" },
  { id: "d100", label: "d100", sides: 100, blurb: "Percentile" },
];

export const DEMO_SETUPS = {
  classic: {
    label: "Classic coin toss",
    description: "One two-sided coin with equal odds.",
    coinFaces: [
      { label: "Heads", weight: 1, color: "#f59e0b" },
      { label: "Tails", weight: 1, color: "#6366f1" },
    ],
    coinCount: 1,
    diceCount: 1,
    diceSides: 6,
    diceModifier: 0,
  },
  party: {
    label: "Party coins",
    description: "Five coins in one throw — great for quick group decisions.",
    coinFaces: [
      { label: "Yes", weight: 1, color: "#10b981" },
      { label: "No", weight: 1, color: "#ef4444" },
    ],
    coinCount: 5,
    diceCount: 2,
    diceSides: 6,
    diceModifier: 0,
  },
  dungeon: {
    label: "Dungeon run",
    description: "4d6 ability score, plus a weighted coin for loot.",
    coinFaces: [
      { label: "Loot", weight: 2, color: "#f59e0b" },
      { label: "Trap", weight: 1, color: "#8b5cf6" },
    ],
    coinCount: 1,
    diceCount: 4,
    diceSides: 6,
    diceModifier: 0,
  },
};

export const DEFAULT_COIN_DICE_SETTINGS = {
  tab: "coin",
  coinCount: 1,
  coinDuration: 1.6,
  coinBiasMode: "fair",
  diceCount: 2,
  diceSides: 6,
  diceModifier: 0,
  diceMode: "normal",
  diceDuration: 1.1,
  sound: true,
  removeLosers: false,
  showDistribution: true,
};

export const COIN_DICE_FAQS = [
  {
    question: "Is the coin flip really random?",
    answer:
      "Yes. Every flip and roll is drawn from the Web Crypto API (crypto.getRandomValues), not Math.random. The animation is played after the outcome is chosen, so the visual result always matches the secure draw. A fair coin gives each side an exact 50% chance.",
  },
  {
    question: "Can I change the coin faces and odds?",
    answer:
      "Yes. Add, rename, recolour or delete coin faces, and give each face a relative weight. Switch the bias mode to Weighted to honour those weights, or keep Fair mode to ignore them and treat every face equally. This is useful for custom yes/no tokens, decision coins or story prompts.",
  },
  {
    question: "Which dice can I roll?",
    answer:
      "Use the d4, d6, d8, d10, d12, d20 or d100 presets, or type any custom number of sides from 2 to 1000. You can roll up to 20 dice at once, add a flat modifier, and apply advantage or disadvantage (roll twice and keep the higher or lower total).",
  },
  {
    question: "What does advantage or disadvantage mean?",
    answer:
      "Advantage rolls the whole dice pool twice and keeps the higher total. Disadvantage rolls twice and keeps the lower total. The pair of totals is shown in the result card and logged in the history so the decision is transparent.",
  },
  {
    question: "Why is there no pre-filled result?",
    answer:
      "ToolsTrek does not invent outcomes. The result area is empty until you flip or roll, and there is no server call involved. Use the demo setup buttons only if you want a quick example configuration — they never run a draw for you.",
  },
  {
    question: "Are my custom coins and history saved?",
    answer:
      "Your coin faces, dice settings and session history are stored in this browser's localStorage only. They never leave your device. You can clear the history or reset everything from the settings panel at any time.",
  },
];

export const COIN_SOUNDS = {
  flip: [520, 660, 780],
  land: [880, 1100],
  roll: [320, 380, 440],
};
