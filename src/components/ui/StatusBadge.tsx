import type { OrderStatus } from '../../types/dashboard';

const STATUS_STYLE: Record<
  OrderStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  PAID: {
    label: 'PAID',
    bg: 'bg-[#DCFCE7]',
    text: 'text-[#047857]',
    dot: 'bg-[#059669]',
  },
  PROCESSING: {
    label: 'PROCESSING',
    bg: 'bg-[#DBEAFE]',
    text: 'text-[#1D4ED8]',
    dot: 'bg-[#0057FF]',
  },
  RETURNING: {
    label: 'RETURNING',
    bg: 'bg-[#FFEDD5]',
    text: 'text-[#C2410C]',
    dot: 'bg-[#EA580C]',
  },
  REFUNDED: {
    label: 'REFUNDED',
    bg: 'bg-[#FEE2E2]',
    text: 'text-[#B91C1C]',
    dot: 'bg-[#DC2626]',
  },
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg = STATUS_STYLE[status];
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide ${cfg.bg} ${cfg.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} aria-hidden="true" />
      {cfg.label}
    </span>
  );
}
