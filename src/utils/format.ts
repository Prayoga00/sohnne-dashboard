export function formatCurrency(value: number, fractionDigits = 2): string {
  const abs = Math.abs(value);
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(abs);
  return value < 0 ? `-$${formatted}` : `$${formatted}`;
}

export function formatCurrencyCompact(value: number): string {
  return formatCurrency(value, Number.isInteger(value) ? 0 : 2);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return 'SN';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function stockStatusFromCount(stock: number): {
  label: 'In stock' | 'Low stock' | 'Out of stock';
  tone: 'emerald' | 'amber' | 'rose';
} {
  if (stock <= 0) return { label: 'Out of stock', tone: 'rose' };
  if (stock <= 12) return { label: 'Low stock', tone: 'amber' };
  return { label: 'In stock', tone: 'emerald' };
}
