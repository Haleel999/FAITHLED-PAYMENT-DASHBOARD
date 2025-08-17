import { createClient } from '@supabase/supabase-js';
import { 
  Student, Payment, ExpenseRow, SessionTerm, BookRow, 
  CustomTabDef, Tuition, ClassName 
} from './types';
import { DEFAULT_TUITION } from './mockData';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

/** STUDENTS */
export async function fetchStudents(): Promise<Student[]> {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .order('class', { ascending: true })
    .order('first_name', { ascending: true });

  if (error) throw error;
  return (data || []).map((s: any) => ({
    ...s,
    name: `${s.first_name || ''} ${s.last_name || ''}`.trim()
  }));
}

export async function upsertStudent(payload: Partial<Student>) {
  const { data, error } = await supabase.from('students').upsert(payload).select('*').single();
  if (error) throw error;
  return { 
    ...data, 
    name: `${data.first_name || ''} ${data.last_name || ''}`.trim() 
  } as Student;
}

export async function deleteStudent(studentId: number) {
  const { error } = await supabase.from('students').delete().eq('id', studentId);
  if (error) throw error;
}

/** PAYMENTS */
export async function fetchPayments(): Promise<Payment[]> {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .order('class', { ascending: true })
    .order('student_name', { ascending: true });

  if (error) throw error;
  return data as Payment[];
}

export async function upsertPayment(payload: Partial<Payment>): Promise<Payment> {
  const { data, error } = await supabase.from('payments').upsert(payload).select('*').single();
  if (error) throw error;
  return data as Payment;
}

export async function editPayment(p: Partial<Payment> & { id: number }) {
  const status = p.is_scholarship ? 'scholarship' : 
    (p.amount_paid === p.amount) ? 'paid' :
    (p.amount_paid > 0) ? 'partial' : 'unpaid';

  const { data, error } = await supabase.from('payments').update({
    amount: p.amount,
    amount_paid: p.amount_paid,
    status: status,
    payment_date: p.payment_date,
    is_scholarship: p.is_scholarship
  }).eq('id', p.id).select('*').single();

  if (error) throw error;
  return data as Payment;
}

/** TUITION per class */
export async function fetchTuition(): Promise<Tuition> {
  const { data, error } = await supabase.from('tuition').select('*');
  if (error) return DEFAULT_TUITION;
  
  const out: Tuition = { ...DEFAULT_TUITION };
  (data || []).forEach((r: any) => { out[r.class] = Number(r.amount || 0); });
  return out;
}

export async function setTuition(cls: ClassName, amount: number) {
  const { error } = await supabase.from('tuition').upsert({ class: cls, amount });
  if (error) throw error;
}

/** EXPENSES */
export async function fetchExpensesByTerm(termKey: 'first'|'second'|'third'): Promise<ExpenseRow[]> {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('term', termKey)
    .order('created_at');
  
  if (error) throw error;
  return (data || []).map((r: any) => ({ 
    id: r.id,
    CATEGORY: r.category, 
    AMOUNT: Number(r.amount || 0),
    NOTE: r.note || ''
  }));
}

export async function addExpense(termKey: 'first'|'second'|'third', row: Omit<ExpenseRow, 'id'>) {
  const { data, error } = await supabase
    .from('expenses')
    .insert({ term: termKey, category: row.CATEGORY, amount: row.AMOUNT, note: row.NOTE })
    .select()
    .single();
  
  if (error) throw error;
  return { ...row, id: data.id } as ExpenseRow;
}

export async function updateExpense(id: number, row: Omit<ExpenseRow, 'id'>) {
  const { error } = await supabase
    .from('expenses')
    .update({ category: row.CATEGORY, amount: row.AMOUNT, note: row.NOTE })
    .eq('id', id);
  
  if (error) throw error;
}

/** SESSIONS (terms) */
export async function fetchSessions(): Promise<SessionTerm[]> {
  const { data, error } = await supabase.from('sessions').select('*').order('year').order('term');
  if (error) return [];
  return data as SessionTerm[];
}

/** BOOKS / NOTEBOOKS */
export async function fetchBooks(): Promise<BookRow[]> {
  const { data, error } = await supabase.from('books').select('*');
  if (error) return [];
  return (data || []).map((r: any) => ({
    id: r.id,
    student_id: r.student_id,
    name: r.student_name,
    class: r.class,
    amount: r.amount,
    deposit: r.deposit,
    date: r.date,
    note: r.note,
    type: r.type
  }));
}

export async function upsertBookRow(row: BookRow): Promise<BookRow> {
  // Convert empty date string to current date
  const dateValue = row.date || new Date().toISOString().split('T')[0];

  const payload = {
    student_id: row.student_id,
    student_name: row.name,
    class: row.class,
    type: row.type,
    amount: row.amount,
    deposit: row.deposit,
    date: dateValue,
    note: row.note
  };

  if (row.id && row.id > 0) {
    // Update existing book
    const { data, error } = await supabase
      .from('books')
      .update(payload)
      .eq('id', row.id)
      .select()
      .single();
    
    if (error) throw error;
    return data as BookRow;
  } else {
    // Create new book
    const { data, error } = await supabase
      .from('books')
      .insert(payload)
      .select()
      .single();
    
    if (error) throw error;
    return data as BookRow;
  }
}

/** PARTY */
export async function fetchParty(eventType: string) {
  const { data, error } = await supabase
    .from('party')
    .select('*')
    .eq('event_type', eventType);
    
  if (error) return [];
  return data;
}

export async function upsertPartyRow(obj: { 
  student_id: number, 
  student_name: string,
  class: string, 
  amount: number, 
  deposit: number, 
  date: string, 
  event_type: string 
}) {
  // Convert empty date string to null
  const paymentDate = obj.date || null;
  
  const { error } = await supabase.from('party').upsert({
    student_id: obj.student_id,
    student_name: obj.student_name,
    class: obj.class,
    event_type: obj.event_type,
    amount: obj.amount,
    deposit: obj.deposit,
    payment_date: paymentDate
  }, {
    onConflict: 'student_id, event_type'
  });
  
  if (error) throw error;
}

/** PARTY CLASS AMOUNTS */
export async function fetchPartyClassAmounts(eventType: string): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from('party_class_amounts')
    .select('class, amount')
    .eq('event_type', eventType);
  
  if (error) return {};
  
  const amounts: Record<string, number> = {};
  (data || []).forEach(row => {
    amounts[row.class] = Number(row.amount || 0);
  });
  return amounts;
}

export async function upsertPartyClassAmount(cls: string, eventType: string, amount: number) {
  const { error } = await supabase.from('party_class_amounts').upsert(
    { class: cls, event_type: eventType, amount },
    { onConflict: 'class,event_type' }
  );
  if (error) throw error;
}

/** CUSTOM TABS */
export async function fetchCustomTabs(): Promise<CustomTabDef[]> {
  const { data, error } = await supabase.from('custom_tabs').select('*').order('id');
  if (error) return [];
  return data as CustomTabDef[];
}

export async function insertCustomTab(tab: Omit<CustomTabDef, 'id'>): Promise<CustomTabDef> {
  const { data, error } = await supabase
    .from('custom_tabs')
    .insert(tab)
    .select()
    .single();

  if (error) throw error;
  return data as CustomTabDef;
}

export async function updateCustomTab(tab: CustomTabDef): Promise<CustomTabDef> {
  const { data, error } = await supabase
    .from('custom_tabs')
    .update(tab)
    .eq('id', tab.id)
    .select()
    .single();

  if (error) throw error;
  return data as CustomTabDef;
}

export async function saveCustomTabs(tabs: CustomTabDef[]): Promise<CustomTabDef[]> {
  // Separate new tabs (without id) from existing tabs
  const newTabs = tabs.filter(t => !t.id);
  const existingTabs = tabs.filter(t => t.id);

  // Insert new tabs
  const insertedTabs = await Promise.all(
    newTabs.map(tab => insertCustomTab(tab))
  );

  // Update existing tabs
  const updatedTabs = await Promise.all(
    existingTabs.map(tab => updateCustomTab(tab))
  );

  return [...insertedTabs, ...updatedTabs];
}

export async function deleteCustomTab(tabName: string) {
  const { error } = await supabase.from('custom_tabs').delete().eq('name', tabName);
  if (error) throw error;
}

/** Update a session term */
export async function updateSession(payload: SessionTerm) {
  const { error } = await supabase
    .from('sessions')
    .update({
      term: payload.term,
      year: payload.year,
      open_date: payload.open_date || null,
      close_date: payload.close_date || null,
      holiday_weeks: payload.holiday_weeks || 0
    })
    .eq('id', payload.id);

  if (error) throw error;
}

/** Insert a new session term */
export async function insertSession(payload: Omit<SessionTerm, 'id'>): Promise<SessionTerm> {
  const { data, error } = await supabase
    .from('sessions')
    .insert({
      term: payload.term,
      year: payload.year,
      open_date: payload.open_date || null,
      close_date: payload.close_date || null,
      holiday_weeks: payload.holiday_weeks || 0
    })
    .select()
    .single();

  if (error) throw error;
  return data as SessionTerm;
}

/** Reset payments for non-scholarship students */
export async function resetPayments() {
  const { error } = await supabase
    .from('payments')
    .update({ 
      amount_paid: 0,
      payment_date: null
    })
    .eq('is_scholarship', false);

  if (error) throw error;
}