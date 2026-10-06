"use client";
import Link from "next/link";
import {
  MoreHorizontal,
  Pencil,
  Copy,
  Trash2,
  FileText,
  Share2,
  Download,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { usePdfDownload } from "@/hooks/usePdfDownload";
import { useQuoteShare } from "@/hooks/useQuoteShare";
import { ShareModal } from "@/components/quotes/ShareModal";
import { useWorkspace } from "./WorkspaceProvider";
import { quoteStatus } from "@/lib/domain/quotes";
import { SAMPLE_BUSINESS } from "@/lib/demo/seed";
import type { Quote } from "@/types/domain";
export function QuoteActions({
  quote,
  base,
  busy,
  onDelete,
  onDuplicate,
}: {
  quote: Quote;
  base: string;
  busy: boolean;
  onDelete: (quote: Quote) => void;
  onDuplicate: (quote: Quote) => void;
}) {
  const { workspace } = useWorkspace();
  const pdf = usePdfDownload(
    quote,
    quote.business_snapshot ?? workspace.business ?? SAMPLE_BUSINESS,
  );
  const share = useQuoteShare(quote);
  const disabled = busy || pdf.busy || share.busy;
  return (
    <div className="quote-action-group">
      {quote.status === "draft" && (
        <Link
          href={`${base}/editar/${quote.id}`}
          className="row-actions edit-action"
          aria-label={`Editar ${quote.number}`}
          title="Editar cotización"
        >
          <Pencil size={17} />
        </Link>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="row-actions"
            disabled={disabled}
            aria-label={`Acciones de ${quote.number}`}
          >
            <MoreHorizontal size={20} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`${base}/cotizaciones/${quote.id}`}>
              <FileText size={16} />
              Ver cotización
            </Link>
          </DropdownMenuItem>
          {quote.status === "draft" && (
            <DropdownMenuItem asChild>
              <Link href={`${base}/editar/${quote.id}`}>
                <Pencil size={16} />
                Editar cotización
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onSelect={() => onDuplicate(quote)}
            disabled={disabled}
          >
            <Copy size={16} />
            Duplicar
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => void share.prepare()}
            disabled={disabled || quoteStatus(quote) === "expired"}
          >
            <Share2 size={16} />
            Compartir
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => void pdf.download()}
            disabled={disabled}
          >
            <Download size={16} />
            Descargar PDF
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onSelect={() => onDelete(quote)}
            disabled={disabled}
          >
            <Trash2 size={16} />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ShareModal state={share} />
    </div>
  );
}
