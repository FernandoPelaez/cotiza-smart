import "server-only";
import { adminSupabase } from "@/lib/supabase/server";
import { ServiceError } from "./http";
/** Límite compartido entre instancias. La IP se usa solo bajo el proxy de despliegue y se almacena como hash. */
export async function rateLimit(
  request: Request,
  scope: string,
  limit = 20,
  windowSeconds = 60,
  userId?: string,
) {
  const identity =
    userId ??
    (process.env.VERCEL === "1"
      ? request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim()
      : undefined) ??
    "anonymous";
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`${scope}:${identity}`),
  );
  const key = Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
  const { data, error } = await adminSupabase().rpc("cs_rate_limit", {
    p_key: key,
    p_limit: limit,
    p_window: windowSeconds,
  });
  if (error) throw new ServiceError("No se pudo validar la solicitud.", 503);
  if (data !== true)
    throw new ServiceError(
      "Espera un momento antes de volver a intentar.",
      429,
      "RATE_LIMIT",
    );
}
