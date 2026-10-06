import { test } from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import { normalizeLogo } from "../lib/storage/logo";
import { resolve } from "node:path";
import { renderToBuffer } from "@react-pdf/renderer";
import { QuotePDF, registerPdfFonts } from "../components/quotes/QuotePDF";
import { SAMPLE_QUOTE, SAMPLE_BUSINESS } from "../lib/demo/seed";
import { TEMPLATES } from "../lib/domain/templates";
import { DOCUMENT_FONTS } from "../lib/domain/design";
registerPdfFonts(resolve("public"));
const business = {
  ...SAMPLE_BUSINESS,
  logo_url: resolve("public/brand/logo.png"),
};
test("las ocho fuentes locales generan texto PDF sin recurrir a fuentes externas", async () => {
  for (const font of DOCUMENT_FONTS) {
    const buffer = await renderToBuffer(
      <QuotePDF
        quote={{
          ...SAMPLE_QUOTE,
          design: { ...SAMPLE_QUOTE.design, font: font.id },
        }}
        business={business}
      />,
    );
    assert.equal(buffer.subarray(0, 4).toString(), "%PDF", font.id);
    assert.match(buffer.toString("latin1"), /\/FontFile2/, font.id);
  }
});
for (const template of TEMPLATES) {
  test(`PDF A4 completo de plantilla ${template.id}`, async () => {
    const buffer = await renderToBuffer(
      <QuotePDF
        quote={{
          ...SAMPLE_QUOTE,
          template_id: template.id,
          design: {
            ...SAMPLE_QUOTE.design,
            color: template.defaultColor,
            font: template.defaultFont,
          },
        }}
        business={business}
      />,
    );
    assert.equal(buffer.subarray(0, 4).toString(), "%PDF");
    assert.equal(
      (buffer.toString("latin1").match(/\/Type \/Page\b/g) ?? []).length,
      1,
    );
    assert.ok(buffer.length > 10000);
  });
}
test("PDF de cien conceptos con notas y condiciones extensas pagina sin errores", async () => {
  const quote = {
    ...SAMPLE_QUOTE,
    template_id: "studio" as const,
    customer: {
      ...SAMPLE_QUOTE.customer,
      name: "Nombre comercial de cliente ".repeat(5),
    },
    notes: "Nota extensa de impresión. ".repeat(60),
    terms: "Condiciones detalladas para el cliente. ".repeat(72),
    items: Array.from({ length: 100 }, (_, i) => ({
      ...SAMPLE_QUOTE.items[i % 3],
      id: `row-${i}`,
      description: `Concepto ${i + 1}: ${SAMPLE_QUOTE.items[i % 3].description}; incluye materiales y condiciones de entrega, alcance y consideraciones comerciales.`,
    })),
  };
  const buffer = await renderToBuffer(
    <QuotePDF
      quote={quote}
      business={{ ...business, name: "EmpresaConNombreSinEspacios".repeat(6) }}
    />,
  );
  assert.equal(buffer.subarray(0, 4).toString(), "%PDF");
  assert.ok(
    (buffer.toString("latin1").match(/\/Type \/Page\b/g) ?? []).length > 5,
  );
});

test("logo subido como WebP se normaliza a PNG y se incrusta en el PDF", async () => {
  const webp = await sharp({
    create: { width: 240, height: 120, channels: 4, background: "#14b8a6" },
  })
    .webp()
    .toBuffer();
  const png = await normalizeLogo(webp);
  const buffer = await renderToBuffer(
    <QuotePDF
      quote={SAMPLE_QUOTE}
      business={{
        ...business,
        logo_url: `data:image/png;base64,${png.toString("base64")}`,
      }}
    />,
  );
  assert.match(buffer.toString("latin1"), /\/Subtype \/Image/);
});
