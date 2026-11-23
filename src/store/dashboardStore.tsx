import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import { flushSync } from 'react-dom';
import {
  BASE_DASHBOARD_TOTALS,
  INITIAL_ACCOUNTS,
  INITIAL_COUPONS,
  INITIAL_CUSTOMERS,
  INITIAL_NOTIFICATIONS,
  INITIAL_ORDERS,
  INITIAL_PRODUCTS,
  INITIAL_SHIPPING_ZONES,
  INITIAL_TAX_RULES,
} from '../data/seedData';
import type {
  Coupon,
  Customer,
  NotificationItem,
  Order,
  OrderStatus,
  PeriodKey,
  Product,
  RouteId,
  ShippingZone,
  TaxRule,
  TeamAccount,
} from '../types/dashboard';

const STORAGE_KEY = 'sohnne-admin-dashboard-v1';

export interface DashboardSettings {
  storeName: string;
  supportEmail: string;
  currency: 'USD' | 'EUR' | 'GBP';
  lowStockThreshold: number;
  reduceVisualMotion: boolean;
  liveOrderStreamEnabled: boolean;
}

export interface DashboardState {
  route: RouteId;
  selectedOrderId: string;
  selectedPeriod: PeriodKey;
  orderStatusFilter: OrderStatus | 'ALL';
  authenticatedUser: { username: string; email: string; role: string };
  orders: Order[];
  products: Product[];
  customers: Customer[];
  coupons: Coupon[];
  taxRules: TaxRule[];
  shippingZones: ShippingZone[];
  accounts: TeamAccount[];
  notifications: NotificationItem[];
  settings: DashboardSettings;
}

const DEFAULT_SETTINGS: DashboardSettings = {
  storeName: 'SOHNNE® Commerce Studio',
  supportEmail: 'support@sohnne.com',
  currency: 'USD',
  lowStockThreshold: 12,
  reduceVisualMotion: false,
  liveOrderStreamEnabled: false,
};

function createInitialState(): DashboardState {
  return {
    route: 'dashboard',
    selectedOrderId: '#SHN762639',
    selectedPeriod: 'jan-jul-2024',
    orderStatusFilter: 'ALL',
    authenticatedUser: {
      username: 'sohnne.director',
      email: 'director@sohnne.com',
      role: 'Administrator',
    },
    orders: INITIAL_ORDERS,
    products: INITIAL_PRODUCTS,
    customers: INITIAL_CUSTOMERS,
    coupons: INITIAL_COUPONS,
    taxRules: INITIAL_TAX_RULES,
    shippingZones: INITIAL_SHIPPING_ZONES,
    accounts: INITIAL_ACCOUNTS,
    notifications: INITIAL_NOTIFICATIONS,
    settings: DEFAULT_SETTINGS,
  };
}

function loadInitialState(): DashboardState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialState();
    const parsed = JSON.parse(raw) as Partial<DashboardState>;
    const defaults = createInitialState();
    return {
      ...defaults,
      ...parsed,
      settings: { ...defaults.settings, ...parsed.settings },
      route: (parsed.route as string) === 'portfolio' ? 'dashboard' : parsed.route || 'dashboard',
    };
  } catch {
    return createInitialState();
  }
}

type Action =
  | { type: 'NAVIGATE'; route: RouteId; orderId?: string; statusFilter?: OrderStatus | 'ALL' }
  | { type: 'SET_PERIOD'; period: PeriodKey }
  | { type: 'SET_ORDER_STATUS_FILTER'; status: OrderStatus | 'ALL' }
  | {
      type: 'UPDATE_ORDER';
      orderId: string;
      patch: Partial<Pick<Order, 'status' | 'trackingNumber' | 'paypalTransactionId' | 'orderNote'>>;
    }
  | { type: 'REFUND_ORDER'; orderId: string; amount: number; reason: string }
  | { type: 'DELETE_ORDER'; orderId: string }
  | { type: 'RESTORE_ORDER'; order: Order; index: number }
  | { type: 'ADD_LIVE_ORDER'; order: Order }
  | { type: 'UPDATE_PRODUCT_STOCK'; productId: string; stock: number; unitPrice: number }
  | { type: 'TOGGLE_COUPON'; couponId: string }
  | { type: 'CREATE_COUPON'; coupon: Coupon }
  | { type: 'DELETE_COUPON'; couponId: string }
  | { type: 'UPSERT_TAX'; rule: TaxRule }
  | { type: 'DELETE_TAX'; taxId: string }
  | { type: 'IMPORT_TAX_RULES'; rules: TaxRule[] }
  | { type: 'TOGGLE_SHIPPING_ZONE'; zoneId: string }
  | { type: 'CREATE_ACCOUNT'; account: TeamAccount }
  | { type: 'MARK_NOTIFICATION_READ'; id: string }
  | { type: 'MARK_ALL_NOTIFICATIONS_READ' }
  | { type: 'UPDATE_SETTINGS'; patch: Partial<DashboardSettings> }
  | { type: 'LOGIN'; email: string }
  | { type: 'REGISTER'; fullName: string; email: string; role: TeamAccount['role'] }
  | { type: 'LOGOUT' }
  | { type: 'RESET_DEMO' };

function dashboardReducer(state: DashboardState, action: Action): DashboardState {
  switch (action.type) {
    case 'NAVIGATE':
      return {
        ...state,
        route: action.route,
        selectedOrderId: action.orderId ?? state.selectedOrderId,
        orderStatusFilter: action.statusFilter ?? (action.route === 'orders' ? state.orderStatusFilter : 'ALL'),
      };
    case 'SET_PERIOD':
      return { ...state, selectedPeriod: action.period };
    case 'SET_ORDER_STATUS_FILTER':
      return { ...state, orderStatusFilter: action.status };
    case 'UPDATE_ORDER':
      return {
        ...state,
        orders: state.orders.map((o) => (o.id === action.orderId ? { ...o, ...action.patch } : o)),
      };
    case 'REFUND_ORDER': {
      return {
        ...state,
        orders: state.orders.map((o) => {
          if (o.id !== action.orderId) return o;
          const totalRefunded = Math.min(o.netSales, o.refundedAmount + action.amount);
          const isFullRefund = totalRefunded >= o.netSales;
          return {
            ...o,
            refundedAmount: totalRefunded,
            status: isFullRefund ? 'REFUNDED' : 'RETURNING',
            orderNote: action.reason ? `${o.orderNote}\n[Refund]: ${action.reason}`.trim() : o.orderNote,
          };
        }),
        notifications: [
          {
            id: `notif-${Date.now()}`,
            title: `Refund processed for ${action.orderId}`,
            description: `Issued $${action.amount.toFixed(2)} back to original payment method.`,
            timeLabel: 'Just now',
            type: 'refund',
            read: false,
            targetRoute: 'order-details',
            targetOrderId: action.orderId,
          },
          ...state.notifications,
        ],
      };
    }
    case 'DELETE_ORDER':
      return {
        ...state,
        orders: state.orders.filter((o) => o.id !== action.orderId),
      };
    case 'RESTORE_ORDER': {
      const copy = [...state.orders];
      copy.splice(Math.min(action.index, copy.length), 0, action.order);
      return { ...state, orders: copy };
    }
    case 'ADD_LIVE_ORDER': {
      return {
        ...state,
        orders: [action.order, ...state.orders],
        notifications: [
          {
            id: `notif-${Date.now()}`,
            title: `New live order ${action.order.id}`,
            description: `${action.order.customerName} placed a $${action.order.netSales.toLocaleString()} order.`,
            timeLabel: 'Just now',
            type: 'order',
            read: false,
            targetRoute: 'order-details',
            targetOrderId: action.order.id,
          },
          ...state.notifications,
        ],
      };
    }
    case 'UPDATE_PRODUCT_STOCK':
      return {
        ...state,
        products: state.products.map((p) =>
          p.id === action.productId ? { ...p, stock: action.stock, unitPrice: action.unitPrice } : p,
        ),
      };
    case 'TOGGLE_COUPON':
      return {
        ...state,
        coupons: state.coupons.map((c) => (c.id === action.couponId ? { ...c, active: !c.active } : c)),
      };
    case 'CREATE_COUPON':
      return {
        ...state,
        coupons: [action.coupon, ...state.coupons],
        route: 'coupons',
      };
    case 'DELETE_COUPON':
      return {
        ...state,
        coupons: state.coupons.filter((c) => c.id !== action.couponId),
      };
    case 'UPSERT_TAX': {
      const exists = state.taxRules.some((r) => r.id === action.rule.id);
      return {
        ...state,
        taxRules: exists
          ? state.taxRules.map((r) => (r.id === action.rule.id ? action.rule : r))
          : [action.rule, ...state.taxRules],
      };
    }
    case 'DELETE_TAX':
      return {
        ...state,
        taxRules: state.taxRules.filter((r) => r.id !== action.taxId),
      };
    case 'IMPORT_TAX_RULES':
      return {
        ...state,
        taxRules: [...action.rules, ...state.taxRules],
      };
    case 'TOGGLE_SHIPPING_ZONE':
      return {
        ...state,
        shippingZones: state.shippingZones.map((z) => (z.id === action.zoneId ? { ...z, active: !z.active } : z)),
      };
    case 'CREATE_ACCOUNT':
      return {
        ...state,
        accounts: [action.account, ...state.accounts],
      };
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map((n) => (n.id === action.id ? { ...n, read: true } : n)),
      };
    case 'MARK_ALL_NOTIFICATIONS_READ':
      return {
        ...state,
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
      };
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.patch },
      };
    case 'LOGIN': {
      const username = action.email.split('@')[0] || 'sohnne.director';
      return {
        ...state,
        authenticatedUser: {
          username,
          email: action.email.includes('@') ? action.email : `${username}@sohnne.com`,
          role: 'Administrator',
        },
        route: 'dashboard',
      };
    }
    case 'REGISTER': {
      const username = action.fullName.trim().toLowerCase().replace(/\s+/g, '.') || action.email.split('@')[0] || 'new.operator';
      const newAcc: TeamAccount = {
        id: `acc-${Date.now()}`,
        username,
        email: action.email.trim(),
        role: action.role,
        createdAt: 'Just now',
        status: 'Active',
      };
      return {
        ...state,
        accounts: [newAcc, ...state.accounts],
        authenticatedUser: {
          username: action.fullName.trim(),
          email: action.email.trim(),
          role: action.role,
        },
        route: 'dashboard',
      };
    }
    case 'LOGOUT':
      return { ...state, route: 'login' };
    case 'RESET_DEMO': {
      localStorage.removeItem(STORAGE_KEY);
      return createInitialState();
    }
    default:
      return state;
  }
}

interface DashboardContextValue {
  state: DashboardState;
  dispatch: React.Dispatch<Action>;
  navigate: (route: RouteId, opts?: { orderId?: string; statusFilter?: OrderStatus | 'ALL' }) => void;
  computedKpis: {
    netRevenue: number;
    ordersCount: number;
    refundedTotal: number;
    itemSoldTotal: number;
    unreadNotifications: number;
  };
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(dashboardReducer, undefined, loadInitialState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota issues in restricted browsers
    }
  }, [state]);

  const navigate = useCallback(
    (route: RouteId, opts?: { orderId?: string; statusFilter?: OrderStatus | 'ALL' }) => {
      const runUpdate = () => {
        dispatch({
          type: 'NAVIGATE',
          route,
          orderId: opts?.orderId,
          statusFilter: opts?.statusFilter,
        });
        window.scrollTo({ top: 0, behavior: 'instant' });
      };

      const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      const supportsVT = typeof document.startViewTransition === 'function';
      const isAuthToggle =
        (state.route === 'login' || state.route === 'register') &&
        (route === 'login' || route === 'register');

      if (supportsVT && !prefersReduced && !state.settings.reduceVisualMotion && !isAuthToggle) {
        const vt = document.startViewTransition(() => {
          flushSync(() => {
            runUpdate();
          });
        });
        vt.ready.catch(() => {});
        vt.finished
          .catch(() => {})
          .finally(() => {
            const heading = document.getElementById('page-heading');
            heading?.focus({ preventScroll: true });
          });
      } else {
        runUpdate();
        requestAnimationFrame(() => {
          document.getElementById('page-heading')?.focus({ preventScroll: true });
        });
      }
    },
    [state.route, state.settings.reduceVisualMotion],
  );

  // Optional live order ticker (strictly opt-in & pauseable per WCAG 2.2.2)
  useEffect(() => {
    if (!state.settings.liveOrderStreamEnabled) return;
    const customerNames = ['Savannah Nguyen', 'brooklyn.studio', 'Guy Hawkins', 'Theresa Webb', 'Marvin McKinney'];
    const interval = window.setInterval(() => {
      const prod = state.products[Math.floor(Math.random() * 5)];
      const cust = state.customers[Math.floor(Math.random() * state.customers.length)];
      const randomNum = Math.floor(762640 + Math.random() * 900);
      const qty = Math.random() > 0.7 ? 2 : 1;
      const net = prod.unitPrice * qty;
      const name = Math.random() > 0.5 ? cust.name : customerNames[Math.floor(Math.random() * customerNames.length)];
      dispatch({
        type: 'ADD_LIVE_ORDER',
        order: {
          id: `#SHN${randomNum}`,
          dateISO: new Date().toISOString(),
          dateLabel: 'Sep 19, 2024',
          timeLabel: 'Just now',
          customerId: cust.id,
          customerName: name,
          customerEmail: cust.email,
          customerPhone: cust.phone,
          shippingAddress: cust.address,
          billingAddress: cust.address,
          status: 'PROCESSING',
          items: [
            {
              productId: prod.id,
              productName: prod.name,
              variant: prod.variant,
              sku: prod.sku,
              image: prod.image,
              qty,
              unitPrice: prod.unitPrice,
            },
          ],
          couponCode: null,
          discountAmount: 0,
          shippingMethod: 'FREE Premium FedEx 2Day®',
          shippingCost: 0,
          refundedAmount: 0,
          netSales: net,
          orderNote: 'Incoming live store checkout.',
          trackingNumber: '',
          paypalTransactionId: `PAYID-LIVE${randomNum}`,
          attribution: {
            source: 'Google Search',
            medium: 'CPC',
            campaign: 'Live Studio Traffic',
            device: 'Desktop (Chrome)',
            sessionDuration: '04m 12s',
            landingPage: '/collections/lounge',
          },
          periodKeys: ['today', 'last-30-days', 'aug-dec-2024', 'jan-jul-2024'],
        },
      });
    }, 9000);
    return () => window.clearInterval(interval);
  }, [state.settings.liveOrderStreamEnabled, state.products, state.customers]);

  const computedKpis = useMemo(() => {
    const base = BASE_DASHBOARD_TOTALS[state.selectedPeriod];
    const matchingOrders = state.orders.filter((o) => o.periodKeys.includes(state.selectedPeriod));
    const ordersNet = matchingOrders.reduce((acc, o) => acc + (o.netSales - o.refundedAmount), 0);
    const ordersRefund = matchingOrders.reduce((acc, o) => acc + o.refundedAmount, 0);
    const itemsSum = matchingOrders.reduce(
      (acc, o) => acc + o.items.reduce((s, item) => s + item.qty, 0),
      0,
    );
    const unreadNotifications = state.notifications.filter((n) => !n.read).length;

    return {
      netRevenue: Math.max(0, Math.round(base.netRevenue + ordersNet)),
      ordersCount: base.orders + matchingOrders.length,
      refundedTotal: Math.round(base.refunded + ordersRefund),
      itemSoldTotal: base.itemSold + itemsSum,
      unreadNotifications,
    };
  }, [state.orders, state.selectedPeriod, state.notifications]);

  return (
    <DashboardContext.Provider value={{ state, dispatch, navigate, computedKpis }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard(): DashboardContextValue {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error('useDashboard must be used within DashboardProvider');
  return ctx;
}
