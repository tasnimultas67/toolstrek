import Image from "next/image";
import Link from "next/link";
import React from "react";

const page = () => {
  return (
    <div className="w-[1200px] mx-auto">
      <div>
        <section className="grid grid-cols-2 bg-gray-100 p-5">
          <div className="space-y-4">
            <h1 className="text-4xl ">About Us</h1>
            <div className="space-y-3">
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
              <p>
                At ToolsTrek, we believe in continuous improvement and practical
                innovation. Every tool, feature, and enhancement is designed
                with the user in mind, ensuring a smooth and efficient
                experience. Join us on this journey as we explore new
                possibilities and refine digital solutions for a better online
                experience.
              </p>
            </div>
            <button>
              <Link
                href="https://tasnimul.vercel.app/"
                className="p-2 px-4 bg-blue-700 text-white rounded-sm hover:bg-blue-800 transition duration-300 ease-in-out text-sm"
                target="_blank"
                rel="noopener noreferrer"
                title="Read More About Tasnimul Haque"
                aria-label="Read More About Tasnimul Haque"
              >
                Read More About Tasnimul Haque
              </Link>
            </button>
            <p>
              Thank you for choosing ToolsTrek. We look forward to serving you
              and helping you achieve your online goals with our powerful tools
              and resources.
            </p>
          </div>
          <div className="flex items-center justify-end">
            {/* <Image
              src="https://tasnimul.vercel.app/_next/image?url=%2FTasnimul-Haque.jpg&w=1080&q=75"
              alt="About Us"
              className="object-cover"
              width={200}
              height={500}
            /> */}
          </div>
        </section>
      </div>
    </div>
  );
};

export default page;
