import React from 'react';
import { Box, Typography, Card, Button, Snackbar } from '@mui/material';

export default function Debtors({ debtors }: { debtors: Record<string, { name: string, debt: number }[]> }) {
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const generateText = () => {
    return Object.entries(debtors)
      .filter(([_, list]) => list.length > 0)
      .map(([cls, list]) => {
        const total = list.reduce((s, x) => s + x.debt, 0);
        const lines = list.map(x => `${x.name}: N${x.debt.toLocaleString()}`).join('\n');
        return `${cls.toUpperCase()}\nTotal Outstanding: N${total.toLocaleString()}\n${lines}`;
      }).join('\n\n');
  };
  const copy = async () => {
    await navigator.clipboard.writeText(generateText());
    setSnackbarOpen(true);
  };

  const totalDebtors = Object.values(debtors).reduce((a, arr) => a + arr.length, 0);

  return (
    <Box className="container">
      <Typography variant="h4" gutterBottom>Debtor Management</Typography>
      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 700 }}>Total Debtors: {totalDebtors}</Typography>
      <Card className="card" sx={{ p: 2, mb: 2 }}>
        {Object.entries(debtors).filter(([_, l]) => l.length > 0).map(([cls, list]) => {
          const total = list.reduce((s, x) => s + x.debt, 0);
          return (
            <div key={cls} style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 18, fontWeight: 800, textDecoration: 'underline', marginBottom: 6 }}>
                {cls.toUpperCase()} (Total Outstanding: N{total.toLocaleString()})
              </div>
              <div style={{ whiteSpace: 'pre-line', fontSize: 15, marginLeft: 8 }}>
                {list.map(x => `${x.name}: N${x.debt.toLocaleString()}`).join('\n')}
              </div>
            </div>
          );
        })}
      </Card>
      <Button variant="contained" color="secondary" onClick={copy}>Copy Debtor List</Button>
      <Snackbar open={snackbarOpen} autoHideDuration={2000} onClose={() => setSnackbarOpen(false)} message="Debtor list copied!" />
    </Box>
  );
}