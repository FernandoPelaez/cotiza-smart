import type { Quote } from "@/types/domain";
import { quoteStatus } from "./quotes";

function searchable(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLocaleLowerCase("es")
    .trim();
}

export function filterQuotes(
  quotes: Quote[],
  filter: string,
  search: string,
  now = new Date(),
) {
  const query = searchable(search);
  return quotes.filter(
    (quote) =>
      (filter === "all" || quoteStatus(quote, now) === filter) &&
      searchable(
        `${quote.title} ${quote.customer.name} ${quote.number}`,
      ).includes(query),
  );
}
