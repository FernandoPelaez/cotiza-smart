"use client";
import { useRef, useState, useSyncExternalStore } from "react";
import { toast } from "@/lib/services/feedback";
import { useWorkspace } from "@/components/workspace/WorkspaceProvider";
import { EMPTY_BUSINESS } from "@/lib/domain/business";
import { createBusinessDraft } from "@/lib/services/business-draft";
import { businessSchema } from "@/lib/schemas/quote";
import type { Business } from "@/types/domain";
export function useBusinessForm(onboarding: boolean, onComplete?: () => void) {
  const { workspace, saveBusiness } = useWorkspace();
  const [draft] = useState(() =>
    createBusinessDraft(
      workspace.business ?? { ...EMPTY_BUSINESS, email: workspace.user.email },
      workspace.user.id,
    ),
  );
  const { value, step } = useSyncExternalStore(
    draft.subscribe,
    draft.read,
    draft.serverSnapshot,
  );
  const setStep = (next: number) =>
    draft.update({ ...draft.read(), step: next });
  const setValue = (update: (value: Business) => Business) =>
    draft.update({ ...draft.read(), value: update(draft.read().value) });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const upload = useRef<HTMLInputElement>(null);
  function field<K extends keyof Business>(key: K, next: Business[K]) {
    setValue((previous) => ({ ...previous, [key]: next }));
    setError("");
  }
  async function fileChanged(file?: File) {
    if (!file) return;
    if (
      !["image/png", "image/jpeg", "image/webp"].includes(file.type) ||
      file.size > 2 * 1024 * 1024
    ) {
      setError("Elige una imagen PNG, JPG o WebP de hasta 2 MB.");
      return;
    }
    setLoading(true);
    try {
      if (workspace.mode === "demo") {
        if (file.size > 300000)
          throw new Error(
            "Para la demostración local, elige un logo de hasta 300 KB.",
          );
        const data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () =>
            typeof reader.result === "string"
              ? resolve(reader.result)
              : reject(new Error("No se pudo leer el archivo."));
          reader.onerror = () =>
            reject(new Error("No se pudo leer el archivo."));
          reader.readAsDataURL(file);
        });
        field("logo_url", data);
      } else {
        const form = new FormData();
        form.set("file", file);
        const response = await fetch("/api/logo", {
          method: "POST",
          body: form,
        });
        const result: unknown = await response.json();
        const parsed = (await import("zod")).z
          .object({ url: (await import("zod")).z.string().url() })
          .safeParse(result);
        if (!response.ok || !parsed.success)
          throw new Error("No se pudo subir el logotipo.");
        field("logo_url", parsed.data.url);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo subir el logo.");
    } finally {
      setLoading(false);
    }
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step === 1) {
      if (value.name.trim().length < 2) {
        setError("Escribe el nombre de tu negocio.");
        return;
      }
      setStep(2);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = businessSchema.safeParse(value);
      if (!result.success) throw new Error(result.error.issues[0].message);
      await saveBusiness(result.data);
      toast.success(
        onboarding
          ? "Tu espacio está listo. Vamos a crear."
          : "Datos de tu negocio guardados.",
      );
      draft.clear();
      onComplete?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar.");
    } finally {
      setLoading(false);
    }
  }
  return {
    value,
    step,
    setStep,
    loading,
    error,
    upload,
    field,
    fileChanged,
    submit,
  };
}
