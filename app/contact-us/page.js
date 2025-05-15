import React from "react";
import ContactForm from "../tools-compo/ContactForm";

export const metadata = {
  title: "Contact Us — ToolsTrek",
  keywords: ["contact", "form", "tools", "feedback"],
  description: "Get in touch with us for any inquiries or feedback.",
};

const page = () => {
  return (
    <div>
      <ContactForm></ContactForm>
    </div>
  );
};

export default page;
