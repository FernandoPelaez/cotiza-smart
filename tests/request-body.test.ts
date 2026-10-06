import { test } from "node:test";
import assert from "node:assert/strict";
import {
  readRequestBytes,
  readRequestText,
} from "../lib/services/request-body";
import { ServiceError } from "../lib/services/errors";
const request = (body: BodyInit, headers?: HeadersInit) =>
  new Request("https://cotiza.test/api", { method: "POST", body, headers });
test("lector conserva exactamente el cuerpo UTF-8 utilizado por Stripe", async () => {
  const raw = ' {"name":"Cotización Áurea","lines":[1,2]}\n';
  assert.equal(await readRequestText(request(raw), 1000), raw);
});
test("lector corta payloads sin Content-Length y cuenta bytes, no caracteres", async () => {
  const over = (e: unknown) => e instanceof ServiceError && e.status === 413;
  await assert.rejects(readRequestBytes(request("á".repeat(100)), 199), over);
  await assert.rejects(
    readRequestBytes(request("small", { "content-length": "1001" }), 1000),
    over,
  );
  assert.equal(
    (await readRequestBytes(request("á".repeat(100)), 200)).length,
    200,
  );
});
