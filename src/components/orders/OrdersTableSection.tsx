import { useMemo, useState } from 'react';
import { Download, Eye, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useDashboard } from '../../store/dashboardStore';
import type { Order, OrderStatus } from '../../types/dashboard';
import { downloadCsv } from '../../utils/csv';
import { formatCurrency } from '../../utils/format';
import { BrandSelect } from '../ui/BrandSelect';
import { ModalDialog } from '../ui/Dialog';
import { SortableTable, type TableColumn } from '../ui/SortableTable';
import { StatusBadge } from '../ui/StatusBadge';
import { TablePaginationFooter } from '../ui/TablePaginationFooter';
import { OrderQuickDrawer } from './OrderQuickDrawer';

interface OrdersTableSectionProps {
  orders: Order[];
  statusFilter: OrderStatus | 'ALL';
  onStatusFilterChange: (next: OrderStatus | 'ALL') => void;
  title?: string;
  pageSize?: number;
  exportFilename?: string;
  ariaLabel?: string;
}

const TIMEFRAME_OPTIONS = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: '30d', label: 'Last 30 Days' },
];

export function OrdersTableSection({
  orders,
  statusFilter,
  onStatusFilterChange,
  title,
  pageSize = 12,
  exportFilename = 'sohnne-orders-export.csv',
  ariaLabel = 'Orders table',
}: OrdersTableSectionProps) {
  const { state, dispatch, navigate } = useDashboard();
  const [search, setSearch] = useState('');
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | '30d'>('all');
  const [page, setPage] = useState(1);
  const [quickOrder, setQuickOrder] = useState<Order | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Order | null>(null);

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter !== 'ALL' && o.status !== statusFilter) return false;
      if (timeFilter === 'today' && !o.periodKeys.includes('today')) return false;
      if (timeFilter === '30d' && !o.periodKeys.includes('last-30-days')) return false;
      if (!q) return true;
      return (
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerEmail.toLowerCase().includes(q) ||
        o.items.some((i) => i.productName.toLowerCase().includes(q)) ||
        (o.couponCode ?? '').toLowerCase().includes(q)
      );
    });
  }, [orders, statusFilter, timeFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedRows = filteredOrders.slice((safePage - 1) * pageSize, safePage * pageSize);

  const summary = useMemo(() => {
    const totalSales = filteredOrders.reduce((acc, o) => acc + (o.netSales - o.refundedAmount), 0);
    const totalItems = filteredOrders.reduce(
      (acc, o) => acc + o.items.reduce((s, item) => s + item.qty, 0),
      0,
    );
    return { totalSales, totalItems };
  }, [filteredOrders]);

  const confirmDelete = () => {
    if (!pendingDelete) return;
    const target = pendingDelete;
    const idx = state.orders.findIndex((o) => o.id === target.id);
    dispatch({ type: 'DELETE_ORDER', orderId: target.id });
    setPendingDelete(null);
    toast(`Removed order ${target.id}`, {
      action: {
        label: 'Undo',
        onClick: () => dispatch({ type: 'RESTORE_ORDER', order: target, index: Math.max(0, idx) }),
      },
    });
  };

  const columns: TableColumn<Order>[] = [
    {
      key: 'date',
      label: 'Date',
      sortValue: (r) => r.dateISO,
      render: (r) => (
        <div>
          <p className="whitespace-nowrap text-xs font-medium text-[#131313]">{r.dateLabel}</p>
          <p className="text-[11px] text-[#555555]">{r.timeLabel}</p>
        </div>
      ),
    },
    {
      key: 'id',
      label: 'Order',
      sortValue: (r) => r.id,
      render: (r) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            navigate('order-details', { orderId: r.id });
          }}
          className="whitespace-nowrap font-semibold tabular-nums text-[#0057FF] hover:underline"
        >
          {r.id}
        </button>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortValue: (r) => r.status,
      render: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: 'customer',
      label: 'Customer',
      sortValue: (r) => r.customerName,
      render: (r) => (
        <div className="max-w-[125px]">
          <p className="truncate font-medium text-[#131313]">{r.customerName}</p>
          <p className="truncate text-[11px] text-[#555555]">{r.customerEmail}</p>
        </div>
      ),
    },
    {
      key: 'product',
      label: 'Product',
      sortValue: (r) => r.items[0]?.productName ?? '',
      render: (r) => (
        <div className="flex items-center gap-2">
          {r.items[0]?.image && (
            <img
              src={r.items[0].image}
              alt={r.items[0].productName}
              className="h-7 w-7 shrink-0 rounded-md bg-[#F5F6F8] object-cover"
            />
          )}
          <span className="max-w-[125px] truncate text-xs font-medium text-[#131313]">
            {r.items[0]?.productName}
            {r.items.length > 1 ? ` (+${r.items.length - 1})` : ''}
          </span>
        </div>
      ),
    },
    {
      key: 'itemsSold',
      label: 'Item Sold',
      align: 'right',
      sortValue: (r) => r.items.reduce((s, i) => s + i.qty, 0),
      render: (r) => (
        <span className="tabular-nums font-medium">
          {r.items.reduce((s, i) => s + i.qty, 0)}
        </span>
      ),
    },
    {
      key: 'coupon',
      label: 'Coupon',
      sortValue: (r) => r.couponCode ?? 'ZZZ',
      render: (r) =>
        r.couponCode ? (
          <span className="rounded-md bg-[#EEF4FF] px-2 py-0.5 text-xs font-semibold text-[#0057FF]">
            {r.couponCode}
          </span>
        ) : (
          <span className="text-xs text-[#6B7280]">—</span>
        ),
    },
    {
      key: 'netSales',
      label: 'Net Sales',
      align: 'right',
      sortValue: (r) => r.netSales - r.refundedAmount,
      render: (r) => (
        <span className="whitespace-nowrap font-semibold tabular-nums text-[#131313]">
          {formatCurrency(r.netSales - r.refundedAmount)}
        </span>
      ),
    },
    {
      key: 'action',
      label: 'Action',
      align: 'right',
      render: (r) => (
        <div className="inline-flex items-center justify-end gap-1.5">
          <button
            type="button"
            aria-label={`Quick view order ${r.id}`}
            onClick={(e) => {
              e.stopPropagation();
              setQuickOrder(r);
            }}
            className="btn-tactile inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#4B5563] hover:bg-[#F5F6F8] hover:text-[#131313]"
          >
            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label={`Delete order ${r.id}`}
            onClick={(e) => {
              e.stopPropagation();
              setPendingDelete(r);
            }}
            className="btn-tactile inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#4B5563] hover:border-[#FECACA] hover:bg-[#FEE2E2] hover:text-[#B91C1C]"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      ),
    },
  ];

  const handleExport = () => {
    downloadCsv(
      exportFilename,
      ['Order ID', 'Date', 'Status', 'Customer', 'Email', 'Product', 'Qty', 'Coupon', 'Net Sales'],
      filteredOrders.map((o) => [
        o.id,
        o.dateLabel,
        o.status,
        o.customerName,
        o.customerEmail,
        o.items[0]?.productName ?? '',
        o.items.reduce((s, i) => s + i.qty, 0),
        o.couponCode ?? 'None',
        (o.netSales - o.refundedAmount).toFixed(2),
      ]),
    );
    toast.success(`Exported ${filteredOrders.length} orders to CSV`);
  };

  return (
    <section className="min-w-0 space-y-4">
      {title && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-serif-display text-xl font-bold text-[#131313]">{title}</h2>
            <p className="text-xs text-[#555555]">
              Showing up to {pageSize} orders per page · click any row for details or quick view
            </p>
          </div>
        </div>
      )}

      {/* Unified Orders Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {(['ALL', 'PAID', 'PROCESSING', 'RETURNING', 'REFUNDED'] as Array<OrderStatus | 'ALL'>).map(
            (st) => {
              const active = statusFilter === st;
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => {
                    onStatusFilterChange(st);
                    setPage(1);
                  }}
                  className={`btn-tactile rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    active
                      ? 'border-[#0057FF] bg-[#0057FF] text-white'
                      : 'border-[#E5E7EB] bg-white text-[#4B5563] hover:bg-[#F5F6F8]'
                  }`}
                >
                  {st === 'ALL' ? 'All Status' : st}
                </button>
              );
            },
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#555555]"
              aria-hidden="true"
            />
            <input
              id={`orders-search-${title ? 'dashboard' : 'page'}`}
              name="ordersSearch"
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search order ID, customer, product..."
              aria-label="Search orders"
              className="h-9 w-60 rounded-xl border border-[#E5E7EB] bg-white pl-9 pr-3 text-xs text-[#131313] placeholder:text-[#6B7280] focus:border-[#0057FF] focus:outline-none sm:w-64"
            />
          </div>

          <BrandSelect
            size="sm"
            align="right"
            ariaLabel="Filter order timeframe"
            value={timeFilter}
            options={TIMEFRAME_OPTIONS}
            onChange={(val) => {
              setTimeFilter(val as 'all' | 'today' | '30d');
              setPage(1);
            }}
          />

          <button
            type="button"
            onClick={handleExport}
            className="btn-tactile inline-flex h-9 items-center gap-1.5 rounded-xl border border-[#E5E7EB] bg-white px-3.5 text-xs font-semibold text-[#131313] hover:bg-[#F5F6F8]"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Unified Table */}
      <SortableTable
        rows={paginatedRows}
        columns={columns}
        getRowKey={(r) => r.id}
        ariaLabel={ariaLabel}
        initialSortKey="date"
        initialSortDir="desc"
        onRowClick={(r) => navigate('order-details', { orderId: r.id })}
      />

      {/* Unified Pagination Footer with Direct Page Input */}
      <TablePaginationFooter
        totalItems={filteredOrders.length}
        page={safePage}
        totalPages={totalPages}
        pageSize={pageSize}
        summaryStats={[
          { label: 'Orders', value: String(filteredOrders.length) },
          { label: 'Items sold', value: String(summary.totalItems) },
          { label: 'Net Revenue', value: formatCurrency(summary.totalSales) },
        ]}
        onPageChange={setPage}
        ariaLabel={`${ariaLabel} pagination`}
      />

      <OrderQuickDrawer order={quickOrder} onClose={() => setQuickOrder(null)} />

      {/* Confirmation Dialog for Deleting Order */}
      <ModalDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        title="Remove order record?"
        description="This removes the order from your active queue. You can still undo immediately afterward."
        maxWidthClass="w-full max-w-md"
      >
        <div className="space-y-4">
          <p className="rounded-xl bg-[#F5F6F8] p-3 text-sm text-[#131313]">
            Order <strong className="tabular-nums">{pendingDelete?.id}</strong> for{' '}
            <strong>{pendingDelete?.customerName}</strong>
          </p>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setPendingDelete(null)}
              className="btn-tactile rounded-xl border border-[#E5E7EB] bg-white px-4 py-2 text-xs font-semibold text-[#131313] hover:bg-[#F5F6F8]"
            >
              Keep Order
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              className="btn-tactile rounded-xl bg-[#DC2626] px-4 py-2 text-xs font-semibold text-white hover:bg-[#B91C1C]"
            >
              Remove Order
            </button>
          </div>
        </div>
      </ModalDialog>
    </section>
  );
}
