"use client";
import Link from "next/link";
import { Save, Eye, Check, Loader2, FilePenLine } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWorkspace } from "@/components/workspace/WorkspaceProvider";
import { useQuoteDraft } from "@/hooks/useQuoteDraft";
import { canCreate } from "@/lib/domain/quotes";
import { templateById } from "@/lib/domain/templates";
import { QuoteDocument } from "@/components/quotes/QuoteDocument";
import { ViewMotion } from "@/components/shared/Motion";
import { SAMPLE_BUSINESS } from "@/lib/demo/seed";
import { CustomerFields } from "./CustomerFields";
import { ItemFields } from "./ItemFields";
import { ReviewFields } from "./ReviewFields";
import { DesignFields } from "./DesignFields";
import { money } from "@/lib/domain/money";
import type { Quote } from "@/types/domain";
export function QuoteEditor({
  quote,
  template,
}: {
  quote?: Quote;
  template?: string;
}) {
  const { workspace, base, setLimitOpen } = useWorkspace();
  const {
    input,
    current,
    step,
    setStep,
    mobileView,
    setMobileView,
    busy,
    error,
    saveState,
    totals,
    change,
    persist,
    next,
  } = useQuoteDraft(quote, template);
  if (!current && !canCreate(workspace.subscription, workspace.creations_used))
    return (
      <div className="editor-limit">
        <span className="eyebrow">TU NEGOCIO TIENE MÁS POR PROPONER</span>
        <h1>Ya utilizaste tus 3 cotizaciones gratuitas.</h1>
        <p>
          Tu información sigue disponible. Elige Pro o Premium para crear tu
          próxima propuesta.
        </p>
        <button className="btn btn-primary" onClick={() => setLimitOpen(true)}>
          Ver mis opciones
        </button>
        <Link href={base} className="btn btn-secondary">
          Volver a mis cotizaciones
        </Link>
      </div>
    );
  if (quote && quote.status !== "draft")
    return (
      <div className="editor-limit">
        <h1>Esta propuesta ya fue compartida.</h1>
        <p>
          Su contenido se conserva para que tu cliente vea lo que recibió.
          Puedes duplicarla desde tus cotizaciones.
        </p>
        <Link
          className="btn btn-primary"
          href={`${base}/cotizaciones/${quote.id}`}
        >
          Ver cotización
        </Link>
      </div>
    );
  return (
    <>
      <div className="editor-topbar">
        <div>
          <Link className="editor-back" href={base}>
            Mis cotizaciones
          </Link>
          <h1>
            {current ? "Dale forma a tu propuesta." : "Una nueva posibilidad."}
          </h1>
        </div>
        <div className="editor-top-actions">
          <span className="save-state" role="status">
            {busy ? (
              <Loader2 size={14} className="loading-indicator" />
            ) : saveState === "Guardado" ? (
              <Check size={14} />
            ) : (
              <FilePenLine size={14} />
            )}
            {saveState}
          </span>
          <button
            className="btn btn-secondary btn-sm"
            disabled={busy}
            onClick={() => void persist()}
          >
            <Save size={15} />
            Guardar
          </button>
          <button
            className="btn btn-primary btn-sm"
            disabled={busy}
            onClick={() => void persist(true)}
          >
            <Eye size={15} />
            <span>Revisar y compartir</span>
          </button>
        </div>
      </div>
      <Tabs
        value={mobileView}
        onValueChange={setMobileView}
        className="editor-mobile-tabs"
      >
        <TabsList className="w-full">
          <TabsTrigger value="edit">Editar contenido</TabsTrigger>
          <TabsTrigger value="preview">Vista previa</TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="editor-layout">
        <div
          className={`editor-fields ${mobileView === "preview" ? "mobile-preview" : ""}`}
        >
          <nav className="editor-steps" aria-label="Pasos de la cotización">
            {["Cliente", "Conceptos", "Diseño", "Revisión"].map((label, i) => (
              <button
                key={label}
                onClick={() => setStep(i + 1)}
                aria-current={step === i + 1 ? "step" : undefined}
                className={step === i + 1 ? "active" : ""}
              >
                <span>{i + 1}</span>
                {label}
              </button>
            ))}
          </nav>
          <ViewMotion id={`editor-step-${step}`}>
            <fieldset disabled={busy} className="editor-fieldset">
              {step === 1 ? (
                <>
                  <section className="editor-section title-field">
                    <div className="field">
                      <label htmlFor="quote-title">
                        Nombre de tu propuesta{" "}
                        <span className="required-mark">*</span>
                      </label>
                      <input
                        id="quote-title"
                        value={input.title}
                        onChange={(e) =>
                          change({ ...input, title: e.target.value })
                        }
                        placeholder="Ej. Identidad visual para Café Aurora"
                        maxLength={160}
                      />
                    </div>
                  </section>
                  <CustomerFields
                    customer={input.customer}
                    onChange={(customer) => change({ ...input, customer })}
                  />
                </>
              ) : step === 2 ? (
                <ItemFields
                  items={input.items}
                  onChange={(items) => change({ ...input, items })}
                />
              ) : step === 3 ? (
                <DesignFields value={input} onChange={change} />
              ) : (
                <ReviewFields
                  value={input}
                  onChange={change}
                  onStep={setStep}
                />
              )}
            </fieldset>
          </ViewMotion>
          {error && (
            <p className="form-error editor-error" role="alert">
              {error}
            </p>
          )}
          <div className="editor-step-footer">
            {step > 1 ? (
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setStep(step - 1)}
              >
                Anterior
              </button>
            ) : (
              <span>MXN · IVA {input.tax_rate}%</span>
            )}
            <button
              className="btn btn-primary btn-sm"
              disabled={busy}
              onClick={step < 4 ? next : () => void persist(true)}
            >
              {step < 4 ? "Continuar" : "Guardar y compartir"}
            </button>
          </div>
        </div>
        <aside
          className={`editor-preview-panel ${mobileView === "preview" ? "mobile-show" : ""}`}
        >
          <div className="editor-preview-heading">
            <span>VISTA PREVIA</span>
            <span>{templateById(input.template_id).name}</span>
          </div>
          <div className="editor-preview-paper">
            <QuoteDocument
              previewRows={5}
              quote={input}
              business={workspace.business ?? SAMPLE_BUSINESS}
              number={current?.number ?? "Tu próximo folio"}
              createdAt={current?.created_at ?? new Date().toISOString()}
            />
          </div>
          <div className="editor-live-total">
            <span>Tu propuesta, hasta ahora</span>
            <strong>
              {money(totals.total)} <small>MXN</small>
            </strong>
          </div>
          <p className="preview-caption">
            Cada detalle se refleja en tu documento y en su PDF.
          </p>
        </aside>
      </div>
    </>
  );
}
