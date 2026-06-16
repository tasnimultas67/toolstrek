import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatRelativeTime(timestamp) {
  if (!timestamp) return "";
  const now = Date.now();
  const diffInSeconds = Math.floor((now - timestamp) / 1000);

  // Less than a minute
  if (diffInSeconds < 60) {
    return "Used just now";
  }

  // Less than an hour
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `Used ${diffInMinutes} ${diffInMinutes === 1 ? "minute" : "minutes"} ago`;
  }

  // Less than a day
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `Used ${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`;
  }

  // Yesterday
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) {
    return "Used yesterday";
  }

  // Less than a week
  if (diffInDays < 7) {
    return `Used ${diffInDays} days ago`;
  }

  // Absolute date fallback
  const date = new Date(timestamp);
  return `Used on ${date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;
}
