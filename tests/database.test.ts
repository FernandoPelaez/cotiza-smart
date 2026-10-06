import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { quoteRecordSchema } from "../lib/schemas/workspace";
import { TEMPLATES } from "../lib/domain/templates";
import { calculateTotals } from "../lib/domain/money";
import type { Quote, QuoteNotification } from "../types/domain";
const A = "00000000-0000-4000-8000-000000000001",
  B = "00000000-0000-4000-8000-000000000002";
const input = {
  title: "Propuesta profesional",
  customer: {
    id: "",
    name: "Cliente Prueba",
    email: "cliente@example.com",
    phone: "",
    address: "",
    rfc: "",
  },
  items: [
    {
      id: "item-1",
      description: "Producto con fracción",
      kind: "product",
      quantity: 0.575,
      unit: "kg",
      unit_price: 1,
      discount: 0,
    },
    {
      id: "item-2",
      description: "Servicio",
      kind: "service",
      quantity: 2,
      unit: "hora",
      unit_price: 99.99,
      discount: 0,
    },
  ],
  template_id: "essential",
  design: {
    color: "#06466f",
    font: "sans",
    show_logo: true,
    show_notes: true,
    show_terms: true,
  },
  tax_rate: 16,
  valid_until: "2099-12-31",
  notes: "Una nota",
  terms: "Condiciones",
};

test("contrato transaccional de PostgreSQL, aislamiento y suscripciones", async (t) => {
  const db = new PGlite();
  await db.exec(`create role anon; create role authenticated; create role service_role;
 create schema auth; create table auth.users(id uuid primary key);
 create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
 grant usage on schema auth to authenticated; grant execute on function auth.uid() to authenticated;
 create function public.preexisting_function() returns integer language sql as $$ select 42 $$;
 create schema storage; create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
 create table storage.objects(id uuid default gen_random_uuid(),bucket_id text,name text);alter table storage.objects enable row level security;
 create function storage.foldername(text) returns text[] language sql immutable as $$ select string_to_array($1,'/') $$;
 grant usage on schema storage to anon,authenticated;grant select,insert,delete on storage.objects to anon,authenticated;
 insert into auth.users values('${A}'),('${B}');`);
  const migrations = new URL("../supabase/migrations/", import.meta.url);
  for (const file of (await readdir(migrations))
    .filter((file) => file.endsWith(".sql"))
    .sort()) {
    await db.exec(await readFile(new URL(file, migrations), "utf8"));
  }
  async function identity(id: string, role = "authenticated") {
    await db.exec("reset role");
    await db.query("select set_config('request.jwt.claim.sub',$1,false)", [id]);
    await db.exec(`set role ${role}`);
  }
  async function call<T>(sql: string, args: unknown[] = []): Promise<T> {
    const result = await db.query<{ value: T }>(sql, args);
    return result.rows[0]?.value;
  }
  async function save(request = crypto.randomUUID(), data: unknown = input) {
    return quoteRecordSchema.parse(
      await call(
        "select public.cs_save_quote($1::jsonb,null,null,$2::uuid) as value",
        [JSON.stringify(data), request],
      ),
    );
  }
  await identity(A);
  const business = await call<{ id: string }>(
    "select public.cs_save_business($1::jsonb) as value",
    [
      JSON.stringify({
        name: "Negocio A",
        activity: "both",
        email: "a@example.com",
      }),
    ],
  );
  let first: Quote;
  let second: Quote;
  let third: Quote;
  let token: string;
  await t.test("no modifica privilegios de funciones existentes", async () =>
    assert.equal(
      await call("select public.preexisting_function() as value"),
      42,
    ),
  );
  await t.test(
    "crear, reintentar, editar y calcular exactamente como web/PDF",
    async () => {
      const request = crypto.randomUUID();
      first = await save(request);
      assert.equal((await save(request)).id, first.id);
      const actual = await call<{
        subtotal: number;
        discount: number;
        tax: number;
        total: number;
      }>(
        "select jsonb_build_object('subtotal',subtotal,'discount',discount,'tax',tax,'total',total) as value from public.cs_quotes where id=$1",
        [first.id],
      );
      const expected = calculateTotals(first.items);
      assert.deepEqual(actual, {
        subtotal: expected.subtotal,
        discount: expected.discount,
        tax: expected.tax,
        total: expected.total,
      });
      first = quoteRecordSchema.parse(
        await call(
          "select public.cs_save_quote($1::jsonb,$2::uuid,$3::integer,$4::uuid) as value",
          [
            JSON.stringify({
              ...input,
              title: "Propuesta revisada",
              customer: first.customer,
            }),
            first.id,
            first.revision,
            crypto.randomUUID(),
          ],
        ),
      );
      assert.equal(first.revision, 2);
      await assert.rejects(
        call(
          "select public.cs_save_quote($1::jsonb,$2::uuid,1,$3::uuid) as value",
          [JSON.stringify(input), first.id, crypto.randomUUID()],
        ),
        /CONFLICT/,
      );
    },
  );
  await t.test(
    "validación SQL no admite campos faltantes ni números como cadenas",
    async () => {
      const invalid = [
        { ...input, design: { color: "#06466f", font: "sans" } },
        { ...input, items: [{ ...input.items[0], unit_price: "NaN" }] },
        { ...input, items: [{ ...input.items[0], quantity: 0.0001 }] },
        { ...input, tax_rate: 0 },
        { ...input, items: [{ ...input.items[0], discount: 10 }] },
        { ...input, tax_rate: 8 },
        { ...input, tax_rate: 0.16 },
      ];
      for (const data of invalid)
        await assert.rejects(
          save(crypto.randomUUID(), data),
          /VALIDATION_ERROR/,
        );
    },
  );
  await t.test(
    "Free bloquea la cuarta creación incluso tras eliminar",
    async () => {
      second = await save();
      third = await save();
      await assert.rejects(save(), /FREE_LIMIT/);
      await call("select public.cs_delete_quote($1::uuid) as value", [
        third.id,
      ]);
      await assert.rejects(save(), /FREE_LIMIT/);
      assert.equal(
        await call("select creations_used as value from public.cs_businesses"),
        3,
      );
      await assert.rejects(
        db.query("update public.cs_businesses set creations_used=0"),
        /permission denied/,
      );
    },
  );
  await t.test(
    "otro usuario no puede leer, editar ni compartir recursos del propietario",
    async () => {
      await identity(B);
      await call("select public.cs_save_business($1::jsonb) as value", [
        JSON.stringify({ name: "Negocio B", activity: "services" }),
      ]);
      assert.equal(
        await call("select count(*)::integer as value from public.cs_quotes"),
        0,
      );
      await assert.rejects(
        call("select public.cs_share_quote($1::uuid) as value", [first.id]),
        /NOT_FOUND/,
      );
      await assert.rejects(
        save(crypto.randomUUID(), { ...input, customer: first.customer }),
        /NOT_FOUND/,
      );
      await identity(A);
    },
  );
  await t.test(
    "compartir congela una instantánea y reutiliza el token aleatorio",
    async () => {
      first = quoteRecordSchema.parse(
        await call("select public.cs_share_quote($1::uuid) as value", [
          first.id,
        ]),
      );
      token = first.public_token!;
      assert.match(token, /^[0-9a-f]{64}$/);
      assert.equal(
        (
          await call<Quote>("select public.cs_share_quote($1::uuid) as value", [
            first.id,
          ])
        ).public_token,
        token,
      );
      await assert.rejects(
        call(
          "select public.cs_save_quote($1::jsonb,$2::uuid,$3::integer,$4::uuid) as value",
          [
            JSON.stringify(input),
            first.id,
            first.revision,
            crypto.randomUUID(),
          ],
        ),
        /QUOTE_LOCKED/,
      );
      await assert.rejects(
        db.query("select * from public.cs_public_quote_access"),
        /permission denied/,
      );
      await assert.rejects(
        call("select public.cs_public_quote($1) as value", [token]),
        /permission denied/,
      );
    },
  );
  await t.test(
    "ver y aceptar son idempotentes; rechazar después falla",
    async () => {
      await identity("", "service_role");
      await call("select public.cs_record_view($1) as value", [token]);
      await call("select public.cs_record_view($1) as value", [token]);
      const accepted = await call<Quote>(
        "select public.cs_respond_public($1,'accepted') as value",
        [token],
      );
      assert.equal(accepted.status, "accepted");
      assert.ok(accepted.responded_at);
      await call("select public.cs_respond_public($1,'accepted') as value", [
        token,
      ]);
      await assert.rejects(
        call("select public.cs_respond_public($1,'rejected') as value", [
          token,
        ]),
        /QUOTE_LOCKED/,
      );
      await db.exec("reset role");
      assert.equal(
        await call(
          "select count(*)::integer as value from public.cs_quote_events where quote_id=$1 and kind='viewed'",
          [first.id],
        ),
        1,
      );
      assert.equal(
        await call(
          "select count(*)::integer as value from public.cs_quote_events where quote_id=$1 and kind='accepted'",
          [first.id],
        ),
        1,
      );
    },
  );
  await t.test("rechazo, vencimiento y revocación del enlace", async () => {
    await identity(A);
    const shared = await call<Quote>(
      "select public.cs_share_quote($1::uuid) as value",
      [second.id],
    );
    await identity("", "service_role");
    assert.equal(
      (
        await call<Quote>(
          "select public.cs_respond_public($1,'rejected') as value",
          [shared.public_token],
        )
      ).status,
      "rejected",
    );
    await identity(A);
    await call("select public.cs_delete_quote($1::uuid) as value", [second.id]);
    await identity("", "service_role");
    await assert.rejects(
      call("select public.cs_public_quote($1) as value", [shared.public_token]),
      /NOT_FOUND/,
    );
  });
  await t.test(
    "notificaciones atómicas, únicas, privadas y lectura idempotente",
    async () => {
      await identity(A);
      const notifications = await call<QuoteNotification[]>(
        "select public.cs_notifications() as value",
      );
      assert.equal(notifications.length, 2);
      assert.deepEqual(notifications.map((n) => n.kind).sort(), [
        "accepted",
        "rejected",
      ]);
      assert.ok(notifications.every((n) => n.read_at === null));
      const id = notifications[0].id;
      await assert.rejects(
        db.query("update public.cs_notifications set read_at=now()"),
        /permission denied/,
      );
      await identity(B);
      assert.deepEqual(
        await call("select public.cs_notifications() as value"),
        [],
      );
      await assert.rejects(
        call("select public.cs_mark_notifications_read($1::uuid) as value", [
          id,
        ]),
        /NOT_FOUND/,
      );
      await identity("", "anon");
      await assert.rejects(
        call("select public.cs_notifications() as value"),
        /permission denied/,
      );
      await identity(A);
      await call(
        "select public.cs_mark_notifications_read($1::uuid) as value",
        [id],
      );
      const once = await call<QuoteNotification[]>(
        "select public.cs_notifications() as value",
      );
      assert.equal(once.filter((n) => n.read_at).length, 1);
      await call(
        "select public.cs_mark_notifications_read($1::uuid) as value",
        [id],
      );
      assert.deepEqual(
        await call("select public.cs_notifications() as value"),
        once,
      );
      await call("select public.cs_mark_notifications_read() as value");
      assert.ok(
        (
          await call<QuoteNotification[]>(
            "select public.cs_notifications() as value",
          )
        ).every((n) => n.read_at),
      );
    },
  );
  await t.test(
    "catálogo SQL: 36 plantillas, 12 por plan y categorías sin bloqueo",
    async () => {
      const result = await db.query<{ plan: string; total: number }>(
        "select plan,count(*)::integer as total from public.cs_templates group by plan order by plan",
      );
      assert.deepEqual(result.rows, [
        { plan: "free", total: 12 },
        { plan: "premium", total: 12 },
        { plan: "pro", total: 12 },
      ]);
      await identity(B);
      for (const template_id of ["clarity", "atelier"]) {
        const quote = await save(crypto.randomUUID(), {
          ...input,
          template_id,
          tax_rate: 16,
          design: {
            ...input.design,
            font: template_id === "ledger" ? "mono" : "humanist",
          },
        });
        assert.equal(quote.tax_rate, 16);
        assert.equal(quote.template_id, template_id);
      }
      await assert.rejects(
        save(crypto.randomUUID(), {
          ...input,
          template_id: "invalid-template",
        }),
        /VALIDATION_ERROR/,
      );
      await identity(A);
    },
  );
  await t.test(
    "Stripe: permisos, eventos repetidos, desorden y vigencia",
    async () => {
      await identity(A);
      await assert.rejects(
        db.query("update public.cs_subscriptions set plan='premium'"),
        /permission denied/,
      );
      await identity("", "service_role");
      await call(
        "select public.cs_bind_stripe_customer($1::uuid,'cus_test') as value",
        [business.id],
      );
      const apply = (
        id: string,
        created: number,
        plan: string,
        status = "active",
        cancel = false,
      ) =>
        call<boolean>(
          "select public.cs_apply_subscription_event($1,'customer.subscription.updated',$2,$3::uuid,'cus_test','sub_test',$4,$5,'2099-12-31', $6) as value",
          [id, created, business.id, plan, status, cancel],
        );
      assert.equal(await apply("evt_1", 100, "pro"), true);
      assert.equal(await apply("evt_1", 100, "pro"), false);
      assert.equal(await apply("evt_2", 99, "premium"), false);
      await identity(A);
      assert.equal(
        (
          await call<{ subscription: { plan: string } }>(
            "select public.cs_workspace() as value",
          )
        ).subscription.plan,
        "pro",
      );
      for (const template_id of ["studio", "frame", "horizon"]) {
        const proQuote = await save(crypto.randomUUID(), {
          ...input,
          template_id,
        });
        assert.equal(proQuote.template_id, template_id);
      }
      assert.equal(
        await call("select creations_used as value from public.cs_businesses"),
        3,
      );
      for (const template of TEMPLATES) {
        const created = await save(crypto.randomUUID(), {
          ...input,
          template_id: template.id,
          design: { ...input.design, font: template.defaultFont },
        });
        assert.equal(created.template_id, template.id);
      }
      await identity("", "service_role");
      assert.equal(await apply("evt_3", 101, "premium", "active", true), true);
      await identity(A);
      const premium = await save(crypto.randomUUID(), {
        ...input,
        template_id: "editorial",
      });
      assert.equal(premium.template_id, "editorial");
      for (const template_id of ["signature", "atelier"]) {
        assert.equal(
          (await save(crypto.randomUUID(), { ...input, template_id }))
            .template_id,
          template_id,
        );
      }
      await db.exec("reset role");
      await db.query(
        "update public.cs_quotes set status='sent',valid_until='2000-01-01' where id=$1",
        [premium.id],
      );
      await identity(A);
      await call("select public.cs_workspace() as value");
      await call("select public.cs_workspace() as value");
      assert.equal(
        await call(
          "select count(*)::integer as value from public.cs_quote_events where quote_id=$1 and kind='expired'",
          [premium.id],
        ),
        1,
      );
      await identity("", "service_role");
      assert.equal(await apply("evt_4", 102, "premium", "past_due"), true);
      await identity(A);
      await assert.rejects(save(), /FREE_LIMIT/);
    },
  );
  await t.test(
    "duplicar verifica dueño, reutiliza request id y consume un solo crédito",
    async () => {
      await identity(B);
      await assert.rejects(
        call("select public.cs_duplicate_quote($1::uuid,$2::uuid) as value", [
          first.id,
          crypto.randomUUID(),
        ]),
        /NOT_FOUND/,
      );
      const source = await call<Quote>(
        "select public.cs_quote_json(q) as value from public.cs_quotes q limit 1",
      ).catch(() => null);
      // La función interna no se expone al cliente: se obtiene el documento por el workspace autorizado.
      assert.equal(source, null);
      const workspace = await call<{ quotes: Quote[] }>(
        "select public.cs_workspace() as value",
      );
      const request = crypto.randomUUID();
      const duplicated = await call<Quote>(
        "select public.cs_duplicate_quote($1::uuid,$2::uuid) as value",
        [workspace.quotes[0].id, request],
      );
      assert.equal(duplicated.status, "draft");
      assert.equal(duplicated.public_token, null);
      assert.notEqual(duplicated.id, workspace.quotes[0].id);
      assert.equal(
        (
          await call<Quote>(
            "select public.cs_duplicate_quote($1::uuid,$2::uuid) as value",
            [workspace.quotes[0].id, request],
          )
        ).id,
        duplicated.id,
      );
      assert.equal(
        await call("select creations_used as value from public.cs_businesses"),
        3,
      );
      assert.equal(
        await call(
          "select count(*)::integer as value from public.cs_quote_events where quote_id=$1 and kind='duplicated'",
          [duplicated.id],
        ),
        1,
      );
      await assert.rejects(
        call("select public.cs_duplicate_quote($1::uuid,$2::uuid) as value", [
          workspace.quotes[0].id,
          crypto.randomUUID(),
        ]),
        /FREE_LIMIT/,
      );
    },
  );
  await t.test(
    "Checkout serializa solicitudes y una reserva vieja no libera otra",
    async () => {
      await identity("", "service_role");
      const one = crypto.randomUUID(),
        two = crypto.randomUUID();
      assert.equal(
        await call(
          "select public.cs_claim_checkout($1::uuid,$2::uuid) as value",
          [business.id, one],
        ),
        true,
      );
      assert.equal(
        await call(
          "select public.cs_claim_checkout($1::uuid,$2::uuid) as value",
          [business.id, two],
        ),
        false,
      );
      await call(
        "select public.cs_release_checkout($1::uuid,$2::uuid) as value",
        [business.id, two],
      );
      assert.equal(
        await call(
          "select public.cs_claim_checkout($1::uuid,$2::uuid) as value",
          [business.id, two],
        ),
        false,
      );
      await call(
        "select public.cs_release_checkout($1::uuid,$2::uuid) as value",
        [business.id, one],
      );
      assert.equal(
        await call(
          "select public.cs_claim_checkout($1::uuid,$2::uuid) as value",
          [business.id, two],
        ),
        true,
      );
    },
  );
  await t.test("rate limit compartido y almacenamiento aislado", async () => {
    await identity("", "service_role");
    assert.equal(
      await call("select public.cs_rate_limit('hashed',2,60) as value"),
      true,
    );
    assert.equal(
      await call("select public.cs_rate_limit('hashed',2,60) as value"),
      true,
    );
    assert.equal(
      await call("select public.cs_rate_limit('hashed',2,60) as value"),
      false,
    );
    await identity(A);
    await db.query(
      "insert into storage.objects(bucket_id,name) values('business-logos',$1)",
      [`${A}/logo.png`],
    );
    await assert.rejects(
      db.query(
        "insert into storage.objects(bucket_id,name) values('business-logos',$1)",
        [`${B}/logo.png`],
      ),
      /row-level security/,
    );
    await identity(B);
    await db.query("delete from storage.objects where name=$1", [
      `${A}/logo.png`,
    ]);
    await db.exec("reset role");
    assert.equal(
      await call("select count(*)::integer as value from storage.objects"),
      1,
    );
  });
  await db.close();
});
