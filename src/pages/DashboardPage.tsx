import { useMemo, useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  ChevronRight,
  Layers,
  Ticket,
} from 'lucide-react';
import { motion } from 'motion/react';
import { GroupedBarChart } from '../components/dashboard/GroupedBarChart';
import { OrderQuickDrawer } from '../components/orders/OrderQuickDrawer';
import { OrdersTableSection } from '../components/orders/OrdersTableSection';
import { AnimatedNumber } from '../components/ui/AnimatedNumber';
import { CHART_SERIES_BY_PERIOD, INITIAL_ORDERS } from '../data/seedData';
import { useDashboard } from '../store/dashboardStore';
import type { Order, OrderStatus, PeriodKey } from '../types/dashboard';
import { formatCurrency, formatCurrencyCompact, formatNumber } from '../utils/format';

const PERIOD_OPTIONS: Array<{ key: PeriodKey; label: string }> = [
  { key: 'jan-jul-2024', label: 'Jan – Jul 2024' },
  { key: 'aug-dec-2024', label: 'Aug – Dec 2024' },
  { key: 'last-30-days', label: 'Last 30 Days' },
  { key: 'today', label: 'Today' },
];

export function DashboardPage() {
  const { state, dispatch, navigate, computedKpis } = useDashboard();
  const [topSellerWindow, setTopSellerWindow] = useState<'period' | '30d'>('period');
  const [recentVisibleCount, setRecentVisibleCount] = useState(4);
  const [dashboardStatusFilter, setDashboardStatusFilter] = useState<OrderStatus | 'ALL'>('ALL');
  const [quickOrder, setQuickOrder] = useState<Order | null>(null);

  const periodCfg = CHART_SERIES_BY_PERIOD[state.selectedPeriod];
  const kpiDeltas = periodCfg.kpis;
  const extraLiveOrders = Math.max(0, state.orders.length - INITIAL_ORDERS.length);

  const topProducts = useMemo(() => {
    return [...state.products]
      .sort((a, b) =>
        topSellerWindow === 'period' ? b.netSales - a.netSales : b.itemsSold - a.itemsSold,
      )
      .slice(0, 5);
  }, [state.products, topSellerWindow]);

  const periodOrders = useMemo(
    () => state.orders.filter((o) => o.periodKeys.includes(state.selectedPeriod)),
    [state.orders, state.selectedPeriod],
  );

  // Category Mix to fill left column whitespace with genuine visual & functional utility
  const categoryBreakdown = useMemo(() => {
    const map = new Map<string, { name: string; sales: number; units: number }>();
    for (const p of state.products) {
      const cat = p.categories[0] ?? 'Other';
      const entry = map.get(cat) ?? { name: cat, sales: 0, units: 0 };
      entry.sales += p.netSales;
      entry.units += p.itemsSold;
      map.set(cat, entry);
    }
    const list = Array.from(map.values()).sort((a, b) => b.sales - a.sales);
    const total = Math.max(1, list.reduce((s, item) => s + item.sales, 0));
    const colors = ['#0057FF', '#66ACFF', '#131313', '#059669'];
    return list.slice(0, 4).map((item, idx) => ({
      ...item,
      pct: Math.round((item.sales / total) * 100),
      color: colors[idx % colors.length],
    }));
  }, [state.products]);

  const fulfillmentCounts = useMemo(() => {
    const counts: Record<OrderStatus, number> = {
      PAID: 0,
      PROCESSING: 0,
      RETURNING: 0,
      REFUNDED: 0,
    };
    for (const o of periodOrders) {
      counts[o.status] += 1;
    }
    return counts;
  }, [periodOrders]);

  const topCoupons = useMemo(
    () => state.coupons.filter((c) => c.active).sort((a, b) => b.salesGenerated - a.salesGenerated).slice(0, 2),
    [state.coupons],
  );

  const recentFeed = state.orders.slice(0, recentVisibleCount);

  return (
    <div className="min-w-0 space-y-6">
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1
            id="page-heading"
            tabIndex={-1}
            className="font-serif-display text-3xl font-bold text-[#131313] focus:outline-none"
          >
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-[#555555]">
            Real-time storefront overview for SOHNNE® mid-century furniture operations.
          </p>
        </div>

        {/* Period Switcher Tabs */}
        <div
          role="tablist"
          aria-label="Dashboard reporting period"
          className="inline-flex flex-wrap items-center gap-1 rounded-xl border border-[#E5E7EB] bg-[#F5F6F8] p-1"
        >
          <span className="hidden items-center pl-2 pr-1 text-[#555555] sm:inline-flex" aria-hidden="true">
            <Calendar className="h-3.5 w-3.5" />
          </span>
          {PERIOD_OPTIONS.map((opt) => {
            const active = state.selectedPeriod === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => dispatch({ type: 'SET_PERIOD', period: opt.key })}
                className={`btn-tactile rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  active
                    ? 'bg-white text-[#131313] shadow-xs'
                    : 'text-[#555555] hover:text-[#131313]'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Primary 4 KPI Cards */}
      <section aria-label="Key performance metrics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: 'Net Revenue',
            value: computedKpis.netRevenue,
            formatter: (v: number) => formatCurrencyCompact(v),
            delta: kpiDeltas.netRevenueDelta,
            positive: kpiDeltas.netRevenuePositive,
            onClick: () => navigate('analytics'),
          },
          {
            label: 'Orders',
            value: computedKpis.ordersCount,
            formatter: formatNumber,
            delta: kpiDeltas.ordersDelta,
            positive: kpiDeltas.ordersPositive,
            onClick: () => navigate('orders', { statusFilter: 'ALL' }),
          },
          {
            label: 'Refunded',
            value: computedKpis.refundedTotal,
            formatter: (v: number) => formatCurrencyCompact(v),
            delta: kpiDeltas.refundedDelta,
            positive: kpiDeltas.refundedPositive,
            onClick: () => navigate('orders', { statusFilter: 'REFUNDED' }),
          },
          {
            label: 'Item Sold',
            value: computedKpis.itemSoldTotal,
            formatter: formatNumber,
            delta: kpiDeltas.itemSoldDelta,
            positive: kpiDeltas.itemSoldPositive,
            onClick: () => navigate('products'),
          },
        ].map((card) => (
          <button
            key={card.label}
            type="button"
            onClick={card.onClick}
            className="card-hover-lift btn-tactile flex flex-col justify-between rounded-2xl border border-[#E5E7EB] bg-[#F5F6F8] p-5 text-left"
          >
            <div className="flex w-full items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-[#555555]">
                {card.label}
              </span>
              <span
                className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ${
                  card.positive
                    ? 'bg-[#DCFCE7] text-[#047857]'
                    : 'bg-[#FEE2E2] text-[#B91C1C]'
                }`}
              >
                {card.positive ? (
                  <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" aria-hidden="true" />
                )}
                {card.delta}
              </span>
            </div>
            <div className="mt-3 text-3xl font-bold tracking-tight text-[#131313]">
              <AnimatedNumber value={card.value} formatter={card.formatter} />
            </div>
          </button>
        ))}
      </section>

      {/* Secondary 4 Compact Metric Chips */}
      <section aria-label="Storefront engagement chips" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Refunds', value: `-${kpiDeltas.refundsCount}`, delta: kpiDeltas.refundsDelta, good: false },
          {
            label: 'Avg New Customer Order',
            value: formatCurrencyCompact(kpiDeltas.newCustomerAvg),
            delta: kpiDeltas.newCustomerDelta,
            good: kpiDeltas.newCustomerDelta.startsWith('+'),
          },
          {
            label: 'Unique Visitors',
            value: formatNumber(kpiDeltas.uniqueVisitor),
            delta: kpiDeltas.uniqueVisitorDelta,
            good: kpiDeltas.uniqueVisitorDelta.startsWith('+'),
          },
          {
            label: 'Total Customers',
            value: formatNumber(kpiDeltas.totalCustomer),
            delta: 'Verified',
            good: true,
          },
        ].map((chip) => (
          <div
            key={chip.label}
            className="flex items-center justify-between rounded-xl border border-[#E5E7EB] bg-white px-4 py-3"
          >
            <div>
              <p className="text-xs text-[#555555]">{chip.label}</p>
              <p className="mt-0.5 text-base font-bold tabular-nums text-[#131313]">{chip.value}</p>
            </div>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums ${
                chip.good ? 'bg-[#DCFCE7] text-[#047857]' : 'bg-[#FEE2E2] text-[#B91C1C]'
              }`}
            >
              {chip.delta}
            </span>
          </div>
        ))}
      </section>

      {/* Chart + Balanced Left Insights & Right Feeds Grid */}
      <div className="grid min-w-0 gap-6 lg:grid-cols-12">
        <div className="min-w-0 space-y-6 lg:col-span-7 xl:col-span-8">
          <GroupedBarChart period={state.selectedPeriod} extraOrdersCount={extraLiveOrders} />

          {/* Left-column Secondary Cards to balance height with Right-column Feeds */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Category Revenue Mix */}
            <section className="flex flex-col justify-between rounded-2xl border border-[#E5E7EB] bg-white p-5">
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-base font-semibold text-[#131313]">
                    <Layers className="h-4 w-4 text-[#0057FF]" aria-hidden="true" />
                    <span>Category Revenue Mix</span>
                  </h2>
                  <button
                    type="button"
                    onClick={() => navigate('products')}
                    className="text-xs font-semibold text-[#0057FF] hover:underline"
                  >
                    Products
                  </button>
                </div>
                <p className="mt-1 text-xs text-[#555555]">
                  Sales share across primary SOHNNE® furniture lines
                </p>

                <div className="mt-4 space-y-3.5">
                  {categoryBreakdown.map((cat) => (
                    <div key={cat.name}>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-[#131313]">{cat.name}</span>
                        <span className="tabular-nums text-[#4B5563]">
                          <strong className="text-[#131313]">{formatCurrencyCompact(cat.sales)}</strong> ({cat.pct}%)
                        </span>
                      </div>
                      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[#F3F4F6]">
                        <motion.div
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                          style={{
                            width: `${cat.pct}%`,
                            backgroundColor: cat.color,
                            originX: 0,
                          }}
                          className="h-full rounded-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-[#E5E7EB] pt-3 text-xs text-[#555555]">
                <span>Active furniture SKUs</span>
                <span className="font-semibold tabular-nums text-[#131313]">
                  {state.products.length} Collections
                </span>
              </div>
            </section>

            {/* Fulfillment Pipeline & Active Promo Spotlight */}
            <section className="flex flex-col justify-between rounded-2xl border border-[#E5E7EB] bg-white p-5">
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-[#131313]">Fulfillment &amp; Promos</h2>
                  <button
                    type="button"
                    onClick={() => navigate('coupons')}
                    className="text-xs font-semibold text-[#0057FF] hover:underline"
                  >
                    All coupons
                  </button>
                </div>
                <p className="mt-1 text-xs text-[#555555]">
                  Click a fulfillment status to inspect matching orders
                </p>

                <div className="mt-4 grid grid-cols-2 gap-2.5">
                  {(
                    [
                      { key: 'PAID', label: 'Paid', cls: 'bg-[#DCFCE7] text-[#047857]' },
                      { key: 'PROCESSING', label: 'Processing', cls: 'bg-[#DBEAFE] text-[#1D4ED8]' },
                      { key: 'RETURNING', label: 'Returning', cls: 'bg-[#FFEDD5] text-[#C2410C]' },
                      { key: 'REFUNDED', label: 'Refunded', cls: 'bg-[#FEE2E2] text-[#B91C1C]' },
                    ] as const
                  ).map((st) => (
                    <button
                      key={st.key}
                      type="button"
                      onClick={() => navigate('orders', { statusFilter: st.key })}
                      className="btn-tactile flex items-center justify-between rounded-xl border border-[#E5E7EB] bg-[#F5F6F8] px-3 py-2 text-left transition-colors hover:border-[#0057FF]/30 hover:bg-white"
                    >
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${st.cls}`}>
                        {st.label}
                      </span>
                      <span className="text-sm font-bold tabular-nums text-[#131313]">
                        {fulfillmentCounts[st.key]}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Promo Spotlight */}
                <div className="mt-4 space-y-2 border-t border-[#E5E7EB] pt-3.5">
                  <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#555555]">
                    <Ticket className="h-3.5 w-3.5 text-[#0057FF]" aria-hidden="true" />
                    <span>Top Active Coupons</span>
                  </p>
                  {topCoupons.map((cp) => (
                    <div
                      key={cp.id}
                      className="flex items-center justify-between rounded-xl bg-[#F5F6F8] px-3 py-2 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-[#DBEAFE] px-2 py-0.5 font-bold text-[#1D4ED8]">
                          {cp.code}
                        </span>
                        <span className="text-[#4B5563]">{cp.discountDisplay}</span>
                      </div>
                      <span className="font-semibold tabular-nums text-[#047857]">
                        {formatCurrencyCompact(cp.salesGenerated)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>

        <div className="min-w-0 space-y-6 lg:col-span-5 xl:col-span-4">
          {/* Top Seller Card */}
          <section className="min-w-0 overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white p-5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base font-semibold text-[#131313]">Top Seller</h2>
              <div className="inline-flex rounded-lg bg-[#F5F6F8] p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setTopSellerWindow('period')}
                  className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                    topSellerWindow === 'period' ? 'bg-white text-[#131313] shadow-2xs' : 'text-[#555555]'
                  }`}
                >
                  This period
                </button>
                <button
                  type="button"
                  onClick={() => setTopSellerWindow('30d')}
                  className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                    topSellerWindow === '30d' ? 'bg-white text-[#131313] shadow-2xs' : 'text-[#555555]'
                  }`}
                >
                  By units
                </button>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {topProducts.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => navigate('products')}
                  className="btn-tactile flex w-full min-w-0 items-center gap-3 overflow-hidden rounded-xl p-1.5 text-left transition-colors hover:bg-[#F5F6F8]"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-11 w-11 shrink-0 rounded-lg bg-[#F5F6F8] object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[#131313]">{product.name}</p>
                    <p className="text-xs tabular-nums text-[#555555]">
                      {product.itemsSold} sold · {product.stock} in stock
                    </p>
                  </div>
                  <span className="whitespace-nowrap text-xs font-semibold tabular-nums text-[#131313]">
                    {formatCurrencyCompact(product.netSales)}
                  </span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => navigate('products')}
              className="btn-tactile mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#0057FF] hover:text-[#0046D5]"
            >
              <span>View all products</span>
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </section>

          {/* Recent Order Stream */}
          <section className="min-w-0 overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-[#131313]">Recent Order</h2>
              <button
                type="button"
                onClick={() => navigate('orders')}
                className="text-xs font-semibold text-[#0057FF] hover:underline"
              >
                All orders
              </button>
            </div>

            <div className="mt-4 divide-y divide-[#E5E7EB]">
              {recentFeed.map((order) => (
                <button
                  key={order.id}
                  type="button"
                  onClick={() => setQuickOrder(order)}
                  className="feed-item-enter flex w-full items-center justify-between gap-3 py-2.5 text-left transition-colors hover:bg-[#F9FAFB]"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#131313]">
                      {order.customerName}
                    </p>
                    <p className="mt-0.5 whitespace-nowrap text-xs tabular-nums text-[#555555]">
                      {order.id} · {order.dateLabel}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="whitespace-nowrap text-sm font-semibold tabular-nums text-[#131313]">
                      {formatCurrency(order.netSales - order.refundedAmount)}
                    </p>
                    <span className="text-[11px] font-medium text-[#0057FF]">Quick view</span>
                  </div>
                </button>
              ))}
            </div>

            {recentVisibleCount < state.orders.length && (
              <button
                type="button"
                onClick={() => setRecentVisibleCount((n) => Math.min(state.orders.length, n + 4))}
                className="btn-tactile mt-3 w-full rounded-xl border border-[#E5E7EB] bg-[#F5F6F8] py-2 text-xs font-semibold text-[#131313] hover:bg-[#E5E7EB]"
              >
                Load More
              </button>
            )}
          </section>
        </div>
      </div>

      {/* Unified Orders Table on Dashboard (12 per page + Page Jump Input + Padded Footer) */}
      <OrdersTableSection
        orders={periodOrders}
        statusFilter={dashboardStatusFilter}
        onStatusFilterChange={setDashboardStatusFilter}
        title="Latest Orders"
        pageSize={12}
        exportFilename={`sohnne-dashboard-orders-${state.selectedPeriod}.csv`}
        ariaLabel="Dashboard latest orders table"
      />

      <OrderQuickDrawer order={quickOrder} onClose={() => setQuickOrder(null)} />
    </div>
  );
}
