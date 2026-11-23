import { useMemo, useState } from 'react';
import { Check, Copy, Download, Plus, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { SortableTable, type TableColumn } from '../components/ui/SortableTable';
import { ToggleSwitch } from '../components/ui/ToggleSwitch';
import { useDashboard } from '../store/dashboardStore';
import type { Coupon } from '../types/dashboard';
import { downloadCsv } from '../utils/csv';
import { formatCurrencyCompact, formatNumber } from '../utils/format';

export function CouponListPage() {
  const { state, dispatch, navigate } = useDashboard();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused'>('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const filteredCoupons = useMemo(() => {
    const q = search.trim().toLowerCase();
    return state.coupons.filter((c) => {
      if (statusFilter === 'active' && !c.active) return false;
      if (statusFilter === 'paused' && c.active) return false;
      if (!q) return true;
      return (
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.productScope.toLowerCase().includes(q)
      );
    });
  }, [state.coupons, search, statusFilter]);

  const copyCoupon = async (code: string) => {
    await navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    toast.success(`Copied coupon code ${code}`);
    window.setTimeout(() => setCopiedCode((prev) => (prev === code ? null : prev)), 1600);
  };

  const columns: TableColumn<Coupon>[] = [
    {
      key: 'code',
      label: 'Coupon',
      sortValue: (r) => r.code,
      render: (r) => (
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => copyCoupon(r.code)}
            className="btn-tactile inline-flex items-center gap-1.5 rounded-lg bg-[#DBEAFE] px-2.5 py-1 text-xs font-bold tracking-wide text-[#1D4ED8] hover:bg-[#BFDBFE]"
          >
            <span>{r.code}</span>
            {copiedCode === r.code ? (
              <Check className="h-3 w-3 text-[#047857]" aria-hidden="true" />
            ) : (
              <Copy className="h-3 w-3 opacity-75" aria-hidden="true" />
            )}
          </button>
          <div>
            <p className="text-xs font-semibold text-[#131313]">{r.name}</p>
            <p className="text-[11px] text-[#555555]">{r.productScope}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'discount',
      label: 'Discount',
      sortValue: (r) => r.discountValue,
      render: (r) => (
        <div>
          <p className="text-xs font-semibold text-[#131313]">{r.discountDisplay}</p>
          <p className="tabular-nums text-[11px] text-[#555555]">
            Min spend {formatCurrencyCompact(r.minSpend)}
          </p>
        </div>
      ),
    },
    {
      key: 'usage',
      label: 'Usage',
      sortValue: (r) => r.usage,
      render: (r) => {
        const pct = Math.min(100, Math.round((r.usage / Math.max(1, r.usageLimit)) * 100));
        return (
          <div className="min-w-[120px]">
            <div className="flex justify-between text-xs tabular-nums">
              <span className="font-semibold text-[#131313]">{r.usage}</span>
              <span className="text-[#555555]">/ {r.usageLimit}</span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[#E5E7EB]">
              <div
                style={{ width: `${pct}%` }}
                className="h-full rounded-full bg-[#0057FF] transition-[width] duration-300"
              />
            </div>
          </div>
        );
      },
    },
    {
      key: 'amountDiscounted',
      label: 'Amount Discounted',
      align: 'right',
      sortValue: (r) => r.amountDiscounted,
      render: (r) => (
        <span className="tabular-nums font-medium text-[#131313]">
          {formatCurrencyCompact(r.amountDiscounted)}
        </span>
      ),
    },
    {
      key: 'salesGenerated',
      label: 'Sales Generated',
      align: 'right',
      sortValue: (r) => r.salesGenerated,
      render: (r) => (
        <span className="tabular-nums font-semibold text-[#047857]">
          {formatCurrencyCompact(r.salesGenerated)}
        </span>
      ),
    },
    {
      key: 'active',
      label: 'Status',
      align: 'center',
      render: (r) => (
        <div className="flex items-center justify-center gap-2">
          <ToggleSwitch
            checked={r.active}
            label={`Toggle ${r.code} active state`}
            onChange={() => {
              dispatch({ type: 'TOGGLE_COUPON', couponId: r.id });
              toast.info(`${r.code} ${r.active ? 'paused' : 'activated'}`);
            }}
          />
          <button
            type="button"
            aria-label={`Delete coupon ${r.code}`}
            onClick={() => {
              dispatch({ type: 'DELETE_COUPON', couponId: r.id });
              toast.success(`Removed coupon ${r.code}`);
            }}
            className="btn-tactile inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E7EB] text-[#4B5563] hover:bg-[#FEE2E2] hover:text-[#B91C1C]"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      ),
    },
  ];

  const handleExport = () => {
    downloadCsv(
      'sohnne-coupons.csv',
      ['Code', 'Name', 'Discount', 'Usage', 'Limit', 'Amount Discounted', 'Sales Generated', 'Active'],
      filteredCoupons.map((c) => [
        c.code,
        c.name,
        c.discountDisplay,
        c.usage,
        c.usageLimit,
        c.amountDiscounted,
        c.salesGenerated,
        c.active ? 'Active' : 'Paused',
      ]),
    );
    toast.success(`Exported ${filteredCoupons.length} coupons`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1
            id="page-heading"
            tabIndex={-1}
            className="font-serif-display text-3xl font-bold text-[#131313] focus:outline-none"
          >
            List Coupon
          </h1>
          <p className="mt-1 text-sm text-[#555555]">
            Click any coupon code to copy, toggle live availability, or create new promo rules.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExport}
            className="btn-tactile inline-flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 py-2 text-xs font-semibold text-[#131313] hover:bg-[#F5F6F8]"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('coupon-create')}
            className="btn-tactile inline-flex items-center gap-1.5 rounded-xl bg-[#0057FF] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0046D5]"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Create Coupon</span>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {(
            [
              { key: 'all', label: 'All Coupons' },
              { key: 'active', label: 'Active Only' },
              { key: 'paused', label: 'Paused' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusFilter(tab.key)}
              className={`btn-tactile rounded-xl border px-3 py-1.5 text-xs font-semibold ${
                statusFilter === tab.key
                  ? 'border-[#0057FF] bg-[#0057FF] text-white'
                  : 'border-[#E5E7EB] bg-white text-[#4B5563] hover:bg-[#F5F6F8]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#555555]"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search coupon code or name..."
            aria-label="Search coupons"
            className="h-9 w-64 rounded-xl border border-[#E5E7EB] bg-white pl-9 pr-3 text-xs text-[#131313] placeholder:text-[#6B7280] focus:border-[#0057FF] focus:outline-none"
          />
        </div>
      </div>

      <SortableTable
        rows={filteredCoupons}
        columns={columns}
        getRowKey={(r) => r.id}
        ariaLabel="Promotional coupons table"
        initialSortKey="salesGenerated"
        initialSortDir="desc"
      />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E5E7EB] bg-[#F5F6F8] px-5 py-3.5 text-xs tabular-nums text-[#4B5563]">
        <span>
          <strong className="text-[#131313]">
            {formatNumber(filteredCoupons.reduce((s, c) => s + c.usage, 0))}
          </strong>{' '}
          total redemptions
        </span>
        <span>
          Total Generated Revenue:{' '}
          <strong className="text-[#131313]">
            {formatCurrencyCompact(filteredCoupons.reduce((s, c) => s + c.salesGenerated, 0))}
          </strong>
        </span>
      </div>
    </div>
  );
}
