import { View, Text, Image as PdfImage } from "@react-pdf/renderer";
import type { Business, Quote } from "@/types/domain";
import { pdfStyles as s } from "@/lib/pdf/styles";
import { pdfLayout } from "@/lib/pdf/layout";
import { templateById } from "@/lib/domain/templates";
import { dateLabel } from "@/lib/domain/quotes";
export function PdfHeader({
  quote,
  business,
}: {
  quote: Quote;
  business: Business;
}) {
  const l = pdfLayout(quote);
  const template = templateById(quote.template_id);
  const title = (
    <View style={[s.heading, l.heading]}>
      {template.plan === "premium" && (
        <Text style={s.label}>PROPUESTA · {template.name.toUpperCase()}</Text>
      )}
      <Text style={[s.title, l.title]}>{quote.title}</Text>
    </View>
  );
  const identity = (
    <View style={[s.header, l.header]}>
      <View style={[s.business, l.business]}>
        {quote.design.show_logo && business.logo_url ? (
          <PdfImage src={business.logo_url} style={s.logo} />
        ) : null}
        <View
          style={
            template.layout.header === "center" ||
            template.layout.header === "rail"
              ? { width: "100%" }
              : template.layout.header === "masthead"
                ? { flexShrink: 1 }
                : { flex: 1 }
          }
        >
          <Text style={[s.businessName, l.brand]}>{business.name}</Text>
          <Text style={l.address}>{business.address}</Text>
        </View>
      </View>
      <View style={l.number}>
        <Text style={{ fontSize: 6.5, marginBottom: 5 }}>COTIZACIÓN</Text>
        <Text style={{ fontSize: 8, fontWeight: 700 }}>{quote.number}</Text>
      </View>
    </View>
  );
  return (
    <>
      <View style={l.lead}>
        {template.layout.headingFirst ? (
          <>
            {title}
            {identity}
          </>
        ) : (
          <>
            {identity}
            {title}
          </>
        )}
      </View>
      <View style={[s.parties, l.parties]}>
        <View style={{ maxWidth: "50%" }}>
          <Text style={s.label}>PREPARADA PARA</Text>
          <Text style={{ fontWeight: 700 }}>{quote.customer.name}</Text>
          {[
            quote.customer.email,
            quote.customer.phone,
            quote.customer.address,
            quote.customer.rfc ? `RFC ${quote.customer.rfc}` : "",
          ]
            .filter(Boolean)
            .map((line, i) => (
              <Text style={s.muted} key={i}>
                {line}
              </Text>
            ))}
        </View>
        <View style={[s.dates, l.dates]}>
          <View>
            <Text style={s.label}>FECHA</Text>
            <Text>{dateLabel(quote.created_at, false, true)}</Text>
          </View>
          <View>
            <Text style={s.label}>VÁLIDA HASTA</Text>
            <Text>{dateLabel(quote.valid_until, false, true)}</Text>
          </View>
        </View>
      </View>
    </>
  );
}
