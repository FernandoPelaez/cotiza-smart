import { quoteSchema } from "@/lib/schemas/quote";
import { DEFAULT_TAX_RATE } from "@/lib/domain/config";
import { createId } from "@/lib/domain/id";
import {
  canCreate,
  canUseTemplate,
  effectivePlan,
  quoteStatus,
  businessDate,
} from "@/lib/domain/quotes";
import { templateById } from "@/lib/domain/templates";
import { ApiError } from "@/lib/services/client-api";
import type {
  Workspace,
  Quote,
  QuoteInput,
  QuoteEvent,
  QuoteNotification,
} from "@/types/domain";

export function quoteEvent(quote: Quote, kind: QuoteEvent["kind"]): QuoteEvent {
  return {
    id: createId(),
    quote_id: quote.id,
    quote_number: quote.number,
    title: quote.title,
    customer_name: quote.customer.name,
    kind,
    created_at: new Date().toISOString(),
  };
}
export function saveDemoQuote(
  current: Workspace,
  input: QuoteInput,
  previous?: Quote,
) {
  input = quoteSchema.parse(input);
  if (!previous && !canCreate(current.subscription, current.creations_used))
    throw new ApiError(
      "Ya utilizaste tus 3 cotizaciones gratuitas.",
      "FREE_LIMIT",
    );
  if (
    !canUseTemplate(
      effectivePlan(current.subscription),
      templateById(input.template_id).plan,
    )
  )
    throw new ApiError("Esta plantilla requiere otro plan.", "TEMPLATE_LOCKED");
  if (previous && previous.status !== "draft")
    throw new ApiError(
      "Duplica la cotización para preparar una nueva versión.",
      "QUOTE_LOCKED",
    );
  if (
    previous &&
    current.quotes.find((q) => q.id === previous.id)?.revision !==
      previous.revision
  )
    throw new ApiError(
      "Hay una versión más reciente de esta cotización.",
      "CONFLICT",
    );
  const now = new Date().toISOString();
  const customer = { ...input.customer, id: input.customer.id || createId() };
  const number =
    1 +
    Math.max(
      0,
      ...current.events.map((e) => Number(e.quote_number.split("-").at(-1))),
      ...current.quotes.map((q) => Number(q.number.split("-").at(-1))),
    );
  const quote: Quote = {
    ...input,
    customer,
    id: previous?.id ?? createId(),
    business_id: current.business?.id ?? "demo-business",
    number:
      previous?.number ??
      `CS-${new Date().getFullYear()}-${String(number).padStart(4, "0")}`,
    status: "draft",
    created_at: previous?.created_at ?? now,
    updated_at: now,
    sent_at: null,
    responded_at: null,
    public_token: null,
    revision: (previous?.revision ?? 0) + 1,
    business_snapshot: null,
  };
  return {
    quote,
    workspace: {
      ...current,
      quotes: previous
        ? current.quotes.map((q) => (q.id === previous.id ? quote : q))
        : [quote, ...current.quotes],
      customers: [
        ...current.customers.filter((c) => c.id !== customer.id),
        customer,
      ],
      events: [
        quoteEvent(quote, previous ? "updated" : "created"),
        ...current.events,
      ],
      creations_used:
        current.creations_used +
        (!previous && effectivePlan(current.subscription) === "free" ? 1 : 0),
    },
  };
}
export function shareDemoQuote(current: Workspace, id: string) {
  const quote = current.quotes.find((q) => q.id === id);
  if (!quote) throw new ApiError("Cotización no disponible.");
  if (quoteStatus(quote) === "expired" || quote.valid_until < businessDate())
    throw new ApiError("La vigencia terminó. Duplica esta propuesta.");
  if (quote.public_token) return { quote, workspace: current };
  const token = Array.from(crypto.getRandomValues(new Uint8Array(32)), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
  const saved: Quote = {
    ...quote,
    public_token: token,
    status: "sent",
    sent_at: new Date().toISOString(),
    business_snapshot: current.business,
    revision: quote.revision + 1,
  };
  return {
    quote: saved,
    workspace: {
      ...current,
      quotes: current.quotes.map((q) => (q.id === id ? saved : q)),
      events: [quoteEvent(saved, "sent"), ...current.events],
    },
  };
}
export function respondDemoQuote(
  current: Workspace,
  token: string,
  action: "accepted" | "rejected" | "viewed",
): Workspace {
  const quote = current.quotes.find((q) => q.public_token === token);
  if (
    !quote ||
    ["accepted", "rejected", "expired", "draft"].includes(quoteStatus(quote)) ||
    (action === "viewed" && quote.status !== "sent")
  )
    return current;
  const saved: Quote = {
    ...quote,
    status: action,
    updated_at: new Date().toISOString(),
    responded_at: action === "viewed" ? null : new Date().toISOString(),
    revision: quote.revision + 1,
  };
  const event = quoteEvent(saved, action);
  const notification: QuoteNotification | null =
    action === "viewed"
      ? null
      : {
          ...event,
          event_id: event.id,
          id: createId(),
          kind: action,
          read_at: null,
        };
  return {
    ...current,
    quotes: current.quotes.map((q) => (q.id === quote.id ? saved : q)),
    events: [event, ...current.events],
    notifications: notification
      ? [notification, ...current.notifications]
      : current.notifications,
  };
}

export function duplicateDemoQuote(current: Workspace, quote: Quote) {
  const copy = saveDemoQuote(current, {
    ...quote,
    title: `${quote.title.slice(0, 152)} · copia`,
    tax_rate: DEFAULT_TAX_RATE,
    valid_until: [
      quote.valid_until,
      businessDate(new Date(Date.now() + 15 * 86400000)),
    ]
      .sort()
      .at(-1)!,
    items: quote.items.map((item) => ({
      ...item,
      id: createId(),
      discount: 0,
    })),
  });
  return {
    ...copy,
    workspace: {
      ...copy.workspace,
      events: [quoteEvent(copy.quote, "duplicated"), ...copy.workspace.events],
    },
  };
}
