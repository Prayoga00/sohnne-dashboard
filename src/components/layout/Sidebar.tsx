import { useState } from 'react';
import {
  BarChart3,
  Bell,
  ChevronDown,
  LayoutDashboard,
  Lightbulb,
  LogOut,
  Package,
  Settings,
  ShoppingBag,
  Ticket,
  Truck,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { LayoutGroup, motion } from 'motion/react';
import { useDashboard } from '../../store/dashboardStore';
import type { RouteId } from '../../types/dashboard';

interface SidebarProps {
  layoutGroupId: string;
  onAfterNavigate?: () => void;
  showCloseButton?: boolean;
  onClose?: () => void;
}

export function SidebarContent({
  layoutGroupId,
  onAfterNavigate,
  showCloseButton = false,
  onClose,
}: SidebarProps) {
  const { state, navigate, computedKpis } = useDashboard();
  const [couponOpen, setCouponOpen] = useState<boolean>(true);
  const [taxOpen, setTaxOpen] = useState<boolean>(true);

  const handleGo = (route: RouteId) => {
    navigate(route);
    onAfterNavigate?.();
  };

  const activeRoute = state.route === 'order-details' ? 'orders' : state.route;

  const mainNav: Array<{
    id: RouteId;
    label: string;
    icon: typeof LayoutDashboard;
    badge?: number;
  }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Order', icon: ShoppingBag, badge: Math.max(12, state.orders.length) },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'insight', label: 'Insight', icon: Lightbulb },
    { id: 'products', label: 'Product sales', icon: Package, badge: 32 },
    { id: 'customers', label: 'Customers', icon: Users, badge: 22 },
  ];

  return (
    <LayoutGroup id={layoutGroupId}>
      <div className="flex h-full flex-col bg-white px-4 py-5">
        {/* Brand Header */}
        <div className="mb-6 flex items-center justify-between px-2">
          <button
            type="button"
            onClick={() => handleGo('dashboard')}
            className="btn-tactile flex items-center gap-2.5 text-left"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#131313] font-serif-display text-lg font-bold text-white">
              S
            </span>
            <span className="text-base font-bold tracking-tight text-[#131313]">SOHNNE®</span>
          </button>
          {showCloseButton && onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close navigation menu"
              className="btn-tactile inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E7EB] text-[#4B5563] hover:bg-[#F3F4F6]"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Main Navigation */}
        <nav aria-label="Main navigation" className="flex-1 space-y-1 overflow-y-auto pr-1">
          {mainNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeRoute === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleGo(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`btn-tactile group relative flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${
                  isActive ? 'text-white' : 'text-[#4B5563] hover:bg-[#F5F6F8] hover:text-[#131313]'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="sidebar-active-pill"
                    transition={{ type: 'spring', duration: 0.28, bounce: 0.12 }}
                    className="absolute inset-0 rounded-xl bg-[#0057FF] shadow-xs"
                  />
                )}
                <span className="relative z-10 flex items-center gap-3">
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{item.label}</span>
                </span>
                {item.badge !== undefined && (
                  <span
                    className={`relative z-10 inline-flex min-w-[24px] items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] font-bold tabular-nums ${
                      isActive
                        ? 'bg-[#FFCA3A] text-[#131313]'
                        : 'bg-[#FFCA3A] text-[#131313]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Collapsible Coupon Group */}
          <div className="pt-1">
            <button
              type="button"
              aria-expanded={couponOpen}
              onClick={() => setCouponOpen((v) => !v)}
              className={`btn-tactile flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${
                activeRoute === 'coupons' || activeRoute === 'coupon-create'
                  ? 'bg-[#EEF4FF] text-[#0057FF]'
                  : 'text-[#4B5563] hover:bg-[#F5F6F8] hover:text-[#131313]'
              }`}
            >
              <span className="flex items-center gap-3">
                <Ticket className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>Coupon</span>
              </span>
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ease-out ${
                  couponOpen ? 'rotate-180' : 'rotate-0'
                }`}
                aria-hidden="true"
              />
            </button>

            <div
              className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${
                couponOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
              }`}
            >
              <div className="overflow-hidden">
                <div className="mt-1 ml-6 space-y-1 border-l border-[#E5E7EB] pl-3">
                  {(
                    [
                      { id: 'coupons', label: 'List' },
                      { id: 'coupon-create', label: 'Create' },
                    ] as const
                  ).map((sub) => {
                    const subActive = activeRoute === sub.id;
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => handleGo(sub.id)}
                        aria-current={subActive ? 'page' : undefined}
                        className={`btn-tactile relative flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 ${
                          subActive
                            ? 'text-white'
                            : 'text-[#4B5563] hover:bg-[#F5F6F8] hover:text-[#131313]'
                        }`}
                      >
                        {subActive && (
                          <motion.span
                            layoutId="sidebar-active-pill"
                            transition={{ type: 'spring', duration: 0.28, bounce: 0.12 }}
                            className="absolute inset-0 rounded-lg bg-[#0057FF]"
                          />
                        )}
                        <span className="relative z-10">{sub.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Collapsible Shipping and Tax Group */}
          <div className="pt-0.5">
            <button
              type="button"
              aria-expanded={taxOpen}
              onClick={() => setTaxOpen((v) => !v)}
              className={`btn-tactile flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${
                activeRoute === 'tax' || activeRoute === 'shipping'
                  ? 'bg-[#EEF4FF] text-[#0057FF]'
                  : 'text-[#4B5563] hover:bg-[#F5F6F8] hover:text-[#131313]'
              }`}
            >
              <span className="flex items-center gap-3">
                <Truck className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>Shipping and Tax</span>
              </span>
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ease-out ${
                  taxOpen ? 'rotate-180' : 'rotate-0'
                }`}
                aria-hidden="true"
              />
            </button>

            <div
              className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${
                taxOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
              }`}
            >
              <div className="overflow-hidden">
                <div className="mt-1 ml-6 space-y-1 border-l border-[#E5E7EB] pl-3">
                  {(
                    [
                      { id: 'tax', label: 'Tax' },
                      { id: 'shipping', label: 'Shipping' },
                    ] as const
                  ).map((sub) => {
                    const subActive = activeRoute === sub.id;
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => handleGo(sub.id)}
                        aria-current={subActive ? 'page' : undefined}
                        className={`btn-tactile relative flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 ${
                          subActive
                            ? 'text-white'
                            : 'text-[#4B5563] hover:bg-[#F5F6F8] hover:text-[#131313]'
                        }`}
                      >
                        {subActive && (
                          <motion.span
                            layoutId="sidebar-active-pill"
                            transition={{ type: 'spring', duration: 0.28, bounce: 0.12 }}
                            className="absolute inset-0 rounded-lg bg-[#0057FF]"
                          />
                        )}
                        <span className="relative z-10">{sub.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* General Section */}
          <div className="pt-5">
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-[#555555]">
              General
            </p>
            <div className="space-y-1">
              {(
                [
                  { id: 'account', label: 'Account', icon: UserPlus },
                  {
                    id: 'notifications',
                    label: 'Notifications',
                    icon: Bell,
                    badge: computedKpis.unreadNotifications,
                  },
                  { id: 'settings', label: 'Settings', icon: Settings },
                ] as const
              ).map((item) => {
                const Icon = item.icon;
                const isActive = activeRoute === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleGo(item.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`btn-tactile relative flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${
                      isActive
                        ? 'text-white'
                        : 'text-[#4B5563] hover:bg-[#F5F6F8] hover:text-[#131313]'
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="sidebar-active-pill"
                        transition={{ type: 'spring', duration: 0.28, bounce: 0.12 }}
                        className="absolute inset-0 rounded-xl bg-[#0057FF]"
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-3">
                      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span>{item.label}</span>
                    </span>
                    {'badge' in item && item.badge !== undefined && item.badge > 0 && (
                      <span
                        className={`relative z-10 inline-flex min-w-[22px] items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] font-bold tabular-nums ${
                          isActive ? 'bg-white text-[#0057FF]' : 'bg-[#EEF4FF] text-[#0057FF]'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => handleGo('login')}
                className="btn-tactile flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#4B5563] hover:bg-[#FEE2E2]/60 hover:text-[#B91C1C]"
              >
                <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>Log out</span>
              </button>
            </div>
          </div>
        </nav>

        {/* Bottom Store Status Footnote */}
        <div className="mt-4 rounded-xl border border-[#E5E7EB] bg-[#F5F6F8] p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#131313]">SOHNNE® Studio</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#DCFCE7] px-2 py-0.5 text-[10px] font-semibold text-[#047857]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#059669]" aria-hidden="true" />
              Live
            </span>
          </div>
          <p className="mt-1 text-[11px] text-[#555555]">
            Signed in as {state.authenticatedUser.username}
          </p>
        </div>
      </div>
    </LayoutGroup>
  );
}
