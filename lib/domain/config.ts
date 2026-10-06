import type { Plan, QuoteDesign, QuoteStatus, EventKind } from "@/types/domain";
export const CURRENCY = "MXN";
export const DEFAULT_TAX_RATE = 16;
export const FREE_CREATION_LIMIT = 3;
export const PLAN_RANK: Record<Plan, number> = { free: 0, pro: 1, premium: 2 };
export const PLANS = [
  {
    id: "free" as const,
    name: "Free",
    price: 0,
    description: "Tu primera gran impresión.",
    templates: "Catálogo completo disponible",
    detail: "3 cotizaciones en total",
  },
  {
    id: "pro" as const,
    name: "Pro",
    price: 99,
    description: "Dale presencia a tu negocio.",
    templates: "Catálogo completo disponible",
    detail: "Cotizaciones durante tu suscripción",
  },
  {
    id: "premium" as const,
    name: "Premium",
    price: 199,
    description: "Una propuesta fuera de lo común.",
    templates: "Todas las plantillas",
    detail: "Cotizaciones durante tu suscripción",
  },
];
export const STATUS_LABELS: Record<QuoteStatus, string> = {
  draft: "Borrador",
  sent: "Enviada",
  viewed: "Vista",
  accepted: "Aceptada",
  rejected: "Rechazada",
  expired: "Vencida",
};
export const EVENT_LABELS: Record<EventKind, string> = {
  created: "Cotización creada",
  updated: "Cotización actualizada",
  sent: "Enlace compartido",
  viewed: "El cliente vio la cotización",
  accepted: "Cotización aceptada",
  rejected: "Cotización rechazada",
  expired: "Cotización vencida",
  duplicated: "Cotización duplicada",
};
export const DEFAULT_DESIGN: QuoteDesign = {
  color: "#06466f",
  font: "sans",
  show_notes: true,
  show_terms: true,
  show_logo: true,
};
