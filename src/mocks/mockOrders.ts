import { Order, OrderStatusKey, OrderTrackingEvent } from "@src/types";
import { generateTrackingNumber } from "@src/utils/id";

const STEP_LABELS: Record<OrderStatusKey, { label: string; description: string }> = {
  agent_reviewing: {
    label: "Agent reviewing",
    description: "Your Redtail agent is confirming the best offer before buying.",
  },
  placed: {
    label: "Order placed",
    description: "Your agent placed the order with the retailer on your behalf.",
  },
  confirmed: {
    label: "Order confirmed",
    description: "The retailer confirmed your order and is preparing it.",
  },
  preparing: {
    label: "Preparing shipment",
    description: "Your item is being packed for shipping.",
  },
  shipped: {
    label: "Shipped",
    description: "Your package has left the warehouse.",
  },
  out_for_delivery: {
    label: "Out for delivery",
    description: "Your package is on the truck and arriving today.",
  },
  delivered: {
    label: "Delivered",
    description: "Your package was delivered.",
  },
  cancelled: {
    label: "Cancelled",
    description: "This order was cancelled.",
  },
  issue: {
    label: "Needs attention",
    description: "There's an issue your agent is resolving.",
  },
};

const ORDER_SEQUENCE: OrderStatusKey[] = [
  "agent_reviewing",
  "placed",
  "confirmed",
  "preparing",
  "shipped",
  "out_for_delivery",
  "delivered",
];

function buildTimeline(currentIndex: number, placedAt: Date): OrderTrackingEvent[] {
  const events: OrderTrackingEvent[] = [];
  for (let i = 0; i <= currentIndex; i++) {
    const status = ORDER_SEQUENCE[i];
    const ts = new Date(placedAt.getTime() + i * (1000 * 60 * 60 * 9)); // ~9h apart
    events.push({
      id: `evt_${i}`,
      status,
      label: STEP_LABELS[status].label,
      description: STEP_LABELS[status].description,
      timestamp: ts.toISOString(),
      location: i >= 4 ? "Louisville, KY" : undefined,
    });
  }
  return events;
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function plusDays(d: Date, n: number) {
  const nd = new Date(d);
  nd.setDate(nd.getDate() + n);
  return nd;
}

export function buildMockOrders(): Order[] {
  const orders: Order[] = [
    {
      id: "RTL-2026-483920",
      trackingNumber: generateTrackingNumber("UPS"),
      carrier: "UPS",
      status: "out_for_delivery",
      placedAt: daysAgo(2).toISOString(),
      estimatedDelivery: plusDays(new Date(), 0).toISOString(),
      windowClosesAt: plusDays(daysAgo(2), 7).toISOString(),
      items: [
        {
          offer: {
            id: "o1",
            retailer: "Amazon",
            retailerLogoInitial: "a",
            title: "Sony WH-1000XM6 Wireless Headphones",
            price: 349.99,
            currency: "USD",
            shippingEstimate: "Free · arrives in 2 days",
            etaDays: 2,
            rating: 4.8,
            reviewCount: 5120,
            inStock: true,
          },
          quantity: 1,
        },
      ],
      subtotal: 349.99,
      shippingFee: 0,
      serviceFee: 6.99,
      total: 356.98,
      currency: "USD",
      shippingAddress: {
        id: "addr_1",
        label: "Home",
        fullName: "Benjamin Asumadu",
        line1: "412 Maple Street",
        city: "Austin",
        state: "TX",
        zip: "78701",
        country: "United States",
        phone: "+1 (512) 555-0142",
        isDefault: true,
      },
      agentName: "Jordan M.",
      agentNote: "Found the best price across 4 retailers - grabbed it before the deal expired.",
      timeline: buildTimeline(5, daysAgo(2)),
    },
    {
      id: "RTL-2026-481207",
      trackingNumber: generateTrackingNumber("FedEx"),
      carrier: "FedEx",
      status: "shipped",
      placedAt: daysAgo(4).toISOString(),
      estimatedDelivery: plusDays(new Date(), 2).toISOString(),
      windowClosesAt: plusDays(daysAgo(4), 7).toISOString(),
      items: [
        {
          offer: {
            id: "o2",
            retailer: "Best Buy",
            retailerLogoInitial: "b",
            title: "Instant Pot Duo 7-in-1, 6 Qt",
            price: 79.95,
            currency: "USD",
            shippingEstimate: "Free · arrives in 4 days",
            etaDays: 4,
            rating: 4.7,
            reviewCount: 18320,
            inStock: true,
          },
          quantity: 1,
        },
      ],
      subtotal: 79.95,
      shippingFee: 0,
      serviceFee: 4.5,
      total: 84.45,
      currency: "USD",
      shippingAddress: {
        id: "addr_1",
        label: "Home",
        fullName: "Benjamin Asumadu",
        line1: "412 Maple Street",
        city: "Austin",
        state: "TX",
        zip: "78701",
        country: "United States",
        phone: "+1 (512) 555-0142",
        isDefault: true,
      },
      agentName: "Priya S.",
      timeline: buildTimeline(4, daysAgo(4)),
    },
    {
      id: "RTL-2026-475310",
      trackingNumber: generateTrackingNumber("USPS"),
      carrier: "USPS",
      status: "delivered",
      placedAt: daysAgo(9).toISOString(),
      estimatedDelivery: daysAgo(4).toISOString(),
      windowClosesAt: daysAgo(2).toISOString(),
      items: [
        {
          offer: {
            id: "o3",
            retailer: "Target",
            retailerLogoInitial: "t",
            title: "Stanley Quencher 40oz Tumbler",
            price: 45.0,
            currency: "USD",
            shippingEstimate: "Free · arrives in 5 days",
            etaDays: 5,
            rating: 4.5,
            reviewCount: 9042,
            inStock: true,
          },
          quantity: 2,
        },
      ],
      subtotal: 90.0,
      shippingFee: 0,
      serviceFee: 5.25,
      total: 95.25,
      currency: "USD",
      shippingAddress: {
        id: "addr_1",
        label: "Home",
        fullName: "Benjamin Asumadu",
        line1: "412 Maple Street",
        city: "Austin",
        state: "TX",
        zip: "78701",
        country: "United States",
        phone: "+1 (512) 555-0142",
        isDefault: true,
      },
      agentName: "Jordan M.",
      timeline: buildTimeline(6, daysAgo(9)),
    },
  ];

  return orders;
}
