import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { renderToBuffer } from "@react-pdf/renderer";
import { QuotePDF, registerPdfFonts } from "../components/quotes/QuotePDF";
import { TEMPLATES } from "../lib/domain/templates";
import { SAMPLE_QUOTE, SAMPLE_BUSINESS } from "../lib/demo/seed";
registerPdfFonts(resolve("public"));
await mkdir("examples/pdf", { recursive: true });
const business = {
  ...SAMPLE_BUSINESS,
  logo_url: resolve("public/brand/logo.png"),
};
for (const template of TEMPLATES) {
  const quote = {
    ...SAMPLE_QUOTE,
    template_id: template.id,
    design: {
      ...SAMPLE_QUOTE.design,
      color: template.defaultColor,
      font: template.defaultFont,
    },
  };
  await writeFile(
    `examples/pdf/${template.id}.pdf`,
    await renderToBuffer(<QuotePDF quote={quote} business={business} />),
  );
}
const quote = {
  ...SAMPLE_QUOTE,
  template_id: "studio" as const,
  design: { ...SAMPLE_QUOTE.design, font: "sans" as const, color: "#06466f" },
  title: "Propuesta con 100 conceptos, cantidades fraccionarias e IVA 16%",
  customer: {
    ...SAMPLE_QUOTE.customer,
    name: "Nombre comercial del cliente de ejemplo ".repeat(4),
  },
  notes: "Nota de alcance y entrega para esta propuesta de prueba. ".repeat(30),
  terms:
    "Condiciones del servicio, forma de pago y vigencia del proyecto. ".repeat(
      40,
    ),
  items: Array.from({ length: 100 }, (_, i) => ({
    ...SAMPLE_QUOTE.items[i % 3],
    id: `row-${i}`,
    quantity: 1.575,
    discount: 0,
    description: `Concepto ${i + 1}: ${SAMPLE_QUOTE.items[i % 3].description}. Incluye especificaciones, materiales y consideraciones comerciales para la entrega del proyecto.`,
  })),
};
await writeFile(
  "examples/pdf/multipagina.pdf",
  await renderToBuffer(
    <QuotePDF
      quote={quote}
      business={{
        ...business,
        name: "EmpresaConNombreComercialExtenso".repeat(5),
      }}
    />,
  ),
);
process.stdout.write(
  `Generados ${TEMPLATES.length} ejemplos de plantilla y 1 documento multipágina.\n`,
);
