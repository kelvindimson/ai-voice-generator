import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function classMerge(...inputs: ClassValue[]): string {
  return twMerge(clsx(...inputs))
}
