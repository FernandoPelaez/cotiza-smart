"use client";
import { useState } from "react";
import { DecimalField } from "./DecimalField";
import { createId } from "@/lib/domain/id";
import { Plus, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import type { QuoteItem } from "@/types/domain";
import { money, lineTotal } from "@/lib/domain/money";
export function ItemFields({
  items,
  onChange,
}: {
  items: QuoteItem[];
  onChange: (value: QuoteItem[]) => void;
}) {
  const [requestedPage, setPage] = useState(0);
  const pageSize = 3;
  const pages = Math.ceil(items.length / pageSize);
  const page = Math.min(requestedPage, Math.max(0, pages - 1));
  const start = page * pageSize;
  function update(id: string, value: Partial<QuoteItem>) {
    onChange(
      items.map((item) => (item.id === id ? { ...item, ...value } : item)),
    );
  }
  return (
    <section className="editor-section">
      <div className="editor-section-heading">
        <h2>
          <span>02</span>Lo que ofreces
        </h2>
        <span className="text-xs muted">
          {items.length} {items.length === 1 ? "concepto" : "conceptos"}
        </span>
      </div>
      <div className="items-list">
        {items.slice(start, start + pageSize).map((item, localIndex) => {
          const index = start + localIndex;
          return (
            <div className="editor-item" key={item.id}>
              <div className="item-first-row">
                <div className="field flex-1">
                  <label htmlFor={`item-description-${index}`}>
                    Concepto {index + 1}
                  </label>
                  <input
                    id={`item-description-${index}`}
                    value={item.description}
                    placeholder="Describe tu producto o servicio"
                    onChange={(e) =>
                      update(item.id, { description: e.target.value })
                    }
                    maxLength={500}
                    required
                  />
                </div>
                <button
                  type="button"
                  className="icon-btn"
                  aria-label={`Eliminar concepto ${index + 1}`}
                  disabled={items.length === 1}
                  onClick={() =>
                    onChange(items.filter((i) => i.id !== item.id))
                  }
                >
                  <Trash2 size={15} />
                </button>
              </div>
              <div className="item-amount-fields">
                <div className="field item-kind">
                  <label htmlFor={`item-kind-${index}`}>Tipo</label>
                  <Select
                    value={item.kind}
                    onValueChange={(kind) => {
                      if (kind === "product" || kind === "service")
                        update(item.id, { kind });
                    }}
                  >
                    <SelectTrigger
                      id={`item-kind-${index}`}
                      className="h-10! w-full! shadow-none!"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="service">Servicio</SelectItem>
                      <SelectItem value="product">Producto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DecimalField
                  id={`item-quantity-${index}`}
                  label="Cantidad"
                  value={item.quantity}
                  precision={3}
                  min={0.001}
                  max={100000}
                  onChange={(quantity) => update(item.id, { quantity })}
                />
                <DecimalField
                  id={`item-price-${index}`}
                  label="Precio MXN"
                  prefix="$"
                  value={item.unit_price}
                  max={10000000}
                  onChange={(unit_price) => update(item.id, { unit_price })}
                />
              </div>
              <div className="item-detail-row">
                <div className="field item-unit">
                  <label htmlFor={`item-unit-${index}`}>Unidad</label>
                  <input
                    id={`item-unit-${index}`}
                    value={item.unit}
                    maxLength={30}
                    placeholder="pieza, hora, proyecto…"
                    onChange={(e) => update(item.id, { unit: e.target.value })}
                  />
                </div>
                <span>
                  Importe <strong>{money(lineTotal(item))}</strong>
                </span>
              </div>
            </div>
          );
        })}
      </div>
      {pages > 1 && (
        <nav className="item-pagination" aria-label="Páginas de conceptos">
          <button
            type="button"
            className="icon-btn"
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
            aria-label="Conceptos anteriores"
          >
            <ChevronLeft size={18} />
          </button>
          <span aria-live="polite">
            {start + 1}–{Math.min(start + pageSize, items.length)} de{" "}
            {items.length} conceptos
          </span>
          <button
            type="button"
            className="icon-btn"
            disabled={page === pages - 1}
            onClick={() => setPage(page + 1)}
            aria-label="Conceptos siguientes"
          >
            <ChevronRight size={18} />
          </button>
        </nav>
      )}
      <button
        className="btn btn-secondary btn-sm add-item"
        type="button"
        disabled={items.length >= 100}
        onClick={() => {
          setPage(Math.floor(items.length / pageSize));
          onChange([
            ...items,
            {
              id: createId(),
              description: "",
              kind: "service",
              quantity: 1,
              unit: "servicio",
              unit_price: 0,
              discount: 0,
            },
          ]);
        }}
      >
        <Plus size={15} />
        Agregar concepto
      </button>
    </section>
  );
}
