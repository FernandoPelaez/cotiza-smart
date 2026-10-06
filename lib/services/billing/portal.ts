import "server-only";
import { z } from "zod";
import { adminSupabase } from "@/lib/supabase/server";
import { getWorkspace } from "../workspace";
import { appOrigin, ServiceError } from "../http";
import { stripeClient } from "./client";
export async function portal(request: Request) {
  const workspace = await getWorkspace();
  if (!workspace.business) throw new ServiceError("Configura tu negocio.", 422);
  const { data, error } = await adminSupabase()
    .from("cs_subscriptions")
    .select("stripe_customer_id")
    .eq("business_id", workspace.business.id)
    .single();
  if (error)
    throw new ServiceError("No se pudo consultar la suscripción.", 500);
  const customer = z
    .object({ stripe_customer_id: z.string().nullable() })
    .parse(data).stripe_customer_id;
  if (!customer)
    throw new ServiceError(
      "Tu cuenta todavía no tiene una suscripción en Stripe.",
      422,
    );
  const result = await stripeClient().billingPortal.sessions.create({
    customer,
    return_url: `${appOrigin(request)}/dashboard/planes`,
  });
  return { url: result.url };
}
