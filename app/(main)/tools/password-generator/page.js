import React from "react";
import PasswordFunc from "./PasswordFunc";

export const metadata = {
  title: "Password Generator — ToolsTrek",
  keywords: ["password", "generator", "tools", "password generator"],
  description:
    "A secure tool that creates strong, randomized passwords with customizable options",
};

const page = () => {
  return (
    <div>
      <PasswordFunc></PasswordFunc>
    </div>
  );
};

export default page;
