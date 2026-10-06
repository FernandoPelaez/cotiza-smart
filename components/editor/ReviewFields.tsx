"use client";
import { CircleCheck, Pencil } from "lucide-react";
import { calculateTotals, money } from "@/lib/domain/money";
import { templateById } from "@/lib/domain/templates";
import type { QuoteInput } from "@/types/domain";
export function ReviewFields({
  value,
  onChange,
  onStep,
}: {
  value: QuoteInput;
  onChange: (value: QuoteInput) => void;
  onStep: (step: number) => void;
}) {
  const totals = calculateTotals(value.items);
  return (
    <section className="editor-section">
      <div className="editor-section-heading">
        <h2>
          <span>04</span>Lista para una buena impresión
        </h2>
      </div>
      <div className="review-summary">
        <div>
          <span>Cliente</span>
          <strong>{value.customer.name}</strong>
          <button
            type="button"
            onClick={() => onStep(1)}
            aria-label="Revisar cliente"
          >
            <Pencil size={14} />
          </button>
        </div>
        <div>
          <span>Conceptos</span>
          <strong>
            {value.items.length} · {money(totals.subtotal)}
          </strong>
          <button
            type="button"
            onClick={() => onStep(2)}
            aria-label="Revisar conceptos"
          >
            <Pencil size={14} />
          </button>
        </div>
        <div>
          <span>Presentación</span>
          <strong>{templateById(value.template_id).name}</strong>
          <button
            type="button"
            onClick={() => onStep(3)}
            aria-label="Revisar diseño"
          >
            <Pencil size={14} />
          </button>
        </div>
        <div>
          <span>IVA 16%</span>
          <strong>{money(totals.tax)}</strong>
        </div>
        <div className="review-total">
          <span>Total MXN</span>
          <strong>{money(totals.total)}</strong>
          <CircleCheck size={19} />
        </div>
      </div>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="quote-validity">Válida hasta</label>
          <input
            id="quote-validity"
            type="date"
            value={value.valid_until}
            onChange={(e) =>
              onChange({ ...value, valid_until: e.target.value })
            }
            required
          />
        </div>
        <div className="review-tax-note">
          MXN · IVA del 16%
          <small>Calculado sobre la suma de tus conceptos.</small>
        </div>
        <div className="field full-width">
          <label htmlFor="quote-notes">Notas para tu cliente</label>
          <textarea
            id="quote-notes"
            value={value.notes}
            maxLength={2000}
            onChange={(e) => onChange({ ...value, notes: e.target.value })}
          />
        </div>
        <div className="field full-width">
          <label htmlFor="quote-terms">Condiciones</label>
          <textarea
            id="quote-terms"
            value={value.terms}
            maxLength={3000}
            onChange={(e) => onChange({ ...value, terms: e.target.value })}
          />
        </div>
      </div>
    </section>
  );
}
