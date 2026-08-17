export function formatCurrencyInput(input: string): string {
  const digits = input.replace(/\D/g, '').slice(0, 8);
  if (!digits) return '';
  return (Number(digits) / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  });
}

export function formatCurrencyValue(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') return '';
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return '';
  return numericValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  });
}

export function parseCurrencyInput(input: string): number {
  const digits = input.replace(/\D/g, '');
  return digits ? Number(digits) / 100 : 0;
}
