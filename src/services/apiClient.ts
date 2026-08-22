// ---------------------------------------------------------------------------
// Base API client. Every service in src/services/* goes through here so
// that swapping mocks for the real Redtail backend is a one-file change:
// set USE_MOCKS to false and point BASE_URL at the live API.
//
// Real endpoints this backend is expected to expose (for reference while
// building it):
//   POST   /auth/google                  -> { user, token }
//   POST   /chat/threads/:id/messages     -> agent reply (single JSON object)
//   GET    /offers?query=...              -> ProductOffer[]
//   POST   /orders                        -> Order
//   GET    /orders                        -> Order[]
//   GET    /orders/:id                    -> Order
//   GET    /orders/:id/tracking           -> OrderTrackingEvent[]
//   GET    /addresses  POST /addresses    -> Address[]
//   POST   /payments/paystack/initialize  -> { authorizationUrl, reference }
//   POST   /payments/paystack/verify      -> { status }
// ---------------------------------------------------------------------------

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || "https://api.redtail.app";
export const USE_MOCKS = process.env.EXPO_PUBLIC_USE_MOCKS === "true";
export const USE_MOCK_AUTH = process.env.EXPO_PUBLIC_USE_MOCK_AUTH !== "false"; // defaults to mocked unless explicitly turned off
export function mockDelay<T>(value: T, ms: number = 650): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string | null;
  signal?: AbortSignal; // lets callers cancel an in-flight request (e.g. chat "stop" button)
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, token, signal } = options;
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    signal,
  });

  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    try {
      const data = await res.json();
      message = data?.message ?? message;
    } catch {
      // ignore parse errors
    }
    throw new ApiError(message, res.status);
  }

  return (await res.json()) as T;
}