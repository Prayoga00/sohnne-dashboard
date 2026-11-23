import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ChevronDown,
  Copy,
  CreditCard,
  Mail,
  MapPin,
  Phone,
  RotateCcw,
  Truck,
} from 'lucide-react';
import { toast } from 'sonner';
import { BrandSelect } from '../components/ui/BrandSelect';
import { ModalDialog } from '../components/ui/Dialog';
import { StatusBadge } from '../components/ui/StatusBadge';
import { useDashboard } from '../store/dashboardStore';
import type { OrderStatus } from '../types/dashboard';
import { formatCurrency } from '../utils/format';

const DETAIL_STATUS_OPTIONS = [
  { value: 'PROCESSING', label: 'PROCESSING' },
  { value: 'PAID', label: 'PAID' },
  { value: 'RETURNING', label: 'RETURNING' },
  { value: 'REFUNDED', label: 'REFUNDED' },
];

export function OrderDetailsPage() {
  const { state, dispatch, navigate } = useDashboard();
  const order = state.orders.find((o) => o.id === state.selectedOrderId) ?? state.orders[0];

  const [statusDraft, setStatusDraft] = useState<OrderStatus>(order?.status ?? 'PROCESSING');
  const [trackingDraft, setTrackingDraft] = useState(order?.trackingNumber ?? '');
  const [paypalDraft, setPaypalDraft] = useState(order?.paypalTransactionId ?? '');
  const [noteDraft, setNoteDraft] = useState(order?.orderNote ?? '');
  const [attributionOpen, setAttributionOpen] = useState(true);

  const [refundOpen, setRefundOpen] = useState(false);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');

  useEffect(() => {
    if (!order) return;
    setStatusDraft(order.status);
    setTrackingDraft(order.trackingNumber);
    setPaypalDraft(order.paypalTransactionId);
    setNoteDraft(order.orderNote);
    setRefundAmount(String(Math.max(0, order.netSales - order.refundedAmount)));
  }, [order]);

  if (!order) {
    return (
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-10 text-center">
        <p className="text-base font-semibold text-[#131313]">Order not found</p>
        <button
          type="button"
          onClick={() => navigate('orders')}
          className="btn-tactile mt-4 rounded-xl bg-[#0057FF] px-4 py-2 text-xs font-semibold text-white"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  const subtotal = order.items.reduce((sum, item) => sum + item.unitPrice * item.qty, 0);
  const addonsTotal = order.items.reduce(
    (sum, item) => sum + (item.addonPrice ?? 0) * item.qty,
    0,
  );
  const remainingRefundable = Math.max(0, order.netSales - order.refundedAmount);

  const handleSaveUpdate = () => {
    dispatch({
      type: 'UPDATE_ORDER',
      orderId: order.id,
      patch: {
        status: statusDraft,
        trackingNumber: trackingDraft.trim(),
        paypalTransactionId: paypalDraft.trim(),
        orderNote: noteDraft.trim(),
      },
    });
    toast.success(`Saved updates for ${order.id}`);
  };

  const handleConfirmRefund = (e: React.FormEvent) => {
    e.preventDefault();
    const numeric = Number(refundAmount);
    if (!Number.isFinite(numeric) || numeric <= 0 || numeric > remainingRefundable) {
      toast.error(`Enter a valid refund amount up to ${formatCurrency(remainingRefundable)}`);
      return;
    }
    dispatch({
      type: 'REFUND_ORDER',
      orderId: order.id,
      amount: numeric,
      reason: refundReason.trim(),
    });
    setRefundOpen(false);
    setRefundReason('');
    toast.success(`Refunded ${formatCurrency(numeric)} for ${order.id}`);
  };

  const copyText = async (value: string, label: string) => {
    await navigator.clipboard?.writeText(value);
    toast.success(`Copied ${label}`);
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => navigate('orders')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#555555] hover:text-[#131313]"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Order</span>
            <span aria-hidden="true">/</span>
            <span className="tabular-nums text-[#131313]">{order.id}</span>
          </button>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1
              id="page-heading"
              tabIndex={-1}
              className="font-serif-display text-3xl font-bold text-[#131313] focus:outline-none"
            >
              Order Details
            </h1>
            <StatusBadge status={order.status} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Main Receipt Card */}
        <div className="space-y-6 lg:col-span-8">
          <section className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#E5E7EB] pb-4">
              <div>
                <h2 className="text-lg font-bold tabular-nums text-[#131313]">
                  Order {order.id} for {formatCurrency(order.netSales)}
                </h2>
                <p className="mt-0.5 text-xs text-[#555555]">
                  {order.dateLabel} at {order.timeLabel}
                </p>
              </div>
              {order.refundedAmount > 0 && (
                <span className="rounded-lg bg-[#FEE2E2] px-3 py-1 text-xs font-semibold tabular-nums text-[#B91C1C]">
                  Refunded: {formatCurrency(order.refundedAmount)}
                </span>
              )}
            </div>

            {/* Line Items */}
            <div className="divide-y divide-[#E5E7EB]">
              {order.items.map((item) => (
                <div key={item.sku} className="flex flex-wrap items-center gap-4 py-4">
                  <img
                    src={item.image}
                    alt={item.productName}
                    className="h-16 w-16 rounded-xl bg-[#F5F6F8] object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-[#131313]">{item.productName}</p>
                    <p className="text-xs text-[#555555]">{item.variant}</p>
                    <p className="mt-0.5 text-xs tabular-nums text-[#555555]">SKU: {item.sku}</p>
                    {item.addonName && (
                      <p className="mt-1 inline-flex items-center rounded-md bg-[#EEF4FF] px-2 py-0.5 text-xs font-medium text-[#0057FF]">
                        + {item.addonName} ({formatCurrency(item.addonPrice ?? 0)})
                      </p>
                    )}
                  </div>
                  <div className="text-right tabular-nums">
                    <p className="text-xs text-[#555555]">
                      {formatCurrency(item.unitPrice)} × {item.qty}
                    </p>
                    <p className="mt-0.5 text-sm font-bold text-[#131313]">
                      {formatCurrency(item.unitPrice * item.qty)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Shipping & Coupon */}
            <div className="mt-2 space-y-2 rounded-xl bg-[#F5F6F8] p-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-medium text-[#555555]">Shipping Method</span>
                <span className="font-semibold text-[#131313]">{order.shippingMethod}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-[#555555]">Applied Coupon</span>
                <span className="rounded-md bg-[#DBEAFE] px-2 py-0.5 font-semibold text-[#1D4ED8]">
                  {order.couponCode ?? 'None'}
                </span>
              </div>
            </div>

            {/* Order Note (Fixed UX Copy: "Order note") */}
            <div className="mt-5">
              <label htmlFor="order-note-field" className="block text-xs font-semibold text-[#131313]">
                Order note
              </label>
              <textarea
                id="order-note-field"
                rows={3}
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                className="mt-2 w-full rounded-xl border border-[#E5E7EB] bg-white p-3 text-sm text-[#131313] focus:border-[#0057FF] focus:outline-none"
              />
            </div>

            {/* Totals Breakdown */}
            <div className="mt-6 space-y-2 border-t border-[#E5E7EB] pt-4 text-sm tabular-nums">
              <div className="flex justify-between text-[#555555]">
                <span>Items Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {addonsTotal > 0 && (
                <div className="flex justify-between text-[#555555]">
                  <span>Assembly &amp; Care Add-ons</span>
                  <span>{formatCurrency(addonsTotal)}</span>
                </div>
              )}
              <div className="flex justify-between text-[#555555]">
                <span>Shipping</span>
                <span>{order.shippingCost === 0 ? 'Free' : formatCurrency(order.shippingCost)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-[#047857]">
                  <span>Coupon Discount ({order.couponCode})</span>
                  <span>-{formatCurrency(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-[#E5E7EB] pt-2 text-base font-bold text-[#131313]">
                <span>Total Paid</span>
                <span>{formatCurrency(order.netSales)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-[#E5E7EB] pt-4">
              <button
                type="button"
                disabled={remainingRefundable <= 0}
                onClick={() => setRefundOpen(true)}
                className="btn-tactile inline-flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-semibold text-[#131313] hover:bg-[#FEE2E2]/50 hover:text-[#B91C1C] disabled:cursor-not-allowed disabled:opacity-45"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                <span>{remainingRefundable <= 0 ? 'Fully Refunded' : 'Refund'}</span>
              </button>
              <button
                type="button"
                onClick={handleSaveUpdate}
                className="btn-tactile rounded-xl bg-[#0057FF] px-5 py-2 text-sm font-semibold text-white hover:bg-[#0046D5]"
              >
                Update Order
              </button>
            </div>
          </section>
        </div>

        {/* Right Side Controls & Customer Meta */}
        <div className="space-y-5 lg:col-span-4">
          {/* Fulfillment & Payment Controls */}
          <section className="space-y-4 rounded-2xl border border-[#E5E7EB] bg-white p-5">
            <h2 className="text-sm font-semibold text-[#131313]">Fulfillment &amp; Payment</h2>

            <div>
              <label htmlFor="detail-status" className="mb-1.5 block text-xs font-medium text-[#555555]">
                Order Status
              </label>
              <BrandSelect
                id="detail-status"
                name="detailStatus"
                ariaLabel="Order Status"
                value={statusDraft}
                options={DETAIL_STATUS_OPTIONS}
                onChange={(val) => setStatusDraft(val as OrderStatus)}
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="aftership-tracking" className="flex items-center gap-1.5 text-xs font-medium text-[#555555]">
                <Truck className="h-3.5 w-3.5" aria-hidden="true" />
                Aftership Tracking Number
              </label>
              <input
                id="aftership-tracking"
                type="text"
                value={trackingDraft}
                onChange={(e) => setTrackingDraft(e.target.value)}
                placeholder="Add tracking number (e.g. FX-8841-2940)"
                className="mt-1.5 w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm tabular-nums text-[#131313] placeholder:text-[#6B7280] focus:border-[#0057FF] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="paypal-tx" className="flex items-center gap-1.5 text-xs font-medium text-[#555555]">
                <CreditCard className="h-3.5 w-3.5" aria-hidden="true" />
                PayPal Transaction ID
              </label>
              <input
                id="paypal-tx"
                type="text"
                value={paypalDraft}
                onChange={(e) => setPaypalDraft(e.target.value)}
                placeholder="Enter PayPal transaction ID"
                className="mt-1.5 w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm tabular-nums text-[#131313] placeholder:text-[#6B7280] focus:border-[#0057FF] focus:outline-none"
              />
            </div>
          </section>

          {/* Customer & Billing Card */}
          <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
            <h2 className="text-sm font-semibold text-[#131313]">Customer &amp; Shipping</h2>
            <p className="mt-3 text-sm font-semibold text-[#131313]">{order.customerName}</p>

            <div className="mt-3 space-y-2.5 text-xs text-[#4B5563]">
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 truncate">
                  <Mail className="h-3.5 w-3.5 shrink-0 text-[#555555]" aria-hidden="true" />
                  <span className="truncate">{order.customerEmail}</span>
                </span>
                <button
                  type="button"
                  onClick={() => copyText(order.customerEmail, 'email')}
                  aria-label="Copy customer email"
                  className="rounded p-1 hover:bg-[#F5F6F8] hover:text-[#131313]"
                >
                  <Copy className="h-3 w-3" aria-hidden="true" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 shrink-0 text-[#555555]" aria-hidden="true" />
                <span className="tabular-nums">{order.customerPhone}</span>
              </div>

              <div className="flex items-start justify-between gap-2 pt-1">
                <span className="flex items-start gap-2 leading-relaxed">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#555555]" aria-hidden="true" />
                  <span>{order.shippingAddress}</span>
                </span>
                <button
                  type="button"
                  onClick={() => copyText(order.shippingAddress, 'address')}
                  aria-label="Copy shipping address"
                  className="rounded p-1 hover:bg-[#F5F6F8] hover:text-[#131313]"
                >
                  <Copy className="h-3 w-3" aria-hidden="true" />
                </button>
              </div>
            </div>
          </section>

          {/* Collapsible Order Attribution */}
          <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
            <button
              type="button"
              aria-expanded={attributionOpen}
              onClick={() => setAttributionOpen((v) => !v)}
              className="flex w-full items-center justify-between text-left"
            >
              <span className="text-sm font-semibold text-[#131313]">Order Attribution</span>
              <ChevronDown
                className={`h-4 w-4 text-[#555555] transition-transform duration-200 ${
                  attributionOpen ? 'rotate-180' : 'rotate-0'
                }`}
                aria-hidden="true"
              />
            </button>

            {attributionOpen && (
              <dl className="mt-4 space-y-2.5 border-t border-[#E5E7EB] pt-3 text-xs">
                <div className="flex justify-between">
                  <dt className="text-[#555555]">Source</dt>
                  <dd className="font-semibold text-[#131313]">{order.attribution.source}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[#555555]">Medium</dt>
                  <dd className="font-semibold text-[#131313]">{order.attribution.medium}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[#555555]">Campaign</dt>
                  <dd className="font-semibold text-[#131313]">{order.attribution.campaign}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[#555555]">Device</dt>
                  <dd className="font-semibold text-[#131313]">{order.attribution.device}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[#555555]">Session Time</dt>
                  <dd className="font-semibold tabular-nums text-[#131313]">
                    {order.attribution.sessionDuration}
                  </dd>
                </div>
              </dl>
            )}
          </section>
        </div>
      </div>

      {/* Issue Refund Native Modal Dialog */}
      <ModalDialog
        open={refundOpen}
        onClose={() => setRefundOpen(false)}
        title={`Issue Refund · ${order.id}`}
        description={`Available refundable balance: ${formatCurrency(remainingRefundable)}`}
        maxWidthClass="w-full max-w-md"
      >
        <form onSubmit={handleConfirmRefund} className="space-y-4">
          <div>
            <label htmlFor="refund-amount" className="block text-xs font-semibold text-[#131313]">
              Refund Amount (USD)
            </label>
            <input
              id="refund-amount"
              type="number"
              step="0.01"
              min="1"
              max={remainingRefundable}
              value={refundAmount}
              onChange={(e) => setRefundAmount(e.target.value)}
              required
              className="mt-1.5 w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm tabular-nums text-[#131313] focus:border-[#0057FF] focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="refund-reason" className="block text-xs font-semibold text-[#131313]">
              Internal Refund Note
            </label>
            <textarea
              id="refund-reason"
              rows={2}
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              placeholder="e.g. Damaged corner crating during freight..."
              className="mt-1.5 w-full rounded-xl border border-[#E5E7EB] p-3 text-sm text-[#131313] focus:border-[#0057FF] focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setRefundOpen(false)}
              className="btn-tactile rounded-xl border border-[#E5E7EB] bg-white px-4 py-2 text-xs font-semibold text-[#131313]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-tactile rounded-xl bg-[#DC2626] px-4 py-2 text-xs font-semibold text-white hover:bg-[#B91C1C]"
            >
              Confirm Refund
            </button>
          </div>
        </form>
      </ModalDialog>
    </div>
  );
}
