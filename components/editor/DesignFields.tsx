"use client";
import type { QuoteInput } from "@/types/domain";
import { AppearanceFields } from "./AppearanceFields";
import { TemplatePicker } from "./TemplatePicker";
export function DesignFields({
  value,
  onChange,
}: {
  value: QuoteInput;
  onChange: (value: QuoteInput) => void;
}) {
  return (
    <section className="editor-section">
      <div className="editor-section-heading">
        <h2>
          <span>03</span>Una propuesta con tu identidad
        </h2>
      </div>
      <TemplatePicker value={value} onChange={onChange} />
      <AppearanceFields
        value={value.design}
        onChange={(design) => onChange({ ...value, design })}
      />
    </section>
  );
}
