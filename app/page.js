import Hero from "./tools-compo/Hero";
import HServices from "./tools-compo/HServices";
import Reviews from "./tools-compo/Home-Compo/Reviews";
import CTA from "./tools-compo/Home-Compo/CTA";
import { Suspense } from "react";
import HeroSkeleton from "./tools-compo/Home-Compo/HeroSkeleton";
import {
  Zap,
  CloudOff,
  Clock,
  ShieldCheck,
  CircleDollarSign,
  MonitorSmartphone,
} from "lucide-react";

const whychoose = [
  {
    title: "Easy to Use",
    description:
      "No complicated setup, no confusion. ToolsTrek is designed for effortless navigation, ensuring anyone can use it without hassle.",
    icon: <Zap size={24} />,
    gradient: "from-blue-500/20 to-cyan-500/20",
  },
  {
    title: "No Installation",
    description:
      "Instant access, no downloads. Our tools run completely online, letting you work from any device without storage or update worries.",
    icon: <CloudOff size={24} />,
    gradient: "from-purple-500/20 to-pink-500/20",
  },
  {
    title: "Save Time",
    description:
      "Efficiency is key. Our tools streamline your tasks, cutting out unnecessary steps so you can get things done in seconds.",
    icon: <Clock size={24} />,
    gradient: "from-orange-500/20 to-yellow-500/20",
  },
  {
    title: "Privacy First",
    description:
      "Your data stays yours. Most of our tools process information locally in your browser, meaning your sensitive data never even touches our servers.",
    icon: <ShieldCheck size={24} />,
    gradient: "from-green-500/20 to-emerald-500/20",
  },
  {
    title: "Always Free",
    description:
      "No subscriptions, no hidden fees, and no 'pro' versions. Access every single tool in our library completely free of charge, forever.",
    icon: <CircleDollarSign size={24} />,
    gradient: "from-red-500/20 to-rose-500/20",
  },
  {
    title: "Cross-Platform",
    description:
      "Whether you're on a high-end PC, a tablet, or a smartphone, ToolsTrek adapts to your screen size for a seamless experience everywhere.",
    icon: <MonitorSmartphone size={24} />,
    gradient: "from-indigo-500/20 to-blue-500/20",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <Suspense fallback={<HeroSkeleton />}>
        <Hero />
      </Suspense>

      {/* Services Section */}
      <HServices />

      {/* Modern Why Choose Us Section */}
      <section className="relative py-24 overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-30">
          <div className="absolute top-24 left-10 w-72 h-72 bg-brandColor/20 rounded-full blur-3xl" />
          <div className="absolute bottom-24 right-10 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block px-4 py-1.5 mb-4 text-sm font-semibold tracking-wider text-brandColor uppercase bg-brandColor/10 rounded-full">
              Why ToolsTrek?
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
              Why Our Tools Work Best for You?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              We focus on speed, accessibility, and simplicity so you can focus
              on your work.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {whychoose.map((item, index) => (
              <div
                key={index}
                className="group relative bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-brandColor/10 hover:-translate-y-1 overflow-hidden"
              >
                {/* Icon Container */}
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 rounded-xl bg-linear-to-br ${item.gradient} mb-6 group-hover:scale-110 transition-transform duration-300 text-gray-800 dark:text-white`}
                >
                  {/* Render Lucide Icon directly */}
                  {item.icon}
                </div>

                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  {item.title}
                </h3>

                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {item.description}
                </p>

                {/* Decorative bottom line */}
                <div className="absolute bottom-0 left-0 h-1 w-0 bg-brandColor transition-all duration-300 group-hover:w-full rounded-b-2xl" />

                {/* Optional: Subtle background glow on hover */}
                <div
                  className={`absolute -inset-2 bg-linear-to-br ${item.gradient} opacity-0 group-hover:opacity-5 transition-opacity blur-2xl -z-10`}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <Reviews />
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-12 bg-white">
        <CTA />
      </div>
    </div>
  );
}
