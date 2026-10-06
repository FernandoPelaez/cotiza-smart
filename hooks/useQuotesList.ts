"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/services/feedback";
import { filterQuotes } from "@/lib/domain/quote-list";
import { useWorkspace } from "@/components/workspace/WorkspaceProvider";
import type { Quote } from "@/types/domain";
export function useQuotesList() {
  const { workspace, base, remove, duplicate, refresh } = useWorkspace();
  const router = useRouter();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<Quote | null>(null);
  const [busy, setBusy] = useState(false);
  const [page, setPage] = useState(1);
  const found = filterQuotes(workspace.quotes, filter, search);
  const totalPages = Math.max(1, Math.ceil(found.length / 8));
  const currentPage = Math.min(page, totalPages);
  const shown = found.slice((currentPage - 1) * 8, currentPage * 8);
  async function duplicateQuote(quote: Quote) {
    if (busy) return;
    setBusy(true);
    try {
      const created = await duplicate(quote);
      toast.success("Cotización duplicada.");
      router.push(`${base}/editar/${created.id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo duplicar.");
    } finally {
      setBusy(false);
    }
  }
  async function deleteQuote() {
    if (!deleting || busy) return;
    setBusy(true);
    try {
      await remove(deleting.id);
      setDeleting(null);
      toast.success(
        "Cotización eliminada. El consumo del plan Free se conserva.",
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo eliminar.");
    } finally {
      setBusy(false);
    }
  }
  async function refreshQuotes() {
    if (busy) return;
    setBusy(true);
    try {
      await refresh();
      toast.success("Cotizaciones actualizadas.");
    } catch {
      toast.error("No se pudo actualizar.");
    } finally {
      setBusy(false);
    }
  }
  return {
    workspace,
    base,
    router,
    filter,
    setFilter,
    search,
    setSearch,
    deleting,
    setDeleting,
    busy,
    setPage,
    found,
    totalPages,
    currentPage,
    shown,
    duplicateQuote,
    deleteQuote,
    refreshQuotes,
  };
}
