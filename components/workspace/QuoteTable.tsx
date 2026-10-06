"use client";
import Link from "next/link";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { StatusBadge } from "./StatusBadge";
import { QuoteActions } from "./QuoteActions";
import { quoteStatus, dateLabel } from "@/lib/domain/quotes";
import { calculateDocumentTotals, money } from "@/lib/domain/money";
import type { Quote } from "@/types/domain";
export function QuoteTable({
  quotes,
  base,
  busy,
  onDelete,
  onDuplicate,
}: {
  quotes: Quote[];
  base: string;
  busy: boolean;
  onDelete: (quote: Quote) => void;
  onDuplicate: (quote: Quote) => void;
}) {
  const total = (quote: Quote) =>
    money(calculateDocumentTotals(quote.items, quote.tax_rate).total);
  const actions = (quote: Quote) => (
    <QuoteActions
      quote={quote}
      base={base}
      busy={busy}
      onDelete={onDelete}
      onDuplicate={onDuplicate}
    />
  );
  return (
    <>
      <div className="quotes-list quotes-desktop">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[34%]">Propuesta</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Total MXN</TableHead>
              <TableHead className="hidden xl:table-cell text-right">
                Actualizada
              </TableHead>
              <TableHead className="w-20">
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quotes.map((quote) => (
              <TableRow key={quote.id}>
                <TableCell>
                  <Link
                    href={`${base}/cotizaciones/${quote.id}`}
                    className="quote-row-title"
                  >
                    {quote.title}
                  </Link>
                  <span className="quote-row-meta">{quote.number}</span>
                </TableCell>
                <TableCell>
                  <span className="customer-name">{quote.customer.name}</span>
                </TableCell>
                <TableCell>
                  <StatusBadge status={quoteStatus(quote)} />
                </TableCell>
                <TableCell className="text-right font-semibold quote-row-amount">
                  {total(quote)}
                </TableCell>
                <TableCell className="hidden xl:table-cell text-right muted text-xs!">
                  {dateLabel(quote.updated_at)}
                </TableCell>
                <TableCell>{actions(quote)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="quotes-mobile">
        {quotes.map((quote) => (
          <article key={quote.id} className="quote-mobile-row">
            <div className="quote-mobile-heading">
              <span>{quote.number}</span>
              <StatusBadge status={quoteStatus(quote)} />
            </div>
            <Link
              className="quote-mobile-title"
              href={`${base}/cotizaciones/${quote.id}`}
            >
              {quote.title}
            </Link>
            <p>{quote.customer.name}</p>
            <div className="quote-mobile-bottom">
              <div>
                <span>Total MXN</span>
                <strong>{total(quote)}</strong>
              </div>
              {actions(quote)}
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
