import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripeClient, syncSubscription } from "@/lib/services/billing";
import { errorResponse, ServiceError } from "@/lib/services/http";
import { readRequestText } from "@/lib/services/request-body";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    const signature = request.headers.get("stripe-signature");
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!signature || !secret)
      throw new ServiceError("Firma de webhook no disponible.", 400);
    const raw = await readRequestText(request, 1000000);
    let event: Stripe.Event;
    try {
      event = await stripeClient().webhooks.constructEventAsync(
        raw,
        signature,
        secret,
      );
    } catch {
      throw new ServiceError("Firma de webhook inválida.", 400);
    }
    if (event.livemode !== (process.env.BILLING_MODE === "live"))
      throw new ServiceError("El evento no pertenece a este entorno.", 400);
    let subscriptionId: string | null = null;
    if (event.data.object.object === "subscription") {
      subscriptionId = event.data.object.id;
    } else if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      const session = event.data.object;
      subscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : (session.subscription?.id ?? null);
    } else if (
      event.type === "invoice.paid" ||
      event.type === "invoice.payment_failed" ||
      event.type === "invoice.payment_action_required"
    ) {
      const invoice = event.data.object;
      const sub = invoice.parent?.subscription_details?.subscription;
      subscriptionId = typeof sub === "string" ? sub : (sub?.id ?? null);
    }
    if (subscriptionId) await syncSubscription(event, subscriptionId);
    return NextResponse.json({ received: true });
  } catch (e) {
    return errorResponse(e);
  }
}
