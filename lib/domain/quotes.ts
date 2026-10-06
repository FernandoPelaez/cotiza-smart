import { createId } from "@/lib/domain/id";
import {
  DEFAULT_DESIGN,
  DEFAULT_TAX_RATE,
  FREE_CREATION_LIMIT,
} from "./config";
import type { Plan, Quote, QuoteInput, Subscription } from "@/types/domain";
export function effectivePlan(
  subscription: Subscription,
  now = new Date(),
): Plan {
  if (subscription.plan === "free") return "free";
  if (subscription.status !== "active" && subscription.status !== "trialing")
    return "free";
  if (
    !subscription.current_period_end ||
    new Date(subscription.current_period_end) <= now
  )
    return "free";
  return subscription.plan;
}
export function canCreate(
  subscription: Subscription,
  used: number,
  now = new Date(),
): boolean {
  return (
    effectivePlan(subscription, now) !== "free" || used < FREE_CREATION_LIMIT
  );
}
export function canUseTemplate(plan: Plan, required: Plan): boolean {
  // El nivel se conserva como metadato; esta edición abre el catálogo completo.
  return [plan, required].every((value) =>
    ["free", "pro", "premium"].includes(value),
  );
}
/** Todas las fechas de negocio se interpretan en Ciudad de México; SSR y navegador producen el mismo texto. */
export const BUSINESS_TIME_ZONE = "America/Mexico_City";
export function businessDate(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: BUSINESS_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  return ["year", "month", "day"]
    .map((type) => parts.find((p) => p.type === type)?.value ?? "")
    .join("-");
}
export function quoteStatus(quote: Quote, now = new Date()): Quote["status"] {
  if (["accepted", "rejected", "draft"].includes(quote.status))
    return quote.status;
  return quote.valid_until < businessDate(now) ? "expired" : quote.status;
}
export function blankQuote(): QuoteInput {
  const valid = new Date();
  valid.setDate(valid.getDate() + 15);
  return {
    title: "",
    customer: { id: "", name: "", email: "", phone: "", address: "", rfc: "" },
    items: [
      {
        id: createId(),
        description: "",
        kind: "service",
        quantity: 1,
        unit: "servicio",
        unit_price: 0,
        discount: 0,
      },
    ],
    template_id: "essential",
    design: { ...DEFAULT_DESIGN },
    tax_rate: DEFAULT_TAX_RATE,
    valid_until: businessDate(valid),
    notes:
      "Gracias por considerar nuestra propuesta. Estamos a tu disposición para cualquier duda.",
    terms: "50% de anticipo para iniciar. El resto al entregar el proyecto.",
  };
}
export function dateLabel(value: string, time = false, year = false): string {
  return new Intl.DateTimeFormat("es-MX", {
    timeZone: BUSINESS_TIME_ZONE,
    day: "numeric",
    month: "short",
    ...(year ? { year: "numeric" as const } : {}),
    ...(time ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(new Date(value.includes("T") ? value : `${value}T12:00:00Z`));
}
