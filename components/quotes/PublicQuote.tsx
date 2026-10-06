"use client";
import { useState, useEffect } from "react";
import { z } from "zod";
import {
  Check,
  X,
  Loader2,
  CircleCheck,
  CircleX,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { toast } from "@/lib/services/feedback";
import { Brand } from "@/components/shared/Brand";
import { QuoteDocument } from "./QuoteDocument";
import { PdfDownload } from "./PdfDownload";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/workspace/StatusBadge";
import { quoteStatus } from "@/lib/domain/quotes";
import { apiRequest } from "@/lib/services/client-api";
import type { Quote, Business } from "@/types/domain";
import { quoteRecordSchema } from "@/lib/schemas/workspace";
import "./public.css";
export function PublicQuote({
  initial,
  business,
  token,
  demo = false,
  onDemoResponse,
}: {
  initial: Quote;
  business: Business;
  token: string;
  demo?: boolean;
  onDemoResponse?: (action: "accepted" | "rejected" | "viewed") => void;
}) {
  const [quote, setQuote] = useState(initial);
  const [confirm, setConfirm] = useState<"accepted" | "rejected" | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const status = quoteStatus(quote);
  const answerable = status === "sent" || status === "viewed";
  useEffect(() => {
    if (demo) return;
    void apiRequest(
      `/api/public/${token}/view`,
      z.object({ ok: z.boolean() }),
      {},
    ).catch(() => {
      /* La lectura no se bloquea si falla el evento de visualización. */
    });
  }, [demo, token]);
  async function respond() {
    if (!confirm || busy) return;
    setBusy(true);
    setError("");
    try {
      if (demo) {
        onDemoResponse?.(confirm);
        setQuote((previous) => ({
          ...previous,
          status: confirm,
          responded_at: new Date().toISOString(),
        }));
      } else {
        const result = await apiRequest(
          `/api/public/${token}/respond`,
          quoteRecordSchema,
          { action: confirm },
        );
        setQuote(result);
      }
      setConfirm(null);
      toast.success(
        confirm === "accepted"
          ? "Cotización aceptada."
          : "Tu respuesta quedó registrada.",
      );
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "No se pudo guardar tu respuesta.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="public-page">
      {demo && (
        <div className="public-demo">
          Demostración local · datos de ejemplo · sin validez comercial
        </div>
      )}
      <header className="public-header">
        <Brand />
        <span>
          <ShieldCheck size={14} />
          Una propuesta preparada para ti
        </span>
      </header>
      <div className="public-heading">
        <div>
          <span className="eyebrow">DE {business.name.toUpperCase()}</span>
          <h1>Hola, {quote.customer.name}.</h1>
          <p>Revisa los detalles de tu propuesta y comparte tu respuesta.</p>
        </div>
        <StatusBadge status={status} />
      </div>
      <div className="public-document print-document">
        <QuoteDocument
          quote={quote}
          business={business}
          number={quote.number}
          createdAt={quote.created_at}
        />
      </div>
      <section className="public-response print-hide">
        {answerable ? (
          <>
            <div>
              <h2>¿Qué te parece la propuesta?</h2>
              <p>Tu respuesta se compartirá con {business.name}.</p>
            </div>
            <div className="public-response-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setConfirm("rejected")}
              >
                <X size={17} />
                Rechazar
              </button>
              <button
                className="btn btn-primary"
                onClick={() => setConfirm("accepted")}
              >
                <Check size={17} />
                Aceptar cotización
              </button>
            </div>
          </>
        ) : (
          <div className={`response-complete response-${status}`}>
            {status === "expired" ? (
              <Clock size={25} />
            ) : status === "rejected" ? (
              <CircleX size={36} />
            ) : (
              <CircleCheck size={36} />
            )}
            <div>
              <h2>
                {status === "accepted"
                  ? "Cotización aceptada."
                  : status === "rejected"
                    ? "Cotización rechazada."
                    : "Esta propuesta ha vencido."}
              </h2>
              <p>
                {status === "expired"
                  ? `Contacta a ${business.name} para solicitar una propuesta actualizada.`
                  : `${business.name} puede consultar tu respuesta en su historial.`}
              </p>
            </div>
          </div>
        )}
      </section>
      <div className="public-download print-hide">
        <PdfDownload quote={quote} business={business} />
        <span>Una copia para tener a la mano.</span>
      </div>
      <footer className="public-footer print-hide">
        <span>Propuesta de {business.name}</span>
        <span>Presentada con Cotiza Smart</span>
      </footer>
      <Dialog
        open={Boolean(confirm)}
        onOpenChange={(open) => {
          if (!open && !busy) setConfirm(null);
        }}
      >
        <DialogContent className="max-w-md!">
          <DialogHeader>
            <DialogTitle className="text-xl!">
              {confirm === "accepted"
                ? "¿Aceptar esta cotización?"
                : "¿Rechazar esta cotización?"}
            </DialogTitle>
            <DialogDescription className="leading-7!">
              {demo
                ? "Esta es una respuesta de prueba en la demostración local."
                : `Registraremos tu respuesta a ${quote.number} y la pondremos a disposición de ${business.name}.`}
            </DialogDescription>
          </DialogHeader>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <div className="flex gap-3 justify-end mt-4">
            <button
              className="btn btn-secondary btn-sm"
              disabled={busy}
              onClick={() => setConfirm(null)}
            >
              Volver a revisar
            </button>
            <button
              className={`btn ${confirm === "accepted" ? "btn-primary" : "btn-danger"} btn-sm`}
              disabled={busy}
              onClick={respond}
            >
              {busy && <Loader2 size={15} className="loading-indicator" />}
              {confirm === "accepted"
                ? "Confirmar aceptación"
                : "Confirmar rechazo"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
