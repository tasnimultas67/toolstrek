"use client";

import React, { useState, useEffect, useMemo } from "react";
import ToolPageShell from "../ToolPageShell";
import { jsPDF } from "jspdf";
import {
  Stethoscope,
  Heart,
  Activity,
  ShieldAlert,
  ShieldCheck,
  Download,
  Printer,
  Copy,
  Check,
  Plus,
  Trash2,
  Edit3,
  Settings,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Info,
  Calendar,
  Clock,
  User,
  HeartPulse,
  Dna,
  FileText,
  Sparkles,
  RefreshCw,
  Layers,
  CheckCircle2,
  XCircle,
  Share2,
  HelpCircle,
  Pill,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Sliders,
  CheckSquare,
  Square,
  Zap,
  Droplet,
  Utensils,
  Moon,
  Scale,
  Smile,
  X,
  PlusCircle
} from "lucide-react";

// ─── DOMAIN CONFIG ─────────────────────────────────────────────────────────────
const SITE_DOMAIN = "toolstrek.vercel.app";
const SITE_URL = `https://${SITE_DOMAIN}`;

// ─── DEMO PRESETS ──────────────────────────────────────────────────────────────
const DEMO_PRESETS = [
  {
    id: "alex",
    label: "Alex Johnson (38, Male, Executive)",
    data: {
      name: "Alex Johnson",
      age: 38,
      gender: "male",
      bloodGroup: "O+",
      unitSystem: "metric",
      weightKg: 84,
      heightCm: 178,
      weightLbs: 185,
      heightFeet: 5,
      heightInches: 10,
      waistCm: 92,
      smoking: "former",
      alcohol: "moderate",
      exercise: "light",
      sleepHours: "5_6",
      sleepQuality: "snoring",
      dietPattern: "fast_food",
      stressLevel: "high",
      sunExposure: "low",
      occupation: "desk_worker",
      symptoms: ["fatigue", "chest_tightness", "blurry_vision"],
      familyHistory: ["heart_disease", "diabetes", "colorectal_cancer", "hypertension"],
      existingConditions: ["hypertension", "fatty_liver"],
      lastCheckup: "more_than_2_years",
      currentMeds: "Lisinopril 10mg daily, Omega-3 Fish Oil",
      allergies: "Penicillin (Mild rash)",
      userNotes: "Discuss persistent afternoon fatigue, elevated BP during stressful weeks, and schedule a cardiac evaluation.",
    },
  },
  {
    id: "sarah",
    label: "Sarah Lin (46, Female, Active)",
    data: {
      name: "Sarah Lin",
      age: 46,
      gender: "female",
      bloodGroup: "A+",
      unitSystem: "metric",
      weightKg: 63,
      heightCm: 165,
      weightLbs: 139,
      heightFeet: 5,
      heightInches: 5,
      waistCm: 76,
      smoking: "never",
      alcohol: "occasional",
      exercise: "moderate",
      sleepHours: "7_8",
      sleepQuality: "restful",
      dietPattern: "balanced",
      stressLevel: "moderate",
      sunExposure: "moderate",
      occupation: "desk_worker",
      symptoms: ["joint_pain", "hair_loss"],
      familyHistory: ["breast_cancer", "thyroid", "osteoporosis"],
      existingConditions: ["thyroid_disorder"],
      lastCheckup: "1_2_years",
      currentMeds: "Levothyroxine 50mcg, Vitamin D3 2000 IU",
      allergies: "None known",
      userNotes: "Review annual mammogram schedule, bone density baseline, and thyroid hormone dosage.",
    },
  },
  {
    id: "robert",
    label: "Robert Davis (67, Male, Senior)",
    data: {
      name: "Robert Davis",
      age: 67,
      gender: "male",
      bloodGroup: "B+",
      unitSystem: "metric",
      weightKg: 89,
      heightCm: 172,
      weightLbs: 196,
      heightFeet: 5,
      heightInches: 8,
      waistCm: 104,
      smoking: "former",
      alcohol: "none",
      exercise: "light",
      sleepHours: "5_6",
      sleepQuality: "restless",
      dietPattern: "high_sodium",
      stressLevel: "low",
      sunExposure: "moderate",
      occupation: "retired",
      symptoms: ["joint_pain", "shortness_breath", "frequent_urination"],
      familyHistory: ["heart_disease", "stroke", "prostate_cancer", "glaucoma"],
      existingConditions: ["hypertension", "diabetes", "heart_disease", "osteoarthritis"],
      lastCheckup: "within_year",
      currentMeds: "Metformin 500mg BID, Amlodipine 5mg, Atorvastatin 20mg",
      allergies: "Sulfa antibiotics",
      userNotes: "Annual cardiovascular stress review, diabetic retinal scan, PSA velocity, and bone/joint arthritis management.",
    },
  }
];

// ─── MASTER MEDICAL CHECKUP DATABASE (36 EVIDENCE-BASED SCREENINGS) ─────────
const CHECKUP_DATABASE = [
  // ── 1. CARDIOVASCULAR & HEMODYNAMIC ──────────────────────────────────────────
  {
    id: "blood_pressure",
    name: "Comprehensive Blood Pressure & Hemodynamic Profile",
    category: "Cardiovascular",
    icon: "❤️",
    prep: "no_caffeine",
    prepLabel: "Rest 5m, avoid caffeine/nicotine 30m prior",
    urgency: "routine",
    description: "Evaluates systolic/diastolic arterial pressures to screen for prehypertension, primary hypertension, and cardiovascular strain.",
    frequency: "At least once annually (every 3–6 months if hypertensive or at risk)",
    biomarkers: "Systolic BP (<120 mmHg), Diastolic BP (<80 mmHg), Resting Heart Rate (60–100 bpm)",
    conditions: () => true,
    priority: (d) => {
      let p = 4;
      if (d.existingConditions?.includes("hypertension")) p += 6;
      if (d.existingConditions?.includes("heart_disease")) p += 5;
      if (d.familyHistory?.includes("hypertension") || d.familyHistory?.includes("heart_disease")) p += 3;
      if (d.smoking !== "never") p += 2;
      if (parseInt(d.age) >= 40) p += 2;
      if (d.symptoms?.includes("chest_tightness") || d.symptoms?.includes("headaches")) p += 4;
      return p;
    },
    whyRecommended: (d) => {
      const r = ["Essential baseline cardiovascular monitoring for all adults."];
      if (d.existingConditions?.includes("hypertension")) r.push("You have diagnosed hypertension requiring continuous monitoring.");
      if (d.familyHistory?.includes("heart_disease") || d.familyHistory?.includes("hypertension")) r.push("Family history of cardiovascular disease increases your baseline risk.");
      if (d.smoking !== "never") r.push("Tobacco and nicotine use accelerate arterial stiffness.");
      if (d.symptoms?.includes("chest_tightness")) r.push("Reported chest discomfort or tightness warrants urgent hemodynamic review.");
      return r;
    },
    doctorQuestions: [
      "Is my current blood pressure within target for my age and risk profile?",
      "Would home blood pressure monitoring (AM/PM log) be beneficial for me?",
    ],
  },
  {
    id: "lipid_panel",
    name: "Advanced Lipid Panel (Cholesterol & Atherogenic Fractions)",
    category: "Cardiovascular",
    icon: "🩸",
    prep: "fasting_10_12",
    prepLabel: "10–12 Hours Overnight Fasting",
    urgency: "routine",
    description: "Measures Total Cholesterol, HDL-C, LDL-C, Triglycerides, VLDL, and Non-HDL cholesterol to evaluate atherosclerotic cardiovascular disease (ASCVD) risk.",
    frequency: "Every 3–5 years for healthy adults; annually if elevated, diabetic, or on statin therapy",
    biomarkers: "Total Chol (<200 mg/dL), LDL-C (<100 mg/dL, <70 if high risk), HDL-C (>40 men, >50 women), Triglycerides (<150 mg/dL)",
    conditions: (d) => parseInt(d.age) >= 20,
    priority: (d) => {
      let p = 4;
      if (d.existingConditions?.includes("high_cholesterol")) p += 6;
      if (d.existingConditions?.includes("diabetes") || d.existingConditions?.includes("heart_disease")) p += 5;
      if (d.familyHistory?.includes("heart_disease") || d.familyHistory?.includes("stroke")) p += 4;
      if (d.dietPattern === "fast_food" || d.dietPattern === "high_sodium") p += 2;
      if (parseInt(d.age) >= 40) p += 2;
      return p;
    },
    whyRecommended: (d) => {
      const r = ["Standard screening for coronary artery and vascular disease."];
      if (d.existingConditions?.includes("high_cholesterol")) r.push("Required to monitor hyperlipidemia management and treatment efficacy.");
      if (d.familyHistory?.includes("heart_disease")) r.push("Strong hereditary predisposition to early arterial plaque formation.");
      if (d.alcohol === "heavy") r.push("Heavy alcohol intake significantly elevates triglyceride fractions.");
      return r;
    },
    doctorQuestions: [
      "What is my 10-year Atherosclerotic Cardiovascular Disease (ASCVD) risk score?",
      "Should we calculate ApoB or Non-HDL cholesterol for a more precise vascular risk assessment?",
    ],
  },
  {
    id: "ecg_12_lead",
    name: "12-Lead Electrocardiogram (ECG / EKG)",
    category: "Cardiovascular",
    icon: "📊",
    prep: "no_prep",
    prepLabel: "No Special Preparation",
    urgency: "routine",
    description: "Records the electrical conductivity of the myocardium to detect arrhythmias (e.g. atrial fibrillation), chamber hypertrophy, conduction blocks, and previous silent ischemia.",
    frequency: "Baseline at age 40+; every 1–2 years if hypertensive, diabetic, or symptomatic",
    biomarkers: "Sinus Rhythm, PR Interval (120-200ms), QRS Duration (<120ms), QTc Interval (<440ms men, <460ms women)",
    conditions: (d) => parseInt(d.age) >= 35 || d.existingConditions?.includes("heart_disease") || d.existingConditions?.includes("hypertension") || d.symptoms?.includes("chest_tightness"),
    priority: (d) => {
      let p = 4;
      if (d.symptoms?.includes("chest_tightness") || d.symptoms?.includes("shortness_breath")) p += 6;
      if (d.existingConditions?.includes("heart_disease")) p += 7;
      if (d.existingConditions?.includes("hypertension")) p += 4;
      if (d.familyHistory?.includes("heart_disease") || d.familyHistory?.includes("stroke")) p += 3;
      return p;
    },
    whyRecommended: (d) => {
      const r = ["Provides non-invasive electrical baseline of cardiac health."];
      if (d.symptoms?.includes("chest_tightness")) r.push("Urgent: Symptoms of chest discomfort/palpitations warrant immediate electrical heart tracing.");
      if (d.existingConditions?.includes("heart_disease")) r.push("Critical for monitoring established cardiac condition.");
      if (parseInt(d.age) >= 50) r.push("Routine age-appropriate screening for silent rhythm irregularities.");
      return r;
    },
    doctorQuestions: [
      "Are there any signs of left ventricular hypertrophy or ischemic changes?",
      "Would a 24-hour Holter monitor or stress echocardiogram be appropriate?",
    ],
  },
  {
    id: "hscrp",
    name: "High-Sensitivity C-Reactive Protein (hs-CRP) & Cardiac Inflammation",
    category: "Cardiovascular",
    icon: "🔥",
    prep: "no_prep",
    prepLabel: "Avoid testing during acute infections or flu",
    urgency: "routine",
    description: "Quantifies vascular micro-inflammation that destabilizes atherosclerotic plaques, refining cardiovascular risk prediction beyond traditional cholesterol numbers.",
    frequency: "Every 2–3 years for intermediate-risk cardiac profiles",
    biomarkers: "Low Risk (<1.0 mg/L), Average Risk (1.0–3.0 mg/L), High Vascular Risk (>3.0 mg/L)",
    conditions: (d) => parseInt(d.age) >= 35 && (d.familyHistory?.includes("heart_disease") || d.existingConditions?.includes("hypertension") || d.smoking !== "never"),
    priority: (d) => {
      let p = 3;
      if (d.familyHistory?.includes("heart_disease")) p += 4;
      if (d.smoking !== "never") p += 3;
      if (d.existingConditions?.includes("diabetes") || d.existingConditions?.includes("fatty_liver")) p += 3;
      return p;
    },
    whyRecommended: (d) => {
      const r = ["Evaluates arterial inflammation and independent risk for coronary events."];
      if (d.smoking !== "never") r.push("Smoking is a potent trigger for systemic and vascular endothelial inflammation.");
      if (d.familyHistory?.includes("heart_disease")) r.push("Helps reclassify borderline cardiac risk in patients with hereditary history.");
      return r;
    },
    doctorQuestions: [
      "Does my hs-CRP indicate underlying arterial inflammation or need for lifestyle/statin therapy?",
    ],
  },

  // ── 2. METABOLIC, DIABETES & ENDOCRINE ─────────────────────────────────────────
  {
    id: "glucose_hba1c",
    name: "Fasting Blood Glucose & Glycated Hemoglobin (HbA1c)",
    category: "Metabolic",
    icon: "🍬",
    prep: "fasting_8_12",
    prepLabel: "8–12 Hours Fasting (Water allowed)",
    urgency: "routine",
    description: "Evaluates immediate glycemic control (Fasting Plasma Glucose) and long-term 90-day average blood glucose saturation (HbA1c) to diagnose pre-diabetes and diabetes mellitus.",
    frequency: "Every 3 years starting at age 35; annually if overweight, pre-diabetic, or hypertensive",
    biomarkers: "Fasting Glucose: 70–99 mg/dL (Normal), 100–125 (Pre-diabetes), ≥126 (Diabetes) | HbA1c: <5.7% (Normal), 5.7–6.4% (Pre-diabetes), ≥6.5% (Diabetes)",
    conditions: (d) => parseInt(d.age) >= 30 || d.existingConditions?.includes("diabetes") || d.familyHistory?.includes("diabetes") || d.symptoms?.includes("frequent_thirst"),
    priority: (d) => {
      let p = 4;
      if (d.existingConditions?.includes("diabetes")) p += 7;
      if (d.familyHistory?.includes("diabetes")) p += 5;
      if (d.symptoms?.includes("frequent_thirst") || d.symptoms?.includes("fatigue")) p += 4;
      if (d.exercise === "sedentary") p += 2;
      return p;
    },
    whyRecommended: (d) => {
      const r = ["Gold standard for diagnosing diabetes and insulin resistance before complications arise."];
      if (d.existingConditions?.includes("diabetes")) r.push("Mandatory 3-to-6 month monitoring for glycemic regulation and therapeutic compliance.");
      if (d.familyHistory?.includes("diabetes")) r.push("First-degree family history significantly increases your lifetime diabetes risk.");
      if (d.symptoms?.includes("frequent_thirst")) r.push("Reported excessive thirst or frequent urination are hallmark signs of hyperglycemia.");
      return r;
    },
    doctorQuestions: [
      "Is my HbA1c in the optimal longevity range (<5.4%) or trending towards insulin resistance?",
      "Would a Continuous Glucose Monitor (CGM) or dietary glycemic load adjustment help my numbers?",
    ],
  },
  {
    id: "thyroid_panel",
    name: "Comprehensive Thyroid Panel (TSH, Free T3 & Free T4)",
    category: "Endocrine",
    icon: "🦋",
    prep: "morning_draw",
    prepLabel: "Morning Blood Draw (Hold thyroid meds prior if prescribed)",
    urgency: "routine",
    description: "Assesses pituitary-thyroid axis regulation to detect subclinical/overt hypothyroidism (sluggish metabolism, fatigue, weight gain) or hyperthyroidism (anxiety, palpitations).",
    frequency: "Every 3–5 years for adults; every 1–2 years for women over 40 or symptomatic individuals",
    biomarkers: "TSH (0.45–4.5 mIU/L), Free T4 (0.8–1.8 ng/dL), Free T3 (2.3–4.2 pg/mL)",
    conditions: (d) => d.gender === "female" || parseInt(d.age) >= 35 || d.existingConditions?.includes("thyroid_disorder") || d.symptoms?.includes("fatigue") || d.symptoms?.includes("hair_loss"),
    priority: (d) => {
      let p = 3;
      if (d.existingConditions?.includes("thyroid_disorder")) p += 7;
      if (d.gender === "female") p += 3;
      if (d.familyHistory?.includes("thyroid")) p += 4;
      if (d.symptoms?.includes("fatigue") || d.symptoms?.includes("hair_loss") || d.symptoms?.includes("weight_changes")) p += 3;
      return p;
    },
    whyRecommended: (d) => {
      const r = ["Screens for endocrine disorders governing metabolism, body temperature, and energy balance."];
      if (d.existingConditions?.includes("thyroid_disorder")) r.push("Essential monitoring to titrate levothyroxine/thyroid medication dosage.");
      if (d.gender === "female") r.push("Women are 5–8x more prone to Hashimoto's and autoimmune thyroid dysfunction.");
      if (d.symptoms?.includes("fatigue") || d.symptoms?.includes("hair_loss")) r.push("Reported chronic fatigue or thinning hair often originates from subclinical thyroid slowing.");
      return r;
    },
    doctorQuestions: [
      "Are my Free T3 and Free T4 in optimal functional ranges, or just within broad reference limits?",
      "Should we check Anti-TPO (Thyroid Peroxidase Antibodies) to rule out autoimmune Hashimoto's thyroiditis?",
    ],
  },

  // ── 3. RENAL & HEPATIC (KIDNEY & LIVER) ───────────────────────────────────────
  {
    id: "renal_panel",
    name: "Kidney Function Profile (eGFR, Serum Creatinine, BUN & Uric Acid)",
    category: "Renal & Liver",
    icon: "🫘",
    prep: "fasting_hydration",
    prepLabel: "Hydrate with water normally; avoid heavy meat meals 24h prior",
    urgency: "routine",
    description: "Evaluates renal glomerular filtration efficiency, nitrogen waste clearance, and uric acid buildup to identify early chronic kidney disease (CKD) and gout risk.",
    frequency: "Annually for hypertensive or diabetic individuals; every 2 years for general adults 40+",
    biomarkers: "eGFR (>90 mL/min/1.73m² Normal, <60 indicates CKD), Serum Creatinine (0.7–1.3 mg/dL), BUN (7–20 mg/dL), Uric Acid (3.5–7.2 mg/dL)",
    conditions: (d) => parseInt(d.age) >= 40 || d.existingConditions?.includes("hypertension") || d.existingConditions?.includes("diabetes") || d.existingConditions?.includes("kidney_disease"),
    priority: (d) => {
      let p = 4;
      if (d.existingConditions?.includes("kidney_disease")) p += 7;
      if (d.existingConditions?.includes("hypertension") || d.existingConditions?.includes("diabetes")) p += 5;
      if (parseInt(d.age) >= 50) p += 2;
      return p;
    },
    whyRecommended: (d) => {
      const r = ["Kidney damage is notoriously asymptomatic until 80%+ filtration capacity is lost."];
      if (d.existingConditions?.includes("hypertension") || d.existingConditions?.includes("diabetes")) {
        r.push("Hypertension and diabetes are the leading causes of microvascular renal nephropathy.");
      }
      return r;
    },
    doctorQuestions: [
      "Is my estimated GFR stable compared to previous years?",
      "Should we pair this with a Urine Albumin-to-Creatinine Ratio (uACR) test?",
    ],
  },
  {
    id: "liver_panel",
    name: "Comprehensive Liver Function Panel (LFT - ALT, AST, ALP, Bilirubin & GGT)",
    category: "Renal & Liver",
    icon: "🫁",
    prep: "fasting_8_12",
    prepLabel: "8–12 Hours Overnight Fasting",
    urgency: "routine",
    description: "Measures hepatic enzymes and synthesis capacity to screen for non-alcoholic fatty liver disease (NAFLD/MASLD), toxic drug overload, viral hepatitis, and biliary stasis.",
    frequency: "Annually if taking chronic medications or alcohol consumers; every 2–3 years routine",
    biomarkers: "ALT (7–56 U/L), AST (10–40 U/L), ALP (44–147 U/L), Total Bilirubin (0.2–1.2 mg/dL), Serum Albumin (3.5–5.0 g/dL)",
    conditions: (d) => d.alcohol !== "none" || d.existingConditions?.includes("fatty_liver") || parseInt(d.age) >= 40 || d.existingConditions?.includes("high_cholesterol"),
    priority: (d) => {
      let p = 3;
      if (d.existingConditions?.includes("fatty_liver")) p += 7;
      if (d.alcohol === "heavy" || d.alcohol === "moderate") p += 5;
      if (d.dietPattern === "fast_food") p += 2;
      return p;
    },
    whyRecommended: (d) => {
      const r = ["Evaluates hepatic cellular integrity and metabolic detoxification."];
      if (d.existingConditions?.includes("fatty_liver")) r.push("Essential to track metabolic-associated fatty liver disease progression and fibrosis risk.");
      if (d.alcohol === "heavy" || d.alcohol === "moderate") r.push("Monitors alcohol-induced hepatic enzymatic stress.");
      return r;
    },
    doctorQuestions: [
      "Is my AST/ALT ratio normal, or does it suggest hepatic steatosis / inflammation?",
      "Would an ultrasound or FibroScan of the liver be indicated for my metabolic profile?",
    ],
  },

  // ── 4. HEMATOLOGY & IMMUNOLOGY ───────────────────────────────────────────────
  {
    id: "cbc_diff",
    name: "Complete Blood Count (CBC) with Differential & Platelets",
    category: "General & Blood",
    icon: "🔬",
    prep: "no_prep",
    prepLabel: "Routine blood draw (stay hydrated)",
    urgency: "routine",
    description: "Evaluates red blood cell volume, hemoglobin oxygen carrying capacity, white blood cell immune distribution (neutrophils, lymphocytes), and platelet clotting capacity.",
    frequency: "Annually as part of preventive physical examination",
    biomarkers: "Hemoglobin (13.8–17.2 g/dL men, 12.1–15.1 g/dL women), WBC (4,500–11,000 /µL), Platelets (150,000–450,000 /µL), MCV (80–100 fL)",
    conditions: () => true,
    priority: (d) => {
      let p = 5;
      if (d.existingConditions?.includes("anemia") || d.symptoms?.includes("fatigue")) p += 5;
      if (d.gender === "female" && parseInt(d.age) <= 50) p += 3;
      return p;
    },
    whyRecommended: (d) => {
      const r = ["Broadest baseline screen for occult blood loss, immune disorders, infection, and anemia."];
      if (d.symptoms?.includes("fatigue")) r.push("Crucial for ruling out microcytic or normocytic anemia as the root of fatigue.");
      if (d.gender === "female" && parseInt(d.age) <= 50) r.push("Premenopausal women have elevated incidence of iron-deficiency anemia from blood loss.");
      return r;
    },
    doctorQuestions: [
      "Are my Red Blood Cell indices (MCV, MCH, RDW) consistent with optimal iron and B12 absorption?",
    ],
  },
  {
    id: "iron_ferritin",
    name: "Iron Studies & Serum Ferritin Storage",
    category: "General & Blood",
    icon: "⚡",
    prep: "morning_fasting",
    prepLabel: "Morning draw (Iron levels peak in morning); avoid iron pills 24h",
    urgency: "routine",
    description: "Measures cellular iron stores (Ferritin), circulating serum iron, and total iron-binding capacity (TIBC) to differentiate true iron deficiency from anemia of chronic disease or hemochromatosis.",
    frequency: "Every 1–2 years for menstruating women, vegans/vegetarians, or fatigued individuals",
    biomarkers: "Serum Ferritin (30–300 ng/mL men, 20–200 ng/mL women, optimal >50 ng/mL), Transferrin Saturation (20–50%)",
    conditions: (d) => d.gender === "female" || d.symptoms?.includes("fatigue") || d.symptoms?.includes("hair_loss") || d.dietPattern === "vegetarian" || d.existingConditions?.includes("anemia"),
    priority: (d) => {
      let p = 3;
      if (d.existingConditions?.includes("anemia")) p += 6;
      if (d.symptoms?.includes("fatigue") || d.symptoms?.includes("hair_loss")) p += 4;
      if (d.dietPattern === "vegetarian") p += 4;
      return p;
    },
    whyRecommended: (d) => {
      const r = ["Standard hemoglobin often appears normal even when deep tissue Ferritin stores are depleted."];
      if (d.dietPattern === "vegetarian") r.push("Plant-based (non-heme) dietary iron has lower bioavailability and requires regular storage monitoring.");
      if (d.symptoms?.includes("hair_loss") || d.symptoms?.includes("fatigue")) r.push("Low ferritin (<30 ng/mL) is a primary trigger for telogen effluvium hair shedding and lethargy.");
      return r;
    },
    doctorQuestions: [
      "Is my ferritin in the optimal functional zone (>50 ng/mL) for cellular energy and hair growth?",
    ],
  },

  // ── 5. CANCER SCREENINGS (ONCOLOGY) ──────────────────────────────────────────
  {
    id: "colonoscopy_crc",
    name: "Colorectal Cancer Screening (Colonoscopy or Annual FIT Stool Test)",
    category: "Cancer Screening",
    icon: "🔍",
    prep: "bowel_prep",
    prepLabel: "Requires bowel prep regimen 24h prior for colonoscopy",
    urgency: "important",
    description: "Direct endoscopic visualization of the entire colon and rectum to identify and remove precancerous adenomatous polyps before malignant transformation occurs.",
    frequency: "Colonoscopy every 10 years (or FIT Stool DNA every 1–3 years) starting at age 45 (age 40 or 10 years earlier if family history)",
    biomarkers: "Polyp Detection Rate, Histopathology (Tubular/Villous Adenoma), Stool Occult Blood (Negative)",
    conditions: (d) => parseInt(d.age) >= 45 || d.familyHistory?.includes("colorectal_cancer") || d.symptoms?.includes("digestive_issues"),
    priority: (d) => {
      let p = 6;
      if (d.familyHistory?.includes("colorectal_cancer")) p += 6;
      if (parseInt(d.age) >= 50) p += 4;
      if (d.smoking !== "never" || d.alcohol === "heavy") p += 2;
      return p;
    },
    whyRecommended: (d) => {
      const r = ["Colorectal cancer is over 90% preventable and curable when polyps are caught and resected early."];
      if (d.familyHistory?.includes("colorectal_cancer")) r.push("First-degree family history mandates initiating screening 10 years earlier than standard guidelines.");
      if (parseInt(d.age) >= 45) r.push("USPSTF guidelines strongly recommend universal screening starting at age 45.");
      return r;
    },
    doctorQuestions: [
      "Am I an optimal candidate for optical colonoscopy vs non-invasive Cologuard / FIT DNA stool testing?",
      "Based on my family history, what is my recommended repeat surveillance interval?",
    ],
  },
  {
    id: "mammography_breast",
    name: "Digital 3D Mammography (Tomosynthesis) & Clinical Breast Exam",
    category: "Cancer Screening",
    icon: "🎗️",
    prep: "no_deodorant",
    prepLabel: "Avoid deodorants, antiperspirants, or powders on day of exam",
    urgency: "important",
    description: "High-resolution low-dose X-ray imaging in 3D slices through breast tissue to detect microcalcifications and sub-clinical masses years before they become palpable.",
    frequency: "Annually or biennially for women aged 40–74 (earlier if BRCA carrier or strong family history)",
    biomarkers: "BI-RADS Classification Score (BI-RADS 1 = Negative, 2 = Benign, 0 = Incomplete/Needs Ultrasound)",
    conditions: (d) => d.gender === "female" && (parseInt(d.age) >= 40 || d.familyHistory?.includes("breast_cancer")),
    priority: (d) => {
      let p = 7;
      if (d.familyHistory?.includes("breast_cancer")) p += 6;
      if (parseInt(d.age) >= 50) p += 3;
      return p;
    },
    whyRecommended: (d) => {
      const r = ["Gold-standard screening shown to reduce breast cancer mortality by over 30%."];
      if (d.familyHistory?.includes("breast_cancer")) r.push("Family history warrants aggressive baseline surveillance and potential genetic risk assessment (BRCA1/2).");
      if (parseInt(d.age) >= 40) r.push("Standard clinical guideline milestone for initiating routine screening.");
      return r;
    },
    doctorQuestions: [
      "Do I have dense breast tissue, and would supplemental automated breast ultrasound (ABUS) or MRI be warranted?",
    ],
  },
  {
    id: "pap_hpv_cervical",
    name: "Cervical Cancer Screening (Liquid-Based Pap Smear & High-Risk HPV DNA)",
    category: "Cancer Screening",
    icon: "💗",
    prep: "no_intercourse",
    prepLabel: "Avoid intercourse, douching, or vaginal creams 48h prior",
    urgency: "important",
    description: "Microscopic cytology examination of cervical transformation zone cells paired with molecular high-risk Human Papillomavirus (HPV strains 16, 18, 45) DNA testing.",
    frequency: "Every 3 years for Pap alone (age 21–29); Every 5 years for Pap + HPV co-testing (age 30–65)",
    biomarkers: "NILM (Negative for Intraepithelial Lesion), ASC-US, LSIL/HSIL, High-Risk HPV Types (Negative)",
    conditions: (d) => d.gender === "female" && parseInt(d.age) >= 21 && parseInt(d.age) <= 65,
    priority: (d) => {
      let p = 7;
      if (d.familyHistory?.includes("cervical_cancer")) p += 3;
      if (d.lastCheckup === "more_than_2_years" || d.lastCheckup === "never") p += 4;
      return p;
    },
    whyRecommended: (d) => {
      const r = ["Almost 100% of cervical precancers can be eradicated when caught in early intraepithelial stages."];
      if (d.lastCheckup === "more_than_2_years" || d.lastCheckup === "never") r.push("You are past the recommended screening window and due for an updated Pap/HPV test.");
      return r;
    },
    doctorQuestions: [
      "Are both my Pap cytology and high-risk HPV DNA negative?",
      "When is my next due date based on current co-testing guidelines?",
    ],
  },
  {
    id: "psa_prostate",
    name: "Prostate-Specific Antigen (Total & Free PSA) & Digital Exam",
    category: "Cancer Screening",
    icon: "🔵",
    prep: "avoid_ejaculation",
    prepLabel: "Avoid ejaculation, vigorous cycling, or prostate exam 48h prior",
    urgency: "important",
    description: "Measures glycoprotein enzyme concentration secreted by prostate epithelial cells to evaluate risk of prostate adenoma, benign prostatic hyperplasia (BPH), and adenocarcinoma.",
    frequency: "Discuss shared decision making starting at age 50 (age 45 for African descent or family history)",
    biomarkers: "Total PSA (<4.0 ng/mL standard, age-adjusted <2.5 ng/mL for <50), Free PSA Ratio (>25% favourable)",
    conditions: (d) => d.gender === "male" && (parseInt(d.age) >= 45 || d.familyHistory?.includes("prostate_cancer") || d.symptoms?.includes("frequent_urination")),
    priority: (d) => {
      let p = 5;
      if (d.familyHistory?.includes("prostate_cancer")) p += 6;
      if (d.symptoms?.includes("frequent_urination")) p += 4;
      if (parseInt(d.age) >= 50) p += 3;
      return p;
    },
    whyRecommended: (d) => {
      const r = ["Key biomarker for early prostate tissue proliferation and oncology risk."];
      if (d.familyHistory?.includes("prostate_cancer")) r.push("First-degree relative with prostate cancer doubles baseline lifetime risk.");
      if (d.symptoms?.includes("frequent_urination")) r.push("Reported urinary urgency/frequency requires distinguishing BPH from malignant changes.");
      return r;
    },
    doctorQuestions: [
      "What is my PSA velocity (rate of change over time)?",
      "Would a Free-to-Total PSA percentage or multiparametric MRI (mpMRI) be helpful?",
    ],
  },
  {
    id: "lung_ldct",
    name: "Low-Dose CT (LDCT) Lung Cancer Screening",
    category: "Cancer Screening",
    icon: "🫁",
    prep: "no_prep",
    prepLabel: "No contrast dye required; painless 5-minute chest scan",
    urgency: "urgent",
    description: "Cross-sectional computed tomography using 1/5th traditional radiation to detect non-calcified pulmonary nodules in high-risk current and former smokers.",
    frequency: "Annually for adults aged 50–80 with a 20+ pack-year smoking history who currently smoke or quit within 15 years",
    biomarkers: "Lung-RADS Category (Category 1–2 Benign, Category 3–4 Suspicious Nodule Requiring Follow-up)",
    conditions: (d) => (d.smoking === "current" || d.smoking === "former") && parseInt(d.age) >= 50,
    priority: (d) => {
      let p = 6;
      if (d.smoking === "current") p += 7;
      if (d.symptoms?.includes("cough")) p += 4;
      return p;
    },
    whyRecommended: (d) => {
      const r = ["USPSTF Class A recommendation: LDCT cuts lung cancer deaths by 20–24%."];
      if (d.smoking === "current") r.push("Current active smoking is the primary single risk factor for pulmonary neoplasia.");
      return r;
    },
    doctorQuestions: [
      "Do I qualify for annual LDCT screening under CMS / USPSTF pack-year criteria?",
    ],
  },
  {
    id: "skin_dermatology",
    name: "Full-Body Dermatologic Skin Exam (Melanoma & Non-Melanoma Screen)",
    category: "Cancer Screening",
    icon: "🌞",
    prep: "no_makeup",
    prepLabel: "Remove nail polish, makeup, and wear easily removable clothing",
    urgency: "routine",
    description: "Dermoscopic examination of all cutaneous surfaces (including scalp, interdigital, and soles) applying ABCDE criteria (Asymmetry, Border, Color, Diameter, Evolving).",
    frequency: "Annually; biannually if dysplastic nevus syndrome or prior skin cancer",
    biomarkers: "Dermoscopy criteria (pigment network, globules, vascular patterns, biopsy of suspicious lesions)",
    conditions: (d) => parseInt(d.age) >= 30 || d.familyHistory?.includes("skin_cancer") || d.sunExposure === "high" || d.symptoms?.includes("skin_moles"),
    priority: (d) => {
      let p = 3;
      if (d.symptoms?.includes("skin_moles")) p += 6;
      if (d.familyHistory?.includes("skin_cancer")) p += 5;
      if (d.sunExposure === "high") p += 3;
      return p;
    },
    whyRecommended: (d) => {
      const r = ["Melanoma detected at Stage 0/1 has a 99% 5-year survival rate."];
      if (d.symptoms?.includes("skin_moles")) r.push("Reported suspicious, new, or evolving skin moles require urgent professional dermoscopic appraisal.");
      if (d.familyHistory?.includes("skin_cancer")) r.push("Genetic predisposition to atypical nevi and melanoma.");
      return r;
    },
    doctorQuestions: [
      "Are any of my existing moles dysplastic or showing irregular pigment networks?",
      "How often should I perform home self-skin checks?",
    ],
  },

  // ── 6. NUTRITIONAL, VITAMINS & MICRONUTRIENTS ────────────────────────────────
  {
    id: "vitamin_d_calcium",
    name: "25-Hydroxy Vitamin D & Serum Ionized Calcium Panel",
    category: "Nutritional",
    icon: "☀️",
    prep: "no_prep",
    prepLabel: "Standard blood test",
    urgency: "routine",
    description: "Measures circulating calcifediol (25-OH Vitamin D) and calcium homeostasis critical for bone mineralization, immune function, mood regulation, and muscle power.",
    frequency: "Every 1–2 years (annually if deficient or taking supplementation)",
    biomarkers: "25-OH Vitamin D: <20 ng/mL (Deficient), 20–29 (Insufficient), 30–60 ng/mL (Optimal), Serum Calcium (8.6–10.2 mg/dL)",
    conditions: (d) => d.sunExposure === "low" || d.exercise === "sedentary" || parseInt(d.age) >= 45 || d.existingConditions?.includes("osteoporosis") || d.symptoms?.includes("fatigue"),
    priority: (d) => {
      let p = 4;
      if (d.sunExposure === "low") p += 4;
      if (d.existingConditions?.includes("osteoporosis")) p += 5;
      if (d.symptoms?.includes("fatigue") || d.symptoms?.includes("joint_pain")) p += 3;
      return p;
    },
    whyRecommended: (d) => {
      const r = ["Over 40% of adults suffer from subclinical Vitamin D deficiency impacting immune and bone health."];
      if (d.sunExposure === "low") r.push("Low sun exposure severely limits natural cutaneous Vitamin D3 synthesis.");
      if (d.symptoms?.includes("fatigue") || d.symptoms?.includes("joint_pain")) r.push("Hypovitaminosis D directly causes diffuse musculoskeletal aching and daytime lethargy.");
      return r;
    },
    doctorQuestions: [
      "Is my Vitamin D level sufficient for peak immune resilience and bone protection (>40 ng/mL)?",
      "Should my D3 supplement be paired with Vitamin K2 (MK-7) for arterial calcium routing?",
    ],
  },
  {
    id: "vitamin_b12_folate",
    name: "Serum Vitamin B12 (Cobalamin) & Folate (Vitamin B9)",
    category: "Nutritional",
    icon: "🧠",
    prep: "fasting_optional",
    prepLabel: "Overnight fasting preferred; avoid B-complex pills 48h prior",
    urgency: "routine",
    description: "Assesses cofactors vital for DNA synthesis, myelin nerve sheath integrity, cognitive processing speed, and homocysteine remethylation.",
    frequency: "Every 2–3 years (annually for vegans, vegetarians, elderly, or those on Metformin/PPIs)",
    biomarkers: "Vitamin B12 (>400 pg/mL optimal, <200 deficient, 200–400 borderline), Serum Folate (>4.0 ng/mL)",
    conditions: (d) => d.dietPattern === "vegetarian" || d.symptoms?.includes("brain_fog") || d.symptoms?.includes("fatigue") || d.existingConditions?.includes("diabetes") || parseInt(d.age) >= 60,
    priority: (d) => {
      let p = 3;
      if (d.dietPattern === "vegetarian") p += 5;
      if (d.symptoms?.includes("brain_fog") || d.symptoms?.includes("fatigue")) p += 4;
      if (d.existingConditions?.includes("diabetes")) p += 3;
      return p;
    },
    whyRecommended: (d) => {
      const r = ["Deficiency leads to irreversible peripheral neuropathy, spinal cord subacute degeneration, and cognitive fog."];
      if (d.dietPattern === "vegetarian") r.push("Vitamin B12 is found almost exclusively in animal foods; plant diets require regular verification.");
      if (d.symptoms?.includes("brain_fog")) r.push("Reported memory lapses or brain fog frequently correlate with low-normal B12 levels.");
      return r;
    },
    doctorQuestions: [
      "If my B12 is borderline (200–400 pg/mL), should we check Methylmalonic Acid (MMA) for tissue-level deficiency?",
    ],
  },

  // ── 7. BONE & MUSCULOSKELETAL ────────────────────────────────────────────────
  {
    id: "dexa_bone_density",
    name: "Dual-Energy X-ray Absorptiometry (DEXA Bone Mineral Density)",
    category: "Bone & Joint",
    icon: "🦴",
    prep: "no_calcium_supplements",
    prepLabel: "Do not take calcium supplements for 24 hours prior to scan",
    urgency: "routine",
    description: "Quantifies areal bone mineral density (g/cm²) at lumbar spine, femoral neck, and total hip to detect osteopenia and fracture risk (T-score).",
    frequency: "Baseline at menopause or age 65 for women (age 70 for men); every 2 years if osteopenic",
    biomarkers: "T-Score: ≥ -1.0 (Normal), -1.0 to -2.5 (Osteopenia), ≤ -2.5 (Osteoporosis), FRAX 10-year fracture score",
    conditions: (d) => (d.gender === "female" && parseInt(d.age) >= 50) || (d.gender === "male" && parseInt(d.age) >= 65) || d.existingConditions?.includes("osteoporosis") || d.familyHistory?.includes("osteoporosis"),
    priority: (d) => {
      let p = 4;
      if (d.existingConditions?.includes("osteoporosis")) p += 6;
      if (d.familyHistory?.includes("osteoporosis")) p += 4;
      if (d.gender === "female" && parseInt(d.age) >= 55) p += 4;
      return p;
    },
    whyRecommended: (d) => {
      const r = ["Osteoporotic fragility fractures carry high morbidity; bone loss is silent until a fracture occurs."];
      if (d.gender === "female" && parseInt(d.age) >= 50) r.push("Postmenopausal estrogen decline accelerates trabecular bone resorption.");
      if (d.familyHistory?.includes("osteoporosis")) r.push("Family history of hip or spinal fracture is a major independent clinical risk factor.");
      return r;
    },
    doctorQuestions: [
      "What is my lowest T-score and my 10-year major osteoporotic fracture probability (FRAX)?",
      "Do I need prescription antiresorptive therapy or structured resistance training?",
    ],
  },

  // ── 8. SENSORY (VISION, HEARING & DENTAL) ────────────────────────────────────
  {
    id: "eye_exam_glaucoma",
    name: "Comprehensive Dilated Eye Exam & Intraocular Pressure (Glaucoma / Retinopathy)",
    category: "Vision & Hearing",
    icon: "👁️",
    prep: "bring_sunglasses",
    prepLabel: "Pupil dilation causes temporary light sensitivity (bring sunglasses & driver)",
    urgency: "routine",
    description: "Assesses visual acuity, tonometry intraocular pressure, corneal pachymetry, and dilated retinal examination for early glaucoma, macular degeneration, and diabetic microaneurysms.",
    frequency: "Every 1–2 years for adults; annually if diabetic, hypertensive, or age 60+",
    biomarkers: "Intraocular Pressure (10–21 mmHg), Cup-to-Disc Ratio (<0.4), Macular Integrity, Retinal Vasculature",
    conditions: () => true,
    priority: (d) => {
      let p = 4;
      if (d.existingConditions?.includes("diabetes") || d.existingConditions?.includes("hypertension")) p += 5;
      if (d.familyHistory?.includes("glaucoma")) p += 4;
      if (d.symptoms?.includes("blurry_vision")) p += 5;
      if (parseInt(d.age) >= 60) p += 3;
      return p;
    },
    whyRecommended: (d) => {
      const r = ["Glaucoma ('silent thief of sight') causes irreversible optic nerve damage without early pain or warning."];
      if (d.existingConditions?.includes("diabetes")) r.push("Diabetic retinopathy is a leading cause of preventable blindness and requires annual dilated fundus photography.");
      if (d.symptoms?.includes("blurry_vision")) r.push("Reported visual blurriness or eye strain warrants swift refraction and ocular health check.");
      return r;
    },
    doctorQuestions: [
      "Are there any early microvascular changes or signs of glaucoma in my optic nerves?",
    ],
  },
  {
    id: "audiometry_hearing",
    name: "Pure-Tone Audiometry & Speech Recognition Hearing Assessment",
    category: "Vision & Hearing",
    icon: "👂",
    prep: "avoid_loud_noise",
    prepLabel: "Avoid high-decibel loud noise environments for 16h prior",
    urgency: "routine",
    description: "Evaluates bilateral auditory sensitivity across high and low frequency Hertz spectrums to identify age-related presbycusis and sensory-neural damage.",
    frequency: "Every 3–5 years over age 50; every 1–2 years over age 65",
    biomarkers: "Hearing Threshold (<25 dB Normal, 26–40 Mild Loss, 41–70 Moderate Loss)",
    conditions: (d) => parseInt(d.age) >= 50 || d.occupation === "heavy_physical",
    priority: (d) => {
      let p = 3;
      if (parseInt(d.age) >= 60) p += 4;
      return p;
    },
    whyRecommended: (d) => {
      const r = ["Untreated hearing loss is proven by the Lancet Commission to be the #1 modifiable risk factor for cognitive decline and dementia."];
      return r;
    },
    doctorQuestions: [
      "Is my high-frequency speech comprehension impaired in noisy social settings?",
    ],
  },
  {
    id: "dental_oral_cancer",
    name: "Biannual Dental Prophylaxis & Velscope Oral Cancer Screening",
    category: "Dental & Oral",
    icon: "🦷",
    prep: "brush_floss",
    prepLabel: "Maintain normal oral hygiene before your appointment",
    urgency: "routine",
    description: "Ultrasonic scaling to remove subgingival calculus, periodontal pocket probing (gum disease), and tactile/visual mucosal screening for premalignant leukoplakia.",
    frequency: "Every 6 months",
    biomarkers: "Periodontal Pocket Depths (1–3mm Healthy, ≥4mm Periodontitis), Bleeding on Probing (BOP <10%)",
    conditions: () => true,
    priority: (d) => {
      let p = 5;
      if (d.smoking !== "never") p += 4;
      if (d.alcohol === "heavy") p += 3;
      if (d.existingConditions?.includes("diabetes")) p += 3;
      return p;
    },
    whyRecommended: (d) => {
      const r = ["Chronic periodontal gum bacteria (P. gingivalis) enter the bloodstream, driving systemic vascular inflammation and coronary plaque."];
      if (d.smoking !== "never") r.push("Tobacco use increases oral cancer risk up to 10-fold and masks gum bleeding signs.");
      return r;
    },
    doctorQuestions: [
      "Do I have any active periodontal pocketing or signs of nocturnal bruxism / teeth grinding?",
    ],
  },

  // ── 9. RESPIRATORY & PULMONARY ───────────────────────────────────────────────
  {
    id: "spirometry_pft",
    name: "Spirometry & Pulmonary Function Test (PFT)",
    category: "Pulmonary",
    icon: "🌬️",
    prep: "no_bronchodilators",
    prepLabel: "Avoid heavy meals and hold rescue inhalers 4–6h prior if advised",
    urgency: "routine",
    description: "Measures the maximum volume of air exhaled forcefully in 1 second (FEV1) versus total forced vital capacity (FVC) to detect obstructive (Asthma, COPD) or restrictive airway disease.",
    frequency: "Every 1–2 years for smokers, asthmatics, or individuals with shortness of breath",
    biomarkers: "FEV1/FVC Ratio (>0.70 Normal, <0.70 Obstructive defect), FEV1 % Predicted (>80% Normal)",
    conditions: (d) => d.smoking !== "never" || d.existingConditions?.includes("asthma") || d.symptoms?.includes("shortness_breath"),
    priority: (d) => {
      let p = 4;
      if (d.existingConditions?.includes("asthma")) p += 6;
      if (d.symptoms?.includes("shortness_breath")) p += 5;
      if (d.smoking === "current") p += 5;
      return p;
    },
    whyRecommended: (d) => {
      const r = ["Detects subclinical loss of lung elasticity before permanent alveolar destruction occurs."];
      if (d.symptoms?.includes("shortness_breath")) r.push("Reported exertional dyspnea requires objective lung function differentiation from cardiac causes.");
      if (d.smoking !== "never") r.push("Longitudinal FEV1 tracking is the primary clinical tool to detect early COPD.");
      return r;
    },
    doctorQuestions: [
      "Is my FEV1/FVC ratio normal, or is there evidence of reversible airway obstruction?",
    ],
  },

  // ── 10. MEN'S & WOMEN'S SPECIALIZED HORMONAL ─────────────────────────────────
  {
    id: "testosterone_mens",
    name: "Total & Free Testosterone Evaluation with SHBG",
    category: "Men's Health",
    icon: "💪",
    prep: "morning_fasting_8_10am",
    prepLabel: "Strictly morning blood draw between 7:00 AM – 10:00 AM (testosterone peaks in AM)",
    urgency: "routine",
    description: "Quantifies total testosterone, free bioavailable testosterone, and Sex Hormone-Binding Globulin (SHBG) to diagnose hypogonadism, andropause, and metabolic slowdown.",
    frequency: "As indicated for men aged 40+ or experiencing fatigue, low libido, muscle loss, or mood changes",
    biomarkers: "Total Testosterone (300–1000 ng/dL, optimal 500–800), Free Testosterone (50–210 pg/mL)",
    conditions: (d) => d.gender === "male" && (parseInt(d.age) >= 40 || d.symptoms?.includes("fatigue")),
    priority: (d) => {
      let p = 3;
      if (parseInt(d.age) >= 50) p += 3;
      if (d.symptoms?.includes("fatigue")) p += 3;
      if (d.exercise === "sedentary") p += 2;
      return p;
    },
    whyRecommended: (d) => {
      const r = ["Testosterone drops ~1–2% annually after age 30, impacting visceral adiposity, bone density, and vitality."];
      if (d.symptoms?.includes("fatigue")) r.push("Low bioavailable testosterone is a common overlooked cause of persistent brain fog and low physical endurance.");
      return r;
    },
    doctorQuestions: [
      "Is my morning free testosterone within the healthy functional range for my chronological age?",
    ],
  },

  // ── 11. URINARY & MICROVASCULAR ──────────────────────────────────────────────
  {
    id: "urinalysis_uacr",
    name: "Urinalysis with Microscopic Exam & Urine Albumin-to-Creatinine Ratio (uACR)",
    category: "Renal & Liver",
    icon: "🧪",
    prep: "clean_catch_midstream",
    prepLabel: "Clean-catch midstream morning urine sample",
    urgency: "routine",
    description: "Detects microscopic proteinuria, microalbuminuria (earliest marker of systemic vascular & renal leakiness), hematuria, leukocytes, and crystalluria.",
    frequency: "Annually for diabetic and hypertensive patients; every 2 years routine",
    biomarkers: "uACR (<30 mg/g Normal, 30–300 Microalbuminuria, >300 Macroalbuminuria), Urine Protein (Negative), Leukocyte Esterase (Negative)",
    conditions: (d) => parseInt(d.age) >= 35 || d.existingConditions?.includes("diabetes") || d.existingConditions?.includes("hypertension"),
    priority: (d) => {
      let p = 4;
      if (d.existingConditions?.includes("diabetes") || d.existingConditions?.includes("hypertension")) p += 6;
      return p;
    },
    whyRecommended: (d) => {
      const r = ["Urinary microalbumin is the most sensitive early warning beacon for generalized arterial and renal endothelial damage."];
      if (d.existingConditions?.includes("diabetes") || d.existingConditions?.includes("hypertension")) {
        r.push("ADA and KDIGO guidelines mandate annual uACR testing for all diabetic/hypertensive patients.");
      }
      return r;
    },
    doctorQuestions: [
      "Are there any traces of microalbumin in my urine that would indicate microvascular stress?",
    ],
  },

  // ── 12. IMMUNIZATIONS & PREVENTIVE VACCINES ──────────────────────────────────
  {
    id: "vaccination_review",
    name: "Adult Immunization Review (Tdap, Flu, Shingrix, Pneumococcal & HPV)",
    category: "Vaccinations",
    icon: "💉",
    prep: "bring_vaccine_record",
    prepLabel: "Bring your previous vaccination cards or digital records",
    urgency: "routine",
    description: "Evaluates booster timelines for Tetanus/Diphtheria/Pertussis (Tdap every 10y), Annual Quadrivalent Influenza, Shingles recombinant vaccine (Shingrix 50+), and Pneumococcal conjugate (65+).",
    frequency: "Annual flu review; Tdap every 10 years; Shingrix 2-dose series at age 50+",
    biomarkers: "Immunization History, Serum Titer levels if uncertain immunity",
    conditions: () => true,
    priority: (d) => {
      let p = 4;
      if (parseInt(d.age) >= 50) p += 3;
      if (d.existingConditions?.includes("asthma") || d.existingConditions?.includes("diabetes")) p += 3;
      return p;
    },
    whyRecommended: (d) => {
      const r = ["Preventable infectious diseases cause significant morbidity in adults as immune senescence sets in."];
      if (parseInt(d.age) >= 50) r.push("CDC strongly recommends the 2-dose Shingrix vaccine at age 50+ (97% protection against painful shingles neuropathy).");
      if (d.existingConditions?.includes("asthma") || d.existingConditions?.includes("diabetes")) r.push("Underlying respiratory and metabolic conditions elevate risk of severe influenza/pneumonia complications.");
      return r;
    },
    doctorQuestions: [
      "Am I up to date on my Tdap booster (within 10 years) and eligible for Shingrix or Pneumococcal vaccines?",
    ],
  }
];

// ─── OPTIONS MAPPINGS ──────────────────────────────────────────────────────────
const SYMPTOMS_OPTIONS = [
  { value: "fatigue", label: "Persistent Fatigue / Low Energy" },
  { value: "chest_tightness", label: "Chest Tightness / Palpitations" },
  { value: "shortness_breath", label: "Shortness of Breath on Exertion" },
  { value: "joint_pain", label: "Joint / Back Pain & Stiffness" },
  { value: "frequent_thirst", label: "Frequent Thirst / Urination" },
  { value: "digestive_issues", label: "Digestive Issues / Bloating / Acid" },
  { value: "weight_changes", label: "Unexplained Weight Changes" },
  { value: "blurry_vision", label: "Blurry Vision / Eye Strain" },
  { value: "skin_moles", label: "Unusual / Evolving Skin Moles" },
  { value: "brain_fog", label: "Brain Fog / Memory Lapses" },
  { value: "headaches", label: "Frequent Headaches / Dizziness" },
  { value: "hair_loss", label: "Hair Loss / Brittle Nails" },
  { value: "cough", label: "Persistent Chronic Cough" },
];

const FAMILY_HISTORY_OPTIONS = [
  { value: "heart_disease", label: "Heart Disease / Early Heart Attack" },
  { value: "hypertension", label: "Hypertension (High BP)" },
  { value: "diabetes", label: "Type 2 Diabetes" },
  { value: "colorectal_cancer", label: "Colorectal Cancer" },
  { value: "breast_cancer", label: "Breast / Ovarian Cancer" },
  { value: "prostate_cancer", label: "Prostate Cancer" },
  { value: "skin_cancer", label: "Melanoma / Skin Cancer" },
  { value: "stroke", label: "Stroke / Cerebrovascular Disease" },
  { value: "thyroid", label: "Thyroid Disorders" },
  { value: "osteoporosis", label: "Osteoporosis / Hip Fractures" },
  { value: "glaucoma", label: "Glaucoma" },
  { value: "kidney_disease", label: "Kidney Failure / Polycystic Kidney" },
];

const EXISTING_CONDITIONS_OPTIONS = [
  { value: "hypertension", label: "Hypertension (High Blood Pressure)" },
  { value: "diabetes", label: "Type 2 Diabetes" },
  { value: "high_cholesterol", label: "High Cholesterol / Dyslipidemia" },
  { value: "heart_disease", label: "Coronary Heart Disease" },
  { value: "fatty_liver", label: "Fatty Liver Disease (NAFLD/MASLD)" },
  { value: "thyroid_disorder", label: "Thyroid Disorder (Hypo/Hyper)" },
  { value: "anemia", label: "Anemia / Iron Deficiency" },
  { value: "osteoporosis", label: "Osteopenia / Osteoporosis" },
  { value: "asthma", label: "Asthma / COPD" },
  { value: "kidney_disease", label: "Chronic Kidney Disease" },
  { value: "osteoarthritis", label: "Osteoarthritis / Chronic Joint Pain" },
];

const CATEGORY_THEMES = {
  Cardiovascular: { color: "#ef4444", bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-600 dark:text-red-400" },
  Metabolic: { color: "#f97316", bg: "bg-orange-500/10", border: "border-orange-500/30", text: "text-orange-600 dark:text-orange-400" },
  Endocrine: { color: "#ec4899", bg: "bg-pink-500/10", border: "border-pink-500/30", text: "text-pink-600 dark:text-pink-400" },
  "Renal & Liver": { color: "#06b6d4", bg: "bg-cyan-500/10", border: "border-cyan-500/30", text: "text-cyan-600 dark:text-cyan-400" },
  "General & Blood": { color: "#8b5cf6", bg: "bg-violet-500/10", border: "border-violet-500/30", text: "text-violet-600 dark:text-violet-400" },
  "Cancer Screening": { color: "#dc2626", bg: "bg-rose-500/10", border: "border-rose-500/30", text: "text-rose-600 dark:text-rose-400" },
  Nutritional: { color: "#84cc16", bg: "bg-lime-500/10", border: "border-lime-500/30", text: "text-lime-600 dark:text-lime-400" },
  "Bone & Joint": { color: "#78716c", bg: "bg-stone-500/10", border: "border-stone-500/30", text: "text-stone-600 dark:text-stone-400" },
  "Vision & Hearing": { color: "#3b82f6", bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-600 dark:text-blue-400" },
  "Dental & Oral": { color: "#14b8a6", bg: "bg-teal-500/10", border: "border-teal-500/30", text: "text-teal-600 dark:text-teal-400" },
  Pulmonary: { color: "#0ea5e9", bg: "bg-sky-500/10", border: "border-sky-500/30", text: "text-sky-600 dark:text-sky-400" },
  "Men's Health": { color: "#6366f1", bg: "bg-indigo-500/10", border: "border-indigo-500/30", text: "text-indigo-600 dark:text-indigo-400" },
  Vaccinations: { color: "#10b981", bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-600 dark:text-emerald-400" },
  Custom: { color: "#a855f7", bg: "bg-purple-500/10", border: "border-purple-500/30", text: "text-purple-600 dark:text-purple-400" }
};

const PDF_COLOR_THEMES = {
  purple: { name: "ToolsTrek Violet", primary: [124, 0, 254], secondary: [99, 0, 220], accent: [243, 232, 255] },
  emerald: { name: "Clinical Emerald", primary: [5, 150, 105], secondary: [4, 120, 87], accent: [209, 250, 229] },
  navy: { name: "Executive Navy", primary: [30, 58, 138], secondary: [30, 64, 175], accent: [224, 231, 255] },
  slate: { name: "Modern Slate", primary: [51, 65, 85], secondary: [30, 41, 59], accent: [241, 245, 249] },
};

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function HealthCheckupRecommender() {
  const [step, setStep] = useState(1); // 1 = Form, 2 = Results & Customization
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("all_checkups"); // "all_checkups", "doctor_questions", "fasting_guide", "pdf_settings"
  
  // Empty form state
  const initialForm = {
    name: "",
    age: "",
    gender: "",
    bloodGroup: "",
    unitSystem: "metric", // "metric" | "imperial"
    weightKg: "",
    heightCm: "",
    weightLbs: "",
    heightFeet: "",
    heightInches: "",
    waistCm: "",
    smoking: "",
    alcohol: "",
    exercise: "",
    sleepHours: "",
    sleepQuality: "restful",
    dietPattern: "balanced",
    stressLevel: "moderate",
    sunExposure: "moderate",
    occupation: "desk_worker",
    symptoms: [],
    familyHistory: [],
    existingConditions: [],
    lastCheckup: "",
    currentMeds: "",
    allergies: "",
    userNotes: "",
  };

  const [form, setForm] = useState(initialForm);
  const [recommendedTests, setRecommendedTests] = useState([]);
  
  // Advanced Options toggle state (Step 1)
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  // Active advanced options count calculation
  const activeAdvancedCount = useMemo(() => {
    let count = 0;
    if (form.waistCm) count++;
    if (form.bloodGroup && form.bloodGroup !== "Unknown") count++;
    if (form.sleepHours || (form.sleepQuality && form.sleepQuality !== "restful")) count++;
    if (form.dietPattern && form.dietPattern !== "balanced") count++;
    if (form.lastCheckup) count++;
    if (form.symptoms && form.symptoms.length > 0) count += form.symptoms.length;
    if (form.familyHistory && form.familyHistory.length > 0) count += form.familyHistory.length;
    if (form.existingConditions && form.existingConditions.length > 0) count += form.existingConditions.length;
    if (form.currentMeds) count++;
    if (form.allergies) count++;
    if (form.userNotes) count++;
    return count;
  }, [form]);
  
  // Customization state for Results view
  const [selectedTestIds, setSelectedTestIds] = useState(new Set());
  const [testStatuses, setTestStatuses] = useState({}); // { [id]: "to_schedule" | "booked" | "completed" }
  const [customTests, setCustomTests] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedUrgency, setSelectedUrgency] = useState("All");
  const [selectedPrepFilter, setSelectedPrepFilter] = useState("All");
  const [sortBy, setSortBy] = useState("priority"); // "priority", "urgency", "name", "category"
  const [copiedToast, setCopiedToast] = useState(false);

  // PDF Customization Settings Modal/Options
  const [pdfSettings, setPdfSettings] = useState({
    reportTitle: "Personal Health & Preventive Screening Plan",
    clinicDoctorName: "",
    targetDate: new Date().toISOString().split("T")[0],
    themeColor: "purple",
    includePatientProfile: true,
    includeExecutiveSummary: true,
    includeCheckupCards: true,
    includeFastingGuide: true,
    includeDoctorQuestions: true,
    includeMedsAllergies: true,
    includeNotes: true,
    includeDisclaimer: true,
  });

  // Custom Test Creation Modal state
  const [showAddCustomModal, setShowAddCustomModal] = useState(false);
  const [newCustomTest, setNewCustomTest] = useState({
    name: "",
    category: "General & Blood",
    urgency: "routine",
    prepLabel: "Standard preparation",
    frequency: "Annual",
    biomarkers: "",
    description: "",
    reasons: "Added to custom personal health checklist by patient.",
  });

  // ── BMI Calculation & Dynamic Conversions ────────────────────────────────────
  const { bmi, bmiCategory, idealWeightRange } = useMemo(() => {
    let weightInKg = 0;
    let heightInM = 0;

    if (form.unitSystem === "metric") {
      weightInKg = parseFloat(form.weightKg) || 0;
      heightInM = (parseFloat(form.heightCm) || 0) / 100;
    } else {
      const lbs = parseFloat(form.weightLbs) || 0;
      weightInKg = lbs * 0.453592;
      const ft = parseFloat(form.heightFeet) || 0;
      const inch = parseFloat(form.heightInches) || 0;
      const totalInches = ft * 12 + inch;
      heightInM = totalInches * 0.0254;
    }

    if (weightInKg <= 0 || heightInM <= 0) {
      return { bmi: null, bmiCategory: null, idealWeightRange: null };
    }

    const calculatedBmi = parseFloat((weightInKg / (heightInM * heightInM)).toFixed(1));

    let cat = { label: "Normal Weight", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30" };
    if (calculatedBmi < 18.5) {
      cat = { label: "Underweight", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30" };
    } else if (calculatedBmi >= 25 && calculatedBmi < 30) {
      cat = { label: "Overweight", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30" };
    } else if (calculatedBmi >= 30 && calculatedBmi < 35) {
      cat = { label: "Obesity Class I", color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/30" };
    } else if (calculatedBmi >= 35) {
      cat = { label: "Obesity Class II/III", color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/30" };
    }

    const minIdealKg = 18.5 * (heightInM * heightInM);
    const maxIdealKg = 24.9 * (heightInM * heightInM);

    let idealRange = "";
    if (form.unitSystem === "metric") {
      idealRange = `${minIdealKg.toFixed(1)} – ${maxIdealKg.toFixed(1)} kg`;
    } else {
      idealRange = `${(minIdealKg * 2.20462).toFixed(1)} – ${(maxIdealKg * 2.20462).toFixed(1)} lbs`;
    }

    return { bmi: calculatedBmi, bmiCategory: cat, idealWeightRange: idealRange };
  }, [form.unitSystem, form.weightKg, form.heightCm, form.weightLbs, form.heightFeet, form.heightInches]);

  // ── Sync Units when switching Metric <-> Imperial ───────────────────────────
  const handleUnitSystemChange = (newSystem) => {
    if (newSystem === form.unitSystem) return;

    if (newSystem === "imperial") {
      const kg = parseFloat(form.weightKg);
      const cm = parseFloat(form.heightCm);
      const lbs = kg ? Math.round(kg * 2.20462) : "";
      let ft = "";
      let inch = "";
      if (cm) {
        const totalInches = cm / 2.54;
        ft = Math.floor(totalInches / 12);
        inch = Math.round(totalInches % 12);
      }
      setForm((prev) => ({
        ...prev,
        unitSystem: "imperial",
        weightLbs: lbs,
        heightFeet: ft,
        heightInches: inch,
      }));
    } else {
      const lbs = parseFloat(form.weightLbs);
      const ft = parseFloat(form.heightFeet) || 0;
      const inch = parseFloat(form.heightInches) || 0;
      const kg = lbs ? Math.round(lbs * 0.453592) : "";
      let cm = "";
      if (ft || inch) {
        cm = Math.round((ft * 12 + inch) * 2.54);
      }
      setForm((prev) => ({
        ...prev,
        unitSystem: "metric",
        weightKg: kg,
        heightCm: cm,
      }));
    }
  };

  // ── Multi-select toggle helper ──────────────────────────────────────────────
  const toggleArrayItem = (field, value) => {
    setForm((prev) => {
      const current = prev[field] || [];
      const updated = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];
      return { ...prev, [field]: updated };
    });
  };

  // ── Preset Loader ───────────────────────────────────────────────────────────
  const loadPreset = (presetId) => {
    const preset = DEMO_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setForm({ ...initialForm, ...preset.data });
      setShowAdvancedOptions(true);
    }
  };

  const handleClearForm = () => {
    setForm(initialForm);
    setRecommendedTests([]);
    setSelectedTestIds(new Set());
    setCustomTests([]);
    setShowAdvancedOptions(false);
    setStep(1);
    setActiveTab("all_checkups");
  };

  // ── Form Validation ─────────────────────────────────────────────────────────
  const isFormValid = () => {
    return !!(
      form.age &&
      parseInt(form.age) > 0 &&
      form.gender &&
      form.smoking &&
      form.alcohol &&
      form.exercise
    );
  };

  // ── Generate Recommendations ────────────────────────────────────────────────
  const handleGenerate = () => {
    if (!isFormValid()) return;
    setGenerating(true);

    setTimeout(() => {
      const computed = CHECKUP_DATABASE.filter((item) => item.conditions(form))
        .map((item) => ({
          ...item,
          score: item.priority(form),
          reasons: item.whyRecommended(form),
        }))
        .sort((a, b) => b.score - a.score);

      setRecommendedTests(computed);
      
      // By default, select all recommended tests
      const initialIds = new Set(computed.map((t) => t.id));
      setSelectedTestIds(initialIds);

      // Default all statuses to "to_schedule"
      const statuses = {};
      computed.forEach((t) => {
        statuses[t.id] = "to_schedule";
      });
      setTestStatuses(statuses);

      setStep(2);
      setGenerating(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 600);
  };

  // ── Custom Tests Management ─────────────────────────────────────────────────
  const handleAddCustomTest = () => {
    if (!newCustomTest.name.trim()) return;

    const customId = `custom_${Date.now()}`;
    const newTest = {
      id: customId,
      name: newCustomTest.name.trim(),
      category: newCustomTest.category || "Custom",
      icon: "🩺",
      prep: "custom_prep",
      prepLabel: newCustomTest.prepLabel || "Consult your physician",
      urgency: newCustomTest.urgency || "routine",
      description: newCustomTest.description || "Custom clinical investigation added by patient.",
      frequency: newCustomTest.frequency || "As prescribed",
      biomarkers: newCustomTest.biomarkers || "Clinician specified",
      score: 10,
      reasons: [newCustomTest.reasons || "Custom test requested for consultation."],
      doctorQuestions: ["Why is this specific test indicated for my health profile?"],
      isCustom: true,
    };

    setCustomTests((prev) => [newTest, ...prev]);
    setSelectedTestIds((prev) => new Set([...prev, customId]));
    setTestStatuses((prev) => ({ ...prev, [customId]: "to_schedule" }));
    setShowAddCustomModal(false);
    setNewCustomTest({
      name: "",
      category: "General & Blood",
      urgency: "routine",
      prepLabel: "Standard preparation",
      frequency: "Annual",
      biomarkers: "",
      description: "",
      reasons: "Added to custom personal health checklist by patient.",
    });
  };

  const handleRemoveCustomTest = (id) => {
    setCustomTests((prev) => prev.filter((t) => t.id !== id));
    setSelectedTestIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  // ── Checkbox Selection & Status Toggles ─────────────────────────────────────
  const toggleTestSelection = (id) => {
    setSelectedTestIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllTests = () => {
    const all = [...recommendedTests, ...customTests].map((t) => t.id);
    setSelectedTestIds(new Set(all));
  };

  const deselectAllTests = () => {
    setSelectedTestIds(new Set());
  };

  const selectUrgentOnly = () => {
    const urgentIds = [...recommendedTests, ...customTests]
      .filter((t) => t.urgency === "urgent" || t.urgency === "important")
      .map((t) => t.id);
    setSelectedTestIds(new Set(urgentIds));
  };

  const handleStatusChange = (id, newStatus) => {
    setTestStatuses((prev) => ({ ...prev, [id]: newStatus }));
  };

  // ── Filtered & Sorted Tests ──────────────────────────────────────────────────
  const combinedTests = useMemo(() => {
    return [...customTests, ...recommendedTests];
  }, [customTests, recommendedTests]);

  const categoriesList = useMemo(() => {
    const cats = new Set(combinedTests.map((t) => t.category));
    return ["All", ...Array.from(cats)];
  }, [combinedTests]);

  const filteredTests = useMemo(() => {
    return combinedTests
      .filter((t) => {
        // Category filter
        if (selectedCategory !== "All" && t.category !== selectedCategory) return false;
        // Urgency filter
        if (selectedUrgency !== "All" && t.urgency !== selectedUrgency) return false;
        // Prep filter
        if (selectedPrepFilter === "fasting" && !t.prep.includes("fasting")) return false;
        if (selectedPrepFilter === "no_prep" && t.prep !== "no_prep") return false;
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = t.name.toLowerCase().includes(q);
          const matchCat = t.category.toLowerCase().includes(q);
          const matchBio = (t.biomarkers || "").toLowerCase().includes(q);
          const matchDesc = t.description.toLowerCase().includes(q);
          if (!matchName && !matchCat && !matchBio && !matchDesc) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "priority") return b.score - a.score;
        if (sortBy === "urgency") {
          const rank = { urgent: 3, important: 2, routine: 1 };
          return rank[b.urgency] - rank[a.urgency];
        }
        if (sortBy === "name") return a.name.localeCompare(b.name);
        if (sortBy === "category") return a.category.localeCompare(b.category);
        return 0;
      });
  }, [combinedTests, selectedCategory, selectedUrgency, selectedPrepFilter, searchQuery, sortBy]);

  // Counts
  const totalCount = combinedTests.length;
  const selectedCount = [...selectedTestIds].filter((id) =>
    combinedTests.some((t) => t.id === id)
  ).length;
  const urgentCount = combinedTests.filter((t) => t.urgency === "urgent").length;
  const importantCount = combinedTests.filter((t) => t.urgency === "important").length;
  const routineCount = combinedTests.filter((t) => t.urgency === "routine").length;
  const fastingCount = combinedTests.filter((t) => t.prep.includes("fasting")).length;

  // ── Copy Plan Summary to Clipboard ──────────────────────────────────────────
  const handleCopySummary = () => {
    const selected = combinedTests.filter((t) => selectedTestIds.has(t.id));
    const lines = [
      `HEALTH CHECKUP & PREVENTIVE SCREENING REPORT`,
      `Generated via ToolsTrek (${SITE_URL}/tools/health-checkup-recommender)`,
      `--------------------------------------------------`,
      `Patient: ${form.name || "Anonymous"} | Age: ${form.age} | Gender: ${form.gender}`,
      `BMI: ${bmi ? `${bmi} (${bmiCategory?.label})` : "N/A"} | Blood Group: ${form.bloodGroup || "Not specified"}`,
      `Smoking: ${form.smoking} | Alcohol: ${form.alcohol} | Exercise: ${form.exercise}`,
      ``,
      `SUMMARY OF SELECTED TESTS (${selected.length} Tests):`,
      ...selected.map((t, idx) => {
        return `${idx + 1}. [${t.urgency.toUpperCase()}] ${t.name}\n   • Category: ${t.category}\n   • Schedule: ${t.frequency}\n   • Preparation: ${t.prepLabel}\n   • Targets: ${t.biomarkers}\n`;
      }),
      ``,
      `DOCTOR QUESTIONS TO DISCUSS:`,
      ...selected.flatMap((t) => t.doctorQuestions || []).slice(0, 8).map((q) => `• ${q}`),
      ``,
      `Notes: ${form.userNotes || "None"}`,
      `Disclaimer: For informational and educational purposes only. Always consult a licensed physician.`
    ];

    navigator.clipboard.writeText(lines.join("\n"));
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 3000);
  };

  // ── Print Directly ───────────────────────────────────────────────────────────
  const handlePrint = () => {
    window.print();
  };

  // ─── PROFESSIONAL PDF GENERATOR ──────────────────────────────────────────
  const generatePDFReport = () => {
    const theme  = PDF_COLOR_THEMES[pdfSettings.themeColor] || PDF_COLOR_THEMES.purple;
    const doc    = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageW  = 210;
    const pageH  = 297;
    const M      = 14;
    const CW     = pageW - M * 2; // 182 mm
    const FOOTER = 16;
    const LH     = 4.2;
    let   y      = M;

    const testsForPDF = combinedTests.filter((t) => selectedTestIds.has(t.id));

    // ── Unicode → ASCII sanitiser (Helvetica doesn't support Unicode) ──────────
    const sanitize = (txt) =>
      String(txt || "")
        .replace(/\u2265/g, ">=")   // ≥
        .replace(/\u2264/g, "<=")   // ≤
        .replace(/\u2260/g, "!=")   // ≠
        .replace(/\u2248/g, "~=")   // ≈
        .replace(/\u00b1/g, "+/-")  // ±
        .replace(/\u00d7/g, "x")    // ×
        .replace(/\u00f7/g, "/")    // ÷
        .replace(/\u2192/g, "->")   // →
        .replace(/\u2190/g, "<-")   // ←
        .replace(/\u2014/g, " - ")  // —  em-dash
        .replace(/\u2013/g, "-")    // –  en-dash
        .replace(/\u2022/g, "-")    // •  bullet
        .replace(/\u00b0/g, " deg") // °
        .replace(/\u03bc/g, "u")    // μ  micro
        .replace(/\u03b1/g, "alpha")// α
        .replace(/\u03b2/g, "beta") // β
        .replace(/\u2019/g, "'")    // '  right single quote
        .replace(/\u2018/g, "'")    // '  left single quote
        .replace(/\u201c/g, '"')    // "  left double quote
        .replace(/\u201d/g, '"')    // "  right double quote
        .replace(/[^\x00-\x7F]/g, "?"); // catch-all for any remaining non-ASCII

    // safe text-wrap – sanitises then splits
    const wrap = (txt, maxW) =>
      doc.splitTextToSize(sanitize(txt), Math.max(Number(maxW) || 20, 20));

    const pageHeader = () => {
      doc.setFillColor(...theme.primary);
      doc.rect(0, 0, pageW, 2, "F");
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(130, 130, 150);
      const hdr = [pdfSettings.reportTitle, form.name ? `• ${form.name}` : "", `• ${SITE_DOMAIN}`]
        .filter(Boolean).join(" ");
      doc.text(wrap(hdr, CW - 10), M, 10);
      doc.setDrawColor(220, 220, 235);
      doc.line(M, 13, pageW - M, 13);
    };

    const need = (h) => {
      if (y + h > pageH - FOOTER - 2) {
        doc.addPage();
        pageHeader();
        y = 18;
      }
    };

    // ── COVER HEADER ──────────────────────────────────────────────────────────
    doc.setFillColor(...theme.primary);
    doc.rect(0, 0, pageW, 36, "F");
    doc.setFillColor(...theme.secondary);
    doc.rect(0, 33, pageW, 3, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(15);
    doc.setFont("helvetica", "bold");
    doc.text(wrap(pdfSettings.reportTitle || "Personal Health Screening Plan", CW - 6), M, 13);

    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    const dateStr = new Date(pdfSettings.targetDate || Date.now()).toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric",
    });
    doc.text(sanitize(`Generated: ${dateStr}   |   ${SITE_URL}`), M, 23);
    const byLine = pdfSettings.clinicDoctorName
      ? `Consultation: ${pdfSettings.clinicDoctorName}`
      : "Prepared for Clinical Consultation & Personal Health Record";
    doc.text(wrap(byLine, CW), M, 29);
    y = 42;

    // ── 1. PATIENT PROFILE ───────────────────────────────────────────────────
    if (pdfSettings.includePatientProfile) {
      const halfW = (CW - 4) / 2;
      const LBLW  = 28;
      const VALW  = halfW - LBLW - 2;
      const rX    = M + halfW + 4;

      const gStr = form.gender
        ? form.gender.charAt(0).toUpperCase() + form.gender.slice(1)
        : "Not specified";
      const bStr = (form.bloodGroup && form.bloodGroup !== "Unknown")
        ? ` | Blood: ${form.bloodGroup}` : "";
      const wStr = form.unitSystem === "metric"
        ? `${form.weightKg || "-"} kg, ${form.heightCm || "-"} cm`
        : `${form.weightLbs || "-"} lbs, ${form.heightFeet || 0}'${form.heightInches || 0}"`;

      const leftRows = [
        ["Patient Name:", form.name || "Anonymous Patient"],
        ["Age / Gender:", `${form.age || "-"} yrs (${gStr})${bStr}`],
        ["Measurements:", wStr],
        ["BMI:", bmi ? `${bmi} — ${bmiCategory?.label || "Normal"}` : "Not calculated"],
        ...(idealWeightRange ? [["Ideal Range:", idealWeightRange]] : []),
      ];
      const rightRows = [
        ["Tobacco:",      form.smoking    ? form.smoking.replace(/_/g, " ")    : "Not specified"],
        ["Alcohol:",      form.alcohol    ? form.alcohol.replace(/_/g, " ")    : "Not specified"],
        ["Exercise:",     form.exercise   ? form.exercise.replace(/_/g, " ")   : "Not specified"],
        ["Sleep:",        form.sleepHours ? `${form.sleepHours.replace("_", "–")} hrs` : "Not specified"],
        ["Diet:",         form.dietPattern ? form.dietPattern.replace(/_/g, " ") : "Balanced"],
        ["Last Checkup:", form.lastCheckup ? form.lastCheckup.replace(/_/g, " ") : "Not specified"],
      ];

      const leftH  = leftRows.reduce( (s, [, v]) => s + wrap(v, VALW).length * LH + 1.5, 0);
      const rightH = rightRows.reduce((s, [, v]) => s + wrap(v, VALW).length * LH + 1.5, 0);
      const boxH   = Math.max(leftH, rightH) + 12;
      need(boxH);

      doc.setFillColor(247, 249, 252);
      doc.roundedRect(M, y, CW, boxH, 2.5, 2.5, "F");
      doc.setDrawColor(220, 228, 240);
      doc.roundedRect(M, y, CW, boxH, 2.5, 2.5, "S");

      doc.setFillColor(...theme.primary);
      doc.roundedRect(M + 4, y - 2.5, 34, 5.5, 1.5, 1.5, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(6.5);
      doc.setFont("helvetica", "bold");
      doc.text("PATIENT PROFILE", M + 7, y + 1.2);

      doc.setDrawColor(220, 228, 240);
      doc.line(M + halfW + 2, y + 6, M + halfW + 2, y + boxH - 2);

      let ry = y + 8;
      leftRows.forEach(([lbl, val]) => {
        const lines = wrap(val, VALW);
        doc.setFont("helvetica", "bold"); doc.setFontSize(7.2);
        doc.setTextColor(80, 95, 115);
        doc.text(lbl, M + 5, ry);
        doc.setFont("helvetica", "normal"); doc.setTextColor(15, 23, 42);
        doc.text(lines, M + 5 + LBLW, ry);
        ry += lines.length * LH + 1.5;
      });
      ry = y + 8;
      rightRows.forEach(([lbl, val]) => {
        const lines = wrap(val, VALW);
        doc.setFont("helvetica", "bold"); doc.setFontSize(7.2);
        doc.setTextColor(80, 95, 115);
        doc.text(lbl, rX, ry);
        doc.setFont("helvetica", "normal"); doc.setTextColor(15, 23, 42);
        doc.text(lines, rX + LBLW, ry);
        ry += lines.length * LH + 1.5;
      });
      y += boxH + 5;
    }

    // ── 2. SUMMARY METRICS ────────────────────────────────────────────────────
    if (pdfSettings.includeExecutiveSummary) {
      need(16);
      const cW = (CW - 9) / 4;
      [
        { lbl: "SELECTED TESTS",  val: `${testsForPDF.length} / ${totalCount}`, clr: theme.primary,  bg: [246, 244, 255] },
        { lbl: "URGENT PRIORITY", val: String(urgentCount),                        clr: [220,  38,  38], bg: [255, 242, 242] },
        { lbl: "IMPORTANT",       val: String(importantCount),                     clr: [200, 110,   0], bg: [255, 251, 235] },
        { lbl: "FASTING REQ.",    val: String(fastingCount),                       clr: [30,   90, 210], bg: [239, 246, 255] },
      ].forEach(({ lbl, val, clr, bg }, i) => {
        const cx = M + i * (cW + 3);
        doc.setFillColor(...bg);   doc.roundedRect(cx, y, cW, 14, 2, 2, "F");
        doc.setDrawColor(...clr);  doc.roundedRect(cx, y, cW, 14, 2, 2, "S");
        doc.setTextColor(...clr);
        doc.setFontSize(10); doc.setFont("helvetica", "bold");
        doc.text(val, cx + cW / 2, y + 5.5, { align: "center" });
        doc.setFontSize(5.8);
        doc.text(lbl, cx + cW / 2, y + 10,  { align: "center" });
      });
      y += 18;
    }

    // ── 3. CHECKUP CARDS ──────────────────────────────────────────────────────
    if (pdfSettings.includeCheckupCards && testsForPDF.length > 0) {
      need(10);
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(10.5); doc.setFont("helvetica", "bold");
      doc.text("Recommended Clinical Checkups & Diagnostic Screenings", M, y);
      doc.setFontSize(7); doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text(wrap(`${testsForPDF.length} personalized tests based on your risk profile`, CW), M, y + 4.5);
      y += 9;

      const UC_MAP = {
        urgent:    { stroke: [210, 35,  35],  bg: [255, 242, 242], txt: [185, 28,  28],  lbl: "URGENT"    },
        important: { stroke: [210, 110,  0],  bg: [255, 251, 235], txt: [180, 83,   9],  lbl: "IMPORTANT" },
        routine:   { stroke: [22,  160,  72], bg: [240, 253, 244], txt: [21,  128,  61], lbl: "ROUTINE"   },
      };

      testsForPDF.forEach((item, idx) => {
        const uc = UC_MAP[item.urgency] || UC_MAP.routine;

        const nameLines = wrap(item.name,                                          CW - 22);
        const prepLines = wrap(`Prep: ${item.prepLabel || "Standard protocol"}`,  CW - 18);
        const descLines = wrap(item.description || "",                              CW - 12);
        const freqLines = wrap(item.frequency   || "Annual",                       CW - 26);
        const bioLines  = item.biomarkers ? wrap(item.biomarkers,                  CW - 26) : [];
        const rsnGroups = (item.reasons || []).map((r) => wrap(`• ${r}`,          CW - 18));
        const totalRsnH = rsnGroups.reduce((s, g) => s + g.length * LH + 0.8, 0);

        const cardH = 5
          + nameLines.length * LH + 2
          + 5.5
          + prepLines.length * LH + 1.5
          + descLines.length * LH + 2
          + freqLines.length * LH + 1.5
          + (bioLines.length  > 0 ? bioLines.length * LH + 2 : 0)
          + (rsnGroups.length > 0 ? totalRsnH + 4.5           : 0)
          + 4;

        need(cardH + 3);

        doc.setFillColor(252, 253, 255);
        doc.roundedRect(M, y, CW, cardH, 2, 2, "F");
        doc.setDrawColor(220, 230, 242);
        doc.roundedRect(M, y, CW, cardH, 2, 2, "S");
        doc.setFillColor(...uc.stroke);
        doc.rect(M, y, 2.8, cardH, "F");

        doc.setFillColor(...theme.primary);
        doc.circle(M + 8, y + 7, 3.2, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(6.5); doc.setFont("helvetica", "bold");
        doc.text(String(idx + 1), M + 8, y + 9, { align: "center" });

        let cy = y + 5;

        // name
        doc.setTextColor(15, 23, 42);
        doc.setFontSize(8.5); doc.setFont("helvetica", "bold");
        doc.text(nameLines, M + 14, cy);
        cy += nameLines.length * LH + 2;

        // badges
        doc.setFillColor(...uc.bg);
        doc.roundedRect(M + 14, cy - 3, 22, 4, 1, 1, "F");
        doc.setTextColor(...uc.txt);
        doc.setFontSize(5.5); doc.setFont("helvetica", "bold");
        doc.text(uc.lbl, M + 25, cy - 0.3, { align: "center" });

        doc.setFillColor(240, 244, 250);
        doc.roundedRect(M + 38, cy - 3, 32, 4, 1, 1, "F");
        doc.setTextColor(70, 85, 110);
        doc.setFontSize(5.5); doc.setFont("helvetica", "normal");
        doc.text((wrap(item.category, 30)[0] || item.category), M + 54, cy - 0.3, { align: "center" });
        cy += 5.5;

        // prep
        doc.setFontSize(6.8); doc.setFont("helvetica", "bold");
        doc.setTextColor(67, 56, 202);
        doc.text(prepLines, M + 5, cy);
        cy += prepLines.length * LH + 1.5;

        // description
        doc.setFontSize(7.2); doc.setFont("helvetica", "normal");
        doc.setTextColor(50, 65, 85);
        doc.text(descLines, M + 5, cy);
        cy += descLines.length * LH + 2;

        // schedule
        doc.setFontSize(7); doc.setFont("helvetica", "bold");
        doc.setTextColor(79, 70, 229);
        doc.text("Schedule:", M + 5, cy);
        doc.setFont("helvetica", "normal"); doc.setTextColor(50, 65, 85);
        doc.text(freqLines, M + 24, cy);
        cy += freqLines.length * LH + 1.5;

        // biomarkers
        if (bioLines.length > 0) {
          doc.setFontSize(6.8); doc.setFont("helvetica", "bold");
          doc.setTextColor(10, 115, 105);
          doc.text("Biomarkers:", M + 5, cy);
          doc.setFont("helvetica", "normal"); doc.setTextColor(50, 65, 85);
          doc.text(bioLines, M + 25, cy);
          cy += bioLines.length * LH + 2;
        }

        // rationale bullets
        if (rsnGroups.length > 0) {
          doc.setFontSize(6.6); doc.setFont("helvetica", "bold");
          doc.setTextColor(80, 95, 115);
          doc.text("Why for your profile:", M + 5, cy);
          cy += LH + 0.5;
          doc.setFont("helvetica", "normal"); doc.setTextColor(100, 115, 135);
          rsnGroups.forEach((lines) => {
            doc.text(lines, M + 7, cy);
            cy += lines.length * LH + 0.8;
          });
        }

        y += cardH + 3;
      });
      y += 3;
    }

    // ── 4. DOCTOR QUESTIONS ───────────────────────────────────────────────────
    if (pdfSettings.includeDoctorQuestions) {
      const qs = testsForPDF.flatMap((t) => t.doctorQuestions || []).slice(0, 12);
      if (qs.length > 0) {
        const qWrapped = qs.map((q) => wrap(q, CW - 22));
        const boxH = 12 + qWrapped.reduce((s, g) => s + g.length * LH + 2.5, 0) + 3;
        need(boxH);

        doc.setFillColor(247, 249, 252);
        doc.roundedRect(M, y, CW, boxH, 2, 2, "F");
        doc.setDrawColor(210, 220, 232);
        doc.roundedRect(M, y, CW, boxH, 2, 2, "S");

        doc.setTextColor(15, 23, 42);
        doc.setFontSize(9); doc.setFont("helvetica", "bold");
        doc.text("Doctor Consultation Checklist  (Printable)", M + 6, y + 6.5);

        let qy = y + 11;
        qWrapped.forEach((lines) => {
          doc.setDrawColor(110, 125, 145);
          doc.rect(M + 6, qy - 2.8, 3, 3, "S");
          doc.setFontSize(7.2); doc.setFont("helvetica", "normal");
          doc.setTextColor(50, 65, 85);
          doc.text(lines, M + 12, qy);
          qy += lines.length * LH + 2.5;
        });
        y += boxH + 5;
      }
    }

    // ── 5. MEDICATIONS & NOTES ────────────────────────────────────────────────
    if (pdfSettings.includeMedsAllergies && (form.currentMeds || form.allergies || form.userNotes)) {
      const VALW2 = CW - 38;
      const mL = wrap(form.currentMeds || "None listed",        VALW2);
      const aL = wrap(form.allergies   || "No known allergies", VALW2);
      const nL = wrap(form.userNotes   || "None provided",      VALW2);
      const boxH = 11 + (mL.length + aL.length + nL.length) * LH + 10;
      need(boxH);

      doc.setFillColor(255, 252, 228);
      doc.roundedRect(M, y, CW, boxH, 2, 2, "F");
      doc.setDrawColor(250, 235, 130);
      doc.roundedRect(M, y, CW, boxH, 2, 2, "S");

      doc.setTextColor(133, 77, 14);
      doc.setFontSize(8.5); doc.setFont("helvetica", "bold");
      doc.text("Patient Medications, Allergies & Consultation Notes", M + 6, y + 6.5);

      let ny = y + 11.5;
      [
        ["Medications / Supplements:", mL],
        ["Known Drug / Food Allergies:", aL],
        ["Consultation Notes:", nL],
      ].forEach(([lbl, lines]) => {
        doc.setFont("helvetica", "bold"); doc.setFontSize(7.2);
        doc.setTextColor(115, 63, 18);
        doc.text(lbl, M + 6, ny);
        doc.setFont("helvetica", "normal"); doc.setTextColor(50, 65, 85);
        doc.text(lines, M + 38, ny);
        ny += lines.length * LH + 2;
      });
      y += boxH + 5;
    }

    // ── FOOTER (every page) ───────────────────────────────────────────────────
    const totalPgs = doc.internal.getNumberOfPages();
    const disclaim = wrap(
      "Disclaimer: For educational screening guidance only. Consult a licensed physician before ordering any tests.",
      CW - 50
    );
    for (let i = 1; i <= totalPgs; i++) {
      doc.setPage(i);
      doc.setFillColor(247, 249, 252);
      doc.rect(0, pageH - FOOTER, pageW, FOOTER, "F");
      doc.setDrawColor(215, 222, 235);
      doc.line(M, pageH - FOOTER, pageW - M, pageH - FOOTER);
      doc.setFontSize(6.5); doc.setFont("helvetica", "normal");
      doc.setTextColor(120, 130, 150);
      doc.text(disclaim, M, pageH - FOOTER + 4.5);
      doc.text(
        `Page ${i} of ${totalPgs}  •  ${SITE_DOMAIN}`,
        pageW - M, pageH - FOOTER + 4.5,
        { align: "right" }
      );
    }

    const fname = (form.name || "health_report").toLowerCase().replace(/[^a-z0-9]/g, "_");
    doc.save(`${fname}_${Date.now()}.pdf`);
  };

  // ─── RENDER ──────────────────────────────────────────────────────────────────
  return (
    <ToolPageShell widthClassName="max-w-6xl">
      {/* ── TOOL HEADER ─── */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-700 dark:text-violet-300 text-xs font-semibold uppercase tracking-wider mb-3">
          <Stethoscope className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
          Evidence-Based Preventive Health Intelligence
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-3">
          Health Checkup{" "}
          <span className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 bg-clip-text text-transparent">
            Recommender
          </span>
        </h1>
        <p className="max-w-2xl mx-auto text-gray-600 dark:text-gray-300 text-sm sm:text-base leading-relaxed">
          Generate an intelligent, personalized medical checkup schedule tailored to your age, genetics, 
          lifestyle, and existing conditions. Customize your diagnostic checklist and export a doctor-ready PDF report.
        </p>

        {/* Demo Preset Selector Banner */}
        {step === 1 && (
          <div className="mt-6 max-w-2xl mx-auto p-4 rounded-2xl bg-gradient-to-r from-violet-500/5 via-fuchsia-500/5 to-indigo-500/5 border border-violet-200/60 dark:border-violet-800/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-violet-600 dark:text-violet-400 flex-shrink-0 animate-pulse" />
              <div>
                <p className="text-xs font-bold text-gray-900 dark:text-white">Quick Demo Presets</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Load realistic sample profiles with 1-click</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              {DEMO_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => loadPreset(preset.id)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-gray-800 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-700/60 hover:bg-violet-50 dark:hover:bg-violet-900/30 transition shadow-sm active:scale-95"
                >
                  {preset.data.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── STEP 1: COMPREHENSIVE INPUT FORM ─── */}
      {step === 1 && (
        <div className="space-y-6">
          {/* Section 1: Demographics & Anthropometrics */}
          <div className="bg-white dark:bg-gray-900/80 rounded-2xl p-5 sm:p-6 border border-gray-200/80 dark:border-gray-800 shadow-sm">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-white">1. Personal Demographics & Vitals</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Basic biological baseline and body measurements</p>
                </div>
              </div>

              {/* Unit System Switcher */}
              <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-xs">
                <button
                  type="button"
                  onClick={() => handleUnitSystemChange("metric")}
                  className={`px-3 py-1 rounded-lg font-medium transition ${
                    form.unitSystem === "metric"
                      ? "bg-white dark:bg-gray-700 text-violet-600 dark:text-violet-300 shadow-sm"
                      : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  Metric (kg/cm)
                </button>
                <button
                  type="button"
                  onClick={() => handleUnitSystemChange("imperial")}
                  className={`px-3 py-1 rounded-lg font-medium transition ${
                    form.unitSystem === "imperial"
                      ? "bg-white dark:bg-gray-700 text-violet-600 dark:text-violet-300 shadow-sm"
                      : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  Imperial (lbs/ft)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Full Name */}
              <div className="lg:col-span-1">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Full Name <span className="text-gray-400 font-normal">(optional for PDF)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Alex Johnson"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl text-sm bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                />
              </div>

              {/* Age */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Age (Years) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  placeholder="e.g. 38"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl text-sm bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Biological Gender <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, gender: "male" })}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                      form.gender === "male"
                        ? "bg-violet-600 text-white border-violet-600 shadow-sm"
                        : "bg-gray-50 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-violet-400"
                    }`}
                  >
                    ♂ Male
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, gender: "female" })}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                      form.gender === "female"
                        ? "bg-fuchsia-600 text-white border-fuchsia-600 shadow-sm"
                        : "bg-gray-50 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-fuchsia-400"
                    }`}
                  >
                    ♀ Female
                  </button>
                </div>
              </div>

              {/* Blood Group */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Blood Group <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <select
                  value={form.bloodGroup}
                  onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl text-sm bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A Positive (A+)</option>
                  <option value="A-">A Negative (A-)</option>
                  <option value="B+">B Positive (B+)</option>
                  <option value="B-">B Negative (B-)</option>
                  <option value="AB+">AB Positive (AB+)</option>
                  <option value="AB-">AB Negative (AB-)</option>
                  <option value="O+">O Positive (O+)</option>
                  <option value="O-">O Negative (O-)</option>
                  <option value="Unknown">Unknown / Not Tested</option>
                </select>
              </div>
            </div>

            {/* Height & Weight Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800/80">
              {form.unitSystem === "metric" ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 75"
                      value={form.weightKg}
                      onChange={(e) => setForm({ ...form, weightKg: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl text-sm bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Height (cm)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 175"
                      value={form.heightCm}
                      onChange={(e) => setForm({ ...form, heightCm: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl text-sm bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Weight (lbs)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 165"
                      value={form.weightLbs}
                      onChange={(e) => setForm({ ...form, weightLbs: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl text-sm bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Feet (ft)
                      </label>
                      <input
                        type="number"
                        placeholder="5"
                        value={form.heightFeet}
                        onChange={(e) => setForm({ ...form, heightFeet: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl text-sm bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Inches (in)
                      </label>
                      <input
                        type="number"
                        placeholder="9"
                        value={form.heightInches}
                        onChange={(e) => setForm({ ...form, heightInches: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl text-sm bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Waist Circumference */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Waist Size (cm) <span className="text-gray-400 font-normal">(visceral fat)</span>
                </label>
                <input
                  type="number"
                  placeholder="e.g. 88"
                  value={form.waistCm}
                  onChange={(e) => setForm({ ...form, waistCm: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl text-sm bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                />
              </div>

              {/* Live BMI Display Card */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Body Mass Index (BMI)
                </label>
                {bmi ? (
                  <div className={`p-2.5 rounded-xl border flex items-center justify-between ${bmiCategory?.bg} ${bmiCategory?.border}`}>
                    <div>
                      <span className={`text-base font-extrabold ${bmiCategory?.color}`}>{bmi}</span>
                      <span className="text-[11px] text-gray-500 ml-1.5">kg/m²</span>
                    </div>
                    <span className={`text-xs font-bold ${bmiCategory?.color}`}>{bmiCategory?.label}</span>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-dashed border-gray-200 dark:border-gray-700 text-xs text-gray-400 text-center">
                    Enter height & weight
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Core Behavioral Habits */}
          <div className="bg-white dark:bg-gray-900/80 rounded-2xl p-5 sm:p-6 border border-gray-200/80 dark:border-gray-800 shadow-sm">
            <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-gray-100 dark:border-gray-800">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">2. Core Lifestyle Habits</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Essential lifestyle baseline for health risk assessment</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Tobacco */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Smoking & Tobacco History <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "never", label: "Never Smoked" },
                    { id: "former", label: "Former Smoker" },
                    { id: "light", label: "Light (<10/day)" },
                    { id: "current", label: "Heavy (10+/day)" },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setForm({ ...form, smoking: opt.id })}
                      className={`p-2 rounded-xl text-xs font-medium border transition ${
                        form.smoking === opt.id
                          ? "bg-violet-600 text-white border-violet-600 font-bold"
                          : "bg-gray-50 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-violet-400"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Alcohol */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Alcohol Intake <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "none", label: "None / Teetotaler" },
                    { id: "occasional", label: "Occasional (1-2/mo)" },
                    { id: "moderate", label: "Moderate (1-7/wk)" },
                    { id: "heavy", label: "Heavy (>14/wk)" },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setForm({ ...form, alcohol: opt.id })}
                      className={`p-2 rounded-xl text-xs font-medium border transition ${
                        form.alcohol === opt.id
                          ? "bg-violet-600 text-white border-violet-600 font-bold"
                          : "bg-gray-50 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-violet-400"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Physical Activity */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Physical Activity / Exercise <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "sedentary", label: "Sedentary (Desk)" },
                    { id: "light", label: "Light (1-2 days)" },
                    { id: "moderate", label: "Moderate (3-4 days)" },
                    { id: "active", label: "Active (5+ days)" },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setForm({ ...form, exercise: opt.id })}
                      className={`p-2 rounded-xl text-xs font-medium border transition ${
                        form.exercise === opt.id
                          ? "bg-violet-600 text-white border-violet-600 font-bold"
                          : "bg-gray-50 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-violet-400"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── ADVANCED OPTIONS SECTION TOGGLE BANNER ─── */}
          <div className="rounded-2xl border border-violet-200/80 dark:border-violet-800/60 bg-gradient-to-r from-violet-500/5 via-fuchsia-500/5 to-indigo-500/5 p-4 sm:p-5 shadow-sm transition-all">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-violet-600 text-white shadow-md shadow-violet-500/20 mt-0.5 sm:mt-0 flex-shrink-0">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                      Advanced Clinical Options & Risk Profiling
                    </h3>
                    {activeAdvancedCount > 0 && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-violet-600 text-white shadow-sm">
                        {activeAdvancedCount} Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                    Optional: Expand to add symptoms, family genetic risks, diagnosed conditions, sleep, diet, medications, and allergies for in-depth recommendations.
                  </p>
                </div>
              </div>

              <button
                type="button"
                id="advanced-options-toggle-btn"
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm border transition-all flex items-center gap-2 whitespace-nowrap shadow-sm active:scale-95 cursor-pointer flex-shrink-0 ${
                  showAdvancedOptions
                    ? "bg-violet-600 text-white border-violet-600 shadow-violet-500/20"
                    : "bg-white dark:bg-gray-800 text-violet-700 dark:text-violet-300 border-violet-300 dark:border-violet-700 hover:bg-violet-50 dark:hover:bg-violet-900/40"
                }`}
              >
                <Sliders className="w-4 h-4" />
                {showAdvancedOptions ? "Hide Advanced Options" : "Show Advanced Options"}
                {showAdvancedOptions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {/* Quick preview pill row when collapsed */}
            {!showAdvancedOptions && activeAdvancedCount > 0 && (
              <div className="mt-3 pt-3 border-t border-violet-200/50 dark:border-violet-800/40 flex items-center gap-1.5 flex-wrap text-[11px]">
                <span className="text-gray-500 font-semibold">Configured Parameters:</span>
                {form.symptoms.length > 0 && (
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-800 dark:text-amber-300 font-medium">
                    {form.symptoms.length} Symptom(s)
                  </span>
                )}
                {form.familyHistory.length > 0 && (
                  <span className="px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-800 dark:text-indigo-300 font-medium">
                    {form.familyHistory.length} Family Risk(s)
                  </span>
                )}
                {form.existingConditions.length > 0 && (
                  <span className="px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-800 dark:text-rose-300 font-medium">
                    {form.existingConditions.length} Condition(s)
                  </span>
                )}
                {form.currentMeds && (
                  <span className="px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-800 dark:text-blue-300 font-medium">
                    Medications Added
                  </span>
                )}
                {form.allergies && (
                  <span className="px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-800 dark:text-purple-300 font-medium">
                    Allergies Noted
                  </span>
                )}
              </div>
            )}
          </div>

          {/* ── EXPANDABLE ADVANCED SECTIONS ─── */}
          {showAdvancedOptions && (
            <div className="space-y-6 animate-fadeIn">
              {/* Advanced Section 1: Sleep, Diet & Checkup History */}
              <div className="bg-white dark:bg-gray-900/80 rounded-2xl p-5 sm:p-6 border border-gray-200/80 dark:border-gray-800 shadow-sm">
                <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-gray-100 dark:border-gray-800">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <Moon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">Sleep Quality, Diet & Checkup History</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Chronobiology, nutrition, and preventive surveillance timelines</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Sleep Duration */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Nightly Sleep Duration
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { id: "less_5", label: "<5h" },
                        { id: "5_6", label: "5–6h" },
                        { id: "7_8", label: "7–8h" },
                        { id: "9_plus", label: "9h+" },
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setForm({ ...form, sleepHours: opt.id })}
                          className={`py-2 rounded-xl text-xs font-medium border transition ${
                            form.sleepHours === opt.id
                              ? "bg-violet-600 text-white border-violet-600 font-bold"
                              : "bg-gray-50 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-violet-400"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Diet Pattern */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Primary Diet Pattern
                    </label>
                    <select
                      value={form.dietPattern}
                      onChange={(e) => setForm({ ...form, dietPattern: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl text-xs bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                    >
                      <option value="balanced">Balanced Whole-Foods (Mediterranean)</option>
                      <option value="vegetarian">Vegetarian / Vegan (Plant-Based)</option>
                      <option value="high_sodium">High Sodium / Red Meat Heavy</option>
                      <option value="fast_food">Fast Food / High Sugar / Processed</option>
                      <option value="keto">Keto / Low-Carb High Fat</option>
                    </select>
                  </div>

                  {/* Last Medical Checkup */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Time Since Last Full Checkup
                    </label>
                    <select
                      value={form.lastCheckup}
                      onChange={(e) => setForm({ ...form, lastCheckup: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl text-xs bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                    >
                      <option value="">Select timeframe</option>
                      <option value="within_year">Within past 12 months</option>
                      <option value="1_2_years">1 to 2 years ago</option>
                      <option value="more_than_2_years">More than 2 years ago</option>
                      <option value="never">Never had a comprehensive checkup</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Advanced Section 2: Current Symptoms & Warning Signs */}
              <div className="bg-white dark:bg-gray-900/80 rounded-2xl p-5 sm:p-6 border border-gray-200/80 dark:border-gray-800 shadow-sm">
                <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-gray-100 dark:border-gray-800">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">Active Symptoms & Warning Signs</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Select any symptoms you want specifically addressed in your screening recommendations</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {SYMPTOMS_OPTIONS.map((sym) => {
                    const isSelected = form.symptoms.includes(sym.value);
                    return (
                      <button
                        key={sym.value}
                        type="button"
                        onClick={() => toggleArrayItem("symptoms", sym.value)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
                          isSelected
                            ? "bg-amber-500/20 text-amber-900 dark:text-amber-200 border-amber-500/50 font-bold shadow-sm"
                            : "bg-gray-50 dark:bg-gray-800/60 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-amber-400"
                        }`}
                      >
                        {isSelected ? "✓ " : "+ "}
                        {sym.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Advanced Section 3: Family Genetic History & Diagnosed Conditions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Family History */}
                <div className="bg-white dark:bg-gray-900/80 rounded-2xl p-5 sm:p-6 border border-gray-200/80 dark:border-gray-800 shadow-sm">
                  <div className="flex items-center gap-2 pb-3 mb-4 border-b border-gray-100 dark:border-gray-800">
                    <Dna className="w-5 h-5 text-indigo-500" />
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white">Family Genetic History</h3>
                      <p className="text-[11px] text-gray-500">First-degree relatives (Parents, Siblings)</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {FAMILY_HISTORY_OPTIONS.map((item) => {
                      const isSelected = form.familyHistory.includes(item.value);
                      return (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => toggleArrayItem("familyHistory", item.value)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
                            isSelected
                              ? "bg-indigo-600 text-white border-indigo-600 font-bold shadow-sm"
                              : "bg-gray-50 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-indigo-400"
                          }`}
                        >
                          {isSelected ? "✓ " : "+ "}
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Existing Conditions */}
                <div className="bg-white dark:bg-gray-900/80 rounded-2xl p-5 sm:p-6 border border-gray-200/80 dark:border-gray-800 shadow-sm">
                  <div className="flex items-center gap-2 pb-3 mb-4 border-b border-gray-100 dark:border-gray-800">
                    <Pill className="w-5 h-5 text-rose-500" />
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white">Existing Personal Diagnoses</h3>
                      <p className="text-[11px] text-gray-500">Conditions diagnosed by a physician</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {EXISTING_CONDITIONS_OPTIONS.map((item) => {
                      const isSelected = form.existingConditions.includes(item.value);
                      return (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => toggleArrayItem("existingConditions", item.value)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
                            isSelected
                              ? "bg-rose-600 text-white border-rose-600 font-bold shadow-sm"
                              : "bg-gray-50 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-rose-400"
                          }`}
                        >
                          {isSelected ? "✓ " : "+ "}
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Advanced Section 4: Current Medications, Allergies & Notes */}
              <div className="bg-white dark:bg-gray-900/80 rounded-2xl p-5 sm:p-6 border border-gray-200/80 dark:border-gray-800 shadow-sm">
                <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-gray-100 dark:border-gray-800">
                  <FileText className="w-5 h-5 text-blue-500" />
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">Current Medications, Allergies & Doctor Notes</h3>
                    <p className="text-xs text-gray-500">Included automatically in your printed / downloadable PDF report</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Prescription Medications & Supplements
                    </label>
                    <textarea
                      rows="2"
                      placeholder="e.g. Metformin 500mg, Atorvastatin 20mg, Multivitamin"
                      value={form.currentMeds}
                      onChange={(e) => setForm({ ...form, currentMeds: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl text-xs bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Known Drug & Food Allergies
                    </label>
                    <textarea
                      rows="2"
                      placeholder="e.g. Penicillin (Hives), Sulfa drugs, Peanuts"
                      value={form.allergies}
                      onChange={(e) => setForm({ ...form, allergies: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl text-xs bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Custom Notes / Consultation Objectives
                    </label>
                    <textarea
                      rows="2"
                      placeholder="e.g. Request full blood work before annual overseas trip"
                      value={form.userNotes}
                      onChange={(e) => setForm({ ...form, userNotes: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl text-xs bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={!isFormValid() || generating}
              className="w-full sm:flex-1 py-4 px-6 rounded-2xl font-bold text-white text-base bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 hover:opacity-95 shadow-lg shadow-violet-500/25 transition active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {generating ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Analyzing Clinical Risk Algorithms…
                </>
              ) : (
                <>
                  <Stethoscope className="w-5 h-5" />
                  Generate My Personalized Health Plan
                  <ArrowRight className="w-5 h-5 ml-1" />
                </>
              )}
            </button>

            {(form.name || form.age || form.gender || activeAdvancedCount > 0) && (
              <button
                type="button"
                onClick={handleClearForm}
                className="w-full sm:w-auto py-4 px-6 rounded-2xl font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm transition"
              >
                Reset All
              </button>
            )}
          </div>

          {!isFormValid() && (form.age || form.gender) && (
            <p className="text-center text-xs text-amber-600 dark:text-amber-400 font-medium">
              ⚠️ Please complete all required fields: Age, Gender, Smoking, Alcohol, and Exercise level.
            </p>
          )}
        </div>
      )}


      {/* ── STEP 2: RESULTS & FULLY CUSTOMIZABLE INTERACTIVE PLAN ─── */}
      {step === 2 && (
        <div className="space-y-6">
          {/* Executive Header Banner */}
          <div className="rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-violet-600 via-purple-700 to-indigo-800 text-white shadow-xl shadow-violet-500/20 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white/90 text-xs font-semibold backdrop-blur-md mb-2">
                  <span>✓</span> Patient Health Assessment Complete
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {form.name ? `${form.name}'s` : "Your"} Personalized Health Plan
                </h2>
                <p className="text-violet-100 text-xs sm:text-sm mt-1 max-w-xl">
                  {selectedCount} of {totalCount} diagnostic screenings currently selected in your custom plan. 
                  Customize your checklist below or export to a high-resolution PDF.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={generatePDFReport}
                  className="px-4 py-2.5 rounded-xl bg-white text-violet-700 hover:bg-violet-50 font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-2 active:scale-95 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-violet-700" />
                  Download PDF Report
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-3.5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs sm:text-sm backdrop-blur-md transition flex items-center gap-1.5 active:scale-95"
                >
                  <Printer className="w-4 h-4" />
                  Print
                </button>
                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="px-3.5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs sm:text-sm backdrop-blur-md transition flex items-center gap-1.5 active:scale-95"
                >
                  {copiedToast ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  {copiedToast ? "Copied!" : "Copy Text"}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-3.5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs sm:text-sm backdrop-blur-md transition flex items-center gap-1.5 active:scale-95"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Profile
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/20">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 text-center">
                <div className="text-xl sm:text-2xl font-black text-rose-300">{urgentCount}</div>
                <div className="text-[11px] font-semibold text-white/80 uppercase">Urgent Priority</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 text-center">
                <div className="text-xl sm:text-2xl font-black text-amber-300">{importantCount}</div>
                <div className="text-[11px] font-semibold text-white/80 uppercase">Important</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 text-center">
                <div className="text-xl sm:text-2xl font-black text-emerald-300">{routineCount}</div>
                <div className="text-[11px] font-semibold text-white/80 uppercase">Routine Preventive</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 text-center">
                <div className="text-xl sm:text-2xl font-black text-cyan-300">{fastingCount}</div>
                <div className="text-[11px] font-semibold text-white/80 uppercase">Fasting Required</div>
              </div>
            </div>
          </div>

          {/* ── SUB-NAV TABS ─── */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 border-b border-gray-200 dark:border-gray-800 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("all_checkups")}
                className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-1.5 ${
                  activeTab === "all_checkups"
                    ? "bg-violet-600 text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <Layers className="w-4 h-4" />
                Checkup Plan ({selectedCount}/{totalCount})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("doctor_questions")}
                className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-1.5 ${
                  activeTab === "doctor_questions"
                    ? "bg-violet-600 text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                Doctor Discussion Guide
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("fasting_guide")}
                className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-1.5 ${
                  activeTab === "fasting_guide"
                    ? "bg-violet-600 text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <Clock className="w-4 h-4" />
                Lab Preparation Rules
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("pdf_settings")}
                className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-1.5 ${
                  activeTab === "pdf_settings"
                    ? "bg-violet-600 text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <Settings className="w-4 h-4" />
                PDF Customizer
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowAddCustomModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 hover:bg-violet-100 font-bold text-xs border border-violet-200 dark:border-violet-700 flex items-center gap-1.5 transition whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Custom Test
            </button>
          </div>

          {/* ── TAB 1: ALL CHECKUPS VIEW ─── */}
          {activeTab === "all_checkups" && (
            <div className="space-y-5">
              {/* Filter and Search Toolbar */}
              <div className="p-4 rounded-2xl bg-white dark:bg-gray-900/80 border border-gray-200/80 dark:border-gray-800 shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  {/* Search */}
                  <div className="relative w-full sm:flex-1">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search test name, organ, biomarkers (e.g. glucose, cholesterol, liver)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                    />
                  </div>

                  {/* Urgency Filter */}
                  <select
                    value={selectedUrgency}
                    onChange={(e) => setSelectedUrgency(e.target.value)}
                    className="w-full sm:w-auto px-3 py-2 rounded-xl text-xs bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                  >
                    <option value="All">All Urgency Levels</option>
                    <option value="urgent">Urgent Priority Only</option>
                    <option value="important">Important Only</option>
                    <option value="routine">Routine Preventive</option>
                  </select>

                  {/* Prep Filter */}
                  <select
                    value={selectedPrepFilter}
                    onChange={(e) => setSelectedPrepFilter(e.target.value)}
                    className="w-full sm:w-auto px-3 py-2 rounded-xl text-xs bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                  >
                    <option value="All">All Prep Requirements</option>
                    <option value="fasting">Fasting Required Only</option>
                    <option value="no_prep">No Special Prep Only</option>
                  </select>

                  {/* Sort By */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full sm:w-auto px-3 py-2 rounded-xl text-xs bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                  >
                    <option value="priority">Sort: Risk Score (Default)</option>
                    <option value="urgency">Sort: Urgency Level</option>
                    <option value="name">Sort: Name (A–Z)</option>
                    <option value="category">Sort: Category</option>
                  </select>
                </div>

                {/* Category Pills & Bulk Selection Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-gray-100 dark:border-gray-800 text-xs">
                  {/* Category Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                    {categoriesList.map((cat) => {
                      const countInCat = cat === "All" 
                        ? combinedTests.length 
                        : combinedTests.filter((t) => t.category === cat).length;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setSelectedCategory(cat)}
                          className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition ${
                            selectedCategory === cat
                              ? "bg-violet-600 text-white font-bold"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200"
                          }`}
                        >
                          {cat} <span className="opacity-70 text-[10px]">({countInCat})</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Bulk Select Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={selectAllTests}
                      className="text-violet-600 dark:text-violet-400 hover:underline font-semibold"
                    >
                      Select All
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      type="button"
                      onClick={selectUrgentOnly}
                      className="text-amber-600 dark:text-amber-400 hover:underline font-semibold"
                    >
                      Urgent Only
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      type="button"
                      onClick={deselectAllTests}
                      className="text-gray-500 hover:underline"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>
              </div>

              {/* Checkup Cards List */}
              <div className="space-y-3.5">
                {filteredTests.length === 0 ? (
                  <div className="p-8 text-center bg-white dark:bg-gray-900/80 rounded-2xl border border-gray-200 dark:border-gray-800 text-gray-500">
                    No diagnostic tests matched your current filter criteria.
                  </div>
                ) : (
                  filteredTests.map((item, index) => {
                    const isSelected = selectedTestIds.has(item.id);
                    const currentStatus = testStatuses[item.id] || "to_schedule";
                    const themeObj = CATEGORY_THEMES[item.category] || CATEGORY_THEMES.Custom;

                    const urgencyLabels = {
                      urgent: { text: "URGENT PRIORITY", bg: "bg-rose-500/10 text-rose-600 border-rose-500/30" },
                      important: { text: "IMPORTANT", bg: "bg-amber-500/10 text-amber-600 border-amber-500/30" },
                      routine: { text: "ROUTINE PREVENTIVE", bg: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" },
                    };
                    const urgBadge = urgencyLabels[item.urgency] || urgencyLabels.routine;

                    return (
                      <div
                        key={item.id}
                        className={`rounded-2xl border transition-all duration-200 p-5 ${
                          isSelected
                            ? "bg-white dark:bg-gray-900/90 border-gray-200/90 dark:border-gray-700/80 shadow-sm"
                            : "bg-gray-50/70 dark:bg-gray-900/30 border-gray-200/40 dark:border-gray-800/40 opacity-70"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                          {/* Left: Checkbox + Title + Badges */}
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            {/* Checkbox for inclusion in plan */}
                            <button
                              type="button"
                              onClick={() => toggleTestSelection(item.id)}
                              className="mt-0.5 text-violet-600 dark:text-violet-400 hover:opacity-80 transition"
                              title={isSelected ? "Remove from plan & PDF" : "Include in plan & PDF"}
                            >
                              {isSelected ? (
                                <CheckSquare className="w-5 h-5 text-violet-600" />
                              ) : (
                                <Square className="w-5 h-5 text-gray-400" />
                              )}
                            </button>

                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                <span className="text-xl">{item.icon}</span>
                                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                  {item.name}
                                </h3>
                                {item.isCustom && (
                                  <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                                    CUSTOM
                                  </span>
                                )}
                              </div>

                              {/* Badges Bar */}
                              <div className="flex flex-wrap items-center gap-2 mb-2.5 text-xs">
                                <span className={`px-2.5 py-0.5 rounded-lg font-extrabold border text-[10px] ${urgBadge.bg}`}>
                                  {urgBadge.text}
                                </span>
                                <span className={`px-2 py-0.5 rounded-lg font-semibold text-[11px] ${themeObj.bg} ${themeObj.text}`}>
                                  {item.category}
                                </span>
                                <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-[11px] font-medium flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {item.prepLabel}
                                </span>
                              </div>

                              {/* Clinical Description */}
                              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
                                {item.description}
                              </p>

                              {/* Schedule & Biomarkers */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800 mb-3">
                                <div>
                                  <span className="font-bold text-violet-700 dark:text-violet-300">Recommended Schedule: </span>
                                  <span className="text-gray-700 dark:text-gray-300">{item.frequency}</span>
                                </div>
                                {item.biomarkers && (
                                  <div>
                                    <span className="font-bold text-teal-700 dark:text-teal-300">Key Biomarkers / Targets: </span>
                                    <span className="text-gray-700 dark:text-gray-300">{item.biomarkers}</span>
                                  </div>
                                )}
                              </div>

                              {/* Why Recommended Reasons */}
                              {item.reasons && item.reasons.length > 0 && (
                                <div className="space-y-1">
                                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                    Why Recommended for Your Risk Profile:
                                  </p>
                                  <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                                    {item.reasons.map((r, ri) => (
                                      <li key={ri} className="flex items-start gap-1.5">
                                        <span className="text-emerald-500 font-bold">✓</span>
                                        <span>{r}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Right: Status Tracker Dropdown & Delete Custom */}
                          <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] text-gray-400 font-medium sm:hidden">Status:</span>
                              <select
                                value={currentStatus}
                                onChange={(e) => handleStatusChange(item.id, e.target.value)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                                  currentStatus === "completed"
                                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/40"
                                    : currentStatus === "booked"
                                    ? "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/40"
                                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700"
                                }`}
                              >
                                <option value="to_schedule">⏳ To Schedule</option>
                                <option value="booked">📅 Booked / Scheduled</option>
                                <option value="completed">✅ Completed</option>
                              </select>
                            </div>

                            {item.isCustom && (
                              <button
                                type="button"
                                onClick={() => handleRemoveCustomTest(item.id)}
                                className="text-xs text-rose-500 hover:text-rose-700 flex items-center gap-1 p-1"
                                title="Delete Custom Investigation"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* ── TAB 2: DOCTOR DISCUSSION GUIDE ─── */}
          {activeTab === "doctor_questions" && (
            <div className="bg-white dark:bg-gray-900/80 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm space-y-5">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  🩺 Targeted Questions to Ask Your Physician
                </h3>
                <p className="text-xs text-gray-500">
                  Evidence-based conversation starters compiled from your specific profile risks and selected screening tests.
                </p>
              </div>

              <div className="space-y-3">
                {combinedTests
                  .filter((t) => selectedTestIds.has(t.id) && t.doctorQuestions?.length > 0)
                  .map((t) => (
                    <div key={t.id} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-2 mb-2 font-bold text-xs text-violet-700 dark:text-violet-400">
                        <span>{t.icon}</span>
                        <span>{t.name}</span>
                      </div>
                      <ul className="space-y-1.5">
                        {t.doctorQuestions.map((q, idx) => (
                          <li key={idx} className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                            <span className="text-violet-500 font-bold">Q:</span>
                            <span>{q}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ── TAB 3: FASTING & LAB PREPARATION RULES ─── */}
          {activeTab === "fasting_guide" && (
            <div className="bg-white dark:bg-gray-900/80 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm space-y-5">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  📋 Diagnostic Fasting & Pre-Test Instructions
                </h3>
                <p className="text-xs text-gray-500">
                  Ensure accurate blood draws, clear ultrasound imaging, and reliable biometric test results.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-800">
                  <h4 className="text-sm font-bold text-cyan-800 dark:text-cyan-300 mb-2 flex items-center gap-1.5">
                    <Clock className="w-4 h-4" /> 10–12 Hour Overnight Fasting
                  </h4>
                  <p className="text-xs text-cyan-900/80 dark:text-cyan-200 leading-relaxed mb-2">
                    Required for Lipid Panels (Triglycerides), Fasting Blood Glucose, and Comprehensive Liver Panels.
                  </p>
                  <ul className="text-xs text-cyan-900/80 dark:text-cyan-200 space-y-1 list-disc list-inside">
                    <li>Drink plain water freely (good hydration makes blood draw easier).</li>
                    <li>Avoid morning coffee, tea, juices, gum, and smoking.</li>
                    <li>Take essential chronic medications with water unless told otherwise.</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800">
                  <h4 className="text-sm font-bold text-indigo-800 dark:text-indigo-300 mb-2 flex items-center gap-1.5">
                    <Droplet className="w-4 h-4" /> Early Morning Timing Rules
                  </h4>
                  <p className="text-xs text-indigo-900/80 dark:text-indigo-200 leading-relaxed mb-2">
                    Hormones such as Cortisol, Total & Free Testosterone, and Iron peak between 7:00 AM – 9:30 AM.
                  </p>
                  <ul className="text-xs text-indigo-900/80 dark:text-indigo-200 space-y-1 list-disc list-inside">
                    <li>Schedule appointment for early morning.</li>
                    <li>Hold thyroid hormone pills until immediately AFTER blood draw.</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                  <h4 className="text-sm font-bold text-amber-800 dark:text-amber-300 mb-2 flex items-center gap-1.5">
                    <Heart className="w-4 h-4" /> Blood Pressure & ECG Rules
                  </h4>
                  <ul className="text-xs text-amber-900/80 dark:text-amber-200 space-y-1 list-disc list-inside">
                    <li>Avoid nicotine, vaping, caffeine, and energy drinks 30–60 minutes prior.</li>
                    <li>Empty your bladder before sitting down for the blood pressure reading.</li>
                    <li>Sit silently with feet flat on the floor for 5 minutes before cuff measurement.</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
                  <h4 className="text-sm font-bold text-purple-800 dark:text-purple-300 mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> Mammogram & DEXA Imaging Prep
                  </h4>
                  <ul className="text-xs text-purple-900/80 dark:text-purple-200 space-y-1 list-disc list-inside">
                    <li>Do NOT wear deodorant, talcum powder, or lotions underarms for mammograms.</li>
                    <li>Do not take calcium supplements for 24 hours prior to a DEXA bone density scan.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 4: PDF CUSTOMIZER SETTINGS ─── */}
          {activeTab === "pdf_settings" && (
            <div className="bg-white dark:bg-gray-900/80 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">⚙️ PDF Report Branding & Content Customizer</h3>
                  <p className="text-xs text-gray-500">Configure what appears on your downloaded PDF document</p>
                </div>
                <button
                  type="button"
                  onClick={generatePDFReport}
                  className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export Now
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Custom Report Document Title
                  </label>
                  <input
                    type="text"
                    value={pdfSettings.reportTitle}
                    onChange={(e) => setPdfSettings({ ...pdfSettings, reportTitle: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Physician / Clinic Name Header
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Anderson - City Health Clinic"
                    value={pdfSettings.clinicDoctorName}
                    onChange={(e) => setPdfSettings({ ...pdfSettings, clinicDoctorName: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>

              {/* Color Theme Selector */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  PDF Color Theme Palette
                </label>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(PDF_COLOR_THEMES).map(([key, theme]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setPdfSettings({ ...pdfSettings, themeColor: key })}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-2 ${
                        pdfSettings.themeColor === key
                          ? "border-violet-600 bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300"
                          : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: `rgb(${theme.primary.join(",")})` }}
                      />
                      {theme.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Section Toggles */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Include / Exclude PDF Sections
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
                  {[
                    { key: "includePatientProfile", label: "Patient Profile & Vitals" },
                    { key: "includeExecutiveSummary", label: "Executive Metrics Counters" },
                    { key: "includeCheckupCards", label: "Detailed Checkup Cards" },
                    { key: "includeDoctorQuestions", label: "Doctor Questions Checklist" },
                    { key: "includeMedsAllergies", label: "Medications, Allergies & Notes" },
                    { key: "includeDisclaimer", label: "Medical Disclaimer & Site Footer" },
                  ].map(({ key, label }) => (
                    <label
                      key={key}
                      className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={pdfSettings[key]}
                        onChange={(e) => setPdfSettings({ ...pdfSettings, [key]: e.target.checked })}
                        className="rounded text-violet-600 focus:ring-violet-500"
                      />
                      <span className="font-medium text-gray-700 dark:text-gray-300">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── FOOTER ACTIONS & MEDICAL DISCLAIMER ─── */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-300 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Medical Disclaimer:</strong> This health checkup recommender tool provides evidence-based screening suggestions for informational and preventive planning purposes. It does not provide medical diagnosis or replace consultation with a licensed physician. Always discuss test orders and clinical interpretations with your healthcare provider.
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              type="button"
              onClick={generatePDFReport}
              className="w-full sm:flex-1 py-4 px-6 rounded-2xl font-bold text-white text-base bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 hover:opacity-95 shadow-lg shadow-violet-500/25 transition active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-5 h-5" />
              Download Full Customized PDF Health Report
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full sm:w-auto py-4 px-6 rounded-2xl font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm transition"
            >
              Edit My Profile
            </button>
          </div>
        </div>
      )}

      {/* ── ADD CUSTOM TEST MODAL ─── */}
      {showAddCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 max-w-lg w-full border border-gray-200 dark:border-gray-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-violet-600" />
                Add Custom Investigation / Test
              </h3>
              <button
                type="button"
                onClick={() => setShowAddCustomModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Test / Investigation Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cardiac MRI, Food Allergy IgE Panel, Homocysteine"
                  value={newCustomTest.name}
                  onChange={(e) => setNewCustomTest({ ...newCustomTest, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  <select
                    value={newCustomTest.category}
                    onChange={(e) => setNewCustomTest({ ...newCustomTest, category: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700"
                  >
                    <option value="Cardiovascular">Cardiovascular</option>
                    <option value="Metabolic">Metabolic</option>
                    <option value="General & Blood">General & Blood</option>
                    <option value="Cancer Screening">Cancer Screening</option>
                    <option value="Nutritional">Nutritional</option>
                    <option value="Bone & Joint">Bone & Joint</option>
                    <option value="Custom">Custom / Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Priority Urgency
                  </label>
                  <select
                    value={newCustomTest.urgency}
                    onChange={(e) => setNewCustomTest({ ...newCustomTest, urgency: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700"
                  >
                    <option value="urgent">Urgent Priority</option>
                    <option value="important">Important</option>
                    <option value="routine">Routine Preventive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Preparation Instructions (Fasting, Meds, etc.)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 10 Hours Fasting, Avoid antihistamines for 48h"
                  value={newCustomTest.prepLabel}
                  onChange={(e) => setNewCustomTest({ ...newCustomTest, prepLabel: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Clinical Description & Goals
                </label>
                <textarea
                  rows="2"
                  placeholder="Briefly describe what this test checks and why you want to discuss it..."
                  value={newCustomTest.description}
                  onChange={(e) => setNewCustomTest({ ...newCustomTest, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setShowAddCustomModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddCustomTest}
                disabled={!newCustomTest.name.trim()}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white shadow-md disabled:opacity-50"
              >
                Add to My Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </ToolPageShell>
  );
}
