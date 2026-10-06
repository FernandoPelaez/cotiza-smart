import { DEFAULT_DESIGN } from "@/lib/domain/config";
import type { Business, Quote, Workspace } from "@/types/domain";
export const SAMPLE_BUSINESS: Business = {
  id: "demo-business",
  name: "Estudio Norte",
  email: "hola@example.com",
  phone: "",
  address: "Los Mochis, Sinaloa",
  website: "",
  rfc: "",
  logo_url: "",
  activity: "both",
};
export const SAMPLE_QUOTE: Quote = {
  id: "demo-quote-editorial",
  business_id: "demo-business",
  number: "CS-2026-0042",
  title: "Identidad para un nuevo comienzo",
  status: "draft",
  customer: {
    id: "demo-client-1",
    name: "María Torres",
    email: "maria@example.com",
    phone: "",
    address: "Los Mochis, Sinaloa",
    rfc: "",
  },
  items: [
    {
      id: "sample-item-1",
      description: "Diseño de identidad visual",
      kind: "service",
      quantity: 1,
      unit: "proyecto",
      unit_price: 4800,
      discount: 0,
    },
    {
      id: "sample-item-2",
      description: "Guía de uso de marca",
      kind: "service",
      quantity: 1,
      unit: "documento",
      unit_price: 1500,
      discount: 0,
    },
    {
      id: "sample-item-3",
      description: "Tarjetas de presentación",
      kind: "product",
      quantity: 100,
      unit: "pieza",
      unit_price: 5,
      discount: 0,
    },
  ],
  template_id: "editorial",
  design: { ...DEFAULT_DESIGN, color: "#103d39", font: "serif" },
  tax_rate: 16,
  valid_until: "2026-10-25",
  notes: "Una identidad que conecta tu negocio con las personas correctas.",
  terms:
    "50% de anticipo. Entrega en 10 días hábiles después de aprobar el brief.",
  created_at: "2026-10-02T17:00:00Z",
  updated_at: "2026-10-02T17:00:00Z",
  sent_at: null,
  responded_at: null,
  public_token: null,
  revision: 1,
  business_snapshot: null,
};
export function demoWorkspace(): Workspace {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const quotes: Quote[] = [
    {
      ...structuredClone(SAMPLE_QUOTE),
      template_id: "essential",
      design: { ...DEFAULT_DESIGN },
      title: "Identidad visual · Café Aurora",
      customer: { ...SAMPLE_QUOTE.customer, name: "Café Aurora" },
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      valid_until: new Date(now.getTime() + 15 * 86400000)
        .toISOString()
        .slice(0, 10),
    },
    {
      ...structuredClone(SAMPLE_QUOTE),
      id: "demo-quote-2",
      number: "CS-2026-0041",
      title: "Sitio web · Casa Oliva",
      template_id: "studio",
      design: { ...DEFAULT_DESIGN },
      status: "viewed",
      customer: {
        ...SAMPLE_QUOTE.customer,
        id: "demo-client-2",
        name: "Casa Oliva",
        email: "oliva@example.com",
      },
      created_at: yesterday.toISOString(),
      updated_at: yesterday.toISOString(),
      sent_at: yesterday.toISOString(),
      public_token: "demo-example-casa-oliva",
      business_snapshot: { ...SAMPLE_BUSINESS },
      valid_until: new Date(now.getTime() + 10 * 86400000)
        .toISOString()
        .slice(0, 10),
    },
    {
      ...structuredClone(SAMPLE_QUOTE),
      id: "demo-quote-3",
      number: "CS-2026-0040",
      title: "Papelería · Taller Punto",
      template_id: "editorial",
      status: "accepted",
      customer: {
        ...SAMPLE_QUOTE.customer,
        id: "demo-client-3",
        name: "Taller Punto",
        email: "punto@example.com",
      },
      created_at: yesterday.toISOString(),
      updated_at: yesterday.toISOString(),
      responded_at: yesterday.toISOString(),
      sent_at: yesterday.toISOString(),
      public_token: "demo-example-taller-punto",
      business_snapshot: { ...SAMPLE_BUSINESS },
      valid_until: new Date(now.getTime() + 7 * 86400000)
        .toISOString()
        .slice(0, 10),
    },
  ];
  return {
    business: { ...SAMPLE_BUSINESS },
    quotes,
    customers: quotes.map((q) => q.customer),
    notifications: [],
    events: [
      {
        id: "demo-event-1",
        quote_id: quotes[0].id,
        quote_number: quotes[0].number,
        title: quotes[0].title,
        customer_name: quotes[0].customer.name,
        kind: "created",
        created_at: now.toISOString(),
      },
      {
        id: "demo-event-2",
        quote_id: quotes[1].id,
        quote_number: quotes[1].number,
        title: quotes[1].title,
        customer_name: quotes[1].customer.name,
        kind: "viewed",
        created_at: yesterday.toISOString(),
      },
      {
        id: "demo-event-3",
        quote_id: quotes[2].id,
        quote_number: quotes[2].number,
        title: quotes[2].title,
        customer_name: quotes[2].customer.name,
        kind: "accepted",
        created_at: yesterday.toISOString(),
      },
    ],
    subscription: {
      plan: "premium",
      status: "active",
      current_period_end: new Date(now.getTime() + 30 * 86400000).toISOString(),
      cancel_at_period_end: false,
    },
    creations_used: 3,
    user: { id: "demo-user", name: "Alex", email: "alex@example.com" },
    mode: "demo",
  };
}
