import { CURRENCY, DEFAULT_TAX_RATE } from "./config";
import type { QuoteItem, QuoteTotals } from "@/types/domain";
export function money(value: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: CURRENCY,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
const divisor = BigInt(10000);
// Un campo numérico incompleto puede ser NaN durante la edición; solo los schemas autorizan guardar.
function scaled(value: number, factor: number, maximum: number) {
  return BigInt(
    Math.round(
      (Number.isFinite(value) ? Math.max(0, Math.min(maximum, value)) : 0) *
        factor,
    ),
  );
}
function roundRatio(numerator: bigint, denominator: bigint) {
  return (numerator + denominator / BigInt(2)) / denominator;
}
function itemCents(item: QuoteItem) {
  return roundRatio(
    scaled(item.quantity, 1000, 100000) *
      scaled(item.unit_price, 100, 10000000),
    BigInt(1000),
  );
}
/**
 * Importes enteros: cantidad tiene tres decimales y porcentajes dos.
 * El redondeo comercial por línea coincide con PostgreSQL numeric, incluso en mitades como 0.575 × $1.
 */
export function calculateDocumentTotals(
  items: QuoteItem[],
  taxRate: number,
): QuoteTotals {
  let subtotal = BigInt(0);
  let discount = BigInt(0);
  for (const item of items) {
    const line = itemCents(item);
    subtotal += line;
    discount += roundRatio(line * scaled(item.discount, 100, 100), divisor);
  }
  const taxable = subtotal - discount;
  const tax = roundRatio(taxable * scaled(taxRate, 100, 100), divisor);
  return {
    subtotal: Number(subtotal) / 100,
    discount: Number(discount) / 100,
    taxable: Number(taxable) / 100,
    tax: Number(tax) / 100,
    total: Number(taxable + tax) / 100,
  };
}
export function documentLineTotal(item: QuoteItem): number {
  const cents = itemCents(item);
  return (
    Number(
      cents - roundRatio(cents * scaled(item.discount, 100, 100), divisor),
    ) / 100
  );
}

/** Nuevas escrituras: IVA 16% sobre partidas sin descuentos; los schemas y SQL exigen el mismo contrato. */
export function calculateTotals(items: QuoteItem[]): QuoteTotals {
  return calculateDocumentTotals(
    items.map((item) => ({ ...item, discount: 0 })),
    DEFAULT_TAX_RATE,
  );
}
export function lineTotal(item: QuoteItem) {
  return Number(itemCents(item)) / 100;
}
