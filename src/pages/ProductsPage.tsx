import { useMemo, useState } from 'react';
import { Download, Edit3, Search } from 'lucide-react';
import { toast } from 'sonner';
import { CategoryPopover } from '../components/ui/CategoryPopover';
import { ModalDialog } from '../components/ui/Dialog';
import { SortableTable, type TableColumn } from '../components/ui/SortableTable';
import { useDashboard } from '../store/dashboardStore';
import type { Product } from '../types/dashboard';
import { downloadCsv } from '../utils/csv';
import { formatCurrencyCompact, formatNumber, stockStatusFromCount } from '../utils/format';

export function ProductsPage() {
  const { state, dispatch } = useDashboard();
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'in' | 'low' | 'out'>('all');
  const [editing, setEditing] = useState<Product | null>(null);
  const [stockDraft, setStockDraft] = useState('0');
  const [priceDraft, setPriceDraft] = useState('0');

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return state.products.filter((p) => {
      if (stockFilter === 'in' && p.stock <= 12) return false;
      if (stockFilter === 'low' && (p.stock === 0 || p.stock > 12)) return false;
      if (stockFilter === 'out' && p.stock > 0) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.categories.some((c) => c.toLowerCase().includes(q))
      );
    });
  }, [state.products, search, stockFilter]);

  const totals = useMemo(() => {
    const sold = filteredProducts.reduce((s, p) => s + p.itemsSold, 0);
    const orders = filteredProducts.reduce((s, p) => s + p.orderCount, 0);
    const revenue = filteredProducts.reduce((s, p) => s + p.netSales, 0);
    return { sold, orders, revenue };
  }, [filteredProducts]);

  const openEditor = (p: Product) => {
    setEditing(p);
    setStockDraft(String(p.stock));
    setPriceDraft(String(p.unitPrice));
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const stock = Math.max(0, Math.round(Number(stockDraft) || 0));
    const unitPrice = Math.max(1, Number(priceDraft) || editing.unitPrice);
    dispatch({
      type: 'UPDATE_PRODUCT_STOCK',
      productId: editing.id,
      stock,
      unitPrice,
    });
    toast.success(`Updated ${editing.name}`);
    setEditing(null);
  };

  const columns: TableColumn<Product>[] = [
    {
      key: 'product',
      label: 'Product',
      sortValue: (r) => r.name,
      render: (r) => (
        <div className="flex items-center gap-3">
          <img
            src={r.image}
            alt={r.name}
            className="h-12 w-12 shrink-0 rounded-xl bg-[#F5F6F8] object-cover"
          />
          <div className="min-w-0">
            <p className="font-semibold text-[#131313]">{r.name}</p>
            <p className="text-xs text-[#555555]">
              {r.sku} · {r.variant}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'stock',
      label: 'Stock',
      sortValue: (r) => r.stock,
      render: (r) => {
        const st = stockStatusFromCount(r.stock);
        const cls =
          st.tone === 'emerald'
            ? 'bg-[#DCFCE7] text-[#047857]'
            : st.tone === 'amber'
              ? 'bg-[#FFEDD5] text-[#C2410C]'
              : 'bg-[#FEE2E2] text-[#B91C1C]';
        return (
          <div className="space-y-1">
            <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${cls}`}>
              {st.label}
            </span>
            <p className="text-xs tabular-nums text-[#555555]">{r.stock} units</p>
          </div>
        );
      },
    },
    {
      key: 'categories',
      label: 'Categories',
      render: (r) => <CategoryPopover categories={r.categories} />,
    },
    {
      key: 'itemsSold',
      label: 'Item Sold',
      align: 'right',
      sortValue: (r) => r.itemsSold,
      render: (r) => <span className="tabular-nums font-medium">{formatNumber(r.itemsSold)}</span>,
    },
    {
      key: 'orderCount',
      label: 'Orders',
      align: 'right',
      sortValue: (r) => r.orderCount,
      render: (r) => <span className="tabular-nums font-medium">{formatNumber(r.orderCount)}</span>,
    },
    {
      key: 'netSales',
      label: 'Net Sales',
      align: 'right',
      sortValue: (r) => r.netSales,
      render: (r) => (
        <span className="whitespace-nowrap font-semibold tabular-nums text-[#131313]">
          {formatCurrencyCompact(r.netSales)}
        </span>
      ),
    },
    {
      key: 'edit',
      label: 'Edit',
      align: 'right',
      render: (r) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            openEditor(r);
          }}
          aria-label={`Edit inventory for ${r.name}`}
          className="btn-tactile inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#4B5563] hover:bg-[#F5F6F8] hover:text-[#131313]"
        >
          <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      ),
    },
  ];

  const handleExport = () => {
    downloadCsv(
      'sohnne-products-sales.csv',
      ['SKU', 'Product', 'Stock', 'Categories', 'Items Sold', 'Orders', 'Unit Price', 'Net Sales'],
      filteredProducts.map((p) => [
        p.sku,
        p.name,
        p.stock,
        p.categories.join(' | '),
        p.itemsSold,
        p.orderCount,
        p.unitPrice,
        p.netSales,
      ]),
    );
    toast.success(`Exported ${filteredProducts.length} products`);
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
            Product
          </h1>
          <p className="mt-1 text-sm text-[#555555]">
            Manage stock levels, unit pricing, categories, and revenue per furniture SKU.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExport}
          className="btn-tactile inline-flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 py-2 text-xs font-semibold text-[#131313] hover:bg-[#F5F6F8]"
        >
          <Download className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              { key: 'all', label: 'All SKUs' },
              { key: 'in', label: 'In Stock' },
              { key: 'low', label: 'Low Stock' },
              { key: 'out', label: 'Out of Stock' },
            ] as const
          ).map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setStockFilter(f.key)}
              className={`btn-tactile rounded-xl border px-3 py-1.5 text-xs font-semibold ${
                stockFilter === f.key
                  ? 'border-[#0057FF] bg-[#0057FF] text-white'
                  : 'border-[#E5E7EB] bg-white text-[#4B5563] hover:bg-[#F5F6F8]'
              }`}
            >
              {f.label}
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
            placeholder="Search SKU, product, category..."
            aria-label="Search products"
            className="h-9 w-64 rounded-xl border border-[#E5E7EB] bg-white pl-9 pr-3 text-xs text-[#131313] placeholder:text-[#6B7280] focus:border-[#0057FF] focus:outline-none"
          />
        </div>
      </div>

      <SortableTable
        rows={filteredProducts}
        columns={columns}
        getRowKey={(r) => r.id}
        ariaLabel="Product inventory and sales table"
        initialSortKey="netSales"
        initialSortDir="desc"
        onRowClick={openEditor}
      />

      {/* Footer Avatar Stack + Summary */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#E5E7EB] bg-[#F5F6F8] px-5 py-3.5 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {state.customers.slice(0, 4).map((c) => (
              <span
                key={c.id}
                style={{ backgroundColor: c.avatarBg }}
                className="inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold text-[#131313]"
              >
                {c.name.slice(0, 2).toUpperCase()}
              </span>
            ))}
          </div>
          <span className="font-semibold tabular-nums text-[#131313]">8,079 All Customers</span>
        </div>

        <div className="flex flex-wrap items-center gap-4 tabular-nums text-[#4B5563]">
          <span>
            <strong className="text-[#131313]">{formatNumber(totals.sold)}</strong> items sold
          </span>
          <span>
            <strong className="text-[#131313]">{formatNumber(totals.orders)}</strong> orders
          </span>
          <span>
            Net Sales:{' '}
            <strong className="text-[#131313]">{formatCurrencyCompact(totals.revenue)}</strong>
          </span>
        </div>
      </div>

      {/* Quick Inventory Edit Drawer */}
      <ModalDialog
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        variant="drawer"
        title={editing ? editing.name : 'Edit Product'}
        description={editing ? `SKU ${editing.sku} · ${editing.variant}` : undefined}
      >
        {editing && (
          <form onSubmit={handleSaveProduct} className="space-y-5">
            <div className="flex items-center gap-4 rounded-xl border border-[#E5E7EB] bg-[#F5F6F8] p-4">
              <img
                src={editing.image}
                alt={editing.name}
                className="h-20 w-20 rounded-xl bg-white object-cover"
              />
              <div>
                <p className="text-sm font-semibold text-[#131313]">{editing.name}</p>
                <p className="mt-1 text-xs text-[#555555]">
                  {editing.itemsSold} lifetime units sold · Rating {editing.rating}/5
                </p>
              </div>
            </div>

            <div>
              <label htmlFor="prod-stock-input" className="block text-xs font-semibold text-[#131313]">
                Available Warehouse Stock
              </label>
              <input
                id="prod-stock-input"
                type="number"
                min="0"
                value={stockDraft}
                onChange={(e) => setStockDraft(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm tabular-nums text-[#131313] focus:border-[#0057FF] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="prod-price-input" className="block text-xs font-semibold text-[#131313]">
                Unit Retail Price (USD)
              </label>
              <input
                id="prod-price-input"
                type="number"
                min="1"
                value={priceDraft}
                onChange={(e) => setPriceDraft(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm tabular-nums text-[#131313] focus:border-[#0057FF] focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 border-t border-[#E5E7EB] pt-4">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="btn-tactile rounded-xl border border-[#E5E7EB] bg-white px-4 py-2 text-xs font-semibold text-[#131313]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-tactile rounded-xl bg-[#0057FF] px-5 py-2 text-xs font-semibold text-white hover:bg-[#0046D5]"
              >
                Save Inventory
              </button>
            </div>
          </form>
        )}
      </ModalDialog>
    </div>
  );
}
