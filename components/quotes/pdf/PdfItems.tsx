import { View, Text } from "@react-pdf/renderer";
import type { Quote } from "@/types/domain";
import { pdfStyles as s } from "@/lib/pdf/styles";
import { pdfLayout } from "@/lib/pdf/layout";
import { templateById } from "@/lib/domain/templates";
import { documentLineTotal, money } from "@/lib/domain/money";
export function PdfItems({ quote }: { quote: Quote }) {
  const l = pdfLayout(quote);
  const template = templateById(quote.template_id);
  return (
    <>
      <View style={[s.row, s.headRow, l.headRow]} fixed>
        <Text style={s.description}>Concepto</Text>
        <Text style={s.quantity}>Cant.</Text>
        <Text style={s.price}>Precio</Text>
        <Text style={s.amount}>Importe</Text>
      </View>
      {quote.items.map((item, index) => (
        <View
          style={[
            s.row,
            l.row,
            template.layout.table === "zebra" && index % 2
              ? { backgroundColor: "#f3f6f7" }
              : {},
          ]}
          key={item.id}
          wrap={false}
        >
          <View style={s.description}>
            <Text style={{ fontWeight: 700 }}>{item.description}</Text>
            <Text style={s.itemMeta}>
              {template.plan === "premium"
                ? `${String(index + 1).padStart(2, "0")} · `
                : ""}
              {item.kind === "product" ? "Producto" : "Servicio"} · {item.unit}
              {item.discount > 0 ? ` · Ajuste histórico ${item.discount}%` : ""}
            </Text>
          </View>
          <Text style={s.quantity}>{item.quantity}</Text>
          <Text style={s.price}>{money(item.unit_price)}</Text>
          <Text style={s.amount}>{money(documentLineTotal(item))}</Text>
        </View>
      ))}
    </>
  );
}
