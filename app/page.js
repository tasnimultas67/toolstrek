import Hero from "./tools-compo/Hero";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import HServices from "./tools-compo/HServices";
import Image from "next/image";
import Reviews from "./tools-compo/Home-Compo/Reviews";

const whychoose = [
  {
    title: "Easy to Use",
    description:
      "No complicated setup, no confusion. ToolsTrek is designed for effortless navigation, ensuring anyone can use it without hassle. Get results fast and efficiently",
    icon: (
      <Image
        src="/easytouse.svg"
        width={100}
        height={100}
        alt="card icon"
        className="size-16"
      />
    ),
  },
  {
    title: "No Installation",
    description:
      "Instant access, no downloads. Our tools run completely online, letting you work from any device without storage or update worries. Just open and start using—simple as that!",
    icon: (
      <Image
        src="/noinstallation.svg"
        width={100}
        height={100}
        alt="card icon"
        className="size-16"
      />
    ),
  },
  {
    title: "Save Time",
    description:
      "Efficiency is key. Our tools streamline your tasks, cutting out unnecessary steps so you can get things done in seconds. Work smarter, not harder!",
    icon: (
      <Image
        src="/savetime.svg"
        width={100}
        height={100}
        alt="card icon"
        className="size-16 "
      />
    ),
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
            <div className="max-w-5xl mx-auto">
              <h2 className="text-5xl font-semibold text-center mb-20">
                Why Our Tools Work Best for You?
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {whychoose.map((item, index) => (
                  <div key={index} className="bg-brandColor rounded-lg p-6 ">
                    <div className="mb-4">{item.icon}</div>
                    <h3 className="text-xl font-medium mb-2 mt-10 text-white">
                      {item.title}
                    </h3>
                    <p className="text-gray-200 text-sm font-light">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className="py-16 px-4 sm:px-6 lg:px-8 bg-brandColor text-white">
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
          {/* Reviews */}
        </div>
        <div className="m-auto">
          <Reviews></Reviews>
        </div>
      </div>
    </div>
  );
}
