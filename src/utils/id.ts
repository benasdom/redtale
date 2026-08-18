let counter = 0;

/** Lightweight unique id generator - fine for client-side mock state. */
export function generateId(prefix: string = "id") {
  counter += 1;
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now().toString(36)}${rand}${counter}`;
}

/** Order IDs in the shape the backend is expected to hand back:
 * RTL-<year>-<6 digits>. Kept here so mocks and real API share one format. */
export function generateOrderId() {
  const year = new Date().getFullYear();
  const digits = Math.floor(100000 + Math.random() * 899999);
  return `RTL-${year}-${digits}`;
}

export function generateTrackingNumber(carrier: string) {
  const prefixMap: Record<string, string> = {
    UPS: "1Z",
    FedEx: "FX",
    USPS: "US",
    DHL: "DH",
  };
  const prefix = prefixMap[carrier] ?? "RT";
  const digits = Math.floor(Math.random() * 1e10)
    .toString()
    .padStart(10, "0");
  return `${prefix}${digits}`;
}
