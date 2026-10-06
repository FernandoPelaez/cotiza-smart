import { test } from "node:test";
import assert from "node:assert/strict";
import {
  TEMPLATES,
  TEMPLATE_IDS,
  filterTemplates,
  templateCount,
} from "../lib/domain/templates";
import { DOCUMENT_FONTS, FONT_IDS } from "../lib/domain/design";
import { quoteSchema } from "../lib/schemas/quote";
import { quoteRecordSchema } from "../lib/schemas/workspace";
import { SAMPLE_QUOTE, demoWorkspace } from "../lib/demo/seed";
import {
  saveDemoQuote,
  duplicateDemoQuote,
  shareDemoQuote,
  respondDemoQuote,
} from "../lib/demo/operations";
import { readFileSync, existsSync } from "node:fs";
import { filterQuotes } from "../lib/domain/quote-list";
import { authDestination } from "../lib/domain/navigation";

test("búsqueda por cliente, título y folio combina estado y tolera acentos", () => {
  const quotes = [
    {
      ...SAMPLE_QUOTE,
      id: "one",
      title: "Identidad gráfica",
      customer: { ...SAMPLE_QUOTE.customer, name: "Café Aurora" },
      status: "accepted" as const,
    },
    {
      ...SAMPLE_QUOTE,
      id: "two",
      status: "sent" as const,
      valid_until: "2026-01-01",
    },
  ];
  const now = new Date("2026-10-04T12:00:00Z");
  assert.equal(filterQuotes(quotes, "all", "  cafe  ", now)[0].id, "one");
  assert.equal(filterQuotes(quotes, "accepted", "grafica", now).length, 1);
  assert.equal(filterQuotes(quotes, "rejected", "cafe", now).length, 0);
  assert.equal(
    filterQuotes(quotes, "expired", SAMPLE_QUOTE.number, now)[0].id,
    "two",
  );
});

test("los 36 destinos del catálogo sobreviven al retorno de autenticación", () => {
  for (const { id } of TEMPLATES) {
    const destination = `/dashboard/nueva?template=${id}`;
    assert.equal(authDestination(destination), destination);
  }
});

test("36 IDs únicos, 12 diseños por categoría y 36 perfiles estructurales distintos", () => {
  assert.equal(TEMPLATES.length, 36);
  assert.equal(TEMPLATE_IDS.length, 36);
  assert.equal(new Set(TEMPLATE_IDS).size, 36);
  for (const plan of ["free", "pro", "premium"] as const) {
    assert.equal(templateCount(plan), 12);
    assert.ok(filterTemplates(plan).every((t) => t.plan === plan));
  }
  assert.equal(filterTemplates("all").length, 36);
  assert.equal(
    new Set(TEMPLATES.map((t) => JSON.stringify(t.layout))).size,
    36,
  );
  for (const template of TEMPLATES) {
    assert.ok(
      quoteSchema.safeParse({ ...SAMPLE_QUOTE, template_id: template.id })
        .success,
    );
  }
  assert.equal(
    quoteSchema.safeParse({ ...SAMPLE_QUOTE, template_id: "unknown" }).success,
    false,
  );
});
test("todas las fuentes declaradas existen en regular y bold para web y PDF", () => {
  assert.equal(DOCUMENT_FONTS.length, 8);
  assert.equal(FONT_IDS.length, 8);
  const css = readFileSync("app/globals.css", "utf8");
  for (const font of DOCUMENT_FONTS) {
    assert.ok(existsSync(`public/fonts/${font.regular}`));
    assert.ok(existsSync(`public/fonts/${font.bold}`));
    assert.ok(css.includes(font.regular));
    assert.ok(css.includes(font.bold));
  }
});
test("nuevas entradas rechazan descuento y lectura histórica conserva importes", () => {
  const historical = {
    ...SAMPLE_QUOTE,
    tax_rate: 8,
    items: SAMPLE_QUOTE.items.map((i) => ({ ...i, discount: 10 })),
  };
  assert.equal(quoteSchema.safeParse(historical).success, false);
  assert.equal(quoteRecordSchema.parse(historical).items[0].discount, 10);
  const valid = {
    ...SAMPLE_QUOTE,
    items: SAMPLE_QUOTE.items.map((i) => ({ ...i, discount: 0 })),
  };
  assert.equal(quoteSchema.safeParse(valid).success, true);
});
test("demo admite todas las plantillas en Free y el histórico se duplica con reglas actuales", () => {
  for (const template of TEMPLATES) {
    const base = {
      ...demoWorkspace(),
      creations_used: 0,
      subscription: {
        plan: "free" as const,
        status: "free",
        current_period_end: null,
        cancel_at_period_end: false,
      },
    };
    const { quote } = saveDemoQuote(base, {
      ...SAMPLE_QUOTE,
      template_id: template.id,
    });
    assert.equal(quote.template_id, template.id);
  }
  const historical = {
    ...SAMPLE_QUOTE,
    tax_rate: 0,
    items: SAMPLE_QUOTE.items.map((i) => ({ ...i, discount: 12 })),
  };
  const copy = duplicateDemoQuote(demoWorkspace(), historical);
  assert.equal(copy.quote.tax_rate, 16);
  assert.ok(copy.quote.items.every((i) => i.discount === 0));
  assert.equal(historical.tax_rate, 0);
  assert.equal(historical.items[0].discount, 12);
});
test("demo: rechazar registra estado y notificación únicos sin cambiar a aceptada", () => {
  const created = saveDemoQuote(demoWorkspace(), {
    ...SAMPLE_QUOTE,
    valid_until: "2099-12-31",
  });
  const shared = shareDemoQuote(created.workspace, created.quote.id);
  const next = respondDemoQuote(
    shared.workspace,
    shared.quote.public_token!,
    "rejected",
  );
  assert.equal(
    next.quotes.find((q) => q.id === created.quote.id)?.status,
    "rejected",
  );
  assert.equal(next.notifications[0].kind, "rejected");
  assert.equal(
    respondDemoQuote(next, shared.quote.public_token!, "accepted"),
    next,
  );
});
