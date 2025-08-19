import React from 'react';
import { 
  Box, Typography, Button, Dialog, DialogTitle, DialogContent, 
  DialogActions, TextField, IconButton, Table, TableHead, 
  TableRow, TableCell, TableBody 
} from '@mui/material';
import { EditIcon, DeleteIcon } from './Icons';
import { ExpenseRow } from '../types';
import { formatNairaExpense } from '../utils/format';

interface Props {
  onExpenseDelete: (term: 'first' | 'second' | 'third', id: number) => void;
  expensesTabRows: { first: ExpenseRow[]; second: ExpenseRow[]; third: ExpenseRow[] };
  editingExpenseCell: { term: string; id: number; field: string } | null;
  editExpenseRow: Partial<ExpenseRow>;
  onExpenseEdit: (term: string, id: number, field: string) => void;
  onExpenseChange: (field: string, value: string) => void;
  onExpenseSave: (term: 'first' | 'second' | 'third') => void;
  onExpenseCancel: () => void;
  addExpenseDialog: { open: boolean; term: string | null };
  newExpense: { CATEGORY: string; AMOUNT: string; NOTE: string };
  onOpenAddExpense: (term: 'first' | 'second' | 'third') => void;
  onCloseAddExpense: () => void;
  onAddExpenseSubmit: () => void;
  onNewExpenseChange: (field: 'CATEGORY' | 'AMOUNT' | 'NOTE', value: string) => void;
}

export default function Expenses({
  expensesTabRows,
  editingExpenseCell,
  editExpenseRow,
  onExpenseEdit,
  onExpenseChange,
  onExpenseSave,
  onExpenseCancel,
  addExpenseDialog,
  newExpense,
  onOpenAddExpense,
  onCloseAddExpense,
  onAddExpenseSubmit,
  onNewExpenseChange,
  onExpenseDelete
}: Props) {
  const [deleteDialog, setDeleteDialog] = React.useState<{open: boolean, term: string | null, id: number | null}>({open: false, term: null, id: null});
  const render = (term: 'first' | 'second' | 'third', title: string) => (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', mt: term === 'first' ? 0 : 4, mb: 1 }}>
        <Typography variant="h6" sx={{ mr: 2 }}>{title}</Typography>
        <Button variant="contained" size="small" onClick={() => onOpenAddExpense(term)}>Add Expense</Button>
      </Box>
      <div className="table-wrapper">
        <Table>
        <TableHead>
          <TableRow>
            <TableCell>Category</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Note</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {expensesTabRows[term].map((row: ExpenseRow) => {
            const isEditing = editingExpenseCell?.term === term && editingExpenseCell?.id === row.id;
            const field = editingExpenseCell?.field;
            return (
              <TableRow key={row.id}>
                <TableCell>
                  {isEditing && field === 'CATEGORY' ? (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TextField 
                        size="small" 
                        value={editExpenseRow.CATEGORY || ''} 
                        onChange={e => onExpenseChange("CATEGORY", e.target.value)} 
                        sx={{ width: 220 }} 
                        autoFocus 
                      />
                      <Box sx={{ ml: 1, display: 'flex', gap: 1 }}>
                        <Button size="small" variant="contained" color="success" onClick={() => onExpenseSave(term)}>
                          Save
                        </Button>
                        <Button size="small" variant="outlined" color="inherit" onClick={onExpenseCancel}>
                          Cancel
                        </Button>
                      </Box>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <span>{row.CATEGORY}</span>
                      <IconButton size="small" sx={{ ml: 1 }} onClick={() => onExpenseEdit(term, row.id, 'CATEGORY')}>
                        <EditIcon />
                      </IconButton>
                    </Box>
                  )}
                </TableCell>
                <TableCell>
                  {isEditing && field === 'AMOUNT' ? (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TextField 
                        size="small" 
                        value={editExpenseRow.AMOUNT?.toString() || ''} 
                        onChange={e => onExpenseChange("AMOUNT", e.target.value)} 
                        sx={{ width: 120 }} 
                        autoFocus 
                      />
                      <Box sx={{ ml: 1, display: 'flex', gap: 1 }}>
                        <Button size="small" variant="contained" color="success" onClick={() => onExpenseSave(term)}>
                          Save
                        </Button>
                        <Button size="small" variant="outlined" color="inherit" onClick={onExpenseCancel}>
                          Cancel
                        </Button>
                      </Box>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <span>{formatNairaExpense(row.AMOUNT)}</span>
                      <IconButton size="small" sx={{ ml: 1 }} onClick={() => onExpenseEdit(term, row.id, 'AMOUNT')}>
                        <EditIcon />
                      </IconButton>
                    </Box>
                  )}
                </TableCell>
                <TableCell>
                  {isEditing && field === 'NOTE' ? (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TextField 
                        size="small" 
                        value={editExpenseRow.NOTE || ''} 
                        onChange={e => onExpenseChange("NOTE", e.target.value)} 
                        sx={{ width: 220 }} 
                        autoFocus 
                      />
                      <Box sx={{ ml: 1, display: 'flex', gap: 1 }}>
                        <Button size="small" variant="contained" color="success" onClick={() => onExpenseSave(term)}>
                          Save
                        </Button>
                        <Button size="small" variant="outlined" color="inherit" onClick={onExpenseCancel}>
                          Cancel
                        </Button>
                      </Box>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <span>{row.NOTE || ''}</span>
                      <IconButton size="small" sx={{ ml: 1 }} onClick={() => onExpenseEdit(term, row.id, 'NOTE')}>
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" color="error" sx={{ ml: 1 }} onClick={() => setDeleteDialog({open: true, term, id: row.id})} aria-label="Delete">
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({open: false, term: null, id: null})}>
        <DialogTitle>Delete Expense</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this expense? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({open: false, term: null, id: null})}>Cancel</Button>
          <Button color="error" variant="contained" onClick={() => {
            if (deleteDialog.term && deleteDialog.id !== null) {
              onExpenseDelete(deleteDialog.term as 'first' | 'second' | 'third', deleteDialog.id);
            }
            setDeleteDialog({open: false, term: null, id: null});
          }}>Delete</Button>
        </DialogActions>
      </Dialog>
        </TableBody>
        </Table>
      </div>
    </>
  );

  return (
    <Box className="container">
      <Typography variant="h4" gutterBottom>Income & Expenses</Typography>
      {render('first', 'First Term (Sep - Dec)')}
      {render('second', 'Second Term (Jan - Apr)')}
      {render('third', 'Third Term (May - July)')}

      <Dialog open={addExpenseDialog.open} onClose={onCloseAddExpense}>
        <DialogTitle>Add New Expense</DialogTitle>
        <DialogContent>
          <TextField 
            label="Expense Name" 
            value={newExpense.CATEGORY} 
            onChange={e => onNewExpenseChange('CATEGORY', e.target.value)} 
            fullWidth 
            margin="dense" 
            autoFocus 
          />
          <TextField 
            label="Amount" 
            value={newExpense.AMOUNT} 
            onChange={e => onNewExpenseChange('AMOUNT', e.target.value)} 
            fullWidth 
            margin="dense" 
          />
          <TextField 
            label="Note" 
            value={newExpense.NOTE} 
            onChange={e => onNewExpenseChange('NOTE', e.target.value)} 
            fullWidth 
            margin="dense" 
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onCloseAddExpense}>Cancel</Button>
          <Button 
            onClick={onAddExpenseSubmit} 
            variant="contained" 
            disabled={!newExpense.CATEGORY || !newExpense.AMOUNT}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}