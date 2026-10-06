import { z } from "zod";
import {
  businessSchema,
  customerSchema,
  quoteSchema,
  historicalItemSchema,
} from "./quote";
export const quoteRecordSchema = quoteSchema.extend({
  // La consulta de documentos históricos conserva sus importes originales.
  items: z.array(historicalItemSchema).min(1).max(100),
  tax_rate: z.number().finite().min(0).max(100),
  id: z.string(),
  business_id: z.string(),
  number: z.string(),
  status: z.enum([
    "draft",
    "sent",
    "viewed",
    "accepted",
    "rejected",
    "expired",
  ]),
  created_at: z.string(),
  updated_at: z.string(),
  sent_at: z.string().nullable(),
  responded_at: z.string().nullable(),
  public_token: z.string().nullable(),
  revision: z.number().int(),
  business_snapshot: businessSchema.nullable(),
});
export const eventSchema = z.object({
  id: z.string(),
  quote_id: z.string(),
  quote_number: z.string(),
  title: z.string(),
  customer_name: z.string(),
  kind: z.enum([
    "created",
    "updated",
    "sent",
    "viewed",
    "accepted",
    "rejected",
    "expired",
    "duplicated",
  ]),
  created_at: z.string(),
});
export const subscriptionSchema = z.object({
  plan: z.enum(["free", "pro", "premium"]),
  status: z.string(),
  current_period_end: z.string().nullable(),
  cancel_at_period_end: z.boolean(),
});
export const notificationSchema = z.object({
  id: z.string(),
  event_id: z.string(),
  quote_id: z.string(),
  quote_number: z.string(),
  title: z.string(),
  customer_name: z.string(),
  kind: z.enum(["accepted", "rejected"]),
  created_at: z.string(),
  read_at: z.string().nullable(),
});
export const workspaceSchema = z.object({
  business: businessSchema.nullable(),
  quotes: z.array(quoteRecordSchema),
  customers: z.array(customerSchema),
  events: z.array(eventSchema),
  notifications: z.array(notificationSchema).default([]),
  subscription: subscriptionSchema,
  creations_used: z.number().int().nonnegative(),
  user: z.object({ id: z.string(), name: z.string(), email: z.string() }),
  mode: z.enum(["live", "demo"]),
});
