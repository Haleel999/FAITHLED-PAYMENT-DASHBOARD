import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme, CssBaseline, Snackbar, Alert, Box } from '@mui/material';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';
import Students from './components/Students';
import Payments from './components/Payments';
import Debtors from './components/Debtors';
import Expenses from './components/Expenses';
import Books from './components/Books';
import SchoolParty from './components/Party';
import CustomTabPage from './components/CustomTabPage';
import ErrorBoundary from './components/ErrorBoundary';
import CustomTabDialog from './components/CustomTabDialog';
import { 
  fetchStudents, upsertStudent, deleteStudent, fetchPayments, 
  editPayment, fetchTuition, setTuition, fetchExpensesByTerm, 
  addExpense, updateExpense, fetchSessions, fetchBooks, 
  upsertBookRow, fetchParty, upsertPartyRow, fetchCustomTabs, 
  saveCustomTabs, upsertPayment, deleteCustomTab,
  fetchPartyClassAmounts, upsertPartyClassAmount,
  resetPayments, updateSession, insertSession
} from './data';
import { Student, Payment, Tuition, ExpenseRow, CustomTabDef, ClassName, BookRow, SessionTerm } from './types';
import { CLASS_LIST, DEFAULT_TUITION } from './mockData';
import { formatNaira } from './utils/format';

// Define light and dark themes
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#0057b8' },
    secondary: { main: '#ffd000' },
    background: { default: '#f7f9fc' }
  },
  shape: { borderRadius: 12 }
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#4d9eff' },
    secondary: { main: '#ffdf40' },
    background: { default: '#121212' }
  },
  shape: { borderRadius: 12 }
});

export default function App() {
  // Expense delete handler
  const onExpenseDelete = async (term: 'first' | 'second' | 'third', id: number) => {
    try {
      // Remove from backend
      await updateExpense(id, { deleted: true }); // Or use a deleteExpense API if available
      // Remove from state
      setExpensesTabRows(prev => {
        const copy = { ...prev };
        copy[term] = copy[term].filter(r => r.id !== id);
        return copy;
      });
      setToast({ open: true, msg: 'Expense deleted', severity: 'success' });
    } catch (e: any) {
      setToast({ open: true, msg: e.message, severity: 'error' });
    }
  };
  const [darkMode, setDarkMode] = React.useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });
  
  // Set theme on initial load
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', newMode ? 'dark' : 'light');
  };

  const [nav, setNav] = React.useState('Dashboard');
  const navs = ['Dashboard', 'Students', 'Payments', 'Debtors', 'Books', 'Party', 'Expenses'];
  
  const [students, setStudents] = React.useState<Student[]>([]);
  const [payments, setPayments] = React.useState<Payment[]>([]);
  const [tuition, setTuitionState] = React.useState<Tuition>(DEFAULT_TUITION);
  const [sessions, setSessions] = React.useState<SessionTerm[]>([]);
  const [booksRows, setBooksRows] = React.useState<BookRow[]>([]);
  const [customTabs, setCustomTabs] = React.useState<CustomTabDef[]>([]);
  const [toast, setToast] = React.useState<{ open: boolean, msg: string, severity: 'success' | 'error' | 'info' }>({ open: false, msg: '', severity: 'success' });
  const [openCustomTabDialog, setOpenCustomTabDialog] = React.useState(false);

  // Books inline edit helpers
  const [booksSearch, setBooksSearch] = React.useState('');
  const [editingRow, setEditingRow] = React.useState<BookRow | null>(null);
  const [editingField, setEditingField] = React.useState<string | null>(null);
  const [editBookRow, setEditBookRow] = React.useState<Partial<BookRow>>({});

  // Expenses state
  const [expensesTabRows, setExpensesTabRows] = React.useState<{ first: ExpenseRow[]; second: ExpenseRow[]; third: ExpenseRow[] }>({ first: [], second: [], third: [] });
  const [editingExpenseCell, setEditingExpenseCell] = React.useState<{ term: string; id: number; field: string } | null>(null);
  const [editExpenseRow, setEditExpenseRow] = React.useState<Partial<ExpenseRow>>({});
  const [addExpenseDialog, setAddExpenseDialog] = React.useState<{ open: boolean; term: string | null }>({ open: false, term: null });
  const [newExpense, setNewExpense] = React.useState<{ CATEGORY: string; AMOUNT: string; NOTE: string }>({ CATEGORY: '', AMOUNT: '', NOTE: '' });

  // Custom tabs edit
  const [editingCustomCell, setEditingCustomCell] = React.useState<{ tab: string; idx: number; field: string } | null>(null);
  const [editCustomRow, setEditCustomRow] = React.useState<any>({});
  const [editingTabAmount, setEditingTabAmount] = React.useState<{ tab: string; value: string } | null>(null);

  // Party state
  const [partySearch, setPartySearch] = React.useState('');
  const [partyType, setPartyType] = React.useState('End of Year Party');
  const [classAmounts, setClassAmounts] = React.useState<Record<string, number>>({});
  const [studentDeposits, setStudentDeposits] = React.useState<Record<number, number>>({});
  const [studentDates, setStudentDates] = React.useState<Record<number, string>>({});
  const [copySuccess, setCopySuccess] = React.useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [stu, pay, tui, sess, books, tabs] = await Promise.all([
        fetchStudents(),
        fetchPayments(),
        fetchTuition(),
        fetchSessions(),
        fetchBooks(),
        fetchCustomTabs()
      ]);
      
      setStudents(stu);
      setPayments(pay);
      setTuitionState(tui);
      setSessions(sess || []);
      setBooksRows(books);
      setCustomTabs(tabs);

      const [f, s, t] = await Promise.all([
        fetchExpensesByTerm('first'),
        fetchExpensesByTerm('second'),
        fetchExpensesByTerm('third')
      ]);
      setExpensesTabRows({ first: f, second: s, third: t });
      
      // Load party data
      const amounts = await fetchPartyClassAmounts(partyType);
      setClassAmounts(amounts);
      
      const partyData = await fetchParty(partyType);
      const deposits: Record<number, number> = {};
      const dates: Record<number, string> = {};
      
      partyData.forEach(row => {
        deposits[row.student_id] = row.deposit;
        dates[row.student_id] = row.payment_date || '';
      });
      
      setStudentDeposits(deposits);
      setStudentDates(dates);
    } catch (e: any) {
      setToast({ open: true, msg: e.message || 'Load failed', severity: 'error' });
    }
  };

  /** derived: debtors per class */
  const debtors = React.useMemo(() => {
    const byClass: Record<string, { name: string, debt: number }[]> = {};
    CLASS_LIST.forEach(cls => byClass[cls] = []);
    payments.forEach(p => {
      const bal = Math.max(0, (p.amount || 0) - (p.amount_paid || 0));
      if (p.status !== 'paid' && bal > 0) {
        byClass[p.class].push({ name: p.student_name, debt: bal });
      }
    });
    return byClass;
  }, [payments]);

  /** Students CRUD */
  const handleAddStudent = async (payload: any) => {
    try {
      const saved = await upsertStudent(payload);
      const updatedStudents = [...students, saved].sort((a, b) => a.name.localeCompare(b.name));
      setStudents(updatedStudents);
      
      // Create initial payment
      const initialPayment = {
        student_id: saved.id,
        student_name: saved.name,
        class: saved.class as ClassName,
        amount: tuition[saved.class as keyof Tuition] || 0,
        amount_paid: 0,
        status: 'unpaid',
        payment_date: null
      };
      
      const savedPayment = await upsertPayment(initialPayment);
      setPayments(prev => [...prev, savedPayment]);
      
      setToast({ open: true, msg: 'Student saved', severity: 'success' });
    } catch (e: any) { 
      setToast({ open: true, msg: e.message, severity: 'error' }); 
    }
  };

  const handleEditStudent = async (payload: any) => {
    try {
      const saved = await upsertStudent(payload);
      setStudents(prev => prev.map(s => s.id === saved.id ? saved : s));
      setToast({ open: true, msg: 'Student updated', severity: 'success' });
    } catch (e: any) { 
      setToast({ open: true, msg: e.message, severity: 'error' }); 
    }
  };
  
  const handleDeleteStudent = async (id: number) => {
    try {
      await deleteStudent(id);
      setStudents(prev => prev.filter(s => s.id !== id));
      setPayments(prev => prev.filter(p => p.student_id !== id));
      setBooksRows(prev => prev.filter(b => b.student_id !== id));
      setToast({ open: true, msg: 'Student deleted', severity: 'success' });
    } catch (e: any) { 
      setToast({ open: true, msg: e.message, severity: 'error' }); 
    }
  };

  /** Payments edit */
  const handleEditPayment = async (payload: Partial<Payment> & { id: number }) => {
    try {
      const updated = await editPayment(payload);
      setPayments(prev => prev.map(p => p.id === updated.id ? updated : p));
      setToast({ open: true, msg: 'Payment updated', severity: 'success' });
    } catch (e: any) { 
      setToast({ open: true, msg: e.message, severity: 'error' }); 
    }
  };

  /** Tuition */
const onEditTuition = async (cls: ClassName, amount: number) => {
  try {
    await setTuition(cls, amount);
    setTuitionState(prev => ({ ...prev, [cls]: amount }));
    
    // Update all payment records for this class
    const updatedPayments = await Promise.all(
      payments.map(async (p) => {
        if (p.class === cls) {
          return await editPayment({
            ...p,
            amount: amount,
            status: p.is_scholarship ? 'scholarship' : 
                   (p.amount_paid === amount) ? 'paid' :
                   (p.amount_paid > 0) ? 'partial' : 'unpaid'
          });
        }
        return p;
      })
    );
    
    setPayments(updatedPayments);
    setToast({ open: true, msg: 'Tuition updated', severity: 'success' });
  } catch (e: any) { 
    setToast({ open: true, msg: e.message, severity: 'error' }); 
  }
};

  /** Expenses */
  const onExpenseEdit = (term: string, id: number, field: string) => {
    setEditingExpenseCell({ term, id, field });
    const row = (expensesTabRows as any)[term].find((r: ExpenseRow) => r.id === id);
    setEditExpenseRow({ ...row });
  };
  
  const onExpenseChange = (field: string, value: string) => 
    setEditExpenseRow(prev => ({ ...prev, [field]: value }));
  
  const onExpenseSave = async (term: 'first' | 'second' | 'third') => {
    try {
      if (!editExpenseRow.id) return;
      const numberAmount = Number(editExpenseRow.AMOUNT || 0);
      await updateExpense(editExpenseRow.id, { 
        CATEGORY: editExpenseRow.CATEGORY || '', 
        AMOUNT: numberAmount,
        NOTE: editExpenseRow.NOTE || ''
      });
      
      setExpensesTabRows(prev => {
        const copy = { ...prev };
        copy[term] = copy[term].map(r => 
          r.id === editExpenseRow.id 
            ? { ...r, CATEGORY: editExpenseRow.CATEGORY || '', AMOUNT: numberAmount, NOTE: editExpenseRow.NOTE || '' } 
            : r
        );
        return copy;
      });
      
      setEditingExpenseCell(null);
      setToast({ open: true, msg: 'Expense updated', severity: 'success' });
    } catch (e: any) { 
      setToast({ open: true, msg: e.message, severity: 'error' }); 
    }
  };
  
  const onExpenseCancel = () => { setEditingExpenseCell(null); };
  const onOpenAddExpense = (term: 'first' | 'second' | 'third') => setAddExpenseDialog({ open: true, term });
  const onNewExpenseChange = (field: 'CATEGORY' | 'AMOUNT' | 'NOTE', value: string) => 
    setNewExpense(prev => ({ ...prev, [field]: value }));
  
  const onAddExpenseSubmit = async () => {
    const term = addExpenseDialog.term as 'first' | 'second' | 'third';
    try {
      const expenseData = { CATEGORY: newExpense.CATEGORY, AMOUNT: Number(newExpense.AMOUNT), NOTE: newExpense.NOTE };
      const saved = await addExpense(term, expenseData);
      
      setExpensesTabRows(prev => ({
        ...prev,
        [term]: [...prev[term], saved]
      }));
      
      setAddExpenseDialog({ open: false, term: null });
      setNewExpense({ CATEGORY: '', AMOUNT: '', NOTE: '' });
      setToast({ open: true, msg: 'Expense added', severity: 'success' });
    } catch (e: any) { 
      setToast({ open: true, msg: e.message, severity: 'error' }); 
    }
  };
  
  const onCloseAddExpense = () => setAddExpenseDialog({ open: false, term: null });

  /** Books inline */
  const onBookEdit = (row: BookRow, field: string, type: string) => {
    setEditingRow(row);
    setEditingField(field);
    setEditBookRow({ ...row });
  };
  
  const onBookChange = (field: string, value: any) => 
    setEditBookRow(prev => ({ ...prev, [field]: value }));
  
  const onBookSave = async () => {
    try {
      if (!editingRow || !editBookRow) return;
      
      // Get student from our state instead of name matching
      const student = students.find(s => s.id === editingRow.student_id);
      
      if (!student) {
        throw new Error("Student not found");
      }

      const payload = {
        ...editBookRow,
        student_id: student.id,
        student_name: student.name,
        class: student.class,
        type: editingRow.type
      } as BookRow;
      
      // Upsert book record
      const saved = await upsertBookRow(payload);
      
      // Update state
      setBooksRows(prev => {
        const existingIndex = prev.findIndex(b => 
          b.student_id === saved.student_id && b.type === saved.type
        );
        
        if (existingIndex > -1) {
          const newRows = [...prev];
          newRows[existingIndex] = saved;
          return newRows;
        } else {
          return [...prev, saved];
        }
      });
      
      setToast({ open: true, msg: 'Saved', severity: 'success' });
    } catch (e: any) { 
      setToast({ open: true, msg: e.message, severity: 'error' }); 
    } finally {
      setEditingRow(null);
      setEditingField(null);
    }
  };
  
  const onBookCancel = () => {
    setEditingRow(null);
    setEditingField(null);
  };

  /** Party handlers */
  const handleAmountEdit = async (cls: string, value: any) => {
    const amount = Number(value || 0);
    setClassAmounts(prev => ({ ...prev, [cls]: amount }));
    
    // Save to database
    await upsertPartyClassAmount(cls, partyType, amount);
    
    // Update all students in this class
    const classStudents = students.filter(s => s.class === cls);
    for (const student of classStudents) {
      const deposit = studentDeposits[student.id] || 0;
      const date = studentDates[student.id] || '';
      
      await upsertPartyRow({
        student_id: student.id,
        student_name: student.name,
        class: cls,
        amount: amount,
        deposit: deposit,
        date: date,
        event_type: partyType
      });
    }
  };

  const handleDepositEdit = async (id: number, value: any) => {
    const deposit = Number(value || 0);
    setStudentDeposits(prev => ({ ...prev, [id]: deposit }));
    
    const stu = students.find(s => s.id === id);
    if (!stu) return;
    
    // Set current date if not explicitly set
    let paymentDate = studentDates[id] || '';
    if (deposit > 0 && !paymentDate) {
      paymentDate = new Date().toISOString().split('T')[0];
      setStudentDates(prev => ({ ...prev, [id]: paymentDate }));
    }
    
    await upsertPartyRow({
      student_id: id,
      student_name: stu.name,
      class: stu.class,
      amount: classAmounts[stu.class] || 0,
      deposit: deposit,
      date: paymentDate,
      event_type: partyType
    });
  };

  const handleDateEdit = async (id: number, value: any) => {
    setStudentDates(prev => ({ ...prev, [id]: value }));
    
    const stu = students.find(s => s.id === id);
    if (!stu) return;
    
    await upsertPartyRow({
      student_id: id,
      student_name: stu.name,
      class: stu.class,
      amount: classAmounts[stu.class] || 0,
      deposit: studentDeposits[id] || 0,
      date: value,
      event_type: partyType
    });
  };

  const handleCopyPaid = async () => {
    const lines: string[] = [];
    CLASS_LIST.forEach(cls => {
      const list = students.filter(s => s.class === cls).filter(s => (studentDeposits[s.id] || 0) > 0);
      if (list.length) {
        lines.push(`${cls.toUpperCase()}`);
        lines.push(...list.map(s => `${s.name} — ${formatNaira(studentDeposits[s.id])}`));
        lines.push('');
      }
    });
    await navigator.clipboard.writeText(lines.join('\n'));
    setCopySuccess(true); 
    setTimeout(() => setCopySuccess(false), 1500);
  };

  /** Custom tabs persistence */
  const handleCustomEdit = (tab: string, idx: number, field: string) => {
    setEditingCustomCell({ tab, idx, field });
    const t = customTabs.find(x => x.name === tab)!;
    setEditCustomRow({ ...t.rows[idx] });
  };
  
  const handleCustomChange = (field: string, value: string) => 
    setEditCustomRow(prev => ({ ...prev, [field]: value }));
  
  const handleCustomSave = async (tab: string, idx: number, field: string) => {
    const copy = customTabs.map(t => {
      if (t.name !== tab) return t;
      const r = [...t.rows]; 
      r[idx] = { ...r[idx], [field]: editCustomRow[field] };
      return { ...t, rows: r };
    });
    
    setCustomTabs(copy); 
    await saveCustomTabs(copy);
    setEditingCustomCell(null);
    setToast({ open: true, msg: 'Tab updated', severity: 'success' });
  };
  
  const handleCustomCancel = () => setEditingCustomCell(null);
  const handleEditTabAmount = (tabName: string, value: string) => 
    setEditingTabAmount({ tab: tabName, value });
  
  const handleSaveTabAmount = async (tabName: string) => {
    const copy = customTabs.map(t => {
      if (t.name !== tabName) return t;
      const r = t.rows.map(row => ({ ...row, Amount: editingTabAmount?.value || row.Amount }));
      return { ...t, rows: r };
    });
    
    setCustomTabs(copy); 
    await saveCustomTabs(copy);
    setEditingTabAmount(null);
    setToast({ open: true, msg: 'Amount updated for tab', severity: 'success' });
  };
  
  const handleCancelTabAmount = () => setEditingTabAmount(null);

  const handleCreateCustomTab = async (tabData: { name: string; preset?: string | null; columns: string[] }) => {
    const t: CustomTabDef = {
      name: tabData.name,
      preset: tabData.preset || null,
      columns: tabData.columns,
      rows: []
    };
    
    try {
      const savedTabs = await saveCustomTabs([...customTabs, t]);
      setCustomTabs(savedTabs);
      setNav(tabData.name);
      setOpenCustomTabDialog(false);
      setToast({ open: true, msg: 'Tab created', severity: 'success' });
    } catch (e: any) {
      setToast({ open: true, msg: e.message || 'Failed to create tab', severity: 'error' });
    }
  };

  const handleAddStudentsToCustomTab = (students: Student[]) => {
    const currentTab = customTabs.find(tab => tab.name === nav);
    if (!currentTab) return;

    const newRows = students.map(student => {
      let newRow: Record<string, any> = { 'Student Name': student.name };
      
      // Use the preset of the current tab to determine the row structure
      if (currentTab.preset === 'payment') {
        newRow = {
          ...newRow,
          'Amount': tuition[student.class as keyof Tuition] || 0,
          'Deposit': 0,
          'Balance': tuition[student.class as keyof Tuition] || 0,
          'DatePaid': '',
          'Note': ''
        };
      } else {
        // For non-preset, initialize all other columns to empty strings
        currentTab.columns.forEach(col => {
          if (col !== 'Student Name') {
            newRow[col] = '';
          }
        });
      }
      return newRow;
    });

    const updatedTabs = customTabs.map(tab =>
      tab.name === nav ? { ...tab, rows: [...tab.rows, ...newRows] } : tab
    );

    setCustomTabs(updatedTabs);
    saveCustomTabs(updatedTabs);
    setToast({ open: true, msg: `${students.length} students added to tab`, severity: 'success' });
  };

  const handleDeleteCustomTab = async (tabName: string) => {
    try {
      await deleteCustomTab(tabName);
      setCustomTabs(prev => prev.filter(t => t.name !== tabName));
      if (nav === tabName) setNav('Dashboard');
      setToast({ open: true, msg: 'Tab deleted', severity: 'success' });
    } catch (e: any) {
      setToast({ open: true, msg: e.message, severity: 'error' });
    }
  };

  const handleRenameTab = (oldName: string, newName: string) => {
    const updatedTabs = customTabs.map(tab => 
      tab.name === oldName ? { ...tab, name: newName } : tab
    );
    
    setCustomTabs(updatedTabs);
    saveCustomTabs(updatedTabs);
    
    if (nav === oldName) {
      setNav(newName);
    }
    
    setToast({ open: true, msg: 'Tab renamed', severity: 'success' });
  };

  const handleUpdateColumns = (tabName: string, newColumns: string[]) => {
    const updatedTabs = customTabs.map(tab => 
      tab.name === tabName ? { ...tab, columns: newColumns } : tab
    );
    
    setCustomTabs(updatedTabs);
    saveCustomTabs(updatedTabs);
  };

  const handleUpdateRow = (tabName: string, rowIndex: number, newRow: any) => {
    const updatedTabs = customTabs.map(tab => {
      if (tab.name === tabName) {
        const newRows = [...tab.rows];
        newRows[rowIndex] = newRow;
        
        // If it's a payment preset, recalculate the balance
        if (tab.preset === 'payment') {
          const amount = Number(newRow['Amount'] || 0);
          const deposit = Number(newRow['Deposit'] || 0);
          newRow['Balance'] = Math.max(0, amount - deposit);
        }
        
        return { ...tab, rows: newRows };
      }
      return tab;
    });
    
    setCustomTabs(updatedTabs);
    saveCustomTabs(updatedTabs);
  };
  
  const handleDeleteRowFromCustomTab = (rowIndex: number) => {
    const updatedTabs = customTabs.map(tab => {
      if (tab.name === nav) {
        const newRows = [...tab.rows];
        newRows.splice(rowIndex, 1);
        return { ...tab, rows: newRows };
      }
      return tab;
    });
    
    setCustomTabs(updatedTabs);
    saveCustomTabs(updatedTabs);
    setToast({ open: true, msg: 'Student removed from tab', severity: 'success' });
  };

  const handleCellEdit = (rowIndex: number, columnName: string, newValue: any) => {
    const tabName = nav;
    const tab = customTabs.find(t => t.name === tabName);
    if (!tab) return;

    const updatedTabs = customTabs.map(t => {
      if (t.name !== tabName) return t;
      const newRows = [...t.rows];
      const currentRow = newRows[rowIndex];
      
      let finalValue = newValue;

      // Convert to number only for payment preset numeric columns
      if (tab.preset === 'payment' && ['Amount', 'Deposit', 'Balance'].includes(columnName)) {
        finalValue = newValue === '' ? 0 : Number(newValue);
      }

      newRows[rowIndex] = { ...currentRow, [columnName]: finalValue };
      
      // Recalculate balance if it's a payment preset
      if (tab.preset === 'payment') {
        if (columnName === 'Amount' || columnName === 'Deposit') {
          const amount = Number(newRows[rowIndex]['Amount'] || 0);
          const deposit = Number(newRows[rowIndex]['Deposit'] || 0);
          newRows[rowIndex]['Balance'] = Math.max(0, amount - deposit);
        }
      }
      
      return { ...t, rows: newRows };
    });
    
    setCustomTabs(updatedTabs);
    saveCustomTabs(updatedTabs);
  };

  const handleAddNewRowToCustomTab = (tabName: string) => {
    const tab = customTabs.find(t => t.name === tabName);
    if (!tab) return;

    // Create an empty row with all columns set to empty string
    const newRow: Record<string, any> = {};
    tab.columns.forEach(col => {
      newRow[col] = '';
    });

    const updatedTabs = customTabs.map(t => {
      if (t.name === tabName) {
        return { ...t, rows: [...t.rows, newRow] };
      }
      return t;
    });

    setCustomTabs(updatedTabs);
    saveCustomTabs(updatedTabs);
    setToast({ open: true, msg: 'New row added', severity: 'success' });
  };

  const onUpdateSession = async (session: SessionTerm) => {
    try {
      const payload: SessionTerm = {
        ...session,
        year: session.year || '',
        open_date: session.open_date || null,
        close_date: session.close_date || null,
        holiday_weeks: session.holiday_weeks || 0
      };

      if (session.id === undefined || session.id === null) {
        const created = await insertSession(payload);
        setSessions(prev => [...prev, created]);
      } else {
        await updateSession(payload);
        setSessions(prev => prev.map(s => s.id === session.id ? payload : s));
      }
      setToast({ open: true, msg: 'Saved successfully', severity: 'success' });
    } catch (e: any) { 
      setToast({ open: true, msg: e.message, severity: 'error' }); 
    }
  };

  const onResetPayments = async () => {
    try {
      await resetPayments();
      const pay = await fetchPayments();
      setPayments(pay);
      setToast({ open: true, msg: 'Payments reset', severity: 'success' });
    } catch (e: any) {
      setToast({ open: true, msg: e.message, severity: 'error' });
    }
  };

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <ErrorBoundary>
        <>
          <NavBar
            navs={[...navs, ...customTabs.map(t => t.name)]}
            currentNav={nav}
            onNavigate={setNav}
            onAddTab={() => setOpenCustomTabDialog(true)}
            toggleTheme={toggleTheme}
            darkMode={darkMode}
          />

          {nav === 'Dashboard' && (
            <Dashboard
              students={students}
              payments={payments}
              debtors={debtors}
              terms={sessions}
              tuition={tuition}
              onEditTuition={onEditTuition}
              onUpdateSession={onUpdateSession}
            />
          )}

          {nav === 'Payments' && (
            <Payments
              payments={payments}
              tuition={tuition}
              debtors={debtors}
              onEdit={handleEditPayment}
              students={students}
              onDeleteStudent={handleDeleteStudent}
              onResetPayments={onResetPayments}
            />
          )}

          {nav === 'Students' && (
            <Students
              students={students}
              payments={payments}
              onAdd={handleAddStudent}
              onEdit={handleEditStudent}
              onDeleteStudent={handleDeleteStudent}
            />
          )}

          {nav === 'Debtors' && <Debtors debtors={debtors} />}

          {nav === 'Books' && (
            <Books
              classList={CLASS_LIST as any}
              studentsState={students}
              booksState={booksRows}
              booksSearch={booksSearch}
              setBooksSearch={setBooksSearch}
              editingRow={editingRow}
              editingField={editingField}
              editBookRow={editBookRow}
              onBookEdit={onBookEdit}
              onBookChange={onBookChange}
              onBookSave={onBookSave}
              onBookCancel={onBookCancel}
            />
          )}

          {nav === 'Party' && (
            <SchoolParty
              classList={CLASS_LIST as any}
              studentsState={students}
              partySearch={partySearch}
              setPartySearch={setPartySearch}
              partyType={partyType}
              setPartyType={setPartyType}
              classAmounts={classAmounts}
              studentDeposits={studentDeposits}
              studentDates={studentDates}
              handleAmountEdit={handleAmountEdit}
              handleDepositEdit={handleDepositEdit}
              handleDateEdit={handleDateEdit}
              handleCopyPaid={handleCopyPaid}
              copySuccess={copySuccess}
            />
          )}

          {nav === 'Expenses' && (
            <Expenses
              expensesTabRows={expensesTabRows}
              editingExpenseCell={editingExpenseCell}
              editExpenseRow={editExpenseRow}
              onExpenseEdit={onExpenseEdit}
              onExpenseChange={onExpenseChange}
              onExpenseSave={onExpenseSave}
              onExpenseCancel={onExpenseCancel}
              addExpenseDialog={addExpenseDialog}
              newExpense={newExpense}
              onOpenAddExpense={onOpenAddExpense}
              onCloseAddExpense={onCloseAddExpense}
              onAddExpenseSubmit={onAddExpenseSubmit}
              onNewExpenseChange={onNewExpenseChange}
              onExpenseDelete={onExpenseDelete}
            />
          )}

          {customTabs.some(t => t.name === nav) && 
            (() => {
              const tab = customTabs.find(t => t.name === nav);
              return tab ? (
                <CustomTabPage
                  tabName={nav}
                  columns={tab.columns || []}
                  rows={tab.rows || []}
                  allStudents={students}
                  onAddStudents={handleAddStudentsToCustomTab}
                  onDeleteTab={handleDeleteCustomTab}
                  onRenameTab={handleRenameTab}
                  onUpdateColumns={handleUpdateColumns}
                  onUpdateRow={handleUpdateRow}
                  onDeleteRow={(rowIndex) => handleDeleteRowFromCustomTab(rowIndex)}
                  onCellEdit={handleCellEdit}
                  preset={tab.preset}
                  onAddRow={tab.preset !== 'payment' ? () => handleAddNewRowToCustomTab(nav) : undefined}
                />
              ) : null;
            })()
          }

          <Snackbar open={toast.open} autoHideDuration={2200} onClose={() => setToast(prev => ({ ...prev, open: false }))}>
            <Alert severity={toast.severity} variant="filled">{toast.msg}</Alert>
          </Snackbar>

          <CustomTabDialog
            open={openCustomTabDialog}
            onClose={() => setOpenCustomTabDialog(false)}
            onCreateTab={handleCreateCustomTab}
            students={students}
            classes={CLASS_LIST}
          />
        </>
        
      </ErrorBoundary>
        <Footer />
    </ThemeProvider>
  );
}