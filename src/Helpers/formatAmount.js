// Shared money formatting so every page shows amounts the same way.
// Put this file at src/Helpers/formatAmount.js

// Currency code used everywhere amounts are shown. Set to null for plain numbers.
export const CURRENCY = "PLN";

const amountFormatter = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  ...(CURRENCY ? { style: "currency", currency: CURRENCY } : {}),
});

// Uses a real minus sign (U+2212) so negatives line up visually with positives
export function formatAmount(value) {
  const n = Number(value) || 0;
  return amountFormatter.format(n).replace("-", "\u2212");
}
