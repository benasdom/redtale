// ---------------------------------------------------------------------------
// Domain types shared across the app. These map directly to the shape the
// real backend is expected to return - keeping the UI decoupled from mock
// vs. live data.
// ---------------------------------------------------------------------------

export interface User {
  id: string;
  fullName: string;
  email: string;
  photoUrl?: string;
  phone?: string;
  createdAt: string;
  authProvider: "google";
  kycStatus: "unverified" | "pending" | "verified";
}

export interface Address {
  id: string;
  label: string; // "Home", "Office", ...
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
  country: string; // ISO country name, US-focused
  phone: string;
  isDefault: boolean;
}

export type PaymentCardBrand = "visa" | "mastercard" | "verve" | "other";

export interface SavedPaymentMethod {
  id: string;
  brand: PaymentCardBrand;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

// A single option found by the (future) price-comparison backend for a
// product the user asked the agent to find.
export interface ProductOffer {
  id: string;
  retailer: string; // e.g. "Amazon", "Best Buy", "Walmart"
  retailerLogoInitial: string;
  title: string;
  imageUrl?: string;
  price: number; // USD
  originalPrice?: number;
  currency: "USD";
  shippingEstimate: string; // e.g. "Free · arrives in 3-5 days"
  etaDays: number;
  rating?: number;
  reviewCount?: number;
  inStock: boolean;
  url?: string;
  isBestValue?: boolean;
}

export interface CartItem {
  id: string;
  offer: ProductOffer;
  quantity: number;
  addedAt: string;
  note?: string;
}

export type MessageRole = "user" | "agent" | "system";

export type MessageKind =
  | "text"
  | "offer_carousel"
  | "order_confirmation"
  | "action_request"
  | "typing";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  kind: MessageKind;
  text?: string;
  offers?: ProductOffer[];
  orderSummary?: {
    orderId: string;
    itemTitle: string;
    total: number;
  };
  createdAt: string;
  pending?: boolean;
}

export interface ChatThread {
  id: string;
  title: string;
  lastMessagePreview: string;
  updatedAt: string;
  messages: ChatMessage[];
}

export type OrderStatusKey =
  | "agent_reviewing"
  | "placed"
  | "confirmed"
  | "preparing"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "issue";

export interface OrderTrackingEvent {
  id: string;
  status: OrderStatusKey;
  label: string;
  description: string;
  timestamp: string;
  location?: string;
}

export interface OrderItem {
  offer: ProductOffer;
  quantity: number;
}

export interface Order {
  id: string; // e.g. "RTL-2026-08145"
  trackingNumber?: string;
  carrier?: string;
  status: OrderStatusKey;
  placedAt: string;
  estimatedDelivery?: string;
  windowClosesAt: string; // 7-day active-tracking window end
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  serviceFee: number;
  total: number;
  currency: "USD";
  shippingAddress: Address;
  agentName: string; // human agent who actually placed the order
  agentNote?: string;
  timeline: OrderTrackingEvent[];
  paymentReference?: string;
}

export interface PriceAlert {
  id: string;
  query: string;
  targetPrice?: number;
  createdAt: string;
  active: boolean;
}
