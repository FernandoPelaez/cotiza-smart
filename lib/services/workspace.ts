import "server-only";
import { authenticatedClient } from "./auth";
import { ServiceError } from "./http";
import { workspaceSchema, quoteRecordSchema } from "@/lib/schemas/workspace";
import { businessSchema, quoteSchema } from "@/lib/schemas/quote";
import type { Business, QuoteInput } from "@/types/domain";
function dbError(error: { message: string; code?: string }): never {
  const codes: Record<string, [string, number]> = {
    FREE_LIMIT: ["Ya utilizaste tus 3 cotizaciones gratuitas.", 403],
    TEMPLATE_LOCKED: ["Esta plantilla requiere actualizar tu plan.", 403],
    QUOTE_LOCKED: [
      "Una cotización compartida conserva su contenido. Duplica la propuesta para crear una nueva versión.",
      409,
    ],
    CONFLICT: [
      "La cotización cambió en otra sesión. Recarga para obtener la última versión.",
      409,
    ],
    NOT_FOUND: ["No encontramos la cotización.", 404],
  };
  for (const [key, [message, status]] of Object.entries(codes))
    if (error.message.includes(key))
      throw new ServiceError(message, status, key);
  throw new ServiceError(
    "No se pudo guardar la información. Revisa tu conexión.",
    500,
    "DATABASE_ERROR",
  );
}
export async function getWorkspace() {
  const { client, user } = await authenticatedClient();
  const [{ data, error }, inbox] = await Promise.all([
    client.rpc("cs_workspace"),
    client.rpc("cs_notifications"),
  ]);
  if (inbox.error) dbError(inbox.error);
  if (error) dbError(error);
  return workspaceSchema.parse({
    ...(typeof data === "object" && data ? data : {}),
    user: {
      id: user.id,
      name:
        typeof user.user_metadata.full_name === "string"
          ? user.user_metadata.full_name
          : (user.email?.split("@")[0] ?? ""),
      email: user.email ?? "",
    },
    mode: "live",
    notifications: inbox.data,
  });
}
export async function saveBusiness(input: Business) {
  const value = businessSchema.parse(input);
  const { client, user } = await authenticatedClient();
  const logoPrefix = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/business-logos/${user.id}/`;
  if (value.logo_url && !value.logo_url.startsWith(logoPrefix))
    throw new ServiceError(
      "Sube el logo desde la configuración de tu negocio.",
      422,
      "VALIDATION_ERROR",
    );
  const { data, error } = await client.rpc("cs_save_business", {
    p_data: value,
  });
  if (error) dbError(error);
  return businessSchema.parse(data);
}
export async function saveQuote(
  input: QuoteInput,
  id?: string,
  revision?: number,
  requestId?: string,
) {
  const value = quoteSchema.parse(input);
  const { client } = await authenticatedClient();
  const { data, error } = await client.rpc("cs_save_quote", {
    p_data: value,
    p_quote_id: id ?? null,
    p_revision: revision ?? null,
    p_request_id: requestId ?? crypto.randomUUID(),
  });
  if (error) dbError(error);
  return quoteRecordSchema.parse(data);
}
export async function deleteQuote(id: string) {
  const { client } = await authenticatedClient();
  const { error } = await client.rpc("cs_delete_quote", { p_quote_id: id });
  if (error) dbError(error);
}
export async function shareQuote(id: string) {
  const { client } = await authenticatedClient();
  const { data, error } = await client.rpc("cs_share_quote", {
    p_quote_id: id,
  });
  if (error) dbError(error);
  return quoteRecordSchema.parse(data);
}
export async function duplicateQuote(id: string, requestId: string) {
  const { client } = await authenticatedClient();
  const { data, error } = await client.rpc("cs_duplicate_quote", {
    p_quote_id: id,
    p_request_id: requestId,
  });
  if (error) dbError(error);
  return quoteRecordSchema.parse(data);
}
