"use client";
import Link from "next/link";
import { Search, FileText, RefreshCw, ListFilter } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty";
import { QuoteTable } from "./QuoteTable";
import { useQuotesList } from "@/hooks/useQuotesList";
import { quoteStatus } from "@/lib/domain/quotes";
import type { QuoteStatus } from "@/types/domain";
const filters: { value: "all" | QuoteStatus; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "draft", label: "Borradores" },
  { value: "sent", label: "Enviadas" },
  { value: "viewed", label: "Vistas" },
  { value: "accepted", label: "Aceptadas" },
  { value: "rejected", label: "Rechazadas" },
  { value: "expired", label: "Vencidas" },
];
export function QuotesView({ home = false }: { home?: boolean }) {
  const {
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
  } = useQuotesList();
  return (
    <>
      <div className="workspace-title">
        <div>
          <span className="eyebrow">
            {home ? "TU ESPACIO DE TRABAJO" : "CADA PROPUESTA, EN SU LUGAR"}
          </span>
          <h1>
            {home
              ? `Hola, ${workspace.user.name.split(" ")[0]}.`
              : "Tus cotizaciones."}
          </h1>
          <p>
            {home
              ? "Una nueva oportunidad empieza con una buena propuesta."
              : "De la primera idea a la respuesta de tu cliente."}
          </p>
        </div>
      </div>
      {home && (
        <div className="workspace-intro">
          <div className="intro-symbol">
            <FileText size={23} strokeWidth={1.5} />
          </div>
          <div>
            <strong>¿Qué vas a proponer hoy?</strong>
            <span>Elige una plantilla. Dale tu estilo. Hazla llegar.</span>
          </div>
          <Link href={`${base}/plantillas`} className="text-link">
            Encontrar mi plantilla
          </Link>
        </div>
      )}
      <div className="quotes-toolbar">
        <h2>
          {home ? "En tu mesa de trabajo" : "Todas tus propuestas"}
          <span>{workspace.quotes.length}</span>
        </h2>
        <div className="toolbar-tools">
          <div className="search-control">
            <Search size={16} />
            <input
              aria-label="Buscar cotizaciones"
              placeholder="Buscar por cliente, título o folio"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <button
            className="icon-btn"
            disabled={busy}
            aria-label="Actualizar cotizaciones"
            onClick={() => void refreshQuotes()}
          >
            <RefreshCw size={15} className={busy ? "loading-indicator" : ""} />
          </button>
        </div>
      </div>
      <Tabs
        value={filter}
        onValueChange={(value) => {
          setFilter(value);
          setPage(1);
        }}
      >
        <TabsList variant="line" className="quote-filters">
          {filters.map((item) => (
            <TabsTrigger key={item.value} value={item.value}>
              {item.label}
              <span>
                {item.value === "all"
                  ? workspace.quotes.length
                  : workspace.quotes.filter(
                      (q) => quoteStatus(q) === item.value,
                    ).length}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={filter}>
          {shown.length ? (
            <QuoteTable
              quotes={shown}
              base={base}
              busy={busy}
              onDelete={setDeleting}
              onDuplicate={(quote) => void duplicateQuote(quote)}
            />
          ) : (
            <Empty className="quotes-empty">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ListFilter />
                </EmptyMedia>
                <EmptyTitle>
                  {workspace.quotes.length
                    ? "No encontramos coincidencias."
                    : "Tu primera propuesta está por empezar."}
                </EmptyTitle>
                <EmptyDescription>
                  {workspace.quotes.length
                    ? "Prueba con otro nombre o cambia el filtro."
                    : "Elige una plantilla y convierte lo que haces en una buena cotización."}
                </EmptyDescription>
              </EmptyHeader>
              <button
                className="btn btn-secondary"
                onClick={
                  workspace.quotes.length
                    ? () => {
                        setSearch("");
                        setFilter("all");
                      }
                    : () => router.push(`${base}/plantillas`)
                }
              >
                {workspace.quotes.length
                  ? "Limpiar filtros"
                  : "Explorar plantillas"}
              </button>
            </Empty>
          )}
          <div className="quotes-list-footer">
            <span>
              {found.length}{" "}
              {found.length === 1 ? "cotización" : "cotizaciones"}
              {search && ` para “${search}”`}
            </span>
            {totalPages > 1 && (
              <Pagination className="w-auto! mx-0!">
                <PaginationContent>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (p) =>
                        p === 1 ||
                        p === totalPages ||
                        Math.abs(p - currentPage) <= 1,
                    )
                    .map((p) => (
                      <PaginationItem key={p}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setPage(p);
                          }}
                          isActive={p === currentPage}
                          aria-label={`Página ${p}`}
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </TabsContent>
      </Tabs>
      {home && (
        <div className="workspace-footnote">
          <span>Hechas con intención. Presentadas con claridad.</span>
          <Link href={`${base}/historial`}>Ver mi historial</Link>
        </div>
      )}
      <AlertDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open && !busy) setDeleting(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta cotización?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará “{deleting?.title}” y su enlace dejará de funcionar.
              Esta acción no recupera creaciones del plan Free.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>
              Conservar cotización
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive!"
              disabled={busy}
              onClick={(e) => {
                e.preventDefault();
                void deleteQuote();
              }}
            >
              {busy ? "Eliminando…" : "Eliminar cotización"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>{" "}
    </>
  );
}
