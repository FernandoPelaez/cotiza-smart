
"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/services/feedback";
import { createId } from "@/lib/domain/id";
import { DEFAULT_TAX_RATE } from "@/lib/domain/config";
import { blankQuote, effectivePlan, canUseTemplate } from "@/lib/domain/quotes";
import { quoteSchema } from "@/lib/schemas/quote";
import { templateById } from "@/lib/domain/templates";
import { useWorkspace } from "@/components/workspace/WorkspaceProvider";
import { calculateTotals } from "@/lib/domain/money";
import type { Quote, QuoteInput } from "@/types/domain";
export function useQuoteDraft(quote?: Quote, template?: string) {
  const { workspace, base, save, setLimitOpen } = useWorkspace();
  const router = useRouter();
  const [input, setInput] = useState<QuoteInput>(() => {
    if (quote)
      return {
        ...quote,
        tax_rate: DEFAULT_TAX_RATE,
        items: quote.items.map((item) => ({ ...item, discount: 0 })),
      };
    const next = blankQuote();
    const selected = templateById(template ?? "essential");
    if (canUseTemplate(effectivePlan(workspace.subscription), selected.plan))
      return {
        ...next,
        template_id: selected.id,
        design: {
          ...next.design,
          color: selected.defaultColor,
          font: selected.defaultFont,
        },
      };
    return next;
  });
  const [current, setCurrent] = useState(quote);
  const [step, setStep] = useState(1);
  const [mobileView, setMobileView] = useState("edit");
  const [busy, setBusy] = useState(false);
  const saving = useRef(false);
  const [error, setError] = useState("");
  const [saveState, setSaveState] = useState(
    quote ? "Guardado" : "Nueva propuesta",
  );
  const [editVersion, setEditVersion] = useState(0);
  const [savedVersion, setSavedVersion] = useState(0);
  const [autoSavePaused, setAutoSavePaused] = useState(false);
  const [requestId] = useState(() => createId());
  const totals = calculateTotals(input.items);
  function change(value: QuoteInput) {
    setInput(value);
    setEditVersion((v) => v + 1);
    setError("");
    setSaveState("Cambios sin guardar");
    setAutoSavePaused(false);
  }
  async function persist(openPreview = false) {
    if (saving.current) return;
    const parsed = quoteSchema.safeParse(input);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      const field = String(parsed.error.issues[0].path[0]);
      setStep(
        ["title", "customer"].includes(field)
          ? 1
          : field === "items"
            ? 2
            : ["design", "template_id"].includes(field)
              ? 3
              : 4,
      );
      setMobileView("edit");
      return;
    }
    saving.current = true;
    setBusy(true);
    setError("");
    try {
      const isThirdFreeQuote =
        !current &&
        effectivePlan(workspace.subscription) === "free" &&
        workspace.creations_used === 2;
      const saved = await save(parsed.data, current, requestId);
      setCurrent(saved);
      setSavedVersion(editVersion);
      setSaveState("Guardado");
      if (!isThirdFreeQuote) {
        toast.success("Tu cotización está guardada.");
      }
      if (isThirdFreeQuote) {
        // Evita la redirección para mostrar el modal al completar el plan Free.
        setLimitOpen(true);
      } else if (openPreview) {
        router.push(`${base}/cotizaciones/${saved.id}`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar.");
      setSaveState("No guardado");
    } finally {
      saving.current = false;
      setBusy(false);
    }
  }
  /** Autoguarda borradores válidos y controla versiones para evitar perder cambios. */
  useEffect(() => {
    if (
      autoSavePaused ||
      !current ||
      editVersion <= savedVersion ||
      busy ||
      current.status !== "draft" ||
      !quoteSchema.safeParse(input).success
    )
      return;
    const timer = setTimeout(async () => {
      if (saving.current) return;
      saving.current = true;
      setBusy(true);
      setSaveState("Guardando…");
      try {
        const result = await save(input, current, requestId);
        setCurrent(result);
        setSavedVersion(editVersion);
        setSaveState("Guardado");
      } catch (e) {
        setError(e instanceof Error ? e.message : "No se pudo autoguardar.");
        setSaveState("No guardado");
        setAutoSavePaused(true);
      } finally {
        saving.current = false;
        setBusy(false);
      }
    }, 1800);
    return () => clearTimeout(timer);
  }, [
    input,
    current,
    editVersion,
    savedVersion,
    busy,
    save,
    requestId,
    autoSavePaused,
  ]);
  function goToStep(target: number) {
    if (target > step) {
      const schema =
        target === 2
          ? quoteSchema.pick({ title: true, customer: true })
          : target === 3
            ? quoteSchema.pick({ title: true, customer: true, items: true })
            : quoteSchema;
      const parsed = schema.safeParse(input);
      if (!parsed.success) {
        setError(parsed.error.issues[0].message);
        return;
      }
    }
    setError("");
    setStep(Math.max(1, Math.min(4, target)));
  }
  function next() {
    goToStep(step + 1);
  }
  return {
    input,
    current,
    step,
    setStep: goToStep,
    mobileView,
    setMobileView,
    busy,
    error,
    saveState,
    totals,
    change,
    persist,
    next,
  };
}

