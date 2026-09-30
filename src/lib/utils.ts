import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * cn = "class names". Merges Tailwind classes and resolves conflicts
 * (e.g. cn("p-2", condition && "p-4") → "p-4"). Used by every UI component.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
