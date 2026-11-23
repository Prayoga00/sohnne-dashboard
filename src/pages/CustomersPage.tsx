import { useMemo, useState } from 'react';
import { Copy, Download, Mail, MapPin, Phone, Search } from 'lucide-react';
import { toast } from 'sonner';
import { BrandSelect } from '../components/ui/BrandSelect';
import { ModalDialog } from '../components/ui/Dialog';
import { SortableTable, type TableColumn } from '../components/ui/SortableTable';
import { StatusBadge } from '../components/ui/StatusBadge';
import { useDashboard } from '../store/dashboardStore';
import type { Customer } from '../types/dashboard';
import { downloadCsv } from '../utils/csv';
import { formatCurrencyCompact, getInitials } from '../utils/format';

export function CustomersPage() {
  const { state, navigate } = useDashboard();
  const [search, setSearch] = useState('');
  const [countryFilter, setCountryFilter] = useState('ALL');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const countries = useMemo(
    () => Array.from(new Set(state.customers.map((c) => c.countryName))).sort(),
    [state.customers],
  );

  const filteredCustomers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return state.customers.filter((c) => {
      if (countryFilter !== 'ALL' && c.countryName !== countryFilter) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.countryName.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q)
      );
    });
  }, [state.customers, search, countryFilter]);

  const customerOrders = useMemo(
    () =>
      selectedCustomer
        ? state.orders.filter((o) => o.customerId === selectedCustomer.id)
        : [],
    [state.orders, selectedCustomer],
  );

  const copyEmail = async (e: React.MouseEvent, email: string) => {
    e.stopPropagation();
    await navigator.clipboard?.writeText(email);
    toast.success(`Copied ${email}`);
  };

  const columns: TableColumn<Customer>[] = [
    {
      key: 'name',
      label: 'Customer',
      sortValue: (r) => r.name,
      render: (r) => (
        <div className="flex items-center gap-3">
          <span
            style={{ backgroundColor: r.avatarBg }}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-[#131313]"
          >
            {getInitials(r.name)}
          </span>
          <div>
            <p className="font-semibold text-[#131313]">{r.name}</p>
            <p className="text-xs text-[#555555]">Last order {r.lastOrderDate}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      sortValue: (r) => r.email,
      render: (r) => (
        <button
          type="button"
          onClick={(e) => copyEmail(e, r.email)}
          className="inline-flex items-center gap-1.5 text-xs text-[#4B5563] hover:text-[#0057FF]"
        >
          <span>{r.email}</span>
          <Copy className="h-3 w-3 opacity-60" aria-hidden="true" />
        </button>
      ),
    },
    {
      key: 'location',
      label: 'Location',
      sortValue: (r) => r.countryName,
      render: (r) => (
        <span className="inline-flex items-center gap-2 text-xs font-medium text-[#131313]">
          <span aria-hidden="true">{r.flag}</span>
          <span>
            {r.city}, {r.countryCode}
          </span>
        </span>
      ),
    },
    {
      key: 'items',
      label: 'Items',
      align: 'right',
      sortValue: (r) => r.itemsCount,
      render: (r) => <span className="tabular-nums font-medium">{r.itemsCount}</span>,
    },
    {
      key: 'orders',
      label: 'Orders',
      align: 'right',
      sortValue: (r) => r.ordersCount,
      render: (r) => <span className="tabular-nums font-medium">{r.ordersCount}</span>,
    },
    {
      key: 'spent',
      label: 'Total Spent',
      align: 'right',
      sortValue: (r) => r.totalSpent,
      render: (r) => (
        <span className="whitespace-nowrap font-semibold tabular-nums text-[#131313]">
          {formatCurrencyCompact(r.totalSpent)}
        </span>
      ),
    },
  ];

  const handleExport = () => {
    downloadCsv(
      'sohnne-customers.csv',
      ['Customer', 'Email', 'Country', 'City', 'Items', 'Orders', 'Total Spent'],
      filteredCustomers.map((c) => [
        c.name,
        c.email,
        c.countryName,
        c.city,
        c.itemsCount,
        c.ordersCount,
        c.totalSpent,
      ]),
    );
    toast.success(`Exported ${filteredCustomers.length} customer records`);
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
            Customer
          </h1>
          <p className="mt-1 text-sm text-[#555555]">
            Inspect lifetime spend, regional distribution, and click any customer to see orders.
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

      <div className="flex flex-wrap items-center justify-between gap-3">
        <BrandSelect
          size="sm"
          ariaLabel="Filter by country"
          value={countryFilter}
          options={[
            { value: 'ALL', label: `All Countries (${state.customers.length})` },
            ...countries.map((country) => ({ value: country, label: country })),
          ]}
          onChange={setCountryFilter}
          className="min-w-[180px]"
        />

        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#555555]"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer, email, city..."
            aria-label="Search customers"
            className="h-9 w-64 rounded-xl border border-[#E5E7EB] bg-white pl-9 pr-3 text-xs text-[#131313] placeholder:text-[#6B7280] focus:border-[#0057FF] focus:outline-none"
          />
        </div>
      </div>

      <SortableTable
        rows={filteredCustomers}
        columns={columns}
        getRowKey={(r) => r.id}
        ariaLabel="Customer directory table"
        initialSortKey="spent"
        initialSortDir="desc"
        onRowClick={setSelectedCustomer}
      />

      {/* Footer Avatar Stack */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#E5E7EB] bg-[#F5F6F8] px-5 py-3.5 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {filteredCustomers.slice(0, 4).map((c) => (
              <span
                key={c.id}
                style={{ backgroundColor: c.avatarBg }}
                className="inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold text-[#131313]"
              >
                {getInitials(c.name)}
              </span>
            ))}
          </div>
          <span className="font-semibold tabular-nums text-[#131313]">8,079 All Customers</span>
        </div>

        <span className="tabular-nums text-[#4B5563]">
          Combined LTV:{' '}
          <strong className="text-[#131313]">
            {formatCurrencyCompact(filteredCustomers.reduce((s, c) => s + c.totalSpent, 0))}
          </strong>
        </span>
      </div>

      {/* Customer Purchase History Slide-Over Drawer */}
      <ModalDialog
        open={Boolean(selectedCustomer)}
        onClose={() => setSelectedCustomer(null)}
        variant="drawer"
        title={selectedCustomer?.name ?? 'Customer Profile'}
        description={
          selectedCustomer
            ? `${selectedCustomer.flag} ${selectedCustomer.city}, ${selectedCustomer.countryName}`
            : undefined
        }
      >
        {selectedCustomer && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-3 rounded-xl border border-[#E5E7EB] bg-[#F5F6F8] p-4 text-center tabular-nums">
              <div>
                <p className="text-xs text-[#555555]">Orders</p>
                <p className="mt-1 text-lg font-bold text-[#131313]">
                  {selectedCustomer.ordersCount}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#555555]">Items</p>
                <p className="mt-1 text-lg font-bold text-[#131313]">
                  {selectedCustomer.itemsCount}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#555555]">Lifetime</p>
                <p className="mt-1 text-lg font-bold text-[#0057FF]">
                  {formatCurrencyCompact(selectedCustomer.totalSpent)}
                </p>
              </div>
            </div>

            <div className="space-y-2.5 rounded-xl border border-[#E5E7EB] p-4 text-xs text-[#4B5563]">
              <p className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-[#555555]" aria-hidden="true" />
                <span>{selectedCustomer.email}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-[#555555]" aria-hidden="true" />
                <span className="tabular-nums">{selectedCustomer.phone}</span>
              </p>
              <p className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#555555]" aria-hidden="true" />
                <span>{selectedCustomer.address}</span>
              </p>
            </div>

            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#555555]">
                Order History
              </h3>
              <div className="space-y-2.5">
                {customerOrders.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-[#E5E7EB] p-4 text-center text-xs text-[#555555]">
                    No recent orders inside the active dataset window.
                  </p>
                ) : (
                  customerOrders.map((order) => (
                    <button
                      key={order.id}
                      type="button"
                      onClick={() => {
                        setSelectedCustomer(null);
                        navigate('order-details', { orderId: order.id });
                      }}
                      className="btn-tactile flex w-full items-center justify-between rounded-xl border border-[#E5E7EB] p-3.5 text-left hover:bg-[#F5F6F8]"
                    >
                      <div>
                        <p className="text-sm font-semibold tabular-nums text-[#0057FF]">
                          {order.id}
                        </p>
                        <p className="mt-0.5 text-xs text-[#555555]">{order.dateLabel}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={order.status} />
                        <span className="tabular-nums text-sm font-bold text-[#131313]">
                          {formatCurrencyCompact(order.netSales)}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </ModalDialog>
    </div>
  );
}
