"use client";
import { useRef, useState } from "react";
import { toast } from "@/lib/services/feedback";
import { pdfLogo } from "@/lib/pdf/logo";
import { quoteFilename } from "@/lib/domain/files";
import type { Quote, Business } from "@/types/domain";
export function usePdfDownload(quote: Quote, business: Business) {
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  async function download() {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    try {
      const { renderQuotePdf } = await import("@/lib/pdf/render");
      const prepared = {
        ...business,
        logo_url:
          quote.design.show_logo && business.logo_url
            ? await pdfLogo(business.logo_url)
            : "",
      };
      const blob = await renderQuotePdf(
        quote,
        prepared,
        window.location.origin,
      );
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = quoteFilename(quote.number, business.name);
      anchor.hidden = true;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 30000);
      toast.success("PDF preparado. La descarga está lista en tu navegador.");
    } catch {
      toast.error("No se pudo preparar el PDF. Vuelve a intentar.");
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }
  return { busy, download };
}
