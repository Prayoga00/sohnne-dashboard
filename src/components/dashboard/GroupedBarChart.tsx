import { useMemo, useState } from 'react';
import { Table2, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { CHART_SERIES_BY_PERIOD } from '../../data/seedData';
import type { PeriodKey } from '../../types/dashboard';
import { formatCurrencyCompact, formatNumber } from '../../utils/format';

interface GroupedBarChartProps {
  period: PeriodKey;
  extraOrdersCount?: number;
}

export function GroupedBarChart({ period, extraOrdersCount = 0 }: GroupedBarChartProps) {
  const series = CHART_SERIES_BY_PERIOD[period];
  const [showOrder, setShowOrder] = useState(true);
  const [showReorder, setShowReorder] = useState(true);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [tableView, setTableView] = useState(false);

  const points = useMemo(() => {
    return series.points.map((pt, idx) =>
      idx === series.points.length - 1 && extraOrdersCount > 0
        ? {
            ...pt,
            ordersCount: pt.ordersCount + extraOrdersCount,
            orderRevenue: pt.orderRevenue + extraOrdersCount * 1180,
          }
        : pt,
    );
  }, [series.points, extraOrdersCount]);

  const maxCount = useMemo(() => {
    let max = 10;
    for (const pt of points) {
      if (showOrder && pt.ordersCount > max) max = pt.ordersCount;
      if (showReorder && pt.reordersCount > max) max = pt.reordersCount;
    }
    return Math.ceil(max * 1.15);
  }, [points, showOrder, showReorder]);

  const ticks = [1, 0.75, 0.5, 0.25, 0].map((ratio) => Math.round(maxCount * ratio));
  const activePoint = activeIndex !== null ? points[activeIndex] : null;

  return (
    <figure className="rounded-2xl border border-[#E5E7EB] bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-semibold text-[#131313]">Order vs Reorder Volume</h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#DCFCE7] px-2.5 py-0.5 text-xs font-semibold text-[#047857]">
              <TrendingUp className="h-3 w-3" aria-hidden="true" />
              {series.label}
            </span>
          </div>
          <figcaption className="mt-1 text-xs text-[#555555]">{series.subtext}</figcaption>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Interactive Series Toggles */}
          <button
            type="button"
            aria-pressed={showOrder}
            onClick={() => {
              if (showOrder && !showReorder) return;
              setShowOrder((v) => !v);
            }}
            className={`btn-tactile inline-flex items-center gap-2 rounded-lg border px-2.5 py-1 text-xs font-medium ${
              showOrder
                ? 'border-[#0057FF]/30 bg-[#EEF4FF] text-[#0057FF]'
                : 'border-[#E5E7EB] bg-white text-[#555555] opacity-60'
            }`}
          >
            <span className="h-2.5 w-2.5 rounded-xs bg-[#0057FF]" aria-hidden="true" />
            <span>Order</span>
          </button>

          <button
            type="button"
            aria-pressed={showReorder}
            onClick={() => {
              if (showReorder && !showOrder) return;
              setShowReorder((v) => !v);
            }}
            className={`btn-tactile inline-flex items-center gap-2 rounded-lg border px-2.5 py-1 text-xs font-medium ${
              showReorder
                ? 'border-[#66ACFF]/50 bg-[#EEF4FF] text-[#1D4ED8]'
                : 'border-[#E5E7EB] bg-white text-[#555555] opacity-60'
            }`}
          >
            <span className="h-2.5 w-2.5 rounded-xs bg-[#66ACFF]" aria-hidden="true" />
            <span>Reorder</span>
          </button>

          <button
            type="button"
            onClick={() => setTableView((v) => !v)}
            aria-pressed={tableView}
            className="btn-tactile inline-flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-2.5 py-1 text-xs font-medium text-[#4B5563] hover:bg-[#F5F6F8] hover:text-[#131313]"
          >
            <Table2 className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{tableView ? 'Chart view' : 'Data table'}</span>
          </button>
        </div>
      </div>

      {tableView ? (
        <div className="mt-5 overflow-x-auto rounded-xl border border-[#E5E7EB]" role="region" tabIndex={0} aria-label="Order vs Reorder data table">
          <table className="w-full min-w-[500px] text-left text-sm">
            <thead className="bg-[#F3F4F6] text-xs font-semibold uppercase tracking-wide text-[#4B5563]">
              <tr>
                <th scope="col" className="px-4 py-2.5">Period</th>
                <th scope="col" className="px-4 py-2.5 text-right">Orders</th>
                <th scope="col" className="px-4 py-2.5 text-right">Order Revenue</th>
                <th scope="col" className="px-4 py-2.5 text-right">Reorders</th>
                <th scope="col" className="px-4 py-2.5 text-right">Reorder Revenue</th>
                <th scope="col" className="px-4 py-2.5 text-right">MoM Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB] tabular-nums">
              {points.map((pt) => (
                <tr key={pt.month} className="hover:bg-[#F9FAFB]">
                  <td className="px-4 py-2.5 font-medium text-[#131313]">{pt.fullMonth}</td>
                  <td className="px-4 py-2.5 text-right">{formatNumber(pt.ordersCount)}</td>
                  <td className="px-4 py-2.5 text-right">{formatCurrencyCompact(pt.orderRevenue)}</td>
                  <td className="px-4 py-2.5 text-right">{formatNumber(pt.reordersCount)}</td>
                  <td className="px-4 py-2.5 text-right">{formatCurrencyCompact(pt.reorderRevenue)}</td>
                  <td className={`px-4 py-2.5 text-right font-medium ${pt.deltaPct >= 0 ? 'text-[#047857]' : 'text-[#B91C1C]'}`}>
                    {pt.deltaPct >= 0 ? `+${pt.deltaPct}%` : `${pt.deltaPct}%`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="relative mt-6">
          {/* Interactive Hover/Focus Detail Strip */}
          <div className="mb-3 flex min-h-[28px] flex-wrap items-center justify-between gap-2 rounded-lg bg-[#F5F6F8] px-3 py-1.5 text-xs">
            {activePoint ? (
              <>
                <span className="font-semibold text-[#131313]">{activePoint.fullMonth}</span>
                <div className="flex flex-wrap items-center gap-4 tabular-nums">
                  {showOrder && (
                    <span className="flex items-center gap-1.5 text-[#131313]">
                      <span className="h-2 w-2 rounded-xs bg-[#0057FF]" aria-hidden="true" />
                      Order: <strong>{activePoint.ordersCount}</strong> ({formatCurrencyCompact(activePoint.orderRevenue)})
                    </span>
                  )}
                  {showReorder && (
                    <span className="flex items-center gap-1.5 text-[#131313]">
                      <span className="h-2 w-2 rounded-xs bg-[#66ACFF]" aria-hidden="true" />
                      Reorder: <strong>{activePoint.reordersCount}</strong> ({formatCurrencyCompact(activePoint.reorderRevenue)})
                    </span>
                  )}
                  <span className={activePoint.deltaPct >= 0 ? 'font-semibold text-[#047857]' : 'font-semibold text-[#B91C1C]'}>
                    {activePoint.deltaPct >= 0 ? `↑ +${activePoint.deltaPct}%` : `↓ ${activePoint.deltaPct}%`}
                  </span>
                </div>
              </>
            ) : (
              <span className="text-[#555555]">
                Hover or focus any period column to inspect exact order revenue &amp; repeat rate.
              </span>
            )}
          </div>

          {/* Chart Plot Area */}
          <div className="relative flex h-[250px] gap-3">
            {/* Y-Axis Labels */}
            <div className="flex flex-col justify-between pb-7 text-right text-[11px] font-medium tabular-nums text-[#555555]">
              {ticks.map((tick, idx) => (
                <span key={idx}>{tick}</span>
              ))}
            </div>

            {/* Grid & Bar Columns */}
            <div className="relative flex-1">
              {/* Hairline Horizontal Gridlines */}
              <div className="pointer-events-none absolute inset-x-0 top-0 bottom-7 flex flex-col justify-between">
                {ticks.map((_, idx) => (
                  <div key={idx} className="w-full border-b border-dashed border-[#E5E7EB]" />
                ))}
              </div>

              <div
                className="relative z-10 grid h-full items-end gap-2 sm:gap-4"
                style={{ gridTemplateColumns: `repeat(${points.length}, minmax(0, 1fr))` }}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {points.map((pt, idx) => {
                  const isFocused = activeIndex === idx;
                  const dimmed = activeIndex !== null && !isFocused;
                  const orderPct = Math.max(4, (pt.ordersCount / maxCount) * 100);
                  const reorderPct = Math.max(4, (pt.reordersCount / maxCount) * 100);

                  return (
                    <div
                      key={`${period}-${pt.month}`}
                      tabIndex={0}
                      role="button"
                      aria-label={`${pt.fullMonth}: ${pt.ordersCount} orders, ${pt.reordersCount} reorders`}
                      onMouseEnter={() => setActiveIndex(idx)}
                      onFocus={() => setActiveIndex(idx)}
                      onBlur={() => setActiveIndex(null)}
                      onKeyDown={(e) => {
                        if (e.key === 'ArrowRight') {
                          setActiveIndex((idx + 1) % points.length);
                        } else if (e.key === 'ArrowLeft') {
                          setActiveIndex((idx - 1 + points.length) % points.length);
                        }
                      }}
                      className={`group flex h-full cursor-pointer flex-col justify-end rounded-lg px-1 pt-2 transition-opacity duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0057FF] ${
                        dimmed ? 'opacity-45' : 'opacity-100'
                      }`}
                    >
                      <div className="flex h-[calc(100%-28px)] items-end justify-center gap-1.5 sm:gap-2">
                        {showOrder && (
                          <motion.div
                            initial={{ scaleY: 0 }}
                            animate={{ scaleY: 1 }}
                            transition={{
                              duration: 0.34,
                              delay: Math.min(idx * 0.03, 0.2),
                              ease: [0.23, 1, 0.32, 1],
                            }}
                            style={{ height: `${orderPct}%`, originY: 1 }}
                            className="relative w-3.5 rounded-t-md bg-[#0057FF] transition-colors duration-150 group-hover:bg-[#0046D5] sm:w-5 lg:w-6"
                          >
                            {isFocused && (
                              <span className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold tabular-nums text-[#0057FF]">
                                {pt.ordersCount}
                              </span>
                            )}
                          </motion.div>
                        )}
                        {showReorder && (
                          <motion.div
                            initial={{ scaleY: 0 }}
                            animate={{ scaleY: 1 }}
                            transition={{
                              duration: 0.34,
                              delay: Math.min(idx * 0.03 + 0.04, 0.24),
                              ease: [0.23, 1, 0.32, 1],
                            }}
                            style={{ height: `${reorderPct}%`, originY: 1 }}
                            className="relative w-3.5 rounded-t-md bg-[#66ACFF] transition-colors duration-150 group-hover:bg-[#3B82F6] sm:w-5 lg:w-6"
                          >
                            {isFocused && (
                              <span className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold tabular-nums text-[#1D4ED8]">
                                {pt.reordersCount}
                              </span>
                            )}
                          </motion.div>
                        )}
                      </div>

                      <div className="mt-2 flex h-5 items-center justify-center">
                        <span
                          className={`text-xs font-medium transition-colors ${
                            isFocused ? 'font-semibold text-[#131313]' : 'text-[#555555]'
                          }`}
                        >
                          {pt.month}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#E5E7EB] pt-3.5 text-xs">
        <p className="flex items-center gap-1.5 font-medium text-[#131313]">
          <TrendingUp className="h-3.5 w-3.5 text-[#047857]" aria-hidden="true" />
          <span>{series.trendText}</span>
        </p>
        <p className="text-[#555555]">Click legend chips above to compare or isolate series</p>
      </div>
    </figure>
  );
}
