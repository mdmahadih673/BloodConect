import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString?: string) {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString();
}

export function isEligible(lastDonationDate?: string) {
  if (!lastDonationDate) return true;
  const last = new Date(lastDonationDate);
  const diff = Date.now() - last.getTime();
  const days = diff / (1000 * 60 * 60 * 24);
  return days >= 90;
}
