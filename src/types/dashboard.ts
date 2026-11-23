export type RouteId =
  | 'dashboard'
  | 'orders'
  | 'order-details'
  | 'products'
  | 'customers'
  | 'coupons'
  | 'coupon-create'
  | 'tax'
  | 'shipping'
  | 'account'
  | 'analytics'
  | 'insight'
  | 'notifications'
  | 'settings'
  | 'login'
  | 'register';

export type PeriodKey = 'jan-jul-2024' | 'aug-dec-2024' | 'last-30-days' | 'today';

export type OrderStatus = 'PAID' | 'PROCESSING' | 'RETURNING' | 'REFUNDED';

export interface OrderLineItem {
  productId: string;
  productName: string;
  variant: string;
  sku: string;
  image: string;
  qty: number;
  unitPrice: number;
  addonName?: string;
  addonPrice?: number;
}

export interface OrderAttribution {
  source: string;
  medium: string;
  campaign: string;
  device: string;
  sessionDuration: string;
  landingPage: string;
}

export interface Order {
  id: string;
  dateISO: string;
  dateLabel: string;
  timeLabel: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  billingAddress: string;
  status: OrderStatus;
  items: OrderLineItem[];
  couponCode: string | null;
  discountAmount: number;
  shippingMethod: string;
  shippingCost: number;
  refundedAmount: number;
  netSales: number;
  orderNote: string;
  trackingNumber: string;
  paypalTransactionId: string;
  attribution: OrderAttribution;
  periodKeys: PeriodKey[];
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  variant: string;
  image: string;
  stock: number;
  categories: string[];
  unitPrice: number;
  itemsSold: number;
  orderCount: number;
  netSales: number;
  rating: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  countryCode: string;
  countryName: string;
  flag: string;
  city: string;
  address: string;
  avatarBg: string;
  itemsCount: number;
  ordersCount: number;
  totalSpent: number;
  lastOrderDate: string;
}

export interface Coupon {
  id: string;
  name: string;
  code: string;
  discountType: 'fixed' | 'percent';
  discountValue: number;
  discountDisplay: string;
  minSpend: number;
  maxDiscount: number;
  usage: number;
  usageLimit: number;
  amountDiscounted: number;
  salesGenerated: number;
  productScope: string;
  active: boolean;
  createdAt: string;
}

export interface TaxRule {
  id: string;
  countryCode: string;
  stateCode: string;
  ratePercent: number;
  taxName: string;
}

export interface ShippingZone {
  id: string;
  zoneName: string;
  region: string;
  methodName: string;
  carrier: string;
  etaLabel: string;
  flatRate: number;
  freeThreshold: number;
  active: boolean;
}

export interface TeamAccount {
  id: string;
  username: string;
  email: string;
  role: 'Administrator' | 'Store Manager' | 'Fulfillment Staff' | 'Analyst';
  createdAt: string;
  status: 'Active' | 'Pending';
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timeLabel: string;
  type: 'order' | 'stock' | 'refund' | 'system';
  read: boolean;
  targetRoute?: RouteId;
  targetOrderId?: string;
}

export interface MonthlyChartPoint {
  month: string;
  fullMonth: string;
  ordersCount: number;
  reordersCount: number;
  orderRevenue: number;
  reorderRevenue: number;
  deltaPct: number;
}
