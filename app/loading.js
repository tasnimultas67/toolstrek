// app/tools/loading.jsx
import { Staatliches } from "next/font/google";

const staatliches = Staatliches({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-staatliches",
});

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="flex items-center justify-center gap-1">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="25"
          height="25"
          className="size-8"
        >
          <path
            d="M 19 16 L 13 16 C 10.243 16 8 13.757 8 11 L 8 5 C 8 2.243 10.243 0 13 0 L 19 0 C 21.757 0 24 2.243 24 5 L 24 11 C 24 13.757 21.757 16 19 16 Z"
            className="fill-brandColor"
          />
          <path
            d="M 11 24 L 5 24 C 2.243 24 0 21.757 0 19 L 0 13 C 0 10.243 2.243 8 5 8 C 5.553 8 6 8.448 6 9 L 6 11 C 6 14.86 9.141 18 13 18 L 15 18 C 15.553 18 16 18.448 16 19 C 16 21.757 13.757 24 11 24 Z"
            className="fill-brandColorHover"
          />
        </svg>
        <h3 className={`text-4xl ${staatliches.className}`}>
          Tools<span className="text-brandColor">Trek</span>
        </h3>
      </div>
    </div>
  );
}
