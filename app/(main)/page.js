import Hero from "./tools-compo/Hero";
import HServices from "./tools-compo/HServices";
import HCategories from "./tools-compo/HCategories";
import { Suspense } from "react";
import HeroSkeleton from "./tools-compo/Home-Compo/HeroSkeleton";
import WhyChooseUs from "./tools-compo/WhyChooseUs";

export default function Home() {
  return (
    <div
      className="min-h-screen  text-gray-900 dark:text-white transition-colors duration-300"
      suppressHydrationWarning
    >
      {/* Hero Section */}
      <Suspense fallback={<HeroSkeleton />}>
        <Hero />
      </Suspense>
      {/* Services Section */}
      <HServices />
      {/* Categories Section */}
      <HCategories />
      {/* Modern Why Choose Us Section */}
      <WhyChooseUs />
    </div>
  );
}
