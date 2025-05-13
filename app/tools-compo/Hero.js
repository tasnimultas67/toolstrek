import Image from "next/image";
import Link from "next/link";
import React from "react";

const Hero = () => {
  return (
    <div className="bg-white">
      <div className="relative isolate px-6 lg:px-8">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        >
          <div
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
            className="relative left-[calc(50%-11rem)] aspect-1155/678 w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-linear-to-tr from-brandColor/40 to-emerald-500/40 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          />
        </div>
        <div className="mx-auto max-w-2xl relative top-0 md:py-32">
          <div className="text-center">
            <h1 className="text-5xl font-semibold tracking-tight text-balance text-gray-900 sm:text-7xl">
              Your Digital{" "}
              <span className="bg-gradient-to-r from-brandColor to-emerald-900 bg-clip-text text-transparent">
                Toolbox
              </span>{" "}
              for Everyday Tasks
            </h1>
            <p className={`mt-8 text-base text-pretty text-gray-500`}>
              Your all-in-one toolkit for effortless online tasks. From URL
              shorteners to QR code generators and age calculators—ToolsTrek
              simplifies digital solutions with speed, precision, and ease.
              Start your journey with powerful utilities designed to enhance
              productivity!
            </p>
            <Image
              className="absolute top-20 -left-28 -rotate-12 drop-shadow-2xl drop-shadow-blue-300"
              src="/Age-Calculator-icon.svg"
              width={50}
              height={50}
              alt="Age Calculator Icon"
            ></Image>
            <Image
              className="absolute top-20 -right-28 rotate-12 drop-shadow-2xl drop-shadow-blue-300"
              src="/QR-Generator.svg"
              width={60}
              height={60}
              alt="Age Calculator Icon"
            ></Image>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="#"
                className="rounded-md bg-brandColor hover:bg-brandColorHover px-5 py-2 text-sm font-semibold text-white "
              >
                Get started
              </Link>
              <Link href="#" className="text-sm/6 font-semibold text-gray-900">
                Learn more <span aria-hidden="true">→</span>
              </Link>
            </div>
            <Image
              className="absolute bottom-40 -left-28 rotate-12 drop-shadow-2xl drop-shadow-blue-300"
              src="/Link-shortener.svg"
              width={40}
              height={40}
              alt="Age Calculator Icon"
            ></Image>
          </div>
        </div>
        {/* <div
          aria-hidden="true"
          className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
        >
          <div
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
            className="relative left-[calc(50%+3rem)] aspect-1155/678 w-[36.125rem] -translate-x-1/2 bg-linear-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
          />
        </div> */}
      </div>
    </div>
  );
};

export default Hero;
