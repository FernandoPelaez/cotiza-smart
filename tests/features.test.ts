import { test } from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import type { Workspace } from "../types/domain";
import { normalizeLogo } from "../lib/storage/logo";
import { normalizeDecimalInput, decimalValue } from "../lib/domain/numeric";
import { documentColors } from "../lib/domain/design";
import { quoteFilename } from "../lib/domain/files";
import { entryDestination, authDestination } from "../lib/domain/navigation";
import { isPublicSupabaseKey } from "../lib/supabase/key-validation";
import { quoteSchema } from "../lib/schemas/quote";
import { quoteRecordSchema, workspaceSchema } from "../lib/schemas/workspace";
import { demoWorkspace, SAMPLE_QUOTE } from "../lib/demo/seed";
import {
  saveDemoQuote,
  shareDemoQuote,
  respondDemoQuote,
} from "../lib/demo/operations";

test("campos decimales permiten borrar, coma y fracciones sin aceptar exponentes ni negativos", () => {
  assert.equal(normalizeDecimalInput("", 3), "");
  assert.ok(Number.isNaN(decimalValue("")));
  assert.equal(normalizeDecimalInput("000,575", 3), "0.575");
  assert.equal(decimalValue("0.575"), 0.575);
  for (const value of ["1e3", "-1", "12.0001", "uno", "1,2,3"])
    assert.equal(normalizeDecimalInput(value, 3), null);
  assert.equal(normalizeDecimalInput("99.99", 2), "99.99");
  assert.equal(normalizeDecimalInput("99.999", 2), null);
});
test("IVA nuevo solo admite 16; documentos históricos con otra tasa siguen legibles", () => {
  for (const tax_rate of [16])
    assert.ok(quoteSchema.safeParse({ ...SAMPLE_QUOTE, tax_rate }).success);
  for (const tax_rate of [0, 8, 0.16, -16, 100, NaN])
    assert.equal(
      quoteSchema.safeParse({ ...SAMPLE_QUOTE, tax_rate }).success,
      false,
    );
  assert.equal(
    quoteRecordSchema.parse({ ...SAMPLE_QUOTE, tax_rate: 8 }).tax_rate,
    8,
  );
});
test("retornos de autenticación conservan plantilla y rechazan destinos manipulados", () => {
  assert.equal(
    entryDestination({ template: "ledger" }),
    "/dashboard/nueva?template=ledger",
  );
  assert.equal(
    entryDestination({ template: "atelier" }),
    "/dashboard/nueva?template=atelier",
  );
  assert.equal(entryDestination({ plan: "pro" }), "/dashboard/planes");
  for (const next of [
    "//evil.test",
    "/dashboard/nueva?template=essential&next=//evil.test",
    "/dashboard/../../evil",
    "javascript:alert(1)",
  ])
    assert.equal(authDestination(next), "/dashboard");
});
test("configuración pública rechaza secret y JWT service_role", () => {
  const token = (role: string) =>
    `header.${Buffer.from(JSON.stringify({ role })).toString("base64url")}.signature`;
  assert.ok(isPublicSupabaseKey("sb_publishable_local_example_only"));
  assert.ok(isPublicSupabaseKey(token("anon")));
  for (const key of ["sb_secret_example", token("service_role"), "invalid", ""])
    assert.equal(isPublicSupabaseKey(key), false);
});
test("colores personalizados mantienen texto legible; PDF tiene nombre seguro", () => {
  assert.equal(documentColors("#ffffff").onAccent, "#000000");
  assert.equal(documentColors("#06466f").onAccent, "#ffffff");
  assert.equal(
    quoteFilename("CS-2026-0007", "Diseño / Áurea"),
    "CS-2026-0007-diseno-aurea.pdf",
  );
});
test("logos se decodifican, reducen y convierten a PNG; un falso PNG falla", async () => {
  const original = await sharp({
    create: { width: 1800, height: 600, channels: 4, background: "#06466f" },
  })
    .png()
    .toBuffer();
  const result = await normalizeLogo(original);
  const meta = await sharp(result).metadata();
  assert.equal(meta.format, "png");
  assert.equal(meta.width, 1024);
  assert.equal(meta.height, 341);
  await assert.rejects(
    normalizeLogo(Buffer.from("<svg><script>alert(1)</script></svg>")),
    /válido/,
  );
  await assert.rejects(
    normalizeLogo(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])),
    /válido/,
  );
  const huge = await sharp({
    create: { width: 2500, height: 2000, channels: 3, background: "#ffffff" },
  })
    .png()
    .toBuffer();
  await assert.rejects(normalizeLogo(huge), /megapíxeles/);
});
test("demo: creación, edición concurrente, sharing y respuesta producen una sola notificación", () => {
  let current = demoWorkspace();
  const created = saveDemoQuote(current, {
    ...SAMPLE_QUOTE,
    template_id: "essential",
    valid_until: "2099-12-31",
  });
  current = created.workspace;
  assert.equal(current.notifications.length, 0);
  const edited = saveDemoQuote(
    current,
    { ...created.quote, title: "Propuesta revisada" },
    created.quote,
  );
  assert.throws(
    () => saveDemoQuote(edited.workspace, created.quote, created.quote),
    /versión/,
  );
  const shared = shareDemoQuote(edited.workspace, created.quote.id);
  assert.match(shared.quote.public_token!, /^[a-f0-9]{64}$/);
  assert.equal(
    shareDemoQuote(shared.workspace, created.quote.id).quote.public_token,
    shared.quote.public_token,
  );
  const viewed = respondDemoQuote(
    shared.workspace,
    shared.quote.public_token!,
    "viewed",
  );
  assert.equal(viewed.notifications.length, 0);
  const accepted = respondDemoQuote(
    viewed,
    shared.quote.public_token!,
    "accepted",
  );
  assert.equal(accepted.notifications.length, 1);
  assert.equal(accepted.notifications[0].kind, "accepted");
  assert.equal(
    respondDemoQuote(accepted, shared.quote.public_token!, "accepted"),
    accepted,
  );
  assert.equal(
    respondDemoQuote(accepted, shared.quote.public_token!, "rejected"),
    accepted,
  );
  assert.deepEqual(
    workspaceSchema.parse({ ...current, notifications: undefined })
      .notifications,
    [],
  );
});
test("demo Free conserva consumo después de borrar y bloquea la cuarta creación", () => {
  let current: Workspace = {
    ...demoWorkspace(),
    quotes: [],
    events: [],
    creations_used: 0,
    subscription: {
      plan: "free" as const,
      status: "free",
      current_period_end: null,
      cancel_at_period_end: false,
    },
  };
  for (let i = 0; i < 3; i++)
    current = {
      ...saveDemoQuote(current, { ...SAMPLE_QUOTE, template_id: "essential" })
        .workspace,
      quotes: [],
      events: [],
    };
  assert.equal(current.creations_used, 3);
  assert.throws(
    () => saveDemoQuote(current, { ...SAMPLE_QUOTE, template_id: "essential" }),
    /3 cotizaciones/,
  );
});
