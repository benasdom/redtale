import { ChatMessage, ProductOffer } from "@src/types";
import { buildMockOffers } from "@src/mocks/mockOffers";
import { generateId } from "@src/utils/id";
import { mockDelay, USE_MOCKS, apiRequest, ApiError } from "./apiClient";

// ---------------------------------------------------------------------------
// Chat/agent service. In production this calls the backend's conversational
// endpoint (which itself calls an LLM + the price-comparison + ordering
// services). The AI's job ends at "here are your options, want me to get
// one" - it never negotiates and never places the order itself; a human
// agent does that once the user confirms and pays. That handoff is modeled
// below via the "action_request" -> order flow.
//
// sendMessageToAgentStream is the one chatSlice actually uses (streaming,
// cancellable). sendMessageToAgent is kept below for backward compatibility
// in case anything else still imports the old non-streaming call.
// ---------------------------------------------------------------------------

const GREETING_REPLIES = [
  "buy",
  "order",
  "get me",
  "find",
  "want",
  "need",
  "purchase",
  "shop",
];

function looksLikeShoppingRequest(text: string) {
  const lower = text.toLowerCase();
  return GREETING_REPLIES.some((w) => lower.includes(w)) || lower.length > 12;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Retries transient failures (network errors, 5xx) with backoff.
// Does NOT retry 4xx — those are real client errors (bad request, auth,
// etc.) and retrying them just wastes time and repeats the same failure.
async function withRetry<T>(fn: () => Promise<T>, maxAttempts = 3): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const isClientError = err instanceof ApiError && err.status !== undefined && err.status < 500;
      if (isClientError || attempt === maxAttempts) throw err;
      await sleep(400 * attempt); // 400ms, 800ms, ...
    }
  }
  throw lastError;
}

// ---------------------------------------------------------------------------
// Streaming send — this is what chatSlice.sendUserMessage calls.
// ---------------------------------------------------------------------------

export interface StreamEvent {
  type: "offers" | "chunk" | "done" | "error";
  offers?: ProductOffer[];
  textDelta?: string;
  message?: { id: string; createdAt: string };
  fullText?: string;
  error?: string;
}

export interface SendStreamOptions {
  signal?: AbortSignal;
  onEvent: (event: StreamEvent) => void;
}

export async function sendMessageToAgentStream(
  threadId: string,
  threadHistory: ChatMessage[],
  userText: string,
  token: string | null | undefined,
  { signal, onEvent }: SendStreamOptions
): Promise<void> {
  if (USE_MOCKS) {
    return mockStream(userText, onEvent, signal);
  }

  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    let cursor = 0;
    let settled = false;

    function onAbort() {
      xhr.abort();
    }
    function cleanup() {
      if (signal) signal.removeEventListener("abort", onAbort);
    }
    if (signal) {
      if (signal.aborted) onAbort();
      else signal.addEventListener("abort", onAbort);
    }

    xhr.open("POST", `${API_BASE_URL_FOR_STREAM()}/api/v1/chat/threads/${threadId}/messages`);
    xhr.setRequestHeader("Content-Type", "application/json");
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    xhr.onreadystatechange = () => {
      if (xhr.readyState >= 3) {
        const newText = xhr.responseText.slice(cursor);
        cursor = xhr.responseText.length;
        if (newText) {
          for (const line of newText.split("\n").filter(Boolean)) {
            try {
              const evt = JSON.parse(line) as StreamEvent;
              onEvent(evt);
              if (evt.type === "error" && !settled) {
                settled = true;
                cleanup();
                reject(new ApiError(evt.error || "Stream error"));
              }
            } catch {
              // A line can arrive split across two onreadystatechange firings
              // on some platforms — safe to ignore, it completes on the next tick.
            }
          }
        }
      }
      if (xhr.readyState === 4 && !settled) {
        settled = true;
        cleanup();
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else if (xhr.status === 0) {
          reject(new DOMException("Aborted", "AbortError"));
        } else {
          reject(new ApiError(`Request failed with status ${xhr.status}`, xhr.status));
        }
      }
    };

    xhr.onerror = () => {
      if (!settled) {
        settled = true;
        cleanup();
        reject(new ApiError("Network error"));
      }
    };

    xhr.send(
      JSON.stringify({
        message: userText,
        history: threadHistory.slice(-10).map((m) => ({ role: m.role, content: m.text ?? "" })),
      })
    );
  });
}

// Small helper so this file doesn't need a second import line for
// API_BASE_URL — pulls it from apiClient lazily to avoid a circular-import
// footgun if apiClient ever imports from this file in the future.
function API_BASE_URL_FOR_STREAM(): string {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { API_BASE_URL } = require("./apiClient");
  return API_BASE_URL;
}

async function mockStream(userText: string, onEvent: (e: StreamEvent) => void, signal?: AbortSignal) {
  const trimmed = userText.trim();
  const isShoppingRequest = looksLikeShoppingRequest(trimmed);

  await mockDelay(null, 400);
  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

  const offers = isShoppingRequest ? buildMockOffers(trimmed) : undefined;
  if (offers) onEvent({ type: "offers", offers });

  const fullText = isShoppingRequest
    ? `On it. I checked ${offers!.length} US retailers for "${trimmed}" — here's what's actually worth buying right now.`
    : "Got it. Tell me what you'd like to buy and I'll pull real options from US retailers.";

  const words = fullText.split(" ");
  for (let i = 0; i < words.length; i++) {
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
    await sleep(45);
    onEvent({ type: "chunk", textDelta: (i === 0 ? "" : " ") + words[i] });
  }

  onEvent({ type: "done", message: { id: generateId("msg"), createdAt: new Date().toISOString() } });
}

// ---------------------------------------------------------------------------
// Legacy non-streaming send — kept for backward compatibility only.
// chatSlice no longer calls this; sendMessageToAgentStream above is the
// active path. Safe to delete once you've confirmed nothing else imports it.
// ---------------------------------------------------------------------------

export async function sendMessageToAgent(
  threadId: string,
  threadHistory: ChatMessage[],
  userText: string,
  token?: string | null
): Promise<ChatMessage[]> {
  if (!USE_MOCKS) {
    return withRetry(async () => {
      const response = await apiRequest<{
        message: { id: string; role: string; content: string; offers: any; searchQuery: string | null; createdAt: string };
        thread: string;
      }>(`/api/v1/chat/threads/${threadId}/messages`, {
        method: "POST",
        body: { message: userText },
        token,
      });

      const m = response.message;
      return [
        {
          id: m.id,
          role: m.role === "assistant" ? "agent" : m.role,
          kind: m.offers && m.offers.length ? "offer_carousel" : "text",
          text: m.content,
          offers: m.offers ?? undefined,
          createdAt: m.createdAt,
        } as ChatMessage,
      ];
    });
  }

  const trimmed = userText.trim();
  const isShoppingRequest = looksLikeShoppingRequest(trimmed);

  await mockDelay(null, 550); // thinking latency

  if (!isShoppingRequest) {
    return [
      {
        id: generateId("msg"),
        role: "agent",
        kind: "text",
        text:
          "Got it. Tell me what you'd like to buy and I'll pull real options from US retailers - " +
          "brand, model, budget, whatever detail you've got, and I'll take it from there.",
        createdAt: new Date().toISOString(),
      },
    ];
  }

  const offers = buildMockOffers(trimmed);
  const best = offers.find((o) => o.isBestValue) ?? offers[0];

  return [
    {
      id: generateId("msg"),
      role: "agent",
      kind: "text",
      text: `On it. I checked ${offers.length} US retailers for "${trimmed}" - here's what's actually worth buying right now.`,
      createdAt: new Date().toISOString(),
    },
    {
      id: generateId("msg"),
      role: "agent",
      kind: "offer_carousel",
      offers,
      text: `My pick: the ${best.retailer} listing at ${best.price} - best price-to-quality right now. Want me to get that one, or something else here?`,
      createdAt: new Date(Date.now() + 200).toISOString(),
    },
  ];
}

export function buildWelcomeMessage(userFirstName: string): ChatMessage {
  return {
    id: generateId("msg"),
    role: "agent",
    kind: "text",
    text: `Hey ${userFirstName}, I'm your Redtale agent. Tell me what you want to buy - any product, any US store - and I'll find the best real options and get it to your door.`,
    createdAt: new Date().toISOString(),
  };
}