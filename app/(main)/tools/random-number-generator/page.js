import RandomNumberGenerator from "@/app/(main)/tools-compo/tools/RandomNumberGenerator";
import React from "react";

export const metadata = {
  title: "Random Number Generator (RNG Studio) — ToolsTrek",
  description:
    "Free online customizable Random Number Generator. Features Cryptographic CSPRNG & Seeded PRNG, range generation, polyhedral RPG dice roller (D20, D6, Advantage/Disadvantage), statistical distributions (Gaussian Bell Curve, Poisson, Binomial), lottery & raffle picker, interactive histogram, and multi-format export (JSON, CSV, Python, JS, SQL).",
  keywords: [
    "random number generator",
    "rng",
    "online random number generator",
    "true random number generator",
    "csprng",
    "seeded random generator",
    "d20 roller",
    "dice roller online",
    "gaussian random number generator",
    "normal distribution generator",
    "lottery number generator",
    "raffle winner picker",
    "pin code generator",
    "random number list",
    "math tools",
    "developer tools",
    "ToolsTrek"
  ],
  openGraph: {
    title: "Random Number Generator (RNG Studio) — ToolsTrek",
    description:
      "Generate customizable random numbers with CSPRNG security, seeded reproducibility, RPG dice, Gaussian distributions, lottery simulator, and real-time histogram analytics.",
    url: "https://toolstrek.vercel.app/tools/random-number-generator",
    siteName: "ToolsTrek",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Random Number Generator (RNG Studio) — ToolsTrek",
    description:
      "Fully customizable modern Random Number Generator with CSPRNG, seeded PRNG, RPG dice roller, Gaussian probability distribution, and live histogram.",
  },
};

const page = () => {
  return (
    <div>
      <RandomNumberGenerator />
    </div>
  );
};

export default page;
