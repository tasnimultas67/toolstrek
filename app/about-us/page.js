import Image from "next/image";
import Link from "next/link";
import React from "react";

export const metadata = {
  title: "About Us — ToolsTrek",
  keywords: ["about", "tools", "tools trek", "Tasnimul Haque"],
  description:
    "Discover the story behind ToolsTrek, a platform created by Md. Tasnimul Haque, a passionate web developer and branding expert.",
};

const page = () => {
  return (
    <div className="w-[1100px] mx-auto">
      <div>
        <section className="py-12 md:py-20 px-3">
          <div className="space-y-10">
            <h2 className="text-5xl font-semibold">
              Empowering Productivity, One Tool at a Time Innovative Solutions
              for Everyday Challenges
            </h2>
            <p className="text-sm md:w-7/12 ">
              At ToolsTrek, we believe in the power of simplicity and
              efficiency. Our mission is to provide intuitive, high-quality
              online tools that streamline everyday tasks, making life easier
              for developers, professionals, and casual users alike.
            </p>
            <Image
              src="https://images.unsplash.com/photo-1576961457745-955300ee1a71?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              width={1400}
              height={400}
              alt="About Us page banner"
              className="object-cover h-[400px] rounded-lg"
            ></Image>
          </div>
        </section>
        <section className=" p-5 space-y-10">
          <div className="flex items-center justify-center">
            <Image
              src="https://tasnimul.vercel.app/_next/image?url=%2FTasnimul-Haque.jpg&w=1080&q=75"
              alt="About Us"
              className="object-cover size-[150px] border-2 border-dashed border-accent-foreground rounded-full"
              width={300}
              height={500}
            />
          </div>
          <div className="space-y-4  flex flex-col items justify-center">
            <div className="space-y-3 text-sm text-center">
              <p className="">
                Welcome to ToolsTrek, a platform designed and developed by Md.
                Tasnimul Haque, a passionate web developer and branding expert.
                With a strong foundation in Next.js, WordPress plugin
                customization, and user experience design, Tasnimul has
                meticulously crafted ToolsTrek to provide practical and
                efficient solutions for users seeking powerful online tools.
              </p>
              <p>
                Tasnimul's journey in web development has been driven by a
                commitment to clarity, functionality, and innovation. From
                configuring vendor workflows to refining website content for
                professionalism, every aspect of ToolsTrek reflects his
                methodical approach and attention to detail. Whether it's
                integrating Tailwind CSS for responsive designs or
                troubleshooting complex errors, Tasnimul ensures that ToolsTrek
                remains a seamless and user-friendly experience.
              </p>
              <p>
                Beyond ToolsTrek, Tasnimul actively engages in freelance web
                development and branding projects, bringing creative and
                structured solutions to businesses and individuals. His
                expertise in crafting engaging call-to-action descriptions,
                professional documents, and impactful branding elements makes
                ToolsTrek a testament to his dedication to quality and
                usability.
              </p>
            </div>
            <button className="mt-5 mx-auto w-fit">
              <Link
                href="https://tasnimul.vercel.app/"
                className="p-2 px-4 bg-brandColor text-white rounded-sm hover:bg-brandColorHover transition duration-300 ease-in-out text-sm text-center mx-auto"
                target="_blank"
                rel="noopener noreferrer"
                title="Read More About Tasnimul Haque"
                aria-label="Read More About Tasnimul Haque"
              >
                Read More About Tasnimul Haque
              </Link>
            </button>
          </div>
        </section>
        <section className="py-12 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
            <div className="pl-10 border-l-2 border-brandColor">
              <p className="text-sm w-full md:w-10/12">
                At ToolsTrek, we believe in continuous improvement and practical
                innovation. Every tool, feature, and enhancement is designed
                with the user in mind, ensuring a smooth and efficient
                experience. Join us on this journey as we explore new
                possibilities and refine digital solutions for a better online
                experience.
              </p>
            </div>
            {/* <div>
              <Image
                src="https://images.unsplash.com/photo-1541960071727-c531398e7494?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="ToolsTrek"
                width={500}
                height={500}
              ></Image>
            </div> */}
          </div>
        </section>
      </div>
    </div>
  );
};

export default page;
