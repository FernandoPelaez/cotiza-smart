"use client";
import { Copy, Check, MessageCircle, Link2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { useQuoteShare } from "@/hooks/useQuoteShare";
export function ShareModal({
  state,
}: {
  state: ReturnType<typeof useQuoteShare>;
}) {
  const { open, setOpen, link, copied, message, copy, demo, whatsappUrl } =
    state;
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg! p-7! rounded-xl!">
        <DialogHeader>
          <div className="share-dialog-icon">
            <Link2 size={24} />
          </div>
          <DialogTitle className="text-2xl! mt-3! tracking-tight">
            Tu propuesta, lista para llegar.
          </DialogTitle>
          <DialogDescription className="leading-6!">
            Tu cliente puede revisar y responder desde este enlace. No necesita
            una cuenta.
          </DialogDescription>
        </DialogHeader>
        <div className="share-link">
          <input
            readOnly
            value={link}
            aria-label="Enlace de la cotización"
            onFocus={(e) => e.currentTarget.select()}
          />
          <button
            className="icon-btn"
            onClick={copy}
            aria-label="Copiar enlace"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>
        <div className="share-message">
          <span>EL MENSAJE</span>
          <p>
            {message.split(" Puedes revisar")[0]} Puedes revisar el detalle y
            dejarnos tu respuesta en el enlace.
          </p>
        </div>
        {demo ? (
          <>
            <p className="demo-share-note">
              En esta demo el enlace funciona solo en este navegador. Para
              enviarlo a un cliente necesitas una cuenta conectada.
            </p>
            <a
              className="btn btn-primary"
              href={link}
              target="_blank"
              rel="noopener noreferrer"
            >
              Ver como cliente
            </a>
          </>
        ) : (
          <a
            className="btn btn-primary"
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle size={17} />
            Abrir WhatsApp
          </a>
        )}
        <p className="share-foot">
          Una vez compartida, la propuesta conserva su contenido. Para
          modificarla, crea una copia.
        </p>
      </DialogContent>
    </Dialog>
  );
}
