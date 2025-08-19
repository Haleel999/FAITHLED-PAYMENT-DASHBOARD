import { supabase } from './utils/supabaseClient';
import {
  Student,
  Payment,
  Tuition,
  ClassName,
  ExpenseRow,
  SessionTerm,
  BookRow,
  CustomTabDef
} from './types';

import { DEFAULT_TUITION } from './mockData';

// Helper to ensure valid timestamps
const safeTimestamp = (timestamp: string | null | undefined): string => {
  return timestamp || new Date().toISOString();
};

/** Get the current user's ID */
async function getUserId() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  return user.id;
}

/** STUDENTS */
export async function fetchStudents(): Promise<Student[]> {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('user_id', userId)
    .order('class', { ascending: true })
    .order('first_name', { ascending: true });

  if (error) throw error;
  return (data || []).map((s: any) => ({
    ...s,
    name: `${s.first_name || ''} ${s.last_name || ''}`.trim(),
    created_at: safeTimestamp(s.created_at)
  }));
}

export async function upsertStudent(payload: Partial<Student>) {
  const userId = await getUserId();
  const { data, error } = await supabase.from('students').upsert({ 
    ...payload, 
    user_id: userId,
    created_at: safeTimestamp(payload.created_at)
  }).select('*').single();
  
  if (error) throw error;
  return { 
    ...data, 
    name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
    created_at: safeTimestamp(data.created_at)
  } as Student;
}

export async function deleteStudent(studentId: number) {
  const userId = await getUserId();
  const { error } = await supabase.from('students').delete().eq('id', studentId).eq('user_id', userId);
  if (error) throw error;
}

/** PAYMENTS */
export async function fetchPayments(): Promise<Payment[]> {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('user_id', userId)
    .order('class', { ascending: true })
    .order('student_name', { ascending: true });

  if (error) throw error;
  return (data || []).map((p: any) => ({
    ...p,
    created_at: safeTimestamp(p.created_at)
  })) as Payment[];
}

export async function upsertPayment(payload: Partial<Payment>): Promise<Payment> {
  const userId = await getUserId();
  const { data, error } = await supabase.from('payments').upsert({ 
    ...payload, 
    user_id: userId,
    created_at: safeTimestamp(payload.created_at)
  }).select('*').single();
  
  if (error) throw error;
  return {
    ...data,
    created_at: safeTimestamp(data.created_at)
  } as Payment;
}

export async function editPayment(p: Partial<Payment> & { id: number }) {
  const userId = await getUserId();
  const status = p.is_scholarship ? 'scholarship' : 
    (p.amount_paid === p.amount) ? 'paid' :
    (p.amount_paid > 0) ? 'partial' : 'unpaid';

  const { data, error } = await supabase.from('payments').update({
    amount: p.amount,
    amount_paid: p.amount_paid,
    status: status,
    payment_date: p.payment_date,
    is_scholarship: p.is_scholarship,
    created_at: safeTimestamp(p.created_at)
  }).eq('id', p.id).eq('user_id', userId).select('*').single();

  if (error) throw error;
  return {
    ...data,
    created_at: safeTimestamp(data.created_at)
  } as Payment;
}

/** TUITION per class */
export async function fetchTuition(): Promise<Tuition> {
  const { data, error } = await supabase.from('tuition').select('*');
  if (error) return DEFAULT_TUITION;
  
  const out: Tuition = { ...DEFAULT_TUITION };
  (data || []).forEach((r: any) => { 
    out[r.class] = Number(r.amount || 0);
  });
  return out;
}

export async function setTuition(cls: ClassName, amount: number) {
  const { error } = await supabase.from('tuition').upsert({ 
    class: cls, 
    amount,
    updated_at: new Date().toISOString()
  });
  if (error) throw error;
}

/** EXPENSES */
export async function fetchExpensesByTerm(termKey: 'first'|'second'|'third'): Promise<ExpenseRow[]> {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('term', termKey)
    .eq('user_id', userId)
    .order('created_at');
  
  if (error) throw error;
  return (data || []).map((r: any) => ({ 
    id: r.id,
    CATEGORY: r.category, 
    AMOUNT: Number(r.amount || 0),
    NOTE: r.note || '',
    created_at: safeTimestamp(r.created_at)
  }));
}

export async function addExpense(termKey: 'first'|'second'|'third', row: Omit<ExpenseRow, 'id'>) {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from('expenses')
    .insert({ 
      term: termKey, 
      category: row.CATEGORY, 
      amount: row.AMOUNT, 
      note: row.NOTE,
      user_id: userId,
      created_at: new Date().toISOString()
    })
    .select()
    .single();
  
  if (error) throw error;
  return { 
    ...row, 
    id: data.id,
    created_at: safeTimestamp(data.created_at)
  } as ExpenseRow;
}

export async function updateExpense(id: number, row: Omit<ExpenseRow, 'id'>) {
  const userId = await getUserId();
  const { error } = await supabase
    .from('expenses')
    .update({ 
      category: row.CATEGORY, 
      amount: row.AMOUNT, 
      note: row.NOTE 
    })
    .eq('id', id)
    .eq('user_id', userId);
  
  if (error) throw error;
}

/** SESSIONS (terms) */
export async function fetchSessions(): Promise<SessionTerm[]> {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('user_id', userId)
    .order('year')
    .order('term');
  
  if (error) return [];
  return (data || []).map((s: any) => ({
    ...s,
    created_at: safeTimestamp(s.created_at),
    open_date: safeTimestamp(s.open_date),
    close_date: safeTimestamp(s.close_date)
  })) as SessionTerm[];
}

/** BOOKS / NOTEBOOKS */
export async function fetchBooks(): Promise<BookRow[]> {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .eq('user_id', userId);
  
  if (error) return [];
  return (data || []).map((r: any) => ({
    id: r.id,
    student_id: r.student_id,
    name: r.student_name,
    class: r.class,
    amount: r.amount,
    deposit: r.deposit,
    date: safeTimestamp(r.date),
    note: r.note,
    type: r.type,
    created_at: safeTimestamp(r.created_at)
  }));
}

export async function upsertBookRow(row: BookRow): Promise<BookRow> {
  const userId = await getUserId();
  const dateValue = row.date || new Date().toISOString().split('T')[0];

  const payload = {
    student_id: row.student_id,
    student_name: row.name,
    class: row.class,
    type: row.type,
    amount: row.amount,
    deposit: row.deposit,
    date: dateValue,
    note: row.note,
    user_id: userId,
    created_at: safeTimestamp(row.created_at)
  };

  if (row.id && row.id > 0) {
    const { data, error } = await supabase
      .from('books')
      .update(payload)
      .eq('id', row.id)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return {
      ...data,
      date: safeTimestamp(data.date),
      created_at: safeTimestamp(data.created_at)
    } as BookRow;
  } else {
    const { data, error } = await supabase
      .from('books')
      .insert(payload)
      .select()
      .single();
    
    if (error) throw error;
    return {
      ...data,
      date: safeTimestamp(data.date),
      created_at: safeTimestamp(data.created_at)
    } as BookRow;
  }
}

/** PARTY */
export async function fetchParty(eventType: string) {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from('party')
    .select('*')
    .eq('event_type', eventType)
    .eq('user_id', userId);
    
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
  const userId = await getUserId();
  const paymentDate = obj.date || null;
  
  const { error } = await supabase.from('party').upsert({
    student_id: obj.student_id,
    student_name: obj.student_name,
    class: obj.class,
    event_type: obj.event_type,
    amount: obj.amount,
    deposit: obj.deposit,
    payment_date: paymentDate,
    user_id: userId,
    created_at: new Date().toISOString()
  }, {
    onConflict: 'student_id, event_type'
  });
  
  if (error) throw error;
}

/** PARTY CLASS AMOUNTS */
export async function fetchPartyClassAmounts(eventType: string): Promise<Record<string, number>> {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from('party_class_amounts')
    .select('class, amount')
    .eq('event_type', eventType)
    .eq('user_id', userId);
  
  if (error) return {};
  
  const amounts: Record<string, number> = {};
  (data || []).forEach(row => {
    amounts[row.class] = Number(row.amount || 0);
  });
  return amounts;
}

export async function upsertPartyClassAmount(cls: string, eventType: string, amount: number) {
  const userId = await getUserId();
  const { error } = await supabase.from('party_class_amounts').upsert(
    { 
      class: cls, 
      event_type: eventType, 
      amount, 
      user_id: userId 
    },
    { onConflict: 'user_id,class,event_type' }
  );
  if (error) throw error;
}

/** CUSTOM TABS */
export async function fetchCustomTabs(): Promise<CustomTabDef[]> {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from('custom_tabs')
    .select('*')
    .eq('user_id', userId)
    .order('id');
  
  if (error) return [];
  return data as CustomTabDef[];
}

export async function insertCustomTab(tab: Omit<CustomTabDef, 'id'>): Promise<CustomTabDef> {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from('custom_tabs')
    .insert({ 
      ...tab, 
      user_id: userId,
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return data as CustomTabDef;
}

export async function updateCustomTab(tab: CustomTabDef): Promise<CustomTabDef> {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from('custom_tabs')
    .update(tab)
    .eq('id', tab.id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data as CustomTabDef;
}

export async function saveCustomTabs(tabs: CustomTabDef[]): Promise<CustomTabDef[]> {
  const newTabs = tabs.filter(t => !t.id);
  const existingTabs = tabs.filter(t => t.id);

  const insertedTabs = await Promise.all(
    newTabs.map(tab => insertCustomTab(tab))
  );

  const updatedTabs = await Promise.all(
    existingTabs.map(tab => updateCustomTab(tab))
  );

  return [...insertedTabs, ...updatedTabs];
}

export async function deleteCustomTab(tabName: string) {
  const userId = await getUserId();
  const { error } = await supabase
    .from('custom_tabs')
    .delete()
    .eq('name', tabName)
    .eq('user_id', userId);
  
  if (error) throw error;
}

/** Update a session term */
export async function updateSession(payload: SessionTerm) {
  const userId = await getUserId();
  const { error } = await supabase
    .from('sessions')
    .update({
      term: payload.term,
      year: payload.year,
      open_date: payload.open_date || null,
      close_date: payload.close_date || null,
      holiday_weeks: payload.holiday_weeks || 0,
      created_at: safeTimestamp(payload.created_at)
    })
    .eq('id', payload.id)
    .eq('user_id', userId);

  if (error) throw error;
}

/** Insert a new session term */
export async function insertSession(payload: Omit<SessionTerm, 'id'>): Promise<SessionTerm> {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from('sessions')
    .insert({
      term: payload.term,
      year: payload.year,
      open_date: payload.open_date || null,
      close_date: payload.close_date || null,
      holiday_weeks: payload.holiday_weeks || 0,
      user_id: userId,
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return {
    ...data,
    created_at: safeTimestamp(data.created_at)
  } as SessionTerm;
}

/** Reset payments for non-scholarship students */
export async function resetPayments() {
  const userId = await getUserId();
  const { error } = await supabase
    .from('payments')
    .update({ 
      amount_paid: 0,
      payment_date: null
    })
    .eq('is_scholarship', false)
    .eq('user_id', userId);

  if (error) throw error;
}