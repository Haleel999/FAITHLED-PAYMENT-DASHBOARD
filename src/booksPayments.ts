// helper to compute balance for books/notebooks
export const computeBookBalance = (amount: any, deposit: any) => {
  const a = Number(amount || 0);
  const d = Number(deposit || 0);
  return Math.max(0, a - d);
};
