import { test } from "node:test";
import assert from "node:assert/strict";
import { authDestination } from "../lib/domain/navigation";
import { businessDate, dateLabel } from "../lib/domain/quotes";
import {
  calculateTotals,
  calculateDocumentTotals,
  lineTotal,
  documentLineTotal,
} from "../lib/domain/money";
import {
  effectivePlan,
  canCreate,
  canUseTemplate,
  blankQuote,
} from "../lib/domain/quotes";
import { quoteSchema, businessSchema } from "../lib/schemas/quote";
import type { Subscription, QuoteItem } from "../types/domain";
const item: QuoteItem = {
  id: "1",
  description: "Diseño",
  kind: "service",
  quantity: 1,
  unit: "proyecto",
  unit_price: 6800,
  discount: 0,
};
test("nuevos importes y lectura histórica se calculan por centavos", () => {
  assert.deepEqual(calculateTotals([item]), {
    subtotal: 6800,
    discount: 0,
    taxable: 6800,
    tax: 1088,
    total: 7888,
  });
  assert.deepEqual(
    calculateDocumentTotals(
      [{ ...item, quantity: 2, unit_price: 99.99, discount: 10 }],
      16,
    ),
    {
      subtotal: 199.98,
      discount: 20,
      taxable: 179.98,
      tax: 28.8,
      total: 208.78,
    },
  );
});
test("mitades decimales coinciden con round(numeric) de PostgreSQL", () => {
  assert.equal(lineTotal({ ...item, quantity: 0.575, unit_price: 1 }), 0.58);
  assert.equal(
    calculateDocumentTotals(
      [{ ...item, unit_price: 0.01, quantity: 1, discount: 50 }],
      0,
    ).total,
    0,
  );
  assert.equal(
    calculateDocumentTotals([{ ...item, unit_price: 0.05 }], 10).tax,
    0.01,
  );
});
test("Free permite exactamente tres creaciones; los pagos requieren vigencia y estado", () => {
  const now = new Date("2026-10-03T12:00:00Z");
  const free: Subscription = {
    plan: "free",
    status: "free",
    current_period_end: null,
    cancel_at_period_end: false,
  };
  assert.equal(canCreate(free, 2, now), true);
  assert.equal(canCreate(free, 3, now), false);
  const pro: Subscription = {
    plan: "pro",
    status: "active",
    current_period_end: "2026-11-03T12:00:00Z",
    cancel_at_period_end: true,
  };
  assert.equal(effectivePlan(pro, now), "pro");
  assert.equal(canCreate(pro, 100, now), true);
  for (const status of ["past_due", "canceled", "unpaid", "incomplete"])
    assert.equal(effectivePlan({ ...pro, status }, now), "free");
  assert.equal(
    effectivePlan({ ...pro, current_period_end: "2026-10-02T00:00:00Z" }, now),
    "free",
  );
  assert.equal(canUseTemplate("free", "pro"), true);
  assert.equal(canUseTemplate("pro", "premium"), true);
  assert.equal(canUseTemplate("premium", "free"), true);
});
test("schemas rechazan precisión inválida, fechas imposibles y estilos incompletos", () => {
  const valid = {
    ...blankQuote(),
    title: "Propuesta de prueba",
    customer: {
      id: "",
      name: "Cliente",
      email: "",
      phone: "",
      address: "",
      rfc: "",
    },
    items: [item],
  };
  assert.equal(quoteSchema.safeParse(valid).success, true);
  for (const change of [
    { items: [{ ...item, quantity: 0.0001 }] },
    { items: [{ ...item, unit_price: 1.005 }] },
    { valid_until: "2026-02-30" },
    { tax_rate: NaN },
    { design: { color: "#fff" } },
  ])
    assert.equal(quoteSchema.safeParse({ ...valid, ...change }).success, false);
  assert.equal(
    businessSchema.safeParse({
      id: "",
      name: "Empresa",
      email: "",
      phone: "",
      address: "",
      website: "",
      rfc: "",
      logo_url: "data:image/png;base64,YWJj",
      activity: "both",
    }).success,
    true,
  );
});

test("las fechas usan México y los retornos OAuth impiden redirecciones externas", () => {
  assert.equal(businessDate(new Date("2026-10-03T04:00:00Z")), "2026-10-02");
  assert.equal(dateLabel("2026-10-03T04:00:00Z"), "2 oct");
  assert.equal(authDestination("https://evil.example"), "/dashboard");
  assert.equal(authDestination("//evil.example"), "/dashboard");
  assert.equal(authDestination("/dashboard/planes"), "/dashboard/planes");
});

test("cálculo nuevo ignora descuentos y conserva subtotal + IVA 16", () => {
  const result = calculateTotals([
    { ...item, unit_price: 100, quantity: 2, discount: 25 },
  ]);
  assert.deepEqual(result, {
    subtotal: 200,
    discount: 0,
    taxable: 200,
    tax: 32,
    total: 232,
  });
  assert.equal(lineTotal({ ...item, unit_price: 100, discount: 50 }), 100);
  assert.equal(
    documentLineTotal({ ...item, unit_price: 100, discount: 50 }),
    50,
  );
});
