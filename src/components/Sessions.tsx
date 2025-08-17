import React from 'react';
import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import { SessionTerm } from '../types';

export default function Sessions({ sessions }: { sessions: SessionTerm[] }) {
  return (
    <Box className="container">
      <Typography variant="h4" gutterBottom>Academic Sessions</Typography>
      <Table size="small" className="table">
        <TableHead>
          <TableRow>
            <TableCell>Term</TableCell>
            <TableCell>Year</TableCell>
            <TableCell>Open</TableCell>
            <TableCell>Close</TableCell>
            <TableCell>Holiday Weeks</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sessions.map(s => (
            <TableRow key={s.id}>
              <TableCell>{s.term}</TableCell>
              <TableCell>{s.year}</TableCell>
              <TableCell>{s.open_date}</TableCell>
              <TableCell>{s.close_date}</TableCell>
              <TableCell>{s.holiday_weeks}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}