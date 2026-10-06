import { pdfLayout } from "@/lib/pdf/layout";
import { View, Text } from "@react-pdf/renderer";
import type { Quote } from "@/types/domain";
import { pdfStyles as s } from "@/lib/pdf/styles";
import { calculateDocumentTotals, money } from "@/lib/domain/money";
export function PdfTotals({ quote }: { quote: Quote }) {
  const totals = calculateDocumentTotals(quote.items, quote.tax_rate);
  const layout = pdfLayout(quote);
  const longNotes = quote.notes.length > 600;
  return (
    <>
      <View style={[s.bottom, layout.bottom]} wrap={false}>
        <View style={[s.notes, layout.notes]}>
          {quote.design.show_notes && quote.notes && !longNotes && (
            <>
              <Text style={s.label}>UNA NOTA PARA TI</Text>
              <Text style={s.bodyCopy}>{quote.notes}</Text>
            </>
          )}
        </View>
        <View style={[s.totals, layout.totals]}>
          <View style={s.totalRow}>
            <Text style={s.muted}>Subtotal</Text>
            <Text>{money(totals.subtotal)}</Text>
          </View>
          {totals.discount > 0 && (
            <View style={s.totalRow}>
              <Text style={s.muted}>Ajuste histórico</Text>
              <Text>−{money(totals.discount)}</Text>
            </View>
          )}
          <View style={s.totalRow}>
            <Text style={s.muted}>IVA ({quote.tax_rate}%)</Text>
            <Text>{money(totals.tax)}</Text>
          </View>
          <View style={[s.totalRow, s.grand, layout.grand]}>
            <Text style={{ fontSize: 8, fontWeight: 700 }}>Total MXN</Text>
            <Text style={{ fontSize: 17, fontWeight: 700 }}>
              {money(totals.total)}
            </Text>
          </View>
        </View>
      </View>
      {quote.design.show_notes && quote.notes && longNotes && (
        <View style={s.terms}>
          <Text style={s.label} minPresenceAhead={24}>
            UNA NOTA PARA TI
          </Text>
          <Text style={s.bodyCopy} orphans={3} widows={3}>
            {quote.notes}
          </Text>
        </View>
      )}
      {quote.design.show_terms && quote.terms && (
        <View style={s.terms}>
          <Text style={s.label} minPresenceAhead={24}>
            CONDICIONES
          </Text>
          <Text style={s.bodyCopy} orphans={3} widows={3}>
            {quote.terms}
          </Text>
        </View>
      )}
    </>
  );
}
