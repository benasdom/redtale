import { generateId } from "@src/utils/id";
import { mockDelay, USE_MOCKS } from "./apiClient";

// ---------------------------------------------------------------------------
// Paystack payment service.
//
// In production, transaction initialization must happen server-side (never
// trust amounts from the client): the backend calls Paystack's
// /transaction/initialize with your SECRET key and returns an
// authorization_url + reference. The app then either opens that URL, or -
// as done here with react-native-paystack-webview - collects card details
// in-app using the PUBLIC key and the reference the backend issued.
// After payment, the backend re-verifies the transaction server-side via
// /transaction/verify/:reference before the order is created, so client-side
// "success" callbacks alone should never be trusted to fulfil an order.
// ---------------------------------------------------------------------------

export const PAYSTACK_PUBLIC_KEY = process.env.PAYSTACK_PUBLIC_KEY || "pk_test_replace_me";

export interface InitializedTransaction {
  reference: string;
  amount: number; // in the currency's smallest unit is handled by the widget itself
  email: string;
}

export async function initializeTransaction(
  email: string,
  amount: number
): Promise<InitializedTransaction> {
  if (!USE_MOCKS) {
    // TODO(backend): POST /payments/paystack/initialize { email, amount }
    // -> { reference }
  }
  const reference = `rtl_${generateId("txn")}`;
  return mockDelay({ reference, amount, email }, 350);
}

export async function verifyTransaction(reference: string): Promise<{ status: "success" | "failed" }> {
  if (!USE_MOCKS) {
    // TODO(backend): POST /payments/paystack/verify { reference }
  }
  return mockDelay({ status: "success" as const }, 500);
}
