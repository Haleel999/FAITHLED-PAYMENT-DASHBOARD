export type ClassName =
  | 'CRECHE' | 'KG 1' | 'KG 2' | 'NURS 1' | 'NURS 2'
  | 'PRY 1' | 'PRY 2' | 'PRY 3' | 'PRY 4' | 'PRY 5';

export interface Student {
  id: number;
  first_name: string;
  last_name: string;
  name: string;
  age?: number | null;
  class: ClassName;
  parent_name?: string | null;
  parent_phone?: string | null;
  parent_email?: string | null;
  created_at?: string;
}

export interface Payment {
  id: number;
  student_id: number;
  student_name: string;
  class: ClassName;
  amount: number;
  amount_paid: number;
  status: 'paid' | 'partial' | 'unpaid' | 'scholarship';
  payment_date: string | null;
  created_at?: string;
}

export interface Tuition {
  [className: string]: number;
}

export interface ExpenseRow {
  id: number; 
  CATEGORY: string;
  AMOUNT: number;
  NOTE: string;
}

export interface BookRow {
  id: number;
  student_id: number;
  name: string;
  class: ClassName;
  amount: number;
  deposit: number;
  date: string;
  note: string;
  type: 'textbook' | 'notebook';
}

export type TermKey = 'first' | 'second' | 'third';

export interface SessionTerm {
  id: number;
  term: 'Session' | 'First Term' | 'Second Term' | 'Third Term';
  year: string;
  open_date: string | null;
  close_date: string | null;
  holiday_weeks: number;
}

export interface CustomTabDef {
  id?: number;
  name: string;
  preset?: 'payment' | null;
  columns: string[];
  rows: any[];
}

export interface ClassType {
  id: number;
  name: ClassName;
  payment_type?: string;
  teacher_name?: string;
  teacher_phone?: string;
  created_at?: string;
}