"use client";
import { useState } from "react";
import { PanelsTopLeft } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { TemplateCatalog } from "@/components/templates/TemplateCatalog";
import { TEMPLATES, templateById } from "@/lib/domain/templates";
import { useWorkspace } from "@/components/workspace/WorkspaceProvider";
import type { QuoteInput, TemplateDefinition } from "@/types/domain";
export function TemplatePicker({
  value,
  onChange,
}: {
  value: QuoteInput;
  onChange: (value: QuoteInput) => void;
}) {
  const [open, setOpen] = useState(false);
  const { workspace } = useWorkspace();
  const selected = templateById(value.template_id);
  function choose(template: TemplateDefinition) {
    onChange({
      ...value,
      template_id: template.id,
      design: {
        ...value.design,
        color: template.defaultColor,
        font: template.defaultFont,
      },
    });
    setOpen(false);
  }
  return (
    <>
      <div className="template-selection">
        <div className="field">
          <label htmlFor="quote-template">Composición</label>
          <select
            id="quote-template"
            value={value.template_id}
            onChange={(event) => choose(templateById(event.target.value))}
          >
            {["free", "pro", "premium"].map((plan) => (
              <optgroup
                key={plan}
                label={
                  plan === "free" ? "Free" : plan === "pro" ? "Pro" : "Premium"
                }
              >
                {TEMPLATES.filter((t) => t.plan === plan).map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => setOpen(true)}
        >
          <PanelsTopLeft size={16} />
          Explorar diseños
        </button>
      </div>
      <p className="template-choice-description">{selected.description}</p>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="template-picker-modal">
          <DialogHeader>
            <DialogTitle>Encuentra tu presentación</DialogTitle>
            <DialogDescription>
              Todas las composiciones están disponibles. Elige una y
              personalízala.
            </DialogDescription>
          </DialogHeader>
          <TemplateCatalog
            onChoose={choose}
            quote={value}
            business={workspace.business ?? undefined}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
