import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Custom typography tokens must be classified as font sizes, not text colors.
const twMerge = extendTailwindMerge({
  extend: {
    theme: { text: ["display", "h1", "h2", "h3", "h4", "body-lg", "body", "body-sm", "caption"] },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
