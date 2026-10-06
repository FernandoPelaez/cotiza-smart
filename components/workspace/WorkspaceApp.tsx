"use client";
import { useEffect } from "react";
import Link from "next/link";
import { Info, FileQuestion } from "lucide-react";
import { WorkspaceProvider, useWorkspace } from "./WorkspaceProvider";
import { WorkspaceHeader } from "./WorkspaceHeader";
import { QuotesView } from "./QuotesView";
import { HistoryView } from "./HistoryView";
import { TemplatesView } from "./TemplatesView";
import { PlansView } from "./PlansView";
import { SettingsView } from "./SettingsView";
import { UpgradeDialog } from "./UpgradeDialog";
import { Onboarding } from "./Onboarding";
import { QuoteEditor } from "@/components/editor/QuoteEditor";
import { QuoteDetail } from "@/components/quotes/QuoteDetail";
import { DemoPublicQuote } from "@/components/quotes/DemoPublicQuote";
import { ViewMotion } from "@/components/shared/Motion";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty";
import type { Workspace } from "@/types/domain";
import "./workspace.css";
function WorkspaceSurface({
  view,
  template,
}: {
  view: string[];
  template?: string;
}) {
  const { workspace, base, refresh } = useWorkspace();
  const section = view[0] ? `/${view[0]}` : "";
  const quote = workspace.quotes.find((q) => q.id === view[1]);
  useEffect(() => {
    if (workspace.mode === "demo") return;
    const timer = setInterval(() => {
      if (document.visibilityState === "visible")
        void refresh().catch(() => {});
    }, 30000);
    return () => clearInterval(timer);
  }, [workspace.mode, refresh]);
  if (view[0] === "quote" && workspace.mode === "demo" && view[1])
    return <DemoPublicQuote token={view[1]} />;
  const content =
    view.length === 0 ? (
      <QuotesView home />
    ) : view[0] === "cotizaciones" && view.length === 1 ? (
      <QuotesView />
    ) : view[0] === "plantillas" ? (
      <TemplatesView />
    ) : view[0] === "historial" ? (
      <HistoryView />
    ) : view[0] === "planes" ? (
      <PlansView />
    ) : view[0] === "configuracion" ? (
      <SettingsView />
    ) : view[0] === "nueva" ? (
      <QuoteEditor template={template} />
    ) : view[0] === "editar" && quote ? (
      <QuoteEditor quote={quote} />
    ) : view[0] === "cotizaciones" && quote ? (
      <QuoteDetail quote={quote} />
    ) : (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileQuestion />
          </EmptyMedia>
          <EmptyTitle>No encontramos esta propuesta.</EmptyTitle>
          <EmptyDescription>
            El enlace puede haber cambiado o la cotización fue eliminada.
          </EmptyDescription>
        </EmptyHeader>
        <Link href={base} className="btn btn-primary">
          Volver a mi espacio
        </Link>
      </Empty>
    );
  return (
    <div className="workspace-page">
      <WorkspaceHeader
        section={
          view[0] === "nueva" || view[0] === "editar"
            ? "/cotizaciones"
            : section
        }
      />
      {workspace.mode === "demo" && (
        <div className="demo-banner">
          <div className="container-main">
            <Info size={14} />
            <span>
              <strong>Estás explorando la demo.</strong> Datos de ejemplo. Los
              cambios se guardan solo en este navegador.
            </span>
            <Link href="/register">Crear mi cuenta</Link>
          </div>
        </div>
      )}
      <main
        className={`container-main workspace-main ${view[0] === "nueva" || view[0] === "editar" ? "workspace-editor-main" : ""}`}
      >
        <ViewMotion id={view.join("/") || "home"}>{content}</ViewMotion>
      </main>
      <UpgradeDialog />
      <Onboarding />
    </div>
  );
}
export function WorkspaceApp({
  initial,
  view = [],
  template,
}: {
  initial: Workspace;
  view?: string[];
  template?: string;
}) {
  return (
    <WorkspaceProvider initial={initial}>
      <WorkspaceSurface view={view} template={template} />
    </WorkspaceProvider>
  );
}
