import { ChatMessage } from "@src/types";
import { buildMockOffers } from "@src/mocks/mockOffers";
import { generateId } from "@src/utils/id";
import { mockDelay, USE_MOCKS } from "./apiClient";

// ---------------------------------------------------------------------------
// Chat/agent service. In production this calls the backend's conversational
// endpoint (which itself calls an LLM + the price-comparison + ordering
// services). The AI's job ends at "here are your options, want me to get
// one" - it never negotiates and never places the order itself; a human
// agent does that once the user confirms and pays. That handoff is modeled
// below via the "action_request" -> order flow.
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

export async function sendMessageToAgent(
  threadHistory: ChatMessage[],
  userText: string
): Promise<ChatMessage[]> {
  if (!USE_MOCKS) {
    // TODO(backend): POST /chat/threads/:id/messages, likely with streaming.
    throw new Error("Live chat endpoint not wired up yet.");
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
    text: `Hey ${userFirstName}, I'm your Redtail agent. Tell me what you want to buy - any product, any US store - and I'll find the best real options and get it to your door.`,
    createdAt: new Date().toISOString(),
  };
}
