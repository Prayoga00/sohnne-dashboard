import { useState } from 'react';
import { ArrowUpRight, Copy, MapPin, Package, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { useDashboard } from '../../store/dashboardStore';
import type { Order, OrderStatus } from '../../types/dashboard';
import { formatCurrency } from '../../utils/format';
import { BrandSelect } from '../ui/BrandSelect';
import { ModalDialog } from '../ui/Dialog';
import { StatusBadge } from '../ui/StatusBadge';

const ORDER_STATUS_OPTIONS = [
  { value: 'PROCESSING', label: 'PROCESSING' },
  { value: 'PAID', label: 'PAID' },
  { value: 'RETURNING', label: 'RETURNING' },
  { value: 'REFUNDED', label: 'REFUNDED' },
];

interface OrderQuickDrawerProps {
  order: Order | null;
  onClose: () => void;
}

export function OrderQuickDrawer({ order, onClose }: OrderQuickDrawerProps) {
  const { dispatch, navigate } = useDashboard();
  const [noteDraft, setNoteDraft] = useState('');

  if (!order) {
    return (
      <ModalDialog open={false} onClose={onClose} title="Order Quick View" variant="drawer">
        <div />
      </ModalDialog>
    );
  }

  const handleStatusChange = (nextStatus: OrderStatus) => {
    dispatch({
      type: 'UPDATE_ORDER',
      orderId: order.id,
      patch: { status: nextStatus },
    });
    toast.success(`Order ${order.id} updated to ${nextStatus}`);
  };

  const copyId = async () => {
    await navigator.clipboard?.writeText(order.id);
    toast.success(`Copied ${order.id}`);
  };

  const saveQuickNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteDraft.trim()) return;
    dispatch({
      type: 'UPDATE_ORDER',
      orderId: order.id,
      patch: { orderNote: noteDraft.trim() },
    });
    setNoteDraft('');
    toast.success('Order note saved');
  };

  return (
    <ModalDialog
      open={Boolean(order)}
      onClose={onClose}
      variant="drawer"
      title={`Order ${order.id}`}
      description={`${order.dateLabel} at ${order.timeLabel} · ${order.customerName}`}
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E5E7EB] bg-[#F5F6F8] p-4">
          <div className="space-y-1">
            <span className="text-xs font-medium text-[#555555]">Current Status</span>
            <div>
              <StatusBadge status={order.status} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="quick-status" className="sr-only">
              Change Order Status
            </label>
            <BrandSelect
              id="quick-status"
              name="quickStatus"
              size="sm"
              align="right"
              ariaLabel="Change Order Status"
              value={order.status}
              options={ORDER_STATUS_OPTIONS}
              onChange={(val) => handleStatusChange(val as OrderStatus)}
              className="w-36"
            />
            <button
              type="button"
              onClick={copyId}
              aria-label="Copy Order ID"
              className="btn-tactile inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#D1D5DB] bg-white text-[#4B5563] hover:text-[#131313]"
            >
              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Items */}
        <div>
          <h3 className="mb-2.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#555555]">
            <Package className="h-3.5 w-3.5" aria-hidden="true" />
            Line Items
          </h3>
          <div className="space-y-2.5">
            {order.items.map((item) => (
              <div
                key={item.sku}
                className="flex items-center gap-3 rounded-xl border border-[#E5E7EB] p-3"
              >
                <img
                  src={item.image}
                  alt={item.productName}
                  className="h-14 w-14 rounded-lg bg-[#F5F6F8] object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#131313]">{item.productName}</p>
                  <p className="truncate text-xs text-[#555555]">{item.variant}</p>
                  {item.addonName && (
                    <p className="mt-0.5 text-xs font-medium text-[#0057FF]">
                      + {item.addonName} ({formatCurrency(item.addonPrice ?? 0)})
                    </p>
                  )}
                </div>
                <div className="text-right tabular-nums">
                  <p className="text-xs text-[#555555]">×{item.qty}</p>
                  <p className="text-sm font-semibold text-[#131313]">
                    {formatCurrency(item.unitPrice * item.qty)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping & Address */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-[#E5E7EB] p-3.5">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-[#555555]">
              <Truck className="h-3.5 w-3.5" aria-hidden="true" />
              Carrier &amp; Tracking
            </p>
            <p className="mt-1.5 text-xs font-medium text-[#131313]">{order.shippingMethod}</p>
            <p className="mt-0.5 tabular-nums text-xs text-[#555555]">
              {order.trackingNumber || 'Awaiting carrier scan'}
            </p>
          </div>
          <div className="rounded-xl border border-[#E5E7EB] p-3.5">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-[#555555]">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              Destination
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-[#131313]">{order.shippingAddress}</p>
          </div>
        </div>

        {/* Quick Note */}
        <form onSubmit={saveQuickNote} className="space-y-2 rounded-xl border border-[#E5E7EB] p-3.5">
          <label htmlFor="drawer-order-note" className="block text-xs font-semibold text-[#555555]">
            Order Note
          </label>
          <p className="text-xs text-[#131313]">{order.orderNote}</p>
          <div className="flex gap-2 pt-1">
            <input
              id="drawer-order-note"
              type="text"
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              placeholder="Update fulfillment note..."
              className="flex-1 rounded-lg border border-[#E5E7EB] px-3 py-1.5 text-xs text-[#131313] focus:border-[#0057FF] focus:outline-none"
            />
            <button
              type="submit"
              className="btn-tactile rounded-lg border border-[#E5E7EB] bg-[#F5F6F8] px-3 py-1.5 text-xs font-semibold text-[#131313] hover:bg-[#E5E7EB]"
            >
              Save
            </button>
          </div>
        </form>

        {/* Financial Summary & Full Details Link */}
        <div className="space-y-2 border-t border-[#E5E7EB] pt-4 text-sm">
          <div className="flex justify-between text-[#555555]">
            <span>Coupon</span>
            <span className="font-medium text-[#131313]">{order.couponCode ?? 'None'}</span>
          </div>
          <div className="flex justify-between font-semibold text-[#131313]">
            <span>Net Total</span>
            <span className="tabular-nums">{formatCurrency(order.netSales - order.refundedAmount)}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              onClose();
              navigate('order-details', { orderId: order.id });
            }}
            className="btn-tactile mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0057FF] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0046D5]"
          >
            <span>Open Full Order Details</span>
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </ModalDialog>
  );
}
