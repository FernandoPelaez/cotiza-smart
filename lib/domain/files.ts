export function quoteFilename(number: string, business: string) {
  const slug = business
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 70);
  const folio = number.replace(/[^a-zA-Z0-9-]/g, "");
  return `${folio}${slug ? `-${slug}` : ""}.pdf`;
}
