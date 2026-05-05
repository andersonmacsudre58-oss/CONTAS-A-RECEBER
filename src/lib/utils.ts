import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number | string) {
  let num: number;
  if (typeof value === "string") {
    // Remove dots and replace comma with dot
    const clean = value.replace(/\./g, "").replace(",", ".");
    num = parseFloat(clean) || 0;
  } else {
    num = value;
  }
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(num);
}
