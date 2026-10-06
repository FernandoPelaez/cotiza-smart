"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react";

import {
  filterTemplates,
  templateCount,
} from "@/lib/domain/templates";
import {
  SAMPLE_BUSINESS,
  SAMPLE_QUOTE,
} from "@/lib/demo/seed";

import { QuoteDocument } from "@/components/quotes/QuoteDocument";
import { TemplateCatalogMotion } from "./TemplateCatalogMotion";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import type {
  Business,
  QuoteInput,
  TemplateDefinition,
} from "@/types/domain";

import "./catalog.css";

const filters = [
  ["all", "Todas"],
  ["free", "Free"],
  ["pro", "Pro"],
  ["premium", "Premium"],
] as const;

export function TemplateCatalog({
  hrefPrefix = "/register?template=",
  onChoose,
  quote = SAMPLE_QUOTE,
  business = SAMPLE_BUSINESS,
  pageSize = 6,
}: {
  hrefPrefix?: string;
  onChoose?: (template: TemplateDefinition) => void;
  quote?: QuoteInput;
  business?: Business;
  pageSize?: number;
}) {
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [preview, setPreview] =
    useState<TemplateDefinition | null>(null);

  const all = filterTemplates(filter);

  const totalPages = Math.ceil(
    all.length / pageSize,
  );

  const shown = all.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  const example = (
    template: TemplateDefinition,
  ) => ({
    ...quote,

    template_id: template.id,

    design: {
      ...quote.design,
      color: template.defaultColor,
      font: template.defaultFont,
    },
  });

  const choose = (
    template: TemplateDefinition,
  ) => {
    setPreview(null);
    onChoose?.(template);
  };

  const viewKey = `${filter}-${page}`;

  return (
    <div className="template-catalog">
      {/* Filtros */}
      <div className="catalog-filter-row">
        <div
          className="catalog-filters"
          role="group"
          aria-label="Categoría de plantillas"
        >
          {filters.map(([value, label]) => (
            <button
              key={value}
              onClick={() => {
                setFilter(value);
                setPage(1);
              }}
              aria-pressed={filter === value}
            >
              {label}

              <span>
                {templateCount(value)}
              </span>
            </button>
          ))}
        </div>

        <span className="catalog-availability">
          Todas disponibles
        </span>
      </div>

      {/*
       * Animación dedicada exclusivamente
       * al catálogo de plantillas.
       *
       * Incluye grid + paginación para que ambos
       * queden dentro del mismo scope de GSAP.
       */}
      <TemplateCatalogMotion
        viewKey={viewKey}
      >
        <div className="catalog-grid">
          {shown.map((template) => (
            <article
              className="catalog-item"
              key={template.id}
            >
              <button
                className={`catalog-paper-stage catalog-${template.plan}`}
                onClick={() =>
                  setPreview(template)
                }
                aria-label={`Vista previa de ${template.name}`}
              >
                <div className="catalog-paper">
                  <QuoteDocument
                    thumbnail
                    quote={example(template)}
                    business={business}
                  />
                </div>

                <span className="catalog-preview-label">
                  Ampliar vista previa
                </span>
              </button>

              <div className="catalog-caption">
                <h3>{template.name}</h3>

                <span
                  className={`plan-tag plan-${template.plan}`}
                >
                  {template.plan === "free"
                    ? "Free"
                    : template.plan === "pro"
                      ? "Pro"
                      : "Premium"}
                </span>
              </div>

              <p>
                {template.description}
              </p>

              {onChoose ? (
                <button
                  className="catalog-choose"
                  onClick={() =>
                    choose(template)
                  }
                >
                  Elegir plantilla

                  <Check size={15} />
                </button>
              ) : (
                <Link
                  className="catalog-choose"
                  href={`${hrefPrefix}${template.id}`}
                >
                  Crear con esta plantilla

                  <ArrowUpRight
                    size={16}
                  />
                </Link>
              )}
            </article>
          ))}
        </div>

        {/* Paginación */}
        <div className="catalog-pagination">
          <span aria-live="polite">
            {(page - 1) * pageSize + 1}–
            {Math.min(
              page * pageSize,
              all.length,
            )}{" "}
            de {all.length} diseños
          </span>

          <div>
            <button
              className="icon-btn"
              disabled={page === 1}
              onClick={() =>
                setPage((currentPage) =>
                  Math.max(
                    currentPage - 1,
                    1,
                  ),
                )
              }
              aria-label="Plantillas anteriores"
            >
              <ChevronLeft size={18} />
            </button>

            <span>
              Página {page} de{" "}
              {totalPages}
            </span>

            <button
              className="icon-btn"
              disabled={
                page === totalPages
              }
              onClick={() =>
                setPage((currentPage) =>
                  Math.min(
                    currentPage + 1,
                    totalPages,
                  ),
                )
              }
              aria-label="Plantillas siguientes"
            >
              <ChevronRight
                size={18}
              />
            </button>
          </div>
        </div>
      </TemplateCatalogMotion>

      {/* Vista previa ampliada */}
      <Dialog
        open={!!preview}
        onOpenChange={(open) => {
          if (!open) {
            setPreview(null);
          }
        }}
      >
        <DialogContent className="template-preview-modal">
          <DialogHeader>
            <DialogTitle>
              {preview?.name}
            </DialogTitle>

            <DialogDescription>
              {preview?.description}
            </DialogDescription>
          </DialogHeader>

          {preview && (
            <>
              <QuoteDocument
                quote={example(preview)}
                business={business}
              />

              {onChoose ? (
                <button
                  className="btn btn-primary"
                  onClick={() =>
                    choose(preview)
                  }
                >
                  Usar {preview.name}
                </button>
              ) : (
                <Link
                  className="btn btn-primary"
                  href={`${hrefPrefix}${preview.id}`}
                >
                  Crear con esta plantilla

                  <ArrowUpRight
                    size={17}
                  />
                </Link>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
