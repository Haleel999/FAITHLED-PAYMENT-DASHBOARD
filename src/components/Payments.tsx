import React from 'react';
import * as XLSX from 'xlsx';
import { 
  Box, Typography, Card, Button, Snackbar, Dialog, DialogTitle, DialogContent, 
  DialogActions, TextField, IconButton, Table, TableHead, 
  TableRow, TableCell, TableBody, Select, MenuItem, Checkbox, FormControlLabel
} from '@mui/material';
import { EditIcon, EyeIcon, DeleteIcon } from './Icons';
import { Payment, Student, Tuition } from '../types';
import { formatNaira } from '../utils/format';

const CLASS_LIST = ['CRECHE', 'KG 1', 'KG 2', 'NURS 1', 'NURS 2', 'PRY 1', 'PRY 2', 'PRY 3', 'PRY 4', 'PRY 5'] as const;

export default function Payments({
  payments, tuition, debtors, onEdit, students, onDeleteStudent, onResetPayments
}: {
  payments: Payment[];
  tuition: Tuition;
  debtors: Record<string, any[]>;
  onEdit: (payload: Partial<Payment> & { id: number }) => void;
  students: Student[];
  onDeleteStudent: (id: number) => void;
  onResetPayments: () => void;
}) {
  const [classFilter, setClassFilter] = React.useState('');
  const [paymentFilter, setPaymentFilter] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const [editPayment, setEditPayment] = React.useState<Payment | null>(null);
  const [viewStudent, setViewStudent] = React.useState<Student | null>(null);
  const [viewOpen, setViewOpen] = React.useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = React.useState(false);
  const [form, setForm] = React.useState({ 
    amount_paid: '', 
    payment_date: '',
    is_scholarship: false
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState<number | null>(null);

  const filtered = (payments || []).filter(p => {
    if (classFilter && p.class !== classFilter) return false;
    if (paymentFilter && p.status !== paymentFilter) return false;
    if (search && !(p.student_name.toLowerCase().includes(search.toLowerCase()) || p.class.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  });

  const grouped = CLASS_LIST.reduce((acc: any, cls) => { acc[cls] = filtered.filter(p => p.class === cls); return acc; }, {});

  const handleDownloadExcel = () => {
    // Define column headers and styles
    const headers = [
      { title: 'Student', width: 30 },
      { title: 'Class', width: 15 },
      { title: 'Tuition', width: 15 },
      { title: 'Amount Paid', width: 15 },
      { title: 'Balance', width: 15 },
      { title: 'Status', width: 15 },
      { title: 'Date', width: 15 }
    ];
    
    // Create data array with header row first
    const data: any[][] = [
      headers.map(h => h.title)
    ];
    
    // Add data rows
    CLASS_LIST.forEach(cls => {
      if (grouped[cls]?.length > 0) {
        grouped[cls].forEach((s: Payment) => {
          data.push([
            s.student_name,
            s.class,
            formatNaira(s.amount),
            formatNaira(s.amount_paid),
            formatNaira(s.amount - s.amount_paid),
            s.status,
            s.payment_date || ''
          ]);
        });
      }
    });

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(data);
    
    // Set column widths
    const colWidths = headers.map(h => ({ wch: h.width }));
    ws['!cols'] = colWidths;
    
    // Apply header styling
    const headerRange = XLSX.utils.decode_range(ws['!ref'] || 'A1:G1');
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!ws[cellAddress]) continue;
      
      // Create style object for header
      ws[cellAddress].s = {
        font: { 
          bold: true, 
          sz: 14, 
          color: { rgb: "000000" }
        },
        alignment: { 
          horizontal: 'center', 
          vertical: 'center', 
          wrapText: true 
        },
        fill: { 
          fgColor: { rgb: "E5E7EB" } 
        },
        border: {
          top: { style: 'thin', color: { rgb: "000000" } },
          bottom: { style: 'thin', color: { rgb: "000000" } },
          left: { style: 'thin', color: { rgb: "000000" } },
          right: { style: 'thin', color: { rgb: "000000" } }
        }
      };
    }
    
    // Apply styling to all data cells
    const dataRange = XLSX.utils.decode_range(ws['!ref'] || 'A1:G1');
    for (let row = 1; row <= dataRange.e.r; row++) {
      for (let col = dataRange.s.c; col <= dataRange.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        if (!ws[cellAddress]) continue;
        
        // Create style object for data cells
        ws[cellAddress].s = {
          font: { 
            sz: 12 
          },
          alignment: { 
            horizontal: 'left', 
            vertical: 'center', 
            wrapText: true 
          },
          border: {
            top: { style: 'thin', color: { rgb: "CCCCCC" } },
            bottom: { style: 'thin', color: { rgb: "CCCCCC" } },
            left: { style: 'thin', color: { rgb: "CCCCCC" } },
            right: { style: 'thin', color: { rgb: "CCCCCC" } }
          }
        };
      }
    }
    
    // Create workbook and export
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Payments');
    XLSX.writeFile(wb, 'Payments.xlsx');
  };

  const handleOpen = (p: Payment) => {
    setEditPayment(p);
    setForm({ 
      amount_paid: String(p.amount_paid ?? ''), 
      payment_date: p.payment_date || new Date().toISOString().slice(0, 10),
      is_scholarship: p.is_scholarship || false
    });
    setOpen(true);
  };

  const handleSubmit = () => {
    if (!editPayment) return;
    
    // If scholarship is checked, mark as fully paid
    const amount_paid = form.is_scholarship 
      ? editPayment.amount
      : Number(form.amount_paid || 0);
    
    onEdit({
      id: editPayment.id,
      amount_paid: amount_paid,
      payment_date: form.payment_date,
      is_scholarship: form.is_scholarship
    });
    
    setOpen(false);
  };

  const handleMarkFullyPaid = () => {
    if (!editPayment) return;
    
    setForm({
      ...form,
      amount_paid: String(editPayment.amount),
      is_scholarship: false
    });
  };

  const handleResetPayments = () => {
    onResetPayments();
    setResetConfirmOpen(false);
  };

  return (
    <Box className="container">
      <Typography variant="h4" gutterBottom>Payments</Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        
        <TextField label="Search" value={search} onChange={e => setSearch(e.target.value)} size="small" />
        <Select
          value={classFilter}
          onChange={e => setClassFilter(e.target.value)}
          displayEmpty
          size="small"
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">All Classes</MenuItem>
          {CLASS_LIST.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
        </Select>
        <Select
          value={paymentFilter}
          onChange={e => setPaymentFilter(e.target.value)}
          displayEmpty
          size="small"
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">All Payment Status</MenuItem>
          {['paid', 'partial', 'unpaid', 'scholarship'].map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
        </Select>
        <Button 
          variant="contained" 
          color="success" 
          onClick={handleDownloadExcel}
          sx={{ fontWeight: 700 }}
        >
          Download Excel
        </Button>

        <Button 
          variant="contained" 
          color="warning" 
          onClick={() => setResetConfirmOpen(true)}
          sx={{ ml: 'auto' }}
        >
          Reset All Payments
        </Button>
      </Box>

      {CLASS_LIST.map(cls => grouped[cls]?.length > 0 && (
        <Box key={cls} sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Typography variant="h6" color="primary">{cls}</Typography>
            <Typography variant="body2" color="secondary" sx={{ fontWeight: 700 }}>
              Debtors: {debtors?.[cls]?.length || 0}
            </Typography>
          </Box>
          <div className="table-wrapper">
            <Table size="small" className="table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 120 }}>Actions</TableCell>
                <TableCell>Student</TableCell>
                <TableCell>Class</TableCell>
                <TableCell>Tuition</TableCell>
                <TableCell>Amount Paid</TableCell>
                <TableCell>Balance</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {grouped[cls].map((s: Payment) => {
                const balance = s.amount - s.amount_paid;
                return (
                  <TableRow key={s.id}>
                    <TableCell>
                      <IconButton size="small" color="primary" onClick={() => handleOpen(s)}><EditIcon /></IconButton>
                      <IconButton size="small" color="secondary" onClick={() => {
                        const stu = students.find(st => st.id === s.student_id) || null;
                        setViewStudent(stu); setViewOpen(true);
                      }}><EyeIcon /></IconButton>
                      <IconButton 
                        size="small" 
                        color="error" 
                        onClick={() => setDeleteDialogOpen(s.student_id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                    <TableCell>{s.student_name}</TableCell>
                    <TableCell>{s.class}</TableCell>
                    <TableCell>{formatNaira(s.amount)}</TableCell>
                    <TableCell>{formatNaira(s.amount_paid)}</TableCell>
                    <TableCell>{formatNaira(balance)}</TableCell>
                    <TableCell>{s.status}</TableCell>
                    <TableCell>{s.payment_date || ''}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
            </Table>
          </div>
        </Box>
      ))}

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Edit Payment</DialogTitle>
        <DialogContent>
          {editPayment && (
            <Box sx={{ mb: 1 }}>
              <Typography variant="h6" sx={{ mb: .5 }}>{editPayment.student_name}</Typography>
              <Typography sx={{ mb: .5 }}>Class: {editPayment.class} — Tuition: {formatNaira(editPayment.amount)}</Typography>
              <Typography sx={{ mb: .5 }}>Balance: {formatNaira(editPayment.amount - editPayment.amount_paid)}</Typography>
            </Box>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TextField fullWidth label="Amount Paid" type="number" margin="dense"
              value={form.amount_paid} 
              onChange={e => setForm({ ...form, amount_paid: e.target.value })} 
              disabled={form.is_scholarship}
            />
            <Button variant="outlined" onClick={handleMarkFullyPaid} sx={{ mt: 1 }}>
              Mark Fully Paid
            </Button>
          </Box>
          <TextField fullWidth label="Payment Date" type="date" margin="dense"
            value={form.payment_date} onChange={e => setForm({ ...form, payment_date: e.target.value })}
            InputLabelProps={{ shrink: true }} />
          <FormControlLabel
            control={
              <Checkbox 
                checked={form.is_scholarship} 
                onChange={e => {
                  const isChecked = e.target.checked;
                  setForm({ 
                    ...form, 
                    is_scholarship: isChecked,
                    amount_paid: isChecked ? String(editPayment?.amount || '') : form.amount_paid
                  });
                }} 
              />
            }
            label="Scholarship"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={viewOpen} onClose={() => setViewOpen(false)}>
        <DialogTitle>Student Info</DialogTitle>
        <DialogContent>
          {viewStudent && (
            <Box sx={{ minWidth: 260 }}>
              <Typography variant="h6">{viewStudent.name}</Typography>
              <Typography>Class: {viewStudent.class}</Typography>
              <Typography>Parent: {viewStudent.parent_name || ''}</Typography>
              <Typography>Phone: {viewStudent.parent_phone || ''}</Typography>
              <Typography>Email: {viewStudent.parent_email || ''}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions><Button onClick={() => setViewOpen(false)}>Close</Button></DialogActions>
      </Dialog>

      <Dialog open={resetConfirmOpen} onClose={() => setResetConfirmOpen(false)}>
        <DialogTitle>Confirm Reset All Payments</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to reset all payments? This will set all amounts paid to zero 
            (except for scholarship students) and mark payments as unpaid.
          </Typography>
          <Typography sx={{ mt: 2, fontWeight: 'bold' }}>
            This action cannot be undone!
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetConfirmOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleResetPayments}>
            Reset All Payments
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen !== null} onClose={() => setDeleteDialogOpen(null)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>Are you sure you want to delete this student and all records?</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(null)}>Cancel</Button>
          <Button 
            color="error" 
            variant="contained" 
            onClick={() => { 
              if (deleteDialogOpen !== null) { 
                onDeleteStudent(deleteDialogOpen); 
                setDeleteDialogOpen(null); 
              } 
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}