import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Compose Tailwind class names, resolving conflicts. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format a number as USD currency. */
export function formatUSD(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount)
}

/** Generate a human-friendly order reference, e.g. CAC-7F3K-9Q2D. */
export function makeOrderReference() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const block = (n: number) =>
    Array.from({ length: n }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('')
  return `CAC-${block(4)}-${block(4)}`
}

/** Slugify a string for ids/anchors. */
export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}
