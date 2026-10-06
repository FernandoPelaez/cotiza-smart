"use client";
import Link from "next/link";
import { Pencil, Copy, Loader2, Eye, FileText } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/services/feedback";
import type { Quote } from "@/types/domain";
import { useWorkspace } from "@/components/workspace/WorkspaceProvider";
import { QuoteDocument } from "./QuoteDocument";
import { PdfDownload } from "./PdfDownload";
import { ShareDialog } from "./ShareDialog";
import { StatusBadge } from "@/components/workspace/StatusBadge";
import { quoteStatus, dateLabel } from "@/lib/domain/quotes";
import { SAMPLE_BUSINESS } from "@/lib/demo/seed";
export function QuoteDetail({ quote }: { quote: Quote }) {
  const { workspace, base, duplicate } = useWorkspace();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const status = quoteStatus(quote);
  const business =
    quote.business_snapshot ?? workspace.business ?? SAMPLE_BUSINESS;
  async function copyQuote() {
    setBusy(true);
    try {
      const saved = await duplicate(quote);
      router.push(`${base}/editar/${saved.id}`);
      toast.success("Tu nueva versión está lista para editar.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo duplicar.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="detail-topbar">
        <div>
          <Link className="editor-back" href={`${base}/cotizaciones`}>
            Mis cotizaciones
          </Link>
          <h1>{quote.title}</h1>
          <div className="detail-meta">
            <span>{quote.number}</span>
            <StatusBadge status={status} />
            <span>Creada el {dateLabel(quote.created_at)}</span>
          </div>
        </div>
        <div className="detail-actions">
          {status === "draft" ? (
            <Link
              className="btn btn-secondary btn-sm"
              href={`${base}/editar/${quote.id}`}
            >
              <Pencil size={15} />
              Editar
            </Link>
          ) : (
            <button
              className="btn btn-secondary btn-sm"
              onClick={copyQuote}
              disabled={busy}
            >
              {busy ? (
                <Loader2 className="loading-indicator" size={15} />
              ) : (
                <Copy size={15} />
              )}
              Crear una copia
            </button>
          )}
          <PdfDownload quote={quote} business={business} />
          {status !== "expired" && <ShareDialog quote={quote} />}
        </div>
      </div>
      <div className="detail-layout">
        <div className="detail-document">
          <QuoteDocument
            quote={quote}
            business={business}
            number={quote.number}
            createdAt={quote.created_at}
          />
        </div>
        <aside className="detail-context">
          <div className="detail-side-label">
            <FileText size={17} />
            <span>TU PROPUESTA</span>
          </div>
          <h2>
            {status === "accepted"
              ? "Una propuesta que conectó."
              : status === "rejected"
                ? "Cada respuesta abre un aprendizaje."
                : "Todo listo para el siguiente paso."}
          </h2>
          <p>
            {status === "draft"
              ? "Revisa los detalles. Cuando la compartas, tu cliente podrá verla y responder desde su enlace."
              : status === "accepted"
                ? `${quote.customer.name} aceptó esta cotización. La respuesta ya está en tu historial.`
                : status === "rejected"
                  ? `${quote.customer.name} rechazó esta cotización. Puedes preparar una nueva propuesta.`
                  : status === "viewed"
                    ? "Tu cliente abrió el enlace. Su respuesta aparecerá aquí y en tu historial."
                    : status === "expired"
                      ? "La vigencia terminó. Puedes duplicar la cotización y actualizar sus condiciones."
                      : "El enlace está listo para tu cliente. Su actividad quedará en tu historial."}
          </p>
          <div className="detail-info-row">
            <span>Cliente</span>
            <strong>{quote.customer.name}</strong>
          </div>
          <div className="detail-info-row">
            <span>Vigencia</span>
            <strong>{dateLabel(quote.valid_until)}</strong>
          </div>
          {quote.responded_at && (
            <div className="detail-info-row">
              <span>Respuesta</span>
              <strong>{dateLabel(quote.responded_at, true)}</strong>
            </div>
          )}
          {quote.public_token && (
            <Link
              className="btn btn-secondary btn-sm w-full mt-5"
              href={
                workspace.mode === "demo"
                  ? `/demo/quote/${quote.public_token}`
                  : `/quote/${quote.public_token}`
              }
              target="_blank"
            >
              <Eye size={15} />
              Ver como cliente
            </Link>
          )}
          <Link
            className="text-link mt-6 inline-block"
            href={`${base}/historial`}
          >
            Consultar historial
          </Link>
        </aside>
      </div>
    </>
  );
}
