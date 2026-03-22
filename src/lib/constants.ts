export const PRODUCT_CATEGORIES = [
  { value: 'roses', label: '🌹 Roses' },
  { value: 'lilies', label: '🌷 Lilies' },
  { value: 'bouquets', label: '💐 Bouquets' },
  { value: 'seasonal', label: '🌻 Seasonal' },
  { value: 'exotic', label: '🌺 Exotic' },
] as const;

export const ORDER_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-100 text-blue-800' },
  { value: 'packed', label: 'Packed', color: 'bg-purple-100 text-purple-800' },
  { value: 'shipped', label: 'Shipped', color: 'bg-orange-100 text-orange-800' },
  { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
] as const;

export const PAYMENT_SPLIT = {
  seller: 0.85,
  delivery: 0.10,
  admin: 0.05,
} as const;

export function fmtINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function fmtDate(date: string): string {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function generateCode(length: number): string {
  return Math.random().toString().slice(2, 2 + length);
}
