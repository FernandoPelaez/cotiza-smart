import type { CSSProperties } from "react";
import type { Business, QuoteInput } from "@/types/domain";
import {
  money,
  calculateDocumentTotals,
  documentLineTotal,
} from "@/lib/domain/money";
import { documentColors, documentFont } from "@/lib/domain/design";
import { templateById } from "@/lib/domain/templates";
import { DocumentHeading, DocumentParties } from "./DocumentHeading";
import "./document.css";
export function QuoteDocument({
  quote,
  business,
  number = "CS-2026-0001",
  createdAt = "2026-10-02",
  thumbnail = false,
  previewRows,
}: {
  quote: QuoteInput;
  business: Business;
  number?: string;
  createdAt?: string;
  thumbnail?: boolean;
  previewRows?: number;
}) {
  const totals = calculateDocumentTotals(quote.items, quote.tax_rate);
  const template = templateById(quote.template_id);
  const colors = documentColors(quote.design.color);
  const visibleItems = quote.items.slice(0, thumbnail ? 3 : previewRows);
  const layoutClasses = Object.entries(template.layout)
    .map(([key, value]) => `layout-${key}-${value}`)
    .join(" ");
  return (
    <article
      className={`quote-paper quote-${quote.template_id} ${layoutClasses} ${thumbnail ? "quote-thumbnail" : ""}`}
      style={
        {
          "--quote-color": colors.accent,
          "--quote-ink": colors.ink,
          "--quote-on-accent": colors.onAccent,
          fontFamily: documentFont(quote.design.font).family,
        } as CSSProperties
      }
      aria-label={thumbnail ? undefined : `Cotización ${number}`}
      aria-hidden={thumbnail || undefined}
    >
      <DocumentHeading quote={quote} business={business} number={number} />
      <DocumentParties quote={quote} createdAt={createdAt} />
      <table className="document-table">
        <thead>
          <tr>
            <th>Concepto</th>
            <th>Cant.</th>
            <th>Precio</th>
            <th>Importe</th>
          </tr>
        </thead>
        <tbody>
          {visibleItems.map((item, index) => (
            <tr key={item.id}>
              <td>
                <span>{item.description || "Descripción del concepto"}</span>
                <small>
                  {template.plan === "premium"
                    ? `${String(index + 1).padStart(2, "0")} · `
                    : ""}
                  {item.kind === "product" ? "Producto" : "Servicio"}
                  {item.unit ? ` · ${item.unit}` : ""}
                  {item.discount > 0
                    ? ` · Ajuste histórico ${item.discount}%`
                    : ""}
                </small>
              </td>
              <td>{item.quantity}</td>
              <td>{money(item.unit_price)}</td>
              <td>{money(documentLineTotal(item))}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {visibleItems.length < quote.items.length && (
        <p className="document-preview-note">
          Vista compacta: {visibleItems.length} de {quote.items.length}{" "}
          conceptos. Los totales incluyen todos.
        </p>
      )}
      <div className="document-bottom">
        <div className="document-notes">
          {quote.design.show_notes && quote.notes && (
            <div>
              <span className="doc-label">UNA NOTA PARA TI</span>
              <p>{quote.notes}</p>
            </div>
          )}
        </div>
        <div className="document-totals">
          <div>
            <span>Subtotal</span>
            <span>{money(totals.subtotal)}</span>
          </div>
          {totals.discount > 0 && (
            <div>
              <span>Ajuste histórico</span>
              <span>−{money(totals.discount)}</span>
            </div>
          )}
          <div>
            <span>IVA ({quote.tax_rate}%)</span>
            <span>{money(totals.tax)}</span>
          </div>
          <div className="document-grand-total">
            <span>Total MXN</span>
            <strong>{money(totals.total)}</strong>
          </div>
        </div>
      </div>
      {quote.design.show_terms && quote.terms && (
        <section className="document-terms">
          <span className="doc-label">CONDICIONES</span>
          <p>{quote.terms}</p>
        </section>
      )}
      <footer className="document-footer">
        <span>
          {[business.email, business.phone].filter(Boolean).join(" · ")}
        </span>
        <span>
          {business.website ||
            (business.rfc ? `RFC ${business.rfc}` : "Hecho con Cotiza Smart")}
        </span>
      </footer>
    </article>
  );
}
