"use client";
import { Check } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { BRAND_COLORS, DOCUMENT_FONTS } from "@/lib/domain/design";
import type { QuoteDesign } from "@/types/domain";
export function AppearanceFields({
  value,
  onChange,
}: {
  value: QuoteDesign;
  onChange: (design: QuoteDesign) => void;
}) {
  return (
    <>
      <div className="appearance-fields">
        <fieldset className="brand-palette">
          <legend>Color de tu marca</legend>
          <div className="brand-swatches">
            {BRAND_COLORS.map(({ hex, name }) => (
              <button
                key={hex}
                type="button"
                title={name}
                aria-label={name}
                aria-pressed={value.color.toLowerCase() === hex.toLowerCase()}
                style={{ background: hex }}
                onClick={() => onChange({ ...value, color: hex })}
              >
                {value.color.toLowerCase() === hex.toLowerCase() && (
                  <Check size={14} />
                )}
              </button>
            ))}
          </div>
          <label className="custom-color">
            Personalizado
            <input
              type="color"
              value={value.color}
              onChange={(e) => onChange({ ...value, color: e.target.value })}
            />
            <span>{value.color.toUpperCase()}</span>
          </label>
        </fieldset>
        <div className="field">
          <label htmlFor="quote-font">Tipografía</label>
          <select
            id="quote-font"
            value={value.font}
            onChange={(event) => {
              const font = DOCUMENT_FONTS.find(
                (f) => f.id === event.target.value,
              );
              if (font) onChange({ ...value, font: font.id });
            }}
          >
            {DOCUMENT_FONTS.map((font) => (
              <option key={font.id} value={font.id}>
                {font.label}
              </option>
            ))}
          </select>
          <p
            className="font-sample"
            style={{
              fontFamily: DOCUMENT_FONTS.find((f) => f.id === value.font)
                ?.family,
            }}
          >
            Tu negocio. Tu próxima propuesta.
          </p>
        </div>
      </div>
      <div className="design-switches">
        {[
          { key: "show_logo" as const, label: "Mostrar el logotipo" },
          { key: "show_notes" as const, label: "Mostrar notas" },
          { key: "show_terms" as const, label: "Mostrar condiciones" },
        ].map((item) => (
          <div key={item.key}>
            <label htmlFor={item.key}>{item.label}</label>
            <Switch
              id={item.key}
              checked={value[item.key]}
              onCheckedChange={(checked) =>
                onChange({ ...value, [item.key]: checked })
              }
            />
          </div>
        ))}
      </div>
    </>
  );
}
