export const formatNaira = (v: number | string | null | undefined) => {
  if (v === null || v === undefined || v === '') return '₦0';
  const n = typeof v === 'string' ? Number(v) : v;
  if (Number.isNaN(n)) return '₦0';
  return '₦' + n.toLocaleString();
};

export const formatNairaExpense = formatNaira;

export const csvEscape = (s: string) =>
  `"${(s || '').replace(/"/g, '""')}"`;