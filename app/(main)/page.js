import Hero from "./tools-compo/Hero";
import HServices from "./tools-compo/HServices";
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

      {/* Modern Why Choose Us Section */}
      <section className="relative py-24 overflow-hidden ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block px-4 py-1.5 mb-4 text-sm font-semibold tracking-wider text-brandColor uppercase bg-brandColor/10 rounded-full">
              Why ToolsTrek?
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white tracking-tight">
              Why Our Tools Work Best for You?
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              We focus on speed, accessibility, and simplicity so you can focus
              on your work.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {whychoose.map((item, index) => (
              <WhyChooseUs key={index} index={index} item={item} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

const WhyChooseUs = ({ item, index }) => {
  return (
    <div
      key={index}
      className="group relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 transition-all duration-300  overflow-hidden space-y-10 md:space-y-14"
    >
      {/* Icon Container */}
      <div
        className={`inline-flex items-center justify-center w-16 h-16 rounded-xl bg-linear-to-br ${item.gradient} text-gray-800 dark:text-white`}
      >
        {/* Render Lucide Icon directly */}
        {item.icon}
      </div>

      <div className="">
        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
          {item.title}
        </h3>

        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          {item.description}
        </p>
      </div>
    </div>
  );
};
