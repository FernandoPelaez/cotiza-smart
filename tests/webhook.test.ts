import { test } from "node:test";
import assert from "node:assert/strict";
import Stripe from "stripe";
const stripe = new Stripe("sk_test_offline_fixture");
const secret = "whsec_offline_fixture";
const body = JSON.stringify({
  id: "evt_offline",
  object: "event",
  type: "customer.subscription.updated",
  livemode: false,
  created: 1791000000,
  data: { object: { id: "sub_offline", object: "subscription" } },
});
test("Stripe SDK verifica el cuerpo crudo y rechaza falsificación, edición y replay viejo", async () => {
  const signature = stripe.webhooks.generateTestHeaderString({
    payload: body,
    secret,
  });
  assert.equal(
    (await stripe.webhooks.constructEventAsync(body, signature, secret)).id,
    "evt_offline",
  );
  await assert.rejects(
    stripe.webhooks.constructEventAsync(
      body.replace("sub_offline", "sub_forged"),
      signature,
      secret,
    ),
  );
  await assert.rejects(
    stripe.webhooks.constructEventAsync(body, signature, "whsec_other"),
  );
  const old = stripe.webhooks.generateTestHeaderString({
    payload: body,
    secret,
    timestamp: Math.floor(Date.now() / 1000) - 1000,
  });
  await assert.rejects(stripe.webhooks.constructEventAsync(body, old, secret));
});
