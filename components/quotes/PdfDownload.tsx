"use client";
import { Download, Loader2 } from "lucide-react";
import { usePdfDownload } from "@/hooks/usePdfDownload";
import type { Quote, Business } from "@/types/domain";
export function PdfDownload({
  quote,
  business,
  className = "btn btn-secondary btn-sm",
}: {
  quote: Quote;
  business: Business;
  className?: string;
}) {
  const { busy, download } = usePdfDownload(quote, business);
  return (
    <button className={className} disabled={busy} onClick={download}>
      {busy ? (
        <Loader2 size={15} className="loading-indicator" />
      ) : (
        <Download size={15} />
      )}{" "}
      {busy ? "Preparando PDF…" : "Descargar PDF"}
    </button>
  );
}
