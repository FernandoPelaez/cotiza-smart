"use client";
import { useRef, useState } from "react";
import { toast } from "@/lib/services/feedback";
import { useWorkspace } from "@/components/workspace/WorkspaceProvider";
import type { Quote } from "@/types/domain";
export function useQuoteShare(quote: Quote) {
  const { share, workspace } = useWorkspace();
  const [open, setOpen] = useState(false),
    [busy, setBusy] = useState(false),
    [link, setLink] = useState(""),
    [copied, setCopied] = useState(false),
    [message, setMessage] = useState("");
  const pending = useRef(false);
  async function prepare() {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    try {
      const saved = await share(quote);
      if (!saved.public_token)
        throw new Error("No pudimos preparar el enlace.");
      const path =
        workspace.mode === "demo"
          ? `/demo/quote/${saved.public_token}`
          : `/quote/${saved.public_token}`;
      const url = `${window.location.origin}${path}`;
      setLink(url);
      setCopied(false);
      setMessage(
        `Hola, ${quote.customer.name}. Te comparto nuestra propuesta: ${quote.title}. Puedes revisar el detalle y dejarnos tu respuesta aquí: ${url}`,
      );
      setOpen(true);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo preparar el enlace.",
      );
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success("Enlace copiado.");
    } catch {
      toast.error(
        "No se pudo copiar. Selecciona el enlace y cópialo manualmente.",
      );
    }
  }
  const phone = quote.customer.phone.replace(/\D/g, "");
  return {
    open,
    setOpen,
    busy,
    link,
    copied,
    message,
    prepare,
    copy,
    demo: workspace.mode === "demo",
    whatsappUrl: `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
  };
}
