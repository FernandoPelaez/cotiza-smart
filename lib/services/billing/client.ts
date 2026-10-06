import "server-only";
import Stripe from "stripe";
import { ServiceError } from "../http";
export function stripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  const live = process.env.BILLING_MODE === "live";
  if (!key)
    throw new ServiceError(
      "Los pagos no están disponibles por el momento. Intenta más tarde.",
      503,
      "BILLING_NOT_CONFIGURED",
    );
  if (!live && !key.startsWith("sk_test_"))
    throw new ServiceError(
      "El entorno de desarrollo requiere una clave de pruebas de Stripe.",
      503,
    );
  if (
    live &&
    (process.env.NODE_ENV !== "production" || !key.startsWith("sk_live_"))
  )
    throw new ServiceError(
      "La configuración de pagos no corresponde al entorno.",
      503,
    );
  return new Stripe(key, { maxNetworkRetries: 1, timeout: 15000 });
}
