import Hero from "./tools-compo/Hero";
import {
  Calculator,
  Clock,
  MousePointer,
  MousePointerClick,
  Scissors,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import HServices from "./tools-compo/HServices";

const whychoose = [
  {
    title: "Easy to Use",
    description:
      "Intuitive interfaces designed for everyone from students to professionals. ",
    icon: <MousePointerClick className="w-12 h-12 text-white" />,
  },
  {
    title: "No Installation",
    description:
      "Access all tools directly in your browser with no downloads required.",
    icon: <Scissors className="w-8 h-8 text-blue-600" />,
  },
  {
    title: "Save Time",
    description:
      "Get instant results without manual calculations or complex formulas.",
    icon: <Clock className="w-8 h-8 text-blue-600" />,
  },
];

export default function Home() {
  return (
    <div>
      <div>
        <Hero />
        <HServices />
        <div className="bg-gradient-to-b from-gray-50 to-white">
          {/* Features Section */}
          <section className="pt-12 pb-28 px-4 sm:px-6 lg:px-8 bg-white">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">
                Why Choose Our Tools?
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {whychoose.map((item, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-b from-blue-600 to-blue-800 rounded-lg p-6 "
                  >
                    <div className="mb-4">{item.icon}</div>
                    <h3 className="text-xl font-semibold mb-2 text-white">
                      {item.title}
                    </h3>
                    <p className="text-gray-50 text-sm">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className="py-16 px-4 sm:px-6 lg:px-8 bg-blue-600 text-white">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">
                Ready to Simplify Your Tasks?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Explore our full collection of tools designed to make your daily
                calculations effortless.
              </p>
              <Button asChild variant="secondary" size="lg">
                <Link href="#tools">Browse All Tools</Link>
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
