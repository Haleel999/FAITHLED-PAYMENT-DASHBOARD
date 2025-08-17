import React from 'react';
import { 
  Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, 
  TextField, IconButton
} from '@mui/material';
import { EditIcon } from './Icons';
import { BookRow, Student } from '../types';
import { formatNaira } from '../utils/format';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format, parseISO } from 'date-fns';

interface Props {
  classList: string[];
  studentsState: Student[];
  booksState: BookRow[];
  booksSearch: string;
  setBooksSearch: (v: string) => void;
  onBookEdit: (row: BookRow, field: string, type: string) => void;
  onBookChange: (field: string, value: any) => void;
  onBookSave: () => void;
  onBookCancel: () => void;
  editingRow: BookRow | null;
  editingField: string | null;
  editBookRow: Partial<BookRow>;
}

const Books: React.FC<Props> = ({
  classList, studentsState, booksState, booksSearch, setBooksSearch,
  onBookEdit, onBookChange, onBookSave, onBookCancel,
  editingRow, editingField, editBookRow
}) => {
  const renderBookRows = (type: string, search = '') => {
    const classOrder: Record<string, number> = Object.fromEntries(classList.map((cls, i) => [cls, i]));
    
    // Create a map of students by ID for quick lookup
    const studentMap = new Map<number, Student>();
    studentsState.forEach(student => studentMap.set(student.id, student));
    
    // Filter eligible students
    let eligibleStudents = studentsState.filter(student => 
      type === 'textbook' || type === 'notebook' ? student.class.toUpperCase() !== 'CRECHE' : true
    );
    
    // Apply search filter
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      eligibleStudents = eligibleStudents.filter(student => 
        student.name.toLowerCase().includes(q)
      );
    }
    
    // Create rows with proper student data
    let rows = eligibleStudents.map(student => {
      const bookRecord = booksState.find(r => 
        r.type === type && 
        r.student_id === student.id
      );
      
      // Always use current student data for name and class
      return bookRecord 
        ? { ...bookRecord, name: student.name, class: student.class }
        : {
            id: -1,
            student_id: student.id,
            name: student.name,
            class: student.class,
            amount: 0,
            deposit: 0,
            date: '',
            note: '',
            type
          };
    });

    // Safe sorting
    rows = rows.sort((a, b) => {
      const ca = classOrder[a.class] ?? 999;
      const cb = classOrder[b.class] ?? 999;
      if (ca !== cb) return ca - cb;
      
      return a.name.localeCompare(b.name);
    });

    return rows.map((row) => {
      const isEditing = editingRow?.student_id === row.student_id && 
                       editingRow?.type === type && 
                       editingField !== null;
      
      const makeCell = (field: string, width = 90) => {
        if (isEditing && editingField === field) {
          if (field === 'date') {
            return (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    value={editBookRow.date ? parseISO(editBookRow.date) : null}
                    onChange={(newValue) => {
                      const dateStr = newValue ? format(newValue, 'yyyy-MM-dd') : '';
                      onBookChange(field, dateStr);
                    }}
                    renderInput={(params) => (
                      <TextField 
                        {...params}
                        size="small" 
                        sx={{ width: 140 }} 
                        autoFocus 
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') onBookSave();
                          if (e.key === 'Escape') onBookCancel();
                        }}
                      />
                    )}
                  />
                </LocalizationProvider>
                <Box sx={{ ml: 1, display: 'flex', gap: 1 }}>
                  <IconButton color="success" size="small" onClick={onBookSave} aria-label="Save">
                    ✓
                  </IconButton>
                  <IconButton color="inherit" size="small" onClick={onBookCancel} aria-label="Cancel">
                    ✕
                  </IconButton>
                </Box>
              </Box>
            );
          }
          
          return (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TextField 
                size="small" 
                value={editBookRow[field as keyof BookRow] || ''} 
                onChange={e => onBookChange(field, e.target.value)} 
                sx={{ width }} 
                autoFocus 
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onBookSave();
                  if (e.key === 'Escape') onBookCancel();
                }}
              />
              <Box sx={{ ml: 1, display: 'flex', gap: 1 }}>
                <IconButton color="success" size="small" onClick={onBookSave} aria-label="Save">
                  ✓
                </IconButton>
                <IconButton color="inherit" size="small" onClick={onBookCancel} aria-label="Cancel">
                  ✕
                </IconButton>
              </Box>
            </Box>
          );
        }
        
        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <span>
              {field === 'amount' || field === 'deposit' 
                ? formatNaira(row[field]) 
                : field === 'date' && row.date
                  ? format(parseISO(row.date), 'dd/MM/yyyy')
                  : row[field as keyof BookRow] || ''}
            </span>
            <IconButton 
              size="small" 
              color="primary" 
              sx={{ ml: 1 }} 
              onClick={() => onBookEdit(row, field, type)} 
              aria-label="Edit"
              disabled={editingRow !== null && editingRow.student_id !== row.student_id}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Box>
        );
      };

      const balance = row.amount - row.deposit;

      return {
        name: row.name,
        class: row.class,
        amount: makeCell('amount'),
        deposit: makeCell('deposit'),
        balance: formatNaira(balance),
        date: makeCell('date', 120),
        note: makeCell('note', 120)
      };
    });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box className="container">
        <Typography variant="h4" gutterBottom>Books & Notebooks Payments</Typography>
        <TextField 
          label="Search by name" 
          value={booksSearch} 
          onChange={e => setBooksSearch(e.target.value)} 
          size="small" 
          sx={{ mb: 2, width: 300 }} 
        />
        
        <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Textbooks Payments</Typography>
        <div className="table-wrapper">
          <Table>
          <TableHead>
            <TableRow>
              <TableCell>Student</TableCell>
              <TableCell>Class</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Deposit</TableCell>
              <TableCell>Balance</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Note</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {renderBookRows('textbook', booksSearch).map((row, index) => (
              <TableRow key={`textbook-${index}`}>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.class}</TableCell>
                <TableCell>{row.amount}</TableCell>
                <TableCell>{row.deposit}</TableCell>
                <TableCell>{row.balance}</TableCell>
                <TableCell>{row.date}</TableCell>
                <TableCell>{row.note}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          </Table>
        </div>
        
        <Typography variant="h6" sx={{ mt: 4, mb: 1 }}>Notebooks Payments</Typography>
        <div className="table-wrapper">
          <Table>
          <TableHead>
            <TableRow>
              <TableCell>Student</TableCell>
              <TableCell>Class</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Deposit</TableCell>
              <TableCell>Balance</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Note</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {renderBookRows('notebook', booksSearch).map((row, index) => (
              <TableRow key={`notebook-${index}`}>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.class}</TableCell>
                <TableCell>{row.amount}</TableCell>
                <TableCell>{row.deposit}</TableCell>
                <TableCell>{row.balance}</TableCell>
                <TableCell>{row.date}</TableCell>
                <TableCell>{row.note}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          </Table>
        </div>
      </Box>
    </LocalizationProvider>
  );
};

export default Books;