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
// This is a single request/response call, not a stream: the backend
// currently returns one complete JSON object per turn
// ({ message, thread }), so sendMessageToAgent below awaits the whole
// response and resolves with the finished message(s) in one go. (A prior
// version of this file had a streaming variant wired to chatSlice, but the
// backend doesn't emit incremental events, so that path was removed to
// avoid the two sides silently disagreeing about the wire format.)
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
      await new Promise((resolve) => setTimeout(resolve, 400 * attempt)); // 400ms, 800ms, ...
    }
  }
  throw lastError;
}

// ---------------------------------------------------------------------------
// Send a user message and get back the agent's complete reply.
// This is what chatSlice.sendUserMessage calls.
// ---------------------------------------------------------------------------

export async function sendMessageToAgent(
  threadId: string,
  threadHistory: ChatMessage[],
  userText: string,
  token?: string | null,
  signal?: AbortSignal
): Promise<ChatMessage[]> {
  if (!USE_MOCKS) {
    return withRetry(async () => {
      const response = await apiRequest<{
        message: { id: string; role: string; content: string; offers: ProductOffer[] | null; searchQuery: string | null; createdAt: string };
        thread: string;
      }>(`/api/v1/chat/threads/${threadId}/messages`, {
        method: "POST",
        body: { message: userText },
        token,
        signal,
      });

      const m = response.message;
      return [
        {
          id: m.id,
          role: m.role === "assistant" ? "agent" : (m.role as ChatMessage["role"]),
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
  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

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