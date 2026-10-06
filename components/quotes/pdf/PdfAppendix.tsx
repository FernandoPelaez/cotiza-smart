import { Page, View, Text } from "@react-pdf/renderer";
import type { Business, Quote } from "@/types/domain";
import { pdfStyles as s } from "@/lib/pdf/styles";
import { pdfLayout } from "@/lib/pdf/layout";
import { documentFont } from "@/lib/domain/design";
import { PdfFooter } from "./PdfFooter";

export function PdfAppendix({
  quote,
  business,
  notes,
  terms,
}: {
  quote: Quote;
  business: Business;
  notes: boolean;
  terms: boolean;
}) {
  const layout = pdfLayout(quote);
  return (
    <Page
      size="A4"
      style={[
        s.page,
        { fontFamily: documentFont(quote.design.font).family },
        layout.page,
      ]}
    >
      <View style={{ marginBottom: 24 }} fixed>
        <Text style={s.label}>DETALLES DE LA PROPUESTA · {quote.number}</Text>
      </View>
      {notes && (
        <View style={s.terms}>
          <Text style={s.label} minPresenceAhead={32}>
            UNA NOTA PARA TI
          </Text>
          <Text style={s.bodyCopy} orphans={3} widows={3}>
            {quote.notes}
          </Text>
        </View>
      )}
      {terms && (
        <View style={s.terms}>
          <Text style={s.label} minPresenceAhead={32}>
            CONDICIONES
          </Text>
          <Text style={s.bodyCopy} orphans={3} widows={3}>
            {quote.terms}
          </Text>
        </View>
      )}
      <PdfFooter business={business} />
    </Page>
  );
}
