import React from "react";
import ContactForm from "../tools-compo/ContactForm";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRightIcon } from "@heroicons/react/24/outline";
import { Home } from "lucide-react";
import {
  ClockIcon,
  EnvelopeIcon,
  EnvelopeOpenIcon,
  HomeIcon,
} from "@heroicons/react/20/solid";

export const metadata = {
  title: "Contact Us — ToolsTrek",
  keywords: ["contact", "form", "tools", "feedback"],
  description: "Get in touch with us for any inquiries or feedback.",
};

const page = () => {
  return (
    <div className="bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="md:w-[1180px] m-auto">
        <div>
          <div>
            <div className="text-center mb-12">
              <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                Contact Us
              </h1>
              <p className="mt-4 text-lg text-gray-600">
                Have questions about our tools? We'd love to hear from you!
              </p>
            </div>
          </div>
          {/* Grid Basic Information */}
          <div className="mb-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="border rounded-lg bg-white p-4 space-y-2">
                <h3 className="text-xs text-gray-600 flex items-center gap-1">
                  <HomeIcon className="size-3.5"></HomeIcon>Find Us On
                </h3>
                <p className="text-sm">
                  House#711/7, Baitul Aman Housing, Road#11, Shyamoli,
                  Dhaka-1207
                </p>
              </div>
              <div className="border rounded-lg bg-white p-4 space-y-2 ">
                <h3 className="text-xs text-gray-600 flex items-center gap-1">
                  <EnvelopeOpenIcon className="size-3.5" />
                  You can mail us
                </h3>
                <Link
                  className="text-sm"
                  href="mailto:contact.toolstrek@gmail.com"
                >
                  contact.toolstrek@gmail.com
                </Link>
              </div>
              <div className="border rounded-lg bg-white p-4 space-y-2">
                <h3 className="text-xs text-gray-600 flex items-center gap-1">
                  <ClockIcon className="size-3.5" />
                  Working Hours
                </h3>
                <p className="text-sm">10:00am to 6:00pm (Bangladesh)</p>
              </div>
            </div>
          </div>
          {/* Grid form container */}
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-white rounded-xl shadow">
                <div className=" space-y-5 relative top-0 left-0 bottom-0 h-full">
                  <Image
                    src="https://images.unsplash.com/photo-1695826524640-647b5dba4c85?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    width={200}
                    height={200}
                    alt="Contact Us ToolsTrek"
                    className="w-full rounded-lg h-full object-cover object-center"
                  ></Image>
                  <div className="p-4 rounded-lg border border-gray-300 space-y-2 bg-white/60 backdrop-blur-2xl absolute bottom-2 left-2 right-2">
                    <p className="text-sm text-gray-600">
                      Prefer email? Contact us directly at
                    </p>
                    <Link
                      href="mailto:contact.toolstrek@gmail.com"
                      className="flex items-center gap-2"
                    >
                      contact.toolstrek@gmail.com{" "}
                      <ArrowUpRightIcon className="size-4"></ArrowUpRightIcon>
                    </Link>
                  </div>
                </div>
              </div>
              <div className="col-span-2">
                <ContactForm></ContactForm>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
