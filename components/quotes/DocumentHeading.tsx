import Image from "next/image";
import type { Business, QuoteInput } from "@/types/domain";
import { templateById } from "@/lib/domain/templates";
import { dateLabel } from "@/lib/domain/quotes";
export function DocumentHeading({
  quote,
  business,
  number,
}: {
  quote: QuoteInput;
  business: Business;
  number: string;
}) {
  const template = templateById(quote.template_id);
  const identity = (
    <header className="document-header">
      <div className="document-business">
        {quote.design.show_logo && business.logo_url && (
          <Image
            src={business.logo_url}
            alt={`Logo de ${business.name}`}
            width={50}
            height={50}
            unoptimized
          />
        )}
        <div>
          <strong>{business.name || "Tu negocio"}</strong>
          <span>{business.address}</span>
        </div>
      </div>
      <div className="document-number">
        <span>COTIZACIÓN</span>
        <strong>{number}</strong>
      </div>
    </header>
  );
  const title = (
    <div className="document-heading">
      {template.plan === "premium" && (
        <span className="editorial-kicker">
          PROPUESTA · {template.name.toUpperCase()}
        </span>
      )}
      <h2>{quote.title || "Tu próximo gran proyecto"}</h2>
    </div>
  );
  return (
    <div className="document-lead">
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
    </div>
  );
}
export function DocumentParties({
  quote,
  createdAt,
}: {
  quote: QuoteInput;
  createdAt: string;
}) {
  return (
    <div className="document-parties">
      <div>
        <span className="doc-label">PREPARADA PARA</span>
        <strong>{quote.customer.name || "Nombre de tu cliente"}</strong>
        {[
          quote.customer.email,
          quote.customer.phone,
          quote.customer.address,
          quote.customer.rfc ? `RFC ${quote.customer.rfc}` : "",
        ]
          .filter(Boolean)
          .map((line, i) => (
            <span key={i}>{line}</span>
          ))}
      </div>
      <div className="document-dates">
        <div>
          <span className="doc-label">FECHA</span>
          <strong>{dateLabel(createdAt, false, true)}</strong>
        </div>
        <div>
          <span className="doc-label">VÁLIDA HASTA</span>
          <strong>{dateLabel(quote.valid_until, false, true)}</strong>
        </div>
      </div>
    </div>
  );
}
