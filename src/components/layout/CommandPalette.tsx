import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  Bell,
  LayoutDashboard,
  Lightbulb,
  Package,
  PlusCircle,
  Search,
  Settings,
  ShoppingBag,
  Ticket,
  Truck,
  UserPlus,
  Users,
} from 'lucide-react';
import { useDashboard } from '../../store/dashboardStore';
import type { RouteId } from '../../types/dashboard';
import { formatCurrency } from '../../utils/format';
import { ModalDialog } from '../ui/Dialog';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

const ROUTE_ITEMS: Array<{ id: RouteId; label: string; group: string; icon: typeof LayoutDashboard }> = [
  { id: 'dashboard', label: 'Dashboard Overview', group: 'Pages', icon: LayoutDashboard },
  { id: 'orders', label: 'Orders', group: 'Pages', icon: ShoppingBag },
  { id: 'products', label: 'Product Sales & Inventory', group: 'Pages', icon: Package },
  { id: 'customers', label: 'Customers Directory', group: 'Pages', icon: Users },
  { id: 'coupons', label: 'Coupon List', group: 'Pages', icon: Ticket },
  { id: 'coupon-create', label: 'Create Coupon', group: 'Pages', icon: PlusCircle },
  { id: 'tax', label: 'Tax Rules (CSV)', group: 'Pages', icon: Truck },
  { id: 'shipping', label: 'Shipping Zones', group: 'Pages', icon: Truck },
  { id: 'analytics', label: 'Analytics Funnel', group: 'Pages', icon: BarChart3 },
  { id: 'insight', label: 'Merchandising Insights', group: 'Pages', icon: Lightbulb },
  { id: 'account', label: 'Team Account Management', group: 'General', icon: UserPlus },
  { id: 'notifications', label: 'Notifications', group: 'General', icon: Bell },
  { id: 'settings', label: 'Store Settings', group: 'General', icon: Settings },
];

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const { state, navigate } = useDashboard();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const q = query.trim().toLowerCase();

  const matchingRoutes = useMemo(
    () => ROUTE_ITEMS.filter((r) => !q || r.label.toLowerCase().includes(q) || r.group.toLowerCase().includes(q)),
    [q],
  );

  const matchingOrders = useMemo(
    () =>
      q
        ? state.orders
            .filter(
              (o) =>
                o.id.toLowerCase().includes(q) ||
                o.customerName.toLowerCase().includes(q) ||
                o.items.some((i) => i.productName.toLowerCase().includes(q)),
            )
            .slice(0, 5)
        : state.orders.slice(0, 4),
    [state.orders, q],
  );

  const matchingProducts = useMemo(
    () =>
      q
        ? state.products
            .filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
            .slice(0, 4)
        : [],
    [state.products, q],
  );

  const jumpToRoute = (route: RouteId, orderId?: string) => {
    onClose();
    navigate(route, orderId ? { orderId } : undefined);
  };

  return (
    <ModalDialog open={open} onClose={onClose} title="Quick Jump Command Palette" variant="command">
      <div className="border-b border-[#E5E7EB] px-4 py-3">
        <div className="flex items-center gap-2.5">
          <Search className="h-4 w-4 text-[#555555]" aria-hidden="true" />
          <input
            ref={inputRef}
            id="command-palette-search"
            name="command-search"
            type="text"
            role="searchbox"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Jump to page, order #SHN..., or SKU..."
            aria-label="Search pages, orders, and products"
            className="w-full bg-transparent text-sm text-[#131313] placeholder:text-[#6B7280] focus:outline-none"
          />
          <kbd className="rounded border border-[#E5E7EB] bg-[#F5F6F8] px-1.5 py-0.5 text-[11px] font-medium text-[#555555]">
            ESC
          </kbd>
        </div>
      </div>

      <div className="max-h-[380px] overflow-y-auto p-2">
        {matchingOrders.length > 0 && (
          <div className="mb-2">
            <p className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#555555]">
              Orders
            </p>
            {matchingOrders.map((order) => (
              <button
                key={order.id}
                type="button"
                onClick={() => jumpToRoute('order-details', order.id)}
                className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm hover:bg-[#F5F6F8]"
              >
                <span className="flex items-center gap-2.5">
                  <ShoppingBag className="h-4 w-4 text-[#0057FF]" aria-hidden="true" />
                  <span className="font-semibold tabular-nums text-[#131313]">{order.id}</span>
                  <span className="text-[#555555]">— {order.customerName}</span>
                </span>
                <span className="tabular-nums text-xs font-medium text-[#131313]">
                  {formatCurrency(order.netSales - order.refundedAmount)}
                </span>
              </button>
            ))}
          </div>
        )}

        {matchingProducts.length > 0 && (
          <div className="mb-2">
            <p className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#555555]">
              Products
            </p>
            {matchingProducts.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => jumpToRoute('products')}
                className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm hover:bg-[#F5F6F8]"
              >
                <span className="flex items-center gap-2.5">
                  <Package className="h-4 w-4 text-[#4B5563]" aria-hidden="true" />
                  <span className="font-medium text-[#131313]">{product.name}</span>
                </span>
                <span className="tabular-nums text-xs text-[#555555]">{product.sku}</span>
              </button>
            ))}
          </div>
        )}

        {matchingRoutes.length > 0 && (
          <div>
            <p className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#555555]">
              Navigation
            </p>
            {matchingRoutes.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => jumpToRoute(item.id)}
                  className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm hover:bg-[#F5F6F8]"
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4 text-[#4B5563]" aria-hidden="true" />
                    <span className="font-medium text-[#131313]">{item.label}</span>
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-[#6B7280]" aria-hidden="true" />
                </button>
              );
            })}
          </div>
        )}

        {matchingRoutes.length === 0 && matchingOrders.length === 0 && matchingProducts.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-[#555555]">
            No matching pages, orders, or products for “{query}”.
          </p>
        )}
      </div>
    </ModalDialog>
  );
}
