import React from 'react'; 
import { 
  Box, Typography, Card, IconButton, InputAdornment, TextField,
  Button, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Select, useTheme, useMediaQuery
} from '@mui/material'; 
import { Tuition, SessionTerm } from '../types'; 
import { formatNaira } from '../utils/format'; 
import { EditIcon } from './Icons'; 

const CLASS_LIST = ['CRECHE', 'KG 1', 'KG 2', 'NURS 1', 'NURS 2', 'PRY 1', 'PRY 2', 'PRY 3', 'PRY 4', 'PRY 5']; 

export default function Dashboard({
  students, payments, debtors, terms, tuition, onEditTuition, onUpdateSession
}: any) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [editing, setEditing] = React.useState<string | null>(null);
  const [value, setValue] = React.useState<string>('');
  const [editSessionOpen, setEditSessionOpen] = React.useState(false);
  const [editTermOpen, setEditTermOpen] = React.useState(false);
  const [editSession, setEditSession] = React.useState<SessionTerm | null>(null);
  const [editTerm, setEditTerm] = React.useState<SessionTerm | null>(null);
  
  // Find session and term
  const sessionObj = terms?.find((t: SessionTerm) => t.term === 'Session');
  const termObj = terms?.find((t: SessionTerm) => t.term !== 'Session');

  // Display values
  const sessionYear = sessionObj?.year || 'Not set';
  const termName = termObj?.term || 'Not set';

  const scholarshipCount = (payments || []).filter((p: any) => p.is_scholarship || p.status === 'scholarship').length;

  const handleOpenEditSession = () => {
    setEditSession(sessionObj || { 
      id: undefined as any, 
      term: 'Session', 
      year: '', 
      open_date: null, 
      close_date: null,
      holiday_weeks: 0
    });
    setEditSessionOpen(true);
  };

  const handleOpenEditTerm = () => {
    setEditTerm(termObj || { 
      id: undefined as any, 
      term: 'First Term', 
      year: '', 
      open_date: null, 
      close_date: null,
      holiday_weeks: 0
    });
    setEditTermOpen(true);
  };

  const handleSaveSession = () => {
    if (editSession) {
      onUpdateSession(editSession);
      setEditSessionOpen(false);
    }
  };

  const handleSaveTerm = () => {
    if (editTerm) {
      onUpdateSession(editTerm);
      setEditTermOpen(false);
    }
  };

  return (
    <Box className="container">
      <Typography variant="h4" className="section-title" sx={{ mb: 2 }}>Dashboard Overview</Typography>
      <Box sx={{ 
        display: 'flex', 
        gap: 2, 
        flexWrap: 'wrap', 
        mb: 3, 
        alignItems: 'center',
        '& > *': {
          flex: isMobile ? '1 1 calc(50% - 16px)' : '0 1 auto',
          minWidth: isMobile ? 'unset' : 220,
        }
      }}>
        <Card className="card" sx={{ p: 2 }}>Total Students: {(students || []).length}</Card>
        <Card className="card" sx={{ p: 2 }}>Total Debtors: {
          Object.values(debtors || {}).reduce((a: any, arr: any) => a + (arr as any[]).length, 0)
        }</Card>
        <Card className="card" sx={{ p: 2 }}>Scholarship Students: {scholarshipCount}</Card>
        <Card className="card" sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            {termName}, {sessionYear} Session
          </Typography>
        </Card>
      </Box>
      
      <Typography variant="h6" sx={{ mb: 1 }}>Students Per Class</Typography>
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: 2,
        '& > *': {
          flex: isMobile ? '1 1 calc(50% - 16px)' : '0 1 auto',
          minWidth: isMobile ? 'unset' : 240,
        }
      }}>
        {CLASS_LIST.map(cls => {
          const count = (students || []).filter((s: any) => s.class === cls).length;
          return (
            <Box key={cls} className="card" sx={{ p: 2 }}>
              <Typography variant="subtitle1" color="primary" fontWeight={700}>{cls}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                <span>Count:</span><b>{count}</b>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                <span>Tuition:</span>
                {editing === cls ? (
                  <TextField size="small" value={value}
                    onChange={e => setValue(e.target.value.replace(/\D/g, ''))}
                    sx={{ width: 100 }}
                    InputProps={{ startAdornment: <InputAdornment position="start">₦</InputAdornment> }}
                    autoFocus
                    onBlur={() => { if (value) onEditTuition(cls, Number(value)); setEditing(null); }}
                    onKeyDown={e => { if (e.key === 'Enter') { if (value) onEditTuition(cls, Number(value)); setEditing(null); } }}
                  />
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', fontWeight: 700 }}>
                    {formatNaira((tuition as Tuition)?.[cls] ?? 0)}
                    <IconButton size="small" sx={{ ml: 0.5 }} onClick={() => { setEditing(cls); setValue(String((tuition as Tuition)?.[cls] ?? 0)); }}>
                      <EditIcon />
                    </IconButton>
                  </span>
                )}
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                <span>Debtors:</span><b>{(debtors?.[cls] || []).length}</b>
              </Box>
            </Box>
          );
        })}
      </Box>
      
      <Box sx={{ 
        mt: 5, 
        display: 'flex', 
        gap: 3, 
        flexWrap: 'wrap', 
        justifyContent: 'center',
        '& > *': {
          flex: isMobile ? '1 1 100%' : '1 1 calc(50% - 24px)',
          minWidth: isMobile ? 'unset' : 280,
        }
      }}>
        <Card className="card" sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6">Academic Session</Typography>
            <IconButton size="small" onClick={handleOpenEditSession}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Box>
          <Typography>{sessionYear}</Typography>
          <Box>
            <Typography variant="body2">Open: {sessionObj?.open_date || 'Not set'}</Typography>
            <Typography variant="body2">Close: {sessionObj?.close_date || 'Not set'}</Typography>
          </Box>
        </Card>

        <Card className="card" sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6">Current Term</Typography>
            <IconButton size="small" onClick={handleOpenEditTerm}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Box>
          <Typography>{termName}</Typography>
          <Box>
            <Typography variant="body2">Open: {termObj?.open_date || 'Not set'}</Typography>
            <Typography variant="body2">Close: {termObj?.close_date || 'Not set'}</Typography>
          </Box>
        </Card>
      </Box>
      
      {/* Edit Session Dialog */}
      <Dialog open={editSessionOpen} onClose={() => setEditSessionOpen(false)}>
        <DialogTitle>Edit Academic Session</DialogTitle>
        <DialogContent>
          {editSession && (
            <>
              <TextField
                fullWidth
                margin="dense"
                label="Session Year"
                value={editSession.year || ''}
                onChange={e => setEditSession({ ...editSession, year: e.target.value })}
                placeholder="e.g., 2025/2026"
              />
              <TextField
                fullWidth
                margin="dense"
                label="Open Date"
                type="date"
                value={editSession.open_date || ''}
                onChange={e => setEditSession({ ...editSession, open_date: e.target.value || null })}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                margin="dense"
                label="Close Date"
                type="date"
                value={editSession.close_date || ''}
                onChange={e => setEditSession({ ...editSession, close_date: e.target.value || null })}
                InputLabelProps={{ shrink: true }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditSessionOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveSession}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Term Dialog */}
      <Dialog open={editTermOpen} onClose={() => setEditTermOpen(false)}>
        <DialogTitle>Edit Term</DialogTitle>
        <DialogContent>
          {editTerm && (
            <>
              <Select
                fullWidth
                margin="dense"
                value={editTerm.term || 'First Term'}
                onChange={e => setEditTerm({ ...editTerm, term: e.target.value })}
                sx={{ mb: 2 }}
              >
                <MenuItem value="First Term">First Term</MenuItem>
                <MenuItem value="Second Term">Second Term</MenuItem>
                <MenuItem value="Third Term">Third Term</MenuItem>
              </Select>
              <TextField
                fullWidth
                margin="dense"
                label="Open Date"
                type="date"
                value={editTerm.open_date || ''}
                onChange={e => setEditTerm({ ...editTerm, open_date: e.target.value || null })}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                margin="dense"
                label="Close Date"
                type="date"
                value={editTerm.close_date || ''}
                onChange={e => setEditTerm({ ...editTerm, close_date: e.target.value || null })}
                InputLabelProps={{ shrink: true }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditTermOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveTerm}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}