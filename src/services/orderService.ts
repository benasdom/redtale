import { Address, Order, OrderStatusKey, ProductOffer } from "@src/types";
import { buildMockOrders } from "@src/mocks/mockOrders";
import { generateOrderId, generateTrackingNumber } from "@src/utils/id";
import { mockDelay, USE_MOCKS } from "./apiClient";

let ordersCache: Order[] | null = null;

function ensureCache(): Order[] {
  if (!ordersCache) ordersCache = buildMockOrders();
  return ordersCache;
}

export async function fetchOrders(): Promise<Order[]> {
  if (!USE_MOCKS) {
    // TODO(backend): GET /orders
  }
  const orders = ensureCache();
  // Newest first
  return mockDelay(
    [...orders].sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime())
  );
}

export async function fetchOrderById(id: string): Promise<Order | undefined> {
  if (!USE_MOCKS) {
    // TODO(backend): GET /orders/:id
  }
  const orders = ensureCache();
  return mockDelay(orders.find((o) => o.id === id));
}

export interface PlaceOrderInput {
  offer: ProductOffer;
  quantity: number;
  address: Address;
  paymentReference: string;
  agentName?: string;
}

export async function placeOrder(input: PlaceOrderInput): Promise<Order> {
  if (!USE_MOCKS) {
    // TODO(backend): POST /orders - the backend hands this to a human
    // agent queue; the AI does not place the order itself.
  }
  const now = new Date();
  const windowCloses = new Date(now);
  windowCloses.setDate(windowCloses.getDate() + 7);

  const order: Order = {
    id: generateOrderId(),
    trackingNumber: undefined,
    carrier: undefined,
    status: "agent_reviewing",
    placedAt: now.toISOString(),
    estimatedDelivery: undefined,
    windowClosesAt: windowCloses.toISOString(),
    items: [{ offer: input.offer, quantity: input.quantity }],
    subtotal: input.offer.price * input.quantity,
    shippingFee: 0,
    serviceFee: Math.max(2.99, input.offer.price * input.quantity * 0.02),
    total: 0,
    currency: "USD",
    shippingAddress: input.address,
    agentName: input.agentName ?? "Redtail Agent Team",
    timeline: [
      {
        id: "evt_0",
        status: "agent_reviewing",
        label: "Agent reviewing",
        description: "Your Redtail agent is confirming the best offer before buying.",
        timestamp: now.toISOString(),
      },
    ],
    paymentReference: input.paymentReference,
  };
  order.total = order.subtotal + order.shippingFee + order.serviceFee;

  const orders = ensureCache();
  orders.unshift(order);

  return mockDelay(order, 900);
}

/** Simulates the order progressing, e.g. for demoing the tracking UI. */
export async function advanceOrderStatus(orderId: string): Promise<Order | undefined> {
  const sequence: OrderStatusKey[] = [
    "agent_reviewing",
    "placed",
    "confirmed",
    "preparing",
    "shipped",
    "out_for_delivery",
    "delivered",
  ];
  const orders = ensureCache();
  const order = orders.find((o) => o.id === orderId);
  if (!order) return undefined;

  const currentIndex = sequence.indexOf(order.status);
  const nextIndex = Math.min(currentIndex + 1, sequence.length - 1);
  const nextStatus = sequence[nextIndex];
  order.status = nextStatus;

  if (nextStatus === "shipped" && !order.trackingNumber) {
    order.carrier = "UPS";
    order.trackingNumber = generateTrackingNumber("UPS");
  }

  order.timeline.push({
    id: `evt_${order.timeline.length}`,
    status: nextStatus,
    label: nextStatus.replace(/_/g, " "),
    description: "Status updated.",
    timestamp: new Date().toISOString(),
  });

  return mockDelay(order, 400);
}
