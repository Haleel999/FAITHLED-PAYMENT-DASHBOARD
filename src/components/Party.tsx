import React from 'react';
import { 
  Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, 
  TextField, Button, IconButton, FormControl, InputLabel, 
  Select, MenuItem, InputAdornment
} from '@mui/material';
import { EditIcon } from './Icons';
import { formatNaira } from '../utils/format';

interface Props {
  classList: string[];
  studentsState: any[];
  partySearch: string;
  setPartySearch: (v: string) => void;
  partyType: string;
  setPartyType: (v: string) => void;
  classAmounts: Record<string, number>;
  studentDeposits: Record<number, number>;
  studentDates: Record<number, string>;
  handleAmountEdit: (cls: string, value: any) => void;
  handleDepositEdit: (id: number, value: any) => void;
  handleDateEdit: (id: number, value: any) => void;
  handleCopyPaid: () => void;
  copySuccess: boolean;
  refreshPartyData: (eventType: string) => void;
}

const Party: React.FC<Props> = ({
  classList, studentsState, partySearch, setPartySearch, partyType, setPartyType,
  classAmounts, studentDeposits, studentDates, handleAmountEdit, handleDepositEdit, handleDateEdit,
  handleCopyPaid, copySuccess, refreshPartyData
}) => {
  const [editingAmount, setEditingAmount] = React.useState<{class: string | null}>({class: null});
  const [tempAmount, setTempAmount] = React.useState('');
  const [editingDeposit, setEditingDeposit] = React.useState<{id: number | null, value: string}>({id: null, value: ''});
  const [editingDate, setEditingDate] = React.useState<{id: number | null, value: string}>({id: null, value: ''});

  React.useEffect(() => {
    setEditingAmount({class: null});
  }, [partyType]);

  // Handle event type change
  const handleEventTypeChange = (event: any) => {
    const newEventType = event.target.value;
    setPartyType(newEventType);
    refreshPartyData(newEventType); // Call the refresh function
  };

  // Filter and group students by class
  const studentsByClass = classList.reduce((acc, cls) => {
    const classStudents = studentsState
      .filter(s => s.class === cls)
      .filter(s => s.name.toLowerCase().includes(partySearch.toLowerCase()));
    
    if (classStudents.length > 0) {
      acc[cls] = classStudents;
    }
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <Box className="container">
      <Typography variant="h4" gutterBottom>School Party Payments</Typography>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <TextField 
          label="Search by name" 
          value={partySearch} 
          onChange={e => setPartySearch(e.target.value)} 
          size="small" 
          sx={{ width: 300 }} 
        />
        
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Event Type</InputLabel>
          <Select
            value={partyType}
            onChange={handleEventTypeChange}
            label="Event Type"
          >
            <MenuItem value="End of Year Party">End of Year Party</MenuItem>
            <MenuItem value="Christmas Party">Christmas Party</MenuItem>
            <MenuItem value="Easter Party">Easter Party</MenuItem>
          </Select>
        </FormControl>
        
        <Button variant="contained" onClick={handleCopyPaid}>
          {copySuccess ? 'Copied!' : 'Copy Paid List'}
        </Button>
      </Box>
      
      <div className="table-wrapper">
        <Table>
        <TableHead>
          <TableRow>
            <TableCell>Class</TableCell>
            <TableCell>Student</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Deposit</TableCell>
            <TableCell>Balance</TableCell>
            <TableCell>Payment Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.entries(studentsByClass).map(([cls, students]) => {
            // Get amount for this class, default to 0 if not set
            const amount = classAmounts[cls] || 0;
            
            return (
              <React.Fragment key={cls}>
                <TableRow>
                  <TableCell colSpan={6} sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                    {cls}
                    <IconButton 
                      size="small" 
                      sx={{ ml: 2 }}
                      onClick={() => {
                        setEditingAmount({class: cls});
                        setTempAmount(String(amount));
                      }}
                      disabled={editingAmount.class !== null && editingAmount.class !== cls}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
                {editingAmount.class === cls && (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1 }}>
                        <TextField
                          label="Amount for Class"
                          size="small"
                          value={tempAmount}
                          onChange={(e) => setTempAmount(e.target.value)}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">₦</InputAdornment>,
                          }}
                          autoFocus
                          sx={{ width: 200 }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleAmountEdit(cls, Number(tempAmount));
                              setEditingAmount({class: null});
                            }
                            if (e.key === 'Escape') setEditingAmount({class: null});
                          }}
                        />
                        <IconButton color="success" size="small" onClick={() => { handleAmountEdit(cls, Number(tempAmount)); setEditingAmount({class: null}); }} aria-label="Save">✓</IconButton>
                        <IconButton color="inherit" size="small" onClick={() => setEditingAmount({class: null})} aria-label="Cancel">✕</IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
                {students.map((student) => {
                  const deposit = studentDeposits[student.id] || 0;
                  const date = studentDates[student.id] || '';
                  const balance = Math.max(0, amount - deposit);

                  return (
                    <TableRow key={student.id}>
                      <TableCell></TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>{formatNaira(amount)}</TableCell>
                      <TableCell>
                        {editingDeposit.id === student.id ? (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <TextField
                              size="small"
                              value={editingDeposit.value}
                              onChange={(e) => setEditingDeposit({id: student.id, value: e.target.value})}
                              InputProps={{
                                startAdornment: <InputAdornment position="start">₦</InputAdornment>,
                              }}
                              autoFocus
                              sx={{ width: 120 }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleDepositEdit(student.id, editingDeposit.value);
                                  setEditingDeposit({id: null, value: ''});
                                }
                                if (e.key === 'Escape') setEditingDeposit({id: null, value: ''});
                              }}
                            />
                            <IconButton color="success" size="small" onClick={() => { handleDepositEdit(student.id, editingDeposit.value); setEditingDeposit({id: null, value: ''}); }} aria-label="Save">✓</IconButton>
                            <IconButton color="inherit" size="small" onClick={() => setEditingDeposit({id: null, value: ''})} aria-label="Cancel">✕</IconButton>
                          </Box>
                        ) : (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <span>{formatNaira(deposit)}</span>
                            <IconButton size="small" color="primary" sx={{ ml: 1 }} onClick={() => setEditingDeposit({id: student.id, value: String(deposit)})} aria-label="Edit" disabled={editingDeposit.id !== null && editingDeposit.id !== student.id}> <EditIcon fontSize="small" /> </IconButton>
                          </Box>
                        )}
                      </TableCell>
                      <TableCell>{formatNaira(balance)}</TableCell>
                      <TableCell>
                        {editingDate.id === student.id ? (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <TextField
                              size="small"
                              type="date"
                              value={editingDate.value}
                              onChange={(e) => setEditingDate({id: student.id, value: e.target.value})}
                              InputLabelProps={{ shrink: true }}
                              autoFocus
                              sx={{ width: 140 }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleDateEdit(student.id, editingDate.value);
                                  setEditingDate({id: null, value: ''});
                                }
                                if (e.key === 'Escape') setEditingDate({id: null, value: ''});
                              }}
                            />
                            <IconButton color="success" size="small" onClick={() => { handleDateEdit(student.id, editingDate.value); setEditingDate({id: null, value: ''}); }} aria-label="Save">✓</IconButton>
                            <IconButton color="inherit" size="small" onClick={() => setEditingDate({id: null, value: ''})} aria-label="Cancel">✕</IconButton>
                          </Box>
                        ) : (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <span>{date}</span>
                            <IconButton size="small" color="primary" sx={{ ml: 1 }} onClick={() => setEditingDate({id: student.id, value: date})} aria-label="Edit" disabled={editingDate.id !== null && editingDate.id !== student.id}> <EditIcon fontSize="small" /> </IconButton>
                          </Box>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </React.Fragment>
            );
          })}
        </TableBody>
        </Table>
      </div>
    </Box>
  );
};

export default Party;