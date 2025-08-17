import React from 'react';
import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';

const classes = [
  { id: 1, name: 'Creche', payment_type: 'monthly' },
  { id: 2, name: 'KG1', payment_type: 'monthly' },
  { id: 3, name: 'KG2', payment_type: 'monthly' },
  { id: 4, name: 'Nursery 1', payment_type: 'monthly' },
  { id: 5, name: 'Nursery 2', payment_type: 'monthly' },
  { id: 6, name: 'Basic 1', payment_type: 'termly' },
  { id: 7, name: 'Basic 2', payment_type: 'termly' },
  { id: 8, name: 'Basic 3', payment_type: 'termly' },
  { id: 9, name: 'Basic 4', payment_type: 'termly' },
  { id: 10, name: 'Basic 5', payment_type: 'termly' }
];

export default function Classes() {
  return (
    <Box className="container">
      <Typography variant="h4" gutterBottom>Classes</Typography>
      <Table size="small" className="table">
        <TableHead>
          <TableRow><TableCell>Name</TableCell><TableCell>Payment Type</TableCell></TableRow>
        </TableHead>
        <TableBody>
          {classes.map(c => (
            <TableRow key={c.id}>
              <TableCell>{c.name}</TableCell>
              <TableCell>{c.payment_type}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}