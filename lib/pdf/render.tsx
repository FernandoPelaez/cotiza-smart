import { pdf } from "@react-pdf/renderer";
import { QuotePDF, registerPdfFonts } from "@/components/quotes/QuotePDF";
import type { Business, Quote } from "@/types/domain";

/** Este adaptador se importa solo al descargar; el renderer no entra en la carga inicial. */
export async function renderQuotePdf(
  quote: Quote,
  business: Business,
  fontBase: string,
) {
  registerPdfFonts(fontBase);
  return pdf(<QuotePDF quote={quote} business={business} />).toBlob();
}
