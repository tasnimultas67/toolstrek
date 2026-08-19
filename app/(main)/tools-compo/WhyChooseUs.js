import React from "react";
import SectionInfo from "./SectionInfo";
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

const WhyChooseUs = () => {
  return (
    <div>
      <section className="relative py-24 overflow-hidden ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <SectionInfo
              title="Why ToolsTrek?"
              subtitle="Why Our Tools *Work Best* for You?"
              description="We focus on speed, accessibility, and simplicity so you can focus
              on your work."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {whychoose.map((item, index) => (
              <WhyChooseUsCard key={index} index={index} item={item} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default WhyChooseUs;

const WhyChooseUsCard = ({ item, index }) => {
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
