import { useState } from 'react';
import { Sparkles, Ticket } from 'lucide-react';
import { toast } from 'sonner';
import { BrandSelect } from '../components/ui/BrandSelect';
import { useDashboard } from '../store/dashboardStore';
import { formatCurrencyCompact } from '../utils/format';

export function CouponCreatePage() {
  const { state, dispatch, navigate } = useDashboard();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'fixed' | 'percent'>('fixed');
  const [value, setValue] = useState('100');
  const [minSpend, setMinSpend] = useState('500');
  const [maxDiscount, setMaxDiscount] = useState('200');
  const [usageLimit, setUsageLimit] = useState('250');
  const [productScope, setProductScope] = useState('All Furniture');

  const generateCode = () => {
    const suffix = Math.floor(10 + Math.random() * 89);
    const val = Math.max(5, Number(value) || 25);
    setCode(`SOHNNE${val}${suffix}`.toUpperCase());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    const cleanName = name.trim();
    const numericVal = Number(value);

    if (!cleanName || !cleanCode) {
      toast.error('Please enter both a Coupon Name and Coupon Code.');
      return;
    }
    if (!Number.isFinite(numericVal) || numericVal <= 0) {
      toast.error('Coupon value must be greater than 0.');
      return;
    }
    if (discountType === 'percent' && numericVal > 90) {
      toast.error('Percentage discount cannot exceed 90%.');
      return;
    }
    if (state.coupons.some((c) => c.code === cleanCode)) {
      toast.error(`Coupon code ${cleanCode} already exists.`);
      return;
    }

    dispatch({
      type: 'CREATE_COUPON',
      coupon: {
        id: `cp-${Date.now()}`,
        name: cleanName,
        code: cleanCode,
        discountType,
        discountValue: numericVal,
        discountDisplay: discountType === 'fixed' ? `$${numericVal} Off` : `${numericVal}% Off`,
        minSpend: Math.max(0, Number(minSpend) || 0),
        maxDiscount: Math.max(0, Number(maxDiscount) || numericVal),
        usage: 0,
        usageLimit: Math.max(1, Math.round(Number(usageLimit) || 100)),
        amountDiscounted: 0,
        salesGenerated: 0,
        productScope,
        active: true,
        createdAt: 'Just now',
      },
    });
    toast.success(`Coupon ${cleanCode} created and activated!`);
  };

  const numericPreviewVal = Number(value) || 0;
  const previewDiscountText =
    discountType === 'fixed' ? `$${numericPreviewVal} OFF` : `${numericPreviewVal}% OFF`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1
            id="page-heading"
            tabIndex={-1}
            className="font-serif-display text-3xl font-bold text-[#131313] focus:outline-none"
          >
            Create Coupon
          </h1>
          <p className="mt-1 text-sm text-[#555555]">
            Configure promotional discounts with real-time validation and live storefront preview.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('coupons')}
          className="btn-tactile rounded-xl border border-[#E5E7EB] bg-white px-4 py-2 text-xs font-semibold text-[#131313] hover:bg-[#F5F6F8]"
        >
          Back to Coupon List
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-[#E5E7EB] bg-white p-6 lg:col-span-8"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="coupon-name" className="block text-xs font-semibold text-[#131313]">
                Coupon Name
              </label>
              <input
                id="coupon-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Autumn Lounge VIP"
                required
                className="mt-1.5 w-full rounded-xl border border-[#E5E7EB] px-3.5 py-2.5 text-sm text-[#131313] placeholder:text-[#6B7280] focus:border-[#0057FF] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="coupon-min-spend" className="block text-xs font-semibold text-[#131313]">
                Minimum Spend (USD)
              </label>
              <input
                id="coupon-min-spend"
                type="number"
                min="0"
                value={minSpend}
                onChange={(e) => setMinSpend(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-[#E5E7EB] px-3.5 py-2.5 text-sm tabular-nums text-[#131313] focus:border-[#0057FF] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="coupon-code" className="block text-xs font-semibold text-[#131313]">
                Coupon Code
              </label>
              <div className="mt-1.5 flex gap-2">
                <input
                  id="coupon-code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. AUTUMN100"
                  required
                  className="w-full rounded-xl border border-[#E5E7EB] px-3.5 py-2.5 text-sm font-semibold uppercase tracking-wide text-[#131313] placeholder:font-normal placeholder:normal-case placeholder:text-[#6B7280] focus:border-[#0057FF] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={generateCode}
                  className="btn-tactile inline-flex shrink-0 items-center gap-1 rounded-xl border border-[#E5E7EB] bg-[#F5F6F8] px-3 text-xs font-semibold text-[#131313] hover:bg-[#E5E7EB]"
                >
                  <Sparkles className="h-3.5 w-3.5 text-[#0057FF]" aria-hidden="true" />
                  <span>Auto</span>
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="coupon-max-discount" className="block text-xs font-semibold text-[#131313]">
                Maximum Discount Cap (USD)
              </label>
              <input
                id="coupon-max-discount"
                type="number"
                min="0"
                value={maxDiscount}
                onChange={(e) => setMaxDiscount(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-[#E5E7EB] px-3.5 py-2.5 text-sm tabular-nums text-[#131313] focus:border-[#0057FF] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="coupon-value" className="block text-xs font-semibold text-[#131313]">
                Coupon Value ({discountType === 'fixed' ? 'USD' : '%'})
              </label>
              <input
                id="coupon-value"
                type="number"
                min="1"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                required
                className="mt-1.5 w-full rounded-xl border border-[#E5E7EB] px-3.5 py-2.5 text-sm tabular-nums text-[#131313] focus:border-[#0057FF] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="coupon-products" className="mb-1.5 block text-xs font-semibold text-[#131313]">
                Applicable Products
              </label>
              <BrandSelect
                id="coupon-products"
                name="productScope"
                ariaLabel="Applicable Products"
                value={productScope}
                options={[
                  { value: 'All Furniture', label: 'All Furniture' },
                  { value: 'Lounge Chairs', label: 'Lounge Chairs' },
                  { value: 'Coffee & Side Tables', label: 'Coffee & Side Tables' },
                  { value: 'Outdoor Living', label: 'Outdoor Living' },
                  ...state.products.map((p) => ({ value: p.name, label: p.name })),
                ]}
                onChange={setProductScope}
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="coupon-usage-limit" className="block text-xs font-semibold text-[#131313]">
                Coupon Usage Limit
              </label>
              <input
                id="coupon-usage-limit"
                type="number"
                min="1"
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-[#E5E7EB] px-3.5 py-2.5 text-sm tabular-nums text-[#131313] focus:border-[#0057FF] focus:outline-none"
              />
            </div>

            <fieldset>
              <legend className="block text-xs font-semibold text-[#131313]">Coupon Type</legend>
              <div className="mt-2 grid grid-cols-2 gap-2.5">
                {(
                  [
                    { id: 'fixed', label: 'Fixed Amount ($)' },
                    { id: 'percent', label: 'Percentage (%)' },
                  ] as const
                ).map((t) => (
                  <label
                    key={t.id}
                    className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold transition-colors ${
                      discountType === t.id
                        ? 'border-[#0057FF] bg-[#EEF4FF] text-[#0057FF]'
                        : 'border-[#E5E7EB] bg-white text-[#4B5563]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="coupon-type"
                      checked={discountType === t.id}
                      onChange={() => setDiscountType(t.id)}
                      className="accent-[#0057FF]"
                    />
                    <span>{t.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-[#E5E7EB] pt-5">
            <button
              type="button"
              onClick={() => navigate('coupons')}
              className="btn-tactile rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-semibold text-[#131313]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-tactile rounded-xl bg-[#131313] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#0057FF]"
            >
              Create Coupon
            </button>
          </div>
        </form>

        {/* Real-time Interactive Coupon Card Preview */}
        <aside className="rounded-2xl border border-[#E5E7EB] bg-[#F5F6F8] p-6 lg:col-span-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#555555]">
            Live Checkout Preview
          </h2>

          <div className="mt-4 overflow-hidden rounded-2xl border border-[#0057FF]/25 bg-white shadow-xs">
            <div className="bg-[#0057FF] px-5 py-4 text-white">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider opacity-90">
                  <Ticket className="h-3.5 w-3.5" aria-hidden="true" />
                  SOHNNE® Voucher
                </span>
                <span className="rounded-full bg-[#FFCA3A] px-2.5 py-0.5 text-[11px] font-bold text-[#131313]">
                  Active
                </span>
              </div>
              <p className="mt-3 font-serif-display text-2xl font-bold tabular-nums">
                {previewDiscountText}
              </p>
              <p className="mt-0.5 text-xs text-white/85">{name || 'Untitled Promo Campaign'}</p>
            </div>

            <div className="space-y-3 p-5 text-xs">
              <div className="flex items-center justify-between rounded-xl border border-dashed border-[#0057FF]/40 bg-[#EEF4FF] px-3 py-2">
                <span className="font-medium text-[#4B5563]">Promo Code</span>
                <span className="font-bold tracking-wider text-[#0057FF]">
                  {code || 'YOURCODE'}
                </span>
              </div>
              <div className="flex justify-between text-[#555555]">
                <span>Applies To</span>
                <span className="font-semibold text-[#131313]">{productScope}</span>
              </div>
              <div className="flex justify-between tabular-nums text-[#555555]">
                <span>Minimum Spend</span>
                <span className="font-semibold text-[#131313]">
                  {formatCurrencyCompact(Number(minSpend) || 0)}
                </span>
              </div>
              <div className="flex justify-between tabular-nums text-[#555555]">
                <span>Redemption Cap</span>
                <span className="font-semibold text-[#131313]">{usageLimit || 0} uses</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
