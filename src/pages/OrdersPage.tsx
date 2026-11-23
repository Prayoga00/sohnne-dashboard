import { useMemo } from 'react';
import { OrdersTableSection } from '../components/orders/OrdersTableSection';
import { AnimatedNumber } from '../components/ui/AnimatedNumber';
import { useDashboard } from '../store/dashboardStore';
import { formatCurrencyCompact, formatNumber } from '../utils/format';

export function OrdersPage() {
  const { state, dispatch } = useDashboard();

  const summary = useMemo(() => {
    const visible =
      state.orderStatusFilter === 'ALL'
        ? state.orders
        : state.orders.filter((o) => o.status === state.orderStatusFilter);
    const totalSales = visible.reduce((acc, o) => acc + (o.netSales - o.refundedAmount), 0);
    const totalItems = visible.reduce(
      (acc, o) => acc + o.items.reduce((s, item) => s + item.qty, 0),
      0,
    );
    const avgOrder = visible.length ? totalSales / visible.length : 0;
    const avgItems = visible.length ? totalItems / visible.length : 0;
    return { count: visible.length, totalSales, avgOrder, avgItems };
  }, [state.orders, state.orderStatusFilter]);

  return (
    <div className="min-w-0 space-y-6">
      <div>
        <h1
          id="page-heading"
          tabIndex={-1}
          className="font-serif-display text-3xl font-bold text-[#131313] focus:outline-none"
        >
          Order
        </h1>
        <p className="mt-1 text-sm text-[#555555]">
          Inspect, fulfill, refund, or export customer orders across SOHNNE® channels.
        </p>
      </div>

      {/* 4 KPI Summary Cards */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-[#E5E7EB] bg-[#F5F6F8] p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#555555]">Orders</p>
          <p className="mt-2 text-2xl font-bold text-[#131313]">
            <AnimatedNumber value={summary.count} formatter={formatNumber} />
          </p>
        </div>
        <div className="rounded-2xl border border-[#E5E7EB] bg-[#F5F6F8] p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#555555]">Net Sales</p>
          <p className="mt-2 text-2xl font-bold text-[#131313]">
            <AnimatedNumber value={summary.totalSales} formatter={(v) => formatCurrencyCompact(v)} />
          </p>
        </div>
        <div className="rounded-2xl border border-[#E5E7EB] bg-[#F5F6F8] p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#555555]">
            Average Order Value
          </p>
          <p className="mt-2 text-2xl font-bold text-[#131313]">
            <AnimatedNumber value={summary.avgOrder} formatter={(v) => formatCurrencyCompact(v)} />
          </p>
        </div>
        <div className="rounded-2xl border border-[#E5E7EB] bg-[#F5F6F8] p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#555555]">
            Avg Items Per Order
          </p>
          <p className="mt-2 text-2xl font-bold tabular-nums text-[#131313]">
            {summary.avgItems.toFixed(1)}
          </p>
        </div>
      </section>

      {/* Unified Orders Table (12 per page + Direct Page Jump Input + Padded Footer) */}
      <OrdersTableSection
        orders={state.orders}
        statusFilter={state.orderStatusFilter}
        onStatusFilterChange={(st) => dispatch({ type: 'SET_ORDER_STATUS_FILTER', status: st })}
        pageSize={12}
        exportFilename="sohnne-orders-export.csv"
        ariaLabel="Orders table"
      />
    </div>
  );
}
