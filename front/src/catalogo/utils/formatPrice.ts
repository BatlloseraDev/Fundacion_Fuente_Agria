export function formatPrice(value: string | number): string {
  const numericValue =
    typeof value === "number" ? value : Number(value.replace(",", ".").replace(/[^\d.-]/g, ""));

  if (!Number.isFinite(numericValue)) {
    return String(value);
  }

  return `${numericValue.toFixed(2).replace(".", ",")}€`;
}
