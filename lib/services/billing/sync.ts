import "server-only";
import type Stripe from "stripe";
import { z } from "zod";
import { adminSupabase } from "@/lib/supabase/server";
import { ServiceError } from "../http";
import { stripeClient } from "./client";
/** Se vuelve a consultar Stripe: un evento retrasado no debe restaurar una suscripción que ya se canceló. */
export async function syncSubscription(
  event: Stripe.Event,
  subscriptionId: string,
) {
  const subscription =
    await stripeClient().subscriptions.retrieve(subscriptionId);
  const businessId = subscription.metadata.business_id;
  if (!businessId || !z.string().uuid().safeParse(businessId).success)
    throw new ServiceError("Suscripción sin negocio válido.", 422);
  const item = subscription.items.data[0];
  const priceId = item?.price.id;
  const plan =
    priceId === process.env.STRIPE_PRICE_PREMIUM
      ? "premium"
      : priceId === process.env.STRIPE_PRICE_PRO
        ? "pro"
        : null;
  if (!plan || subscription.items.data.length !== 1 || item.quantity !== 1)
    throw new ServiceError("Precio de suscripción desconocido.", 422);
  const periodEnd = item.current_period_end;
  const customer =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;
  const { error } = await adminSupabase().rpc("cs_apply_subscription_event", {
    p_event_id: event.id,
    p_kind: event.type,
    p_created: event.created,
    p_business_id: businessId,
    p_customer_id: customer,
    p_subscription_id: subscription.id,
    p_plan: plan,
    p_status: subscription.status,
    p_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
    p_cancel: subscription.cancel_at_period_end,
  });
  if (error)
    throw new ServiceError("No se pudo aplicar el evento de suscripción.", 500);
}
