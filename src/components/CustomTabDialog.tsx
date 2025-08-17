import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Button
} from '@mui/material';
import { ClassName, Student } from '../types';

interface CustomTabDialogProps {
  open: boolean;
  onClose: () => void;
  onCreateTab: (tabData: {
    name: string;
    preset?: string | null;
    columns: string[];
  }) => void;
  students: Student[];
  classes: ClassName[];
}

const presets = {
  payment: ['Student Name', 'Amount', 'Deposit', 'Balance', 'DatePaid', 'Note']
};

const CustomTabDialog: React.FC<CustomTabDialogProps> = ({ 
  open, 
  onClose, 
  onCreateTab,
  classes 
}) => {
  const [tabName, setTabName] = useState('');
  const [preset, setPreset] = useState<string | ''>('');
  const [customColumns, setCustomColumns] = useState('');

  const handleClose = () => {
    onClose();
    setTabName('');
    setPreset('');
    setCustomColumns('');
  };

  const handleCreate = () => {
    let columns: string[] = [];
    
    if (preset && presets[preset as keyof typeof presets]) {
      columns = [...presets[preset as keyof typeof presets]];
    } else {
      columns = customColumns.split(',').map(col => col.trim()).filter(Boolean);
    }

    if (columns.length === 0) {
      alert('Please provide columns for the tab.');
      return;
    }

    onCreateTab({
      name: tabName,
      preset: preset || null,
      columns
    });

    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth>
      <DialogTitle>Create New Custom Tab</DialogTitle>
      <DialogContent dividers>
        <TextField
          label="Tab Name"
          value={tabName}
          onChange={(e) => setTabName(e.target.value)}
          fullWidth
          margin="normal"
          required
        />

        <FormControl fullWidth margin="normal">
          <InputLabel>Preset</InputLabel>
          <Select
            value={preset}
            onChange={(e) => setPreset(e.target.value)}
            label="Preset"
          >
            <MenuItem value="">None</MenuItem>
            <MenuItem value="payment">Payment Template</MenuItem>
          </Select>
        </FormControl>

        {!preset && (
          <TextField
            label="Custom Columns (comma separated)"
            value={customColumns}
            onChange={(e) => setCustomColumns(e.target.value)}
            fullWidth
            margin="normal"
            required
            placeholder="Column 1, Column 2, Column 3"
          />
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleCreate}
          variant="contained"
          color="primary"
          disabled={!tabName.trim() || (!preset && !customColumns.trim())}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomTabDialog;