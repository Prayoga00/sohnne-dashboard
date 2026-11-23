import { Bell, CheckCheck, Lightbulb, RotateCcw, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { GroupedBarChart } from '../components/dashboard/GroupedBarChart';
import { ToggleSwitch } from '../components/ui/ToggleSwitch';
import { useDashboard } from '../store/dashboardStore';
import { formatCurrencyCompact } from '../utils/format';

export function AnalyticsPage() {
  const { state, navigate } = useDashboard();
  const totalSales = state.products.reduce((s, p) => s + p.netSales, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1
            id="page-heading"
            tabIndex={-1}
            className="font-serif-display text-3xl font-bold text-[#131313] focus:outline-none"
          >
            Analytics
          </h1>
          <p className="mt-1 text-sm text-[#555555]">
            Revenue share by furniture collection and checkout conversion breakdown.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('dashboard')}
          className="btn-tactile rounded-xl border border-[#E5E7EB] bg-white px-4 py-2 text-xs font-semibold text-[#131313]"
        >
          Back to Dashboard
        </button>
      </div>

      <GroupedBarChart period={state.selectedPeriod} />

      <section className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
        <h2 className="text-base font-semibold text-[#131313]">Revenue Share by SKU</h2>
        <div className="mt-4 space-y-4">
          {state.products.map((p) => {
            const share = Math.round((p.netSales / Math.max(1, totalSales)) * 100);
            return (
              <div key={p.id}>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#131313]">{p.name}</span>
                  <span className="tabular-nums text-[#4B5563]">
                    {formatCurrencyCompact(p.netSales)} ({share}%)
                  </span>
                </div>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[#F3F4F6]">
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
                    style={{ width: `${share}%`, originX: 0 }}
                    className="h-full rounded-full bg-[#0057FF]"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export function InsightPage() {
  const { state, navigate } = useDashboard();
  const lowStockCount = state.products.filter((p) => p.stock <= state.settings.lowStockThreshold).length;
  const activeCoupons = state.coupons.filter((c) => c.active).length;

  const cards = [
    {
      title: `${lowStockCount} SKUs below safety stock (${state.settings.lowStockThreshold} units)`,
      body: 'Restock Egg Chair Replica and Acapulco Woven Lounge Chair before Q4 architectural buyer volume.',
      cta: 'Review inventory',
      route: 'products' as const,
    },
    {
      title: `${activeCoupons} active promo codes driving $514,040+ attributed revenue`,
      body: 'MC100 leads average order value uplift among Lounge Chair buyers.',
      cta: 'Manage coupons',
      route: 'coupons' as const,
    },
    {
      title: 'Organic Search & Editorial Referral lead high-ticket checkouts',
      body: 'Top orders above $1,200 convert primarily on Desktop macOS sessions exceeding 5 minutes.',
      cta: 'Inspect orders',
      route: 'orders' as const,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1
          id="page-heading"
          tabIndex={-1}
          className="font-serif-display text-3xl font-bold text-[#131313] focus:outline-none"
        >
          Insight
        </h1>
        <p className="mt-1 text-sm text-[#555555]">
          Actionable merchandising signals derived from your current orders, stock, and coupon data.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((c) => (
          <article key={c.title} className="card-hover-lift flex flex-col justify-between rounded-2xl border border-[#E5E7EB] bg-white p-5">
            <div>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#EEF4FF] text-[#0057FF]">
                <Lightbulb className="h-4 w-4" aria-hidden="true" />
              </span>
              <h2 className="mt-3 text-base font-bold text-[#131313]">{c.title}</h2>
              <p className="mt-2 text-xs leading-relaxed text-[#555555]">{c.body}</p>
            </div>
            <button
              type="button"
              onClick={() => navigate(c.route)}
              className="btn-tactile mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-[#0057FF] hover:underline"
            >
              <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{c.cta}</span>
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}

export function NotificationsPage() {
  const { state, dispatch, navigate } = useDashboard();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1
            id="page-heading"
            tabIndex={-1}
            className="font-serif-display text-3xl font-bold text-[#131313] focus:outline-none"
          >
            Notifications
          </h1>
          <p className="mt-1 text-sm text-[#555555]">
            Fulfillment dispatches, low-stock alerts, and completed PayPal refunds.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ' });
            toast.success('Marked all notifications as read');
          }}
          className="btn-tactile inline-flex items-center gap-1.5 rounded-xl border border-[#E5E7EB] bg-white px-4 py-2 text-xs font-semibold text-[#131313] hover:bg-[#F5F6F8]"
        >
          <CheckCheck className="h-3.5 w-3.5 text-[#0057FF]" aria-hidden="true" />
          <span>Mark all read</span>
        </button>
      </div>

      <div className="divide-y divide-[#E5E7EB] rounded-2xl border border-[#E5E7EB] bg-white">
        {state.notifications.map((n) => (
          <div
            key={n.id}
            className={`flex flex-wrap items-center justify-between gap-4 p-5 ${
              n.read ? 'bg-white' : 'bg-[#EEF4FF]/40'
            }`}
          >
            <div className="flex items-start gap-3">
              <span
                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                  n.read ? 'bg-[#F3F4F6] text-[#555555]' : 'bg-[#0057FF] text-white'
                }`}
              >
                <Bell className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold text-[#131313]">{n.title}</p>
                <p className="mt-0.5 text-xs text-[#555555]">{n.description}</p>
                <p className="mt-1 text-[11px] font-medium text-[#555555]">{n.timeLabel}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {n.targetRoute && (
                <button
                  type="button"
                  onClick={() => {
                    dispatch({ type: 'MARK_NOTIFICATION_READ', id: n.id });
                    navigate(n.targetRoute!, n.targetOrderId ? { orderId: n.targetOrderId } : undefined);
                  }}
                  className="btn-tactile rounded-xl border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-semibold text-[#0057FF] hover:bg-[#EEF4FF]"
                >
                  Inspect
                </button>
              )}
              {!n.read && (
                <button
                  type="button"
                  onClick={() => dispatch({ type: 'MARK_NOTIFICATION_READ', id: n.id })}
                  className="btn-tactile rounded-xl bg-[#F5F6F8] px-3 py-1.5 text-xs font-medium text-[#4B5563]"
                >
                  Mark read
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SettingsPage() {
  const { state, dispatch } = useDashboard();

  return (
    <div className="space-y-6">
      <div>
        <h1
          id="page-heading"
          tabIndex={-1}
          className="font-serif-display text-3xl font-bold text-[#131313] focus:outline-none"
        >
          Settings
        </h1>
        <p className="mt-1 text-sm text-[#555555]">
          Manage SOHNNE® workspace preferences, motion reduction, or reset local demo state.
        </p>
      </div>

      <div className="max-w-2xl space-y-5 rounded-2xl border border-[#E5E7EB] bg-white p-6">
        <div className="flex items-center justify-between gap-4 border-b border-[#E5E7EB] pb-4">
          <div>
            <p className="text-sm font-semibold text-[#131313]">Reduce Dashboard Motion</p>
            <p className="text-xs text-[#555555]">
              Disables route view transitions while keeping crisp accessibility focus indicators.
            </p>
          </div>
          <ToggleSwitch
            checked={state.settings.reduceVisualMotion}
            label="Toggle reduced visual motion"
            onChange={() => {
              dispatch({
                type: 'UPDATE_SETTINGS',
                patch: { reduceVisualMotion: !state.settings.reduceVisualMotion },
              });
              toast.info('Updated motion preference');
            }}
          />
        </div>

        <div className="flex items-center justify-between gap-4 border-b border-[#E5E7EB] pb-4">
          <div>
            <p className="text-sm font-semibold text-[#131313]">Live Checkout Simulator</p>
            <p className="text-xs text-[#555555]">
              Periodically adds realistic sample orders so you can test real-time KPI &amp; chart updates.
            </p>
          </div>
          <ToggleSwitch
            checked={state.settings.liveOrderStreamEnabled}
            label="Toggle live order simulator"
            onChange={() =>
              dispatch({
                type: 'UPDATE_SETTINGS',
                patch: { liveOrderStreamEnabled: !state.settings.liveOrderStreamEnabled },
              })
            }
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
          <div>
            <p className="text-sm font-semibold text-[#131313]">Reset Demo Workspace</p>
            <p className="text-xs text-[#555555]">
              Restore original sample orders, refunds, coupons, inventory, and tax rules.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              dispatch({ type: 'RESET_DEMO' });
              toast.success('Demo dataset restored to initial baseline');
            }}
            className="btn-tactile inline-flex items-center gap-2 rounded-xl border border-[#FECACA] bg-[#FEE2E2]/60 px-4 py-2 text-xs font-semibold text-[#B91C1C] hover:bg-[#FEE2E2]"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>
    </div>
  );
}
