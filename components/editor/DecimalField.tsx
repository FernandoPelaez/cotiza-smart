"use client";
import { useState } from "react";
import { normalizeDecimalInput, decimalValue } from "@/lib/domain/numeric";
export function DecimalField({
  id,
  label,
  value,
  onChange,
  precision = 2,
  min = 0,
  max,
  prefix,
  suffix,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  precision?: number;
  min?: number;
  max: number;
  prefix?: string;
  suffix?: string;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const invalid = !Number.isFinite(value) || value < min || value > max;
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className={`decimal-control ${invalid ? "decimal-invalid" : ""}`}>
        {prefix && <span aria-hidden="true">{prefix}</span>}
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          aria-invalid={invalid}
          aria-describedby={invalid ? `${id}-error` : undefined}
          value={draft ?? (Number.isFinite(value) ? String(value) : "")}
          onFocus={(event) => {
            setDraft(Number.isFinite(value) ? String(value) : "");
            event.currentTarget.select();
          }}
          onChange={(event) => {
            const next = normalizeDecimalInput(event.target.value, precision);
            if (next === null) return;
            setDraft(next);
            onChange(decimalValue(next));
          }}
          onBlur={() => setDraft(null)}
        />
        {suffix && <span aria-hidden="true">{suffix}</span>}
      </div>
      {invalid && (
        <small id={`${id}-error`} className="decimal-error">
          Usa un valor entre {min} y {max}.
        </small>
      )}
    </div>
  );
}
