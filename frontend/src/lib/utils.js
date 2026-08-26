import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount) {
  if (amount === undefined || amount === null) return "0 ৳";
  return new Intl.NumberFormat('bn-BD').format(amount) + " ৳";
}

export function formatDate(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('bn-BD', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}
