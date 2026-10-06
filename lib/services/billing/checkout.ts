import "server-only";
import { z } from "zod";
import type { Workspace } from "@/types/domain";
import { PLANS } from "@/lib/domain/config";
import { adminSupabase } from "@/lib/supabase/server";
import { getWorkspace } from "../workspace";
import { appOrigin, ServiceError } from "../http";
import { stripeClient } from "./client";
import { portal } from "./portal";
export async function checkout(request: Request, plan: "pro" | "premium") {
  const workspace = await getWorkspace();
  if (!workspace.business)
    throw new ServiceError(
      "Configura tu negocio antes de elegir un plan.",
      422,
    );
  const businessId = workspace.business.id;
  const lockId = crypto.randomUUID();
  const db = adminSupabase();
  const { data: acquired, error: lockError } = await db.rpc(
    "cs_claim_checkout",
    { p_business_id: businessId, p_lock_id: lockId },
  );
  if (lockError) throw new ServiceError("No se pudo preparar el pago.", 503);
  if (acquired !== true)
    throw new ServiceError(
      "Ya se está preparando un pago para tu cuenta. Espera un momento.",
      409,
    );
  try {
    return await checkoutForWorkspace(request, plan, {
      ...workspace,
      business: workspace.business,
    });
  } finally {
    const { error } = await db.rpc("cs_release_checkout", {
      p_business_id: businessId,
      p_lock_id: lockId,
    });
    if (error)
      console.error(
        "[Cotiza Smart] No se pudo liberar la reserva de Checkout.",
      );
  }
}
async function checkoutForWorkspace(
  request: Request,
  plan: "pro" | "premium",
  workspace: Workspace & { business: NonNullable<Workspace["business"]> },
) {
  const stripe = stripeClient();
  const price =
    plan === "pro"
      ? process.env.STRIPE_PRICE_PRO
      : process.env.STRIPE_PRICE_PREMIUM;
  if (!price)
    throw new ServiceError("Este plan no está disponible por el momento.", 503);
  const actual = await stripe.prices.retrieve(price);
  const expected = PLANS.find((p) => p.id === plan)!;
  if (
    !actual.active ||
    actual.currency !== "mxn" ||
    actual.unit_amount !== expected.price * 100 ||
    actual.recurring?.interval !== "month" ||
    actual.recurring.interval_count !== 1
  )
    throw new ServiceError("Este plan no está disponible por el momento.", 503);
  const db = adminSupabase();
  const { data, error } = await db
    .from("cs_subscriptions")
    .select("stripe_customer_id,stripe_subscription_id,status")
    .eq("business_id", workspace.business.id)
    .single();
  if (error)
    throw new ServiceError("No se pudo consultar la suscripción.", 500);
  const subscription = z
    .object({
      stripe_customer_id: z.string().nullable(),
      stripe_subscription_id: z.string().nullable(),
      status: z.string(),
    })
    .parse(data);
  if (
    subscription.stripe_subscription_id &&
    [
      "active",
      "trialing",
      "past_due",
      "incomplete",
      "unpaid",
      "paused",
    ].includes(subscription.status)
  )
    return portal(request);
  let customer = subscription.stripe_customer_id;
  if (!customer) {
    const created = await stripe.customers.create(
      {
        email: workspace.user.email,
        name: workspace.business.name,
        metadata: { business_id: workspace.business.id },
      },
      { idempotencyKey: `customer-${workspace.business.id}` },
    );
    customer = created.id;
    const { error: bindError } = await db.rpc("cs_bind_stripe_customer", {
      p_business_id: workspace.business.id,
      p_customer_id: customer,
    });
    if (bindError) throw new ServiceError("No se pudo preparar el pago.", 500);
  }
  const existing = await stripe.subscriptions.list({
    customer,
    status: "all",
    limit: 20,
  });
  if (
    existing.data.some((s) =>
      [
        "active",
        "trialing",
        "past_due",
        "incomplete",
        "unpaid",
        "paused",
      ].includes(s.status),
    )
  )
    return portal(request);
  const pending = await stripe.checkout.sessions.list({
    customer,
    status: "open",
    limit: 20,
  });
  const reusable = pending.data.find(
    (s) => s.metadata?.plan === plan && s.mode === "subscription",
  );
  if (reusable?.url) return { url: reusable.url };
  for (const session of pending.data.filter(
    (s) =>
      s.mode === "subscription" &&
      s.metadata?.business_id === workspace.business?.id,
  ))
    await stripe.checkout.sessions.expire(session.id);
  const origin = appOrigin(request);
  const session = await stripe.checkout.sessions.create(
    {
      mode: "subscription",
      customer,
      line_items: [{ price, quantity: 1 }],
      client_reference_id: workspace.business.id,
      metadata: { business_id: workspace.business.id, plan },
      subscription_data: {
        metadata: { business_id: workspace.business.id, plan },
      },
      success_url: `${origin}/dashboard/planes?checkout=completed`,
      cancel_url: `${origin}/dashboard/planes?checkout=canceled`,
      allow_promotion_codes: false,
    },
    {
      idempotencyKey: `checkout-${workspace.business.id}-${plan}-${Math.floor(Date.now() / 300000)}`,
    },
  );
  if (!session.url) throw new ServiceError("No se pudo abrir Checkout.", 500);
  return { url: session.url };
}
