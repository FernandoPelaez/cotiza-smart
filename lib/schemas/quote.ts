import { z } from "zod";
import { TEMPLATE_IDS } from "@/lib/domain/templates";
import { FONT_IDS } from "@/lib/domain/design";
import { DEFAULT_TAX_RATE } from "@/lib/domain/config";
const text = (max: number) => z.string().trim().max(max);
const optionalEmail = z.union([
  z.literal(""),
  z.string().email("Revisa el correo electrónico.").max(254),
]);
export const customerSchema = z.object({
  id: z.string().max(100),
  name: z.string().trim().min(2, "Escribe el nombre del cliente.").max(160),
  email: optionalEmail,
  phone: text(30),
  address: text(400),
  rfc: text(20),
});
export const historicalItemSchema = z.object({
  id: z.string().min(1).max(100),
  description: z.string().trim().min(1, "Describe cada concepto.").max(500),
  kind: z.enum(["product", "service"]),
  quantity: z
    .number()
    .finite()
    .positive("Usa una cantidad mayor a cero.")
    .max(100000)
    .multipleOf(0.001, "La cantidad admite hasta 3 decimales."),
  unit: text(30),
  unit_price: z
    .number()
    .finite()
    .min(0)
    .max(10000000)
    .multipleOf(0.01, "Usa hasta 2 decimales."),
  discount: z
    .number()
    .finite()
    .min(0)
    .max(100)
    .multipleOf(0.01, "Usa hasta 2 decimales."),
});
// El campo persiste solo como cero por compatibilidad con documentos anteriores.
export const itemSchema = historicalItemSchema.extend({
  discount: z.literal(0).default(0),
});
export const designSchema = z.object({
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  font: z.enum(FONT_IDS),
  show_notes: z.boolean(),
  show_terms: z.boolean(),
  show_logo: z.boolean(),
});
export const quoteSchema = z.object({
  title: z.string().trim().min(3, "Dale un nombre a tu cotización.").max(160),
  customer: customerSchema,
  items: z
    .array(itemSchema)
    .min(1)
    .max(100)
    .refine(
      (items) =>
        items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0) <=
        1000000000000,
      "El importe supera el rango permitido.",
    ),
  template_id: z.enum(TEMPLATE_IDS),
  design: designSchema,
  tax_rate: z.literal(DEFAULT_TAX_RATE),
  valid_until: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine(
      (v) =>
        !Number.isNaN(Date.parse(v)) &&
        new Date(v).toISOString().slice(0, 10) === v,
      "Revisa la fecha.",
    ),
  notes: text(2000),
  terms: text(3000),
});
export const businessSchema = z.object({
  id: z.string().max(100),
  name: z.string().trim().min(2, "Escribe el nombre de tu negocio.").max(160),
  email: optionalEmail,
  phone: text(30),
  address: text(400),
  website: z.union([
    z.literal(""),
    z.string().url("Escribe una dirección web válida.").max(300),
  ]),
  rfc: text(20),
  logo_url: z.union([
    z.literal(""),
    z.string().url().max(1500),
    z
      .string()
      .regex(/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/)
      .max(420000),
  ]),
  activity: z.enum(["products", "services", "both"]),
});
