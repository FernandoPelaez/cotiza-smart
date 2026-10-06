import { StyleSheet } from "@react-pdf/renderer";
import type { Quote } from "@/types/domain";
import { templateById } from "@/lib/domain/templates";
import { documentColors } from "@/lib/domain/design";
/** Traducción de unidades web a puntos A4. Ninguna plantilla utiliza capturas rasterizadas. */
export function pdfLayout(quote: Quote) {
  const { layout: p } = templateById(quote.template_id);
  const { accent, ink, onAccent } = documentColors(quote.design.color);
  const centered = p.header === "center" || p.header === "masthead";
  return StyleSheet.create({
    page: {
      padding: p.density === "compact" ? 34 : p.density === "airy" ? 46 : 42,
      paddingBottom: 70,
      ...(p.frame === "top"
        ? { borderTopWidth: 5, borderTopColor: accent }
        : p.frame === "side"
          ? { borderLeftWidth: 4, borderLeftColor: accent }
          : p.frame === "border"
            ? { borderWidth: 7, borderColor: accent }
            : {}),
    },
    lead: {
      flexDirection: p.header === "rail" ? "row" : "column",
      gap: p.header === "rail" ? 22 : 0,
    },
    header: {
      flexDirection:
        centered || p.header === "rail"
          ? "column"
          : p.header === "reverse"
            ? "row-reverse"
            : "row",
      alignItems: centered ? "center" : "flex-start",
      borderBottomColor: accent,
      ...(p.header === "rail"
        ? { width: "28%", borderBottomWidth: 0, gap: 16 }
        : {}),
      ...(p.header === "band"
        ? {
            backgroundColor: accent,
            color: onAccent,
            padding: 18,
            borderBottomWidth: 0,
          }
        : {}),
      ...(p.header === "masthead"
        ? { borderTopWidth: 2, borderTopColor: accent, paddingTop: 14 }
        : {}),
    },
    business: {
      maxWidth: centered || p.header === "rail" ? "100%" : "64%",
      width:
        p.header === "masthead"
          ? "auto"
          : centered || p.header === "rail"
            ? "100%"
            : "64%",
      flexDirection:
        p.header === "center" || p.header === "rail"
          ? "column"
          : p.header === "reverse"
            ? "row-reverse"
            : "row",
      alignItems: centered ? "center" : "flex-start",
    },
    brand: {
      color: p.header === "band" ? onAccent : ink,
      fontSize: p.header === "masthead" ? 20 : p.header === "rail" ? 12 : 15,
      textAlign: centered
        ? "center"
        : p.header === "reverse"
          ? "right"
          : "left",
    },
    address: {
      color: p.header === "band" ? onAccent : "#607784",
      fontSize: 7,
      textAlign: centered ? "center" : "left",
    },
    number: {
      ...(p.header === "reverse"
        ? { borderLeftWidth: 2, borderLeftColor: accent, paddingLeft: 10 }
        : {}),
      maxWidth: centered || p.header === "rail" ? "100%" : "33%",
      textAlign: centered
        ? "center"
        : p.header === "reverse" || p.header === "rail"
          ? "left"
          : "right",
      marginTop: centered ? 12 : 0,
      color: p.header === "band" ? onAccent : ink,
    },
    heading: {
      ...(p.header === "rail" ? { width: "67%", marginTop: 0 } : {}),
      ...(p.headingFirst ? { marginTop: 0 } : {}),
      ...(p.title === "rule"
        ? { borderLeftWidth: 3, borderLeftColor: accent, paddingLeft: 14 }
        : p.title === "panel"
          ? { padding: 16, backgroundColor: "#f0f4f5" }
          : {}),
    },
    title: {
      color: ink,
      fontSize: p.title === "large" ? 27 : 18,
      fontWeight: p.title === "large" ? 400 : 700,
      textAlign: p.header === "center" ? "center" : "left",
    },
    parties: {
      ...(p.parties === "line"
        ? {
            borderTopWidth: 0.5,
            borderBottomWidth: 0.5,
            borderColor: "#d9e2e4",
            paddingVertical: 12,
          }
        : p.parties === "tint"
          ? { backgroundColor: "#f1f5f5", padding: 14 }
          : {}),
    },
    dates: {
      flexDirection: p.parties === "stack" ? "column" : "row",
      gap: p.parties === "stack" ? 8 : 18,
    },
    headRow: {
      backgroundColor:
        p.table === "ink"
          ? accent
          : p.table === "minimal"
            ? "#ffffff"
            : "#f3f7f8",
      color: p.table === "ink" ? onAccent : ink,
      ...(p.table === "grid"
        ? { borderWidth: 0.5, borderColor: "#d6e1e6" }
        : {}),
      ...(p.table === "minimal"
        ? { borderBottomWidth: 1, borderBottomColor: accent }
        : {}),
    },
    row: {
      paddingVertical:
        p.density === "compact" ? 8 : p.density === "airy" ? 14 : 12,
      ...(p.table === "grid"
        ? {
            borderLeftWidth: 0.5,
            borderRightWidth: 0.5,
            borderColor: "#d6e1e6",
          }
        : p.table === "minimal"
          ? { borderBottomWidth: 0 }
          : {}),
    },
    bottom: {
      marginTop: 16,
      marginBottom: 16,
      gap: 12,
      flexDirection:
        p.totals === "left"
          ? "row-reverse"
          : p.totals === "band"
            ? "column"
            : "row",
    },
    notes: { width: p.totals === "band" ? "100%" : "48%" },
    totals: {
      width: p.totals === "band" ? "100%" : "46%",
      ...(p.totals === "box"
        ? { borderWidth: 0.7, borderColor: accent, padding: 12 }
        : {}),
    },
    grand: {
      color: ink,
      ...(p.totals === "band"
        ? { backgroundColor: accent, color: onAccent, padding: 12 }
        : {}),
    },
  });
}
