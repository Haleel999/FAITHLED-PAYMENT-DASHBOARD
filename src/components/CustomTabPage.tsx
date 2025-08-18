import React, { useState } from 'react';
import { 
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, Checkbox,
  ListItemText, OutlinedInput, Table, TableHead, TableRow,
  TableCell, TableBody, Paper, IconButton, Box, TextField,
  Typography, Collapse
} from '@mui/material';
import { Student } from '../types';
import { DeleteIcon, EditIcon } from './Icons';

interface CustomTabPageProps {
  tabName: string;
  columns: string[];
  rows: Record<string, any>[];
  allStudents: Student[];
  onAddStudents: (students: Student[]) => void;
  onDeleteTab: (tabName: string) => void;
  onRenameTab: (oldName: string, newName: string) => void;
  onUpdateColumns: (tabName: string, newColumns: string[]) => void;
  onUpdateRow: (tabName: string, rowIndex: number, newRow: Record<string, any>) => void;
  onDeleteRow: (rowIndex: number) => void;
  onCellEdit: (rowIndex: number, columnName: string, newValue: any) => void;
  preset?: string | null;
  onAddRow?: () => void;
}

const CustomTabPage: React.FC<CustomTabPageProps> = ({
  tabName,
  columns = [],
  rows = [],
  allStudents = [],
  onAddStudents,
  onDeleteTab,
  onRenameTab,
  onUpdateColumns,
  onUpdateRow,
  onDeleteRow,
  onCellEdit,
  preset,
  onAddRow
}) => {
  const [openAdd, setOpenAdd] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
  const [editingTabName, setEditingTabName] = useState(false);
  const [newTabName, setNewTabName] = useState(tabName);
  const [editingColumns, setEditingColumns] = useState(false);
  const [newColumns, setNewColumns] = useState(columns.join(', '));
  const [editingRow, setEditingRow] = useState<{ index: number; row: Record<string, any> } | null>(null);
  const [expandedClasses, setExpandedClasses] = useState<Record<string, boolean>>({});
  const [editingColumn, setEditingColumn] = useState<{ index: number; name: string } | null>(null);
  const [editingCell, setEditingCell] = useState<{ rowIndex: number; columnName: string } | null>(null);
  const [cellEditValue, setCellEditValue] = useState('');

  const toggleStudent = (id: number) => {
    setSelectedStudentIds(prev => 
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const handleAddSelected = () => {
    const selectedStudents = allStudents.filter(s => selectedStudentIds.includes(s.id));
    onAddStudents(selectedStudents);
    setSelectedStudentIds([]);
    setOpenAdd(false);
  };

  const [deleteTabDialogOpen, setDeleteTabDialogOpen] = useState(false);
  const [deletingTab, setDeletingTab] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const handleDeleteTab = () => {
    setDeleteTabDialogOpen(true);
  };
  const handleConfirmDeleteTab = async () => {
    setDeletingTab(true);
    setDeleteError(null);
    try {
      console.log('Deleting tab:', tabName);
      await Promise.resolve(onDeleteTab(tabName));
      setDeleteTabDialogOpen(false);
    } catch (e: any) {
      setDeleteError(e?.message || 'Failed to delete tab');
    }
    setDeletingTab(false);
  };
      {/* Delete Tab Dialog always rendered at root */}
      <Dialog open={deleteTabDialogOpen} onClose={() => setDeleteTabDialogOpen(false)}>
        <DialogTitle>Confirm Delete Tab</DialogTitle>
        <DialogContent>
          Are you sure you want to delete the "{tabName}" tab?
          {deleteError && (
            <Typography color="error" sx={{ mt: 2 }}>{deleteError}</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTabDialogOpen(false)} disabled={deletingTab}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleConfirmDeleteTab} disabled={deletingTab}>
            {deletingTab ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

  const handleSaveTabName = () => {
    if (newTabName.trim() && newTabName !== tabName) {
      onRenameTab(tabName, newTabName.trim());
    }
    setEditingTabName(false);
  };

  const handleSaveColumns = () => {
    const columnArray = newColumns.split(',').map(col => col.trim()).filter(Boolean);
    if (columnArray.length > 0) {
      onUpdateColumns(tabName, columnArray);
    }
    setEditingColumns(false);
  };

  const handleEditRow = (index: number) => {
    setEditingRow({ index, row: { ...rows[index] } });
  };

  const handleSaveRow = () => {
    if (editingRow) {
      onUpdateRow(tabName, editingRow.index, editingRow.row);
      setEditingRow(null);
    }
  };

  const toggleClass = (cls: string) => {
    setExpandedClasses(prev => ({
      ...prev,
      [cls]: !prev[cls]
    }));
  };

  const isColumnEditable = (columnName: string) => {
    if (preset === 'payment') {
      return !['Student Name', 'Balance'].includes(columnName);
    }
    return true;
  };

  const isNumericColumn = (columnName: string) => {
    if (preset === 'payment') {
      return ['Amount', 'Deposit', 'Balance'].includes(columnName);
    }
    
    return false;
  };

  const handleEditIconClick = (rowIndex: number, columnName: string) => {
    setEditingCell({ rowIndex, columnName });
    setCellEditValue(rows[rowIndex][columnName] ?? '');
  };

  const handleSaveColumn = () => {
    if (editingColumn) {
      const newColumnArray = [...columns];
      newColumnArray[editingColumn.index] = editingColumn.name;
      onUpdateColumns(tabName, newColumnArray);
      setEditingColumn(null);
    }
  };

  const handleCellSave = () => {
    if (editingCell) {
      onCellEdit(editingCell.rowIndex, editingCell.columnName, cellEditValue);
      setEditingCell(null);
    }
  };

  const handleCellCancel = () => {
    setEditingCell(null);
  };

  return (
  <Paper sx={{ padding: '1rem', margin: '1rem' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        {editingTabName ? (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField
              value={newTabName}
              onChange={(e) => setNewTabName(e.target.value)}
              autoFocus
              sx={{ mr: 1 }}
            />
            <IconButton color="success" onClick={handleSaveTabName}>
              ✓
            </IconButton>
            <IconButton color="error" onClick={() => setEditingTabName(false)}>
              ✕
            </IconButton>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <h2>{tabName}</h2>
            <IconButton 
              size="small" 
              onClick={() => {
                setEditingTabName(true);
                setNewTabName(tabName);
              }}
              sx={{ ml: 1 }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
        
        <IconButton 
          color="error" 
          onClick={handleDeleteTab}
          aria-label="Delete tab"
        >
          <DeleteIcon />
        </IconButton>
      </Box>

      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        {preset === 'payment' ? (
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => setOpenAdd(true)}
          >
            Add Student
          </Button>
        ) : (
          <Button 
            variant="contained" 
            color="primary" 
            onClick={onAddRow}
            disabled={!onAddRow}
          >
            Add Row
          </Button>
        )}
        
        {editingColumns ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
            <TextField
              value={newColumns}
              onChange={(e) => setNewColumns(e.target.value)}
              fullWidth
              label="Columns (comma separated)"
              size="small"
            />
            <IconButton color="success" onClick={handleSaveColumns}>
              ✓
            </IconButton>
            <IconButton color="error" onClick={() => setEditingColumns(false)}>
              ✕
            </IconButton>
          </Box>
        ) : (
          <Button 
            variant="outlined" 
            onClick={() => {
              setEditingColumns(true);
              setNewColumns(columns.join(', '));
            }}
          >
            Edit Columns
          </Button>
        )}
      </Box>

      <Dialog open={openAdd} onClose={() => setOpenAdd(false)} fullWidth>
        <DialogTitle>Add Student to {tabName}</DialogTitle>
        <DialogContent dividers>
          <Typography variant="h6" sx={{ mb: 1 }}>Select Student by Class</Typography>
          
          {Array.from(new Set(allStudents.map(s => s.class))).map(cls => (
            <Box key={cls} sx={{ mb: 1 }}>
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  p: 1,
                  bgcolor: expandedClasses[cls] ? 'lightgray' : 'transparent',
                  cursor: 'pointer'
                }}
                onClick={() => toggleClass(cls)}
              >
                <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>{cls}</Typography>
                <IconButton size="small">
                  {expandedClasses[cls] ? '−' : '+'}
                </IconButton>
              </Box>
              
              <Collapse in={expandedClasses[cls]}>
                <Box sx={{ pl: 2, pt: 1 }}>
                  {allStudents
                    .filter(s => s.class === cls)
                    .map(student => (
                      <MenuItem 
                        key={student.id} 
                        value={student.id}
                        onClick={() => toggleStudent(student.id)}
                        sx={{ pl: 3 }}
                      >
                        <Checkbox checked={selectedStudentIds.includes(student.id)} />
                        <ListItemText primary={student.name} />
                      </MenuItem>
                    ))}
                </Box>
              </Collapse>
            </Box>
          ))}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenAdd(false)}>Cancel</Button>
          <Button 
            onClick={handleAddSelected}
            variant="contained"
            disabled={selectedStudentIds.length === 0}
          >
            Add Selected ({selectedStudentIds.length})
          </Button>
        </DialogActions>
      </Dialog>

      {editingRow && (
        <Dialog open={true} onClose={() => setEditingRow(null)} fullWidth>
          <DialogTitle>Edit Row</DialogTitle>
          <DialogContent dividers>
            {columns.map((col) => (
              col !== 'Student Name' && (
                <TextField
                  key={col}
                  label={col}
                  value={editingRow.row[col] || ''}
                  onChange={(e) => setEditingRow({
                    ...editingRow,
                    row: { ...editingRow.row, [col]: e.target.value }
                  })}
                  fullWidth
                  margin="dense"
                  disabled={!isColumnEditable(col)}
                />
              )
            ))}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditingRow(null)}>Cancel</Button>
            <Button onClick={handleSaveRow} variant="contained" color="primary">
              Save
            </Button>
          </DialogActions>
        </Dialog>
      )}

      <div className="table-wrapper">
        <Table>
        <TableHead>
          <TableRow>
            {columns.map((col, idx) => (
              <TableCell key={idx}>
                {editingColumn?.index === idx ? (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TextField
                      value={editingColumn.name}
                      onChange={(e) => setEditingColumn({ 
                        index: idx, 
                        name: e.target.value 
                      })}
                      autoFocus
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <IconButton 
                      color="success" 
                      size="small" 
                      onClick={handleSaveColumn}
                    >
                      ✓
                    </IconButton>
                    <IconButton 
                      color="error" 
                      size="small" 
                      onClick={() => setEditingColumn(null)}
                    >
                      ✕
                    </IconButton>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {col}
                    <IconButton 
                      size="small" 
                      sx={{ ml: 1 }}
                      onClick={() => setEditingColumn({ index: idx, name: col })}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Box>
                )}
              </TableCell>
            ))}
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, ridx) => (
            <TableRow key={ridx}>
              {columns.map((col, cidx) => (
                <TableCell key={cidx}>
                  {editingCell?.rowIndex === ridx && editingCell?.columnName === col ? (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TextField
                        value={cellEditValue}
                        onChange={(e) => setCellEditValue(e.target.value)}
                        autoFocus
                        fullWidth
                        size="small"
                        type={isNumericColumn(col) ? 'number' : 'text'}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleCellSave();
                          if (e.key === 'Escape') handleCellCancel();
                        }}
                        onBlur={handleCellSave}
                      />
                    </Box>
                  ) : (
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}>
                      <span>
                        {isNumericColumn(col) && typeof row[col] === 'number' 
                          ? row[col].toLocaleString() 
                          : row[col] ?? ''}
                      </span>
                      {isColumnEditable(col) && (
                        <IconButton 
                          size="small"
                          onClick={() => handleEditIconClick(ridx, col)}
                          sx={{ ml: 1 }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  )}
                </TableCell>
              ))}
              <TableCell>
                <IconButton 
                  size="small"
                  onClick={() => handleEditRow(ridx)}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton 
                  size="small"
                  color="error"
                  onClick={() => onDeleteRow(ridx)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        </Table>
      </div>
    </Paper>
  );
};

export default CustomTabPage;