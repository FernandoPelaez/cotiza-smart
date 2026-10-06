"use client";
import { UserPlus } from "lucide-react";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@/components/ui/combobox";
import { useWorkspace } from "@/components/workspace/WorkspaceProvider";
import type { Customer } from "@/types/domain";
export function CustomerFields({
  customer,
  onChange,
}: {
  customer: Customer;
  onChange: (value: Customer) => void;
}) {
  const { workspace } = useWorkspace();
  const labels = workspace.customers.map(
    (c) => `${c.name} · ${c.email || c.phone || c.id.slice(0, 8)}`,
  );
  return (
    <section className="editor-section">
      <div className="editor-section-heading">
        <h2>
          <span>01</span>Tu cliente
        </h2>
        <button
          type="button"
          className="text-link text-xs! flex items-center gap-1"
          onClick={() =>
            onChange({
              id: "",
              name: "",
              email: "",
              phone: "",
              address: "",
              rfc: "",
            })
          }
        >
          <UserPlus size={14} />
          Nuevo cliente
        </button>
      </div>
      {workspace.customers.length > 0 && (
        <div className="mb-4">
          <Combobox
            items={labels}
            value={null}
            onValueChange={(name) => {
              const selected =
                workspace.customers[labels.indexOf(String(name))];
              if (selected) onChange(selected);
            }}
          >
            <ComboboxInput
              aria-label="Buscar un cliente guardado"
              placeholder="Buscar un cliente guardado…"
              className="h-10! bg-white!"
            />
            <ComboboxContent>
              <ComboboxEmpty>No encontramos ese cliente.</ComboboxEmpty>
              <ComboboxList>
                {(name: string) => (
                  <ComboboxItem key={name} value={name}>
                    {name}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>
      )}
      <div className="form-grid">
        <div className="field full-width">
          <label htmlFor="customer-name">
            Nombre del cliente <span className="required-mark">*</span>
          </label>
          <input
            id="customer-name"
            value={customer.name}
            onChange={(e) => onChange({ ...customer, name: e.target.value })}
            placeholder="Persona o empresa"
            maxLength={160}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="customer-email">Correo</label>
          <input
            id="customer-email"
            type="email"
            value={customer.email}
            onChange={(e) => onChange({ ...customer, email: e.target.value })}
            placeholder="cliente@correo.com"
            maxLength={254}
          />
        </div>
        <div className="field">
          <label htmlFor="customer-phone">Teléfono</label>
          <input
            id="customer-phone"
            type="tel"
            value={customer.phone}
            onChange={(e) => onChange({ ...customer, phone: e.target.value })}
            placeholder="Para compartir por WhatsApp"
            maxLength={30}
          />
        </div>
      </div>
      <details className="customer-details">
        <summary>Dirección y RFC opcionales</summary>
        <div className="form-grid mt-4">
          <div className="field">
            <label htmlFor="customer-address">Dirección</label>
            <input
              id="customer-address"
              value={customer.address}
              onChange={(e) =>
                onChange({ ...customer, address: e.target.value })
              }
              maxLength={400}
            />
          </div>
          <div className="field">
            <label htmlFor="customer-rfc">RFC</label>
            <input
              id="customer-rfc"
              value={customer.rfc}
              onChange={(e) =>
                onChange({ ...customer, rfc: e.target.value.toUpperCase() })
              }
              maxLength={20}
            />
          </div>
        </div>
      </details>
    </section>
  );
}
