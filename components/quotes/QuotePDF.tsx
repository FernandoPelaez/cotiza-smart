import { pdfLayout } from "@/lib/pdf/layout";
import { Document, Page } from "@react-pdf/renderer";
import type { Quote, Business } from "@/types/domain";
import { pdfStyles as s } from "@/lib/pdf/styles";
import { documentFont } from "@/lib/domain/design";
import { PdfHeader } from "./pdf/PdfHeader";
import { PdfItems } from "./pdf/PdfItems";
import { PdfTotals } from "./pdf/PdfTotals";
import { PdfFooter } from "./pdf/PdfFooter";
import { PdfAppendix } from "./pdf/PdfAppendix";
export { registerPdfFonts } from "@/lib/pdf/fonts";

export function QuotePDF({
  quote,
  business,
}: {
  quote: Quote;
  business: Business;
}) {
  const layout = pdfLayout(quote);
  const appendixNotes = quote.design.show_notes && quote.notes.length > 600;
  const appendixTerms = quote.design.show_terms && quote.terms.length > 1200;
  // Los textos extensos van a un anexo paginado: nunca dejamos su rótulo aislado junto a los totales.
  const mainQuote = {
    ...quote,
    design: {
      ...quote.design,
      show_notes: quote.design.show_notes && !appendixNotes,
      show_terms: quote.design.show_terms && !appendixTerms,
    },
  };
  return (
    <Document
      title={`${quote.number} · ${quote.title}`}
      author={business.name}
      subject="Cotización"
    >
      <Page
        size="A4"
        style={[
          s.page,
          { fontFamily: documentFont(quote.design.font).family },
          layout.page,
        ]}
      >
        <PdfHeader quote={quote} business={business} />
        <PdfItems quote={quote} />
        <PdfTotals quote={mainQuote} />
        <PdfFooter business={business} />
      </Page>
      {(appendixNotes || appendixTerms) && (
        <PdfAppendix
          quote={quote}
          business={business}
          notes={appendixNotes}
          terms={appendixTerms}
        />
      )}
    </Document>
  );
}
