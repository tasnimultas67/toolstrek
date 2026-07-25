"use client";

import React, { useState, useMemo, useRef } from "react";
import ToolPageShell from "../ToolPageShell";
import BackButton from "@/components/BackButton";
import FavoriteButton from "@/components/FavoriteButton";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import {
  Sparkles,
  Calendar,
  Sun,
  Moon,
  Heart,
  Briefcase,
  Activity,
  Copy,
  Check,
  Download,
  Star,
  Shield,
  Zap,
  Award,
  Sliders,
  Compass,
  UserCheck,
  Info,
  TrendingUp,
  Sparkle
} from "lucide-react";

// ─── ZODIAC DATA DICTIONARY ───────────────────────────────────────────────────

const ZODIAC_DATA = {
  Aries: {
    name: "Aries",
    sanskritName: "Mesha (मेष)",
    symbol: "♈",
    dates: "March 21 – April 19",
    element: "Fire",
    modality: "Cardinal",
    ruler: "Mars",
    duality: "Masculine / Yang",
    house: "1st House (House of Self)",
    spiritAnimal: "Ram & Hawk",
    birthstone: "Diamond & Bloodstone",
    luckyNumbers: [1, 8, 17, 27],
    luckyColors: ["Crimson Red", "Scarlet", "Fire Gold"],
    luckyDays: ["Tuesday"],
    flower: "Honeysuckle & Red Rose",
    tarotCard: "The Emperor (IV)",
    motto: "I am and I act.",
    colorTheme: {
      gradient: "from-red-600 via-rose-500 to-amber-500",
      border: "border-red-200 dark:border-red-500/40",
      bgGlow: "rgba(239, 68, 68, 0.12)",
      heroBg: "bg-gradient-to-br from-red-50/90 via-rose-50/50 to-white dark:from-slate-900/95 dark:via-red-950/30 dark:to-slate-900/95",
      textAccent: "text-red-600 dark:text-red-400",
      badgeBg: "bg-red-100 text-red-800 border-red-200 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/30",
    },
    overview:
      "Aries is the dynamic trailblazer of the zodiac. Fueled by Mars, the planet of passion and action, Arians possess an infectious enthusiasm, pioneering spirit, and unyielding courage. They love setting goals, taking initiatives, and fearlessly charging into uncharted territory.",
    strengths: [
      "Pioneering courage & initiative",
      "Unflinching honesty & directness",
      "High physical vitality & energy",
      "Natural magnetic leadership",
      "Passionate and optimistic outlook"
    ],
    weaknesses: [
      "Impatience with slow processes",
      "Short temper or quick irritation",
      "Tendency to act before planning",
      "Reluctance to seek help when struggling"
    ],
    coreDesires: "To lead, conquer new frontiers, and express authentic freedom.",
    secretFear: "Being dependent on others or falling into boredom and stagnation.",
    communicationStyle: "Direct, bold, inspiring, and transparent. Says exactly what they mean without pretense.",
    loveStyle: {
      description: "In romance, Aries is passionate, ardent, and adventurous. They fall fast and hard, bringing high romantic energy and playfulness. They respect independent partners who can match their high energy and challenge them intellectually and emotionally.",
      bestMatches: ["Leo", "Sagittarius", "Gemini", "Libra"],
      challengingMatches: ["Cancer", "Capricorn"],
      idealDate: "High-energy adventure, spontaneous road trips, or exciting competitive activities followed by a cozy dinner."
    },
    careerWealth: {
      bestCareers: ["Entrepreneur", "Executive Leader", "Athlete / Coach", "Surgeon / Emergency Responder", "Creative Director", "Military / Law Enforcement"],
      workStyle: "Thrives in fast-paced environments with high autonomy. Prefers starting visionary projects over routine maintenance.",
      moneyHabits: "Generous and bold with investments. Prone to impulse spending when excited, but possesses high earning capability due to drive."
    },
    healthWellness: {
      ruledBodyParts: "Head, Brain, Face, and Nervous System.",
      wellnessAdvice: "Engage in intense physical exercises like martial arts, HIIT, or sprinting to burn off excess stress. Practice mindfulness and breathwork to cool hot-headed moments.",
      powerFoods: "Rich iron sources, spicy peppers, leafy greens, walnuts, and plenty of hydrating spring water."
    },
    decans: [
      { range: "Mar 21 – Mar 31", subRuler: "Mars", title: "1st Decan — Pure Mars", trait: "Ultra-driven, courageous, trailblazing, high kinetic energy." },
      { range: "Apr 01 – Apr 10", subRuler: "Sun", title: "2nd Decan — Leo Influence", trait: "Charismatic, creative, proud, natural performer and motivator." },
      { range: "Apr 11 – Apr 19", subRuler: "Jupiter", title: "3rd Decan — Sagittarius Influence", trait: "Philosophical, adventurous, broad-visioned, eternal learner." }
    ]
  },

  Taurus: {
    name: "Taurus",
    sanskritName: "Vrishabha (वृषभ)",
    symbol: "♉",
    dates: "April 20 – May 20",
    element: "Earth",
    modality: "Fixed",
    ruler: "Venus",
    duality: "Feminine / Yin",
    house: "2nd House (House of Value & Possessions)",
    spiritAnimal: "Bull & Bear",
    birthstone: "Emerald & Rose Quartz",
    luckyNumbers: [2, 6, 15, 24],
    luckyColors: ["Forest Green", "Emerald", "Dusty Rose"],
    luckyDays: ["Friday"],
    flower: "Foxglove & Lily of the Valley",
    tarotCard: "The Hierophant (V)",
    motto: "I have and I anchor.",
    colorTheme: {
      gradient: "from-emerald-600 via-green-500 to-teal-400",
      border: "border-emerald-200 dark:border-emerald-500/40",
      bgGlow: "rgba(16, 185, 129, 0.12)",
      heroBg: "bg-gradient-to-br from-emerald-50/90 via-teal-50/50 to-white dark:from-slate-900/95 dark:via-emerald-950/30 dark:to-slate-900/95",
      textAccent: "text-emerald-600 dark:text-emerald-400",
      badgeBg: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30",
    },
    overview:
      "Taurus is the steadfast anchor of the zodiac. Ruled by Venus, Taurus appreciates sensory beauty, comfort, loyalty, and tangible achievements. Deeply grounded and practical, Taureans build lasting foundations and bring calm stability to those around them.",
    strengths: [
      "Unwavering loyalty and reliability",
      "Exceptional patience & perseverance",
      "Keen eye for aesthetic beauty & quality",
      "Pragmatic financial intelligence",
      "Calm, soothing presence under pressure"
    ],
    weaknesses: [
      "Resistance to sudden changes",
      "Stubbornness when set in habits",
      "Possessiveness in relationships",
      "Tendency toward over-indulgence"
    ],
    coreDesires: "Security, harmony, sensual comfort, and lasting peace of mind.",
    secretFear: "Sudden chaotic disruptions, financial instability, or feeling rushed.",
    communicationStyle: "Measured, calm, reassuring, and grounded. Prefers factual accuracy over hyperbole.",
    loveStyle: {
      description: "Taurus expresses love through tactile affection, loyalty, and cozy domestic experiences. They take time to trust, but once committed, they are rock-solid, incredibly devoted, and deeply protective of their loved ones.",
      bestMatches: ["Virgo", "Capricorn", "Cancer", "Scorpio"],
      challengingMatches: ["Leo", "Aquarius"],
      idealDate: "A fine dining experience with exquisite wine, sensory jazz music, or a luxurious weekend nature retreat."
    },
    careerWealth: {
      bestCareers: ["Financial Advisor / Banker", "Architect / Interior Designer", "Chef / Sommelier", "Landscape Designer", "Art Curator", "Real Estate Specialist"],
      workStyle: "Methodical, diligent, and detail-conscious. Delivers top-tier quality results without cutting corners.",
      moneyHabits: "Excellent at building long-term wealth, value-driven purchases, and maintaining healthy savings reserves."
    },
    healthWellness: {
      ruledBodyParts: "Neck, Throat, Vocal Cords, and Thyroid.",
      wellnessAdvice: "Incorporate outdoor walking, gardening, or restorative yoga into daily routine. Take special care of throat health with warm herbal teas and vocal exercises.",
      powerFoods: "Root vegetables, organic apples, berries, almonds, oats, and chamomile."
    },
    decans: [
      { range: "Apr 20 – Apr 30", subRuler: "Venus", title: "1st Decan — Pure Venus", trait: "Deeply sensual, artistic, patient, lover of luxury and calm." },
      { range: "May 01 – May 10", subRuler: "Mercury", title: "2nd Decan — Virgo Influence", trait: "Analytical mind, pragmatic, organized, excellent craftsman." },
      { range: "May 11 – May 20", subRuler: "Saturn", title: "3rd Decan — Capricorn Influence", trait: "Ambitious, disciplined, master builder, long-term strategist." }
    ]
  },

  Gemini: {
    name: "Gemini",
    sanskritName: "Mithuna (मिथुन)",
    symbol: "♊",
    dates: "May 21 – June 20",
    element: "Air",
    modality: "Mutable",
    ruler: "Mercury",
    duality: "Masculine / Yang",
    house: "3rd House (House of Communication & Learning)",
    spiritAnimal: "Deer & Dolphin",
    birthstone: "Agate & Pearl",
    luckyNumbers: [3, 5, 12, 23],
    luckyColors: ["Electric Yellow", "Sky Blue", "Silver"],
    luckyDays: ["Wednesday"],
    flower: "Lavender & Orchid",
    tarotCard: "The Lovers (VI)",
    motto: "I think and I connect.",
    colorTheme: {
      gradient: "from-amber-400 via-yellow-400 to-cyan-400",
      border: "border-yellow-200 dark:border-yellow-400/40",
      bgGlow: "rgba(251, 191, 36, 0.12)",
      heroBg: "bg-gradient-to-br from-yellow-50/90 via-amber-50/50 to-white dark:from-slate-900/95 dark:via-amber-950/30 dark:to-slate-900/95",
      textAccent: "text-amber-600 dark:text-yellow-300",
      badgeBg: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-yellow-500/20 dark:text-yellow-300 dark:border-yellow-500/30",
    },
    overview:
      "Gemini is the intellectual butterfly and master communicator of the zodiac. Ruled by Mercury, Geminis possess a brilliant, quick-witted mind, boundless curiosity, and adaptability. They thrive on ideas, lively conversations, and learning new things.",
    strengths: [
      "Quick intellect & mental agility",
      "Exceptional communication skills",
      "Versatile adaptability to any situation",
      "Charming wit and engaging humor",
      "Broad knowledge across diverse fields"
    ],
    weaknesses: [
      "Short attention span / easily bored",
      "Over-thinking or nervous energy",
      "Difficulty sticking to one long routine",
      "Dual nature can seem unpredictable"
    ],
    coreDesires: "Intellectual stimulation, freedom of expression, and endless discovery.",
    secretFear: "Being trapped in routine, boredom, or feeling misunderstood.",
    communicationStyle: "Witty, fast-paced, expressive, and engaging. Loves storytelling, debates, and sharing insights.",
    loveStyle: {
      description: "For Gemini, love starts in the mind. They need a partner who can match their intellectual curiosity, spark intriguing discussions, and keep life fun and dynamic. Mental intimacy is the key to their heart.",
      bestMatches: ["Libra", "Aquarius", "Aries", "Sagittarius"],
      challengingMatches: ["Virgo", "Pisces"],
      idealDate: "An interactive trivia night, comedy show, exploring a modern art gallery, or a lively coffee shop chat."
    },
    careerWealth: {
      bestCareers: ["Journalist / Writer", "PR & Marketing Specialist", "Public Speaker / Podcast Host", "Software Developer", "Translator", "Media Producer"],
      workStyle: "Multi-tasks effortlessly, connects disparate ideas, and excels in brainstorming and high-communication environments.",
      moneyHabits: "Flexible with finances. Spends on travel, books, gadgets, and learning experiences. Benefits from automated savings tools."
    },
    healthWellness: {
      ruledBodyParts: "Lungs, Arms, Hands, and Nervous System.",
      wellnessAdvice: "Practice deep pranayama breathing exercises to calm a buzzing mind. Engage in activities requiring hand dexterity like playing instruments or writing.",
      powerFoods: "Citrus fruits, carrots, celery, walnuts, green tea, and magnesium-rich seeds."
    },
    decans: [
      { range: "May 21 – May 31", subRuler: "Mercury", title: "1st Decan — Pure Mercury", trait: "Exceptionally fast thinker, expressive, versatile, witty." },
      { range: "Jun 01 – Jun 10", subRuler: "Venus", title: "2nd Decan — Libra Influence", trait: "Charming, artistic, diplomatic, relationship-oriented thinker." },
      { range: "Jun 11 – Jun 20", subRuler: "Uranus", title: "3rd Decan — Aquarius Influence", trait: "Innovative, progressive, visionary, unconventional intellect." }
    ]
  },

  Cancer: {
    name: "Cancer",
    sanskritName: "Karka (कर्क)",
    symbol: "♋",
    dates: "June 21 – July 22",
    element: "Water",
    modality: "Cardinal",
    ruler: "Moon",
    duality: "Feminine / Yin",
    house: "4th House (House of Home & Family)",
    spiritAnimal: "Crab & Elephant",
    birthstone: "Ruby & Moonstone",
    luckyNumbers: [2, 7, 11, 16, 20],
    luckyColors: ["Silver", "Pearl White", "Seafoam Green"],
    luckyDays: ["Monday"],
    flower: "White Rose & Water Lily",
    tarotCard: "The Chariot (VII)",
    motto: "I feel and I nurture.",
    colorTheme: {
      gradient: "from-sky-400 via-indigo-400 to-slate-300",
      border: "border-sky-200 dark:border-sky-400/40",
      bgGlow: "rgba(56, 189, 248, 0.12)",
      heroBg: "bg-gradient-to-br from-sky-50/90 via-indigo-50/50 to-white dark:from-slate-900/95 dark:via-sky-950/30 dark:to-slate-900/95",
      textAccent: "text-sky-600 dark:text-sky-300",
      badgeBg: "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-500/20 dark:text-sky-300 dark:border-sky-500/30",
    },
    overview:
      "Cancer is the intuitive caregiver and emotional heart of the zodiac. Guided by the Moon, Cancerians feel deeply, possess profound emotional intelligence, and build warm, safe sanctuaries for themselves and their loved ones.",
    strengths: [
      "Profound emotional empathy & intuition",
      "Deeply protective & nurturing instinct",
      "Vivid creative imagination",
      "Tenacious loyalty to loved ones",
      "Strong instinctual memory & wisdom"
    ],
    weaknesses: [
      "Sensitivity to perceived slights",
      "Mood swings aligned with lunar cycles",
      "Tendency to retreat into shell when hurt",
      "Difficulty letting go of past memories"
    ],
    coreDesires: "Emotional safety, deep bonds, home sanctuary, and nurturing others.",
    secretFear: "Rejection, abandonment, or lack of emotional security.",
    communicationStyle: "Warm, empathetic, thoughtful, and protective. Listens deeply and senses unsaid emotions.",
    loveStyle: {
      description: "Cancer loves with wholehearted devotion. They seek emotional depth, loyalty, and a soulful soulmate bond. They express romance through sentimental gestures, home-cooked meals, and unconditional support.",
      bestMatches: ["Scorpio", "Pisces", "Taurus", "Capricorn"],
      challengingMatches: ["Aries", "Libra"],
      idealDate: "Cozy home-cooked candlelight dinner, sunset walk by the beach, or a romantic movie night at home."
    },
    careerWealth: {
      bestCareers: ["Psychologist / Counselor", "Nurse / Doctor", "Chef / Hospitality Manager", "Interior Architect", "Historian / Antique Dealer", "Child Educator"],
      workStyle: "Empathetic leadership style, creates supportive team dynamics, and intuitive in reading client needs.",
      moneyHabits: "Prudent and security-minded. Excellent at building nest eggs, real estate investments, and family wealth preservation."
    },
    healthWellness: {
      ruledBodyParts: "Chest, Stomach, Breasts, and Digestive Tract.",
      wellnessAdvice: "Water therapy (swimming, warm baths with Epsom salts) helps release absorbed emotional energies. Guard digestive health by eating when peaceful.",
      powerFoods: "Hydrating cucumbers, melons, warm oats, steamed fish, ginger tea, and fermented foods."
    },
    decans: [
      { range: "Jun 21 – Jun 30", subRuler: "Moon", title: "1st Decan — Pure Moon", trait: "Deeply intuitive, maternal/paternal warmth, imaginative." },
      { range: "Jul 01 – Jul 11", subRuler: "Pluto", title: "2nd Decan — Scorpio Influence", trait: "Intense emotional depth, transformative, protective, resilient." },
      { range: "Jul 12 – Jul 22", subRuler: "Neptune", title: "3rd Decan — Pisces Influence", trait: "Artistic, highly empathetic, spiritual, compassionate dreamer." }
    ]
  },

  Leo: {
    name: "Leo",
    sanskritName: "Simha (सिंह)",
    symbol: "♌",
    dates: "July 23 – August 22",
    element: "Fire",
    modality: "Fixed",
    ruler: "Sun",
    duality: "Masculine / Yang",
    house: "5th House (House of Pleasure & Creativity)",
    spiritAnimal: "Lion & Peacock",
    birthstone: "Peridot & Amber",
    luckyNumbers: [1, 5, 9, 19],
    luckyColors: ["Royal Gold", "Warm Amber", "Sunny Orange"],
    luckyDays: ["Sunday"],
    flower: "Sunflower & Marigold",
    tarotCard: "Strength (VIII)",
    motto: "I shine and I inspire.",
    colorTheme: {
      gradient: "from-amber-500 via-orange-500 to-yellow-400",
      border: "border-amber-200 dark:border-amber-500/40",
      bgGlow: "rgba(245, 158, 11, 0.12)",
      heroBg: "bg-gradient-to-br from-amber-50/90 via-orange-50/50 to-white dark:from-slate-900/95 dark:via-amber-950/30 dark:to-slate-900/95",
      textAccent: "text-amber-600 dark:text-amber-400",
      badgeBg: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30",
    },
    overview:
      "Leo is the radiant monarch and creative sun of the zodiac. Ruled by the Sun itself, Leos radiate warmth, magnetism, generosity, and vibrant vitality. They possess big hearts, natural star quality, and inspire others to shine bright.",
    strengths: [
      "Magnanimous generosity & warm heart",
      "Natural charismatic leadership",
      "Unshakable confidence & optimism",
      "Creative expression & theatrical flair",
      "Fierce loyalty to friends and family"
    ],
    weaknesses: [
      "Need for constant appreciation",
      "Pride can hinder apologizing",
      "Tendency to take on too much spotlight",
      "Stubbornness when challenged"
    ],
    coreDesires: "Recognition, creative fulfillment, respect, and bringing joy to others.",
    secretFear: "Being ignored, forgotten, or perceived as ordinary.",
    communicationStyle: "Inspiring, dramatic, enthusiastic, and warm. Speaks with conviction and uplifting optimism.",
    loveStyle: {
      description: "In love, Leo is grand, romantic, and fiercely devoted. They shower their partner with lavish affection, grand gestures, and unwavering protection. They thrive when celebrated and adored in return.",
      bestMatches: ["Aries", "Sagittarius", "Gemini", "Aquarius"],
      challengingMatches: ["Taurus", "Scorpio"],
      idealDate: "VIP theatre tickets, rooftop lounge dining, gala event, or a glam red-carpet style night out."
    },
    careerWealth: {
      bestCareers: ["Performing Artist / Actor", "CEO / Founder", "Event Producer", "Creative Director", "Motivational Speaker", "Brand Ambassador"],
      workStyle: "Leads from the front, inspires teams with vision, and excels when given creative freedom and authority.",
      moneyHabits: "Generous spenders on gifts and experiences. Enjoys luxury, but motivated to earn high incomes to sustain their regal lifestyle."
    },
    healthWellness: {
      ruledBodyParts: "Heart, Spine, Upper Back, and Circulation.",
      wellnessAdvice: "Cardiovascular exercise (dance, aerobic workouts) keeps the heart happy. Maintain good posture and spinal health through stretching and core work.",
      powerFoods: "Sun-ripened oranges, saffron, sunflower seeds, honey, lean protein, and heart-healthy olive oil."
    },
    decans: [
      { range: "Jul 23 – Aug 01", subRuler: "Sun", title: "1st Decan — Pure Sun", trait: "Radiant charisma, regal presence, generous, highly expressive." },
      { range: "Aug 02 – Aug 12", subRuler: "Jupiter", title: "2nd Decan — Sagittarius Influence", trait: "Optimistic reformer, adventurous, expansive mind, bold." },
      { range: "Aug 13 – Aug 22", subRuler: "Mars", title: "3rd Decan — Aries Influence", trait: "Dynamic, competitive, fiercely driven, unbeatable determination." }
    ]
  },

  Virgo: {
    name: "Virgo",
    sanskritName: "Kanya (कन्या)",
    symbol: "♍",
    dates: "August 23 – September 22",
    element: "Earth",
    modality: "Mutable",
    ruler: "Mercury",
    duality: "Feminine / Yin",
    house: "6th House (House of Health & Service)",
    spiritAnimal: "Bee & Maiden",
    birthstone: "Sapphire & Carnelian",
    luckyNumbers: [5, 14, 23, 32],
    luckyColors: ["Navy Blue", "Olive Green", "Warm Ochre"],
    luckyDays: ["Wednesday"],
    flower: "Buttercup & Chrysanthemum",
    tarotCard: "The Hermit (IX)",
    motto: "I analyze and I refine.",
    colorTheme: {
      gradient: "from-teal-600 via-emerald-500 to-lime-400",
      border: "border-teal-200 dark:border-teal-500/40",
      bgGlow: "rgba(20, 184, 166, 0.12)",
      heroBg: "bg-gradient-to-br from-teal-50/90 via-emerald-50/50 to-white dark:from-slate-900/95 dark:via-teal-950/30 dark:to-slate-900/95",
      textAccent: "text-teal-600 dark:text-teal-300",
      badgeBg: "bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-500/20 dark:text-teal-300 dark:border-teal-500/30",
    },
    overview:
      "Virgo is the meticulous craftsman, healer, and practical genius of the zodiac. Ruled by Mercury, Virgos process world information with extraordinary detail, analytical clarity, and a heart dedicated to meaningful service and self-mastery.",
    strengths: [
      "Sharp analytical acumen & organization",
      "Deep dedication to helpful service",
      "High standards of quality & precision",
      "Practical problem-solving ability",
      "Grounded, humble, and reliable nature"
    ],
    weaknesses: [
      "Perfectionism leading to stress",
      "Overly self-critical inner monologue",
      "Worrying about minor details",
      "Reluctance to delegate tasks"
    ],
    coreDesires: "Order, self-improvement, physical & mental harmony, and serving a purpose.",
    secretFear: "Failure, chaos, inefficiency, or being accused of incompetence.",
    communicationStyle: "Precise, articulate, constructive, and helpful. Offers practical advice grounded in facts.",
    loveStyle: {
      description: "Virgo shows love through thoughtful acts of service, reliability, and steady support. They may not do dramatic displays, but they notice every small detail about their partner and take genuine care of their wellbeing.",
      bestMatches: ["Taurus", "Capricorn", "Cancer", "Pisces"],
      challengingMatches: ["Gemini", "Sagittarius"],
      idealDate: "A clean artisanal pottery workshop, organic vineyard tour, or quiet gourmet picnic in a botanical garden."
    },
    careerWealth: {
      bestCareers: ["Data Analyst / Engineer", "Medical Specialist / Pharmacist", "Editor / Researcher", "Accountant / Auditor", "Nutritionist / Wellness Coach", "Quality Inspector"],
      workStyle: "Methodical, efficient, thorough, and highly reliable. Solves complex problems by breaking them into precise steps.",
      moneyHabits: "Prudent financial management, thorough budget tracking, and smart long-term investments."
    },
    healthWellness: {
      ruledBodyParts: "Digestive System, Intestines, and Spleen.",
      wellnessAdvice: "Establish daily grounding routines to calm internal anxiety. Gentle mind-body practices like Pilates or Tai Chi suit Virgo exceptionally well.",
      powerFoods: "Fiber-rich whole grains, fermented kefir, green leafy vegetables, almonds, and chamomile tea."
    },
    decans: [
      { range: "Aug 23 – Sep 01", subRuler: "Mercury", title: "1st Decan — Pure Mercury", trait: "Hyper-analytical, articulate, organized, master of precision." },
      { range: "Sep 02 – Sep 12", subRuler: "Saturn", title: "2nd Decan — Capricorn Influence", trait: "Disciplined planner, serious work ethic, durable resilience." },
      { range: "Sep 13 – Sep 22", subRuler: "Venus", title: "3rd Decan — Taurus Influence", trait: "Artistic sensibility, lover of nature, refined taste, loyal." }
    ]
  },

  Libra: {
    name: "Libra",
    sanskritName: "Tula (तुला)",
    symbol: "♎",
    dates: "September 23 – October 22",
    element: "Air",
    modality: "Cardinal",
    ruler: "Venus",
    duality: "Masculine / Yang",
    house: "7th House (House of Partnerships)",
    spiritAnimal: "Swan & Dove",
    birthstone: "Opal & Peridot",
    luckyNumbers: [6, 15, 24, 33],
    luckyColors: ["Pastel Pink", "Sky Blue", "Lavender"],
    luckyDays: ["Friday"],
    flower: "Rose & Hydrangea",
    tarotCard: "Justice (XI)",
    motto: "I balance and I harmonize.",
    colorTheme: {
      gradient: "from-pink-500 via-rose-400 to-sky-400",
      border: "border-pink-200 dark:border-pink-400/40",
      bgGlow: "rgba(244, 63, 94, 0.12)",
      heroBg: "bg-gradient-to-br from-pink-50/90 via-sky-50/50 to-white dark:from-slate-900/95 dark:via-pink-950/30 dark:to-slate-900/95",
      textAccent: "text-pink-600 dark:text-pink-300",
      badgeBg: "bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-500/20 dark:text-pink-300 dark:border-pink-500/30",
    },
    overview:
      "Libra is the diplomat, aesthete, and seeker of ultimate balance in the zodiac. Ruled by Venus, Libras possess exceptional grace, social charm, a love for symmetry, and an innate drive to create peace and beauty in all relationships.",
    strengths: [
      "Diplomatic peacemaking & fairness",
      "Refined aesthetic & artistic sense",
      "Social charm and natural magnetism",
      "Objective perspective & open mind",
      "Cooperative partnership orientation"
    ],
    weaknesses: [
      "Indecisiveness when weighing options",
      "Avoiding conflict at cost of truth",
      "Tendency to people-please",
      "Over-dependence on partner validation"
    ],
    coreDesires: "Harmony, equality, beauty, soulmate partnership, and justice.",
    secretFear: "Being alone, disharmony, ugly conflict, or making the wrong decision.",
    communicationStyle: "Polite, persuasive, tactful, and fair. Listens to all sides of an argument before offering synthesis.",
    loveStyle: {
      description: "Libra is the quintessential romantic. They cherish partnership and love the art of courtship, elegant dates, and mutual harmony. They thrive in relationships built on intellectual equality and mutual respect.",
      bestMatches: ["Gemini", "Aquarius", "Leo", "Aries"],
      challengingMatches: ["Cancer", "Capricorn"],
      idealDate: "Art gallery opening, symphony concert, romantic candlelit dinner with aesthetic decor, or a scenic wine tasting."
    },
    careerWealth: {
      bestCareers: ["Lawyer / Mediator", "Fashion Designer / Stylist", "Diplomat / Ambassador", "Architect", "HR Director", "Art Dealer"],
      workStyle: "Collaborative, creates harmonious team environments, excels in negotiations and aesthetic curation.",
      moneyHabits: "Appreciates luxury and beauty. Balances aesthetic splurges with sensible financial plans."
    },
    healthWellness: {
      ruledBodyParts: "Kidneys, Lower Back, and Adrenal Glands.",
      wellnessAdvice: "Maintain proper hydration to support kidney function. Practice core and lower-back strengthening exercises like posture yoga.",
      powerFoods: "Pomegranates, apples, fresh berries, asparagus, walnuts, and plenty of pure water."
    },
    decans: [
      { range: "Sep 23 – Oct 02", subRuler: "Venus", title: "1st Decan — Pure Venus", trait: "Ultra-charming, romantic, artistic eye, peace-loving diplomat." },
      { range: "Oct 03 – Oct 12", subRuler: "Uranus", title: "2nd Decan — Aquarius Influence", trait: "Intellectual, humanitarian, social reformer, independent mind." },
      { range: "Oct 13 – Oct 22", subRuler: "Mercury", title: "3rd Decan — Gemini Influence", trait: "Witty communicator, persuasive writer, mentally agile, social." }
    ]
  },

  Scorpio: {
    name: "Scorpio",
    sanskritName: "Vrishchika (वृश्चिक)",
    symbol: "♏",
    dates: "October 23 – November 21",
    element: "Water",
    modality: "Fixed",
    ruler: "Pluto & Mars",
    duality: "Feminine / Yin",
    house: "8th House (House of Transformation & Mysteries)",
    spiritAnimal: "Scorpion, Eagle & Phoenix",
    birthstone: "Topaz & Obsidian",
    luckyNumbers: [8, 11, 18, 22],
    luckyColors: ["Deep Burgundy", "Crimson Black", "Midnight Blue"],
    luckyDays: ["Tuesday"],
    flower: "Geranium & Dark Red Peony",
    tarotCard: "Death / Transformation (XIII)",
    motto: "I transform and I perceive.",
    colorTheme: {
      gradient: "from-purple-800 via-rose-900 to-slate-900",
      border: "border-purple-200 dark:border-purple-500/40",
      bgGlow: "rgba(147, 51, 234, 0.12)",
      heroBg: "bg-gradient-to-br from-purple-50/90 via-rose-50/50 to-white dark:from-slate-900/95 dark:via-purple-950/30 dark:to-slate-900/95",
      textAccent: "text-purple-600 dark:text-purple-300",
      badgeBg: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/30",
    },
    overview:
      "Scorpio is the intense, enigmatic, and powerful transformer of the zodiac. Ruled by Pluto and Mars, Scorpios possess extraordinary emotional depth, razor-sharp psychological intuition, unwavering focus, and an indomitable power to rise like a Phoenix.",
    strengths: [
      "Razor-sharp intuition & psychological depth",
      "Unmatched determination & focus",
      "Fierce loyalty & protective instincts",
      "Authentic truth-seeking ability",
      "Transformative resilience & inner strength"
    ],
    weaknesses: [
      "Guardedness & secretiveness",
      "Difficulty trusting new acquaintances",
      "Intensity can feel overwhelming",
      "Tendency to hold grudges when betrayed"
    ],
    coreDesires: "Deep emotional intimacy, absolute truth, personal mastery, and power.",
    secretFear: "Betrayal, vulnerability being exploited, or loss of control.",
    communicationStyle: "Intense, perceptive, direct, and magnetic. Uncanny ability to peer right through superficial facades.",
    loveStyle: {
      description: "Scorpio loves with consuming intensity and soul-level passion. For Scorpio, love is all or nothing. Once they bestow their trust, they are fiercely loyal, protective, and deeply devoted partners for life.",
      bestMatches: ["Cancer", "Pisces", "Taurus", "Virgo"],
      challengingMatches: ["Leo", "Aquarius"],
      idealDate: "A speakeasy dinner, escape room mystery challenge, stargazing at night, or an intimate private dining setup."
    },
    careerWealth: {
      bestCareers: ["Investigative Journalist", "Surgeon / Psychiatrist", "Financial Strategist / Venture Capitalist", "Detective / Criminologist", "Researcher / Scientist"],
      workStyle: "Laser-focused, secretive until execution, excels in crisis management and deep research problems.",
      moneyHabits: "Shrewd investor, master of compound growth, privacy-conscious about wealth holdings."
    },
    healthWellness: {
      ruledBodyParts: "Reproductive System, Excretory Organs, and Regenerative System.",
      wellnessAdvice: "Detoxification practices (saunas, cleansing foods) rejuvenate energy. Emotional release through intense physical training or meditation is vital.",
      powerFoods: "Blackberries, dark chocolate, beets, garlic, pomegranate juice, and mineral-dense seaweed."
    },
    decans: [
      { range: "Oct 23 – Nov 01", subRuler: "Pluto", title: "1st Decan — Pure Pluto", trait: "Deeply magnetic, powerful willpower, intuitive investigator." },
      { range: "Nov 02 – Nov 11", subRuler: "Neptune", title: "2nd Decan — Pisces Influence", trait: "Mystical intuition, artistic depth, soulful empathy, dreamer." },
      { range: "Nov 12 – Nov 21", subRuler: "Moon", title: "3rd Decan — Cancer Influence", trait: "Protective guardian, deep emotional intelligence, loyal." }
    ]
  },

  Sagittarius: {
    name: "Sagittarius",
    sanskritName: "Dhanu (धनु)",
    symbol: "♐",
    dates: "November 22 – December 21",
    element: "Fire",
    modality: "Mutable",
    ruler: "Jupiter",
    duality: "Masculine / Yang",
    house: "9th House (House of Higher Learning & Philosophy)",
    spiritAnimal: "Centaur & Wild Horse",
    birthstone: "Turquoise & Blue Topaz",
    luckyNumbers: [3, 7, 9, 12, 21],
    luckyColors: ["Royal Purple", "Electric Indigo", "Turquoise"],
    luckyDays: ["Thursday"],
    flower: "Carnation & Dandelion",
    tarotCard: "Temperance (XIV)",
    motto: "I explore and I expand.",
    colorTheme: {
      gradient: "from-violet-600 via-purple-500 to-indigo-400",
      border: "border-violet-200 dark:border-violet-500/40",
      bgGlow: "rgba(139, 92, 246, 0.12)",
      heroBg: "bg-gradient-to-br from-violet-50/90 via-purple-50/50 to-white dark:from-slate-900/95 dark:via-violet-950/30 dark:to-slate-900/95",
      textAccent: "text-violet-600 dark:text-violet-300",
      badgeBg: "bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-500/20 dark:text-violet-300 dark:border-violet-500/30",
    },
    overview:
      "Sagittarius is the optimistic adventurer, seeker of truth, and philosopher of the zodiac. Ruled by expansive Jupiter, Sagittarians possess infectious enthusiasm, a love for freedom, world travel, and an unquenchable thirst for knowledge.",
    strengths: [
      "Infectious optimism & enthusiasm",
      "Philosophical wisdom & broad vision",
      "Love for freedom & adventure",
      "Honest, candid, and transparent nature",
      "Generous spirit & humor"
    ],
    weaknesses: [
      "Bluntness that can inadvertently offend",
      "Restlessness with routine or confinement",
      "Over-promising due to excessive optimism",
      "Impatience with small details"
    ],
    coreDesires: "Ultimate freedom, wisdom, expansion of horizons, and world adventure.",
    secretFear: "Being trapped in mundane routine, micro-managed, or restricted.",
    communicationStyle: "Enthusiastic, humorous, philosophical, and candid. Loves discussing big ideas, beliefs, and world cultures.",
    loveStyle: {
      description: "Sagittarius views romance as a grand adventure shared with a best friend. They need a partner who values personal freedom, loves exploring new places, and enjoys stimulating philosophical debates.",
      bestMatches: ["Aries", "Leo", "Libra", "Aquarius"],
      challengingMatches: ["Virgo", "Pisces"],
      idealDate: "Spontaneous backpacking trips, attending a global cultural festival, camping stargazing, or visiting an exotic restaurant."
    },
    careerWealth: {
      bestCareers: ["University Professor / Academic", "Travel Photojournalist", "Publisher / Author", "International Entrepreneur", "Filmmaker", "Philosopher / Coach"],
      workStyle: "Envisioner of big pictures, inspires large teams, excels when granted freedom to travel and innovate.",
      moneyHabits: "Generous with finances, views money as a tool for freedom and experiences rather than mere accumulation."
    },
    healthWellness: {
      ruledBodyParts: "Hips, Thighs, Sciatic Nerve, and Liver.",
      wellnessAdvice: "Outdoor activities like hiking, horseback riding, or cycling keep hips flexible and energy flowing. Protect liver with clean diet.",
      powerFoods: "Blueberries, figs, artichokes, turmeric, oats, and antioxidant-rich purple foods."
    },
    decans: [
      { range: "Nov 22 – Nov 30", subRuler: "Jupiter", title: "1st Decan — Pure Jupiter", trait: "Boundless optimism, jovial, explorer, philosophical vision." },
      { range: "Dec 01 – Dec 10", subRuler: "Mars", title: "2nd Decan — Aries Influence", trait: "Bold action taker, fearless trailblazer, competitive drive." },
      { range: "Dec 11 – Dec 21", subRuler: "Sun", title: "3rd Decan — Leo Influence", trait: "Charismatic leader, theatrical flair, inspirational mentor." }
    ]
  },

  Capricorn: {
    name: "Capricorn",
    sanskritName: "Makara (मकर)",
    symbol: "♑",
    dates: "December 22 – January 19",
    element: "Earth",
    modality: "Cardinal",
    ruler: "Saturn",
    duality: "Feminine / Yin",
    house: "10th House (House of Ambition & Public Status)",
    spiritAnimal: "Sea-Goat & Eagle",
    birthstone: "Garnet & Onyx",
    luckyNumbers: [4, 8, 13, 22],
    luckyColors: ["Charcoal Grey", "Deep Brown", "Forest Pine"],
    luckyDays: ["Saturday"],
    flower: "Pansy & Ivy",
    tarotCard: "The Devil / Mastery (XV)",
    motto: "I master and I build.",
    colorTheme: {
      gradient: "from-slate-700 via-gray-600 to-amber-600",
      border: "border-slate-200 dark:border-slate-500/40",
      bgGlow: "rgba(100, 116, 139, 0.12)",
      heroBg: "bg-gradient-to-br from-slate-50/90 via-gray-50/50 to-white dark:from-slate-900/95 dark:via-slate-950/40 dark:to-slate-900/95",
      textAccent: "text-slate-700 dark:text-slate-300",
      badgeBg: "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-500/20 dark:text-slate-300 dark:border-slate-500/30",
    },
    overview:
      "Capricorn is the strategic architect, master strategist, and disciplined climber of the zodiac mountain. Ruled by Saturn, Capricorns possess unmatched perseverance, long-term vision, work ethic, and wisdom that matures like fine wine.",
    strengths: [
      "Unmatched discipline & perseverance",
      "Strategic long-term planning",
      "High integrity, responsibility & reliability",
      "Practical wisdom & pragmatic execution",
      "Composed calm under crisis"
    ],
    weaknesses: [
      "Tendency toward workaholism",
      "Overly serious or guarded exterior",
      "Pessimistic worry under extreme stress",
      "High expectations of self and others"
    ],
    coreDesires: "Mastery, legacy, achievement, financial self-reliance, and respect.",
    secretFear: "Failure, public embarrassment, poverty, or being perceived as irresponsible.",
    communicationStyle: "Measured, authoritative, dry humor, pragmatic, and goal-focused.",
    loveStyle: {
      description: "Capricorn takes love seriously. They build relationships intended to last a lifetime. Behind their reserved exterior lies a deeply loyal, protective, and sensual partner who expresses devotion through acts of commitment.",
      bestMatches: ["Taurus", "Virgo", "Scorpio", "Pisces"],
      challengingMatches: ["Aries", "Libra"],
      idealDate: "Classic upscale restaurant dining, historical architecture walking tour, or quiet fireside evening with vintage wine."
    },
    careerWealth: {
      bestCareers: ["Corporate Executive / CEO", "Architect / Structural Engineer", "Financial Director / Investor", "Judge / Attorney", "Government Official", "Project Manager"],
      workStyle: "Structured, highly organized, builds lasting systems, scales operations efficiently step-by-step.",
      moneyHabits: "Master of compounding capital, conservative risk management, and long-term asset building."
    },
    healthWellness: {
      ruledBodyParts: "Bones, Joints, Knees, Teeth, and Skin.",
      wellnessAdvice: "Maintain bone density with strength training and calcium/vitamin D support. Practice fun playfulness to balance intense work drives.",
      powerFoods: "Calcium-rich dark greens, sesame seeds, bone broths, walnuts, figs, and lean proteins."
    },
    decans: [
      { range: "Dec 22 – Dec 31", subRuler: "Saturn", title: "1st Decan — Pure Saturn", trait: "Master strategist, disciplined, unshakable resolve, builder." },
      { range: "Jan 01 – Jan 10", subRuler: "Venus", title: "2nd Decan — Taurus Influence", trait: "Artistic touch, financial savvy, sensual appreciation of quality." },
      { range: "Jan 11 – Jan 19", subRuler: "Mercury", title: "3rd Decan — Virgo Influence", trait: "Sharp analytical strategist, detailed planner, efficient executive." }
    ]
  },

  Aquarius: {
    name: "Aquarius",
    sanskritName: "Kumbha (कुंभ)",
    symbol: "♒",
    dates: "January 20 – February 18",
    element: "Air",
    modality: "Fixed",
    ruler: "Uranus & Saturn",
    duality: "Masculine / Yang",
    house: "11th House (House of Hopes, Friends & Future)",
    spiritAnimal: "Owl & Water-Bearer",
    birthstone: "Amethyst & Garnet",
    luckyNumbers: [4, 7, 11, 22, 29],
    luckyColors: ["Electric Blue", "Cyan", "Ultramarine"],
    luckyDays: ["Saturday"],
    flower: "Orchid & Bird of Paradise",
    tarotCard: "The Star (XVII)",
    motto: "I know and I innovate.",
    colorTheme: {
      gradient: "from-cyan-500 via-blue-500 to-indigo-500",
      border: "border-cyan-200 dark:border-cyan-400/40",
      bgGlow: "rgba(6, 182, 212, 0.12)",
      heroBg: "bg-gradient-to-br from-cyan-50/90 via-blue-50/50 to-white dark:from-slate-900/95 dark:via-cyan-950/30 dark:to-slate-900/95",
      textAccent: "text-cyan-600 dark:text-cyan-300",
      badgeBg: "bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-500/30",
    },
    overview:
      "Aquarius is the visionary innovator, humanitarian rebel, and futuristic thinker of the zodiac. Ruled by Uranus, Aquarians see beyond current boundaries, championing progress, original thinking, equality, and human advancement.",
    strengths: [
      "Visionary futuristic intellect",
      "Humanitarian compassion for society",
      "Unapologetic originality & independence",
      "Open-minded, unbiased perspectives",
      "Brilliant creative problem solving"
    ],
    weaknesses: [
      "Emotional detachment in personal disputes",
      "Fixed obstinacy in personal theories",
      "Can seem distant or overly intellectual",
      "Rebellion purely for rebellion's sake"
    ],
    coreDesires: "Intellectual freedom, societal progress, original self-expression, and community unity.",
    secretFear: "Loss of individuality, conformity, or emotional suffocation.",
    communicationStyle: "Innovative, objective, intellectually stimulating, and forward-thinking. Speaks with original insight.",
    loveStyle: {
      description: "Aquarius needs a partner who is first and foremost an intellectual equal and best friend. They value personal autonomy and thrive with partners who encourage their unique ideas and share humanitarian values.",
      bestMatches: ["Gemini", "Libra", "Aries", "Sagittarius"],
      challengingMatches: ["Taurus", "Scorpio"],
      idealDate: "Attending a futuristic tech Expo, sci-fi convention, astronomy observatory night, or a community volunteer project."
    },
    careerWealth: {
      bestCareers: ["AI / Tech Innovator", "Humanitarian NGO Leader", "Astronomer / Aerospace Engineer", "Data Scientist", "Inventor", "Sociologist"],
      workStyle: "Thrives in pioneering industries, challenges outdated conventions, and designs progressive systems.",
      moneyHabits: "Forward-thinking investor in tech, crypto, green energy, and social enterprise ventures."
    },
    healthWellness: {
      ruledBodyParts: "Shins, Ankles, and Circulatory System.",
      wellnessAdvice: "Aerobic cardiovascular activities keep circulation optimal. Ensure sufficient physical grounding to balance intense brain activity.",
      powerFoods: "Blueberries, pomegranates, spinach, citrus fruits, almonds, and ocean kelp."
    },
    decans: [
      { range: "Jan 20 – Jan 29", subRuler: "Uranus", title: "1st Decan — Pure Uranus", trait: "Inventive genius, original thinker, eccentric visionary." },
      { range: "Jan 30 – Feb 08", subRuler: "Mercury", title: "2nd Decan — Gemini Influence", trait: "Rapid communicator, writer, networker, brilliant problem solver." },
      { range: "Feb 09 – Feb 18", subRuler: "Venus", title: "3rd Decan — Libra Influence", trait: "Artistic visionary, social reformer, advocate for global peace." }
    ]
  },

  Pisces: {
    name: "Pisces",
    sanskritName: "Meena (मीन)",
    symbol: "♓",
    dates: "February 19 – March 20",
    element: "Water",
    modality: "Mutable",
    ruler: "Neptune & Jupiter",
    duality: "Feminine / Yin",
    house: "12th House (House of Subconscious & Spirituality)",
    spiritAnimal: "Two Fishes & Sea Turtle",
    birthstone: "Aquamarine & Amethyst",
    luckyNumbers: [3, 9, 12, 15, 24],
    luckyColors: ["Seafoam Green", "Aquamarine", "Deep Ocean Violet"],
    luckyDays: ["Thursday"],
    flower: "Water Lily & Lotus",
    tarotCard: "The Moon (XVIII)",
    motto: "I believe and I transcend.",
    colorTheme: {
      gradient: "from-teal-400 via-cyan-500 to-purple-600",
      border: "border-teal-200 dark:border-teal-400/40",
      bgGlow: "rgba(45, 212, 191, 0.12)",
      heroBg: "bg-gradient-to-br from-teal-50/90 via-cyan-50/50 to-white dark:from-slate-900/95 dark:via-teal-950/30 dark:to-slate-900/95",
      textAccent: "text-teal-600 dark:text-teal-300",
      badgeBg: "bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-500/20 dark:text-teal-300 dark:border-teal-500/30",
    },
    overview:
      "Pisces is the mystical dreamer, artist, and compassionate healer of the zodiac. Ruled by Neptune, Pisceans possess boundless empathy, vivid imaginations, poetic artistic souls, and a deep connection to spiritual dimensions.",
    strengths: [
      "Profound spiritual empathy & compassion",
      "Vivid artistic imagination & creativity",
      "Deep intuitive foresight & dream wisdom",
      "Gentle, non-judgmental acceptance",
      "Healing emotional presence"
    ],
    weaknesses: [
      "Escapism when reality feels harsh",
      "Difficulty establishing firm boundaries",
      "Absorbing other people's negative moods",
      "Idealizing partners unrealistically"
    ],
    coreDesires: "Spiritual oneness, creative expression, unconditional love, and peaceful harmony.",
    secretFear: "Harsh cold reality, emotional rejection, or losing artistic inspiration.",
    communicationStyle: "Poetic, gentle, metaphorical, empathetic, and soulful. Speaks from the heart and spirit.",
    loveStyle: {
      description: "Pisces loves with romantic idealism and profound soul connection. They dream of fairytale romance, spiritual unity, and deep emotional resonance with a soulmate who cherishes their soft heart.",
      bestMatches: ["Cancer", "Scorpio", "Taurus", "Capricorn"],
      challengingMatches: ["Gemini", "Sagittarius"],
      idealDate: "Private acoustic music concert, beachside moonlight walk, poetry reading, or art museum stroll."
    },
    careerWealth: {
      bestCareers: ["Musician / Composer", "Visual Artist / Animator", "Psychotherapist / Counselor", "Spiritual Mentor / Yoga Master", "Marine Biologist", "Filmmaker"],
      workStyle: "Intuitive, inspired work bursts, creates soul-stirring art, excels in compassionate caregiving roles.",
      moneyHabits: "Generous spenders on artistic and charitable causes. Benefits from structured automatic savings."
    },
    healthWellness: {
      ruledBodyParts: "Feet, Toes, Lymphatic System, and Immune System.",
      wellnessAdvice: "Foot reflexology massage, swimming, and sound healing meditation reset emotional field. Prioritize adequate restful sleep.",
      powerFoods: "Seaweed, berries, hydrating cucumbers, leafy greens, walnuts, and herbal chamomile tea."
    },
    decans: [
      { range: "Feb 19 – Feb 28", subRuler: "Neptune", title: "1st Decan — Pure Neptune", trait: "Deeply mystical, artistic genius, empathetic dreamer." },
      { range: "Mar 01 – Mar 10", subRuler: "Moon", title: "2nd Decan — Cancer Influence", trait: "Highly protective, emotional intelligence, home lover." },
      { range: "Mar 11 – Mar 20", subRuler: "Pluto", title: "3rd Decan — Scorpio Influence", trait: "Intense intuitive power, transformative imagination, magnetic." }
    ]
  }
};

// ─── CHINESE ZODIAC DATA ───────────────────────────────────────────────────────

const CHINESE_ZODIAC = [
  { animal: "Rat", element: "Water", traits: "Quick-witted, charming, resourceful, versatile", icon: "🐀" },
  { animal: "Ox", element: "Earth", traits: "Diligent, dependable, strong, determined", icon: "🐂" },
  { animal: "Tiger", element: "Wood", traits: "Brave, confident, competitive, magnetic", icon: "🐅" },
  { animal: "Rabbit", element: "Wood", traits: "Quiet, elegant, kind, responsible", icon: "🐇" },
  { animal: "Dragon", element: "Earth", traits: "Confident, intelligent, enthusiastic, powerful", icon: "🐉" },
  { animal: "Snake", element: "Fire", traits: "Enigmatic, intelligent, wise, intuitive", icon: "🐍" },
  { animal: "Horse", element: "Fire", traits: "Animated, active, energetic, independent", icon: "🐎" },
  { animal: "Goat", element: "Earth", traits: "Calm, gentle, sympathetic, artistic", icon: "🐐" },
  { animal: "Monkey", element: "Metal", traits: "Sharp, smart, curious, innovative", icon: "🐒" },
  { animal: "Rooster", element: "Metal", traits: "Observant, hardworking, courageous, punctual", icon: "🐓" },
  { animal: "Dog", element: "Earth", traits: "Lovely, honest, prudent, loyal", icon: "🐕" },
  { animal: "Pig", element: "Water", traits: "Compassionate, generous, diligent, calm", icon: "🐖" }
];

// CUSP MAP FOR NEAR-BOUNDARY BIRTHDAYS
const CUSP_DETAILS = [
  { sign1: "Pisces", sign2: "Aries", dates: "Mar 17 - Mar 23", title: "Cusp of Rebirth", description: "Blends Piscean intuitive empathy with Aries courageous initiative. A passionate visionary." },
  { sign1: "Aries", sign2: "Taurus", dates: "Apr 17 - Apr 23", title: "Cusp of Power", description: "Combines Aries fiery drive with Taurus grounded stamina. Unstoppable force of nature." },
  { sign1: "Taurus", sign2: "Gemini", dates: "May 17 - May 23", title: "Cusp of Energy", description: "Blends Taurus practical stability with Gemini intellectual agility. Versatile builder." },
  { sign1: "Gemini", sign2: "Cancer", dates: "Jun 17 - Jun 23", title: "Cusp of Magic", description: "Combines Gemini witty intellect with Cancer emotional intuition. Enchanting communicator." },
  { sign1: "Cancer", sign2: "Leo", dates: "Jul 19 - Jul 25", title: "Cusp of Oscillation", description: "Blends Cancer deep emotional sensitivity with Leo radiant charisma. Heartfelt leader." },
  { sign1: "Leo", sign2: "Virgo", dates: "Aug 19 - Aug 25", title: "Cusp of Exposure", description: "Combines Leo creative flair with Virgo analytical perfectionism. Masterful creator." },
  { sign1: "Virgo", sign2: "Libra", dates: "Sep 19 - Sep 25", title: "Cusp of Beauty", description: "Blends Virgo practical precision with Libra aesthetic harmony. Elegant craftsman." },
  { sign1: "Libra", sign2: "Scorpio", dates: "Oct 19 - Oct 25", title: "Cusp of Drama", description: "Combines Libra social grace with Scorpio magnetic psychological depth." },
  { sign1: "Scorpio", sign2: "Sagittarius", dates: "Nov 18 - Nov 24", title: "Cusp of Revolution", description: "Blends Scorpio intense focus with Sagittarius expansive optimism. Fearless seeker." },
  { sign1: "Sagittarius", sign2: "Capricorn", dates: "Dec 18 - Dec 24", title: "Cusp of Prophecy", description: "Combines Sagittarius philosophical vision with Capricorn disciplined execution." },
  { sign1: "Capricorn", sign2: "Aquarius", dates: "Jan 16 - Jan 22", title: "Cusp of Mystery", description: "Blends Capricorn structural wisdom with Aquarius revolutionary futuristic innovation." },
  { sign1: "Aquarius", sign2: "Pisces", dates: "Feb 15 - Feb 21", title: "Cusp of Sensitivity", description: "Combines Aquarius progressive idealism with Pisces soulful compassion." }
];

// PRESET FAMOUS BIRTHDAYS FOR DEMO
const FAMOUS_PRESETS = [
  { name: "Albert Einstein", date: "1879-03-14", label: "Pisces ♓" },
  { name: "Beyoncé", date: "1981-09-04", label: "Virgo ♍" },
  { name: "Steve Jobs", date: "1955-02-24", label: "Pisces ♓" },
  { name: "Leonardo da Vinci", date: "1452-04-15", label: "Aries ♈" },
  { name: "Taylor Swift", date: "1989-12-13", label: "Sagittarius ♐" },
  { name: "Elon Musk", date: "1971-06-28", label: "Cancer ♋" }
];

// ─── HELPER CALCULATORS ─────────────────────────────────────────────────────

function calculateSunSign(month, day) {
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "Aries";
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "Taurus";
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "Gemini";
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "Cancer";
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "Leo";
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "Virgo";
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "Libra";
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "Scorpio";
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "Sagittarius";
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "Capricorn";
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "Aquarius";
  return "Pisces";
}

function calculateChineseZodiac(year) {
  const baseYear = 1924;
  const index = Math.abs((year - baseYear) % 12);
  const animalData = CHINESE_ZODIAC[index];

  const lastDigit = Math.abs(year % 10);
  let element = "Metal";
  if (lastDigit === 2 || lastDigit === 3) element = "Water";
  else if (lastDigit === 4 || lastDigit === 5) element = "Wood";
  else if (lastDigit === 6 || lastDigit === 7) element = "Fire";
  else if (lastDigit === 8 || lastDigit === 9) element = "Earth";

  return {
    ...animalData,
    yearElement: element,
    fullName: `${element} ${animalData.animal}`
  };
}

function calculateVedicRashi(month, day) {
  let dateObj = new Date(2000, month - 1, day);
  dateObj.setDate(dateObj.getDate() - 24);
  const vMonth = dateObj.getMonth() + 1;
  const vDay = dateObj.getDate();
  const vedicSignName = calculateSunSign(vMonth, vDay);
  return ZODIAC_DATA[vedicSignName];
}

function calculateDecan(month, day, signName) {
  const data = ZODIAC_DATA[signName];
  if (day <= 10) return data.decans[0];
  if (day <= 20) return data.decans[1];
  return data.decans[2];
}

function detectCusp(month, day) {
  for (let cusp of CUSP_DETAILS) {
    if (cusp.dates.includes("Mar") && month === 3 && day >= 17 && day <= 23) return cusp;
    if (cusp.dates.includes("Apr") && month === 4 && day >= 17 && day <= 23) return cusp;
    if (cusp.dates.includes("May") && month === 5 && day >= 17 && day <= 23) return cusp;
    if (cusp.dates.includes("Jun") && month === 6 && day >= 17 && day <= 23) return cusp;
    if (cusp.dates.includes("Jul") && month === 7 && day >= 19 && day <= 25) return cusp;
    if (cusp.dates.includes("Aug") && month === 8 && day >= 19 && day <= 25) return cusp;
    if (cusp.dates.includes("Sep") && month === 9 && day >= 19 && day <= 25) return cusp;
    if (cusp.dates.includes("Oct") && month === 10 && day >= 19 && day <= 25) return cusp;
    if (cusp.dates.includes("Nov") && month === 11 && day >= 18 && day <= 24) return cusp;
    if (cusp.dates.includes("Dec") && month === 12 && day >= 18 && day <= 24) return cusp;
    if (cusp.dates.includes("Jan") && month === 1 && day >= 16 && day <= 22) return cusp;
    if (cusp.dates.includes("Feb") && month === 2 && day >= 15 && day <= 21) return cusp;
  }
  return null;
}

function calculateCompatibility(sign1Name, sign2Name) {
  const sign1 = ZODIAC_DATA[sign1Name];
  const sign2 = ZODIAC_DATA[sign2Name];

  const elem1 = sign1.element;
  const elem2 = sign2.element;

  let baseScore = 70;
  if (elem1 === elem2) baseScore = 92;
  else if (
    (elem1 === "Fire" && elem2 === "Air") ||
    (elem1 === "Air" && elem2 === "Fire") ||
    (elem1 === "Earth" && elem2 === "Water") ||
    (elem1 === "Water" && elem2 === "Earth")
  ) {
    baseScore = 88;
  } else if (
    (elem1 === "Fire" && elem2 === "Water") ||
    (elem1 === "Water" && elem2 === "Fire") ||
    (elem1 === "Earth" && elem2 === "Air") ||
    (elem1 === "Air" && elem2 === "Earth")
  ) {
    baseScore = 62;
  }

  if (sign1.modality === sign2.modality) baseScore -= 4;

  const loveScore = Math.min(99, baseScore + (sign1.loveStyle?.bestMatches?.includes(sign2Name) ? 8 : 0));
  const commScore = Math.min(98, baseScore - 3 + (elem1 === "Air" || elem2 === "Air" ? 7 : 0));
  const emotionalScore = Math.min(99, baseScore + (elem1 === "Water" || elem2 === "Water" ? 6 : 0));
  const marriageScore = Math.min(97, Math.round((loveScore + commScore + emotionalScore) / 3));

  return {
    overallScore: loveScore,
    loveScore,
    commScore,
    emotionalScore,
    marriageScore,
    harmonyType: loveScore >= 85 ? "Soulmate Dynamics ✨" : loveScore >= 75 ? "High Harmony 💖" : "Growth & Learning Potential 🌱",
    summary: `${sign1Name} (${sign1.element}) & ${sign2Name} (${sign2.element}) create a ${loveScore >= 85
        ? "naturally magnetic and harmonious bond with deep mutual understanding."
        : "dynamic relationship rich in complementary growth and exciting learning opportunities."
      }`
  };
}

// ─── HIGH-DPI CANVAS IMAGE GENERATOR (BULLETPROOF FALLBACK) ─────────────────

const generateCustomZodiacCanvas = (info, isDark) => {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 750;
  const ctx = canvas.getContext("2d");

  const z = info.sunSign;

  // Background Gradient
  if (isDark) {
    const bgGrad = ctx.createLinearGradient(0, 0, 1200, 750);
    bgGrad.addColorStop(0, "#0b0f19");
    bgGrad.addColorStop(0.5, "#111827");
    bgGrad.addColorStop(1, "#030712");
    ctx.fillStyle = bgGrad;
  } else {
    const bgGrad = ctx.createLinearGradient(0, 0, 1200, 750);
    bgGrad.addColorStop(0, "#f8fafc");
    bgGrad.addColorStop(0.5, "#f1f5f9");
    bgGrad.addColorStop(1, "#e2e8f0");
    ctx.fillStyle = bgGrad;
  }
  ctx.fillRect(0, 0, 1200, 750);

  // Outer Frame
  ctx.lineWidth = 4;
  ctx.strokeStyle = isDark ? "rgba(245, 158, 11, 0.4)" : "rgba(217, 119, 6, 0.4)";
  ctx.strokeRect(30, 30, 1140, 690);

  // Card Inner Fill
  ctx.fillStyle = isDark ? "rgba(15, 23, 42, 0.9)" : "rgba(255, 255, 255, 0.95)";
  ctx.fillRect(40, 40, 1120, 670);

  // Top Banner Strip
  const lineGrad = ctx.createLinearGradient(40, 40, 1160, 40);
  lineGrad.addColorStop(0, "#d97706");
  lineGrad.addColorStop(0.5, "#9333ea");
  lineGrad.addColorStop(1, "#0284c7");
  ctx.fillStyle = lineGrad;
  ctx.fillRect(40, 40, 1120, 8);

  // Symbol
  ctx.font = "bold 90px sans-serif";
  ctx.fillStyle = isDark ? "#f59e0b" : "#b45309";
  ctx.fillText(z.symbol, 70, 140);

  // Sign Name & Subtitle
  ctx.font = "bold 44px sans-serif";
  ctx.fillStyle = isDark ? "#ffffff" : "#0f172a";
  ctx.fillText(z.name, 180, 115);

  ctx.font = "500 20px sans-serif";
  ctx.fillStyle = isDark ? "#94a3b8" : "#475569";
  ctx.fillText(`${z.sanskritName} • ${z.dates}`, 180, 148);

  // Motto
  ctx.font = "italic 22px serif";
  ctx.fillStyle = isDark ? "#fde68a" : "#b45309";
  ctx.fillText(`"${z.motto}"`, 70, 200);

  // Badges
  ctx.font = "bold 16px sans-serif";
  ctx.fillStyle = isDark ? "#fbbf24" : "#d97706";
  ctx.fillText(`${z.element} Element  •  ${z.modality} Quality  •  Age ${info.ageYears} yrs`, 70, 235);

  // Horizontal Divider Line
  ctx.strokeStyle = isDark ? "#334155" : "#cbd5e1";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(70, 260);
  ctx.lineTo(1130, 260);
  ctx.stroke();

  // Grid Box 1: Ruling Planet
  ctx.fillStyle = isDark ? "#1e293b" : "#f1f5f9";
  ctx.fillRect(70, 280, 240, 100);
  ctx.font = "bold 13px sans-serif";
  ctx.fillStyle = isDark ? "#94a3b8" : "#64748b";
  ctx.fillText("RULING PLANET", 85, 305);
  ctx.font = "bold 18px sans-serif";
  ctx.fillStyle = isDark ? "#fde047" : "#b45309";
  ctx.fillText(z.ruler, 85, 345);

  // Grid Box 2: Chinese Zodiac
  ctx.fillStyle = isDark ? "#1e293b" : "#f1f5f9";
  ctx.fillRect(335, 280, 240, 100);
  ctx.font = "bold 13px sans-serif";
  ctx.fillStyle = isDark ? "#94a3b8" : "#64748b";
  ctx.fillText("CHINESE ZODIAC", 350, 305);
  ctx.font = "bold 18px sans-serif";
  ctx.fillStyle = isDark ? "#67e8f9" : "#0284c7";
  ctx.fillText(`${info.chineseZodiac.icon} ${info.chineseZodiac.fullName}`, 350, 345);

  // Grid Box 3: Vedic Rashi
  ctx.fillStyle = isDark ? "#1e293b" : "#f1f5f9";
  ctx.fillRect(600, 280, 240, 100);
  ctx.font = "bold 13px sans-serif";
  ctx.fillStyle = isDark ? "#94a3b8" : "#64748b";
  ctx.fillText("VEDIC RASHI", 615, 305);
  ctx.font = "bold 18px sans-serif";
  ctx.fillStyle = isDark ? "#6ee7b7" : "#047857";
  ctx.fillText(info.vedicRashi.name, 615, 345);

  // Grid Box 4: Birthstone
  ctx.fillStyle = isDark ? "#1e293b" : "#f1f5f9";
  ctx.fillRect(865, 280, 240, 100);
  ctx.font = "bold 13px sans-serif";
  ctx.fillStyle = isDark ? "#94a3b8" : "#64748b";
  ctx.fillText("BIRTHSTONE", 880, 305);
  ctx.font = "bold 18px sans-serif";
  ctx.fillStyle = isDark ? "#c084fc" : "#6b21a8";
  ctx.fillText(z.birthstone.split("&")[0].trim(), 880, 345);

  // Overview Section Title
  ctx.font = "bold 20px sans-serif";
  ctx.fillStyle = isDark ? "#ffffff" : "#0f172a";
  ctx.fillText("Astrological Profile Overview", 70, 420);

  ctx.font = "16px sans-serif";
  ctx.fillStyle = isDark ? "#cbd5e1" : "#334155";

  // Text Wrapping
  const words = z.overview.split(" ");
  let line = "";
  let y = 455;
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);
    if (metrics.width > 1030 && n > 0) {
      ctx.fillText(line, 70, y);
      line = words[n] + " ";
      y += 26;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, 70, y);

  // Strengths
  y += 45;
  ctx.font = "bold 18px sans-serif";
  ctx.fillStyle = isDark ? "#6ee7b7" : "#047857";
  ctx.fillText("Key Strengths: " + z.strengths.slice(0, 3).join(" • "), 70, y);

  // Watermark
  ctx.fillStyle = isDark ? "#64748b" : "#94a3b8";
  ctx.font = "14px sans-serif";
  ctx.fillText("ToolsTrek Zodiac Sign Calculator • toolstrek.vercel.app", 70, 680);

  return canvas.toDataURL("image/png");
};

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function ZodiacSignCalculator() {
  // Form State
  const [birthDate, setBirthDate] = useState("1998-07-15");
  const [birthTime, setBirthTime] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  // Compatibility Checker State
  const [partnerSign, setPartnerSign] = useState("Leo");

  const cardRef = useRef(null);

  // Parse birth date
  const parsedDateInfo = useMemo(() => {
    if (!birthDate) return null;
    const parts = birthDate.split("-");
    if (parts.length !== 3) return null;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);

    if (isNaN(year) || isNaN(month) || isNaN(day)) return null;

    const sunSignName = calculateSunSign(month, day);
    const zodiacInfo = ZODIAC_DATA[sunSignName];
    const chineseInfo = calculateChineseZodiac(year);
    const vedicInfo = calculateVedicRashi(month, day);
    const decanInfo = calculateDecan(month, day, sunSignName);
    const cuspInfo = detectCusp(month, day);

    const today = new Date();
    let ageYears = today.getFullYear() - year;
    const mDiff = today.getMonth() + 1 - month;
    if (mDiff < 0 || (mDiff === 0 && today.getDate() < day)) {
      ageYears--;
    }

    return {
      year,
      month,
      day,
      ageYears,
      sunSign: zodiacInfo,
      chineseZodiac: chineseInfo,
      vedicRashi: vedicInfo,
      decan: decanInfo,
      cusp: cuspInfo
    };
  }, [birthDate]);

  const compatibilityResult = useMemo(() => {
    if (!parsedDateInfo) return null;
    return calculateCompatibility(parsedDateInfo.sunSign.name, partnerSign);
  }, [parsedDateInfo, partnerSign]);

  const handleCopySummary = () => {
    if (!parsedDateInfo) return;
    const z = parsedDateInfo.sunSign;
    const text = `🌟 Zodiac Profile for ${birthDate}:\n• Sun Sign: ${z.name} ${z.symbol} (${z.element} | ${z.modality})\n• Ruling Planet: ${z.ruler}\n• Motto: "${z.motto}"\n• Chinese Zodiac: ${parsedDateInfo.chineseZodiac.fullName} ${parsedDateInfo.chineseZodiac.icon}\n• Vedic Rashi: ${parsedDateInfo.vedicRashi.name}\n• Lucky Numbers: ${z.luckyNumbers.join(", ")}\n• Lucky Colors: ${z.luckyColors.join(", ")}\nCalculated with ToolsTrek Zodiac Sign Calculator!`;

    navigator.clipboard.writeText(text);
    toast.success("Zodiac profile copied to clipboard!");
  };

  const handleExportCard = async () => {
    if (!parsedDateInfo) return;
    try {
      toast.info("Generating high-res Zodiac card...");
      const isDark = document.documentElement.classList.contains("dark");

      let imageData = null;

      // Try html2canvas with safety fallbacks
      try {
        if (cardRef.current && typeof window !== "undefined") {
          const canvas = await html2canvas(cardRef.current, {
            backgroundColor: isDark ? "#0f172a" : "#ffffff",
            scale: 2,
            useCORS: true,
            logging: false
          });
          if (canvas) {
            imageData = canvas.toDataURL("image/png");
          }
        }
      } catch (e) {
        console.warn("html2canvas fallback activated:", e);
      }

      // Guaranteed Canvas Fallback if html2canvas fails for modern CSS reasons
      if (!imageData) {
        imageData = generateCustomZodiacCanvas(parsedDateInfo, isDark);
      }

      const link = document.createElement("a");
      link.href = imageData;
      link.download = `Zodiac_${parsedDateInfo.sunSign.name}_Profile.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Zodiac Card downloaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate image card.");
    }
  };

  const handleQuickPreset = (dateStr) => {
    setBirthDate(dateStr);
    toast.success("Date updated!");
  };

  return (
    <ToolPageShell widthClassName="max-w-7xl">
      <div className="space-y-8 text-slate-900 dark:text-white min-h-screen pb-12 transition-colors duration-200">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-amber-600 via-purple-600 to-indigo-600 dark:from-amber-200 dark:via-purple-300 dark:to-cyan-300 bg-clip-text text-transparent flex items-center gap-2">
                Zodiac Sign Calculator <Sparkles className="w-6 h-6 text-amber-500 dark:text-amber-400 animate-pulse" />
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Discover your Sun sign, Vedic Rashi, Chinese Zodiac, Decans, Cusps & deep astrological personality matrix.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FavoriteButton toolName="Zodiac Sign Calculator" />
          </div>
        </div>

        {/* Input & Calculator Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Birth Date Picker Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-2xl space-y-5">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-300 font-semibold text-lg border-b border-slate-200 dark:border-slate-800 pb-3">
                <Calendar className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                <span>Enter Your Birth Details</span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-2">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700 focus:border-amber-500 dark:focus:border-amber-400 focus:ring-1 focus:ring-amber-500 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-base outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-2 flex items-center justify-between">
                    <span>Birth Time (Optional)</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">Enhances precision</span>
                  </label>
                  <input
                    type="time"
                    value={birthTime}
                    onChange={(e) => setBirthTime(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700 focus:border-amber-500 dark:focus:border-amber-400 focus:ring-1 focus:ring-amber-500 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-base outline-none transition"
                  />
                </div>
              </div>

              {/* Quick Preset Celebrity Buttons */}
              <div className="pt-2">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block mb-2">Famous Personalities Preset:</span>
                <div className="flex flex-wrap gap-2">
                  {FAMOUS_PRESETS.map((item) => (
                    <button
                      key={item.name}
                      onClick={() => handleQuickPreset(item.date)}
                      className="px-2.5 py-1 text-xs bg-slate-100 dark:bg-slate-800/80 hover:bg-amber-100 dark:hover:bg-amber-500/20 hover:border-amber-300 dark:hover:border-amber-500/50 border border-slate-200 dark:border-slate-700 rounded-lg transition text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                    >
                      {item.name} ({item.label})
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Interactive 12 Sign Selector Wheel Grid */}
            <div className="bg-white dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xl shadow-slate-200/50 dark:shadow-2xl space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">
                <span>Explore All 12 Signs</span>
                <Sparkle className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {Object.keys(ZODIAC_DATA).map((signKey) => {
                  const sData = ZODIAC_DATA[signKey];
                  const isSelected = parsedDateInfo?.sunSign.name === signKey;
                  return (
                    <button
                      key={signKey}
                      onClick={() => {
                        const sampleDates = {
                          Aries: "1998-04-05", Taurus: "1998-05-05", Gemini: "1998-06-05",
                          Cancer: "1998-07-05", Leo: "1998-08-05", Virgo: "1998-09-05",
                          Libra: "1998-10-05", Scorpio: "1998-11-05", Sagittarius: "1998-12-05",
                          Capricorn: "1998-01-05", Aquarius: "1998-02-05", Pisces: "1998-03-05"
                        };
                        setBirthDate(sampleDates[signKey]);
                      }}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition ${isSelected
                          ? "bg-amber-100 dark:bg-amber-500/20 border-amber-400 text-amber-900 dark:text-amber-300 font-bold shadow-md scale-105"
                          : "bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                        }`}
                    >
                      <span className="text-xl mb-0.5">{sData.symbol}</span>
                      <span className="text-[10px] font-medium leading-tight">{sData.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Result Card Hero Banner */}
          <div className="lg:col-span-7">
            {parsedDateInfo && (
              <div
                ref={cardRef}
                className={`relative overflow-hidden ${parsedDateInfo.sunSign.colorTheme.heroBg} border ${parsedDateInfo.sunSign.colorTheme.border} rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-2xl transition-all duration-300`}
                style={{
                  boxShadow: `0 0 40px ${parsedDateInfo.sunSign.colorTheme.bgGlow}`
                }}
              >
                {/* Background Ambient Glow Accent */}
                <div
                  className={`absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-25 dark:opacity-30 bg-gradient-to-br ${parsedDateInfo.sunSign.colorTheme.gradient}`}
                />

                <div className="relative z-10 space-y-6">
                  {/* Top Bar: Age & Duality */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className={`px-3 py-1 rounded-full border text-xs font-semibold ${parsedDateInfo.sunSign.colorTheme.badgeBg}`}>
                      {parsedDateInfo.sunSign.element} Element • {parsedDateInfo.sunSign.modality} Quality
                    </span>
                    <span className="text-slate-600 dark:text-slate-400 font-mono">
                      Age: {parsedDateInfo.ageYears} yrs • {parsedDateInfo.sunSign.duality}
                    </span>
                  </div>

                  {/* Hero Title & Symbol */}
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="text-6xl sm:text-7xl font-bold filter drop-shadow-sm select-none text-slate-900 dark:text-white">
                          {parsedDateInfo.sunSign.symbol}
                        </span>
                        <div>
                          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                            {parsedDateInfo.sunSign.name}
                          </h2>
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mt-0.5">
                            {parsedDateInfo.sunSign.sanskritName} • {parsedDateInfo.sunSign.dates}
                          </p>
                        </div>
                      </div>
                      <p className="italic text-amber-700 dark:text-amber-200/90 text-sm mt-3 font-serif">
                        &quot;{parsedDateInfo.sunSign.motto}&quot;
                      </p>
                    </div>

                    {/* Quick Decan Badge */}
                    <div className="hidden sm:flex flex-col items-end bg-white/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 p-3 rounded-xl text-right backdrop-blur-sm">
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 uppercase font-semibold">Decan & Sub-Ruler</span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">{parsedDateInfo.decan.subRuler} Sub-Ruler</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{parsedDateInfo.decan.range}</span>
                    </div>
                  </div>

                  {/* Summary Metric Chips */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-200/80 dark:border-slate-800/80">
                    <div className="bg-white/70 dark:bg-slate-950/50 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800/60">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-medium">Ruling Planet</span>
                      <span className="text-xs font-semibold text-amber-700 dark:text-amber-300 flex items-center gap-1 mt-0.5">
                        <Sun className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" /> {parsedDateInfo.sunSign.ruler}
                      </span>
                    </div>

                    <div className="bg-white/70 dark:bg-slate-950/50 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800/60">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-medium">Chinese Zodiac</span>
                      <span className="text-xs font-semibold text-cyan-700 dark:text-cyan-300 flex items-center gap-1 mt-0.5">
                        <span>{parsedDateInfo.chineseZodiac.icon}</span> {parsedDateInfo.chineseZodiac.fullName}
                      </span>
                    </div>

                    <div className="bg-white/70 dark:bg-slate-950/50 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800/60">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-medium">Vedic Rashi</span>
                      <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-1 mt-0.5">
                        <Moon className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" /> {parsedDateInfo.vedicRashi.name}
                      </span>
                    </div>

                    <div className="bg-white/70 dark:bg-slate-950/50 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800/60">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-medium">Birthstone</span>
                      <span className="text-xs font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-1 mt-0.5">
                        <Sparkles className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" /> {parsedDateInfo.sunSign.birthstone.split("&")[0]}
                      </span>
                    </div>
                  </div>

                  {/* Actions: Copy & Export */}
                  <div className="flex flex-wrap items-center justify-end gap-3 pt-3">
                    <button
                      onClick={handleCopySummary}
                      className="px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 flex items-center gap-1.5 transition"
                    >
                      <Copy className="w-3.5 h-3.5" /> Copy Summary
                    </button>
                    <button
                      onClick={handleExportCard}
                      className="px-3.5 py-2 rounded-xl text-xs font-medium bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition"
                    >
                      <Download className="w-3.5 h-3.5" /> Export PNG Card
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Detailed Tabs & Analysis Section */}
        {parsedDateInfo && (
          <div className="space-y-6">
            {/* Tab Nav Buttons */}
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              {[
                { id: "overview", label: "🌟 Overview & Symbolism", icon: Star },
                { id: "traits", label: "🧠 Personality & Psychology", icon: UserCheck },
                { id: "love", label: "💖 Love & Relationships", icon: Heart },
                { id: "career", label: "💼 Career & Wealth", icon: Briefcase },
                { id: "health", label: "🌿 Health & Wellness", icon: Activity },
                { id: "compatibility", label: "🔮 Compatibility Checker", icon: Compass }
              ].map((tab) => {
                const IconComponent = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition ${active
                        ? "bg-amber-100 dark:bg-slate-800 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-slate-700 shadow-sm"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900/60"
                      }`}
                  >
                    <IconComponent className={`w-4 h-4 ${active ? "text-amber-600 dark:text-amber-400" : "text-slate-400"}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB CONTENT 1: OVERVIEW */}
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Main Overview Text */}
                <div className="md:col-span-8 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-md dark:shadow-xl space-y-5">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                    <span>{parsedDateInfo.sunSign.name} Essence & Astrological Portrait</span>
                  </h3>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
                    {parsedDateInfo.sunSign.overview}
                  </p>

                  {/* Cusp Alert if Born near boundary */}
                  {parsedDateInfo.cusp && (
                    <div className="bg-amber-50 dark:bg-gradient-to-r dark:from-amber-500/10 dark:via-purple-500/10 dark:to-transparent border border-amber-200 dark:border-amber-500/30 rounded-xl p-4 space-y-2">
                      <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-sm">
                        <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <span>Born on a Zodiac Cusp: {parsedDateInfo.cusp.title} ({parsedDateInfo.cusp.dates})</span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                        {parsedDateInfo.cusp.description}
                      </p>
                    </div>
                  )}

                  {/* Decan Breakdown Card */}
                  <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
                    <h4 className="text-xs font-semibold uppercase text-amber-700 dark:text-amber-300 tracking-wider">
                      Decan Analysis ({parsedDateInfo.decan.title})
                    </h4>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {parsedDateInfo.decan.trait}
                    </p>
                  </div>
                </div>

                {/* Quick Facts Sidebar */}
                <div className="md:col-span-4 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-md dark:shadow-xl space-y-4">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                    <span>Astrological Correspondences</span>
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                      <span className="text-slate-500 dark:text-slate-400">Spirit Animal</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{parsedDateInfo.sunSign.spiritAnimal}</span>
                    </div>

                    <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                      <span className="text-slate-500 dark:text-slate-400">Tarot Card</span>
                      <span className="font-semibold text-purple-700 dark:text-purple-300">{parsedDateInfo.sunSign.tarotCard}</span>
                    </div>

                    <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                      <span className="text-slate-500 dark:text-slate-400">Astrological House</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{parsedDateInfo.sunSign.house}</span>
                    </div>

                    <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                      <span className="text-slate-500 dark:text-slate-400">Lucky Numbers</span>
                      <span className="font-semibold text-amber-700 dark:text-amber-300">{parsedDateInfo.sunSign.luckyNumbers.join(", ")}</span>
                    </div>

                    <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                      <span className="text-slate-500 dark:text-slate-400">Lucky Colors</span>
                      <span className="font-semibold text-emerald-700 dark:text-emerald-300">{parsedDateInfo.sunSign.luckyColors.join(", ")}</span>
                    </div>

                    <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                      <span className="text-slate-500 dark:text-slate-400">Lucky Day</span>
                      <span className="font-semibold text-cyan-700 dark:text-cyan-300">{parsedDateInfo.sunSign.luckyDays.join(", ")}</span>
                    </div>

                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-500 dark:text-slate-400">Sacred Flower</span>
                      <span className="font-semibold text-pink-700 dark:text-pink-300">{parsedDateInfo.sunSign.flower}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: PERSONALITY */}
            {activeTab === "traits" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Strengths Card */}
                <div className="bg-white dark:bg-slate-900/80 border border-emerald-200 dark:border-emerald-500/30 rounded-2xl p-6 shadow-md dark:shadow-xl space-y-4">
                  <h3 className="text-lg font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <span>Core Strengths & Virtues</span>
                  </h3>
                  <ul className="space-y-2.5">
                    {parsedDateInfo.sunSign.strengths.map((str, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-200">
                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Challenges Card */}
                <div className="bg-white dark:bg-slate-900/80 border border-amber-200 dark:border-amber-500/30 rounded-2xl p-6 shadow-md dark:shadow-xl space-y-4">
                  <h3 className="text-lg font-bold text-amber-800 dark:text-amber-300 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    <span>Growth Areas & Challenges</span>
                  </h3>
                  <ul className="space-y-2.5">
                    {parsedDateInfo.sunSign.weaknesses.map((wk, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-200">
                        <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <span>{wk}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Inner Motivation & Fear */}
                <div className="md:col-span-2 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-md dark:shadow-xl grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Core Desire</span>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{parsedDateInfo.sunSign.coreDesires}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Secret Fear</span>
                    <p className="text-sm font-medium text-purple-700 dark:text-purple-300">{parsedDateInfo.sunSign.secretFear}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Communication Style</span>
                    <p className="text-sm font-medium text-cyan-700 dark:text-cyan-300">{parsedDateInfo.sunSign.communicationStyle}</p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 3: LOVE & RELATIONSHIPS */}
            {activeTab === "love" && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-8 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-md dark:shadow-xl space-y-5">
                  <h3 className="text-xl font-bold text-pink-700 dark:text-pink-300 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                    <span>Love Dynamics & Romantic Style</span>
                  </h3>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
                    {parsedDateInfo.sunSign.loveStyle.description}
                  </p>

                  <div className="bg-pink-50 dark:bg-slate-950/60 border border-pink-200 dark:border-slate-800 rounded-xl p-4 space-y-2">
                    <span className="text-xs text-pink-800 dark:text-amber-400 font-semibold uppercase block">Ideal Date Experience</span>
                    <p className="text-xs text-slate-700 dark:text-slate-300">{parsedDateInfo.sunSign.loveStyle.idealDate}</p>
                  </div>
                </div>

                <div className="md:col-span-4 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-md dark:shadow-xl space-y-4">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3">Zodiac Compatibility</h3>

                  <div>
                    <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold block mb-2">Best Romantic Matches</span>
                    <div className="flex flex-wrap gap-2">
                      {parsedDateInfo.sunSign.loveStyle.bestMatches.map((m) => (
                        <span key={m} className="px-2.5 py-1 text-xs bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 rounded-lg font-medium">
                          {m} {ZODIAC_DATA[m]?.symbol}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2">
                    <span className="text-xs text-amber-700 dark:text-amber-400 font-semibold block mb-2">Challenging Matches (Growth)</span>
                    <div className="flex flex-wrap gap-2">
                      {parsedDateInfo.sunSign.loveStyle.challengingMatches.map((m) => (
                        <span key={m} className="px-2.5 py-1 text-xs bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 rounded-lg font-medium">
                          {m} {ZODIAC_DATA[m]?.symbol}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 4: CAREER & WEALTH */}
            {activeTab === "career" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-md dark:shadow-xl space-y-4">
                  <h3 className="text-lg font-bold text-cyan-700 dark:text-cyan-300 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                    <span>Top Career Paths</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {parsedDateInfo.sunSign.careerWealth.bestCareers.map((c, i) => (
                      <span key={i} className="px-3 py-1.5 text-xs bg-cyan-50 dark:bg-cyan-500/10 text-cyan-800 dark:text-cyan-200 border border-cyan-200 dark:border-cyan-500/20 rounded-xl font-medium">
                        {c}
                      </span>
                    ))}
                  </div>
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Workplace Style</span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {parsedDateInfo.sunSign.careerWealth.workStyle}
                    </p>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-md dark:shadow-xl space-y-4">
                  <h3 className="text-lg font-bold text-amber-800 dark:text-amber-300 flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    <span>Wealth & Money Tendencies</span>
                  </h3>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {parsedDateInfo.sunSign.careerWealth.moneyHabits}
                  </p>
                </div>
              </div>
            )}

            {/* TAB CONTENT 5: HEALTH & WELLNESS */}
            {activeTab === "health" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-md dark:shadow-xl space-y-3">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase block">Ruled Body Regions</span>
                  <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">{parsedDateInfo.sunSign.healthWellness.ruledBodyParts}</p>
                </div>

                <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-md dark:shadow-xl space-y-3">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase block">Wellness & Vitality Advice</span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{parsedDateInfo.sunSign.healthWellness.wellnessAdvice}</p>
                </div>

                <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-md dark:shadow-xl space-y-3">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase block">Recommended Power Foods</span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{parsedDateInfo.sunSign.healthWellness.powerFoods}</p>
                </div>
              </div>
            )}

            {/* TAB CONTENT 6: INTERACTIVE COMPATIBILITY CHECKER */}
            {activeTab === "compatibility" && (
              <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-md dark:shadow-xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Compass className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                      <span>Instant Zodiac Compatibility Matcher</span>
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      Compare {parsedDateInfo.sunSign.name} against any partner sign for love, communication, and emotional harmony.
                    </p>
                  </div>

                  {/* Select Partner Sign */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Partner Sign:</span>
                    <select
                      value={partnerSign}
                      onChange={(e) => setPartnerSign(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-amber-800 dark:text-amber-300 font-semibold outline-none focus:border-amber-500"
                    >
                      {Object.keys(ZODIAC_DATA).map((s) => (
                        <option key={s} value={s}>
                          {s} {ZODIAC_DATA[s].symbol}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Compatibility Result Breakdown */}
                {compatibilityResult && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      {/* Overall Score */}
                      <div className="bg-amber-50/60 dark:bg-slate-950/80 border border-amber-200 dark:border-amber-500/30 rounded-xl p-4 text-center">
                        <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold block">Overall Match</span>
                        <span className="text-3xl font-extrabold text-amber-700 dark:text-amber-300 mt-1 block">
                          {compatibilityResult.overallScore}%
                        </span>
                        <span className="text-[10px] text-amber-800 dark:text-amber-400/90 mt-1 block font-medium">
                          {compatibilityResult.harmonyType}
                        </span>
                      </div>

                      {/* Romance Score */}
                      <div className="bg-pink-50/60 dark:bg-slate-950/80 border border-pink-200 dark:border-pink-500/30 rounded-xl p-4 text-center">
                        <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold block">Romantic Chemistry</span>
                        <span className="text-3xl font-extrabold text-pink-700 dark:text-pink-300 mt-1 block">
                          {compatibilityResult.loveScore}%
                        </span>
                        <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
                          <div className="bg-pink-500 h-full rounded-full" style={{ width: `${compatibilityResult.loveScore}%` }} />
                        </div>
                      </div>

                      {/* Communication Score */}
                      <div className="bg-cyan-50/60 dark:bg-slate-950/80 border border-cyan-200 dark:border-cyan-500/30 rounded-xl p-4 text-center">
                        <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold block">Communication</span>
                        <span className="text-3xl font-extrabold text-cyan-700 dark:text-cyan-300 mt-1 block">
                          {compatibilityResult.commScore}%
                        </span>
                        <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
                          <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${compatibilityResult.commScore}%` }} />
                        </div>
                      </div>

                      {/* Long-term Potential */}
                      <div className="bg-emerald-50/60 dark:bg-slate-950/80 border border-emerald-200 dark:border-emerald-500/30 rounded-xl p-4 text-center">
                        <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold block">Marriage & Stability</span>
                        <span className="text-3xl font-extrabold text-emerald-700 dark:text-emerald-300 mt-1 block">
                          {compatibilityResult.marriageScore}%
                        </span>
                        <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
                          <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${compatibilityResult.marriageScore}%` }} />
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                      {compatibilityResult.summary}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* SEO & Informational FAQ Article Section */}
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-md dark:shadow-xl space-y-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Understanding Your Zodiac Sign & Astrological Blueprint</h2>
          <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-4 leading-relaxed">
            <p>
              Astrology is an ancient system of self-discovery that maps the relative positions of celestial bodies at the exact moment of your birth. Your <strong>Sun Sign</strong> represents your core personality, vital spirit, and essential self-expression.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <h4 className="font-bold text-amber-800 dark:text-amber-300 text-sm mb-1">What is a Zodiac Decan?</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Each 30-degree zodiac sign is split into three 10-degree subdivisions called Decans. Based on the day of the month you were born, your sign is co-ruled by a secondary planetary influence, providing nuanced insights into your personality.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <h4 className="font-bold text-cyan-800 dark:text-cyan-300 text-sm mb-1">What is a Zodiac Cusp?</h4>
                <p className="text-xs text-slate-400">
                  If you were born within 3 days of the transition date between two zodiac signs, you were born on a &quot;Cusp.&quot; Cusp individuals often display a blend of traits from both neighboring signs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolPageShell>
  );
}
