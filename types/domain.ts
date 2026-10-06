import type { TEMPLATE_IDS } from "@/lib/domain/template-ids";
import type { TemplateLayout } from "./template";
export type Plan = "free" | "pro" | "premium";
export type QuoteStatus =
  "draft" | "sent" | "viewed" | "accepted" | "rejected" | "expired";
export type EventKind =
  | "created"
  | "updated"
  | "sent"
  | "viewed"
  | "accepted"
  | "rejected"
  | "expired"
  | "duplicated";
export type TemplateId = (typeof TEMPLATE_IDS)[number];
export type DocumentFont =
  | "sans"
  | "serif"
  | "humanist"
  | "mono"
  | "lora"
  | "dm"
  | "plex"
  | "baskerville";
export interface Business {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  rfc: string;
  logo_url: string;
  activity: "products" | "services" | "both";
}
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  rfc: string;
}
export interface QuoteItem {
  id: string;
  description: string;
  kind: "product" | "service";
  quantity: number;
  unit: string;
  unit_price: number;
  discount: number;
}
export interface QuoteDesign {
  color: string;
  font: DocumentFont;
  show_notes: boolean;
  show_terms: boolean;
  show_logo: boolean;
}
export interface QuoteInput {
  title: string;
  customer: Customer;
  items: QuoteItem[];
  template_id: TemplateId;
  design: QuoteDesign;
  tax_rate: number;
  valid_until: string;
  notes: string;
  terms: string;
}
export interface Quote extends QuoteInput {
  id: string;
  business_id: string;
  number: string;
  status: QuoteStatus;
  created_at: string;
  updated_at: string;
  sent_at: string | null;
  responded_at: string | null;
  public_token: string | null;
  revision: number;
  business_snapshot: Business | null;
}
export interface QuoteEvent {
  id: string;
  quote_id: string;
  quote_number: string;
  title: string;
  customer_name: string;
  kind: EventKind;
  created_at: string;
}
export interface Subscription {
  plan: Plan;
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}
export interface Workspace {
  business: Business | null;
  quotes: Quote[];
  customers: Customer[];
  events: QuoteEvent[];
  notifications: QuoteNotification[];
  subscription: Subscription;
  creations_used: number;
  user: { id: string; name: string; email: string };
  mode: "live" | "demo";
}
export interface QuoteNotification {
  id: string;
  event_id: string;
  quote_id: string;
  quote_number: string;
  title: string;
  customer_name: string;
  kind: "accepted" | "rejected";
  created_at: string;
  read_at: string | null;
}
export interface QuoteTotals {
  subtotal: number;
  discount: number;
  taxable: number;
  tax: number;
  total: number;
}
export interface TemplateDefinition {
  id: TemplateId;
  name: string;
  plan: Plan;
  description: string;
  defaultColor: string;
  defaultFont: DocumentFont;
  layout: TemplateLayout;
}
