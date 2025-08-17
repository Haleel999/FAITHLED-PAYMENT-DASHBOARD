import React from 'react';
import { 
  Box, Typography, Button, Dialog, DialogTitle, DialogContent, 
  DialogActions, TextField, IconButton, Table, TableHead, 
  TableRow, TableCell, TableBody, Select, MenuItem 
} from '@mui/material';
import { EditIcon, EyeIcon, DeleteIcon } from './Icons';
import { Student } from '../types';

const CLASS_LIST = ['CRECHE', 'KG 1', 'KG 2', 'NURS 1', 'NURS 2', 'PRY 1', 'PRY 2', 'PRY 3', 'PRY 4', 'PRY 5'];

export default function Students({ students, onAdd, onEdit, onDeleteStudent }: {
  students: Student[];
  onAdd: (payload: any) => void;
  onEdit: (payload: any) => void;
  onDeleteStudent: (id: number) => void;
}) {
  const [classFilter, setClassFilter] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const [editStudent, setEditStudent] = React.useState<Student | null>(null);
  const [viewStudent, setViewStudent] = React.useState<Student | null>(null);
  const [viewOpen, setViewOpen] = React.useState(false);
  const [form, setForm] = React.useState<any>({
    first_name: '', last_name: '', age: '', class: '', 
    parent_name: '', parent_phone: '', parent_email: ''
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState<number | null>(null);
  
  const filtered = (students || []).filter(s => {
    if (classFilter && s.class !== classFilter) return false;
    if (search && !(s.name.toLowerCase().includes(search.toLowerCase()) || 
        s.class.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  });

  const grouped = CLASS_LIST.reduce((acc: any, cls) => { 
    acc[cls] = filtered.filter(s => s.class === cls); 
    return acc; 
  }, {});

  const handleOpen = (s?: Student) => {
    setEditStudent(s || null);
    setForm(s ? {
      first_name: s.first_name, last_name: s.last_name, age: s.age || '',
      class: s.class, parent_name: s.parent_name || '', parent_phone: s.parent_phone || '',
      parent_email: s.parent_email || ''
    } : { 
      first_name: '', last_name: '', age: '', class: '', 
      parent_name: '', parent_phone: '', parent_email: '' 
    });
    setOpen(true);
  };

  const handleSubmit = () => {
    if (editStudent) {
      onEdit({ id: editStudent.id, ...form });
    } else {
      onAdd(form);
    }
    setOpen(false);
  };

  return (
    <Box className="container">
      <Typography variant="h4" gutterBottom>Students</Typography>
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
        <Box sx={{ flex: 1 }} />
        <Button variant="contained" onClick={() => handleOpen()}>Add Student</Button>
      </Box>

      {CLASS_LIST.map(cls => grouped[cls]?.length > 0 && (
        <Box key={cls} sx={{ mb: 3 }}>
          <Typography variant="h6" color="primary" sx={{ mb: 1 }}>{cls}</Typography>
          <div className="table-wrapper">
            <Table size="small" className="table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 120 }}>Actions</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Age</TableCell>
                <TableCell>Parent</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Email</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {grouped[cls].map((s: Student) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <IconButton size="small" color="primary" onClick={() => handleOpen(s)}><EditIcon /></IconButton>
                    <IconButton size="small" color="secondary" onClick={() => { setViewStudent(s); setViewOpen(true); }}><EyeIcon /></IconButton>
                    <IconButton size="small" color="error" onClick={() => setDeleteDialogOpen(s.id)}><DeleteIcon /></IconButton>
                  </TableCell>
                  <TableCell>{s.name}</TableCell>
                  <TableCell>{s.age ?? ''}</TableCell>
                  <TableCell>{s.parent_name ?? ''}</TableCell>
                  <TableCell>{s.parent_phone ?? ''}</TableCell>
                  <TableCell>{s.parent_email ?? ''}</TableCell>
                </TableRow>
              ))}
      <Dialog open={!!deleteDialogOpen} onClose={() => setDeleteDialogOpen(null)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>Are you sure you want to delete this student?</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={() => { if (deleteDialogOpen) { onDeleteStudent(deleteDialogOpen); setDeleteDialogOpen(null); } }}>Delete</Button>
        </DialogActions>
      </Dialog>
            </TableBody>
            </Table>
          </div>
        </Box>
      ))}

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{editStudent ? 'Edit Student' : 'Add Student'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mt: 1 }}>
            <TextField label="First name" value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} />
            <TextField label="Last name" value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} />
            <TextField label="Age" type="number" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} />
            <Select value={form.class} onChange={e => setForm({ ...form, class: e.target.value })} displayEmpty>
              <MenuItem value="">Select Class</MenuItem>
              {CLASS_LIST.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </Select>
            <TextField label="Parent name" value={form.parent_name} onChange={e => setForm({ ...form, parent_name: e.target.value })} />
            <TextField label="Parent phone" value={form.parent_phone} onChange={e => setForm({ ...form, parent_phone: e.target.value })} />
            <TextField label="Parent email" value={form.parent_email} onChange={e => setForm({ ...form, parent_email: e.target.value })} />
          </Box>
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
              <Typography>Age: {viewStudent.age ?? ''}</Typography>
              <Typography>Parent: {viewStudent.parent_name ?? ''}</Typography>
              <Typography>Phone: {viewStudent.parent_phone ?? ''}</Typography>
              <Typography>Email: {viewStudent.parent_email ?? ''}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions><Button onClick={() => setViewOpen(false)}>Close</Button></DialogActions>
      </Dialog>
    </Box>
  );
}