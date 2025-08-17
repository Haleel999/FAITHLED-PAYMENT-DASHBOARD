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
}

const Party: React.FC<Props> = ({
  classList, studentsState, partySearch, setPartySearch, partyType, setPartyType,
  classAmounts, studentDeposits, studentDates, handleAmountEdit, handleDepositEdit, handleDateEdit,
  handleCopyPaid, copySuccess
}) => {
  const [editingAmount, setEditingAmount] = React.useState<{class: string | null}>({class: null});
  const [tempAmount, setTempAmount] = React.useState('');

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
            onChange={e => setPartyType(e.target.value)}
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
          {Object.entries(studentsByClass).map(([cls, students]) => (
            <React.Fragment key={cls}>
              <TableRow>
                <TableCell colSpan={6} sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                  {cls}
                  <IconButton 
                    size="small" 
                    sx={{ ml: 2 }}
                    onClick={() => {
                      setEditingAmount({class: cls});
                      setTempAmount(String(classAmounts[cls] || '0'));
                    }}
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
                      />
                      <Button 
                        variant="contained"
                        size="small"
                        onClick={() => {
                          handleAmountEdit(cls, Number(tempAmount));
                          setEditingAmount({class: null});
                        }}
                      >
                        Save
                      </Button>
                      <Button 
                        variant="outlined"
                        size="small"
                        onClick={() => setEditingAmount({class: null})}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
              
              {students.map((student) => {
                const deposit = studentDeposits[student.id] || 0;
                const date = studentDates[student.id] || '';
                const amount = classAmounts[cls] || 0;
                const balance = Math.max(0, amount - deposit);

                return (
                  <TableRow key={student.id}>
                    <TableCell></TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{formatNaira(amount)}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <TextField
                          size="small"
                          value={deposit}
                          onChange={(e) => handleDepositEdit(student.id, e.target.value)}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">₦</InputAdornment>,
                          }}
                          sx={{ width: 120 }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>{formatNaira(balance)}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <TextField
                          size="small"
                          type="date"
                          value={date}
                          onChange={(e) => handleDateEdit(student.id, e.target.value)}
                          InputLabelProps={{ shrink: true }}
                          sx={{ width: 140 }}
                        />
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </React.Fragment>
          ))}
        </TableBody>
        </Table>
      </div>
    </Box>
  );
};

export default Party;