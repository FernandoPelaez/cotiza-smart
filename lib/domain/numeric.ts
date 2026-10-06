export function normalizeDecimalInput(
  raw: string,
  precision: number,
): string | null {
  const value = raw.replace(/,/g, ".");
  if (!new RegExp(`^\\d*(?:\\.\\d{0,${precision}})?$`).test(value)) return null;
  return value.replace(/^0+(?=\d)/, "");
}
export function decimalValue(value: string): number {
  return value === "" || value === "." ? Number.NaN : Number(value);
}
