import "server-only";
import { z } from "zod";
import { adminSupabase } from "@/lib/supabase/server";
import { quoteRecordSchema } from "@/lib/schemas/workspace";
import { businessSchema } from "@/lib/schemas/quote";
import { ServiceError } from "./http";
export const publicTokenSchema = z.string().regex(/^[0-9a-f]{64}$/);
export async function getPublicQuote(token: string) {
  if (!publicTokenSchema.safeParse(token).success)
    throw new ServiceError("El enlace no está disponible.", 404, "NOT_FOUND");
  const { data, error } = await adminSupabase().rpc("cs_public_quote", {
    p_token: token,
  });
  if (error)
    throw new ServiceError("El enlace no está disponible.", 404, "NOT_FOUND");
  return z
    .object({ quote: quoteRecordSchema, business: businessSchema })
    .parse(data);
}
export async function recordView(token: string) {
  publicTokenSchema.parse(token);
  const { error } = await adminSupabase().rpc("cs_record_view", {
    p_token: token,
  });
  if (error) throw new ServiceError("El enlace no está disponible.", 404);
}
export async function respondPublic(
  token: string,
  action: "accepted" | "rejected",
) {
  publicTokenSchema.parse(token);
  const { data, error } = await adminSupabase().rpc("cs_respond_public", {
    p_token: token,
    p_action: action,
  });
  if (error)
    throw new ServiceError(
      error.message.includes("NOT_FOUND")
        ? "El enlace no está disponible."
        : "Esta cotización ya recibió una respuesta o terminó su vigencia.",
      error.message.includes("NOT_FOUND") ? 404 : 409,
      "QUOTE_LOCKED",
    );
  return quoteRecordSchema.parse(data);
}
