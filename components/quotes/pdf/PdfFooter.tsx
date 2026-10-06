import { View, Text } from "@react-pdf/renderer";
import type { Business } from "@/types/domain";
import { pdfStyles as s } from "@/lib/pdf/styles";
export function PdfFooter({ business }: { business: Business }) {
  return (
    <View style={s.footer} fixed>
      <Text style={{ width: "42%" }}>
        {[business.email, business.phone].filter(Boolean).join(" · ")}
      </Text>
      <Text style={{ width: "43%", textAlign: "right" }}>
        {business.website ||
          (business.rfc ? `RFC ${business.rfc}` : "Hecho con Cotiza Smart")}
      </Text>
      <Text
        fixed
        style={{ width: "12%", textAlign: "right" }}
        render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
      />
    </View>
  );
}
