import { ProductOffer } from "@src/types";

// This mock stands in for the future price-comparison backend, which will
// return live offers gathered from US retailers for whatever the user
// describes to the agent.
export function buildMockOffers(query: string): ProductOffer[] {
  const base = query.trim() || "your item";
  return [
    {
      id: "offer-1",
      retailer: "Amazon",
      retailerLogoInitial: "a",
      title: `${capitalize(base)} — Editor's Pick`,
      price: 129.99,
      originalPrice: 159.99,
      currency: "USD",
      shippingEstimate: "Free · arrives in 2-3 days",
      etaDays: 3,
      rating: 4.6,
      reviewCount: 2318,
      inStock: true,
      isBestValue: true,
    },
    {
      id: "offer-2",
      retailer: "Best Buy",
      retailerLogoInitial: "b",
      title: `${capitalize(base)} — Standard`,
      price: 139.0,
      currency: "USD",
      shippingEstimate: "Free · arrives in 3-5 days",
      etaDays: 5,
      rating: 4.4,
      reviewCount: 891,
      inStock: true,
    },
    {
      id: "offer-3",
      retailer: "Walmart",
      retailerLogoInitial: "w",
      title: `${capitalize(base)} — Value Bundle`,
      price: 119.5,
      currency: "USD",
      shippingEstimate: "$5.99 · arrives in 4-6 days",
      etaDays: 6,
      rating: 4.2,
      reviewCount: 540,
      inStock: true,
    },
    {
      id: "offer-4",
      retailer: "Target",
      retailerLogoInitial: "t",
      title: `${capitalize(base)} — Premium Edition`,
      price: 149.99,
      currency: "USD",
      shippingEstimate: "Free · arrives in 2-4 days",
      etaDays: 4,
      rating: 4.7,
      reviewCount: 1204,
      inStock: false,
    },
  ];
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
